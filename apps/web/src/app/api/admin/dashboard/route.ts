import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // Orders stats
    const orderStats = await queryOne<any>(`
      SELECT
        COUNT(*)                                                            AS total_orders,
        COUNT(*) FILTER (WHERE status = 'pending')                         AS pending,
        COUNT(*) FILTER (WHERE status = 'in_production')                   AS in_production,
        COUNT(*) FILTER (WHERE status = 'shipped')                         AS shipped,
        COUNT(*) FILTER (WHERE status = 'completed')                       AS completed,
        COUNT(*) FILTER (WHERE status = 'cancelled')                       AS cancelled,
        COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'), 0)    AS total_revenue,
        COALESCE(SUM(total) FILTER (WHERE payment_status = 'paid'
          AND created_at >= date_trunc('month', now())), 0)                AS revenue_this_month,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()))   AS orders_this_month
      FROM orders
    `)

    // Product stats
    const productStats = await queryOne<any>(`
      SELECT
        COUNT(*)                                   AS total_products,
        COUNT(*) FILTER (WHERE is_active = true)   AS active_products,
        COUNT(*) FILTER (WHERE is_active = false)  AS inactive_products
      FROM products
    `)

    // Discount stats
    const discountStats = await queryOne<any>(`
      SELECT
        COUNT(*)                                    AS total_codes,
        COUNT(*) FILTER (WHERE is_active = true)    AS active_codes,
        COALESCE(SUM(used_count), 0)                AS total_uses
      FROM discount_codes
    `)

    return NextResponse.json({
      success: true,
      data: {
        orders: orderStats,
        products: productStats,
        discounts: discountStats,
      }
    })
  } catch (e) {
    if (e instanceof Error && e.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        data: {
          orders: { total_orders: 0, pending: 0, in_production: 0, shipped: 0, completed: 0, cancelled: 0, total_revenue: 0, revenue_this_month: 0, orders_this_month: 0 },
          products: { total_products: 0, active_products: 0, inactive_products: 0 },
          discounts: { total_codes: 0, active_codes: 0, total_uses: 0 },
        }
      })
    }
    return errorResponse('Could not load dashboard data.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
