import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { isValidReferralToken, uploadPartnerW9, W9_MAX_BYTES, W9_MIME } from '@/lib/referral'

// W-9 upload for /partner/<token>. The file is relayed straight to AAPP — it
// is never written to disk here — and a tax document is exactly the kind of
// payload that should not linger on a web host.
export async function POST(request: Request) {
  try {
    const limit = await rateLimit('referral_w9', getClientIp(request), { max: 10, windowSeconds: 3600 })
    if (!limit.allowed) return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 })

    let body: any
    try { body = await request.json() } catch { body = null }
    const token = String(body?.token ?? '')
    const mime = String(body?.mime ?? '')
    const file = String(body?.file ?? '')
    if (!isValidReferralToken(token)) {
      return NextResponse.json({ success: false, error: 'bad_token' }, { status: 400 })
    }
    if (!W9_MIME.includes(mime)) {
      return NextResponse.json({ success: false, error: 'bad_type' }, { status: 400 })
    }
    if (!file || (file.length * 3) / 4 > W9_MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'too_large' }, { status: 413 })
    }
    const r = await uploadPartnerW9(token, file, mime)
    if (!r.ok) return NextResponse.json({ success: false, error: r.error || 'failed' }, { status: 502 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
