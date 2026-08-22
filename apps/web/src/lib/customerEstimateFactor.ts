// Customer-facing estimate factor (推广系统 P1 §1.7, Eddie 拍板 5.5-2).
//
// WHY: every number the AI assistant quotes is a REFERENCE price given before
// anyone has seen the window. Quoting slightly high and landing lower after
// the in-home measure is a pleasant surprise; quoting low and landing higher
// is the single most common reason a good lead goes cold. So reference
// figures the ASSISTANT shows are lifted 5% above the engine price, and the
// disclosure now says out loud that the final quote is usually a little lower.
//
// WHAT IS NOT TOUCHED:
//  · quote_store_product — that is the live checkout price for an item the
//    customer can buy on the site right now. It must match the configurator
//    and the cart to the cent, so it is never scaled.
//  · lead_events `value` — the log keeps the TRUE engine price. Scaling is
//    applied to the tool's return value only, after each case has already
//    logged, so admin funnels and lead scoring stay on real money.
//  · install_estimate — a real cost, quoted as-is when it is shown at all.
//  · anything that is not a price: area_sqft, quantity, billed_size, counts.
//
// The scaling is applied ONCE, centrally, at the exit of executeAssistantTool
// — not inside the pricing engines and not inside individual tool cases.
// Pricing parity with AAPP is sacred (see AGENTS.md); this is a presentation
// layer sitting strictly above it.

export const AI_ESTIMATE_FACTOR = 1.05

/** Off by default (Eddie 2026-08-10: never state an installation figure).
 *  Set AI_SHOW_INSTALL_ESTIMATE=1 to let the assistant quote an approximate
 *  installation amount alongside the product price. */
export const AI_SHOW_INSTALL_ESTIMATE = process.env.AI_SHOW_INSTALL_ESTIMATE === '1'

/** Tools whose numbers are pre-measure REFERENCE estimates. */
const SCALED_TOOLS = new Set([
  'get_hd_estimate',
  'quote_shutter_estimate',
  'quote_luma_estimate',
  'quote_drapery_estimate',
  'quote_roman_estimate',
  'quote_hardware_estimate',
  'quote_somfy_track_estimate',
  'get_sundance_jc_estimate',
])

/** Numeric keys that hold money. Anything not listed here is left alone. */
const PRICE_KEYS = new Set([
  'price',
  'low',
  'high',
  'price_low',
  'price_high',
  'range_low',
  'range_high',
  'reference_low',
  'reference_high',
  'subtotal',
  'total',
  'line_total',
  'unit_price',
  'per_panel',
  'per_window',
])

/** Keys whose STRING value contains pre-formatted dollar figures. These are
 *  what the model is told to copy verbatim ("$1,120 – $1,480"), so leaving
 *  them unscaled would silently undo the whole factor. */
const PRICE_TEXT_KEYS = new Set([
  'reference_price',
  'reference_range',
  'price_display',
  'say_it_as',
])

const MONEY_RE = /\$\s?([0-9][0-9,]*(?:\.[0-9]{1,2})?)/g

function scaleNumber(n: number): number {
  return Math.round(n * AI_ESTIMATE_FACTOR)
}

/** Rewrite every "$1,234" inside a display string. */
export function scaleMoneyText(text: string): string {
  return text.replace(MONEY_RE, (whole, digits: string) => {
    const n = Number(String(digits).replace(/,/g, ''))
    if (!Number.isFinite(n)) return whole
    return `$${scaleNumber(n).toLocaleString()}`
  })
}

function walk(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(walk)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (PRICE_KEYS.has(k) && typeof v === 'number' && Number.isFinite(v)) {
        out[k] = scaleNumber(v)
      } else if (PRICE_TEXT_KEYS.has(k) && typeof v === 'string') {
        out[k] = scaleMoneyText(v)
      } else {
        out[k] = walk(v)
      }
    }
    return out
  }
  return value
}

/**
 * Apply the customer-facing factor to one tool result. Pure: returns a new
 * object, leaves the input untouched, and returns non-scaled tools' results
 * unchanged (by identity) so nothing else in the pipeline shifts.
 */
export function applyCustomerEstimateFactor(toolName: string, result: unknown): unknown {
  if (!SCALED_TOOLS.has(toolName)) return result
  if (!result || typeof result !== 'object') return result
  return walk(result)
}
