import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { isValidReferralToken, setReferralPortalPrefs } from '@/lib/referral'

// "Notify me about my rewards" toggle on /rewards/<token>.
//
// The token IS the capability — same as the page itself — so there is no
// session to check; it only ever flips one boolean on the referrer's own
// record, and the response echoes what the backend actually stored (a STOP
// reply on the carrier side always wins over the toggle).
export async function POST(request: Request) {
  try {
    const limit = await rateLimit('referral_prefs', getClientIp(request), { max: 20, windowSeconds: 600 })
    if (!limit.allowed) return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 })

    let body: any
    try { body = await request.json() } catch { body = null }
    const token = String(body?.token ?? '')
    if (!isValidReferralToken(token)) {
      return NextResponse.json({ success: false, error: 'bad_token' }, { status: 400 })
    }
    const r = await setReferralPortalPrefs(token, body?.smsOptIn === true)
    if (!r.ok) return NextResponse.json({ success: false, error: r.error || 'failed' }, { status: 502 })
    return NextResponse.json({ success: true, data: { smsOptIn: r.smsOptIn === true } })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
