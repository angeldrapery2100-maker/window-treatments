import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { calcServerTotals } from '@/lib/orderPricing'

// ─── Stripe Tax product tax codes ─────────────────────────────────────────────
// These map our product categories to Stripe's tax code system.
// ⚠️  VERIFY WITH YOUR CPA / TAX ADVISOR before going live.
//
// Current choice: txcd_99999999 (General - Tangible Goods) for everything.
// More specific alternatives:
//   txcd_34020000  Home furnishings / window coverings (check jurisdiction support)
//   txcd_90000001  Installation services (if you ever split product vs install)
//   txcd_99999999  General tangible goods — safe broadest fallback
//
// Configure tax codes in Stripe Dashboard:
//   Dashboard → Tax → Products & prices → Tax codes
const PRODUCT_TAX_CODES: Record<string, string> = {
  drapery:  'txcd_99999999', // custom drapery       — tangible goods
  sheer:    'txcd_99999999', // sheer curtains        — tangible goods
  shade:    'txcd_99999999', // roller / roman shades — tangible goods
  hardware: 'txcd_99999999', // hardware / rods       — tangible goods
  default:  'txcd_99999999', // catch-all
}

// ─── Attempt Stripe Tax calculation ──────────────────────────────────────────
// Returns a Stripe Tax Calculation object, or null if Stripe Tax is not
// configured / the API call fails.  Caller falls back to local rates.
//
// Prerequisites (must be set up in Stripe Dashboard before this works):
//   1. Tax → Enable Stripe Tax
//   2. Tax → Settings → Business address (where you're based)
//   3. Tax → Registrations  → add states where you collect tax
//   4. Tax Settings → Shipping taxability → confirm per-state rules
async function tryStripeTaxCalculation(params: {
  taxableAmountCents: number   // subtotal − discount (pre-tax line items)
  shippingCents:      number
  street?:  string
  city?:    string
  state?:   string
  zip?:     string
}): Promise<{ id: string; taxAmountCents: number; amountTotal: number } | null> {
  // Guard: nothing meaningful without an address
  if (!params.state && !params.zip) return null

  try {
    // ⚠️  stripe.tax.calculations.create() will throw if Stripe Tax is not
    //     enabled in your Dashboard.  That's expected during development.
    const calc = await (stripe.tax as any).calculations.create({
      currency: 'usd',
      line_items: [
        {
          amount:    params.taxableAmountCents,
          reference: 'order-items',
          tax_code:  PRODUCT_TAX_CODES.default,
        },
      ],
      // Shipping as a separate line so Stripe can handle shipping taxability per state
      ...(params.shippingCents > 0
        ? { shipping_cost: { amount: params.shippingCents } }
        : {}),
      customer_details: {
        address: {
          line1:       params.street || '',
          city:        params.city   || '',
          state:       params.state  || '',
          postal_code: params.zip    || '',
          country:     'US',
        },
        address_source: 'shipping',
      },
    })

    return {
      id:               calc.id,
      taxAmountCents:   calc.tax_amount_exclusive,  // exclusive = on top of price
      amountTotal:      calc.amount_total,           // total incl. tax
    }
  } catch (err: any) {
    // This is expected when Stripe Tax is not yet configured.
    // Log at warn level; caller uses local fallback automatically.
    console.warn(
      '[create-payment-intent] Stripe Tax unavailable (configure in Dashboard to enable):',
      err?.message ?? err
    )
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as any
    const {
      items,
      discountCode = null,
      shippingCost = 0,
      // Address — needed by Stripe Tax for accurate jurisdiction detection
      street,
      city,
      state,
      zip,
      customerEmail,
      customerName,
      orderMetadata,
    } = body

    // ── Step 1: Server-side baseline pricing (subtotal, discount, shipping) ──
    // calcServerTotals also computes a local tax estimate as fallback.
    // If Stripe Tax succeeds below, its tax figure replaces the local one.
    // Any unknown/inactive product throws — surface as a 400 instead of a 500.
    let localPricing
    try {
      localPricing = await calcServerTotals({
        items,
        discountCode,
        shippingCost,
        state,
        zip,
      })
    } catch (e: any) {
      console.warn('[create-payment-intent] pricing rejected:', e?.message)
      return NextResponse.json(
        { success: false, error: 'One or more items in your cart are no longer available. Please refresh and try again.' },
        { status: 400 }
      )
    }

    // ── Step 2: Attempt Stripe Tax for authoritative tax amount ──────────────
    // taxableAmountCents = line-item value AFTER discount, BEFORE tax
    const taxableAmountCents = Math.round(
      (localPricing.subtotal - localPricing.discountAmount) * 100
    )
    const shippingCents = Math.round(localPricing.shippingCost * 100)

    const stripeTax = await tryStripeTaxCalculation({
      taxableAmountCents,
      shippingCents,
      street,
      city,
      state,
      zip,
    })

    // ── Step 3: Resolve final amounts ────────────────────────────────────────
    let finalAmountCents:    number
    let finalTaxAmountCents: number
    let finalTaxRate:        number
    let taxSource:           'stripe' | 'local'
    let taxCalculationId:    string | null = null

    if (stripeTax) {
      // ✅ Stripe Tax is configured and returned an authoritative figure
      finalAmountCents    = stripeTax.amountTotal
      finalTaxAmountCents = stripeTax.taxAmountCents
      finalTaxRate        = taxableAmountCents > 0
        ? finalTaxAmountCents / taxableAmountCents
        : 0
      taxSource           = 'stripe'
      taxCalculationId    = stripeTax.id
    } else {
      // ⚠️  Stripe Tax not configured → local state-average fallback.
      // taxIsAuthoritative will be false; UI must label this as "estimated".
      finalAmountCents    = localPricing.amountCents
      finalTaxAmountCents = Math.round(localPricing.taxAmount * 100)
      finalTaxRate        = localPricing.taxRate
      taxSource           = 'local'
    }

    // Stripe minimum charge is $0.50
    const chargeAmountCents = Math.max(50, finalAmountCents)

    // ── Step 4: Create PaymentIntent ─────────────────────────────────────────
    // We embed the full breakdown in metadata so the /api/store/orders endpoint
    // can reconstruct and verify all financial fields without trusting the client.
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   chargeAmountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail || undefined,
      metadata: {
        customerName:     customerName    || '',
        customerEmail:    customerEmail   || '',
        // Tax provenance — used by orders/ to verify and store correctly
        taxSource,                                              // 'stripe' | 'local'
        taxCalculationId: taxCalculationId || '',               // Stripe Tax calc ID
        // Server-computed breakdown — authoritative for orders/ reconciliation
        subtotalCents:    Math.round(localPricing.subtotal         * 100).toString(),
        discountAmtCents: Math.round(localPricing.discountAmount   * 100).toString(),
        shippingCents:    Math.round(localPricing.shippingCost     * 100).toString(),
        taxCents:         finalTaxAmountCents.toString(),
        discountCode:     localPricing.discountCode || '',
        ...(orderMetadata || {}),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amountCents:  chargeAmountCents,

        // Full server-computed breakdown for checkout UI display
        subtotal:       localPricing.subtotal,
        discountAmount: localPricing.discountAmount,
        shippingCost:   localPricing.shippingCost,
        taxRate:        finalTaxRate,
        taxAmount:      finalTaxAmountCents / 100,
        total:          chargeAmountCents   / 100,

        // Provenance flags — frontend uses these to label the tax correctly
        taxSource,                                  // 'stripe' | 'local'
        taxIsAuthoritative: taxSource === 'stripe', // true = Stripe Tax; false = estimate
        taxCalculationId,                           // null when local fallback
      },
    })
  } catch (e: any) {
    console.error('[create-payment-intent] error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
