// apps/web/src/lib/orderHistory.ts
// Records every status/notes change to an order in order_history table.

import { query } from '@/lib/db'

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS order_history (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      action      varchar(64) NOT NULL,
      from_status varchar(32),
      to_status   varchar(32),
      actor_email varchar(256),
      note        text,
      created_at  timestamptz DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_history(order_id, created_at DESC)`)
}

let ready = false

export async function recordOrderHistory(entry: {
  order_id: string
  action: string
  from_status?: string | null
  to_status?: string | null
  actor_email?: string | null
  note?: string | null
}): Promise<void> {
  try {
    if (!ready) { await ensureTable(); ready = true }
    await query(
      `INSERT INTO order_history (order_id, action, from_status, to_status, actor_email, note)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.order_id,
        entry.action,
        entry.from_status ?? null,
        entry.to_status   ?? null,
        entry.actor_email ?? null,
        entry.note        ?? null,
      ]
    )
  } catch (err) {
    console.error('[orderHistory] write failed:', err)
  }
}
