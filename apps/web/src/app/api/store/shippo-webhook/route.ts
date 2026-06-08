// Shippo tracking webhook — keeps order/shipment status in sync with the
// carrier automatically, so orders don't sit on "shipped" forever and delivery
// problems get surfaced.
//
// Configure in Shippo: Settings → Webhooks → add
//   https://angel-drapery.com/api/store/shippo-webhook?token=<SHIPPO_WEBHOOK_SECRET>
// event type "Track Updated".
//
// Security:
//  - Shippo does not sign webhook payloads. We gate on a shared secret passed
//    in the URL (?token=) and ONLY act on tracking numbers that already exist
//    in our order_shipments table, so a forged POST can do nothing useful.
//  - If SHIPPO_WEBHOOK_SECRET is unset we log and accept (lets you wire it up
//    before setting the secret), but setting it is strongly recommended.

import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { recordOrderHistory } from '@/lib/orderHistory'
import { sendShippingAlertEmail, sendOrderStatusEmail } from '@/lib/orderEmails'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Map Shippo tracking_status.status → our shipment status
function mapStatus(shippo: string): { shipment: string; problem: boolean } {
  switch ((shippo || '').toUpperCase()) {
    case 'DELIVERED':  return { shipment: 'delivered', problem: false }
    case 'TRANSIT':    return { shipment: 'transit',   problem: false }
    case 'PRE_TRANSIT':return { shipment: 'pre_transit', problem: false }
    case 'RETURNED':   return { shipment: 'returned',  problem: true }
    case 'FAILURE':    return { shipment: 'failure',   problem: true }
    default:           return { shipment: 'unknown',   problem: false }
  }
}

export async function POST(request: Request) {
  try {
    const secret = process.env.SHIPPO_WEBHOOK_SECRET || ''
    if (secret) {
      const url = new URL(request.url)
      if (url.searchParams.get('token') !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      console.warn('[shippo-webhook] SHIPPO_WEBHOOK_SECRET not set — accepting unauthenticated webhook')
    }

    const body = await request.json().catch(() => null) as any
    if (!body) return NextResponse.json({ error: 'Bad payload' }, { status: 400 })

    // Shippo nests the track object under `data` for webhook events; accept a
    // flat track object too for resilience.
    const track = body.data || body
    const trackingNumber: string = track?.tracking_number || ''
    const carrier: string        = track?.carrier || ''
    const shippoStatus: string   = track?.tracking_status?.status || track?.tracking_status || ''
    const statusDetail: string   = track?.tracking_status?.status_details || ''

    if (!trackingNumber || !shippoStatus) {
      // Ack so Shippo doesn't retry a payload we can't use.
      return NextResponse.json({ received: true, note: 'no tracking number/status' })
    }

    // Only act on tracking numbers we actually issued.
    const shipment = await queryOne<any>(
      `SELECT s.id, s.order_id, s.status AS shipment_status, s.carrier,
              o.order_number, o.customer_name, o.customer_email, o.status AS order_status
       FROM order_shipments s
       JOIN orders o ON o.id = s.order_id
       WHERE s.tracking_number = $1
       LIMIT 1`,
      [trackingNumber]
    ).catch(() => null)

    if (!shipment) {
      return NextResponse.json({ received: true, note: 'unknown tracking number' })
    }

    const mapped = mapStatus(shippoStatus)

    // Idempotent: skip if nothing changed.
    if (shipment.shipment_status === mapped.shipment) {
      return NextResponse.json({ received: true, note: 'no change' })
    }

    await query(
      `UPDATE order_shipments SET status = $1 WHERE id = $2`,
      [mapped.shipment, shipment.id]
    )

    await recordOrderHistory({
      order_id: shipment.order_id,
      action: 'shipment_tracking_update',
      actor_email: 'system@shippo',
      note: `${carrier || shipment.carrier || 'carrier'} ${trackingNumber}: ${shippoStatus}${statusDetail ? ` — ${statusDetail}` : ''}`,
    }).catch(() => {})

    // ── Problem statuses → alert the merchant ────────────────────────────────
    if (mapped.problem) {
      await sendShippingAlertEmail({
        orderNumber: shipment.order_number,
        trackingNumber,
        carrier: carrier || shipment.carrier,
        status: shippoStatus,
        detail: statusDetail,
      }).catch(() => {})
    }

    // ── Delivered → advance the order when ALL its shipments are delivered ────
    if (mapped.shipment === 'delivered' && shipment.order_status !== 'completed' && shipment.order_status !== 'cancelled') {
      const remaining = await queryOne<{ n: string }>(
        `SELECT COUNT(*) AS n FROM order_shipments
         WHERE order_id = $1 AND tracking_number IS NOT NULL AND status <> 'delivered'`,
        [shipment.order_id]
      ).catch(() => ({ n: '1' }))

      if (Number(remaining?.n ?? 1) === 0) {
        await query(
          `UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = $1`,
          [shipment.order_id]
        )
        await recordOrderHistory({
          order_id: shipment.order_id,
          action: 'status_changed',
          from_status: shipment.order_status,
          to_status: 'completed',
          actor_email: 'system@shippo',
          note: 'All shipments delivered',
        }).catch(() => {})
        await sendOrderStatusEmail({
          kind: 'completed',
          orderNumber: shipment.order_number,
          customerName: shipment.customer_name,
          customerEmail: shipment.customer_email,
        }).catch(() => {})
      }
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('[shippo-webhook] handler error:', e)
    // 200 so Shippo doesn't hammer retries on a transient bug; we logged it.
    return NextResponse.json({ received: true, note: 'handled with error' })
  }
}
