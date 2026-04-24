import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'
import { escapeHtml } from '@/lib/html'

let _resend: Resend | null = null
function getResend() { return _resend ??= new Resend(process.env.RESEND_API_KEY) }

// IP-based rate limits (in addition to per-email). Without these, an attacker
// can rotate through disposable email addresses and burn our Resend quota or
// spam third-party inboxes with 6-digit codes that look like they came from
// Angel Drapery. Per-email limit alone is bypassable by just changing the
// email.
const PER_IP_WINDOW_10M_MAX = 5    // 5 codes per IP per 10 minutes
const PER_IP_WINDOW_1D_MAX  = 20   // 20 codes per IP per day

// Ensure verification codes table. Adds `ip` column on existing tables so we
// can rate-limit by IP without losing history.
async function ensureTable() {
  await query(`CREATE TABLE IF NOT EXISTS email_verification_codes (
    id serial PRIMARY KEY,
    email varchar(256) NOT NULL,
    code varchar(6) NOT NULL,
    expires_at timestamptz NOT NULL,
    used boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  )`)
  await query(`ALTER TABLE email_verification_codes ADD COLUMN IF NOT EXISTS ip varchar(64)`).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_email_codes_ip_created ON email_verification_codes(ip, created_at DESC)`).catch(() => {})
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Extract the originating client IP. Vercel / most reverse proxies set
// `x-forwarded-for` as a comma-separated list where the left-most entry is
// the real client; `x-real-ip` is the fallback single-value header used by
// nginx and some CDNs. If neither is present (local dev with no proxy),
// returns null, which disables IP-rate-limiting for that request rather
// than blanket-blocking — dev should not be accidentally locked out.
function clientIp(request: Request): string | null {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const real = request.headers.get('x-real-ip')
  return real?.trim() || null
}

export async function POST(request: Request) {
  try {
    await ensureTable()
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 })
    }

    const ip = clientIp(request)

    // ─── Per-email rate limit (existing): max 1 code per 60 seconds ───
    const recent = await query(
      `SELECT id FROM email_verification_codes WHERE email = LOWER($1) AND created_at > NOW() - INTERVAL '60 seconds'`,
      [email]
    )
    if (recent.length > 0) {
      return NextResponse.json({ success: false, error: 'Please wait 60 seconds before requesting another code' }, { status: 429 })
    }

    // ─── Per-IP rate limits (new) ───
    // We only rate-limit when we actually know the IP; otherwise rely on the
    // per-email cap alone. This avoids locking out local dev.
    if (ip) {
      const [{ cnt: cnt10m } = { cnt: '0' }] = await query(
        `SELECT COUNT(*)::text AS cnt FROM email_verification_codes
         WHERE ip = $1 AND created_at > NOW() - INTERVAL '10 minutes'`,
        [ip]
      ) as { cnt: string }[]
      if (parseInt(cnt10m, 10) >= PER_IP_WINDOW_10M_MAX) {
        console.warn('[send-code] IP rate-limit 10m hit:', ip)
        return NextResponse.json({ success: false, error: 'Too many code requests from this network. Please try again later.' }, { status: 429 })
      }

      const [{ cnt: cnt1d } = { cnt: '0' }] = await query(
        `SELECT COUNT(*)::text AS cnt FROM email_verification_codes
         WHERE ip = $1 AND created_at > NOW() - INTERVAL '1 day'`,
        [ip]
      ) as { cnt: string }[]
      if (parseInt(cnt1d, 10) >= PER_IP_WINDOW_1D_MAX) {
        console.warn('[send-code] IP rate-limit 1d hit:', ip)
        return NextResponse.json({ success: false, error: 'Daily code limit reached for this network.' }, { status: 429 })
      }
    }

    // Invalidate old codes for this email
    await query(`UPDATE email_verification_codes SET used = true WHERE email = LOWER($1) AND used = false`, [email])

    // Generate new code (record IP so the next request counts against it)
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await query(
      `INSERT INTO email_verification_codes (email, code, expires_at, ip) VALUES (LOWER($1), $2, $3, $4)`,
      [email, code, expiresAt.toISOString(), ip]
    )

    // Send email — code is numeric so escape is belt-and-braces, but we do it
    // anyway so future format changes can't accidentally introduce XSS.
    const { data, error } = await getResend().emails.send({
      from: process.env.EMAIL_FROM || 'Angel Drapery <onboarding@resend.dev>',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="font-size: 20px; font-weight: 300; color: #1a1a1a; margin-bottom: 8px;">Angel Drapery</h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Your verification code is:</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a;">${escapeHtml(code)}</span>
          </div>
          <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    })
    if (error) {
      console.error('[send-code] Resend API returned error:', error)
      return NextResponse.json({ success: false, error: 'Failed to send verification code' }, { status: 500 })
    }
    console.log('[send-code] Code email queued, id=', data?.id)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Send code error:', e)
    return NextResponse.json({ success: false, error: 'Failed to send verification code' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
