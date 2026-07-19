import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { ANON_COOKIE, ANON_COOKIE_MAX_AGE, getAnonIdFromRequest, newAnonId, logLeadEvent } from '@/lib/homeProjects'
import { getCampaignFromRequest } from '@/lib/campaigns'
import {
  listMeasuredWindows,
  saveMeasuredWindow,
  deleteMeasuredWindow,
  mergeAnonWindowsIntoUser,
} from '@/lib/windowMeasurements'

// Measurement sheet CRUD for /measure-wizard.
//   GET    → list this visitor's saved windows
//   POST   → save a window (body includes id to update an existing card)
//   DELETE → { id }
// Identity = same pair as the Home Project (session user + ad_anon cookie).

interface OwnerCtx {
  userId: string | null
  anonId: string
  setAnon: boolean
}

function resolveOwner(request: Request): OwnerCtx {
  const userId = getUserFromRequest(request)?.id ?? null
  const existing = getAnonIdFromRequest(request)
  return { userId, anonId: existing ?? newAnonId(), setAnon: !existing }
}

function withAnonCookie(res: NextResponse, ctx: OwnerCtx): NextResponse {
  if (ctx.setAnon) {
    res.cookies.set(ANON_COOKIE, ctx.anonId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ANON_COOKIE_MAX_AGE,
      path: '/',
    })
  }
  return res
}

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

async function guarded(request: Request): Promise<NextResponse | OwnerCtx> {
  const ip = getClientIp(request)
  const limit = await rateLimit('measure', ip, { max: 120, windowSeconds: 600 })
  if (!limit.allowed) return bad('Too many requests. Please wait a moment.', 429)
  const ctx = resolveOwner(request)
  if (ctx.userId && !ctx.setAnon) {
    await mergeAnonWindowsIntoUser(ctx.userId, ctx.anonId).catch(() => {})
  }
  return ctx
}

export async function GET(request: Request) {
  try {
    const g = await guarded(request)
    if (g instanceof NextResponse) return g
    const windows = await listMeasuredWindows({ userId: g.userId, anonId: g.anonId })
    return withAnonCookie(NextResponse.json({ success: true, data: { windows } }), g)
  } catch (e) {
    console.error('[measure/windows] GET error:', e)
    return bad('Something went wrong.', 500)
  }
}

export async function POST(request: Request) {
  try {
    const g = await guarded(request)
    if (g instanceof NextResponse) return g
    let body: any
    try {
      body = await request.json()
    } catch {
      return bad('Invalid request body.')
    }
    const row = await saveMeasuredWindow(
      { userId: g.userId, anonId: g.anonId },
      {
        id: body?.id,
        label: body?.label,
        kind: body?.kind,
        product: body?.product,
        config: body?.config,
        dims: body?.dims,
        result: body?.result,
      }
    )
    if (!row) return bad('Could not save this window — check the location name (and the 60-window limit).')
    logLeadEvent({
      userId: g.userId,
      anonId: g.anonId,
      type: 'measure_wizard',
      meta: { source: 'measure_wizard_page', action: body?.id ? 'update' : 'add', product: row.product, label: row.label },
      campaignId: getCampaignFromRequest(request),
    })
    return withAnonCookie(NextResponse.json({ success: true, data: { window: row } }), g)
  } catch (e) {
    console.error('[measure/windows] POST error:', e)
    return bad('Something went wrong.', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const g = await guarded(request)
    if (g instanceof NextResponse) return g
    let body: any
    try {
      body = await request.json()
    } catch {
      return bad('Invalid request body.')
    }
    const ok = await deleteMeasuredWindow({ userId: g.userId, anonId: g.anonId }, String(body?.id || ''))
    if (!ok) return bad('Window not found.', 404)
    return withAnonCookie(NextResponse.json({ success: true }), g)
  } catch (e) {
    console.error('[measure/windows] DELETE error:', e)
    return bad('Something went wrong.', 500)
  }
}

export const dynamic = 'force-dynamic'
