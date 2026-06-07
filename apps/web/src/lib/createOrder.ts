// Shared, idempotent order-creation logic.
//
// Used by BOTH:
//   - POST /api/store/orders        (primary path, called by the browser after
//                                     the PaymentIntent succeeds)
//   - POST /api/store/webhook       (fallback, called by Stripe on
//                                     payment_intent.succeeded if the browser
//                                     never reached the orders endpoint)
//
// Deduplication is by payment_intent_id, so calling this twice for the same
// payment is safe — the second call returns { ok:false, status:409, existingOrderId }.

import { query, queryOne } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { calcServerTotals } from '@/lib/orderPricing'

export interface CreateOrderInput {
  paymentIntentId: string
  customer: { name: string; email: string; phone?: string; address?: any }
  items: any[]
  shipping?: { cost?: number; carrier?: string; service?: string; rateId?: string } | null
  discount?: { code?: string | null } | null
  notes?: string
  userId?: string | null
}

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string; createdAt: any }
  | { ok: false; status: number; error: string; existingOrderId?: string }

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
  await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_source varchar(16) DEFAULT 'local'`).catch(() => {})
}

function generateOrderNumber(): string {
  const d = new Date()
  const prefix = `AD${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${rand}`
}

export async function createOrderForPaymentIntent(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { customer, items, notes, paymentIntentId, shipping, discount, userId } = input

  await ensureOrdersTable()

  if (!customer?.name || !customer?.email) {
    return { ok: false, status: 400, error: 'Name and email are required' }
  }
  if (!items || items.length === 0) {
    return { ok: false, status: 400, error: 'Cart is empty' }
  }
  if (!paymentIntentId) {
    return { ok: false, status: 400, error: 'Payment information is required' }
  }

  // ── Deduplication: same PI cannot produce two orders ─────────────────────
  const dupCheck = await queryOne<{ id: string }>(
    'SELECT id FROM orders WHERE payment_intent_id = $1',
    [paymentIntentId]
  ).catch(() => null)
  if (dupCheck) {
    return { ok: false, status: 409, error: 'An order for this payment already exists', existingOrderId: dupCheck.id }
  }

  // ── Stripe PaymentIntent verification ─────────────────────────────────────
  let pi: any
  try {
    pi = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (pi.status !== 'succeeded') {
      console.error(`[createOrder] PI ${paymentIntentId} status is "${pi.status}"`)
      return { ok: false, status: 402, error: 'Payment has not been completed' }
    }

    const piEmail    = ((pi.metadata as any)?.customerEmail || pi.receipt_email || '').toLowerCase().trim()
    const orderEmail = (customer.email || '').toLowerCase().trim()
    if (piEmail && orderEmail && piEmail !== orderEmail) {
      console.error(`[createOrder] PI email "${piEmail}" ≠ order email "${orderEmail}"`)
      return { ok: false, status: 403, error: 'Payment attribution mismatch' }
    }
  } catch (stripeErr: any) {
    console.error('[createOrder] Could not verify PaymentIntent:', stripeErr.message)
    return { ok: false, status: 400, error: 'Could not verify payment' }
  }

  const piAmountCents = pi.amount
  const piTotal       = piAmountCents / 100
  const piMeta        = (pi.metadata || {}) as Record<string, string>
  const piTaxSource   = piMeta.taxSource || 'local'
  const taxCalcId     = piMeta.taxCalculationId || ''

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
    // ── PATH A: Stripe Tax is authoritative (read from PI metadata) ──────────
    const subtotalCents   = parseInt(piMeta.subtotalCents    || '0', 10)
    const discountCents   = parseInt(piMeta.discountAmtCents || '0', 10)
    const shippingCents   = parseInt(piMeta.shippingCents    || '0', 10)
    const taxCents        = parseInt(piMeta.taxCents         || '0', 10)

    finalSubtotal      = subtotalCents   / 100
    finalDiscountCode  = piMeta.discountCode || null
    finalDiscountType  = null
    finalDiscountValue = 0
    finalDiscountAmt   = discountCents   / 100
    finalTaxAmount     = taxCents        / 100
    finalShipping      = shippingCents   / 100
    const taxableBase  = finalSubtotal - finalDiscountAmt
    finalTaxRate       = taxableBase > 0 ? finalTaxAmount / taxableBase : 0
    taxSource          = 'stripe'

    if (taxCalcId) {
      stripe.tax.transactions.createFromCalculation({
        calculation: taxCalcId,
        reference:   generateOrderNumber(),
      } as any).catch((err: any) =>
        console.warn('[createOrder] Stripe Tax transaction confirmation failed:', err?.message)
      )
    }
  } else {
    // ── PATH B: Local tax fallback — re-compute and verify against PI ─────────
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
      console.error('[createOrder] server pricing rejected:', e?.message)
      return { ok: false, status: 400, error: 'Order items could not be verified. Please contact support with your order payment reference.' }
    }

    if (Math.abs(serverPricing.total - piTotal) > 0.50) {
      console.error(`[createOrder] Server total $${serverPricing.total} differs from PI $${piTotal} by >$0.50`)
      return { ok: false, status: 400, error: 'Order total verification failed' }
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

  // ── Insert ──────────────────────────────────────────────────────────────
  const orderNumber = generateOrderNumber()

  let row: any
  try {
    row = await queryOne(
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
        userId || null,
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
        taxSource,
        piTotal,
        paymentIntentId,
        'paid',
        notes || '',
        finalShipping,
        shipping ? `${shipping.carrier} - ${shipping.service}` : null,
        shipping?.rateId || null,
      ]
    )
  } catch (insErr: any) {
    // Unique violation on payment_intent_id means a concurrent caller (browser
    // vs webhook) won the race — treat as "already exists", not an error.
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM orders WHERE payment_intent_id = $1', [paymentIntentId]
    ).catch(() => null)
    if (existing) {
      return { ok: false, status: 409, error: 'An order for this payment already exists', existingOrderId: existing.id }
    }
    throw insErr
  }

  // Increment discount used_count (non-blocking)
  if (finalDiscountCode) {
    await query(
      `UPDATE discount_codes SET used_count = used_count + 1, updated_at = NOW()
       WHERE UPPER(code) = UPPER($1)`,
      [finalDiscountCode]
    ).catch(() => {})
  }

  return { ok: true, orderId: row.id, orderNumber: row.order_number, createdAt: row.created_at }
}
