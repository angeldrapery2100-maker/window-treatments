import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { ensureWorkOrdersColumns } from '@/lib/workOrders'

// Table create + items_snapshot / auto_generated columns (SELECT * below needs
// them) — shared with the auto-generation path in lib/workOrders.ts.
async function ensureWorkOrdersTable() {
  await ensureWorkOrdersColumns()
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
  } catch (e) {
    if (e instanceof Error && e.message.includes('does not exist')) {
      return NextResponse.json({ success: true, data: { workOrder: null } })
    }
    return errorResponse('Could not load work orders.', 500, e)
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

    // Carry the production snapshot forward from the latest version (manual
    // re-saves must not lose the auto-generated production parameters).
    const latest = nextVersion > 1 ? await queryOne(
      'SELECT items_snapshot FROM work_orders WHERE order_id = $1 ORDER BY version DESC LIMIT 1',
      [orderId]
    ).catch(() => null) : null

    // Insert new work order record
    const workOrder = await queryOne(
      `INSERT INTO work_orders (order_id, version, notes, items_snapshot)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [orderId, nextVersion, notes || '', latest?.items_snapshot ? JSON.stringify(latest.items_snapshot) : null]
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
  } catch (e) {
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

// PATCH: autosave hand-edits from an embedded work-order form (drapery / luma).
// Stores { [formType]: formData } into work_orders.form_data on the LATEST
// version, without minting a new version (edits are continuous). Creates a
// version-1 row on the fly if the order has no work order yet (e.g. a legacy
// order that never got the auto-generated snapshot).
export async function PATCH(request: Request) {
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureWorkOrdersTable()
    const body = await request.json()
    const { orderId, formType, formData } = body || {}

    if (!orderId) return NextResponse.json({ success: false, error: 'orderId required' }, { status: 400 })
    if (formType !== 'drapery' && formType !== 'luma') {
      return NextResponse.json({ success: false, error: "formType must be 'drapery' or 'luma'" }, { status: 400 })
    }

    // Latest version row for this order (create one if none exists).
    let latest = await queryOne<{ id: string; form_data: any }>(
      'SELECT id, form_data FROM work_orders WHERE order_id = $1 ORDER BY version DESC LIMIT 1',
      [orderId]
    )
    if (!latest) {
      latest = await queryOne<{ id: string; form_data: any }>(
        `INSERT INTO work_orders (order_id, version, created_by, notes)
         VALUES ($1, 1, 'admin', '') RETURNING id, form_data`,
        [orderId]
      )
    }
    if (!latest) return NextResponse.json({ success: false, error: 'Could not locate work order' }, { status: 500 })

    // jsonb_set merges the one formType key without clobbering the other form.
    await query(
      `UPDATE work_orders
          SET form_data = jsonb_set(COALESCE(form_data, '{}'::jsonb), $2, $3::jsonb, true),
              updated_at = NOW()
        WHERE id = $1`,
      [latest.id, `{${formType}}`, JSON.stringify(formData ?? {})]
    )

    return NextResponse.json({ success: true })
  } catch (e) {
    return errorResponse('Could not autosave the work order.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
