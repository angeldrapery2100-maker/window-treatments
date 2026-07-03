import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'
import { escapeHtml } from '@/lib/html'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { verifyTurnstile } from '@/lib/turnstile'
import { scoreSpam } from '@/lib/spamCheck'

let _resend: Resend | null = null
function getResend() { return _resend ??= new Resend(process.env.RESEND_API_KEY) }

// Decoy success response for silently-dropped bot submissions. Returns the SAME
// shape a real submission gets so a bot cannot tell it was rejected and adapt.
function decoyResponse() {
  return NextResponse.json({ success: true, emailSent: true })
}

// Create / migrate table on first access
async function ensureTable() {
  await query(`CREATE TABLE IF NOT EXISTS consultation_requests (
    id serial PRIMARY KEY,
    name varchar(256) NOT NULL,
    phone varchar(32) NOT NULL,
    email varchar(256) NOT NULL,
    notes text,
    status varchar(32) DEFAULT 'new',
    created_at timestamptz DEFAULT now()
  )`)
  // Migration: add address and message columns (safe on existing tables)
  await query(`ALTER TABLE consultation_requests ADD COLUMN IF NOT EXISTS address text`).catch(() => {})
  await query(`ALTER TABLE consultation_requests ADD COLUMN IF NOT EXISTS message text`).catch(() => {})
  // A2P 10DLC: persist the SMS opt-in flag as a consent record (best practice;
  // not required by Twilio's reviewer but kept as proof of affirmative consent).
  await query(`ALTER TABLE consultation_requests ADD COLUMN IF NOT EXISTS sms_consent boolean DEFAULT false`).catch(() => {})
  await query(`ALTER TABLE consultation_requests ADD COLUMN IF NOT EXISTS sms_consent_at timestamptz`).catch(() => {})
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)

    // Accept both new fields (address, message) and legacy field (notes).
    // Frontend sends: name, email, phone, address, message, plus the anti-bot
    // fields company (honeypot), elapsedMs (fill time) and turnstileToken.
    // Old callers may send: name, email, phone, notes
    const body = await request.json() as any

    // ── P0: honeypot ─────────────────────────────────────────────────────────
    // `company` is an invisible field no human ever sees or fills. Any value =
    // a bot. Reply with the normal success shape so it gets no signal to adapt.
    if (typeof body.company === 'string' && body.company.trim() !== '') {
      console.warn('[consultation] honeypot tripped — dropping submission')
      return decoyResponse()
    }

    // ── P0: minimum fill time ────────────────────────────────────────────────
    // The widget stamps how long the form was on screen before submit. Humans
    // take several seconds to fill name/phone/email; sub-3s means a script.
    const elapsedMs = Number(body.elapsedMs)
    if (Number.isFinite(elapsedMs) && elapsedMs < 3000) {
      console.warn(`[consultation] too-fast submit (${elapsedMs}ms) — dropping`)
      return decoyResponse()
    }

    // ── P2: rate limit (tightened 5 → 3 per hour per IP) ─────────────────────
    const limit = await rateLimit('consultation', ip, { max: 3, windowSeconds: 3600 })
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    await ensureTable()

    const { name, phone, email } = body
    const address = (body.address || '').trim()
    const message = (body.message || body.notes || '').trim()  // message takes priority; fall back to legacy notes
    const smsConsent = body.smsConsent === true || body.smsConsent === 'on'  // A2P opt-in flag

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

    const cleanName  = String(name).trim()
    const cleanPhone = String(phone).trim()
    const cleanEmail = String(email).trim()

    // ── P1: Cloudflare Turnstile ─────────────────────────────────────────────
    // Verify the human-challenge token before touching the DB or sending mail.
    // Skips automatically when TURNSTILE_SECRET_KEY is unset (dev/preview).
    const turnstile = await verifyTurnstile(body.turnstileToken, ip)
    if (!turnstile.ok) {
      console.warn('[consultation] Turnstile verification failed:', turnstile.error)
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 403 }
      )
    }

    // ── P2: heuristic spam score (auxiliary, conservative — see spamCheck.ts) ─
    const verdict = scoreSpam({ name: cleanName, phone: cleanPhone, email: cleanEmail, message })
    if (verdict.spam) {
      console.warn(`[consultation] heuristic spam drop (score=${verdict.score}): ${verdict.reasons.join(', ')}`)
      return decoyResponse()
    }

    // Save to database — keep notes column populated for backward-compat readers
    await query(
      `INSERT INTO consultation_requests (name, phone, email, notes, address, message, sms_consent, sms_consent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [cleanName, cleanPhone, cleanEmail, message || null, address || null, message || null,
       smsConsent, smsConsent ? new Date() : null]
    )

    // Escaped copies for HTML interpolation
    const esName    = escapeHtml(cleanName)
    const esPhone   = escapeHtml(cleanPhone)
    const esEmail   = escapeHtml(cleanEmail)
    const esAddress = escapeHtml(address)
    const esMessage = escapeHtml(message)

    // Build email rows for address and message (shown separately, never dropped)
    const addressRow = address
      ? `<tr>
           <td style="padding: 10px 0; color: #999; font-size: 13px; width: 80px; vertical-align: top;">Address</td>
           <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;">${esAddress}</td>
         </tr>`
      : ''

    const messageRow = message
      ? `<tr>
           <td style="padding: 10px 0; color: #999; font-size: 13px; width: 80px; vertical-align: top;">Message</td>
           <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; white-space: pre-line;">${esMessage}</td>
         </tr>`
      : ''

    const smsRow = `<tr>
           <td style="padding: 10px 0; color: #999; font-size: 13px; vertical-align: top;">SMS Consent</td>
           <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;">${smsConsent ? '✅ Opted in to SMS' : '— Not opted in'}</td>
         </tr>`

    // Send notification email to business owner.
    // IMPORTANT: resend.emails.send() returns { data, error } — it does NOT throw on
    // API-level failures (e.g. 403 "testing domain restriction", 401 invalid key, 422
    // validation). We must inspect `error` explicitly and surface it to logs,
    // otherwise silent failures look like success and the notification never arrives.
    let emailSent = false
    let emailError: string | null = null
    try {
      const { data, error } = await getResend().emails.send({
        from: process.env.EMAIL_FROM || 'Angel Drapery <onboarding@resend.dev>',
        to: process.env.NOTIFICATION_EMAIL || 'admin@angel-drapery.com',
        subject: `New Consultation Request from ${cleanName}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="font-size: 20px; font-weight: 300; color: #1a1a1a; margin-bottom: 24px;">New Consultation Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #999; font-size: 13px; width: 80px; vertical-align: top;">Name</td>
                <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;">${esName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #999; font-size: 13px; vertical-align: top;">Phone</td>
                <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;">${esPhone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #999; font-size: 13px; vertical-align: top;">Email</td>
                <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;"><a href="mailto:${esEmail}" style="color: #1a1a1a;">${esEmail}</a></td>
              </tr>
              ${addressRow}
              ${messageRow}
              ${smsRow}
            </table>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">This request was submitted through the Angel Drapery website.</p>
          </div>
        `,
      })
      if (error) {
        // API-level error — e.g. 403 sandbox restriction, 401 invalid key,
        // 422 validation. Log structured so it shows up clearly in runtime logs.
        emailError = `${(error as any).name || 'ResendError'}: ${(error as any).message || JSON.stringify(error)}`
        console.error('[consultation] Resend API returned error:', error)
      } else {
        emailSent = true
        console.log('[consultation] Notification email queued, id=', data?.id)
      }
    } catch (emailErr: any) {
      // Network / SDK exception (rare — only thrown on transport failures).
      emailError = `Exception: ${emailErr?.message || String(emailErr)}`
      console.error('[consultation] Failed to send notification email:', emailErr)
    }

    // DB save always succeeds at this point, but we tell the caller whether the
    // email went out so the frontend / monitoring can detect silent regressions.
    return NextResponse.json({
      success: true,
      emailSent,
      ...(emailError ? { emailError } : {}),
    })
  } catch (e) {
    console.error('Consultation request error:', e)
    return NextResponse.json({ error: 'Failed to submit consultation request' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
