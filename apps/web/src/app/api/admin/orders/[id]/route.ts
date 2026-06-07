import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { queryOne, query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// GET /api/admin/orders/[id] — fetch a single order with full detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request)
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const order = await queryOne<any>(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    )
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // Also fetch shipments for this order
    const shipments = await query(
      `SELECT id, tracking_number, tracking_url, label_url, carrier, service, status, item_indices, item_quantities, created_at
       FROM order_shipments WHERE order_id = $1 ORDER BY created_at ASC`,
      [id]
    ).catch(() => [])

    return NextResponse.json({ success: true, data: { order, shipments } })
  } catch (e: any) {
    console.error(`GET /api/admin/orders/${id} error:`, e)
    return errorResponse('Could not load the order.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
