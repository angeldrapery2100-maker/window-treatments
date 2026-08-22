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

// /r/<token> 的**次**路径:埋点 + 给推荐人的仪表盘计一次访问。
//
// ★ 补修 B1:cookie 的主路径已经搬到 middleware.ts 了。原因是这个路由按 IP
//   限流,而微信群 / 公司 NAT / 展会 Wi-Fi 都是共享出口 IP —— 一条链接在群里
//   转开,前几十个人之后的访客就全部拿不到 cookie,归因静默失效。
//   这里保留是为了 referralVisit 统计和 logLeadEvent,cookie 顺手再种一次
//   (幂等,值一样),但它不再是唯一来源,被限流也不影响归因。
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
    let body0: any = null
    try { body0 = await request.clone().json() } catch { body0 = null }
    const token0 = String(body0?.token ?? '')
    /* 限流口径改成「每 token 每 IP 每 10 分钟 1 次」,和 AAPP 端 referralVisit
       的 _rateLimitAllow('refVisit', token+'|'+ip, 1, 600000) 完全一致 ——
       两边各记各的,口径不同就会对不上账。
       ★ 不再按纯 IP 限流:共享出口 IP 下那会把整群人挡在门外。
       被限流不是错误,是「这次不用重复计数」——返回 200,页面什么都不用做。 */
    const limit = await rateLimit('referral_claim', token0 + '|' + ip, { max: 1, windowSeconds: 600 })
    if (!limit.allowed) return NextResponse.json({ success: true, deduped: true })

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
