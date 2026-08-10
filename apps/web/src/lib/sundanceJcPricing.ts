// Sundance / JC reference-price estimates for the store AI assistant (B,
// Eddie 2026-07-19 — lifts the earlier "Sundance qualitative only" rule).
//
// Backed by a NEW read-only AAPP `chatgptAction` action `catalog_price_estimate`
// (wraps the existing `_aiPriceCatalogItem` — the same pricer create_quote_draft
// uses — with NO writes). See docs/AAPP-PATCH-catalog-price-estimate.md; until
// Eddie deploys it, this returns not_configured and the AI funnels to the
// consultation.
//
// Policy: like HD, present a REFERENCE RANGE only — never an exact figure —
// and every estimate ends with "final price from the free in-home measure".
// We blur the AAPP sell price into a $50-granular range here, server-side, so
// the exact number never reaches the model.

const ACTION_URL = () =>
  process.env.AAPP_CHATGPT_ACTION_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/chatgptAction'

// Variants this tool will price (Sundance + JC families).
//
// Luma lives in lib/lumaPricing.ts (quote_luma_estimate) — it needs
// fabric-sampling and self-configuring retries this generic path doesn't do.
// Cambridge shutter has quote_shutter_estimate (local AAPP-parity engine).
//
// NOTE for whoever extends this next: AAPP's `_aiCatalogPriceEstimate` has NO
// variant whitelist of its own — it forwards straight to _aiPriceCatalogItem,
// which also prices `drapery`, `handcrafted_roman_shade`, `drapery_hardware`,
// `somfy_motorized_track`, `drapery_valance` and `upholstered_cornice`. Those
// are reachable with ZERO AAPP changes; they are left out here only because
// their configs can't be safely defaulted from a chat turn yet.
const ALLOWED_VARIANTS = new Set([
  'sundance_roller_shade',
  'sundance_fauxwood_blind',
  'sundance_wood_blind',
  'sundance_vertical_blind',
  'sundance_cellular_shade',
  'jc_horizontal_blinds_faux_wood',
  'jc_horizontal_blinds_wood',
  'jc_woven_woods_standard',
  'jc_woven_woods_folding_door',
  'jc_woven_woods_sliding_panel',
])

export interface SundanceJcParams {
  variant: string
  productConfig?: Record<string, unknown>
  widthIn?: number
  heightIn?: number
}

export interface SundanceJcEstimate {
  ok: boolean
  brand?: 'Sundance' | 'JC'
  rangeLow?: number
  rangeHigh?: number
  /** Fields the pricer still needs before it can price (from `missing`). */
  needs?: string[]
  error?: string
}

const round50 = (v: number, up: boolean) => (up ? Math.ceil(v / 50) * 50 : Math.floor(v / 50) * 50)

/** Blur an exact sell price into the customer-facing reference range. */
export function toReferenceRange(total: number): { low: number; high: number } {
  const low = Math.max(50, round50(total * 0.95, false))
  const high = Math.max(low + 50, round50(total * 1.1, true))
  return { low, high }
}

export async function sundanceJcEstimate(params: SundanceJcParams): Promise<SundanceJcEstimate> {
  const token = process.env.AAPP_CHATGPT_ACTION_TOKEN
  if (!token) return { ok: false, error: 'not_configured' }
  const variant = String(params.variant || '')
  if (!ALLOWED_VARIANTS.has(variant)) return { ok: false, error: 'unsupported_variant' }
  const brand: 'Sundance' | 'JC' = variant.startsWith('sundance') ? 'Sundance' : 'JC'
  try {
    const res = await fetch(ACTION_URL(), {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({
        action: 'catalog_price_estimate',
        productVariant: variant,
        productConfig: params.productConfig && typeof params.productConfig === 'object' ? params.productConfig : {},
        widthIn: params.widthIn,
        heightIn: params.heightIn,
      }),
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) return { ok: false, error: `upstream_${res.status}` }
    const json: any = await res.json().catch(() => null)
    if (!json || json.ok !== true) {
      if (json?.unconfigured) {
        const needs = Array.isArray(json.missing) ? json.missing.map((m: any) => String(m)).slice(0, 12) : undefined
        return { ok: false, brand, error: 'needs_more', needs }
      }
      return { ok: false, brand, error: String(json?.error || 'estimate_failed') }
    }
    const listPrice = Number(json.listPrice)
    if (!Number.isFinite(listPrice) || listPrice <= 0) return { ok: false, brand, error: 'no_price' }
    const { low, high } = toReferenceRange(listPrice)
    return { ok: true, brand, rangeLow: low, rangeHigh: high }
  } catch {
    return { ok: false, brand, error: 'network' }
  }
}
