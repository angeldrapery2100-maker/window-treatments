import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { errorResponse } from '@/lib/apiError'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and code required' }, { status: 400 })
    }

    // Throttle OTP attempts: max 10 per 10 minutes per email AND per IP.
    // A 6-digit code is only 1M combinations, so brute force must be blocked.
    const emailKey = String(email).toLowerCase().trim()
    const ip = getClientIp(request)
    const [byEmail, byIp] = await Promise.all([
      rateLimit('verify-code:email', emailKey, { max: 10, windowSeconds: 600 }),
      rateLimit('verify-code:ip', ip, { max: 30, windowSeconds: 600 }),
    ])
    if (!byEmail.allowed || !byIp.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please request a new code and try again later.' },
        { status: 429 }
      )
    }

    const row = await queryOne(
      `SELECT id FROM email_verification_codes 
       WHERE email = LOWER($1) AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    )

    if (!row) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 })
    }

    // Mark as used
    await query(`UPDATE email_verification_codes SET used = true WHERE id = $1`, [row.id])

    return NextResponse.json({ success: true })
  } catch (e) {
    return errorResponse('Could not verify code. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
