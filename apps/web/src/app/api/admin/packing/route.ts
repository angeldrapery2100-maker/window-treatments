import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Fulfillment / packing queue — the operator's work-list after production.
// One server round-trip computes, per order, how many units are shipped vs
// total, whether a work order exists, and which fulfillment STAGE it's in:
//   to_pack  — paid, in production, nothing packed/shipped yet
//   packed   — boxed / packing under way (status 'packed', or some units shipped)
//   shipped  — every unit has a label, awaiting delivery
// Delivered/cancelled orders are summarised as counts only (not action items).
//
// This is read-only aggregation over existing tables (orders, order_shipments,
// work_orders); it changes no state. The per-order Pack & Ship page
// (/admin/orders/shipping/[id]) still does the actual packing + label buying.

interface PackingOrder {
  id: string
  orderNumber: string
  customerName: string
  createdAt: string
  status: string
  itemCount: number
  totalUnits: number
  shippedUnits: number
  hasWorkOrder: boolean
  workOrderVersion: number | null
  stage: 'to_pack' | 'packed' | 'shipped'
}

function unitsFromItems(items: any[]): number {
  if (!Array.isArray(items)) return 0
  return items
    .filter(it => it && !it.isSwatch && (it.productType || '').toLowerCase() !== 'swatch')
    .reduce((n, it) => n + Math.max(1, Number(it.quantity) || 1), 0)
}

export async function GET(request: Request) {
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // Orders that could need fulfillment action (exclude cancelled). Pending =
    // unpaid / swatch-only; keep them out of the pack queue.
    const orders = await query<any>(
      `SELECT id, order_number, customer_name, created_at, status, items
         FROM orders
        WHERE status IN ('in_production', 'packed', 'shipped', 'completed')
        ORDER BY created_at ASC`
    ).catch((e: any) => {
      if (e instanceof Error && e.message.includes('does not exist')) return []
      throw e
    })
    if (orders.length === 0) {
      return NextResponse.json({ success: true, data: { stages: { to_pack: [], packed: [], shipped: [] }, counts: { to_pack: 0, packed: 0, shipped: 0, delivered: 0 } } })
    }

    const orderIds = orders.map((o: any) => o.id)

    // Shipped-unit coverage per order (exclude voided/refunded/failed labels).
    const shipments = await query<any>(
      `SELECT order_id, item_indices, item_quantities
         FROM order_shipments
        WHERE order_id = ANY($1::uuid[]) AND status NOT IN ('voided', 'refunded', 'failure')`,
      [orderIds]
    ).catch((e: any) => {
      if (e instanceof Error && e.message.includes('does not exist')) return []
      throw e
    })

    // Work-order existence per order.
    const wos = await query<any>(
      `SELECT order_id, MAX(version) AS version FROM work_orders
        WHERE order_id = ANY($1::uuid[]) GROUP BY order_id`,
      [orderIds]
    ).catch((e: any) => {
      if (e instanceof Error && e.message.includes('does not exist')) return []
      throw e
    })
    const woByOrder = new Map<string, number>(wos.map((w: any) => [w.order_id, Number(w.version) || 1]))

    // Tally shipped units per order.
    const shippedByOrder = new Map<string, number>()
    const orderById = new Map<string, any>(orders.map((o: any) => [o.id, o]))
    for (const s of shipments) {
      const items: any[] = orderById.get(s.order_id)?.items || []
      const q: Record<string, number> = s.item_quantities || {}
      let n = 0
      if (Object.keys(q).length > 0) {
        for (const v of Object.values(q)) n += Number(v) || 0
      } else {
        for (const idx of (s.item_indices || [])) n += Math.max(1, Number(items[idx]?.quantity) || 1)
      }
      shippedByOrder.set(s.order_id, (shippedByOrder.get(s.order_id) || 0) + n)
    }

    const stages: Record<'to_pack' | 'packed' | 'shipped', PackingOrder[]> = { to_pack: [], packed: [], shipped: [] }
    let delivered = 0

    for (const o of orders) {
      if (o.status === 'completed') { delivered++; continue }
      const items: any[] = Array.isArray(o.items) ? o.items : []
      const totalUnits = unitsFromItems(items)
      const shippedUnits = Math.min(shippedByOrder.get(o.id) || 0, totalUnits)
      const itemCount = items.filter(it => it && !it.isSwatch && (it.productType || '').toLowerCase() !== 'swatch').length

      let stage: PackingOrder['stage']
      if (o.status === 'shipped' || (totalUnits > 0 && shippedUnits >= totalUnits)) stage = 'shipped'
      else if (o.status === 'packed' || shippedUnits > 0) stage = 'packed'
      else stage = 'to_pack'

      const entry: PackingOrder = {
        id: o.id,
        orderNumber: o.order_number || '',
        customerName: o.customer_name || '',
        createdAt: o.created_at ? new Date(o.created_at).toISOString() : '',
        status: o.status,
        itemCount,
        totalUnits,
        shippedUnits,
        hasWorkOrder: woByOrder.has(o.id),
        workOrderVersion: woByOrder.get(o.id) ?? null,
        stage,
      }
      stages[stage].push(entry)
    }

    // Newest first within each actionable stage.
    for (const k of ['to_pack', 'packed', 'shipped'] as const) {
      stages[k].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }

    return NextResponse.json({
      success: true,
      data: {
        stages,
        counts: { to_pack: stages.to_pack.length, packed: stages.packed.length, shipped: stages.shipped.length, delivered },
      },
    })
  } catch (e) {
    return errorResponse('Could not load the packing queue.', 500, e)
  }
}
