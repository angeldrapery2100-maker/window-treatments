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

// Shared helper: returns the JWT secret or null if misconfigured (request is
// then rejected with 500). Matches apps/web/src/lib/auth.ts EXACTLY so sign
// and verify use the same key; any divergence here silently breaks auth.
//
// Fallback rules:
//   - JWT_SECRET set              → use it
//   - production, no JWT_SECRET   → null (reject)
//   - non-prod, ALLOW_DEV_JWT=1   → well-known dev fallback
//   - non-prod, no opt-in         → null (reject — fail closed against
//                                     misdetected NODE_ENV leaking the
//                                     public dev key as a real secret)
function getJwtSecret(): string | null {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production') return null
  if (process.env.ALLOW_DEV_JWT === '1') return 'dev_only_fallback_do_not_use_in_prod'
  return null
}

// Paths that must never be indexed by search engines. The X-Robots-Tag
// response header is authoritative: it overrides any <meta name="robots">
// that might leak through, covers API responses (which have no <head>),
// and applies even when the admin page is behind a redirect.
const NOINDEX_PREFIXES = ['/admin', '/api/admin', '/angel-preview']

function applyNoindex(response: NextResponse, pathname: string): NextResponse {
  if (NOINDEX_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const JWT_SECRET = getJwtSecret()

  // Reject all protected requests when JWT_SECRET is not configured in production
  if (!JWT_SECRET) {
    console.error('[middleware] JWT_SECRET is not set — rejecting protected request')
    return applyNoindex(NextResponse.json(
      { success: false, error: 'Server misconfiguration: authentication unavailable' },
      { status: 500 }
    ), pathname)
  }

  // ── API routes: /api/admin/* ─────────────────────────────────
  // Exception: /api/admin/accounts/setup (bootstrap endpoint)
  if (
    pathname.startsWith('/api/admin/') &&
    pathname !== '/api/admin/accounts/setup'
  ) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return applyNoindex(NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }), pathname)
    }
    const user = await verifyJWT(token, JWT_SECRET)
    if (!user || user.role !== 'admin') {
      return applyNoindex(NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }), pathname)
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
      return applyNoindex(NextResponse.redirect(new URL('/admin/login', request.url)), pathname)
    }
    const user = await verifyJWT(token, JWT_SECRET)
    if (!user || user.role !== 'admin') {
      return applyNoindex(NextResponse.redirect(new URL('/admin/login', request.url)), pathname)
    }
  }

  return applyNoindex(NextResponse.next(), pathname)
}

export const config = {
  // Matches every admin path, every admin API path, and the internal
  // /angel-preview tool — all of which get X-Robots-Tag: noindex.
  matcher: ['/api/admin/:path*', '/admin/:path*', '/angel-preview/:path*', '/angel-preview'],
}
