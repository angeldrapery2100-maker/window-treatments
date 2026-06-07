import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { getUserFromRequest } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const orders = await query(
      `SELECT id, order_number, status, items, subtotal, discount_code, discount_amount, total,
       shipping_cost, tax_amount, tracking_number, tracking_url, shipping_carrier, created_at, updated_at,
       shipping_address
       FROM orders WHERE customer_email = LOWER($1) ORDER BY created_at DESC`,
      [user.email]
    )

    // Fetch shipments for all orders
    const orderIds = orders.map((o: any) => o.id)
    let shipmentsMap: Record<string, any[]> = {}

    if (orderIds.length > 0) {
      try {
        const shipments = await query(
          `SELECT id, order_id, item_indices, item_quantities, tracking_number, tracking_url,
           carrier, service, status, created_at
           FROM order_shipments
           WHERE order_id = ANY($1)
           ORDER BY created_at ASC`,
          [orderIds]
        )
        for (const s of shipments) {
          if (!shipmentsMap[s.order_id]) shipmentsMap[s.order_id] = []
          shipmentsMap[s.order_id].push(s)
        }
      } catch {
        // order_shipments table may not exist yet
      }
    }

    const data = orders.map((o: any) => ({
      ...o,
      shipments: shipmentsMap[o.id] || [],
    }))

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      return NextResponse.json({ success: true, data: [] })
    }
    return errorResponse('Could not load your orders.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
