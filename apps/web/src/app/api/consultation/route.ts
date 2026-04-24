import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'

let _resend: Resend | null = null
function getResend() { return _resend ??= new Resend(process.env.RESEND_API_KEY) }

// Escape user-supplied text before interpolating into HTML email bodies.
// Prevents HTML/phishing injection via name/phone/email/address/message fields.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
}

export async function POST(request: Request) {
  try {
    await ensureTable()

    // Accept both new fields (address, message) and legacy field (notes).
    // Frontend sends: name, email, phone, address, message
    // Old callers may send: name, email, phone, notes
    const body = await request.json() as any
    const { name, phone, email } = body
    const address = (body.address || '').trim()
    const message = (body.message || body.notes || '').trim()  // message takes priority; fall back to legacy notes

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

    // Save to database — keep notes column populated for backward-compat readers
    await query(
      `INSERT INTO consultation_requests (name, phone, email, notes, address, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cleanName, cleanPhone, cleanEmail, message || null, address || null, message || null]
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
        to: process.env.NOTIFICATION_EMAIL || 'angeldrapery2100@yahoo.com',
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
  } catch (e: any) {
    console.error('Consultation request error:', e)
    return NextResponse.json({ error: 'Failed to submit consultation request' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
