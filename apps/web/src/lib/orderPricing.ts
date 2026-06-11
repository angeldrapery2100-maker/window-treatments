/**
 * Server-side order pricing — used as the LOCAL FALLBACK when Stripe Tax is
 * unavailable.
 *
 * ── Tax Authority Hierarchy ───────────────────────────────────────────────
 *  1. AUTHORITATIVE (preferred): Stripe Tax Calculations API
 *     Called inside /api/store/create-payment-intent via tryStripeTaxCalculation().
 *     When active, calcServerTotals() is NOT used for tax; only subtotal /
 *     discount / shipping calculations are used to build the Stripe Tax request.
 *     The orders/ route reads confirmed amounts from PI metadata (taxSource='stripe').
 *
 *  2. LOCAL FALLBACK (this file): STATE_TAX_RATES state-level averages
 *     Used when Stripe Tax is not configured or returns an error.
 *     taxSource is set to 'local' in PI metadata and in the orders DB row.
 *     Accuracy: ~within 1-3% of true rate for most US addresses.
 *     Not suitable for tax compliance reporting; acceptable for pre-Stripe-Tax
 *     launch or as a safety net.
 *
 * ── Security properties ───────────────────────────────────────────────────
 *  - Product IDs: MUST resolve to an ACTIVE row in `products`. Any unknown
 *    or inactive ID throws — we never silently treat a missing product as
 *    base_price=0 (which would let the client set the unit price freely).
 *  - Item unit prices: DB base_price is the MINIMUM floor. Custom-configured
 *    prices may exceed base_price (intentional for made-to-measure items),
 *    but are hard-capped at UNIT_PRICE_CAP_MULT × base_price to stop a client
 *    from inflating a single line to an absurd amount.
 *  - Discount amount: computed from DB using discount CODE — client-supplied
 *    discount amounts are never trusted.
 *  - Tax: derived from state code via server-side lookup table — client-supplied
 *    tax amounts are never trusted.
 *  - Shipping: client-supplied value is accepted but clamped to $0–$500 to
 *    prevent negative-shipping manipulation.  Full Shippo re-validation would
 *    require a shipping session; add that when the architecture allows.
 */

import { query, queryOne } from './db'
import { computeServerUnitPrice } from './productPricing'

// ── State-level combined average sales-tax rates ──────────────────────────────
// LOCAL FALLBACK ONLY — not authoritative for tax compliance.
// Authoritative tax is handled by Stripe Tax in create-payment-intent.
// Same table used by /api/store/tax-rate for pre-PI estimate display.
const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.0922, AK: 0.0176, AZ: 0.0840, AR: 0.0947, CA: 0.0882,
  CO: 0.0777, CT: 0.0635, DE: 0.0000, FL: 0.0702, GA: 0.0732,
  HI: 0.0444, ID: 0.0603, IL: 0.0882, IN: 0.0700, IA: 0.0694,
  KS: 0.0872, KY: 0.0600, LA: 0.0955, ME: 0.0550, MD: 0.0600,
  MA: 0.0625, MI: 0.0600, MN: 0.0784, MS: 0.0707, MO: 0.0825,
  MT: 0.0000, NE: 0.0694, NV: 0.0823, NH: 0.0000, NJ: 0.0663,
  NM: 0.0783, NY: 0.0852, NC: 0.0698, ND: 0.0696, OH: 0.0723,
  OK: 0.0895, OR: 0.0000, PA: 0.0634, RI: 0.0700, SC: 0.0746,
  SD: 0.0640, TN: 0.0955, TX: 0.0820, UT: 0.0719, VT: 0.0624,
  VA: 0.0575, WA: 0.1023, WV: 0.0655, WI: 0.0543, WY: 0.0536,
  DC: 0.0600,
}

export interface PricingItem {
  productId: string
  quantity:  number
  price:     number  // client-supplied unit price (display/reference only)
  // Configuration for custom-priced products (base_price = 0). REQUIRED for
  // those: the server recomputes the authoritative price from this config via
  // the pricing engine (see lib/productPricing.ts).
  width?:          number | string
  height?:         number | string
  widthFraction?:  string | number
  heightFraction?: string | number
  options?:        Array<{ name: string; value: string }> | Record<string, string>
}

export interface PricingInput {
  items:        PricingItem[]
  discountCode?: string | null   // code string — amount is always computed server-side
  shippingCost:  number          // client-supplied, clamped to $0–$500
  state?:        string          // 2-letter state abbreviation for tax lookup
  zip?:          string          // reserved for future external tax API
  // When true, lines whose product has finite stock_qty < quantity throw a
  // clear error. Enabled at PI creation only — NOT during post-payment order
  // creation, where a stock race must never reject an already-paid order.
  enforceStock?: boolean
}

export interface PricingResult {
  subtotal:      number
  discountCode:  string | null
  discountType:  string | null   // 'percent' | 'fixed'
  discountValue: number          // raw setting (e.g. 10 for 10% or $10)
  discountAmount: number         // dollar amount deducted
  taxRate:       number          // e.g. 0.0882 for 8.82%
  taxAmount:     number
  shippingCost:  number          // clamped value
  total:         number
  amountCents:   number          // integer cents for Stripe (min 50)
}

const MAX_SHIPPING_DOLLARS = 500  // sanity cap — well above any realistic rate

// ── Optional inventory tracking ───────────────────────────────────────────────
// products.stock_qty: NULL = untracked/unlimited (made-to-order custom items),
// integer = finite stock (hardware). Memoized per serverless instance.
let stockColEnsured = false
export async function ensureStockColumn(): Promise<void> {
  if (stockColEnsured) return
  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty integer DEFAULT NULL`).catch(() => {})
  stockColEnsured = true
}

// Max multiplier a client-supplied unit price may exceed the DB base_price by.
// Custom-configured drapery legitimately scales above base (fabric upgrades,
// oversized panels, etc.), but 5× is a comfortable ceiling — even our largest
// blackout drapery configurator tops out under 3×.
const UNIT_PRICE_CAP_MULT = 5

export async function calcServerTotals(input: PricingInput): Promise<PricingResult> {
  const { items, discountCode, state, zip: _zip } = input

  if (!items?.length) throw new Error('Cart is empty')

  // ── 1. Subtotal ────────────────────────────────────────────────────────────
  // Every productId MUST map to an active DB row. A missing/unknown id is
  // treated as a hard error — never fall through to base_price=0, which would
  // let the client dictate the unit price unchecked.
  const ids = items.map(i => i.productId).filter(Boolean)
  if (ids.length !== items.length) {
    throw new Error('Cart contains an item with no productId')
  }

  await ensureStockColumn()
  const rows: { id: string; name: string; base_price: number; stock_qty: number | null }[] = ids.length
    ? await query(
        `SELECT id, name, base_price, stock_qty FROM products
         WHERE id = ANY($1::uuid[]) AND is_active = true`,
        [ids]
      ).catch(() => [])
    : []
  const basePriceMap: Record<string, number> = {}
  const productMap: Record<string, { name: string; stock_qty: number | null }> = {}
  for (const r of rows) {
    basePriceMap[r.id] = Number(r.base_price) || 0
    productMap[r.id]   = { name: r.name, stock_qty: r.stock_qty == null ? null : Number(r.stock_qty) }
  }

  let subtotal = 0
  for (const item of items) {
    if (!(item.productId in basePriceMap)) {
      // Fail-closed: unknown or inactive product — do NOT proceed with a
      // client-supplied price.
      throw new Error(`Product not available: ${item.productId}`)
    }
    const basePrice   = basePriceMap[item.productId]
    const clientPrice = Math.max(0, Number(item.price) || 0)
    const lineQty     = Math.max(1, Math.floor(Number(item.quantity) || 1))

    // Optional stock enforcement (PI creation only) — NULL stock_qty means
    // untracked/unlimited and is never checked.
    const pinfo = productMap[item.productId]
    if (input.enforceStock && pinfo && pinfo.stock_qty !== null && pinfo.stock_qty < lineQty) {
      throw new Error(`${pinfo.name} only has ${pinfo.stock_qty} left in stock`)
    }

    let unitPrice: number
    if (basePrice > 0) {
      // Fixed-price products: base_price is the MINIMUM; cap client price at
      // UNIT_PRICE_CAP_MULT × base_price so a line item can't be inflated.
      const cappedClient = Math.min(clientPrice, basePrice * UNIT_PRICE_CAP_MULT)
      unitPrice = Math.max(cappedClient, basePrice)
    } else {
      // Custom-priced products (base_price = 0): the old cap logic zeroed the
      // price (min(client, 5×0) = 0 → customers were charged shipping only).
      // The server is the price authority: recompute from the item's
      // dimensions/options via the same pricing engine the product page uses.
      // Throws if the item lacks config or can't be priced (fail-closed).
      const server = await computeServerUnitPrice(item)
      unitPrice = server.unitPrice
      if (clientPrice > 0 && Math.abs(clientPrice - unitPrice) > 1) {
        console.warn(
          `[orderPricing] client price $${clientPrice} != server price $${unitPrice} ` +
          `for product ${item.productId} — using server price`
        )
      }
    }
    subtotal += unitPrice * lineQty
  }
  subtotal = Math.round(subtotal * 100) / 100

  // ── 2. Discount — always from DB, never trust client amount ───────────────
  let discountCodeOut:  string | null = null
  let discountType:     string | null = null
  let discountValue                   = 0
  let discountAmount                  = 0

  if (discountCode?.trim()) {
    const dc = await queryOne<any>(
      // NOTE: table columns are discount_type / discount_value — aliased here so
      // the rest of this block can read dc.type / dc.value.
      `SELECT code, discount_type AS type, discount_value AS value,
              min_order, is_active, max_uses, used_count, starts_at, expires_at
       FROM discount_codes WHERE UPPER(code) = UPPER($1)`,
      [discountCode.trim()]
    ).catch((err) => {
      // A real query failure must not be silently treated as "code not found".
      // Log it server-side; fail closed (no discount) but make the error visible.
      console.error('[orderPricing] discount lookup failed:', err)
      return null
    })

    if (dc && dc.is_active) {
      const now    = new Date()
      const active = (!dc.starts_at  || new Date(dc.starts_at)  <= now)
                  && (!dc.expires_at || new Date(dc.expires_at) >= now)
                  && (!dc.max_uses   || Number(dc.used_count) < Number(dc.max_uses))
      const minOrder = Number(dc.min_order) || 0

      if (active && (minOrder === 0 || subtotal >= minOrder)) {
        discountCodeOut  = dc.code
        discountType     = dc.type || 'percent'
        discountValue    = Number(dc.value) || 0
        discountAmount   = discountType === 'percent'
          ? Math.round(subtotal * discountValue / 100 * 100) / 100
          : Math.min(discountValue, subtotal)           // fixed: cannot exceed subtotal
      }
      // If code is invalid / expired / min_order not met → silently no discount.
      // (Do NOT reveal the reason; prevent enumeration attacks.)
    }
  }

  // ── 3. Shipping — client value clamped to sane range ──────────────────────
  const shippingCost = Math.min(
    Math.max(0, Number(input.shippingCost) || 0),
    MAX_SHIPPING_DOLLARS
  )

  // ── 4. Tax — local fallback (state-level average) ─────────────────────────
  // NOTE: This is the LOCAL FALLBACK path, used only when Stripe Tax is
  // unavailable.  When taxSource='stripe' in PI metadata, the orders/ route
  // reads tax directly from PI metadata and does NOT call calcServerTotals().
  const stateCode  = (state || '').toUpperCase().trim()
  const taxRate    = STATE_TAX_RATES[stateCode] || 0
  const taxBase    = Math.max(0, subtotal - discountAmount)
  const taxAmount  = Math.round(taxBase * taxRate * 100) / 100

  // ── 5. Total ───────────────────────────────────────────────────────────────
  const total      = Math.max(0, subtotal - discountAmount + shippingCost + taxAmount)
  const amountCents = Math.max(50, Math.round(total * 100))  // Stripe min = $0.50

  return {
    subtotal,
    discountCode:   discountCodeOut,
    discountType,
    discountValue,
    discountAmount,
    taxRate,
    taxAmount,
    shippingCost,
    total,
    amountCents,
  }
}
