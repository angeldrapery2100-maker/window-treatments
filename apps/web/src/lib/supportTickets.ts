// After-sales support tickets. Customers raise a ticket against an order
// (verified by order number + email, same model as guest tracking). Staff work
// them from /admin/support. Intentionally simple: one table, a small status
// machine, no SLA/assignment machinery until volume warrants it.

import { query } from '@/lib/db'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export const TICKET_STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']

export const TICKET_CATEGORIES = [
  'wrong_size',
  'damaged',
  'defect',
  'missing_item',
  'wrong_item',
  'late',
  'other',
] as const
export type TicketCategory = typeof TICKET_CATEGORIES[number]

// Where a ticket came from. Web form is the existing /store/track flow; the AI
// assistant opens tickets via tool calls (see /api/store/assistant).
export const TICKET_SOURCES = ['web_form', 'ai_assistant'] as const
export type TicketSource = typeof TICKET_SOURCES[number]

// What the customer is asking for. after_sales is a post-delivery issue (the
// existing behaviour); order_change / order_cancel are in-window requests raised
// through the AI assistant.
export const TICKET_TYPES = ['after_sales', 'order_change', 'order_cancel'] as const
export type TicketType = typeof TICKET_TYPES[number]

let ready = false
export async function ensureSupportTable(): Promise<void> {
  if (ready) return
  await query(`CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    order_number varchar(32) NOT NULL,
    customer_name varchar(256) NOT NULL DEFAULT '',
    customer_email varchar(256) NOT NULL,
    category varchar(32) NOT NULL DEFAULT 'other',
    message text NOT NULL,
    status varchar(16) NOT NULL DEFAULT 'open',
    admin_notes text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status, created_at DESC)`).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_support_order ON support_tickets(order_number)`).catch(() => {})
  // ── Additive columns for AI-assistant tickets (safe on existing tables) ────
  //  source          — 'web_form' | 'ai_assistant'
  //  ticket_type      — 'after_sales' | 'order_change' | 'order_cancel'
  //  requested_changes— jsonb of the fields the customer wants changed (order_change)
  //  window_ok        — whether the request was inside the 48h change window at submit
  await query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS source varchar(16) NOT NULL DEFAULT 'web_form'`).catch(() => {})
  await query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS ticket_type varchar(20) NOT NULL DEFAULT 'after_sales'`).catch(() => {})
  await query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS requested_changes jsonb DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS window_ok boolean DEFAULT NULL`).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_support_source ON support_tickets(source, status, created_at DESC)`).catch(() => {})
  ready = true
}

/** Hours a store order may be changed / cancelled after purchase. */
export const ORDER_CHANGE_WINDOW_HOURS = 48

/** True if `createdAt` is still within the change/cancel window from now. */
export function isWithinChangeWindow(createdAt: string | number | Date): boolean {
  const created = new Date(createdAt).getTime()
  if (!Number.isFinite(created)) return false
  const ageMs = Date.now() - created
  return ageMs >= 0 && ageMs <= ORDER_CHANGE_WINDOW_HOURS * 3600 * 1000
}
