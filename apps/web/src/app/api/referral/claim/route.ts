import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import {
  ANON_COOKIE, ANON_COOKIE_MAX_AGE, getAnonIdFromRequest, newAnonId, logLeadEvent,
} from '@/lib/homeProjects'
import { getCampaignFromRequest } from '@/lib/campaigns'
import {
  REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, getReferralFromRequest,
  isValidReferralToken, lookupReferral, recordReferralVisit,
} from '@/lib/referral'

// Seed the referral attribution cookie for /r/<token>.
//
// WHY A ROUTE HANDLER: the landing page must live at /r/<token> so the shared
// link carries its own Open Graph card (WeChat, iMessage and Facebook scrape
// the URL that was pasted, and a redirect hop is not reliably followed). A
// Server Component cannot write cookies in Next 15, so the page renders and
// its client island immediately POSTs here — the cookie is set before the
// visitor can open the chat or submit anything, which is all attribution
// needs. Everything is re-derived server-side: the body carries a token, and
// this route re-validates it against the referral backend before trusting it.
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit('referral_claim', ip, { max: 30, windowSeconds: 600 })
    if (!limit.allowed) return NextResponse.json({ success: false }, { status: 429 })

    let body: any
    try { body = await request.json() } catch { body = null }
    const token = String(body?.token ?? '')
    if (!isValidReferralToken(token)) {
      return NextResponse.json({ success: false, error: 'bad_token' }, { status: 400 })
    }
    // A token only becomes a cookie if the backend still recognizes it —
    // a revoked partner link must stop attributing on the next visit.
    const ref = await lookupReferral(token)
    if (!ref) return NextResponse.json({ success: false, error: 'unknown_token' }, { status: 404 })

    const userId = getUserFromRequest(request)?.id ?? null
    const cookieAnonId = getAnonIdFromRequest(request)
    const anonId = cookieAnonId ?? newAnonId()
    const already = getReferralFromRequest(request) === token
    const ua = (request.headers.get('user-agent') || '').slice(0, 200)

    if (!already) {
      logLeadEvent({
        userId, anonId, type: 'referral_visit',
        meta: { token, type: ref.referrerType, ua },
        campaignId: getCampaignFromRequest(request),
      })
      // Fire-and-forget: the referrer's own dashboard counts this visit.
      recordReferralVisit(token, String(body?.page || '/r').slice(0, 120), ua).catch(() => {})
    }

    const res = NextResponse.json({ success: true })
    res.cookies.set(REFERRAL_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: '/',
    })
    if (!cookieAnonId) {
      res.cookies.set(ANON_COOKIE, anonId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ANON_COOKIE_MAX_AGE,
        path: '/',
      })
    }
    return res
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
