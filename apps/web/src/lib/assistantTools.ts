// Order-service tools the AI assistant can call (server-side only).
//
// SECURITY MODEL: the assistant runs a tool-use loop entirely on the server;
// tool results never leave the server, and every state-changing call
// (submit_service_request) RE-VERIFIES ownership from scratch — a logged-in
// user via their session id, a guest via order number + shipping ZIP. Nothing
// trusts a prior "verified" result. Guest verification returns a GENERIC
// failure (never revealing whether the order number or the ZIP was wrong) so
// the endpoint can't be used to enumerate orders.

import { query, queryOne } from '@/lib/db'
import {
  ensureSupportTable,
  isWithinChangeWindow,
  TICKET_CATEGORIES,
  TICKET_TYPES,
  type TicketCategory,
  type TicketType,
} from '@/lib/supportTickets'
import { Resend } from 'resend'
import { escapeHtml, safeUrl } from '@/lib/html'
import { submitWebsiteInquiry } from '@/lib/aappIntake'
import {
  getActiveProject, getOrCreateActiveProject, mergeAnonProjectIntoUser,
  listItems, projectSummary, upsertItem, removeItem, logLeadEvent,
  type ProjectItemRow,
} from '@/lib/homeProjects'
import { getLeadScoreForOwner } from '@/lib/leadScoring'
import { hdEstimate } from '@/lib/hdPricing'

const ORDER_NUMBER_RE = /^AD[0-9]{6}-[A-Z0-9]{4}$/

let _resend: Resend | null = null
const getResend = () => (_resend ??= new Resend(process.env.RESEND_API_KEY))
const ADMIN_TO = () => process.env.ORDER_NOTIFY_EMAIL || 'admin@angel-drapery.com'
const FROM = () => process.env.EMAIL_FROM || 'Angel Drapery <onboarding@resend.dev>'
const SITE_URL = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://angel-drapery.com').replace(/\/$/, '')

// ── Pure helpers (unit-tested) ──────────────────────────────────────────────

/** US ZIP → digits only, first 5. Tolerates "91780-1234", " 91780 ", etc. */
export function normalizeZip(v: unknown): string {
  return String(v ?? '').replace(/\D/g, '').slice(0, 5)
}

export function isValidOrderNumber(v: unknown): boolean {
  return ORDER_NUMBER_RE.test(String(v ?? '').trim().toUpperCase())
}

/** Short human summary of an order's items for the model, e.g. "2× Custom Drapery, 1× Roller Shade". */
export function summarizeItems(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return '—'
  const parts = items.slice(0, 8).map((it: any) => {
    const qty = Number(it?.quantity) || 1
    const name = String(it?.productName || it?.productType || 'item')
    return `${qty}× ${name}`
  })
  return parts.join(', ')
}

interface OrderSummary {
  order_number: string
  status: string
  placed: string          // ISO date
  within_change_window: boolean
  items: string
}

function toSummary(o: any): OrderSummary {
  return {
    order_number: o.order_number,
    status: o.status,
    placed: new Date(o.created_at).toISOString(),
    within_change_window: isWithinChangeWindow(o.created_at),
    items: summarizeItems(o.items),
  }
}

// ── Tool: lookup_my_orders (logged-in) ──────────────────────────────────────

export async function lookupMyOrders(userId: string): Promise<{ orders: OrderSummary[] }> {
  if (!userId) return { orders: [] }
  const rows = await query<any>(
    `SELECT order_number, status, created_at, items
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [userId]
  ).catch(() => [])
  return { orders: rows.map(toSummary) }
}

// ── Tool: verify_guest_order (not logged in) ────────────────────────────────

export async function verifyGuestOrder(
  orderNumber: unknown,
  zip: unknown
): Promise<{ verified: boolean; order?: OrderSummary }> {
  const on = String(orderNumber ?? '').trim().toUpperCase()
  const z = normalizeZip(zip)
  // Generic failure for any bad input — never reveal which part failed.
  if (!ORDER_NUMBER_RE.test(on) || z.length < 5) return { verified: false }
  const order = await queryOne<any>(
    `SELECT order_number, status, created_at, items, shipping_address
       FROM orders WHERE order_number = $1`,
    [on]
  ).catch(() => null)
  if (!order) return { verified: false }
  const orderZip = normalizeZip(order.shipping_address?.zip)
  if (!orderZip || orderZip !== z) return { verified: false }
  return { verified: true, order: toSummary(order) }
}

// ── Tool: submit_service_request (writes a ticket) ──────────────────────────

export interface SubmitParams {
  userId?: string | null
  orderNumber: unknown
  zip?: unknown
  ticketType: unknown
  category?: unknown
  message: unknown
  requestedChanges?: Record<string, unknown> | null
}

export interface SubmitResult {
  ok: boolean
  error?: string
  ticketId?: string
  ticketType?: TicketType
  windowOk?: boolean
  // Machine hint for the model about how to phrase the reply to the customer.
  outcome?: 'submitted' | 'escalated_past_window'
}

export async function submitServiceRequest(params: SubmitParams): Promise<SubmitResult> {
  const on = String(params.orderNumber ?? '').trim().toUpperCase()
  if (!ORDER_NUMBER_RE.test(on)) return { ok: false, error: 'invalid_order_number' }

  const ticketType = params.ticketType as TicketType
  if (!TICKET_TYPES.includes(ticketType)) return { ok: false, error: 'invalid_ticket_type' }

  const message = String(params.message ?? '').trim()
  if (message.length < 3 || message.length > 4000) return { ok: false, error: 'invalid_message' }

  // Load the order and RE-VERIFY ownership (never trust prior tool results).
  const order = await queryOne<any>(
    `SELECT id, order_number, user_id, customer_name, customer_email, created_at, shipping_address
       FROM orders WHERE order_number = $1`,
    [on]
  ).catch(() => null)
  if (!order) return { ok: false, error: 'not_authorized' }

  const ownsViaSession = !!params.userId && String(order.user_id) === String(params.userId)
  const zip = normalizeZip(params.zip)
  const ownsViaZip = zip.length >= 5 && normalizeZip(order.shipping_address?.zip) === zip
  if (!ownsViaSession && !ownsViaZip) return { ok: false, error: 'not_authorized' }

  // Category only meaningful for after_sales; validate/normalize.
  let category: TicketCategory = 'other'
  if (ticketType === 'after_sales') {
    const c = String(params.category ?? 'other') as TicketCategory
    category = TICKET_CATEGORIES.includes(c) ? c : 'other'
  }

  // 48-hour window applies to change / cancel. Past window: still record the
  // request (window_ok=false) so a human picks it up — never silently drop.
  let windowOk: boolean | null = null
  let outcome: SubmitResult['outcome'] = 'submitted'
  if (ticketType === 'order_change' || ticketType === 'order_cancel') {
    windowOk = isWithinChangeWindow(order.created_at)
    if (!windowOk) outcome = 'escalated_past_window'
  }

  const requestedChanges =
    ticketType === 'order_change' && params.requestedChanges && typeof params.requestedChanges === 'object'
      ? JSON.stringify(params.requestedChanges)
      : null

  await ensureSupportTable()
  const ticket = await queryOne<{ id: string }>(
    `INSERT INTO support_tickets
       (order_id, order_number, customer_name, customer_email, category, message,
        source, ticket_type, requested_changes, window_ok)
     VALUES ($1,$2,$3,$4,$5,$6,'ai_assistant',$7,$8::jsonb,$9)
     RETURNING id`,
    [
      order.id, order.order_number, order.customer_name || '', order.customer_email,
      category, message, ticketType, requestedChanges, windowOk,
    ]
  )

  // Notify the merchant (best-effort, never blocks the tool result).
  notifyMerchant(order, ticketType, message, requestedChanges, windowOk).catch(() => {})

  return { ok: true, ticketId: ticket?.id, ticketType, windowOk: windowOk ?? undefined, outcome }
}

const TYPE_EMAIL_LABEL: Record<TicketType, string> = {
  after_sales: 'After-sales request',
  order_change: 'Order change request',
  order_cancel: 'Order cancellation request',
}

async function notifyMerchant(
  order: any,
  ticketType: TicketType,
  message: string,
  requestedChangesJson: string | null,
  windowOk: boolean | null
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const label = TYPE_EMAIL_LABEL[ticketType]
  const windowNote = windowOk === false ? ' — PAST 48h WINDOW (needs human review)' : ''
  const changesRow = requestedChangesJson
    ? `<div style="background:#eef4ff;border-radius:8px;padding:12px 16px;margin:10px 0;font-size:13px;color:#333;"><strong>Requested changes:</strong><br>${escapeHtml(requestedChangesJson)}</div>`
    : ''
  const adminUrl = safeUrl(`${SITE_URL()}/admin/support?source=ai_assistant`)
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="color:#222;">🤖 AI assistant — ${escapeHtml(label)}${escapeHtml(windowNote)}</h2>
    <p style="font-size:14px;color:#555;margin:4px 0;">Order <strong>${escapeHtml(order.order_number)}</strong> · ${escapeHtml(order.customer_name || order.customer_email)}</p>
    <div style="background:#f7f7f7;border-radius:8px;padding:14px 18px;margin:12px 0;font-size:14px;color:#333;white-space:pre-wrap;">${escapeHtml(message)}</div>
    ${changesRow}
    <p style="margin-top:16px;"><a href="${adminUrl}" style="display:inline-block;background:#3d3d3d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;letter-spacing:1px;">OPEN AI QUEUE</a></p>
  </div>`
  await getResend().emails.send({
    from: FROM(),
    to: ADMIN_TO(),
    subject: `🤖 AI assistant — ${label} — order ${order.order_number}${windowOk === false ? ' (past window)' : ''}`,
    html,
  })
}

// ── Home Project tools (AI sales consultant) ────────────────────────────────
// A guest is identified by the ad_anon cookie id (anonId), a signed-in
// customer by their session userId — both come from the REQUEST, never from
// the model. Prices in the returned views come exclusively from the server
// pricing engine (homeProjects.upsertItem → computeServerUnitPrice); the
// model is instructed to quote ONLY numbers these tools return.

interface ProjectOwnerCtx {
  userId: string | null
  anonId: string | null
  /** ad_campaign cookie slug (request-derived) — attribution for lead events. */
  campaignId?: string | null
}

async function resolveProjectOwner(ctx: ProjectOwnerCtx): Promise<ProjectOwnerCtx> {
  if (ctx.userId && ctx.anonId) {
    await mergeAnonProjectIntoUser(ctx.userId, ctx.anonId).catch(() => {})
  }
  return ctx
}

function itemToolView(it: ProjectItemRow) {
  const price = it.quoted_price != null ? Number(it.quoted_price) : null
  const size = [
    it.width != null ? `W ${Number(it.width)}${it.width_fraction ? ` ${it.width_fraction}` : ''}"` : null,
    it.height != null ? `H ${Number(it.height)}${it.height_fraction ? ` ${it.height_fraction}` : ''}"` : null,
  ].filter(Boolean).join(' × ')
  return {
    item_id: it.id,
    room: it.room_name || '(no room)',
    product_id: it.product_id,
    product: it.product_name,
    type: it.product_type,
    size: size || null,
    options: (it.options_display || []).map(o => `${o.displayLabel}: ${o.valueLabel}`).join(', ') || null,
    quantity: Number(it.quantity) || 1,
    unit_price: price != null && Number.isFinite(price) && price > 0 ? price : null,
    line_total: price != null && Number.isFinite(price) && price > 0 ? Math.round(price * (Number(it.quantity) || 1)) : null,
    price_error: it.quote_error || undefined,
    notes: it.notes || undefined,
  }
}

// Big-project handoff thresholds (Eddie 2026-07-19): once a plan reaches this
// size the assistant should proactively steer toward the free in-home
// consultation (prompt rule "BIG-PROJECT HANDOFF").
const HANDOFF_SUBTOTAL = 5000
const HANDOFF_ITEM_COUNT = 10

function projectToolView(projectName: string, items: ProjectItemRow[]) {
  const s = projectSummary(items)
  const totalUnits = items.reduce((n, it) => n + (Number(it.quantity) || 1), 0)
  const suggest = s.pricedSubtotal >= HANDOFF_SUBTOTAL || totalUnits >= HANDOFF_ITEM_COUNT
  return {
    project: {
      name: projectName,
      items: items.map(itemToolView),
      item_count: s.itemCount,
      total_units: totalUnits,
      priced_subtotal: s.pricedSubtotal,
      unpriced_item_count: s.unpricedCount,
      review_page: '/store/project',
    },
    handoff: {
      suggest_consultation: suggest,
      ...(suggest
        ? { reason: `Project is ${s.pricedSubtotal >= HANDOFF_SUBTOTAL ? `$${s.pricedSubtotal.toLocaleString()} (≥ $${HANDOFF_SUBTOTAL.toLocaleString()})` : `${totalUnits} units (≥ ${HANDOFF_ITEM_COUNT})`} — recommend the free in-home consultation (rule 9).` }
        : {}),
    },
  }
}

export async function getHomeProjectTool(ctx: ProjectOwnerCtx): Promise<unknown> {
  const owner = await resolveProjectOwner(ctx)
  if (!owner.userId && !owner.anonId) return { project: null, note: 'No visitor identity on this request.' }
  const project = await getActiveProject({ userId: owner.userId, anonId: owner.anonId })
  if (!project) {
    return { project: null, note: 'No home project yet — create one by saving the first room item with upsert_room_item.' }
  }
  const items = await listItems(project.id)
  return projectToolView(project.name, items)
}

export async function upsertRoomItemTool(ctx: ProjectOwnerCtx, input: any): Promise<unknown> {
  const owner = await resolveProjectOwner(ctx)
  if (!owner.userId && !owner.anonId) return { error: 'no_visitor_identity' }
  const project = await getOrCreateActiveProject({ userId: owner.userId, anonId: owner.anonId }, owner.campaignId ?? null)

  let result
  try {
    result = await upsertItem(project.id, {
      itemId: typeof input?.item_id === 'string' ? input.item_id : null,
      roomName: input?.room,
      productId: input?.product_id,
      width: input?.width_in,
      height: input?.height_in,
      options: input?.options && typeof input.options === 'object' ? input.options : null,
      quantity: input?.quantity,
      notes: input?.notes,
    })
  } catch (e: any) {
    const msg = String(e?.message || '')
    if (msg === 'product_not_found' || msg === 'invalid_product_id') {
      return { error: 'product_not_found', note: 'Use list_store_products to get a valid product_id.' }
    }
    if (msg === 'item_not_found') return { error: 'item_not_found' }
    throw e
  }

  logLeadEvent({
    userId: owner.userId, anonId: owner.anonId, projectId: project.id,
    type: 'project_item_added',
    value: result.item.quoted_price != null ? Number(result.item.quoted_price) : null,
    meta: { product_id: result.item.product_id, room: result.item.room_name, via: 'assistant' },
    campaignId: owner.campaignId ?? null,
  })

  const items = await listItems(project.id)
  const s = projectSummary(items)
  return {
    saved: true,
    item: itemToolView(result.item),
    project_priced_subtotal: s.pricedSubtotal,
    project_item_count: s.itemCount,
    review_page: '/store/project',
    ...(result.priced
      ? {}
      : { note: 'This item could not be auto-priced — tell the customer a person will confirm its price. Do NOT guess a number.' }),
  }
}

export async function removeRoomItemTool(ctx: ProjectOwnerCtx, input: any): Promise<unknown> {
  const owner = await resolveProjectOwner(ctx)
  if (!owner.userId && !owner.anonId) return { error: 'no_visitor_identity' }
  const project = await getActiveProject({ userId: owner.userId, anonId: owner.anonId })
  if (!project) return { error: 'no_project' }
  const itemId = String(input?.item_id ?? '')
  if (!itemId) return { error: 'item_id_required' }
  const removed = await removeItem(project.id, itemId)
  if (!removed) return { error: 'item_not_found' }
  logLeadEvent({ userId: owner.userId, anonId: owner.anonId, projectId: project.id, type: 'project_item_removed', meta: { item_id: itemId, via: 'assistant' }, campaignId: owner.campaignId ?? null })
  const items = await listItems(project.id)
  const s = projectSummary(items)
  return { removed: true, project_item_count: s.itemCount, project_priced_subtotal: s.pricedSubtotal }
}

export async function listStoreProductsTool(input: any): Promise<unknown> {
  const typeFilter = typeof input?.type === 'string' && input.type ? input.type : null
  const rows = await query<any>(
    `SELECT p.id, p.name, pt.slug AS type, sc.name AS category
       FROM products p
       JOIN product_types pt ON pt.id = p.product_type_id
       LEFT JOIN store_categories sc ON sc.id = p.store_category_id
      WHERE p.is_active = true ${typeFilter ? 'AND pt.slug = $1' : ''}
      ORDER BY pt.slug, p.name
      LIMIT 100`,
    typeFilter ? [typeFilter] : []
  ).catch(() => [])
  return {
    products: rows.map(r => ({ product_id: r.id, name: r.name, type: r.type, category: r.category || undefined })),
    note: 'Prices depend on size and options — use upsert_room_item (or the product page configurator) to get an exact price. Never estimate.',
  }
}

export async function getProductOptionsTool(input: any): Promise<unknown> {
  const productId = String(input?.product_id ?? '').trim()
  if (!/^[0-9a-f-]{36}$/i.test(productId)) return { error: 'invalid_product_id' }
  const row = await queryOne<{ name: string; default_config: any; type: string }>(
    `SELECT p.name, p.default_config, pt.slug AS type
       FROM products p JOIN product_types pt ON pt.id = p.product_type_id
      WHERE p.id = $1 AND p.is_active = true`,
    [productId]
  ).catch(() => null)
  if (!row) return { error: 'product_not_found' }

  const cfg = row.default_config || {}
  const options = (cfg.options || [])
    .filter((o: any) => o?.name && Array.isArray(o?.values) && o.values.length > 0)
    .map((o: any) => ({
      name: String(o.name),
      label: String(o.label || o.name),
      values: o.values.slice(0, 60).map((v: any) => ({ value: String(v?.value ?? ''), label: String(v?.label ?? v?.value ?? '') })),
    }))

  const dims =
    row.type === 'accessory' ? 'none'
    : row.type === 'hardware' ? 'width_in only (rod/track length in inches)'
    : 'width_in and height_in (inches; finished size)'

  return { product_id: productId, name: row.name, type: row.type, required_dimensions: dims, options }
}

// ── AI Sales Summary (handoff enrichment, P2) ────────────────────────────────
// When the assistant registers a lead (submit_website_inquiry), we append a
// compact summary of the visitor's Home Project + engagement score to the
// inquiry message. It travels through the EXISTING AAPP websiteInquiry channel
// (lands in the customer's profile notes) — no AAPP-side change required, and
// the salesperson calls back already knowing rooms, sizes, and budget signals.

export async function buildAiSalesSummary(ctx: ProjectOwnerCtx): Promise<string> {
  try {
    const owner = await resolveProjectOwner(ctx)
    if (!owner.userId && !owner.anonId) return ''
    const [project, lead] = await Promise.all([
      getActiveProject({ userId: owner.userId, anonId: owner.anonId }),
      getLeadScoreForOwner(owner.userId ?? null, owner.anonId ?? null),
    ])

    const lines: string[] = ['', '--- AI Sales Summary ---']
    if (project) {
      const items = await listItems(project.id)
      if (items.length > 0) {
        const s = projectSummary(items)
        lines.push(
          `Home Project "${project.name}": ${s.itemCount} item(s) in ${s.rooms.length || 1} room(s), priced subtotal $${s.pricedSubtotal.toLocaleString()}` +
          (s.unpricedCount > 0 ? ` (+${s.unpricedCount} unpriced)` : '')
        )
        for (const it of items.slice(0, 12)) {
          const v = itemToolView(it)
          lines.push(
            `- ${v.room}: ${v.product}${v.size ? ` ${v.size}` : ''}${v.options ? ` (${v.options})` : ''} ×${v.quantity}` +
            (v.line_total != null ? ` — $${v.line_total.toLocaleString()}` : ' — price pending')
          )
        }
        if (items.length > 12) lines.push(`… and ${items.length - 12} more item(s)`)
      }
    }
    if (lead.eventCount > 0) {
      lines.push(`Engagement: score ${lead.score} (${lead.tier}), ${lead.eventCount} tracked action(s) in 90 days`)
    }
    // Recent Hunter Douglas reference estimates the AI gave this visitor —
    // the salesperson should know what was already discussed.
    const hdEvents = await query<{ meta: any }>(
      `SELECT meta FROM lead_events
        WHERE type = 'hd_estimate'
          AND ((($1::uuid IS NOT NULL) AND user_id = $1::uuid) OR (($2::text IS NOT NULL) AND anon_id = $2))
        ORDER BY created_at DESC LIMIT 4`,
      [owner.userId ?? null, owner.anonId ?? null]
    ).catch(() => [])
    for (const ev of hdEvents) {
      const m = ev.meta || {}
      if (!m.series) continue
      lines.push(
        `HD estimate given: ${m.series}${m.width && m.height ? ` ${m.width}×${m.height}"` : ''}` +
        (m.low && m.high ? ` — reference $${m.low}–$${m.high}` : ' — needs human quote')
      )
    }
    if (ctx.campaignId) lines.push(`Campaign: ${ctx.campaignId}`)
    // Nothing worth sending? Return empty so the message stays untouched.
    return lines.length > 2 ? lines.join('\n').slice(0, 2500) : ''
  } catch {
    return ''
  }
}

// ── Anthropic tool schemas ──────────────────────────────────────────────────

export const ASSISTANT_TOOLS = [
  {
    name: 'lookup_my_orders',
    description:
      "List the SIGNED-IN customer's recent orders (order number, status, date, whether still within the 48-hour change/cancel window). Use when a logged-in customer asks about their orders or wants to change/cancel one — you do NOT need to ask for an order number. Returns an empty list if the customer is not signed in.",
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'verify_guest_order',
    description:
      'Verify a NOT-signed-in customer owns an order, using the order number and the shipping ZIP code. Returns the order summary if it matches, or a generic failure (never reveals which field was wrong). Ask the customer for both, then call this before helping a guest with a specific order.',
    input_schema: {
      type: 'object' as const,
      properties: {
        order_number: { type: 'string', description: 'Order number, format AD######-XXXX' },
        zip: { type: 'string', description: 'Shipping ZIP / postal code on the order' },
      },
      required: ['order_number', 'zip'],
    },
  },
  {
    name: 'submit_service_request',
    description:
      'Create an after-sales, change, or cancel request ticket for an ONLINE-STORE order (one placed through this website with an AD######-XXXX number). The server re-verifies ownership and the 48-hour window. For a cancellation a HUMAN confirms and issues the refund — never promise an instant or exact refund amount. Only call this AFTER the customer has explicitly confirmed the action.',
    input_schema: {
      type: 'object' as const,
      properties: {
        order_number: { type: 'string', description: 'The order to act on (AD######-XXXX).' },
        zip: { type: 'string', description: 'Shipping ZIP — REQUIRED for guests (not signed in); ignored for signed-in customers.' },
        ticket_type: { type: 'string', enum: [...TICKET_TYPES], description: 'after_sales (post-delivery issue), order_change, or order_cancel.' },
        category: { type: 'string', enum: [...TICKET_CATEGORIES], description: 'Issue type — only for after_sales.' },
        message: { type: 'string', description: "The customer's request in their own words." },
        requested_changes: { type: 'object', description: 'For order_change only: the fields to change, e.g. {"width":42,"color":"natural"}.' },
      },
      required: ['order_number', 'ticket_type', 'message'],
    },
  },
  {
    name: 'submit_website_inquiry',
    description:
      "Register a NEW sales/consultation lead (NOT an existing online-store order). Use for visitors who want a free in-home measure, a design consultation, a photo quote, to visit the Temple City showroom, to discuss a whole-home project or a premium brand line (Hunter Douglas / Sundance / Lutron), or a repair of items NOT bought through the online store. The backend creates the customer profile, assigns a salesperson, and returns a booking link. Collect the customer's NAME and PHONE first, and ask whether they consent to a text message before setting sms_consent=true. Call this AT MOST ONCE per conversation.",
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: "Customer's name (required)." },
        phone: { type: 'string', description: 'Customer phone — needed to text the booking link.' },
        email: { type: 'string', description: 'Customer email (optional).' },
        address: { type: 'string', description: 'City or address (ask when they want an in-home visit).' },
        message: { type: 'string', description: 'Short summary of what the customer wants (goes into their profile notes).' },
        product_type: { type: 'string', description: 'Optional product interest, e.g. "Motorized Shades".' },
        intent: { type: 'string', enum: ['triage', 'repair'], description: '"triage" for a new sales/consultation lead (default), "repair" for a repair request.' },
        sms_consent: { type: 'boolean', description: 'True ONLY if the customer explicitly agreed to receive a text message.' },
      },
      required: ['name'],
    },
  },
  {
    name: 'quote_store_product',
    description:
      "Get the REAL price of an online-store product (Luma shades, drapery, hardware) for a given size and options — computed by the SAME server pricing engine as checkout, without saving anything. Use this whenever a customer asks what a store product costs: get product_id from list_store_products and valid option values from get_product_options first. Present the result softly ('大约 $X' / 'around $X') and mention the product page configurator shows it live. If it returns an error, that configuration needs the page configurator or a person — do NOT guess.",
    input_schema: {
      type: 'object' as const,
      properties: {
        product_id: { type: 'string', description: 'Product id from list_store_products.' },
        width_in: { type: 'number', description: 'Width in inches.' },
        height_in: { type: 'number', description: 'Height in inches (omit for hardware/accessory).' },
        options: { type: 'object', description: 'Option selections {option_name: value} using EXACT values from get_product_options.' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'get_hd_estimate',
    description:
      "Get a Hunter Douglas REFERENCE PRICE RANGE (list-price based, computed by our internal HD pricing engine — never estimate HD prices yourself). Call with NO arguments first to get the list of available series (Duette, Silhouette, Vignette, Pirouette, Luminette, Designer Roller, shutters, wood blinds, …). Then collect the window size in INCHES and call again with series + width_in + height_in (+ fabric_code if the customer knows it, + operating_system e.g. 'powerview' for motorized). Present the returned range as a REFERENCE ONLY: the final price always comes from our salesperson after a free in-home measure — say that every time, then offer to book the consultation. If the result has needs_human=true or warnings, tell the customer that part needs a person to quote.",
    input_schema: {
      type: 'object' as const,
      properties: {
        series: { type: 'string', description: "HD series name, e.g. 'duette', 'silhouette', 'vignette', 'designer roller'. Omit to get the full series list." },
        sub_product: { type: 'string', description: 'Sub-product where the series has them (e.g. vignette/provenance styles).' },
        fabric_code: { type: 'string', description: 'HD fabric/chart code if the customer knows it (optional).' },
        width_in: { type: 'number', description: 'Window width in inches.' },
        height_in: { type: 'number', description: 'Window height in inches.' },
        operating_system: { type: 'string', description: "Operating system, e.g. 'powerview' (motorized), 'ultraglide', 'literise'. Optional." },
      },
    },
  },
  {
    name: 'list_measured_windows',
    description:
      "Read the customer's saved measurement sheet from the /measure-wizard page (their windows: location, product type, frame depth, mount type, dimensions in inches with A=left/B=right/C=top/D=bottom wall clearances, and the computed recommendation or reference price). Call this FIRST whenever a customer mentions having measured windows, asks about 'my windows/my sheet', or when starting any sizing/quoting conversation — if the sheet has entries you can skip re-collecting measurements. Works for guests too (tied to their browser).",
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'save_measured_window',
    description:
      "Save (or update, by passing id) a window on the customer's measurement sheet — the same sheet as the /measure-wizard page. Use this when the customer gives you measurements in chat OR sends a PHOTO of a measurement note/sketch: extract the numbers, CONFIRM them back to the customer first ('客厅窗 60×84,对吗?'), then save. Always collect a location name. Inches only. After saving, tell them it's on their sheet and they can see/edit it at /measure-wizard.",
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Existing window id from list_measured_windows — ONLY when updating.' },
        location: { type: 'string', description: 'Room/position name, e.g. "Living Room — left window".' },
        opening: { type: 'string', description: "'window' (default) or 'sliding_door'." },
        product: { type: 'string', description: "Planned treatment: 'drapery' | 'shades' | 'shutters'. Default 'drapery' if undecided." },
        width_in: { type: 'number', description: 'Width in inches.' },
        height_in: { type: 'number', description: 'Height in inches.' },
        clear_left_in: { type: 'number', description: 'A — wall space left of the window (optional).' },
        clear_right_in: { type: 'number', description: 'B — wall space right (optional).' },
        clear_top_in: { type: 'number', description: 'C — window top → ceiling (optional).' },
        clear_bottom_in: { type: 'number', description: 'D — window bottom → floor (optional).' },
        wall_height_in: { type: 'number', description: 'Floor-to-ceiling height (optional).' },
        depth_choice: { type: 'string', description: "Shades/shutters frame depth choice: 'deep' | 'mid' | 'shallow' (optional)." },
        mount: { type: 'string', description: "'inside' | 'inside_z' | 'outside' (optional)." },
        notes: { type: 'string', description: 'Anything else the customer mentioned (optional).' },
      },
      required: ['location', 'width_in', 'height_in'],
    },
  },
  {
    name: 'get_product_specs',
    description:
      "Get LIVE product specifications (no prices) from our catalog: 'shades' = Luma variant size limits, cassette styles, available options; 'motors' = motorization system components (motors, remotes with channel counts, accessories); 'drapery' = lining tiers and pleat styles; 'shutters' = materials, louver sizes, panel and depth rules; 'hardware' = drapery rod/track thickness, finished-height formulas, mount rules. Use this for spec questions like 'how wide can a zebra shade go', 'what remotes are there', 'how high can the rod go', 'what louver sizes do shutters come in'. NEVER quote prices from this tool — it returns none; prices always come from the pricing tools.",
    input_schema: {
      type: 'object' as const,
      properties: {
        area: { type: 'string', description: "'shades' | 'motors' | 'drapery' | 'shutters' | 'hardware'" },
      },
      required: ['area'],
    },
  },
  {
    name: 'identify_fabric_code',
    description:
      "Identify which product a fabric name or code belongs to across ALL our catalogs (Luma, Sundance, JC, drapery/roman fabrics). Call this whenever a customer mentions a code or fabric name you don't recognize — e.g. 'EB12-005', 'DB1-1', 'Dorus', 'Linen White'. If it's a Luma family, it's sold online: continue with the store tools. If it's Sundance/JC, the match includes a `variant` + `config` — pass those straight to get_sundance_jc_estimate (with the window size) to give a reference price, then offer the free in-home measure.",
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'The fabric code or name exactly as the customer said it.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'recommend_drapery_size',
    description:
      "MEASUREMENT WIZARD — compute the RECOMMENDED finished drapery size from the customer's window measurements, using the exact same rules our designers use. CALL THIS THE MOMENT you have enough inputs — never re-ask for a number the customer already gave, and never compute finished sizes or panel/fabric-width counts in your head instead. Full mode: window width + height in inches (outer frame preferred) + rod type (motorized ceiling track / ceiling track / wall rod) + opening (center split or one-way). HEIGHT-ONLY mode: if the customer gave the floor-to-ceiling height (min of 3 points) + rod type but no window size yet, call with just wall_height_in (+ floor_clearance_in if they stated one) — you get the finished height immediately, then ask for the window width to finish the width side. Optional accuracy inputs: wall space left/right, window-top-to-ceiling gap, window-bottom-to-floor. Present the result as our recommendation with one short reason (stacking room scales with window width — narrow windows may add as little as ~7\" per side, wide windows much more), and offer to save it via upsert_room_item.",
    input_schema: {
      type: 'object' as const,
      properties: {
        window_width_in: { type: 'number', description: 'Window width in inches (outer frame edge to edge preferred).' },
        window_height_in: { type: 'number', description: 'Window height in inches.' },
        clear_left_in: { type: 'number', description: 'Usable wall space LEFT of the window in inches. Omit if not measured.' },
        clear_right_in: { type: 'number', description: 'Usable wall space RIGHT of the window in inches. Omit if not measured.' },
        clear_top_in: { type: 'number', description: 'Window top → ceiling gap in inches. Omit if not measured.' },
        clear_bottom_in: { type: 'number', description: 'Window bottom → floor in inches. Omit if not measured.' },
        wall_height_in: { type: 'number', description: 'Measured floor-to-ceiling height in inches (measure at left/center/right, give the SMALLEST). Omit if not measured.' },
        floor_clearance_in: { type: 'number', description: 'Hem-off-the-floor clearance in inches if the customer stated one (default 0.5).' },
        rod_type: { type: 'string', description: "'motorized_ceiling_track' | 'ceiling_track' | 'wall_rod' (default ceiling_track)." },
        operation: { type: 'string', description: "'split' (center open, default) | 'single_left' | 'single_right'." },
        style_family: { type: 'string', description: "'pleated' (pinch pleat, default) | 'ripple' (ripplefold)." },
      },
      required: [],
    },
  },
  {
    name: 'quote_shutter_estimate',
    description:
      "Get an EXACT computed price for a JC Cambridge shutter (plantation shutter) — same engine as our internal quoting. You MUST present it as a reference price: final price is confirmed after the FREE in-home measurement (say that every time, then offer to book). Collect in inches: window width + height (the engine adds the standard frame allowance automatically — pass size_is_finished=true only if the customer already has a finished/panel size, e.g. french doors). Then material (poly_vinyl / hardwood / paulownia / basswood — for basswood also ask paint or stain finish). Style and upgrades are optional; quantity defaults to 1. Never invent shutter prices yourself — always use this tool.",
    input_schema: {
      type: 'object' as const,
      properties: {
        material: { type: 'string', description: "'poly_vinyl' | 'hardwood' | 'paulownia' | 'basswood'." },
        color_type: { type: 'string', description: "For basswood only: 'paint' (default) or 'stain'." },
        width_in: { type: 'number', description: 'Window width in inches (or finished width when size_is_finished=true).' },
        height_in: { type: 'number', description: 'Window height in inches (or finished height when size_is_finished=true).' },
        size_is_finished: { type: 'boolean', description: 'true = width/height are already the finished/panel size (no frame allowance added). Default false.' },
        style: { type: 'string', description: "Optional: 'standard' (default) | 'bay_window' | 'bi_fold' | 'by_pass_closed' | 'by_pass_open' | 'corner_window' | 'double_hung' | 'skylight' | 'specialty_shape' | french door styles." },
        panel_specialty: { type: 'string', description: "Optional: 'liberty_arch' | 'raised_panel' | 'solid_panel'." },
        tilt: { type: 'string', description: "Optional tilt control: 'standard_tilt_rod' | 'hidden_tilt_rod' (our usual default) | 'invisible_tilt'." },
        buildout: { type: 'string', description: "Optional buildout: 'lt1' (<1\") | '1_3' (1–3\")." },
        divider_rail: { type: 'boolean', description: 'Optional divider rail.' },
        knob: { type: 'boolean' },
        lock: { type: 'boolean' },
        custom_finish: { type: 'string', description: "Optional: 'custom_paint' | 'custom_stain' (per color)." },
        quantity: { type: 'number', description: 'Number of identical shutters (default 1).' },
      },
      required: ['material', 'width_in', 'height_in'],
    },
  },
  {
    name: 'get_sundance_jc_estimate',
    description:
      "Get a Sundance or JC REFERENCE PRICE RANGE for a shade/blind. Use for Sundance (roller / faux-wood or wood horizontal blind / vertical blind / cellular) and JC (horizontal faux-wood or wood blind / woven woods) — NOT Hunter Douglas (use get_hd_estimate), NOT Cambridge shutter (use quote_shutter_estimate), NOT Luma store products (use quote_store_product). First identify the exact product with identify_fabric_code, then call this with the variant, the fabric/config it returned, and width/height in inches. Present ONLY the returned range as a REFERENCE: say the final price comes from our designer after the free in-home measure, every time, then offer to book. If it returns needs_more, ask the customer for the listed missing details (or offer the consultation); if it can't price, offer the consultation. Never state an exact figure or any wholesale/net price.",
    input_schema: {
      type: 'object' as const,
      properties: {
        variant: { type: 'string', description: "Exact product variant, e.g. 'sundance_roller_shade', 'sundance_wood_blind', 'sundance_cellular_shade', 'jc_woven_woods_standard', 'jc_horizontal_blinds_wood' — from identify_fabric_code." },
        config: { type: 'object', description: 'Product configuration (fabric/color/price-group/cassette/control etc.) — use the configTemplate identify_fabric_code returned, filling in what the customer told you.' },
        width_in: { type: 'number', description: 'Window width in inches.' },
        height_in: { type: 'number', description: 'Window height in inches.' },
      },
      required: ['variant'],
    },
  },
  {
    name: 'get_home_project',
    description:
      "Get the customer's saved Home Project (their room-by-room plan: rooms, items, sizes, options, exact computed prices, subtotal). Works for guests too (tied to their browser). Call this before adding/updating items, or whenever the customer asks what's in their project / their total.",
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'upsert_room_item',
    description:
      "Add an item to the customer's Home Project, or update one (pass item_id to update). The server computes the EXACT price with the same engine as checkout and returns it — quote ONLY prices returned by this tool, never estimate. Before calling: get a valid product_id from list_store_products and valid option values from get_product_options, and collect the room name and measurements in INCHES. If the result has a price_error/note instead of a price, the item is saved but needs a human to price it — say exactly that.",
    input_schema: {
      type: 'object' as const,
      properties: {
        item_id: { type: 'string', description: 'Existing project item id — ONLY when updating an item returned by get_home_project.' },
        room: { type: 'string', description: 'Room name, e.g. "Living Room" / "主卧".' },
        product_id: { type: 'string', description: 'Product id from list_store_products.' },
        width_in: { type: 'number', description: 'Finished width in inches (rod/track length for hardware).' },
        height_in: { type: 'number', description: 'Finished height in inches (omit for hardware/accessory).' },
        options: {
          type: 'object',
          description: 'Option selections as {option_name: value} using EXACT values from get_product_options, e.g. {"style":"pinch3","lining":"BO"}.',
        },
        quantity: { type: 'number', description: 'How many windows/units (default 1).' },
        notes: { type: 'string', description: "Optional note in the customer's words (mount type, special requests)." },
      },
      required: ['room', 'product_id'],
    },
  },
  {
    name: 'remove_room_item',
    description:
      "Remove an item from the customer's Home Project. Get the item_id from get_home_project and confirm with the customer first.",
    input_schema: {
      type: 'object' as const,
      properties: {
        item_id: { type: 'string', description: 'The project item id to remove.' },
      },
      required: ['item_id'],
    },
  },
  {
    name: 'list_store_products',
    description:
      'List the online store products that can be added to a Home Project (id, name, type, category). Use the returned product_id with get_product_options / upsert_room_item. Optional type filter: drapery, sheer, shade, hardware, accessory.',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', description: 'Optional product type filter: drapery | sheer | shade | hardware | accessory.' },
      },
    },
  },
  {
    name: 'get_product_options',
    description:
      "Get a product's configurable options and their VALID values (plus which dimensions it needs) before calling upsert_room_item. Always call this for a product you haven't configured yet in this conversation — invalid option values produce wrong or failed prices.",
    input_schema: {
      type: 'object' as const,
      properties: {
        product_id: { type: 'string', description: 'Product id from list_store_products.' },
      },
      required: ['product_id'],
    },
  },
]

/**
 * Execute a tool call by name. `userId` is the signed-in user's id (or null
 * for guests) taken from the request session, and `anonId` is the guest's
 * ad_anon cookie id — BOTH come from the request, NOT from anything the
 * model said.
 */
export async function executeAssistantTool(
  name: string,
  input: any,
  userId: string | null,
  anonId: string | null = null,
  campaignId: string | null = null
): Promise<unknown> {
  const owner: ProjectOwnerCtx = { userId, anonId, campaignId }
  switch (name) {
    case 'quote_store_product': {
      // Same authority as checkout: computeServerUnitPrice — never estimated.
      try {
        const { computeServerUnitPrice } = await import('@/lib/productPricing')
        const priced = await computeServerUnitPrice({
          productId: String(input?.product_id ?? ''),
          width: input?.width_in != null ? Number(input.width_in) : undefined,
          height: input?.height_in != null ? Number(input.height_in) : undefined,
          options: input?.options && typeof input.options === 'object' ? input.options : {},
        })
        logLeadEvent({
          userId, anonId, type: 'store_estimate', value: priced.unitPrice,
          meta: { product_id: input?.product_id, width: input?.width_in, height: input?.height_in },
          campaignId,
        })
        return {
          unit_price: priced.unitPrice,
          // EXACT store price — never hedge it with 大约/around (it IS the
          // price for that size; the old wording here contradicted the
          // prompt's exact-price rule and made the model hedge).
          say_it_as: `$${priced.unitPrice.toLocaleString()} per shade for that exact size and configuration — state it plainly (no "around"/"大约"); the product page configurator shows the same live price.`,
        }
      } catch (e: any) {
        return {
          error: String(e?.message || 'could_not_price'),
          note: 'This configuration needs the product page configurator or a person — do NOT guess a number. Check get_product_options for valid values, or point them to the product page.',
        }
      }
    }
    case 'get_hd_estimate': {
      const est = await hdEstimate({
        series: typeof input?.series === 'string' && input.series ? input.series : undefined,
        subProduct: input?.sub_product,
        fabricCode: input?.fabric_code,
        widthIn: input?.width_in != null ? Number(input.width_in) : undefined,
        heightIn: input?.height_in != null ? Number(input.height_in) : undefined,
        operatingSystem: input?.operating_system,
      })
      if (est.ok && (est.rangeLow || est.needsHuman)) {
        logLeadEvent({
          userId, anonId, type: 'hd_estimate',
          value: est.rangeLow ?? null,
          meta: { series: est.series, width: input?.width_in, height: input?.height_in, low: est.rangeLow, high: est.rangeHigh },
          campaignId,
        })
      }
      if (!est.ok) {
        return { error: est.error, note: 'Could not compute an HD reference range — tell the customer a designer will quote it at the free in-home consultation. Do NOT invent a number.' }
      }
      if (est.seriesList) return { series_list: est.seriesList }
      if (est.needsChoice) {
        return {
          ask_customer: est.needsChoice.field,
          options: est.needsChoice.options,
          note: `Ask the customer to choose a ${est.needsChoice.field} from the options, then call get_hd_estimate again with sub_product set.`,
        }
      }
      if (est.needsHuman || !est.rangeLow) {
        return { needs_human: true, warnings: est.warnings, note: 'This configuration needs a person to quote — offer the free consultation. Do NOT invent a number.' }
      }
      return {
        series: est.series,
        reference_range: `$${est.rangeLow.toLocaleString()} – $${est.rangeHigh!.toLocaleString()}`,
        range_low: est.rangeLow,
        range_high: est.rangeHigh,
        ...(est.fabricDependent ? { fabric_note: 'Range spans this series\' fabric tiers — it narrows once the customer picks a fabric collection at the consultation.' } : {}),
        warnings: est.warnings?.length ? est.warnings : undefined,
        must_say: 'Reference range only (list-price基准, per shade, excludes measure/install). Final price comes from our designer after the FREE in-home measurement — offer to book it now.',
      }
    }
    case 'list_measured_windows': {
      const { listMeasuredWindows } = await import('@/lib/windowMeasurements')
      const rows = await listMeasuredWindows({ userId, anonId })
      if (rows.length === 0) {
        return { windows: [], note: 'No saved measurements. Offer the /measure-wizard page, or collect measurements in chat.' }
      }
      return {
        windows: rows.map((r) => ({
          id: r.id,
          location: r.label,
          opening: r.kind,
          product: r.product,
          config: r.config,
          dims_in: r.dims,
          result: r.result,
        })),
        note: 'Dims use inches; A/B/C/D = wall space left/right and gaps to ceiling/floor. Results are reference-only — final sizes/prices come from the free in-home measure.',
      }
    }
    case 'save_measured_window': {
      const { saveMeasuredWindow } = await import('@/lib/windowMeasurements')
      const numOr = (v: any) => (v != null && isFinite(Number(v)) && Number(v) > 0 ? Number(v) : null)
      const w = numOr(input?.width_in)
      const h = numOr(input?.height_in)
      if (!w || !h) return { error: 'need_dims', note: 'Width and height in inches are required.' }
      const product = ['drapery', 'shades', 'shutters'].includes(input?.product) ? input.product : 'drapery'
      const row = await saveMeasuredWindow(
        { userId, anonId },
        {
          id: typeof input?.id === 'string' ? input.id : undefined,
          label: String(input?.location || ''),
          kind: input?.opening === 'sliding_door' ? 'sliding_door' : 'window',
          product,
          config: {
            ...(['deep', 'mid', 'shallow'].includes(input?.depth_choice) ? { depthChoice: input.depth_choice } : {}),
            ...(['inside', 'inside_z', 'outside'].includes(input?.mount) ? { mount: input.mount } : {}),
            ...(typeof input?.notes === 'string' && input.notes ? { notes: String(input.notes).slice(0, 300) } : {}),
            savedVia: 'chat',
          },
          dims: {
            widthIn: w,
            heightIn: h,
            A_leftIn: numOr(input?.clear_left_in),
            B_rightIn: numOr(input?.clear_right_in),
            C_topIn: numOr(input?.clear_top_in),
            D_bottomIn: numOr(input?.clear_bottom_in),
            wallHeightIn: numOr(input?.wall_height_in),
            measured: 'opening',
          },
          result: {},
        }
      )
      if (!row) return { error: 'could_not_save', note: 'Saving failed — check the location name, or the sheet may be full (60 windows).' }
      logLeadEvent({ userId, anonId, type: 'measure_wizard', meta: { source: 'chat', action: input?.id ? 'update' : 'add', label: row.label }, campaignId })
      return {
        saved: { id: row.id, location: row.label, product: row.product, width_in: w, height_in: h },
        note: "Saved to their measurement sheet. Tell the customer it's saved and they can review/edit everything at /measure-wizard.",
      }
    }
    case 'get_product_specs': {
      const { getProductSpecs } = await import('@/lib/aappCatalogQA')
      const area = ['shades', 'motors', 'drapery', 'shutters', 'hardware'].includes(input?.area) ? input.area : 'shades'
      return await getProductSpecs(area)
    }
    case 'identify_fabric_code': {
      const { resolveFabricCode } = await import('@/lib/aappCatalogQA')
      const r = await resolveFabricCode(String(input?.query || ''))
      if (!r.ok) {
        return {
          error: r.error,
          note: 'Could not identify the code right now — NEVER guess which brand or product a code belongs to. Say you could not verify it just now, ask where they saw it, and offer the free consultation. Do not proceed to any pricing tool with an unverified code.',
        }
      }
      if (!r.matches || r.matches.length === 0) {
        return { matches: [], note: 'No catalog match — it may be a competitor code or a custom fabric. Ask where they saw it; offer the free consultation.' }
      }
      return { matches: r.matches }
    }
    case 'recommend_drapery_size': {
      const { recommendDraperySize, recommendFinishedHeightOnly } = await import('@window-treatments/shared/measure')
      const num = (v: any) => (v != null && isFinite(Number(v)) && Number(v) > 0 ? Number(v) : undefined)
      const floorClearance = input?.floor_clearance_in != null && isFinite(Number(input.floor_clearance_in)) && Number(input.floor_clearance_in) >= 0
        ? Number(input.floor_clearance_in)
        : undefined
      const rodType = ['motorized_ceiling_track', 'ceiling_track', 'wall_rod'].includes(input?.rod_type)
        ? input.rod_type
        : 'ceiling_track'

      // HEIGHT-ONLY mode (G5 2026-07-20): customer measured the ceiling but
      // not the window — the finished height is still fully computable. Never
      // send the model back to re-ask for numbers it doesn't need.
      if ((!num(input?.window_width_in) || !num(input?.window_height_in)) && num(input?.wall_height_in)) {
        const recH = recommendFinishedHeightOnly({
          wallHeightsIn: [Number(input.wall_height_in)],
          rodType,
          clearanceFromFloorIn: floorClearance,
        })
        if (recH != null) {
          logLeadEvent({
            userId, anonId, type: 'measure_wizard',
            meta: { wallH: input?.wall_height_in, recH, mode: 'height_only' },
            campaignId,
          })
          return {
            recommended_finished_height_in: recH,
            note:
              'Finished HEIGHT computed from the measured ceiling height with the same rules our designers use. ' +
              'State it as the recommendation. For the finished WIDTH, ask for the window width (and height) — do not estimate width yourself.',
          }
        }
      }

      const rec = recommendDraperySize({
        windowWidthIn: Number(input?.window_width_in) || 0,
        windowHeightIn: Number(input?.window_height_in) || 0,
        clearLeftIn: num(input?.clear_left_in),
        clearRightIn: num(input?.clear_right_in),
        clearTopIn: num(input?.clear_top_in),
        clearBottomIn: num(input?.clear_bottom_in),
        wallHeightsIn: num(input?.wall_height_in) ? [Number(input.wall_height_in)] : undefined,
        clearanceFromFloorIn: floorClearance,
        rodType,
        operation: ['split', 'single_left', 'single_right'].includes(input?.operation) ? input.operation : 'split',
        styleFamily: input?.style_family === 'ripple' ? 'ripple' : 'pleated',
      })
      if (!rec) {
        return { error: 'need_window_size', note: 'Ask for the window width and height in inches first.' }
      }
      logLeadEvent({
        userId, anonId, type: 'measure_wizard',
        meta: { w: input?.window_width_in, h: input?.window_height_in, recW: rec.recommendedFinishedWidthIn, recH: rec.recommendedFinishedHeightIn },
        campaignId,
      })
      return {
        recommended_finished_width_in: rec.recommendedFinishedWidthIn,
        recommended_finished_height_in: rec.recommendedFinishedHeightIn,
        note:
          'Same rules our designers use: width adds stacking room so panels clear the glass when open; height hangs from the rod/track position down to ~1/2" off the floor. ' +
          'If the customer could not measure side clearances or ceiling height, mention the recommendation gets even more accurate with those numbers.',
      }
    }
    case 'quote_shutter_estimate': {
      const { priceCambridgeShutter, billingSizeFromWindow, CAMBRIDGE_SHUTTER_DEFAULT_RATES } = await import(
        '@window-treatments/shared/pricing/aapp'
      )
      const material = String(input?.material || '')
      if (!['poly_vinyl', 'hardwood', 'paulownia', 'basswood'].includes(material)) {
        return { error: 'bad_material', note: "Ask which material: poly_vinyl, hardwood, paulownia, or basswood (paint/stain)." }
      }
      // Rates: AAPP library sync snapshot wins (admin-customized rates), else
      // the inline defaults — the same fallback chain AAPP itself uses.
      let rates = CAMBRIDGE_SHUTTER_DEFAULT_RATES
      let ratesSource = 'defaults'
      try {
        const { getAappLibrary } = await import('@/lib/aappLibrary')
        const snap = await getAappLibrary()
        const lib = snap?.data?.cambridgeShutter?.pricingRates
        if (lib && typeof lib === 'object' && lib.rates && lib.options_psf && lib.options_ea) {
          rates = lib
          ratesSource = 'aapp_sync'
        }
      } catch {
        /* snapshot unavailable → defaults */
      }
      const rawW = Number(input?.width_in) || 0
      const rawH = Number(input?.height_in) || 0
      const finished = input?.size_is_finished === true
      const isFrench = typeof input?.style === 'string' && input.style.startsWith('french_door')
      const { widthIn, heightIn } = finished || isFrench ? { widthIn: rawW, heightIn: rawH } : billingSizeFromWindow(rawW, rawH)
      const r = priceCambridgeShutter(
        {
          materialId: material as any,
          colorType: input?.color_type === 'stain' ? 'stain' : 'paint',
          widthIn,
          heightIn,
          styleId: typeof input?.style === 'string' ? input.style : 'standard',
          panelSpecialty: ['liberty_arch', 'raised_panel', 'solid_panel'].includes(input?.panel_specialty)
            ? input.panel_specialty
            : 'no',
          tiltControl: ['standard_tilt_rod', 'hidden_tilt_rod', 'offset_tilt_rod', 'invisible_tilt'].includes(input?.tilt)
            ? input.tilt
            : 'hidden_tilt_rod', // AAPP quote UI default
          buildoutType: input?.buildout === 'lt1' || input?.buildout === '1_3' ? input.buildout : 'none',
          dividerRailEnabled: input?.divider_rail === true,
          knobEnabled: input?.knob === true,
          lockEnabled: input?.lock === true,
          customFinishType:
            input?.custom_finish === 'custom_paint' || input?.custom_finish === 'custom_stain'
              ? input.custom_finish
              : 'none',
          quantity: Number(input?.quantity) || 1,
        },
        rates
      )
      if (!r) return { error: 'could_not_price', note: 'Need material plus width and height in inches.' }
      logLeadEvent({
        userId, anonId, type: 'shutter_estimate', value: r.subtotal,
        meta: { material, w: widthIn, h: heightIn, qty: r.qty, source: ratesSource },
        campaignId,
      })
      return {
        price: r.subtotal,
        install_fee: r.installAmount,
        area_sqft: r.areaSqFt,
        billed_size: `${widthIn}" × ${heightIn}"${finished || isFrench ? '' : ' (window size + standard frame allowance)'}`,
        upgrades: r.lines.map((l) => l.label),
        quantity: r.qty,
        must_say:
          'Present as a REFERENCE price (加装费 install listed separately). The final price is confirmed by our designer after the FREE in-home measurement — say that every time, then offer to book the consultation.',
      }
    }
    case 'get_sundance_jc_estimate': {
      const { sundanceJcEstimate } = await import('@/lib/sundanceJcPricing')
      const est = await sundanceJcEstimate({
        variant: String(input?.variant || ''),
        productConfig: input?.config && typeof input.config === 'object' ? input.config : {},
        widthIn: input?.width_in != null ? Number(input.width_in) : undefined,
        heightIn: input?.height_in != null ? Number(input.height_in) : undefined,
      })
      if (est.ok && est.rangeLow) {
        logLeadEvent({
          userId, anonId, type: 'sundance_jc_estimate',
          value: est.rangeLow, meta: { brand: est.brand, variant: input?.variant, w: input?.width_in, h: input?.height_in }, campaignId,
        })
        return {
          brand: est.brand,
          reference_range: `$${est.rangeLow.toLocaleString()} – $${est.rangeHigh!.toLocaleString()}`,
          range_low: est.rangeLow,
          range_high: est.rangeHigh,
          must_say: `Reference range only (per shade/blind, excludes measure/install). Final price comes from our designer after the FREE in-home measurement — offer to book it now.`,
        }
      }
      if (est.error === 'needs_more') {
        return { needs_more: true, missing: est.needs, note: 'Ask the customer for these details, or offer the free consultation to finalize.' }
      }
      if (est.error === 'not_configured') {
        return { error: 'not_configured', note: 'Sundance/JC estimate is not available yet — describe the product qualitatively (mid-range, reliable) and offer the free in-home consultation for pricing.' }
      }
      return { error: est.error, note: 'Could not compute a Sundance/JC reference range — tell the customer a designer will quote it at the free in-home consultation. Do NOT invent a number.' }
    }
    case 'get_home_project':
      return await getHomeProjectTool(owner)
    case 'upsert_room_item':
      return await upsertRoomItemTool(owner, input)
    case 'remove_room_item':
      return await removeRoomItemTool(owner, input)
    case 'list_store_products':
      return await listStoreProductsTool(input)
    case 'get_product_options':
      return await getProductOptionsTool(input)
    case 'lookup_my_orders':
      return userId ? await lookupMyOrders(userId) : { orders: [], note: 'Customer is not signed in. Ask for their order number and shipping ZIP and use verify_guest_order.' }
    case 'verify_guest_order':
      return await verifyGuestOrder(input?.order_number, input?.zip)
    case 'submit_service_request':
      return await submitServiceRequest({
        userId,
        orderNumber: input?.order_number,
        zip: input?.zip,
        ticketType: input?.ticket_type,
        category: input?.category,
        message: input?.message,
        requestedChanges: input?.requested_changes ?? null,
      })
    case 'submit_website_inquiry': {
      // P2 handoff enrichment: append the AI Sales Summary (project contents,
      // engagement score, campaign) to the message that lands in the AAPP
      // customer profile. Best-effort — an empty summary changes nothing.
      const summary = await buildAiSalesSummary(owner)
      const baseMessage = String(input?.message ?? '').trim()
      const inquiry = await submitWebsiteInquiry({
        name: input?.name,
        phone: input?.phone,
        email: input?.email,
        address: input?.address,
        message: (baseMessage + summary).slice(0, 6000),
        productType: input?.product_type,
        intent: input?.intent === 'repair' ? 'repair' : 'triage',
        smsConsent: input?.sms_consent === true,
        source: 'website_chat',
      })
      if (inquiry.ok) {
        logLeadEvent({
          userId, anonId, type: 'inquiry_submitted',
          meta: { via: 'assistant', intent: input?.intent === 'repair' ? 'repair' : 'triage' },
          campaignId,
        })
      }
      return inquiry
    }
    default:
      return { error: `unknown_tool: ${name}` }
  }
}
