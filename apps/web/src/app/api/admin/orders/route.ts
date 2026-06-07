import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { recordAudit } from '@/lib/audit'
import { recordOrderHistory } from '@/lib/orderHistory'
import { requireAdmin } from '@/lib/auth'
import { ensureOrdersSchema } from '@/lib/createOrder'

// ─── Valid status transitions ─────────────────────────────────────────────────
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:       ['in_production', 'cancelled'],
  in_production: ['shipped', 'cancelled'],
  shipped:       ['completed', 'cancelled'],
  completed:     [],
  cancelled:     [],
}

function canTransition(from: string, to: string): boolean {
  return (VALID_TRANSITIONS[from] ?? []).includes(to)
}

// ─── GET: list orders with pagination, search, filter, sort ──────────────────
export async function GET(request: Request) {
  try {
    // Applies the orders schema / dedup migration on read paths too, so fixes
    // land as soon as the admin opens the orders page (not on next checkout).
    await ensureOrdersSchema().catch(() => {})

    const { searchParams } = new URL(request.url)
    const status      = searchParams.get('status')
    const search      = searchParams.get('search')       // order_number / customer name / email
    const page        = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit       = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const sortField   = ['created_at', 'updated_at', 'total', 'status', 'customer_name'].includes(searchParams.get('sort') ?? '')
                          ? searchParams.get('sort')!
                          : 'created_at'
    const sortDir     = searchParams.get('dir') === 'asc' ? 'ASC' : 'DESC'

    // ── CSV export ──────────────────────────────────────────────────────────
    if (searchParams.get('export') === 'csv') {
      let csvSql = `SELECT order_number, customer_name, customer_email, customer_phone,
                           status, payment_status, subtotal, discount_amount, shipping_cost,
                           tax_amount, total, created_at, notes
                    FROM orders WHERE 1=1`
      const csvParams: any[] = []
      let csvIdx = 1
      if (status && status !== 'all') {
        csvSql += ` AND status = $${csvIdx++}`
        csvParams.push(status)
      }
      if (search) {
        csvSql += ` AND (order_number ILIKE $${csvIdx} OR customer_name ILIKE $${csvIdx} OR customer_email ILIKE $${csvIdx})`
        csvParams.push(`%${search}%`)
        csvIdx++
      }
      csvSql += ` ORDER BY ${sortField} ${sortDir}`
      const rows = await query(csvSql, csvParams)

      const header = ['Order #', 'Customer', 'Email', 'Phone', 'Status', 'Payment', 'Subtotal', 'Discount', 'Shipping', 'Tax', 'Total', 'Created', 'Notes']
      const lines = [
        header.join(','),
        ...rows.map((r: any) => [
          r.order_number, r.customer_name, r.customer_email, r.customer_phone,
          r.status, r.payment_status, r.subtotal, r.discount_amount, r.shipping_cost,
          r.tax_amount, r.total, r.created_at, `"${(r.notes || '').replace(/"/g, '""')}"`
        ].join(','))
      ]
      return new Response(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="orders-${Date.now()}.csv"`,
        }
      })
    }

    let sql = `SELECT * FROM orders WHERE 1=1`
    const params: any[] = []
    let idx = 1

    if (status && status !== 'all') {
      sql += ` AND status = $${idx++}`
      params.push(status)
    }
    if (search) {
      sql += ` AND (order_number ILIKE $${idx} OR customer_name ILIKE $${idx} OR customer_email ILIKE $${idx})`
      params.push(`%${search}%`)
      idx++
    }

    // Count total for pagination
    const countSql = sql.replace('SELECT * FROM orders', 'SELECT COUNT(*) AS cnt FROM orders')
    const countRow = await queryOne<{ cnt: string }>(countSql, params)
    const total = parseInt(countRow?.cnt ?? '0', 10)

    sql += ` ORDER BY ${sortField} ${sortDir} LIMIT $${idx++} OFFSET $${idx++}`
    params.push(limit, (page - 1) * limit)

    const orders = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (e) {
    if (e instanceof Error && e.message.includes('does not exist')) {
      return NextResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } })
    }
    return errorResponse('Could not load orders.', 500, e)
  }
}

// ─── PATCH: update status / admin_notes ──────────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const adminUser = requireAdmin(request)
    const body = await request.json() as any
    const { id, status, admin_notes } = body

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const order = await queryOne<any>('SELECT * FROM orders WHERE id = $1', [id])
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    // ── State machine validation ────────────────────────────────────────────
    if (status !== undefined && status !== order.status) {
      if (!canTransition(order.status, status)) {
        return NextResponse.json({
          success: false,
          error: `不允许的状态变更：${order.status} → ${status}（允许：${(VALID_TRANSITIONS[order.status] ?? []).join(', ') || '无'}）`
        }, { status: 400 })
      }

      // Extra validation: 'shipped' requires all items shipped with tracking
      if (status === 'shipped') {
        let shipments: any[] = []
        try {
          shipments = await query(
            `SELECT item_indices, item_quantities, tracking_number FROM order_shipments WHERE order_id = $1 AND status = 'shipped'`,
            [id]
          )
        } catch {}

        const items = order.items || []
        const shippedQtys: Record<number, number> = {}
        let allHaveTracking = shipments.length > 0
        for (const s of shipments) {
          if (!s.tracking_number) allHaveTracking = false
          const sq: Record<string, number> = s.item_quantities || {}
          if (Object.keys(sq).length > 0) {
            for (const [idx2, q] of Object.entries(sq)) shippedQtys[Number(idx2)] = (shippedQtys[Number(idx2)] || 0) + (q as number)
          } else {
            for (const idx2 of (s.item_indices || [])) shippedQtys[idx2] = (shippedQtys[idx2] || 0) + (items[idx2]?.quantity || 1)
          }
        }
        const allItemsShipped = items.length > 0 && items.every((item: any, i: number) => (shippedQtys[i] || 0) >= (item.quantity || 1))
        if (!allItemsShipped || !allHaveTracking) {
          return NextResponse.json({ success: false, error: '所有商品必须已发货并有运单号才能标记为已发货' }, { status: 400 })
        }
      }
    }

    const setClauses: string[] = []
    const values: any[] = []
    let paramIdx = 1

    if (status !== undefined) {
      setClauses.push('status = $' + paramIdx++)
      values.push(status)
    }
    if (admin_notes !== undefined) {
      setClauses.push('admin_notes = $' + paramIdx++)
      values.push(admin_notes)
    }

    if (setClauses.length === 0) return NextResponse.json({ success: false, error: 'No fields' }, { status: 400 })

    setClauses.push('updated_at = NOW()')
    values.push(id)

    await query('UPDATE orders SET ' + setClauses.join(', ') + ' WHERE id = $' + paramIdx, values)

    // ── Record history ──────────────────────────────────────────────────────
    if (status !== undefined && status !== order.status) {
      await recordOrderHistory({
        order_id: id,
        action: 'status_changed',
        from_status: order.status,
        to_status: status,
        actor_email: adminUser.email,
      })
      await recordAudit({
        action: 'order.status_changed',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'order',
        target_id: id,
        before: { status: order.status },
        after: { status },
      })
    }
    if (admin_notes !== undefined) {
      await recordOrderHistory({
        order_id: id,
        action: 'notes_updated',
        actor_email: adminUser.email,
        note: admin_notes,
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

// ─── DELETE: cancel order + refund ───────────────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const adminUser = requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const order = await queryOne<any>('SELECT * FROM orders WHERE id = $1', [id])
    if (!order) return NextResponse.json({ success: false, error: '订单不存在' }, { status: 404 })

    if (order.status === 'cancelled') {
      return NextResponse.json({ success: false, error: '订单已取消' }, { status: 400 })
    }
    if (order.status === 'completed') {
      return NextResponse.json({ success: false, error: '已完成的订单无法取消' }, { status: 400 })
    }

    let refundResult: { refunded: boolean; refundId?: string; amount?: number; error?: string } = { refunded: false }

    if (order.payment_intent_id && order.payment_status === 'paid') {
      try {
        const refund = await stripe.refunds.create({ payment_intent: order.payment_intent_id })
        refundResult = { refunded: true, refundId: refund.id, amount: refund.amount }
      } catch (stripeErr: any) {
        console.error('[cancel] Stripe refund error:', stripeErr.message)
        refundResult = { refunded: false, error: stripeErr.message }
      }
    }

    const paymentStatus = refundResult.refunded
      ? 'refunded'
      : order.payment_status === 'paid' ? 'refund_failed' : order.payment_status

    await query(
      "UPDATE orders SET status = 'cancelled', payment_status = $1, updated_at = NOW() WHERE id = $2",
      [paymentStatus, id]
    )

    await recordOrderHistory({
      order_id: id,
      action: refundResult.refunded ? 'cancelled_with_refund' : 'cancelled',
      from_status: order.status,
      to_status: 'cancelled',
      actor_email: adminUser.email,
      note: refundResult.error ? `退款失败: ${refundResult.error}` : undefined,
    })
    await recordAudit({
      action: refundResult.refunded ? 'order.refunded' : 'order.cancelled',
      actor_id: adminUser.id,
      actor_email: adminUser.email,
      target_type: 'order',
      target_id: id,
      before: { status: order.status, payment_status: order.payment_status },
      after: { status: 'cancelled', payment_status: paymentStatus },
    })

    return NextResponse.json({
      success: true,
      data: { cancelled: true, refund: refundResult, paymentStatus }
    })
  } catch (e) {
    console.error('[cancel] Error:', e)
    return errorResponse('Could not delete the order. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
