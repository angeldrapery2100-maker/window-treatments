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

function projectToolView(projectName: string, items: ProjectItemRow[]) {
  const s = projectSummary(items)
  return {
    project: {
      name: projectName,
      items: items.map(itemToolView),
      item_count: s.itemCount,
      priced_subtotal: s.pricedSubtotal,
      unpriced_item_count: s.unpricedCount,
      review_page: '/store/project',
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
