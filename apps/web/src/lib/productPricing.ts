// Server-authoritative pricing for custom-configured products.
//
// WHY THIS EXISTS (P0 fix): store products priced by dimensions/options carry
// base_price = 0 in the DB. calcServerTotals' anti-inflation cap
// (min(clientPrice, 5 × base_price)) therefore zeroed every custom item and
// orders charged shipping only. The correct authority for these products is
// the SAME pricing engine the product page uses — recomputed here on the
// server from DB-stored config (params/options), never from client numbers.
//
// Replicates, server-side, exactly what the product components do:
//   - drapery / shade: engine with baseParams = default_config.params
//   - sheer:           engine + sheer_unit_price fallback from the selected
//                      fabric_color value's fabric_price (SheerProduct.tsx)
//   - hardware:        rod fixed_price + finial_price + ceil(extra/12) × per-foot
//                      (HardwareProduct.tsx)

import { query, queryOne } from '@/lib/db'
import { UnifiedPricingEngine } from '@window-treatments/shared/pricing/engines'
import { isAappConfigured, calculateAapp, mergeAappConfig } from '@window-treatments/shared/pricing/aapp'
import { SETTING_GROUPS } from '@/lib/settingGroups'

export type EngineProductType = 'drapery' | 'sheer' | 'shade'
export type OptionValues = Record<string, Record<string, Record<string, number>>>

// Admin option-param key → engine formula key (mirrors pricing/calculate route)
export const KEY_MAP: Record<string, string> = {
  fabric_price:     'fabric_unit_price',
  lining_price:     'lining_price_per_yard',
  labor_price:      'labor_per_panel',
  controller_price: 'control_price',
  stack_divisor:    'stacking_divisor',
}

export const FORMULA_DEFAULTS: Record<string, Record<string, number>> = {
  shade:   { control_price: 0, hardware_unit_price: 0, fabric_unit_price: 0 },
  drapery: { lining_price_per_yard: 0, labor_per_panel: 0, fabric_unit_price: 0 },
}

function mapKeys(params: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(params)) out[KEY_MAP[k] ?? k] = v
  return out
}

// Pure: run the engine with the same key-mapping the calculate route applies.
export function runEngineWithMapping(args: {
  productType: EngineProductType
  input: { width: number; height: number }
  baseParams: Record<string, any>
  options: Record<string, string>
  optionValues: OptionValues
  formula: any
  configVariables?: Record<string, any>
}): number {
  const { productType, input, baseParams, options, optionValues, formula, configVariables } = args

  const mappedOptionValues: OptionValues = {}
  for (const [optKey, valMap] of Object.entries(optionValues)) {
    const newValMap: Record<string, Record<string, number>> = {}
    for (const [val, paramObj] of Object.entries(valMap)) {
      newValMap[val] = mapKeys(paramObj)
    }
    mappedOptionValues[optKey] = newValMap
  }

  const mergedBaseParams = {
    ...(FORMULA_DEFAULTS[productType] ?? {}),
    ...(configVariables ?? {}),
    ...baseParams,
  }

  const result = UnifiedPricingEngine.calculate(input, {
    productType,
    baseParams: mergedBaseParams,
    options,
    optionValues: mappedOptionValues,
    formula: formula ?? { steps: [] },
  })
  return result.total
}

async function loadPricingConfig(productType: string): Promise<{ formula: any; variables: any } | null> {
  return queryOne<{ formula: any; variables: any }>(
    `SELECT pc.formula, pc.variables
     FROM pricing_configs pc
     JOIN product_types pt ON pt.id = pc.product_type_id
     WHERE pt.slug = $1 AND pc.is_active = true
     LIMIT 1`,
    [productType]
  ).catch(() => null)
}

// Mirrors useProductData.buildOptionValues(): flatten each option value's
// numeric params (v.params.* plus numeric top-level fields).
function buildOptionValuesFromCfg(options: any[]): OptionValues {
  const optionValues: OptionValues = {}
  for (const opt of options || []) {
    const valMap: Record<string, Record<string, number>> = {}
    for (const v of opt.values || []) {
      const numeric: Record<string, number> = {}
      if (v?.params && typeof v.params === 'object') {
        for (const [k, val] of Object.entries(v.params)) {
          if (typeof val === 'number') numeric[k] = val
        }
      }
      for (const [k, val] of Object.entries(v || {})) {
        if (!['value', 'label', 'id', 'params', 'sort_order'].includes(k) && typeof val === 'number') {
          numeric[k] = val as number
        }
      }
      valMap[v.value] = numeric
    }
    if (Object.keys(valMap).length > 0) optionValues[opt.name] = valMap
  }
  return optionValues
}

function parseFraction(f: unknown): number {
  if (typeof f === 'number') return f
  if (typeof f !== 'string' || !f) return 0
  const m = f.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (m) return Number(m[1]) / Number(m[2])
  const n = Number(f)
  return Number.isFinite(n) ? n : 0
}

export interface ServerPriceItem {
  productId: string
  width?: number | string
  height?: number | string
  widthFraction?: string | number
  heightFraction?: string | number
  // Cart sends [{name, value, ...}]; accept a plain map too.
  options?: Array<{ name: string; value: string }> | Record<string, string>
}

function normalizeSelections(options: ServerPriceItem['options']): Record<string, string> {
  if (!options) return {}
  if (Array.isArray(options)) {
    const out: Record<string, string> = {}
    for (const o of options) if (o?.name) out[o.name] = String(o.value)
    return out
  }
  return options
}

// Merge the numeric params of the SELECTED option values (raw keys, un-mapped).
// Shared by the aapp branch of computeServerUnitPrice and computeAappBreakdown
// so option→param resolution can never drift between the two.
function mergeSelectedOptionParams(cfgOptions: any[], sel: Record<string, string>): Record<string, number> {
  const optionValues = buildOptionValuesFromCfg(cfgOptions || [])
  const optionParams: Record<string, number> = {}
  for (const [optName, value] of Object.entries(sel)) {
    const params = optionValues[optName]?.[value]
    if (params) Object.assign(optionParams, params)
  }
  return optionParams
}

// ── Global drapery pricing settings (公用系统) ────────────────────────────────
// Site-settings group `drapery_pricing` (lib/settingGroups.ts) holds the
// lining/labor/banding tier prices shared by ALL drapery products, editable in
// ONE place (admin product editor → 计算参数 → 衬布 card). Built into the
// engine's DeepPartial<DraperyConfig> override shape and merged UNDER any
// product-level baseParams.aapp_config, so precedence is:
//   engine factory defaults < global drapery_pricing settings < product aapp_config
// Defaults mirror AAPP factory values — when the site_settings table is empty
// (or unreachable) pricing is identical to before this feature existed.

const DRAPERY_PRICING_KEYS = Object.keys(SETTING_GROUPS.drapery_pricing.settings)

let _gdcCache: { at: number; cfg: Record<string, any> | null } | null = null
const GDC_TTL_MS = 60_000

/** Test/ops hook: drop the 60s memo so the next call re-reads site_settings. */
export function invalidateGlobalDraperyConfig(): void {
  _gdcCache = null
}

/**
 * Load the `drapery_pricing` settings group and shape it as a
 * DeepPartial<DraperyConfig> override for the AAPP drapery engine.
 * 60s in-memory memo. Returns null when settings can't be read (engine
 * defaults then apply unchanged — fail-open to factory AAPP values).
 */
export async function getGlobalDraperyConfig(): Promise<Record<string, any> | null> {
  if (_gdcCache && Date.now() - _gdcCache.at < GDC_TTL_MS) return _gdcCache.cfg

  let cfg: Record<string, any> | null = null
  try {
    const rows = await query<{ key: string; value: string }>(
      'SELECT key, value FROM site_settings WHERE key = ANY($1)',
      [DRAPERY_PRICING_KEYS]
    )
    const stored: Record<string, string> = {}
    for (const r of rows) stored[r.key] = r.value

    // Unset keys fall back to the group's defaultValue (= AAPP factory value).
    const val = (key: string): number => {
      const meta = SETTING_GROUPS.drapery_pricing.settings[key]
      const raw = stored[key] ?? meta.defaultValue
      const n = Number(raw)
      return Number.isFinite(n) && n >= 0 ? n : Number(meta.defaultValue)
    }

    cfg = {
      liningOptions: {
        NO: { liningPricePerYard: val('lining_no_price_per_yard'), laborPerPanel: val('lining_no_labor_per_panel') },
        LF: { liningPricePerYard: val('lining_lf_price_per_yard'), laborPerPanel: val('lining_lf_labor_per_panel') },
        BO: { liningPricePerYard: val('lining_bo_price_per_yard'), laborPerPanel: val('lining_bo_labor_per_panel') },
      },
      sheerLaborPerPanel: val('sheer_labor_per_panel'),
      banding: {
        laborPerFoot: val('banding_labor_per_foot'),
        styles: {
          banding_std: { pricePerYard: val('banding_std_price_per_yard') },
          banding_prem: { pricePerYard: val('banding_prem_price_per_yard') },
        },
      },
    }
  } catch {
    cfg = null // table missing / db hiccup → engine factory defaults
  }

  _gdcCache = { at: Date.now(), cfg }
  return cfg
}

/**
 * Shared by BOTH pricing entry points (runAappForItem here and the
 * /api/store/pricing/calculate route) so the global-config merge can never
 * drift between live quote and checkout re-verification.
 * For engine 'drapery', returns baseParams with `aapp_config` = global
 * settings deep-merged UNDER the product-level aapp_config (product wins).
 * Other engines pass through untouched.
 */
export async function withGlobalDraperyConfig(
  engine: string,
  baseParams: Record<string, any>,
): Promise<Record<string, any>> {
  if (engine !== 'drapery') return baseParams
  const global = await getGlobalDraperyConfig()
  if (!global) return baseParams
  const productCfg = baseParams.aapp_config && typeof baseParams.aapp_config === 'object'
    ? baseParams.aapp_config
    : undefined
  return { ...baseParams, aapp_config: mergeAappConfig(global, productCfg) }
}

// ── Hardware-by-product-reference (drapery bundled rod/track) ────────────────
// Convention: the drapery configurator stores the chosen add-on rod/track as
// option `hardware_product` = <hardware product id> ('none' = declined). The
// price comes from that hardware product's OWN configuration, evaluated by the
// AAPP adapter's existing bundled-hardware path at rod length = drapery
// finished width. This helper derives the hw_* pricing params from the
// referenced product row. Priority:
//   1. explicit aapp_hw_* / hw_* keys in its default_config.params
//   2. legacy hardware model: first `rod` option value's fixed_price /
//      price_per_foot + params.base_length → { hw_base_price,
//      hw_add_per_foot, hw_min_width_in }
// Finials are NOT auto-included (v1 keeps the add-on to the bare rod/track).
// No cross-request caching — one queryOne per item, always-fresh admin edits.
export async function resolveHardwareProductParams(hardwareProductId: string): Promise<Record<string, number> | null> {
  if (!hardwareProductId) return null
  const row = await queryOne<{ default_config: any }>(
    'SELECT default_config FROM products WHERE id = $1',
    [hardwareProductId]
  ).catch(() => null)
  if (!row) return null

  const cfg = row.default_config || {}
  const p = cfg.params || {}
  const pos = (v: unknown): number | undefined => {
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : undefined
  }

  // 1) Explicit aapp_hw_* / hw_* params on the hardware product itself.
  const direct: Record<string, number> = {}
  const basePrice   = pos(p.aapp_hw_base_price)     ?? pos(p.hw_base_price)
  const addPerFoot  = pos(p.aapp_hw_add_per_foot)   ?? pos(p.hw_add_per_foot)
  const perFootOnly = pos(p.aapp_hw_price_per_foot) ?? pos(p.hw_price_per_foot)
  const minWidthIn  = pos(p.aapp_hw_min_width_in)   ?? pos(p.hw_min_width_in)
  if (basePrice != null)   direct.hw_base_price     = basePrice
  if (addPerFoot != null)  direct.hw_add_per_foot   = addPerFoot
  if (perFootOnly != null) direct.hw_price_per_foot = perFootOnly
  if (minWidthIn != null)  direct.hw_min_width_in   = minWidthIn
  if (direct.hw_base_price || direct.hw_add_per_foot || direct.hw_price_per_foot) return direct

  // 2) Legacy hardware model (HardwareProduct.tsx): first rod value's
  //    fixed_price / price_per_foot, free length params.base_length.
  const rodOpt = (cfg.options || []).find((o: any) => o?.name === 'rod')
  const rod = rodOpt?.values?.[0]
  const legacy: Record<string, number> = {}
  const fixed   = pos(rod?.params?.fixed_price)
  const perFoot = pos(rod?.params?.price_per_foot)
  const baseLen = pos(p.base_length)
  if (fixed != null)   legacy.hw_base_price    = fixed
  if (perFoot != null) legacy.hw_add_per_foot  = perFoot
  if (baseLen != null) legacy.hw_min_width_in  = baseLen
  if (legacy.hw_base_price || legacy.hw_add_per_foot) return legacy

  return null
}

// Shared by BOTH pricing entry points (this module's runAappForItem and the
// /api/store/pricing/calculate route) so the hardware_product resolution can
// never drift between live quote and checkout re-verification.
// For an aapp drapery item with options.hardware_product set (≠ 'none'),
// resolves the referenced hardware product's hw_* params, merges them into
// optionParams and flags options.hardware='yes' — the adapter's EXISTING
// bundled-hardware path then prices it at lengthIn = finished width.
// Throws (fail-closed) when the referenced product has no price model.
export async function applyHardwareProductSelection(
  engine: string,
  options: Record<string, string>,
  optionParams: Record<string, number>,
): Promise<{ options: Record<string, string>; optionParams: Record<string, number> }> {
  const hwId = options.hardware_product
  if (engine !== 'drapery' || !hwId || hwId === 'none') return { options, optionParams }
  const hw = await resolveHardwareProductParams(hwId)
  if (!hw) {
    throw new Error('hardware_product: referenced hardware product has no price model configured')
  }
  return {
    options: { ...options, hardware: 'yes' },
    optionParams: { ...optionParams, ...hw },
  }
}

// Run the AAPP adapter for an item against a product's default_config.
// Throws (fail-closed) on missing dimensions or unpriceable configurations —
// exactly like the aapp branch of computeServerUnitPrice, which calls this.
async function runAappForItem(cfg: any, item: ServerPriceItem, sel: Record<string, string>): Promise<{ result: ReturnType<typeof calculateAapp>; engine: string }> {
  const width = (Number(item.width) || 0) + parseFraction(item.widthFraction)
  const height = (Number(item.height) || 0) + parseFraction(item.heightFraction)
  if (width <= 0) throw new Error('Missing width for custom-priced item')
  const engine = String(cfg.params.aapp_engine)
  const needsHeight = engine !== 'drapery_hardware' && engine !== 'somfy_track'
  if (needsHeight && height <= 0) throw new Error('Missing height for custom-priced item')

  const optionParams = mergeSelectedOptionParams(cfg.options || [], sel)
  const resolved = await applyHardwareProductSelection(engine, sel, optionParams)
  // Global drapery pricing settings merged UNDER product aapp_config —
  // same helper as the calculate route (no drift).
  const baseParams = await withGlobalDraperyConfig(engine, cfg.params || {})

  const result = calculateAapp({
    width,
    height,
    baseParams,
    options: resolved.options,
    optionParams: resolved.optionParams,
  })
  return { result, engine }
}

/**
 * Full AAPP engine result (total + production breakdown) for a product item.
 * Returns null when the product has no `params.aapp_engine` (legacy pricing
 * path — no production parameters exist for it). Used by the auto work-order
 * snapshot (lib/workOrders.ts) so the work order carries the SAME intermediate
 * values (panel counts, yardages, cut lengths, …) the quote was priced with.
 */
export async function computeAappBreakdown(item: ServerPriceItem): Promise<{ total: number; breakdown: Record<string, number | string>; engine: string } | null> {
  const row = await queryOne<{ default_config: any }>(
    `SELECT p.default_config
     FROM products p
     WHERE p.id = $1`,
    [item.productId]
  )
  if (!row) return null

  const cfg = row.default_config || {}
  if (!isAappConfigured(cfg.params)) return null

  const sel = normalizeSelections(item.options)
  const { result, engine } = await runAappForItem(cfg, item, sel)
  return { total: Math.round(Number(result.total)), breakdown: result.breakdown, engine }
}

/**
 * Server-authoritative unit price for a product, recomputed from DB config.
 * Throws (fail-closed) when the item can't be priced — never returns 0 prices
 * silently.
 */
export async function computeServerUnitPrice(item: ServerPriceItem): Promise<{ unitPrice: number; basePrice: number; type: string }> {
  const row = await queryOne<{ base_price: string; default_config: any; type: string }>(
    `SELECT p.base_price, p.default_config, pt.slug AS type
     FROM products p
     JOIN product_types pt ON pt.id = p.product_type_id
     WHERE p.id = $1 AND p.is_active = true`,
    [item.productId]
  )
  if (!row) throw new Error(`Product not available: ${item.productId}`)

  const basePrice = Number(row.base_price) || 0
  const cfg = row.default_config || {}
  const type = row.type
  const sel = normalizeSelections(item.options)

  // ── AAPP-parity engine (products with params.aapp_engine) ─────────────────
  // Mirrors the /api/store/pricing/calculate branch exactly — same adapter,
  // same option→input mapping — so checkout re-verification always agrees
  // with what the product page displayed. See docs/aapp-engine-wiring.md.
  if (isAappConfigured(cfg.params)) {
    const { result: aapp } = await runAappForItem(cfg, item, sel)
    const unitPrice = Math.round(Number(aapp.total))
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error('Could not compute server price for custom item')
    }
    return { unitPrice, basePrice, type }
  }

  // ── Hardware: fixed formula from option params (no engine) ────────────────
  if (type === 'hardware') {
    const width = Number(item.width) || 0
    if (width <= 0) throw new Error('Missing width for hardware item')
    const totalWidth = width + parseFraction(item.widthFraction)

    const opts: any[] = cfg.options || []
    const rodOpt    = opts.find(o => o.name === 'rod')
    const finialOpt = opts.find(o => o.name === 'finial')
    const rod    = rodOpt?.values?.find((v: any) => v.value === sel['rod'])
    const finial = finialOpt?.values?.find((v: any) => v.value === sel['finial'])

    const fixedPrice   = rod?.params?.fixed_price ?? 0
    const baseLength   = cfg.params?.base_length ?? 48
    const finialPrice  = finial?.params?.finial_price ?? 0
    const pricePerFoot = rod?.params?.price_per_foot ?? 0
    const extraFeet    = Math.ceil(Math.max(0, totalWidth - baseLength) / 12)

    const unitPrice = Math.round(fixedPrice + finialPrice + extraFeet * pricePerFoot)
    if (!(unitPrice > 0)) throw new Error('Could not price hardware item')
    return { unitPrice, basePrice, type }
  }

  // ── Engine types: drapery / sheer / shade ────────────────────────────────
  if (type !== 'drapery' && type !== 'sheer' && type !== 'shade') {
    throw new Error(`Unsupported product type for server pricing: ${type}`)
  }

  const width  = Number(item.width)
  const height = Number(item.height)
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('Missing dimensions for custom-priced item')
  }

  const optionValues = buildOptionValuesFromCfg(cfg.options || [])
  const baseParams: Record<string, any> = { ...(cfg.params || {}) }

  // SheerProduct.tsx parity: engine reads sheer_unit_price; admin stores the
  // per-color price as fabric_price on the selected fabric_color value.
  if (type === 'sheer' && baseParams.sheer_unit_price == null) {
    const fabricOpt = (cfg.options || []).find((o: any) => o.name === 'fabric_color')
    const v = fabricOpt?.values?.find((x: any) => x.value === sel['fabric_color'])
    baseParams.sheer_unit_price = v?.params?.fabric_price ?? 0
  }

  const pricingConfig = await loadPricingConfig(type)

  const total = runEngineWithMapping({
    productType: type,
    input: { width, height },
    baseParams,
    options: sel,
    optionValues,
    formula: pricingConfig?.formula ?? { steps: [] },
    configVariables: pricingConfig?.variables ?? {},
  })

  const unitPrice = Math.round(Number(total))
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    throw new Error('Could not compute server price for custom item')
  }
  return { unitPrice, basePrice, type }
}
