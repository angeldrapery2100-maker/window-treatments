import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Edge-compatible HS256 JWT verification (no external packages needed)
async function verifyJWT(token: string, secret: string): Promise<{ id: string; role: string } | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, sigB64] = parts

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Base64url → Base64 → Uint8Array
    const b64 = sigB64.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '=='.slice((b64.length % 4) || 4)
    const sigBytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0))

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, data)
    if (!valid) return null

    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((payloadB64.length % 4) || 4))
    const payload = JSON.parse(payloadJson)

    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return { id: payload.id, role: payload.role }
  } catch {
    return null
  }
}

// Shared helper: returns the JWT secret or rejects the request in production.
// Matches the same logic as apps/web/src/lib/auth.ts so both use identical secrets.
function getJwtSecret(): string | null {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production') return null  // misconfiguration — must reject
  return 'dev_only_fallback_do_not_use_in_prod'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const JWT_SECRET = getJwtSecret()

  // Reject all protected requests when JWT_SECRET is not configured in production
  if (!JWT_SECRET) {
    console.error('[middleware] JWT_SECRET is not set — rejecting protected request')
    return NextResponse.json(
      { success: false, error: 'Server misconfiguration: authentication unavailable' },
      { status: 500 }
    )
  }

  // ── API routes: /api/admin/* ─────────────────────────────────
  // Exception: /api/admin/accounts/setup (bootstrap endpoint)
  if (
    pathname.startsWith('/api/admin/') &&
    pathname !== '/api/admin/accounts/setup'
  ) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const user = await verifyJWT(token, JWT_SECRET)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  // ── Admin pages: /admin/* ────────────────────────────────────
  // Exception: /admin/login
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login')
  ) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const user = await verifyJWT(token, JWT_SECRET)
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*', '/admin/:path*'],
}
