import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import {
  ANON_COOKIE, ANON_COOKIE_MAX_AGE, getAnonIdFromRequest, newAnonId,
  getActiveProject, getOrCreateActiveProject, mergeAnonProjectIntoUser,
  listItems, projectSummary, renameProject, logLeadEvent,
} from '@/lib/homeProjects'

// Home Project (整屋方案) — the visitor's room-by-room plan, built with the AI
// sales consultant and reviewed at /store/project.
//   GET   → current project + items + summary (never creates a project row)
//   PATCH → rename the project (creates it first if needed)
// Identity: signed-in users via the auth cookie; guests via the long-lived
// ad_anon cookie (set here when absent). When a request carries BOTH, the
// guest project is merged into the account (lazy, idempotent).

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

export async function GET(request: Request) {
  try {
    const ctx = resolveOwner(request)
    if (ctx.userId && !ctx.setAnon) {
      await mergeAnonProjectIntoUser(ctx.userId, ctx.anonId).catch(() => {})
    }
    const project = await getActiveProject({ userId: ctx.userId, anonId: ctx.anonId })
    if (!project) {
      return withAnonCookie(
        NextResponse.json({ success: true, data: { project: null, items: [], summary: { itemCount: 0, pricedSubtotal: 0, unpricedCount: 0, rooms: [] } } }),
        ctx
      )
    }
    const items = await listItems(project.id)
    logLeadEvent({ userId: ctx.userId, anonId: ctx.anonId, projectId: project.id, type: 'project_viewed' })
    return withAnonCookie(
      NextResponse.json({
        success: true,
        data: {
          project: { id: project.id, name: project.name, status: project.status },
          items,
          summary: projectSummary(items),
        },
      }),
      ctx
    )
  } catch (e) {
    console.error('[project] GET failed:', e)
    return NextResponse.json({ success: false, error: 'Could not load your project.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit('project_write', ip, { max: 120, windowSeconds: 600 })
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }
    const ctx = resolveOwner(request)
    let body: any
    try { body = await request.json() } catch { body = null }
    const name = String(body?.name ?? '').trim()
    if (!name) return NextResponse.json({ success: false, error: 'name is required.' }, { status: 400 })

    if (ctx.userId && !ctx.setAnon) {
      await mergeAnonProjectIntoUser(ctx.userId, ctx.anonId).catch(() => {})
    }
    const project = await getOrCreateActiveProject({ userId: ctx.userId, anonId: ctx.anonId })
    await renameProject(project.id, name)
    return withAnonCookie(
      NextResponse.json({ success: true, data: { project: { id: project.id, name: name.slice(0, 200), status: project.status } } }),
      ctx
    )
  } catch (e) {
    console.error('[project] PATCH failed:', e)
    return NextResponse.json({ success: false, error: 'Could not update your project.' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
