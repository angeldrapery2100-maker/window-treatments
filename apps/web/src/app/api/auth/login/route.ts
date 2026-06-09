import { NextResponse } from 'next/server'
import { loginUser, generateToken } from '@/lib/auth'
import { isRateLimited, recordAttempt, lockoutRemainingMinutes } from '@/lib/loginRateLimit'
import { recordAudit } from '@/lib/audit'
import { errorResponse } from '@/lib/apiError'
import { isTotpEnabledForEmail } from '@/lib/twoFactor'
import { verifyTotp } from '@/lib/totp'

export async function POST(request: Request) {
  try {
    const body = await request.json() as any
    const { email, password, totpCode } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? null

    // Rate limit check by email
    const limited = await isRateLimited(email.toLowerCase())
    if (limited) {
      const remaining = await lockoutRemainingMinutes(email.toLowerCase())
      return NextResponse.json(
        { success: false, error: `登录尝试次数过多，请 ${remaining} 分钟后重试` },
        { status: 429 }
      )
    }

    let user: any
    try {
      user = await loginUser(email, password)
    } catch (err: any) {
      // Record failed attempt
      await recordAttempt(email.toLowerCase(), ip, false)
      await recordAudit({
        action: 'auth.login_failed',
        actor_email: email.toLowerCase(),
        ip,
        note: err.message,
      })
      return NextResponse.json({ success: false, error: err.message }, { status: 401 })
    }

    // ── Two-factor gate (if the account has 2FA enabled) ────────────────────
    const totp = await isTotpEnabledForEmail(user.email)
    if (totp.enabled) {
      if (!totpCode) {
        // Password was correct; UI should now prompt for the 6-digit code.
        return NextResponse.json({ success: false, requiresTotp: true }, { status: 401 })
      }
      if (!totp.secret || !verifyTotp(totp.secret, String(totpCode))) {
        await recordAttempt(email.toLowerCase(), ip, false)
        await recordAudit({ action: 'auth.login_failed', actor_email: user.email, ip, note: 'invalid 2FA code' })
        return NextResponse.json({ success: false, requiresTotp: true, error: 'Incorrect authentication code.' }, { status: 401 })
      }
    }

    // Success — record attempt and audit
    await recordAttempt(email.toLowerCase(), ip, true)
    await recordAudit({
      action: 'auth.login',
      actor_id: user.id,
      actor_email: user.email,
      ip,
    })

    const token = generateToken(user)

    const res = NextResponse.json({ success: true, data: { user } })
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return res
  } catch (e) {
    return errorResponse('Login failed. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
