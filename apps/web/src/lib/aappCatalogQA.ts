// Customer-safe product-spec Q&A + fabric-code identification for the store
// AI assistant (GPT-porting P1, Eddie 2026-07-19).
//
// get_product_specs  → reads the LOCAL AAPP library snapshot (aapp_library,
//   filled by the admin 同步AAPP价格 button) — no network, always as fresh as
//   the last sync. EVERY price-ish field is stripped before anything reaches
//   the model: specs yes, numbers never (prices go through the pricing tools).
// resolveFabricCode  → proxies the EXISTING AAPP chatgptAction
//   `resolve_product` (same Bearer token as hd_price_lookup) so a customer
//   can say "EB12-005" and the assistant knows which catalog/product it is.
//   Output is filtered to catalog/product identity only.

import { getAappLibrary } from '@/lib/aappLibrary'

// Customer-safe Luma size ceilings (Eddie-confirmed; see business-facts /
// core-knowledge "Max width 118", max height about 120""). The AAPP library
// snapshot can only tighten these — never widen them (P0 2026-07-20).
const LUMA_SAFE_MAX_WIDTH_IN = 118
const LUMA_SAFE_MAX_HEIGHT_IN = 120

// Per-variant safe ceilings for NON-Luma shade systems (2026-07-22): the
// outdoor zip shade is a different product line with a much larger envelope
// (AAPP catalog: 48–240"W × 36–156"H). Without this entry the generic Luma
// clamp below would wrongly tell customers the outdoor shade maxes out at
// 118×120 — cutting off its main selling point. Snapshot values may only
// TIGHTEN these, never widen (same rule as Luma).
const VARIANT_SAFE_MAX_IN: Record<string, { w: number; h: number }> = {
  outdoor_zip_shade: { w: 240, h: 156 },
}

export function safeShadeSizeCeiling(variantKey: string): { w: number; h: number } {
  return VARIANT_SAFE_MAX_IN[variantKey] || { w: LUMA_SAFE_MAX_WIDTH_IN, h: LUMA_SAFE_MAX_HEIGHT_IN }
}

// ── Price stripping ─────────────────────────────────────────────────────────
const PRICE_KEY_RE =
  /price|cost|amount|fee|markup|mult|addper|net|msrp|sell|dollar|charge|surcharge|rate$/i

export function stripPriceFields(value: any, depth = 0): any {
  if (depth > 8 || value == null) return value
  if (Array.isArray(value)) return value.map((v) => stripPriceFields(v, depth + 1))
  if (typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      if (PRICE_KEY_RE.test(k)) continue
      out[k] = stripPriceFields(v, depth + 1)
    }
    return out
  }
  return value
}

// Drop ONLY true money fields (net/cost/markup/msrp/sell/…) from a config
// template while KEEPING the catalog identifiers the pricer needs — priceGroup,
// colorName, hardwareType, controlSystem, etc. (stripPriceFields is too broad:
// its /price/ rule would also delete "priceGroup", which Sundance pricing
// REQUIRES.) Used to pass a resolve_product configTemplate on to the AI so it
// can price Sundance/JC via get_sundance_jc_estimate — the actual dollars still
// only ever come back blurred to a $50 range from the pricer.
// True for keys that are dollar/cost fields, but NOT for catalog tier ids like
// priceGroup / priceTier (which the pricer needs). Normalizes camelCase to
// underscores so "unitPrice"/"dealerNet" match on word boundaries and a field
// like "manufacturer" (contains "factor") does not.
export function isConfigDollarKey(key: string): boolean {
  const norm = String(key).replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
  if (/(^|_)(price_group|price_tier|pricegroup|pricetier)(_|$)/.test(norm)) return false
  return /(^|_)(net|cost|markup|factor|msrp|wholesale|surcharge|amount|dollar|retail|sell|price)(_|$)/.test(norm)
}

export function stripConfigDollars(value: any, depth = 0): any {
  if (depth > 6 || value == null) return value
  if (Array.isArray(value)) return value.map((v) => stripConfigDollars(v, depth + 1))
  if (typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      if (isConfigDollarKey(k)) continue
      out[k] = stripConfigDollars(v, depth + 1)
    }
    return out
  }
  return value
}

// ── Product specs from the synced library snapshot ──────────────────────────
export type SpecArea = 'shades' | 'motors' | 'drapery' | 'shutters' | 'hardware'

export async function getProductSpecs(area: SpecArea): Promise<any> {
  if (area === 'hardware') {
    // Static drapery rod/track specs + finished-height formulas (Eddie-verified
    // business facts). The synced snapshot doesn't carry rod hardware specs, so
    // these answer "how high can the rod go / where does it mount" questions
    // without needing the internal library_query action.
    return {
      track_thickness_in: { motorized_ceiling_track: 1.25, standard_ceiling_track: 1.0 },
      finished_height_rules: {
        motorized_ceiling_track: 'ceiling height − 1.25" − floor clearance (0.5–1")',
        ceiling_track: 'ceiling height − 1" − floor clearance (0.5–1")',
        wall_mounted_rod: 'ceiling height − 4.5" (no separate floor clearance)',
        high_window_gap: 'If the gap from window-top to ceiling is over 30", the rod can mount at the midpoint instead of the ceiling.',
      },
      width_rule: 'Rod/track width = window width + about 10" or more per side of stacking room, scaling up for wider windows.',
      operation: ['cordless', 'corded', 'motorized (Somfy / Lutron on request)'],
      note: 'Measure ceiling height at left, center and right (ceilings are uneven) and use the smallest. These are planning formulas — the designer confirms exact rod placement at the free in-home measure. Motorized-track and premium-hardware pricing is quoted at the consultation.',
    }
  }
  if (area === 'shutters') {
    // Static business facts (AAPP catalog constants, recon 2026-07-19).
    return {
      materials: ['Poly-Vinyl (aluminum reinforced)', 'Hardwood', 'Grained Paulownia', 'Basswood (painted or stained)'],
      louver_sizes_in: [2.5, 3.5, 4.5],
      louver_styles: { basswood: ['flat', 'elliptical'], paulownia: ['flat', 'elliptical'], hardwood: ['elliptical'], poly_vinyl: [] },
      panel_rule: 'Each panel must be between 8" and 36" wide; 1–6 panels per opening.',
      depth_rule: 'Inside mount needs more than 2.5" of frame depth (2–2.5" works with a Z-frame); less than 2" is outside mount only.',
      styles: ['standard', 'bay window', 'bi-fold', 'by-pass', 'corner window', 'double hung', 'french door', 'skylight', 'specialty shape'],
    }
  }

  const snap = await getAappLibrary().catch(() => null)
  const data = snap?.data
  if (!data) return { error: 'specs_not_synced', note: 'Library snapshot not synced yet — answer from general knowledge and offer the free consultation for specifics.' }

  if (area === 'shades') {
    const variants = data.shadeCatalog?.variants || {}
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries<any>(variants)) {
      // Customer-safe ceiling (Eddie-confirmed 2026-07: ~118"W × ~120"H for
      // Luma shades). The live AAPP snapshot may only TIGHTEN these numbers,
      // never raise them — a stale snapshot claiming e.g. a 180" roller
      // height is exactly how the assistant told a customer "the system
      // confirms 180"" (P0 A10/H2, 2026-07-20). Anything at/over the ceiling
      // is reported as the safe value with a team-confirmation flag instead.
      const safe = safeShadeSizeCeiling(k)
      const rawW = typeof v?.maxWidth === 'number' ? v.maxWidth : null
      const rawH = typeof v?.maxHeight === 'number' ? v.maxHeight : null
      const cappedW = rawW == null ? safe.w : Math.min(rawW, safe.w)
      const cappedH = rawH == null ? safe.h : Math.min(rawH, safe.h)
      out[k] = {
        maxWidthIn: cappedW,
        maxHeightIn: cappedH,
        // Minimum sizes are customer-safe and matter for the outdoor zip
        // shade (48"W × 36"H minimum) — pass them through when present.
        ...(typeof v?.minWidth === 'number' ? { minWidthIn: v.minWidth } : {}),
        ...(typeof v?.minHeight === 'number' ? { minHeightIn: v.minHeight } : {}),
        ...(rawW == null || rawH == null || rawW > safe.w || rawH > safe.h
          ? { size_limit_note: 'Larger sizes may be possible as split/multiple panels — our team confirms the exact workable size.' }
          : {}),
        cassettes: Array.isArray(v?.cassettes) ? v.cassettes.map((c: any) => c?.label || c?.key).filter(Boolean) : [],
        options: Array.isArray(v?.optionKeys) ? v.optionKeys : [],
        hasControlSide: !!v?.hasControlSide,
      }
    }
    return { variants: out, note: 'Shade variants (indoor Luma + outdoor zip): size limits in inches, cassette styles, and available options. NEVER promise a size beyond these limits — larger indoor windows are split into panels, confirmed by our team. Prices via quote_store_product only (outdoor zip shade is quoted at the consultation).' }
  }

  if (area === 'motors') {
    const sys = data.lumaMotorSystem
    if (!sys) return { error: 'no_motor_data', note: 'Motor specs not in the current sync — offer the free consultation.' }
    const clean = stripPriceFields(sys)
    return {
      motors: Array.isArray(clean?.motors) ? clean.motors.map((m: any) => ({ key: m?.key, label: m?.label || m?.name, notes: m?.notes })) : [],
      remotes: Array.isArray(clean?.remotes) ? clean.remotes.map((r: any) => ({ key: r?.key, label: r?.label || r?.key, channels: r?.channels })) : [],
      accessories: Array.isArray(clean?.accessories) ? clean.accessories.map((a: any) => a?.label || a?.key).filter(Boolean) : [],
      note: 'Luma motorization system components. Motor pricing is part of the product configurator / quote tools — never quote motor prices from memory.',
    }
  }

  // drapery
  const dpc = data.draperyPricingCatalog
  if (!dpc) return { error: 'no_drapery_data', note: 'Drapery catalog not in the current sync.' }
  const clean = stripPriceFields(dpc)
  return {
    lining_options: clean?.main?.liningOptions ? Object.keys(clean.main.liningOptions) : ['NO', 'LF', 'BO'],
    notes: 'Lining tiers: NO (unlined), LF (light filtering), BO (blackout). Pleat styles: 2-fold pinch, 3-fold pinch, ripplefold. Prices via quote_store_product only.',
  }
}

// ── Local Luma fabric-code fallback (W8, 2026-07-21) ─────────────────────────
// The site ships its own authoritative Luma fabric catalog
// (fabricCatalog.generated.ts). When AAPP resolve_product misses a code the
// site knows (T2-EB: "EB12-005" — a real Luma sheer family+color — came back
// unidentified), match it locally so Luma identification never depends on
// AAPP coverage. Codes look like "EB12-005", "DB1-1", or a bare family "EB12";
// legacy codes (e.g. TB4 → DB1) are honored.

const LUMA_SERIES_LABEL: Record<string, string> = {
  roller: 'Luma roller shade 卷帘',
  zebra: 'Luma zebra shade 斑马帘',
  roman: 'Luma modern roman shade 现代罗马帘',
  sheer: 'Luma sheer shade 柔纱帘',
}

export interface LocalLumaMatch {
  series: string
  seriesLabel: string
  family: string
  color: string | null
  colorExists: boolean | null
}

export async function matchLocalLumaFabric(query: string): Promise<LocalLumaMatch | null> {
  const m = String(query || '').trim().toUpperCase().match(/^([A-Z]{1,4}\d{1,3})(?:[-\s]+0*(\d{1,3}))?$/)
  if (!m) return null
  const family = m[1]
  const color = m[2] ? m[2].padStart(3, '0') : null
  const { FABRIC_CATALOG } = await import('@/lib/fabricCatalog.generated')
  for (const f of FABRIC_CATALOG) {
    if (f.code.toUpperCase() === family || f.legacyCodes.some((c) => c.toUpperCase() === family)) {
      return {
        series: f.series,
        seriesLabel: LUMA_SERIES_LABEL[f.series] || `Luma ${f.series} shade`,
        family: f.code,
        color,
        colorExists: color ? f.colors.includes(color) : null,
      }
    }
  }
  return null
}

// ── Fabric code identification via AAPP resolve_product ─────────────────────
const ACTION_URL = () =>
  process.env.AAPP_CHATGPT_ACTION_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/chatgptAction'

export interface FabricCodeResult {
  ok: boolean
  matches?: Array<{
    catalog: string
    product?: string
    family?: string
    sold_online: boolean
    /** Product variant for pricing (e.g. 'sundance_roller_shade') when known. */
    variant?: string
    /** Catalog config identifiers (priceGroup/colorName/…) — dollar fields stripped — to hand to get_sundance_jc_estimate. */
    config?: Record<string, unknown>
    note?: string
  }>
  error?: string
}

// Luma tables → the store products that sell them online.
const LUMA_TABLE_TO_STORE: Record<string, string> = {
  roller: 'Roller shades (Luma Collection, sold online)',
  zebra: 'Zebra shades (Luma Collection, sold online)',
  sheer: 'Sheer shades (Luma Collection, sold online)',
  roman: 'Modern roman shades (Luma Collection, sold online)',
}

export async function resolveFabricCode(query: string): Promise<FabricCodeResult> {
  const token = process.env.AAPP_CHATGPT_ACTION_TOKEN
  if (!token) return { ok: false, error: 'not_configured' }
  const q = String(query || '').trim().slice(0, 120)
  if (q.length < 2) return { ok: false, error: 'query_too_short' }
  try {
    // One retry on transient failures — same rationale as hdPricing.
    let res = await fetch(ACTION_URL(), {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'resolve_product', query: q }),
      signal: AbortSignal.timeout(12_000),
    }).catch((err) => {
      console.warn('[aappCatalogQA] resolve_product network error — retrying once:', String(err).slice(0, 120))
      return null
    })
    if (!res || res.status >= 500 || res.status === 429) {
      res = await fetch(ACTION_URL(), {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'resolve_product', query: q }),
        signal: AbortSignal.timeout(12_000),
      })
    }
    if (!res.ok) return { ok: false, error: `upstream_${res.status}` }
    const json: any = await res.json().catch(() => null)
    const raw: any[] = Array.isArray(json?.matches) ? json.matches : Array.isArray(json?.result?.matches) ? json.result.matches : []
    // Identity + a pricing-ready variant/config (dollar fields stripped). The
    // configTemplate is what makes the Sundance/JC quote chain work: without it
    // get_sundance_jc_estimate has nothing to price. Luma stays store-tool only.
    const matches = raw.slice(0, 6).map((m: any) => {
      const catalog = String(m?.catalog || 'Unknown')
      const isLuma = catalog.toLowerCase() === 'luma'
      const tmpl = m?.configTemplate ?? m?.config ?? null
      const rawCfg =
        (tmpl && typeof tmpl === 'object' ? (tmpl.productConfig ?? tmpl) : null) ?? m?.productConfig ?? null
      const variant = m?.productVariant
        ? String(m.productVariant)
        : tmpl && typeof tmpl === 'object' && tmpl.productVariant
          ? String(tmpl.productVariant)
          : undefined
      const config = rawCfg && typeof rawCfg === 'object' ? stripConfigDollars(rawCfg) : undefined
      const canEstimate = !isLuma && !!variant && (variant.startsWith('sundance') || variant.startsWith('jc'))
      return {
        catalog,
        product: isLuma ? LUMA_TABLE_TO_STORE[String(m?.table)] || 'Luma shade' : String(m?.productLine || m?.displayName || m?.note || '').slice(0, 80) || undefined,
        family: m?.fabricFamily ? String(m.fabricFamily) : undefined,
        sold_online: isLuma,
        ...(variant ? { variant } : {}),
        ...(config ? { config } : {}),
        note: isLuma
          ? 'This is a Luma fabric code, but the online store lists only a CURATED subset of Luma fabrics. Check list_store_products for a matching listing first: if found, configure/price it with get_product_options + quote_store_product; if NOT listed, say this exact fabric is available through the free consultation instead — do NOT promise it can be bought online, and do NOT guess a price.'
          : canEstimate
            ? 'Not sold online, but you CAN price a reference range: call get_sundance_jc_estimate with this variant + config + the window size, then present it as a reference and offer the free in-home measure.'
            : 'Consultation line (not sold online) — describe it and offer the free in-home consultation.',
      }
    })
    return { ok: true, matches }
  } catch {
    return { ok: false, error: 'network' }
  }
}
