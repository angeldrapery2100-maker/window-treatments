import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { recordAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    let adminUser: any
    try { adminUser = requireAdmin(request) } catch {}

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
