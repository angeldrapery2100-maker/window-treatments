import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import {
  ANON_COOKIE, ANON_COOKIE_MAX_AGE, getAnonIdFromRequest, newAnonId,
  getActiveProject, getOrCreateActiveProject, mergeAnonProjectIntoUser,
  listItems, projectSummary, upsertItem, updateItemQuantity, removeItem, logLeadEvent,
} from '@/lib/homeProjects'
import { getCampaignFromRequest } from '@/lib/campaigns'

// Home Project items.
//   POST   → add or update an item (server-priced; body = UpsertItemInput shape)
//   PATCH  → change an item's quantity: { item_id, quantity }
//   DELETE → remove an item: { item_id }
// All prices come from the server pricing engine inside upsertItem — this
// route never accepts a client-supplied price.

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
  const limit = await rateLimit('project_write', ip, { max: 120, windowSeconds: 600 })
  if (!limit.allowed) return bad('Too many requests. Please wait a moment.', 429)
  const ctx = resolveOwner(request)
  if (ctx.userId && !ctx.setAnon) {
    await mergeAnonProjectIntoUser(ctx.userId, ctx.anonId).catch(() => {})
  }
  return ctx
}

export async function POST(request: Request) {
  try {
    const g = await guarded(request)
    if (g instanceof NextResponse) return g
    const ctx = g

    let body: any
    try { body = await request.json() } catch { return bad('Invalid request body.') }
    if (!body?.product_id && !body?.productId) return bad('product_id is required.')

    const campaignId = getCampaignFromRequest(request)
    const project = await getOrCreateActiveProject({ userId: ctx.userId, anonId: ctx.anonId }, campaignId)
    let result
    try {
      result = await upsertItem(project.id, {
        itemId: body.item_id ?? body.itemId ?? null,
        roomName: body.room_name ?? body.roomName ?? '',
        productId: body.product_id ?? body.productId,
        width: body.width,
        height: body.height,
        widthFraction: body.width_fraction ?? body.widthFraction ?? null,
        heightFraction: body.height_fraction ?? body.heightFraction ?? null,
        options: body.options ?? null,
        quantity: body.quantity,
        notes: body.notes ?? null,
      })
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg === 'product_not_found' || msg === 'invalid_product_id') return bad('Product not found.', 404)
      if (msg === 'item_not_found') return bad('Item not found.', 404)
      throw e
    }

    logLeadEvent({
      userId: ctx.userId, anonId: ctx.anonId, projectId: project.id,
      type: 'project_item_added',
      value: result.item.quoted_price != null ? Number(result.item.quoted_price) : null,
      meta: { product_id: result.item.product_id, room: result.item.room_name },
      campaignId,
    })

    const items = await listItems(project.id)
    return withAnonCookie(
      NextResponse.json({ success: true, data: { item: result.item, summary: projectSummary(items) } }),
      ctx
    )
  } catch (e) {
    console.error('[project/items] POST failed:', e)
    return bad('Could not save the item.', 500)
  }
}

export async function PATCH(request: Request) {
  try {
    const g = await guarded(request)
    if (g instanceof NextResponse) return g
    const ctx = g

    let body: any
    try { body = await request.json() } catch { return bad('Invalid request body.') }
    const itemId = String(body?.item_id ?? body?.itemId ?? '')
    const quantity = Number(body?.quantity)
    if (!itemId || !Number.isFinite(quantity)) return bad('item_id and quantity are required.')

    const project = await getActiveProject({ userId: ctx.userId, anonId: ctx.anonId })
    if (!project) return bad('No project found.', 404)
    const item = await updateItemQuantity(project.id, itemId, quantity)
    if (!item) return bad('Item not found.', 404)

    const items = await listItems(project.id)
    return withAnonCookie(
      NextResponse.json({ success: true, data: { item, summary: projectSummary(items) } }),
      ctx
    )
  } catch (e) {
    console.error('[project/items] PATCH failed:', e)
    return bad('Could not update the item.', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const g = await guarded(request)
    if (g instanceof NextResponse) return g
    const ctx = g

    let body: any
    try { body = await request.json() } catch { body = null }
    const itemId = String(body?.item_id ?? body?.itemId ?? new URL(request.url).searchParams.get('id') ?? '')
    if (!itemId) return bad('item_id is required.')

    const project = await getActiveProject({ userId: ctx.userId, anonId: ctx.anonId })
    if (!project) return bad('No project found.', 404)
    const removed = await removeItem(project.id, itemId)
    if (!removed) return bad('Item not found.', 404)

    logLeadEvent({ userId: ctx.userId, anonId: ctx.anonId, projectId: project.id, type: 'project_item_removed', meta: { item_id: itemId } })

    const items = await listItems(project.id)
    return withAnonCookie(
      NextResponse.json({ success: true, data: { summary: projectSummary(items) } }),
      ctx
    )
  } catch (e) {
    console.error('[project/items] DELETE failed:', e)
    return bad('Could not remove the item.', 500)
  }
}

export const dynamic = 'force-dynamic'
