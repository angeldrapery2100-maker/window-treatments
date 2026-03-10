import { NextResponse } from 'next/server'
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
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
