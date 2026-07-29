import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { getMeasureLink } from '@/lib/aappMeasureBridge'

// GET /api/store/measure/link?t=<token>
// The measure wizard calls this when it is opened from a salesperson's
// 'measure' link (AAPP createTypedLink). Returns the customer prefill +
// the salesperson name card, or { success:false } for a bad/expired token
// (the wizard then just runs in its normal anonymous mode).

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const limit = await rateLimit('measure-link', ip, { max: 60, windowSeconds: 600 })
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
  }
  const { searchParams } = new URL(request.url)
  const token = String(searchParams.get('t') || '').trim()
  if (!token || token.length > 200) {
    return NextResponse.json({ success: false, error: 'token required' }, { status: 400 })
  }
  const info = await getMeasureLink(token)
  if (!info.ok) {
    return NextResponse.json({ success: false, error: info.error || 'link unavailable' }, { status: 404 })
  }
  return NextResponse.json({
    success: true,
    data: {
      submitted: info.submitted === true,
      prefill: info.prefill || {},
      salesperson: info.salesperson || null,
      company: info.company || '',
    },
  })
}
