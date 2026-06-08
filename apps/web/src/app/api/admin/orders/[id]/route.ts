import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { queryOne, query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { recordOrderHistory } from '@/lib/orderHistory'
import { recordAudit } from '@/lib/audit'

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
  } catch (e) {
    console.error(`GET /api/admin/orders/${id} error:`, e)
    return errorResponse('Could not load the order.', 500, e)
  }
}

// POST /api/admin/orders/[id]  { amount?: number, reason?: string }
// Issue a PARTIAL (or remaining-full) refund WITHOUT cancelling the order.
// Distinct from DELETE, which cancels the order and refunds in full.
//   - amount omitted/0 → refund the entire remaining un-refunded balance
//   - amount > 0       → refund exactly that dollar amount
// Cumulative refunds are tracked in orders.refunded_amount and can never
// exceed the order total.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let adminUser
  try {
    adminUser = requireAdmin(request)
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_amount numeric(10,2) DEFAULT 0`).catch(() => {})

    const order = await queryOne<any>('SELECT * FROM orders WHERE id = $1', [id])
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    if (!order.payment_intent_id || order.payment_status === 'unpaid') {
      return NextResponse.json({ success: false, error: 'This order has no captured payment to refund.' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({})) as any
    const total          = Number(order.total) || 0
    const alreadyRefunded = Number(order.refunded_amount) || 0
    const remaining      = Math.round((total - alreadyRefunded) * 100) / 100

    if (remaining <= 0) {
      return NextResponse.json({ success: false, error: 'This order has already been fully refunded.' }, { status: 400 })
    }

    // Resolve refund amount (dollars). Omitted → full remaining balance.
    let refundDollars: number
    if (body.amount === undefined || body.amount === null || body.amount === '') {
      refundDollars = remaining
    } else {
      refundDollars = Math.round(Number(body.amount) * 100) / 100
      if (!Number.isFinite(refundDollars) || refundDollars <= 0) {
        return NextResponse.json({ success: false, error: 'Enter a refund amount greater than $0.' }, { status: 400 })
      }
      if (refundDollars > remaining + 0.001) {
        return NextResponse.json(
          { success: false, error: `Refund exceeds the remaining balance of $${remaining.toFixed(2)}.` },
          { status: 400 }
        )
      }
    }

    const refundCents = Math.round(refundDollars * 100)
    const reason = typeof body.reason === 'string' ? body.reason.slice(0, 500) : ''

    let refund
    try {
      refund = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: refundCents,
        metadata: { orderNumber: order.order_number, reason },
      })
    } catch (stripeErr: any) {
      console.error('[refund] Stripe error:', stripeErr.message)
      return NextResponse.json({ success: false, error: 'Refund could not be processed. Please try again.' }, { status: 502 })
    }

    const newRefunded = Math.round((alreadyRefunded + refundDollars) * 100) / 100
    const fullyRefunded = newRefunded >= total - 0.001
    const newPaymentStatus = fullyRefunded ? 'refunded' : 'partially_refunded'

    await query(
      `UPDATE orders SET refunded_amount = $1, payment_status = $2, updated_at = NOW() WHERE id = $3`,
      [newRefunded, newPaymentStatus, id]
    )

    await recordOrderHistory({
      order_id: id,
      action: fullyRefunded ? 'refunded_full' : 'refunded_partial',
      actor_email: adminUser.email,
      note: `Refunded $${refundDollars.toFixed(2)}${reason ? ` — ${reason}` : ''} (total refunded $${newRefunded.toFixed(2)} of $${total.toFixed(2)})`,
    }).catch(() => {})
    await recordAudit({
      action: 'order.partial_refund',
      actor_id: adminUser.id,
      actor_email: adminUser.email,
      target_type: 'order',
      target_id: id,
      before: { refunded_amount: alreadyRefunded, payment_status: order.payment_status },
      after: { refunded_amount: newRefunded, payment_status: newPaymentStatus },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      data: { refundId: refund.id, refunded: refundDollars, totalRefunded: newRefunded, paymentStatus: newPaymentStatus },
    })
  } catch (e) {
    console.error(`POST /api/admin/orders/${id} refund error:`, e)
    return errorResponse('Could not process the refund.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
