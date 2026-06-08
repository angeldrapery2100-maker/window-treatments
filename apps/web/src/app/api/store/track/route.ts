// Guest order tracking — look up an order by order number + email.
//
// Security:
//  - Requires BOTH the order number AND the matching customer email, so an
//    order number alone (e.g. leaked in a screenshot) reveals nothing.
//  - Rate-limited per IP to block enumeration.
//  - Returns a deliberately minimal, display-safe subset — no payment intent
//    ids, no internal ids, no admin notes.
//  - Same generic "not found" response for wrong number vs wrong email.

import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit('order-track', ip, { max: 15, windowSeconds: 600 })
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many lookups. Please try again in a few minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({})) as any
    const orderNumber = String(body.orderNumber || '').trim().toUpperCase()
    const email       = String(body.email || '').trim().toLowerCase()

    if (!/^AD[0-9]{6}-[A-Z0-9]{4}$/.test(orderNumber) || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid order number and email address.' },
        { status: 400 }
      )
    }

    const order = await queryOne<any>(
      `SELECT id, order_number, status, payment_status, created_at, updated_at,
              items, subtotal, discount_amount, shipping_cost, tax_amount, total,
              shipping_method, tracking_number, tracking_url
       FROM orders
       WHERE order_number = $1 AND LOWER(customer_email) = $2`,
      [orderNumber, email]
    ).catch(() => null)

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'No order found for this order number and email combination.' },
        { status: 404 }
      )
    }

    // Per-package shipments (partial shipping) — display-safe columns only.
    const shipments = await query<any>(
      `SELECT carrier, service, tracking_number, tracking_url, status, created_at
       FROM order_shipments
       WHERE order_id = $1 AND tracking_number IS NOT NULL
       ORDER BY created_at ASC`,
      [order.id]
    ).catch(() => [])

    const items = (Array.isArray(order.items) ? order.items : []).map((i: any) => ({
      productName: i.productName || 'Custom Item',
      productType: i.productType || null,
      width:  i.width  ?? null,
      height: i.height ?? null,
      quantity: Math.max(1, Number(i.quantity) || 1),
    }))

    return NextResponse.json({
      success: true,
      data: {
        orderNumber:    order.order_number,
        status:         order.status,
        paymentStatus:  order.payment_status,
        createdAt:      order.created_at,
        updatedAt:      order.updated_at,
        items,
        subtotal:       Number(order.subtotal),
        discountAmount: Number(order.discount_amount) || 0,
        shippingCost:   Number(order.shipping_cost) || 0,
        taxAmount:      Number(order.tax_amount) || 0,
        total:          Number(order.total),
        shippingMethod: order.shipping_method,
        trackingNumber: order.tracking_number,
        trackingUrl:    order.tracking_url,
        shipments: (shipments || []).map((s: any) => ({
          carrier: s.carrier, service: s.service,
          trackingNumber: s.tracking_number, trackingUrl: s.tracking_url,
          status: s.status, createdAt: s.created_at,
        })),
      },
    })
  } catch (e) {
    console.error('[track] lookup failed:', e)
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
