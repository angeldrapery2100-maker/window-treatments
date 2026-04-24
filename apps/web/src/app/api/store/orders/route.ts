import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { calcServerTotals } from '@/lib/orderPricing'

async function ensureOrdersTable() {
  await query(`CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number varchar(32) NOT NULL UNIQUE,
    user_id uuid DEFAULT NULL,
    status varchar(32) NOT NULL DEFAULT 'pending',
    customer_name varchar(256) NOT NULL,
    customer_email varchar(256) NOT NULL,
    customer_phone varchar(64) DEFAULT '',
    shipping_address jsonb DEFAULT '{}',
    items jsonb NOT NULL DEFAULT '[]',
    subtotal numeric(10,2) NOT NULL DEFAULT 0,
    discount_code varchar(64) DEFAULT NULL,
    discount_type varchar(16) DEFAULT NULL,
    discount_value numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL DEFAULT 0,
    payment_intent_id varchar(256) DEFAULT NULL,
    payment_status varchar(32) DEFAULT 'unpaid',
    notes text DEFAULT '',
    admin_notes text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id varchar(256) DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status varchar(32) DEFAULT 'unpaid'`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) DEFAULT 0`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method varchar(256) DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_rate_id varchar(256) DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_rate numeric(6,4) DEFAULT 0`).catch(() => {})
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount numeric(10,2) DEFAULT 0`).catch(() => {})
  // Track where the tax amount came from: 'stripe' = Stripe Tax, 'local' = server-side state estimate
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_source varchar(16) DEFAULT 'local'`).catch(() => {})
}

function generateOrderNumber(): string {
  const d = new Date()
  const prefix = `AD${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${rand}`
}

// POST: create a new order
export async function POST(request: Request) {
  try {
    await ensureOrdersTable()
    const body = await request.json() as any
    const { customer, items, notes, paymentIntentId, shipping, discount } = body

    if (!customer?.name || !customer?.email) {
      return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 })
    }
    if (!paymentIntentId) {
      return NextResponse.json({ success: false, error: 'Payment information is required' }, { status: 400 })
    }

    // ── Deduplication: same PI cannot produce two orders ─────────────────────
    const dupCheck = await queryOne<{ id: string }>(
      'SELECT id FROM orders WHERE payment_intent_id = $1',
      [paymentIntentId]
    ).catch(() => null)
    if (dupCheck) {
      return NextResponse.json(
        { success: false, error: 'An order for this payment already exists', data: { orderId: dupCheck.id } },
        { status: 409 }
      )
    }

    // ── Stripe PaymentIntent verification ─────────────────────────────────────
    let pi: any
    try {
      pi = await stripe.paymentIntents.retrieve(paymentIntentId)

      // 1. Must be succeeded
      if (pi.status !== 'succeeded') {
        console.error(`[orders] PI ${paymentIntentId} status is "${pi.status}"`)
        return NextResponse.json({ success: false, error: 'Payment has not been completed' }, { status: 402 })
      }

      // 2. Email attribution
      const piEmail    = ((pi.metadata as any)?.customerEmail || pi.receipt_email || '').toLowerCase().trim()
      const orderEmail = (customer.email || '').toLowerCase().trim()
      if (piEmail && orderEmail && piEmail !== orderEmail) {
        console.error(`[orders] PI email "${piEmail}" ≠ order email "${orderEmail}"`)
        return NextResponse.json({ success: false, error: 'Payment attribution mismatch' }, { status: 403 })
      }
    } catch (stripeErr: any) {
      console.error('[orders] Could not verify PaymentIntent:', stripeErr.message)
      return NextResponse.json({ success: false, error: 'Could not verify payment' }, { status: 400 })
    }

    const piAmountCents = pi.amount                                  // what Stripe charged
    const piTotal       = piAmountCents / 100
    const piMeta        = (pi.metadata || {}) as Record<string, string>
    const piTaxSource   = piMeta.taxSource || 'local'                // 'stripe' | 'local'
    const taxCalcId     = piMeta.taxCalculationId || ''

    // ── Financial reconciliation ──────────────────────────────────────────────
    //
    // TWO PATHS depending on whether Stripe Tax was used:
    //
    //  PATH A — Stripe Tax (taxSource === 'stripe'):
    //    The PaymentIntent was created using a Stripe Tax Calculation.
    //    Stripe is the authoritative source for all financial figures.
    //    We read amounts from PI metadata (set by create-payment-intent) and
    //    trust them because they were computed server-side before PI creation.
    //    We do NOT re-run calcServerTotals (it uses local rates, would diverge).
    //
    //  PATH B — Local tax fallback (taxSource === 'local'):
    //    No Stripe Tax Calculation exists.  We re-run calcServerTotals with the
    //    same inputs used at PI creation and verify the totals match (±$0.50).
    //    This mirrors the previous behaviour and keeps local rates consistent.

    let finalSubtotal:      number
    let finalDiscountCode:  string | null
    let finalDiscountType:  string | null
    let finalDiscountValue: number
    let finalDiscountAmt:   number
    let finalTaxRate:       number
    let finalTaxAmount:     number
    let finalShipping:      number
    let taxSource:          string

    if (piTaxSource === 'stripe' && taxCalcId) {
      // ── PATH A: Stripe Tax is authoritative ──────────────────────────────
      // Amounts are read from PI metadata written by create-payment-intent.
      const subtotalCents   = parseInt(piMeta.subtotalCents    || '0', 10)
      const discountCents   = parseInt(piMeta.discountAmtCents || '0', 10)
      const shippingCents   = parseInt(piMeta.shippingCents    || '0', 10)
      const taxCents        = parseInt(piMeta.taxCents         || '0', 10)

      finalSubtotal      = subtotalCents   / 100
      finalDiscountCode  = piMeta.discountCode || null
      finalDiscountType  = null    // not stored in metadata — acceptable for PATH A
      finalDiscountValue = 0
      finalDiscountAmt   = discountCents   / 100
      finalTaxAmount     = taxCents        / 100
      finalShipping      = shippingCents   / 100
      // Effective rate = tax / (subtotal − discount); stored for display only
      const taxableBase  = finalSubtotal - finalDiscountAmt
      finalTaxRate       = taxableBase > 0 ? finalTaxAmount / taxableBase : 0
      taxSource          = 'stripe'

      // Confirm the Stripe Tax transaction (required for compliance / reporting).
      // Non-blocking — order creation continues even if this fails.
      if (taxCalcId) {
        stripe.tax.transactions.createFromCalculation({
          calculation: taxCalcId,
          reference:   generateOrderNumber(), // will be replaced by real order number below
        } as any).catch((err: any) =>
          console.warn('[orders] Stripe Tax transaction confirmation failed:', err?.message)
        )
      }

    } else {
      // ── PATH B: Local tax fallback — re-compute and verify against PI ────
      //
      // Client-supplied unitPrice is used only as an INPUT to calcServerTotals,
      // which re-queries the `products` table by id, enforces base_price as
      // the floor, caps configured prices at UNIT_PRICE_CAP_MULT × base_price,
      // and throws for any unknown/inactive productId. The ±$0.50 reconciliation
      // against the actual Stripe charge below is the bottom-line check.
      const pricingItems = (items as any[]).map(i => ({
        productId: i.productId,
        quantity:  i.quantity,
        price:     i.unitPrice ?? i.price ?? 0,
      }))

      let serverPricing
      try {
        serverPricing = await calcServerTotals({
          items:        pricingItems,
          discountCode: discount?.code || null,
          shippingCost: shipping?.cost || 0,
          state:        customer?.address?.state || '',
          zip:          customer?.address?.zip   || '',
        })
      } catch (e: any) {
        console.error('[orders] server pricing rejected:', e?.message)
        return NextResponse.json(
          { success: false, error: 'Order items could not be verified. Please contact support with your order payment reference.' },
          { status: 400 }
        )
      }

      // Verify server total matches PI (within $0.50)
      if (Math.abs(serverPricing.total - piTotal) > 0.50) {
        console.error(
          `[orders] Server-recomputed total $${serverPricing.total} ` +
          `differs from PI amount $${piTotal} by >$0.50`
        )
        return NextResponse.json(
          { success: false, error: 'Order total verification failed' },
          { status: 400 }
        )
      }

      finalSubtotal      = serverPricing.subtotal
      finalDiscountCode  = serverPricing.discountCode
      finalDiscountType  = serverPricing.discountType
      finalDiscountValue = serverPricing.discountValue
      finalDiscountAmt   = serverPricing.discountAmount
      finalTaxRate       = serverPricing.taxRate
      finalTaxAmount     = serverPricing.taxAmount
      finalShipping      = serverPricing.shippingCost
      taxSource          = 'local'
    }

    // ── Insert ────────────────────────────────────────────────────────────────
    const authUser    = getUserFromRequest(request)
    const userId      = authUser?.id || null
    const orderNumber = generateOrderNumber()

    const row = await queryOne(
      `INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, items, subtotal,
        discount_code, discount_type, discount_value, discount_amount,
        tax_rate, tax_amount, tax_source,
        total, payment_intent_id, payment_status, notes,
        shipping_cost, shipping_method, shipping_rate_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      RETURNING id, order_number, created_at`,
      [
        orderNumber,
        userId,
        customer.name,
        customer.email,
        customer.phone || '',
        JSON.stringify(customer.address || {}),
        JSON.stringify(items),
        finalSubtotal,
        finalDiscountCode,
        finalDiscountType,
        finalDiscountValue,
        finalDiscountAmt,
        finalTaxRate,
        finalTaxAmount,
        taxSource,                                           // 'stripe' | 'local'
        piTotal,                                             // authoritative: what Stripe charged
        paymentIntentId,
        'paid',
        notes || '',
        finalShipping,
        shipping ? `${shipping.carrier} - ${shipping.service}` : null,
        shipping?.rateId || null,
      ]
    )

    // Increment discount used_count (non-blocking)
    if (finalDiscountCode) {
      await query(
        `UPDATE discount_codes SET used_count = used_count + 1, updated_at = NOW()
         WHERE UPPER(code) = UPPER($1)`,
        [finalDiscountCode]
      ).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      data: { orderId: row.id, orderNumber: row.order_number, createdAt: row.created_at }
    })
  } catch (e: any) {
    console.error('POST /api/store/orders error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
