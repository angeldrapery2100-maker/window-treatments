// Persists the checkout payload at PaymentIntent-creation time, keyed by PI id,
// so the Stripe webhook can reconstruct the order if the browser never reaches
// /api/store/orders (tab closed, network drop, etc.). Rows are consumed on
// successful order creation and swept after 7 days.

import { query, queryOne } from '@/lib/db'

let ready = false
async function init() {
  if (ready) return
  await query(`CREATE TABLE IF NOT EXISTS pending_checkouts (
    payment_intent_id varchar(256) PRIMARY KEY,
    payload jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
  )`)
  ready = true
}

export interface PendingCheckoutPayload {
  customer: { name: string; email: string; phone?: string; address?: any }
  items: any[]
  shipping?: { cost?: number; carrier?: string; service?: string; rateId?: string } | null
  discount?: { code?: string | null } | null
  notes?: string
  userId?: string | null
}

export async function savePendingCheckout(paymentIntentId: string, payload: PendingCheckoutPayload): Promise<void> {
  await init()
  await query(
    `INSERT INTO pending_checkouts (payment_intent_id, payload) VALUES ($1, $2)
     ON CONFLICT (payment_intent_id) DO UPDATE SET payload = EXCLUDED.payload`,
    [paymentIntentId, JSON.stringify(payload)]
  )
  if (Math.random() < 0.05) {
    await query(`DELETE FROM pending_checkouts WHERE created_at < now() - interval '7 days'`).catch(() => {})
  }
}

export async function getPendingCheckout(paymentIntentId: string): Promise<PendingCheckoutPayload | null> {
  await init()
  const row = await queryOne<{ payload: PendingCheckoutPayload }>(
    `SELECT payload FROM pending_checkouts WHERE payment_intent_id = $1`,
    [paymentIntentId]
  ).catch(() => null)
  return row?.payload ?? null
}

export async function consumePendingCheckout(paymentIntentId: string): Promise<void> {
  await init()
  await query(`DELETE FROM pending_checkouts WHERE payment_intent_id = $1`, [paymentIntentId]).catch(() => {})
}
