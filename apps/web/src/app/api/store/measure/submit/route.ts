import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { getAnonIdFromRequest, logLeadEvent } from '@/lib/homeProjects'
import { getCampaignFromRequest } from '@/lib/campaigns'
import { listMeasuredWindows } from '@/lib/windowMeasurements'
import { submitMeasureSheet } from '@/lib/aappMeasureBridge'

// POST /api/store/measure/submit  { token, contact, language }
// Sends THIS visitor's saved measurement sheet back to AAPP as a
// customer-self-measured sheet (labelled 客户自测 on the client profile).
// The windows are read server-side from the same identity the sheet CRUD
// uses (session user + ad_anon cookie) — we never trust a window list
// posted by the browser.

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit('measure-submit', ip, { max: 20, windowSeconds: 600 })
    if (!limit.allowed) return bad('Too many requests. Please wait a moment.', 429)

    let body: any
    try {
      body = await request.json()
    } catch {
      return bad('Invalid request body.')
    }
    const token = String(body?.token || '').trim()
    if (!token || token.length > 200) return bad('token required')
    const language = body?.language === 'zh' ? 'zh' : 'en'
    const cIn = body?.contact && typeof body.contact === 'object' ? body.contact : {}
    const contact = {
      name: String(cIn.name || '').slice(0, 120),
      phone: String(cIn.phone || '').slice(0, 40),
      email: String(cIn.email || '').slice(0, 120),
      address: String(cIn.address || '').slice(0, 240),
    }

    const userId = getUserFromRequest(request)?.id ?? null
    const anonId = getAnonIdFromRequest(request)
    if (!userId && !anonId) return bad('Your sheet is empty — add a window first.')
    const rows = await listMeasuredWindows({ userId, anonId: anonId ?? null })
    if (!rows.length) return bad('Your sheet is empty — add a window first.')

    const windows = rows.map((r) => ({
      label: r.label,
      kind: r.kind,
      product: r.product,
      config: r.config,
      dims: r.dims,
      result: r.result,
    }))

    const out = await submitMeasureSheet(token, contact, windows, language)
    if (!out.ok) return bad(out.error || 'Could not submit — please try again.', 502)

    logLeadEvent({
      userId,
      anonId: anonId ?? null,
      type: 'measure_wizard',
      meta: { source: 'measure_wizard_page', action: 'submit_to_aapp', windows: windows.length },
      campaignId: getCampaignFromRequest(request),
    })
    return NextResponse.json({ success: true, data: { windows: windows.length, resubmit: out.resubmit === true } })
  } catch (e) {
    console.error('[measure/submit] error:', e)
    return bad('Something went wrong.', 500)
  }
}
