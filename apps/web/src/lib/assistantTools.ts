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
      'Create an after-sales, change, or cancel request ticket for an order. The server re-verifies ownership and the 48-hour window. For a cancellation a HUMAN confirms and issues the refund — never promise an instant or exact refund amount. Only call this AFTER the customer has explicitly confirmed the action.',
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
]

/**
 * Execute a tool call by name. `userId` is the signed-in user's id (or null for
 * guests) taken from the request session — NOT from anything the model said.
 */
export async function executeAssistantTool(
  name: string,
  input: any,
  userId: string | null
): Promise<unknown> {
  switch (name) {
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
    default:
      return { error: `unknown_tool: ${name}` }
  }
}
