// Whole-Home Custom consultation requests — mirrors /api/consultation's
// anti-abuse stack (honeypot, min fill time, rate limit, Turnstile, heuristic
// spam score) and its Resend email pattern (lib/orderEmails.ts).

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'
import { escapeHtml } from '@/lib/html'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { verifyTurnstile } from '@/lib/turnstile'
import { scoreSpam } from '@/lib/spamCheck'

let _resend: Resend | null = null
function getResend() { return _resend ??= new Resend(process.env.RESEND_API_KEY) }

const FROM     = () => process.env.EMAIL_FROM || 'Angel Drapery <onboarding@resend.dev>'
const ADMIN_TO = () => process.env.NOTIFICATION_EMAIL || 'admin@angel-drapery.com'

// Decoy success response for silently-dropped bot submissions. Returns the SAME
// shape a real submission gets so a bot cannot tell it was rejected and adapt.
function decoyResponse() {
  return NextResponse.json({ success: true, emailSent: true })
}

// Allowlists — anything outside these is dropped to '' rather than rejected,
// so a stale client never hard-fails a real customer.
const ROOM_VALUES    = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+']
const WINDOW_VALUES  = ['1–3', '4–6', '7–10', '11–15', '16–20', '20+']
const PRODUCT_VALUES = ['Custom Drapery', 'Roman Shades', 'Roller Shades', 'Drapery Hardware/Track', 'Motorized']
const BUDGET_VALUES  = ['<$2k', '$2-5k', '$5-10k', '$10k+', 'not sure']
const CONTACT_VALUES = ['phone', 'text', 'email']

// Create table on first access
async function ensureTable() {
  await query(`CREATE TABLE IF NOT EXISTS whole_home_requests (
    id serial PRIMARY KEY,
    name varchar(256) NOT NULL,
    email varchar(256) NOT NULL,
    phone varchar(32) NOT NULL,
    address text,
    rooms varchar(16),
    windows varchar(16),
    products text,
    budget varchar(32),
    contact_method varchar(16),
    message text,
    status varchar(32) DEFAULT 'new',
    created_at timestamptz DEFAULT now()
  )`)
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)

    // Frontend sends: name, email, phone, address, rooms, windows, products[],
    // budget, contactMethod, message, plus the anti-bot fields company
    // (honeypot), elapsedMs (fill time) and turnstileToken.
    const body = await request.json() as any

    // ── P0: honeypot ─────────────────────────────────────────────────────────
    if (typeof body.company === 'string' && body.company.trim() !== '') {
      console.warn('[whole-home] honeypot tripped — dropping submission')
      return decoyResponse()
    }

    // ── P0: minimum fill time ────────────────────────────────────────────────
    const elapsedMs = Number(body.elapsedMs)
    if (Number.isFinite(elapsedMs) && elapsedMs < 3000) {
      console.warn(`[whole-home] too-fast submit (${elapsedMs}ms) — dropping`)
      return decoyResponse()
    }

    // ── P2: rate limit (3 per hour per IP, same as consultation) ─────────────
    const limit = await rateLimit('whole-home', ip, { max: 3, windowSeconds: 3600 })
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    await ensureTable()

    const { name, phone, email } = body

    // Validate required fields
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!phone || !String(phone).trim()) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const cleanName  = String(name).trim().slice(0, 256)
    const cleanPhone = String(phone).trim().slice(0, 32)
    const cleanEmail = String(email).trim().slice(0, 256)
    const address    = String(body.address || '').trim().slice(0, 512)
    const message    = String(body.message || '').trim().slice(0, 5000)

    // Optional structured fields — validated against allowlists, dropped if unknown
    const rooms   = ROOM_VALUES.includes(body.rooms) ? body.rooms : ''
    const windows = WINDOW_VALUES.includes(body.windows) ? body.windows : ''
    const budget  = BUDGET_VALUES.includes(body.budget) ? body.budget : ''
    const contactMethod = CONTACT_VALUES.includes(body.contactMethod) ? body.contactMethod : ''
    const products: string[] = Array.isArray(body.products)
      ? body.products.filter((p: any) => PRODUCT_VALUES.includes(p))
      : []

    // ── P1: Cloudflare Turnstile ─────────────────────────────────────────────
    // Verify the human-challenge token before touching the DB or sending mail.
    // Skips automatically when TURNSTILE_SECRET_KEY is unset (dev/preview).
    const turnstile = await verifyTurnstile(body.turnstileToken, ip)
    if (!turnstile.ok) {
      console.warn('[whole-home] Turnstile verification failed:', turnstile.error)
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 403 }
      )
    }

    // ── P2: heuristic spam score (auxiliary, conservative) ───────────────────
    const verdict = scoreSpam({ name: cleanName, phone: cleanPhone, email: cleanEmail, message })
    if (verdict.spam) {
      console.warn(`[whole-home] heuristic spam drop (score=${verdict.score}): ${verdict.reasons.join(', ')}`)
      return decoyResponse()
    }

    // Save to database
    await query(
      `INSERT INTO whole_home_requests
         (name, email, phone, address, rooms, windows, products, budget, contact_method, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [cleanName, cleanEmail, cleanPhone, address || null, rooms || null, windows || null,
       products.length ? products.join(', ') : null, budget || null, contactMethod || null, message || null]
    )

    // Escaped copies for HTML interpolation
    const esName  = escapeHtml(cleanName)
    const esPhone = escapeHtml(cleanPhone)
    const esEmail = escapeHtml(cleanEmail)

    const row = (label: string, valueHtml: string) => `
      <tr>
        <td style="padding: 10px 0; color: #999; font-size: 13px; width: 130px; vertical-align: top;">${label}</td>
        <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;">${valueHtml}</td>
      </tr>`

    const optRow = (label: string, value: string) => value ? row(label, escapeHtml(value)) : ''

    const contactLabel =
      contactMethod === 'phone' ? 'Phone Call' :
      contactMethod === 'text'  ? 'Text Message' :
      contactMethod === 'email' ? 'Email' : ''

    const messageRow = message
      ? `<tr>
           <td style="padding: 10px 0; color: #999; font-size: 13px; width: 130px; vertical-align: top;">Message</td>
           <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; white-space: pre-line;">${escapeHtml(message)}</td>
         </tr>`
      : ''

    // Send notification email to the merchant.
    // IMPORTANT: resend.emails.send() returns { data, error } — it does NOT throw
    // on API-level failures. Inspect `error` explicitly (see /api/consultation).
    let emailSent = false
    let emailError: string | null = null
    try {
      const { data, error } = await getResend().emails.send({
        from: FROM(),
        to: ADMIN_TO(),
        subject: `🏠 Whole-Home Consultation Request — ${cleanName}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="font-size: 20px; font-weight: 300; color: #1a1a1a; margin-bottom: 24px;">🏠 Whole-Home Consultation Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${row('Name', esName)}
              ${row('Phone', esPhone)}
              ${row('Email', `<a href="mailto:${esEmail}" style="color: #1a1a1a;">${esEmail}</a>`)}
              ${optRow('Project Address', address)}
              ${optRow('Rooms', rooms)}
              ${optRow('Windows', windows)}
              ${optRow('Interested Products', products.join(', '))}
              ${optRow('Budget', budget)}
              ${optRow('Preferred Contact', contactLabel)}
              ${messageRow}
            </table>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">This request was submitted through the Whole-Home Custom page on the Angel Drapery website.</p>
          </div>
        `,
      })
      if (error) {
        emailError = `${(error as any).name || 'ResendError'}: ${(error as any).message || JSON.stringify(error)}`
        console.error('[whole-home] Resend API returned error (merchant):', error)
      } else {
        emailSent = true
        console.log('[whole-home] Merchant notification email queued, id=', data?.id)
      }
    } catch (emailErr: any) {
      emailError = `Exception: ${emailErr?.message || String(emailErr)}`
      console.error('[whole-home] Failed to send merchant notification email:', emailErr)
    }

    // Customer confirmation email — best-effort, never fails the request.
    try {
      const { error } = await getResend().emails.send({
        from: FROM(),
        to: cleanEmail,
        subject: 'We received your whole-home consultation request — Angel Drapery',
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="font-size: 20px; font-weight: 300; color: #1a1a1a; margin-bottom: 16px;">Thank you, ${esName}!</h2>
            <p style="color: #444; font-size: 14px; line-height: 1.7;">
              We received your whole-home consultation request. Our design team will contact you
              within <strong>1 business day</strong> to talk through your project — measuring,
              fabric selection, and a complete quote for every room.
            </p>
            <p style="color: #444; font-size: 14px; line-height: 1.7;">
              If your project is within our Los Angeles service area, your in-home consultation
              is free. Outside the area, we&#39;re happy to assist remotely with photos.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">
              Angel Drapery, Inc · Custom Window Treatments Since 1984<br/>
              Questions? Reply to this email or call (626) 703-2929.
            </p>
          </div>
        `,
      })
      if (error) {
        console.error('[whole-home] Resend API returned error (customer confirmation):', error)
      }
    } catch (confirmErr) {
      console.error('[whole-home] Failed to send customer confirmation email:', confirmErr)
    }

    // DB save always succeeds at this point; report merchant-email status so the
    // frontend / monitoring can detect silent regressions.
    return NextResponse.json({
      success: true,
      emailSent,
      ...(emailError ? { emailError } : {}),
    })
  } catch (e) {
    console.error('Whole-home request error:', e)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
