import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

async function ensureWorkOrdersTable() {
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
}

// GET: get work order(s) for an order
export async function GET(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureWorkOrdersTable()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId required' }, { status: 400 })
    }

    const workOrder = await queryOne(
      'SELECT * FROM work_orders WHERE order_id = $1 ORDER BY version DESC LIMIT 1',
      [orderId]
    )

    return NextResponse.json({ success: true, data: { workOrder } })
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      return NextResponse.json({ success: true, data: { workOrder: null } })
    }
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

// POST: save a new work order version
export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureWorkOrdersTable()
    const body = await request.json()
    const { orderId, notes } = body

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId required' }, { status: 400 })
    }

    // Get current max version
    const existing = await queryOne(
      'SELECT COALESCE(MAX(version), 0) as max_version FROM work_orders WHERE order_id = $1',
      [orderId]
    )
    const nextVersion = (existing?.max_version || 0) + 1

    // Insert new work order record
    const workOrder = await queryOne(
      `INSERT INTO work_orders (order_id, version, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [orderId, nextVersion, notes || '']
    )

    // Auto-update order status to in_production if currently pending
    const order = await queryOne('SELECT status FROM orders WHERE id = $1', [orderId])
    if (order && order.status === 'pending') {
      await query(
        "UPDATE orders SET status = 'in_production', updated_at = NOW() WHERE id = $1",
        [orderId]
      )
    }

    return NextResponse.json({ success: true, data: { workOrder, statusUpdated: order?.status === 'pending' } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
