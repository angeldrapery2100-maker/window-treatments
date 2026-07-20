// Automatic production work orders (docs/ORDER-TO-PRODUCTION-DESIGN.md §B).
//
// On successful payment, createOrderForPaymentIntent calls autoCreateWorkOrder
// which snapshots every non-swatch item together with the AAPP engine's full
// production breakdown (panel counts, widths-per-panel, cut drops, yardages,
// cassette lengths, …) into work_orders.items_snapshot. The work order IS the
// production sheet — re-running the same engine the quote was priced with
// guarantees the workshop parameters can never diverge from what was sold.
//
// Every entry point here is best-effort: a work-order failure must NEVER fail
// the order (it is already paid and persisted).

import { query } from '@/lib/db'
import { computeAappBreakdown, type ServerPriceItem } from '@/lib/productPricing'

// ── Money filter for production sheets ───────────────────────────────────────
// The workshop sheet must NOT show money. Engine breakdowns mix production
// values (mainWps, cutDrop, faceYds, billedFeet…) with dollar amounts
// (mainFabricAmt, motorNet, trackSell, subtotalRaw…). This regex matches every
// money-carrying key the aapp engines emit (amount/amt/price/total/subtotal
// plus net/sell/retail/markup/perYard/perSqFt variants) — keep in sync with
// packages/shared/src/pricing/aapp/*.ts breakdown keys.
export const PRODUCTION_MONEY_KEY_RE = /amount|amt|price|total|subtotal|net|sell|retail|markup|peryard|persqft/i

export function isProductionMoneyKey(key: string): boolean {
  return PRODUCTION_MONEY_KEY_RE.test(key)
}

export interface WorkOrderSnapshotItem {
  productId: string
  productName: string
  productType: string
  quantity: number
  width?: number | string
  height?: number | string
  widthFraction?: string | number
  heightFraction?: string | number
  /** Original order-line options ({name, displayLabel, value, valueLabel}). */
  options: any[]
  /** aapp_engine key when the product prices via the AAPP engines. */
  engine?: string
  /** Full engine breakdown (production parameters + amounts — the print page
   *  and workshop email filter out money keys). Null/absent for non-aapp
   *  items, which just carry their options as a basic spec. */
  production?: Record<string, number | string> | null
}

// ── Schema ────────────────────────────────────────────────────────────────────
// The work_orders table itself is created by app/api/admin/work-orders/route.ts
// (manual save path) — mirror its ensure pattern here so whichever path runs
// first wins, then add the auto-generation columns.
let columnsEnsured = false

export async function ensureWorkOrdersColumns(): Promise<void> {
  if (columnsEnsured) return
  await query(`
    CREATE TABLE IF NOT EXISTS work_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id),
      version INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by VARCHAR(128) DEFAULT 'admin',
      notes TEXT DEFAULT ''
    )
  `).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_work_orders_order_id ON work_orders(order_id)`).catch(() => {})
  await query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS items_snapshot jsonb DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS auto_generated boolean DEFAULT false`).catch(() => {})
  // form_data: hand-edits made in the embedded AAPP-style work-order forms
  // (drapery / luma), keyed by form type: { drapery: {meta,rows}, luma: {...} }.
  // Autosaved on every edit (see PATCH /api/admin/work-orders) so the workshop's
  // corrections survive reloads. The auto-generated items_snapshot stays the
  // untouched production truth; form_data is the editable overlay on top of it.
  await query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS form_data jsonb DEFAULT NULL`).catch(() => {})
  columnsEnsured = true
}

// ── Snapshot builder ──────────────────────────────────────────────────────────
// Flat array (no grouping — the print page groups by category). Swatch lines
// never enter a work order. A per-item breakdown failure downgrades that item
// to a basic spec (options only) instead of losing the whole work order.
export async function buildWorkOrderSnapshot(items: any[]): Promise<WorkOrderSnapshotItem[]> {
  const out: WorkOrderSnapshotItem[] = []
  for (const i of items || []) {
    if (!i || i.isSwatch || i.productType === 'swatch') continue

    const entry: WorkOrderSnapshotItem = {
      productId:      i.productId,
      productName:    i.productName || 'Custom Item',
      productType:    i.productType || 'other',
      quantity:       Math.max(1, Number(i.quantity) || 1),
      width:          i.width,
      height:         i.height,
      widthFraction:  i.widthFraction,
      heightFraction: i.heightFraction,
      options:        Array.isArray(i.options) ? i.options : [],
    }

    try {
      const aapp = await computeAappBreakdown({
        productId:      i.productId,
        width:          i.width,
        height:         i.height,
        widthFraction:  i.widthFraction,
        heightFraction: i.heightFraction,
        options:        i.options,
      } as ServerPriceItem)
      if (aapp) {
        entry.engine = aapp.engine
        entry.production = aapp.breakdown
      }
    } catch (e) {
      console.error('[workOrders] breakdown failed for product', i.productId, e)
    }

    out.push(entry)
  }
  return out
}

// ── Auto-create on payment ────────────────────────────────────────────────────
// Returns the snapshot on success (so createOrder can feed the workshop email
// without re-running the engines), null when skipped (swatch-only) or failed.
// NEVER throws.
export async function autoCreateWorkOrder(orderId: string, items: any[]): Promise<WorkOrderSnapshotItem[] | null> {
  try {
    const production = (items || []).filter(i => i && !i.isSwatch && i.productType !== 'swatch')
    if (production.length === 0) return null // swatch-only order — no work order

    await ensureWorkOrdersColumns()
    const snapshot = await buildWorkOrderSnapshot(items)
    if (snapshot.length === 0) return null

    await query(
      `INSERT INTO work_orders (order_id, version, created_by, notes, items_snapshot, auto_generated)
       VALUES ($1, 1, 'system', 'auto-generated on payment', $2, true)`,
      [orderId, JSON.stringify(snapshot)]
    )
    return snapshot
  } catch (e) {
    console.error('[workOrders] auto-create failed', e)
    return null
  }
}
