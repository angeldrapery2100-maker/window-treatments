import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'

// ─────────────────────────────────────────────────────────────────────────────
// /api/store/tax-rate  — ESTIMATE ONLY, NOT AUTHORITATIVE
//
// PURPOSE: Returns a pre-payment tax rate estimate for UI display purposes.
//          This is shown in the checkout summary BEFORE the PaymentIntent is
//          created.  It is NOT the final tax charged to the customer.
//
// AUTHORITATIVE TAX SOURCE: Stripe Tax Calculations API, called inside
//          /api/store/create-payment-intent via tryStripeTaxCalculation().
//          When Stripe Tax is active the PI response includes taxIsAuthoritative=true
//          and the checkout UI switches to showing "Tax (Stripe)" with the
//          confirmed amount.  This endpoint's estimate is then discarded.
//
// FALLBACK ROLE: If Stripe Tax is unavailable (Dashboard not configured,
//          network error, etc.), create-payment-intent falls back to
//          calcServerTotals() in lib/orderPricing.ts, which uses the same
//          STATE_TAX_RATES table below.  In that case the estimate shown here
//          will match the charged amount, but it is still a state-level average
//          — not a jurisdiction-precise figure.
//
// DO NOT use the `rate` returned by this endpoint as the definitive tax amount
// for billing.  Always read tax from the PaymentIntent metadata or the Stripe
// Tax calculation result.
// ─────────────────────────────────────────────────────────────────────────────

// ─── State-level combined average sales tax rates (estimate only) ─────────
// Source: Tax Foundation / AICPA state averages. Updated periodically.
// These are AVERAGES and will not match the actual jurisdiction rate for
// most addresses.  They exist solely to give the customer a reasonable
// ballpark figure during the shipping/address step.
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

export async function POST(request: Request) {
  try {
    const { state, zip } = await request.json()

    if (!state && !zip) {
      return NextResponse.json({ success: false, error: 'State or ZIP required' }, { status: 400 })
    }

    const stateCode = state?.toUpperCase().trim()

    // ─── Try external API (with fast timeout) ───
    // Even if zip-tax.com returns a precise rate, this is still ESTIMATE-ONLY.
    // The authoritative charge is determined by Stripe Tax in create-payment-intent.
    if (zip) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 2000)
        const res = await fetch(`https://api.zip-tax.com/request/v40?key=public&postalcode=${zip}&country=US`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (res.ok) {
          const data = await res.json()
          if (data.rCode === 100 && data.results?.[0]) {
            const rate = parseFloat(data.results[0].taxSales) || 0
            return NextResponse.json({
              success: true,
              // isEstimate: true — always. Even zip-level rates from external APIs
              // may differ from Stripe Tax's jurisdiction-level calculation.
              isEstimate: true,
              data: { rate, source: 'zip-tax', zip, state: data.results[0].geoState || stateCode, city: data.results[0].geoCity || '' }
            })
          }
        }
      } catch {
        // External API failed or timed out, use state-level fallback
      }
    }

    // ─── Fallback: state-level average rate ───
    if (stateCode && STATE_TAX_RATES[stateCode] !== undefined) {
      return NextResponse.json({
        success: true,
        isEstimate: true,  // state average — NOT the final charged rate
        data: { rate: STATE_TAX_RATES[stateCode], source: 'state-average', zip: zip || '', state: stateCode, city: '' }
      })
    }

    return NextResponse.json({
      success: true,
      isEstimate: true,
      data: { rate: 0, source: 'default', zip: zip || '', state: stateCode || '', city: '' }
    })
  } catch (e: any) {
    console.error('Tax rate error:', e)
    return errorResponse('Could not calculate tax. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
