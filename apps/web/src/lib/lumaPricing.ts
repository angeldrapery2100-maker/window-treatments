// Luma-series (自家 zebra / roller / sheer / modern roman) reference-price
// estimates for the website AI assistant.
//
// WHY THIS FILE EXISTS (2026-08-10)
// Luma pricing used to hang off quote_store_product → computeServerUnitPrice →
// the Postgres `products` table. That table is EMPTY (the online store never
// launched), so list_store_products answered "the store has not launched yet"
// and the assistant told customers it could not quote at all — while the
// on-page configurator happily priced the same shade from fabric_library.
// AAPP's chatgptAction `catalog_price_estimate` has supported every Luma
// variant all along (functions/index.js AI_LUMA_VARIANTS → _priceLumaShade);
// the only thing blocking it was the website's own variant whitelist.
// This routes straight to AAPP — the same pricer create_quote_draft uses —
// with no products table involved.
//
// POLICY (Eddie 2026-08-10): every customer-facing number is a REFERENCE
// price. Install fee is NEVER shown as a figure, tax is never included, and
// the final price always comes from the salesperson. See REFERENCE_DISCLOSURE.

import { FABRIC_CATALOG } from '@/lib/fabricCatalog.generated'

const ACTION_URL = () =>
  process.env.AAPP_CHATGPT_ACTION_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/chatgptAction'

/** Luma variant → fabric table (mirrors AAPP AI_LUMA_SLOTS). */
export const LUMA_VARIANT_SERIES: Record<string, string> = {
  roller_shade: 'roller',
  zebra_shade: 'zebra',
  sheer_shade: 'sheer',
  modern_roman_shade: 'roman',
}

/** Single-fabric variants only. Dual roller/sheer need two codes — those stay
 *  consultation-only until someone asks for them. */
export const LUMA_VARIANTS = Object.keys(LUMA_VARIANT_SERIES)

/** The one sentence every Luma price must be wrapped in. Kept here so the
 *  tool layer, the prompt rule and any future surface can't drift apart. */
export const REFERENCE_DISCLOSURE =
  'REFERENCE price only — excludes installation and sales tax, and the final price is confirmed by our salesperson (free in-home measure). Say this every time; never state an installation-fee figure.'

// ── Representative fabrics ──────────────────────────────────────────────────
// Luma is priced per $/sqm of the chosen fabric, so "what does a 36×58 zebra
// cost" has no single answer until a fabric is picked. Rather than refuse (the
// old behaviour) we sample a spread of families in the requested category and
// return the low–high span, exactly like the on-page configurator does with
// its min/max band.
//
// Families are sampled evenly across the catalog order rather than hand-picked
// so this list can never go stale when fabricCatalog.generated.ts is
// regenerated. To feature specific fabrics instead, replace pickRepresentative
// with a literal map of series+category → codes.
const SAMPLE_SIZE = 3

export function pickRepresentative(series: string, category?: string): string[] {
  const fams = FABRIC_CATALOG.filter(
    (f) => f.series === series && (!category || f.category === category) && f.colors.length > 0
  )
  if (fams.length === 0) return []
  const picks: string[] = []
  const step = Math.max(1, Math.floor(fams.length / SAMPLE_SIZE))
  for (let i = 0; i < fams.length && picks.length < SAMPLE_SIZE; i += step) {
    picks.push(`${fams[i].code}-${fams[i].colors[0]}`)
  }
  // Always include the last family so the sample really spans the catalog.
  const last = fams[fams.length - 1]
  const lastCode = `${last.code}-${last.colors[0]}`
  if (!picks.includes(lastCode)) picks[picks.length - 1] = lastCode
  return picks
}

/** Categories offered per series, for the "which look do you want" question. */
export function lumaCategories(series: string): string[] {
  return [...new Set(FABRIC_CATALOG.filter((f) => f.series === series).map((f) => f.category))]
}

// ── AAPP call ───────────────────────────────────────────────────────────────

export interface LumaEstimateParams {
  variant: string
  widthIn: number
  heightIn: number
  /** Exact colorway, e.g. "DB1-001". When absent we sample the category. */
  fabricCode?: string
  /** room_darkening | light_filtering | blackout | screen | … */
  category?: string
  /** chain | cordless | motorized. Defaults to chain (the standard config). */
  option?: string
  controlSide?: string
  cassette?: string
  motorKey?: string
}

export interface LumaEstimate {
  ok: boolean
  variant?: string
  /** Set when one exact fabric was priced. */
  price?: number
  fabricCode?: string
  /** Set when the category was sampled. */
  rangeLow?: number
  rangeHigh?: number
  sampledFabrics?: string[]
  /** Config fields we filled in ourselves — the model must state these. */
  assumed?: Record<string, string>
  /** Fields AAPP still needs and we could not fill. */
  needs?: string[]
  error?: string
}

// Moved to lib/aappAction.ts once somfyPricing.ts needed it too. Re-exported
// here so existing callers and tests keep working.
export { parseMissing } from '@/lib/aappAction'
import { parseMissing } from '@/lib/aappAction'

async function callAapp(token: string, body: Record<string, unknown>) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(ACTION_URL(), {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12_000),
      })
      if (res.status >= 500 || res.status === 429) continue
      if (!res.ok) return { status: res.status, data: null }
      return { status: res.status, data: await res.json().catch(() => null) }
    } catch {
      /* network — retry once */
    }
  }
  return null
}

/** Price ONE colorway. Self-configures: when AAPP says a required field is
 *  missing it re-sends with the first offered value (the app's own default
 *  ordering) and records it in `assumed`, so a customer who only gave a size
 *  still gets a number instead of a four-question interrogation. */
async function priceOne(
  token: string,
  params: LumaEstimateParams,
  fabricFullCode: string
): Promise<{ price?: number; assumed: Record<string, string>; needs?: string[]; error?: string }> {
  const cfg: Record<string, unknown> = { fabricFullCode }
  const assumed: Record<string, string> = {}
  if (params.option) cfg.option = params.option
  if (params.controlSide) cfg.controlSide = params.controlSide
  if (params.cassette) cfg.cassette = params.cassette
  if (params.motorKey) cfg.motorKey = params.motorKey

  // Up to 3 passes: each unconfigured response fills in one round of fields.
  for (let pass = 0; pass < 3; pass++) {
    const out = await callAapp(token, {
      action: 'catalog_price_estimate',
      productVariant: params.variant,
      productConfig: cfg,
      widthIn: params.widthIn,
      heightIn: params.heightIn,
    })
    if (!out) return { assumed, error: 'network' }
    const json: any = out.data
    if (!json) return { assumed, error: `upstream_${out.status}` }

    if (json.ok === true) {
      const price = Number(json.listPrice)
      if (!Number.isFinite(price) || price <= 0) return { assumed, error: 'no_price' }
      return { price, assumed }
    }

    if (json.unconfigured && Array.isArray(json.missing) && json.missing.length) {
      const unresolved: string[] = []
      for (const raw of json.missing) {
        const { field, options } = parseMissing(String(raw))
        if (cfg[field] != null) continue
        if (field === 'option') {
          // Never silently upsell to a motor, and never let catalog ORDER
          // decide the control type. AAPP's real option list (verified
          // 2026-08-10) is plastic_chain / stainless_chain / cordless /
          // motorized — there is no bare "chain", so match by suffix and
          // prefer the plain plastic chain, which is the standard build.
          const pick =
            options.find((o) => o === 'plastic_chain') ??
            options.find((o) => o.endsWith('_chain') || o === 'chain') ??
            options.find((o) => o === 'cordless') ??
            options.find((o) => o !== 'motorized')
          if (!pick) { unresolved.push(String(raw)); continue }
          cfg.option = pick
          assumed.option = pick
        } else if (field === 'controlSide') {
          // Right is our default hand; alphabetical order would pick left.
          const pick = options.includes('right') ? 'right' : options[0]
          if (!pick) { unresolved.push(String(raw)); continue }
          cfg.controlSide = pick
          assumed.controlSide = pick
        } else if (options.length) {
          cfg[field] = options[0]
          assumed[field] = options[0]
        } else {
          unresolved.push(String(raw))
        }
      }
      if (unresolved.length) return { assumed, needs: unresolved, error: 'needs_more' }
      continue
    }
    return { assumed, error: String(json.error || 'estimate_failed') }
  }
  return { assumed, error: 'needs_more' }
}

export async function lumaEstimate(params: LumaEstimateParams): Promise<LumaEstimate> {
  // Input guards run BEFORE the token check so a bad call reports what is
  // actually wrong (and so they stay unit-testable without credentials).
  const variant = String(params.variant || '')
  const series = LUMA_VARIANT_SERIES[variant]
  if (!series) return { ok: false, error: 'unsupported_variant' }
  if (!(params.widthIn > 0) || !(params.heightIn > 0)) return { ok: false, error: 'missing_size' }

  const token = process.env.AAPP_CHATGPT_ACTION_TOKEN
  if (!token) return { ok: false, variant, error: 'not_configured' }

  // Exact colorway → one authoritative reference price.
  if (params.fabricCode) {
    const code = String(params.fabricCode).trim().toUpperCase()
    const r = await priceOne(token, params, code)
    if (r.price == null) return { ok: false, variant, error: r.error || 'no_price', needs: r.needs }
    return { ok: true, variant, price: r.price, fabricCode: code, assumed: r.assumed }
  }

  // No colorway → sample the category and report the span.
  const codes = pickRepresentative(series, params.category)
  if (codes.length === 0) {
    return {
      ok: false,
      variant,
      error: 'unknown_category',
      needs: lumaCategories(series),
    }
  }
  const results = await Promise.all(codes.map((c) => priceOne(token, params, c)))
  // Keep code ↔ price paired: a middle sample can fail while its neighbours
  // succeed, and reporting the wrong colorways back would be worse than
  // reporting none.
  const priced = results
    .map((r, i) => ({ ...r, code: codes[i] }))
    .filter((r): r is typeof r & { price: number } => typeof r.price === 'number')
  if (priced.length === 0) {
    const first = results[0]
    return { ok: false, variant, error: first?.error || 'no_price', needs: first?.needs }
  }
  const values = priced.map((r) => r.price)
  return {
    ok: true,
    variant,
    rangeLow: Math.floor(Math.min(...values)),
    rangeHigh: Math.ceil(Math.max(...values)),
    sampledFabrics: priced.map((r) => r.code),
    assumed: priced[0].assumed,
  }
}
