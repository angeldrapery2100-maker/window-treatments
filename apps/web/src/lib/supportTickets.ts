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
  ready = true
}
