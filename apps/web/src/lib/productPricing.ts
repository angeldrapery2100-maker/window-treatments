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
