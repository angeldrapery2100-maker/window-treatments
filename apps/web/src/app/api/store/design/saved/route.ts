import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { ANON_COOKIE, ANON_COOKIE_MAX_AGE, getAnonIdFromRequest, newAnonId, logLeadEvent } from '@/lib/homeProjects'
import { deleteSavedDesign, listSavedDesigns, mergeAnonDesignsIntoUser, saveDesign } from '@/lib/savedDesigns'
import { errorResponse } from '@/lib/apiError'

// Saved drapery designs from /design.
//   GET    → this visitor's designs
//   POST   → create or update one (body.id to update)
//   DELETE → { id }
// Identity = the same pair as the measurement sheet: session user + ad_anon.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface OwnerCtx { userId: string | null; anonId: string; setAnon: boolean }

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

export async function GET(request: Request) {
  try {
    const ctx = resolveOwner(request)
    // Signing in adopts anything designed beforehand — same as the
    // measurement sheet and the Home Project.
    if (ctx.userId) await mergeAnonDesignsIntoUser(ctx.userId, ctx.anonId).catch(() => {})
    const designs = await listSavedDesigns({ userId: ctx.userId, anonId: ctx.anonId })
    return withAnonCookie(NextResponse.json({ success: true, data: { designs } }), ctx)
  } catch (err) {
    return errorResponse('Could not load your saved designs.', 500, err)
  }
}

export async function POST(request: Request) {
  try {
    const ctx = resolveOwner(request)
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return errorResponse('Invalid request.', 400)
    if (!body.config || typeof body.config !== 'object') return errorResponse('Nothing to save.', 400)

    const row = await saveDesign({ userId: ctx.userId, anonId: ctx.anonId }, {
      id: typeof body.id === 'string' ? body.id : null,
      label: String(body.label || ''),
      windowId: typeof body.windowId === 'string' ? body.windowId : null,
      config: body.config,
      summary: (body.summary && typeof body.summary === 'object') ? body.summary : {},
      estimate: (body.estimate && typeof body.estimate === 'object') ? body.estimate : null,
    })
    if (!row) {
      return errorResponse(
        typeof body.id === 'string'
          ? 'That design is no longer saved.'
          : 'You have saved as many designs as we hold — delete one to add another.',
        typeof body.id === 'string' ? 404 : 409
      )
    }

    // Only a NEW design is a fresh signal; re-saving the same window while
    // fiddling with the lining should not keep bumping the lead score.
    if (!body.id) {
      await logLeadEvent({
        userId: ctx.userId, anonId: ctx.anonId, type: 'design_saved',
        value: typeof body?.estimate?.total?.low === 'number' ? body.estimate.total.low : null,
        meta: { designId: row.id, label: row.label },
      })
    }
    return withAnonCookie(NextResponse.json({ success: true, data: { design: row } }), ctx)
  } catch (err) {
    return errorResponse('Could not save that design.', 500, err)
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = resolveOwner(request)
    const body = await request.json().catch(() => null)
    const id = String(body?.id || '')
    if (!id) return errorResponse('Which design?', 400)
    const ok = await deleteSavedDesign({ userId: ctx.userId, anonId: ctx.anonId }, id)
    return withAnonCookie(NextResponse.json({ success: ok }), ctx)
  } catch (err) {
    return errorResponse('Could not delete that design.', 500, err)
  }
}
