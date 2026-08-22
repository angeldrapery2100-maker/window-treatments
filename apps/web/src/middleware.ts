import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Edge-compatible HS256 JWT verification (no external packages needed)
async function verifyJWT(token: string, secret: string): Promise<{ id: string; role: string; jti?: string } | null> {
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
    return { id: payload.id, role: payload.role, jti: payload.jti }
  } catch {
    return null
  }
}

// Revocation check. The middleware runs on the edge and can't query Postgres,
// so it asks the internal Node endpoint whether this token's jti was revoked.
//
// OPT-IN: only active when INTERNAL_REVOCATION_SECRET is set. When unset, this
// returns false immediately (feature off) and middleware behaves exactly as
// before. Fails OPEN on any error so a transient blip never locks admins out —
// the signature/role/expiry checks still apply regardless.
async function isTokenRevoked(request: NextRequest, jti?: string): Promise<boolean> {
  const secret = process.env.INTERNAL_REVOCATION_SECRET
  if (!secret || !jti) return false
  try {
    const url = new URL('/api/internal/token-status', request.url)
    url.searchParams.set('jti', jti)
    const res = await fetch(url, { headers: { 'x-internal-secret': secret } })
    if (!res.ok) return false
    const data = await res.json()
    return data?.revoked === true
  } catch {
    return false
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

// ── 推广归因 cookie(补修 B1)────────────────────────────────────────────
// 以前 ad_ref 只由 /api/referral/claim 种,而那个路由按 IP 限流 30 次/10 分钟。
// 微信内置浏览器、公司 NAT、展会 Wi-Fi 都是共享出口 IP —— 一个群里几十个人点
// 同一条链接,前 30 个之后的访客全部拿不到 cookie,归因静默失效。这不是边角
// 情况,这就是推广链接的主场景。
// 现在改成 middleware 直接在 /r/<token> 的响应上种 cookie:没有网络往返、没有
// 限流、禁 JS 也照种。claim 降级成「统计 + 埋点」的次路径。
// 无效 token 不落地(正则挡掉);就算落地了,AAPP 端 resolveReferralCore 也只会
// 返回 null 当成没有推荐人 —— 零副作用,所以这里不做网络校验。
// ★ 这两个常量必须与 src/lib/referral.ts 的 TOKEN_RE / REFERRAL_COOKIE 一致。
//   不 import 是因为 middleware 跑在 edge runtime,而 lib/referral.ts 里有
//   动态 import('@/lib/referral.mock'),会被打进 edge bundle。
//   referral.test.ts 里有一条断言盯着这两处别漂开。
const REFERRAL_COOKIE = 'ad_ref'
const REFERRAL_TOKEN_RE = /^[A-Za-z0-9_-]{16,32}$/
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 90   // 90 天,同 campaign cookie

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

  // ── /r/<token>:种归因 cookie 然后立刻放行 ────────────────────────────
  // ★ 必须在 getJwtSecret() 的拒绝分支之前 return —— 否则没配 JWT_SECRET 的
  //   环境会把落地页也一起 500 掉,而落地页跟登录八竿子打不着。
  if (pathname.startsWith('/r/')) {
    const res = NextResponse.next()
    const token = pathname.slice(3).split('/')[0]
    if (REFERRAL_TOKEN_RE.test(token)) {
      res.cookies.set(REFERRAL_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFERRAL_COOKIE_MAX_AGE,
        path: '/',
      })
    }
    return res
  }

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
    if (await isTokenRevoked(request, user.jti)) {
      return applyNoindex(NextResponse.json({ success: false, error: 'Session ended. Please sign in again.' }, { status: 401 }), pathname)
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
    if (await isTokenRevoked(request, user.jti)) {
      return applyNoindex(NextResponse.redirect(new URL('/admin/login', request.url)), pathname)
    }
  }

  return applyNoindex(NextResponse.next(), pathname)
}

export const config = {
  // Matches every admin path, every admin API path, and the internal
  // /angel-preview tool — all of which get X-Robots-Tag: noindex.
  // '/r/:token' 在这里是为了种归因 cookie(补修 B1),不走 noindex 那套。
  matcher: ['/api/admin/:path*', '/admin/:path*', '/angel-preview/:path*', '/angel-preview', '/r/:token'],
}
