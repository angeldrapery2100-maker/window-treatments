import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { query } from '@/lib/db'

let _resend: Resend | null = null
function getResend() { return _resend ??= new Resend(process.env.RESEND_API_KEY) }

// Ensure verification codes table
async function ensureTable() {
  await query(`CREATE TABLE IF NOT EXISTS email_verification_codes (
    id serial PRIMARY KEY,
    email varchar(256) NOT NULL,
    code varchar(6) NOT NULL,
    expires_at timestamptz NOT NULL,
    used boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  )`)
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    await ensureTable()
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 })
    }

    // Rate limit: max 1 code per 60 seconds per email
    const recent = await query(
      `SELECT id FROM email_verification_codes WHERE email = LOWER($1) AND created_at > NOW() - INTERVAL '60 seconds'`,
      [email]
    )
    if (recent.length > 0) {
      return NextResponse.json({ success: false, error: 'Please wait 60 seconds before requesting another code' }, { status: 429 })
    }

    // Invalidate old codes
    await query(`UPDATE email_verification_codes SET used = true WHERE email = LOWER($1) AND used = false`, [email])

    // Generate new code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await query(
      `INSERT INTO email_verification_codes (email, code, expires_at) VALUES (LOWER($1), $2, $3)`,
      [email, code, expiresAt.toISOString()]
    )

    // Send email
    await getResend().emails.send({
      from: 'Angel Drapery <onboarding@resend.dev>',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="font-size: 20px; font-weight: 300; color: #1a1a1a; margin-bottom: 8px;">Angel Drapery</h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Your verification code is:</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Send code error:', e)
    return NextResponse.json({ success: false, error: 'Failed to send verification code' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
