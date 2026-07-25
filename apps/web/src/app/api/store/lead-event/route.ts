import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { getAnonIdFromRequest, logLeadEvent } from '@/lib/homeProjects'
import { getCampaignFromRequest } from '@/lib/campaigns'

// Client-reported behavioral events for lead scoring (P2). Deliberately tiny:
// a WHITELIST of event types the browser may report, no values trusted beyond
// the type itself (identity + campaign come from cookies, never the body).
const CLIENT_EVENT_TYPES = new Set(['project_added_to_cart', 'assistant_opened'])

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit('lead_event', ip, { max: 60, windowSeconds: 600 })
    if (!limit.allowed) return NextResponse.json({ success: false }, { status: 429 })

    let body: any
    try { body = await request.json() } catch { body = null }
    const type = String(body?.type ?? '')
    if (!CLIENT_EVENT_TYPES.has(type)) {
      return NextResponse.json({ success: false, error: 'unknown_event' }, { status: 400 })
    }

    const userId = getUserFromRequest(request)?.id ?? null
    const anonId = getAnonIdFromRequest(request)
    if (!userId && !anonId) return NextResponse.json({ success: true }) // nothing to attribute

    logLeadEvent({ userId, anonId, type, campaignId: getCampaignFromRequest(request) })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
