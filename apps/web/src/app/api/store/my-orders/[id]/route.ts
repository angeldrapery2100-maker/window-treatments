import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { getUserFromRequest } from '@/lib/auth'
import { queryOne, query } from '@/lib/db'

// GET /api/store/my-orders/[id]
// Returns a single order by ID — only if it belongs to the authenticated user.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params

  try {
    const order = await queryOne<any>(
      `SELECT id, order_number, status, items, subtotal, discount_code, discount_amount,
              shipping_cost, tax_amount, total, tracking_number, tracking_url,
              shipping_carrier, shipping_address, payment_status,
              customer_name, customer_email, customer_phone,
              created_at, updated_at
       FROM orders
       WHERE id = $1 AND LOWER(customer_email) = LOWER($2)`,
      [id, user.email]
    )

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // Fetch shipments
    const shipments = await query(
      `SELECT id, order_id, item_indices, item_quantities, tracking_number, tracking_url,
              carrier, service, status, created_at
       FROM order_shipments
       WHERE order_id = $1
       ORDER BY created_at ASC`,
      [id]
    ).catch(() => [])

    return NextResponse.json({
      success: true,
      data: { ...order, shipments },
    })
  } catch (e: any) {
    console.error(`GET /api/store/my-orders/${id} error:`, e)
    return errorResponse('Could not load the order.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
