import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { recordAudit } from '@/lib/audit'
import { requireAdmin, getTokenFromRequest, getTokenClaims } from '@/lib/auth'
import { revokeToken } from '@/lib/tokenBlocklist'

export async function POST(request: Request) {
  try {
    let adminUser: any
    try { adminUser = requireAdmin(request) } catch {}

    // Revoke this token server-side so it can't be reused even before expiry
    // (e.g. if it was captured). Best-effort — never block logout on this.
    try {
      const token = getTokenFromRequest(request)
      const claims = token ? getTokenClaims(token) : null
      if (claims?.jti && claims.exp) {
        await revokeToken(claims.jti, claims.id || '', new Date(claims.exp * 1000))
      }
    } catch (revErr) {
      console.error('[logout] token revocation failed:', revErr)
    }

    if (adminUser) {
      await recordAudit({
        action: 'auth.logout',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      })
    }

    const res = NextResponse.json({ success: true })
    // Clear auth cookie
    res.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return res
  } catch (e: any) {
    return errorResponse('Logout failed. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
