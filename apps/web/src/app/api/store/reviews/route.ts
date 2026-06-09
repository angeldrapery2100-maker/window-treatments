// Public reviews endpoint.
//   GET  ?productId=<uuid>          → approved reviews + average + count
//   GET  ?order=<no>&email=<email>  → products in that order (to choose what to review)
//   POST { orderNumber,email,productId,rating,title,body } → submit (pending moderation)

import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { ensureReviewsTable } from '@/lib/reviews'

export async function GET(request: Request) {
  try {
    await ensureReviewsTable()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const orderNumber = (searchParams.get('order') || '').trim().toUpperCase()
    const email = (searchParams.get('email') || '').trim().toLowerCase()

    // ── Mode A: public approved reviews for a product ────────────────────────
    if (productId) {
      const reviews = await query<any>(
        `SELECT id, customer_name, rating, title, body, created_at
         FROM product_reviews
         WHERE product_id = $1 AND status = 'approved'
         ORDER BY created_at DESC LIMIT 100`,
        [productId]
      ).catch(() => [])
      const agg = await queryOne<{ avg: string; n: string }>(
        `SELECT COALESCE(AVG(rating),0) AS avg, COUNT(*) AS n
         FROM product_reviews WHERE product_id = $1 AND status = 'approved'`,
        [productId]
      ).catch(() => ({ avg: '0', n: '0' }))
      return NextResponse.json({
        success: true,
        data: {
          reviews: (reviews || []).map((r: any) => ({
            id: r.id, name: r.customer_name || 'Verified buyer', rating: r.rating,
            title: r.title, body: r.body, createdAt: r.created_at,
          })),
          average: Math.round(Number(agg?.avg || 0) * 10) / 10,
          count: Number(agg?.n || 0),
        },
      })
    }

    // ── Mode B: list reviewable products in an order (order + email) ──────────
    if (orderNumber && email) {
      const ip = getClientIp(request)
      const limit = await rateLimit('reviews-lookup', ip, { max: 20, windowSeconds: 600 })
      if (!limit.allowed) return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })

      const order = await queryOne<any>(
        `SELECT id, order_number, items FROM orders WHERE order_number = $1 AND LOWER(customer_email) = $2`,
        [orderNumber, email]
      ).catch(() => null)
      if (!order) return NextResponse.json({ success: false, error: 'No order found for this order number and email.' }, { status: 404 })

      // De-dup products in the order and mark which the customer already reviewed.
      const items = (Array.isArray(order.items) ? order.items : [])
      const seen = new Set<string>()
      const products: Array<{ productId: string; name: string }> = []
      for (const it of items) {
        if (it.productId && !seen.has(it.productId)) {
          seen.add(it.productId)
          products.push({ productId: it.productId, name: it.productName || 'Custom Item' })
        }
      }
      const reviewed = await query<{ product_id: string }>(
        `SELECT product_id FROM product_reviews WHERE order_number = $1 AND LOWER(customer_email) = $2`,
        [orderNumber, email]
      ).catch(() => [])
      const reviewedSet = new Set((reviewed || []).map((r: any) => r.product_id))

      return NextResponse.json({
        success: true,
        data: { products: products.map(p => ({ ...p, reviewed: reviewedSet.has(p.productId) })) },
      })
    }

    return NextResponse.json({ success: false, error: 'productId or order+email required.' }, { status: 400 })
  } catch (e) {
    console.error('[reviews] GET failed:', e)
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit('reviews-submit', ip, { max: 10, windowSeconds: 3600 })
    if (!limit.allowed) return NextResponse.json({ success: false, error: 'Too many submissions. Try again later.' }, { status: 429 })

    await ensureReviewsTable()
    const body = await request.json().catch(() => ({})) as any
    const orderNumber = String(body.orderNumber || '').trim().toUpperCase()
    const email       = String(body.email || '').trim().toLowerCase()
    const productId   = String(body.productId || '').trim()
    const rating      = Math.round(Number(body.rating))
    const title       = String(body.title || '').trim().slice(0, 160)
    const text        = String(body.body || '').trim().slice(0, 4000)

    if (!/^AD[0-9]{6}-[A-Z0-9]{4}$/.test(orderNumber) || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid order number and email required.' }, { status: 400 })
    }
    if (!(rating >= 1 && rating <= 5)) {
      return NextResponse.json({ success: false, error: 'Please choose a rating of 1–5 stars.' }, { status: 400 })
    }
    if (text.length < 3) {
      return NextResponse.json({ success: false, error: 'Please write a short review.' }, { status: 400 })
    }

    // Verify the order belongs to this email AND actually contains the product.
    const order = await queryOne<any>(
      `SELECT id, order_number, customer_name, items FROM orders
       WHERE order_number = $1 AND LOWER(customer_email) = $2`,
      [orderNumber, email]
    ).catch(() => null)
    if (!order) return NextResponse.json({ success: false, error: 'No order found for this order number and email.' }, { status: 404 })

    const items = Array.isArray(order.items) ? order.items : []
    if (!items.some((it: any) => it.productId === productId)) {
      return NextResponse.json({ success: false, error: 'That product is not part of this order.' }, { status: 400 })
    }

    try {
      await query(
        `INSERT INTO product_reviews (product_id, order_id, order_number, customer_name, customer_email, rating, title, body)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [productId, order.id, order.order_number, order.customer_name || '', email, rating, title, text]
      )
    } catch (insErr: any) {
      if (String(insErr?.message || '').includes('idx_reviews_unique')) {
        return NextResponse.json({ success: false, error: 'You have already reviewed this product for this order.' }, { status: 409 })
      }
      throw insErr
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[reviews] POST failed:', e)
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
