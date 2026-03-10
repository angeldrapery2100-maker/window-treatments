import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { Resend } from 'resend'
import { requireAdmin } from '@/lib/auth'

const SHIPPO_API = 'https://api.goshippo.com'
const SHIPPO_TOKEN = process.env.SHIPPO_API_KEY || ''
let _resend: Resend | null = null
function getResend() { return _resend ??= new Resend(process.env.RESEND_API_KEY) }

async function shippoFetch(endpoint: string, method = 'GET', body?: any) {
  const res = await fetch(`${SHIPPO_API}${endpoint}`, {
    method,
    headers: { 'Authorization': `ShippoToken ${SHIPPO_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

async function ensureShipmentsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS order_shipments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id),
      item_indices INTEGER[] NOT NULL DEFAULT '{}',
      item_quantities JSONB DEFAULT '{}',
      parcel_length NUMERIC,
      parcel_width NUMERIC,
      parcel_height NUMERIC,
      parcel_weight NUMERIC,
      tracking_number VARCHAR(128),
      tracking_url TEXT,
      label_url TEXT,
      carrier VARCHAR(64),
      service VARCHAR(128),
      shippo_transaction_id VARCHAR(256),
      status VARCHAR(32) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {})
  // Add item_quantities column if missing (for existing tables)
  await query(`ALTER TABLE order_shipments ADD COLUMN IF NOT EXISTS item_quantities JSONB DEFAULT '{}'`).catch(() => {})
  // Legacy columns on orders
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_url text DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number varchar(128) DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url text DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_carrier varchar(64) DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shippo_transaction_id varchar(256) DEFAULT NULL`).catch(() => {})
}

// Send consolidated notification email (all shipments in one email)
async function sendConsolidatedEmail(order: any, shipments: any[]) {
  const parcelsHtml = shipments.map((s, i) => {
    const items = order.items || []
    const qtys: Record<string, number> = s.item_quantities || {}
    const indices: number[] = s.item_indices || []

    const itemLines = indices.map((idx: number) => {
      const item = items[idx]
      if (!item) return ''
      const qty = qtys[String(idx)] || item.quantity
      return `<div style="padding:4px 0;font-size:13px;color:#333;">${item.productName}${item.width ? ` (W:${item.width}"` : ''}${item.height ? ` × H:${item.height}"` : ''}${item.width ? ')' : ''} × ${qty}</div>`
    }).filter(Boolean).join('')

    return `
      <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-weight:600;font-size:14px;color:#1a1a1a;">Package ${i + 1}</span>
          <span style="font-size:12px;color:#666;background:#e9ecef;padding:2px 8px;border-radius:12px;">${s.carrier || ''}</span>
        </div>
        ${itemLines}
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid #dee2e6;">
          <p style="margin:0 0 4px;font-size:13px;color:#666;">Tracking #: <strong style="font-family:monospace;">${s.tracking_number}</strong></p>
          ${s.tracking_url ? `<a href="${s.tracking_url}" style="display:inline-block;margin-top:6px;padding:6px 16px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:5px;font-size:12px;">Track Package →</a>` : ''}
        </div>
      </div>
    `
  }).join('')

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;">
      <h2 style="font-size:22px;font-weight:300;color:#1a1a1a;margin-bottom:4px;">Angel Drapery</h2>
      <p style="color:#888;font-size:12px;margin-bottom:24px;">8827 Las Tunas Dr, Temple City, CA 91780</p>
      
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:16px;font-weight:600;color:#166534;">📦 Your order has been shipped!</p>
      </div>

      <p style="font-size:14px;color:#333;margin-bottom:8px;">Hi ${order.customer_name},</p>
      <p style="font-size:14px;color:#555;margin-bottom:20px;">
        Great news! Your order <strong>${order.order_number}</strong> has been shipped in ${shipments.length} package${shipments.length > 1 ? 's' : ''}:
      </p>

      ${parcelsHtml}

      <p style="color:#999;font-size:12px;margin-top:24px;">If you have any questions, please contact us at angeldrapery2100@gmail.com or call (626) 703-2929.</p>
    </div>
  `

  await getResend().emails.send({
    from: 'Angel Drapery <onboarding@resend.dev>',
    to: order.customer_email,
    subject: `Your order ${order.order_number} has been shipped! 📦`,
    html,
  })
}

export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { action } = body

    // ─── GET RATES ───
    if (action === 'get_rates') {
      const { orderId, parcel } = body
      const order = await queryOne('SELECT * FROM orders WHERE id = $1', [orderId])
      if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
      const address = order.shipping_address || {}

      const shipment = await shippoFetch('/shipments/', 'POST', {
        address_from: {
          name: 'Angel Drapery', company: 'Angel Drapery Inc',
          street1: '8827 Las Tunas Dr', city: 'Temple City', state: 'CA', zip: '91780', country: 'US',
          phone: '6267032929', email: 'angeldrapery2100@gmail.com',
        },
        address_to: {
          name: order.customer_name,
          street1: address.street || '', city: address.city || '', state: address.state || '', zip: address.zip || '', country: 'US',
          phone: order.customer_phone || '', email: order.customer_email,
        },
        parcels: [parcel],
        async: false,
      })


      if (!shipment.rates || shipment.rates.length === 0) {
        return NextResponse.json({
          success: false,
          error: shipment.messages?.map((m: any) => m.text).join('; ') || 'Failed to get rates'
        }, { status: 400 })
      }

      const rates = shipment.rates
        .filter((r: any) => r.amount)
        .sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount))
        .map((r: any) => ({
          rateId: r.object_id,
          carrier: r.provider,
          service: r.servicelevel?.name || r.servicelevel?.token || '',
          price: r.amount,
          currency: r.currency,
          estimatedDays: r.estimated_days || r.duration_terms || 'N/A',
          carrierImage: r.provider_image_75 || r.provider_image_200 || '',
        }))

      return NextResponse.json({ success: true, data: { rates } })
    }

    // ─── PURCHASE LABEL ───
    if (action === 'purchase_label') {
      const { orderId, rateId, itemIndices, itemQuantities, skipEmail } = body
      await ensureShipmentsTable()

      const order = await queryOne('SELECT * FROM orders WHERE id = $1', [orderId])
      if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

      const transaction = await shippoFetch('/transactions/', 'POST', {
        rate: rateId, label_file_type: 'PDF', async: false,
      })

      if (transaction.status !== 'SUCCESS') {
        return NextResponse.json({
          success: false,
          error: transaction.messages?.map((m: any) => m.text).join('; ') || 'Failed to purchase label'
        }, { status: 400 })
      }

      const indices = itemIndices || []
      const qtys = itemQuantities || {}

      await query(
        `INSERT INTO order_shipments (order_id, item_indices, item_quantities, tracking_number, tracking_url, label_url, carrier, service, shippo_transaction_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'shipped')`,
        [
          orderId, indices, JSON.stringify(qtys),
          transaction.tracking_number, transaction.tracking_url_provider, transaction.label_url,
          transaction.rate?.provider || '', transaction.rate?.servicelevel?.name || '', transaction.object_id,
        ]
      )

      // Check if all item units are shipped
      const allShipments = await query(
        `SELECT item_indices, item_quantities FROM order_shipments WHERE order_id = $1 AND status = 'shipped'`,
        [orderId]
      )
      const items = order.items || []
      // Tally shipped quantities per item index
      const shippedQtys: Record<number, number> = {}
      for (const s of allShipments) {
        const sq: Record<string, number> = s.item_quantities || {}
        if (Object.keys(sq).length > 0) {
          for (const [idx, q] of Object.entries(sq)) shippedQtys[Number(idx)] = (shippedQtys[Number(idx)] || 0) + q
        } else {
          for (const idx of (s.item_indices || [])) shippedQtys[idx] = (shippedQtys[idx] || 0) + (items[idx]?.quantity || 1)
        }
      }
      const allItemsShipped = items.length > 0 && items.every((item: any, i: number) => (shippedQtys[i] || 0) >= (item.quantity || 1))

      if (allItemsShipped) {
        await query(
          `UPDATE orders SET status = 'shipped', tracking_number = $1, tracking_url = $2, shipping_label_url = $3, shipping_carrier = $4, shippo_transaction_id = $5, updated_at = NOW() WHERE id = $6`,
          [transaction.tracking_number, transaction.tracking_url_provider, transaction.label_url, transaction.rate?.provider || '', transaction.object_id, orderId]
        )
      } else {
        await query(`UPDATE orders SET updated_at = NOW() WHERE id = $1`, [orderId])
      }

      // Only send email if not skipped (打包台 uses skipEmail=true, then sends consolidated later)
      if (!skipEmail) {
        const shippedItems = indices.map((i: number) => items[i]).filter(Boolean)
        const emailShipment = {
          carrier: transaction.rate?.provider || '',
          tracking_number: transaction.tracking_number,
          tracking_url: transaction.tracking_url_provider,
        }
        // Send single-parcel email
        try {
          await sendConsolidatedEmail(order, [{
            ...emailShipment, item_indices: indices, item_quantities: qtys,
          }])
        } catch (e: any) { console.error('[shipping] email error:', e.message) }
      }

      return NextResponse.json({
        success: true,
        data: {
          labelUrl: transaction.label_url,
          trackingNumber: transaction.tracking_number,
          trackingUrl: transaction.tracking_url_provider,
          carrier: transaction.rate?.provider || '',
          allItemsShipped,
        }
      })
    }

    // ─── GET SHIPMENTS ───
    if (action === 'get_shipments') {
      const { orderId } = body
      await ensureShipmentsTable()
      const shipments = await query(
        `SELECT * FROM order_shipments WHERE order_id = $1 ORDER BY created_at`,
        [orderId]
      )
      return NextResponse.json({ success: true, data: { shipments } })
    }

    // ─── SEND NOTIFICATION (all or single shipment) ───
    if (action === 'send_notification') {
      const { orderId, shipmentId } = body
      await ensureShipmentsTable()

      const order = await queryOne('SELECT * FROM orders WHERE id = $1', [orderId])
      if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

      let shipments
      if (shipmentId) {
        shipments = await query(
          `SELECT * FROM order_shipments WHERE id = $1 AND order_id = $2 AND status = 'shipped'`,
          [shipmentId, orderId]
        )
      } else {
        shipments = await query(
          `SELECT * FROM order_shipments WHERE order_id = $1 AND status = 'shipped' ORDER BY created_at`,
          [orderId]
        )
      }

      if (shipments.length === 0) {
        return NextResponse.json({ success: false, error: '没有已购买的运单' }, { status: 400 })
      }

      await sendConsolidatedEmail(order, shipments)
      return NextResponse.json({ success: true })
    }

    // ─── DELETE SHIPMENT ───
    if (action === 'delete_shipment') {
      const { orderId, shipmentId } = body
      await ensureShipmentsTable()

      await query(`DELETE FROM order_shipments WHERE id = $1 AND order_id = $2`, [shipmentId, orderId])

      // Re-check if order should revert from 'shipped' status
      const order = await queryOne('SELECT * FROM orders WHERE id = $1', [orderId])
      if (order && order.status === 'shipped') {
        const remaining = await query(
          `SELECT item_indices, item_quantities FROM order_shipments WHERE order_id = $1 AND status = 'shipped'`,
          [orderId]
        )
        const items = order.items || []
        const shippedQtys: Record<number, number> = {}
        for (const s of remaining) {
          const sq: Record<string, number> = s.item_quantities || {}
          if (Object.keys(sq).length > 0) {
            for (const [idx, q] of Object.entries(sq)) shippedQtys[Number(idx)] = (shippedQtys[Number(idx)] || 0) + q
          } else {
            for (const idx of (s.item_indices || [])) shippedQtys[idx] = (shippedQtys[idx] || 0) + (items[idx]?.quantity || 1)
          }
        }
        const allItemsShipped = items.length > 0 && items.every((item: any, i: number) => (shippedQtys[i] || 0) >= (item.quantity || 1))
        if (!allItemsShipped) {
          await query(`UPDATE orders SET status = 'in_production', updated_at = NOW() WHERE id = $1`, [orderId])
        }
      }

      return NextResponse.json({ success: true })
    }

    // ─── ADD MANUAL SHIPMENT (no Shippo, just record tracking) ───
    if (action === 'add_manual_shipment') {
      const { orderId, trackingNumber, carrier, itemIndices, itemQuantities } = body
      await ensureShipmentsTable()

      const order = await queryOne('SELECT * FROM orders WHERE id = $1', [orderId])
      if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

      const indices = itemIndices || []
      const qtys = itemQuantities || {}

      await query(
        `INSERT INTO order_shipments (order_id, item_indices, item_quantities, tracking_number, carrier, status)
         VALUES ($1, $2, $3, $4, $5, 'shipped')`,
        [orderId, indices, JSON.stringify(qtys), trackingNumber, carrier || '']
      )

      // Check if all item units are now shipped
      const allShipments = await query(
        `SELECT item_indices, item_quantities FROM order_shipments WHERE order_id = $1 AND status = 'shipped'`,
        [orderId]
      )
      const items = order.items || []
      const shippedQtys: Record<number, number> = {}
      for (const s of allShipments) {
        const sq: Record<string, number> = s.item_quantities || {}
        if (Object.keys(sq).length > 0) {
          for (const [idx, q] of Object.entries(sq)) shippedQtys[Number(idx)] = (shippedQtys[Number(idx)] || 0) + q
        } else {
          for (const idx of (s.item_indices || [])) shippedQtys[idx] = (shippedQtys[idx] || 0) + (items[idx]?.quantity || 1)
        }
      }
      const allItemsShipped = items.length > 0 && items.every((item: any, i: number) => (shippedQtys[i] || 0) >= (item.quantity || 1))

      if (allItemsShipped) {
        await query(
          `UPDATE orders SET status = 'shipped', tracking_number = $1, shipping_carrier = $2, updated_at = NOW() WHERE id = $3`,
          [trackingNumber, carrier || '', orderId]
        )
      } else {
        await query(`UPDATE orders SET updated_at = NOW() WHERE id = $1`, [orderId])
      }

      return NextResponse.json({ success: true, data: { allItemsShipped } })
    }

    // ─── TRACK PACKAGE ───
    if (action === 'track') {
      const { carrier, trackingNumber } = body
      const tracking = await shippoFetch(`/tracks/${carrier}/${trackingNumber}`)
      return NextResponse.json({ success: true, data: tracking })
    }

    // ─── CHECK DELIVERY STATUS (batch check all shipments for an order) ───
    if (action === 'check_delivery_status') {
      const { orderId } = body
      await ensureShipmentsTable()

      const order = await queryOne('SELECT * FROM orders WHERE id = $1', [orderId])
      if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

      const shipments = await query(
        `SELECT * FROM order_shipments WHERE order_id = $1 ORDER BY created_at`,
        [orderId]
      )

      let anyUpdated = false
      for (const s of shipments) {
        if (s.status === 'delivered' || !s.tracking_number || !s.carrier) continue
        try {
          const tracking = await shippoFetch(`/tracks/${s.carrier}/${s.tracking_number}`)
          const shippoStatus = tracking.tracking_status?.status
          if (shippoStatus === 'DELIVERED' && s.status !== 'delivered') {
            await query(`UPDATE order_shipments SET status = 'delivered' WHERE id = $1`, [s.id])
            s.status = 'delivered'
            anyUpdated = true
          }
        } catch (e: any) {
          console.error(`[shipping] track check failed for ${s.tracking_number}:`, e.message)
        }
      }

      // Auto-update order status if all delivered
      const allShipped = shipments.length > 0 && shipments.every((s: any) => !!s.tracking_number)
      const allDelivered = allShipped && shipments.every((s: any) => s.status === 'delivered')

      if (allDelivered && order.status !== 'completed') {
        await query(`UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = $1`, [orderId])
        anyUpdated = true
      }

      return NextResponse.json({
        success: true,
        data: { shipments, allDelivered, anyUpdated }
      })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    console.error('Shipping API error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
