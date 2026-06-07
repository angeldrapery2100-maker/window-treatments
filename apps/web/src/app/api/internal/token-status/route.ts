// Internal endpoint: lets the (edge) middleware ask whether a token's `jti` has
// been revoked, since the middleware itself can't query Postgres.
//
// Protected by INTERNAL_REVOCATION_SECRET — the middleware sends it in the
// x-internal-secret header. If the env var is unset, the whole revocation
// feature is OFF (middleware never calls this), so this endpoint just 403s.
// NOT under /api/admin, so it is not gated by the admin middleware (no recursion).

import { NextResponse } from 'next/server'
import { isTokenRevoked } from '@/lib/tokenBlocklist'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const secret = process.env.INTERNAL_REVOCATION_SECRET
  if (!secret || request.headers.get('x-internal-secret') !== secret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const jti = new URL(request.url).searchParams.get('jti') || ''
  if (!jti) return NextResponse.json({ revoked: false })

  try {
    const revoked = await isTokenRevoked(jti)
    return NextResponse.json({ revoked })
  } catch (e) {
    console.error('[token-status] lookup failed:', e)
    // Fail open at this layer; the middleware also treats errors as "allow".
    return NextResponse.json({ revoked: false })
  }
}
