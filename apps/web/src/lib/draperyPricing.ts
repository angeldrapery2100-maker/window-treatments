// Handcrafted drapery + handcrafted roman shade reference prices for the
// website AI assistant, via AAPP's `catalog_price_estimate`.
//
// WHY A SEPARATE FILE FROM lumaPricing.ts
// Luma self-configures: AAPP answers `{unconfigured, missing:["cassette
// (open/round/square)"]}` and we can safely pick the first offered value.
// Drapery and roman can't work that way — they price off a fabric's $/YARD,
// and `_priceHandcraftedDrapery` doesn't even report missing fields as
// `unconfigured`, it returns `{error:'incomplete_config: composition=…'}`.
// So the website validates FIRST and asks the customer.
//
// POLICY (Eddie 2026-08-10): when config is missing, ASK — one question at a
// time, most price-moving first. Only when the customer genuinely doesn't
// know (fabric_tier='unknown') do we fall back to a RANGE, priced at the real
// catalog's p25 and p75. Never invent a number, and never interrogate: the
// two questions a visitor can't answer (panel operation, whether they want a
// sheer layer) are assumed and disclosed rather than asked.

import { callAappAction, aappConfigured } from '@/lib/aappAction'
import {
  DRAPERY_FABRIC_TIERS,
  DRAPERY_TIER_SPAN,
  DRAPERY_FABRIC_WIDTH_IN,
  DRAPERY_PRICE_BOUNDS,
} from '@/lib/draperyFabricTiers.generated'

// ── Style vocabulary (mirrors AAPP_STYLE_ORDER in admin aappPresets.ts) ─────

const PLEATED_STYLES = ['2fold_pinch', '2fold_tailored', '3fold_pinch', '3fold_tailored']
const RIPPLE_STYLES = ['cn_6cm', 'cn_7cm', 'us_60', 'us_80', 'us_100', 'us_120']
export const DRAPERY_STYLE_KEYS = [...PLEATED_STYLES, ...RIPPLE_STYLES]

export function draperyStyleFamily(styleKey: string): 'pleated' | 'ripple' | null {
  if (PLEATED_STYLES.includes(styleKey)) return 'pleated'
  if (RIPPLE_STYLES.includes(styleKey)) return 'ripple'
  return null
}

export const ROMAN_STYLE_KEYS = ['flat', 'slouch', 'soft', 'front_fold', 'reverse_fold', 'hobbled']
export const LINING_TYPES = ['NO', 'LF', 'BO']
export const FABRIC_TIER_KEYS = [...DRAPERY_FABRIC_TIERS.map((t) => t.key), 'unknown']

// ── The ask-first contract ──────────────────────────────────────────────────

export interface AskNext {
  /** Field the caller should supply on the next call. */
  field: string
  /** Values the customer may pick from. */
  options: string[]
  /** What the model should actually say — kept here so the wording can't
   *  drift into a four-field form in the prompt. */
  askEn: string
  askZh: string
}

export interface CatalogEstimate {
  ok: boolean
  product?: 'drapery' | 'roman'
  /** Single figure — customer named a fabric or picked a tier. */
  price?: number
  /** Span — customer didn't know the fabric (priced at catalog p25 / p75). */
  rangeLow?: number
  rangeHigh?: number
  pricedAt?: string
  /** Exactly ONE question, when something price-moving is still missing. */
  ask?: AskNext
  /** Choices we made for the customer; the model must disclose these. */
  assumed?: Record<string, string>
  error?: string
}

function tierPrice(tier: string): number | null {
  const t = DRAPERY_FABRIC_TIERS.find((x) => x.key === tier)
  return t ? t.pricePerYard : null
}

/** Resolve the $/yard to price at. Returns a pair when we must show a span. */
function resolveFabricPrices(params: {
  fabricPricePerYard?: number
  fabricTier?: string
}): { prices: number[]; pricedAt: string } | { ask: true } {
  const explicit = Number(params.fabricPricePerYard)
  if (Number.isFinite(explicit) && explicit >= DRAPERY_PRICE_BOUNDS.min && explicit <= DRAPERY_PRICE_BOUNDS.max) {
    return { prices: [explicit], pricedAt: `the fabric you named ($${explicit}/yd)` }
  }
  const tier = String(params.fabricTier || '')
  if (tier === 'unknown') {
    return {
      prices: [DRAPERY_TIER_SPAN.low, DRAPERY_TIER_SPAN.high],
      pricedAt: 'a span across our fabric book, entry-level through designer',
    }
  }
  const p = tierPrice(tier)
  if (p != null) {
    const label = DRAPERY_FABRIC_TIERS.find((t) => t.key === tier)!.labelEn
    return { prices: [p], pricedAt: label }
  }
  return { ask: true }
}

const FABRIC_QUESTION: AskNext = {
  field: 'fabric_tier',
  options: FABRIC_TIER_KEYS,
  askEn: "Do you have a fabric in mind, or should I price it across our range? (entry-level / mid-range / designer — or just say you're not sure)",
  askZh: '面料有想法了吗?还是我按档次给你估一个?(入门 / 中档 / 高档 —— 不确定也行,我给个区间)',
}

// ── Handcrafted drapery ─────────────────────────────────────────────────────

export interface DraperyEstimateParams {
  /** FINISHED panel size — run recommend_drapery_size first, don't pass the
   *  raw window size. */
  finishedWidthIn: number
  finishedHeightIn: number
  styleKey?: string
  lining?: string
  fabricTier?: string
  fabricPricePerYard?: number
  /** Assumed 'fabric_only' unless the customer asked for a sheer layer. */
  composition?: string
  /** Assumed 'split' (centre-open). */
  operation?: string
}

export async function draperyEstimate(params: DraperyEstimateParams): Promise<CatalogEstimate> {
  if (!(params.finishedWidthIn > 0) || !(params.finishedHeightIn > 0)) {
    return { ok: false, product: 'drapery', error: 'missing_finished_size' }
  }

  // Ask order: most price-moving and most answerable first.
  const styleKey = String(params.styleKey || '')
  const family = draperyStyleFamily(styleKey)
  if (!family) {
    return {
      ok: false,
      product: 'drapery',
      ask: {
        field: 'style_key',
        options: ['2fold_pinch', '3fold_pinch', 'us_100'],
        askEn: 'Which heading do you like — a two-finger pinch pleat, a three-finger pinch pleat, or the softer ripplefold?',
        askZh: '帘头想要哪种?两褶(2-fold)、三褶(3-fold),还是更柔和的蛇形帘(ripplefold)?',
      },
    }
  }

  const lining = String(params.lining || '')
  if (!LINING_TYPES.includes(lining)) {
    return {
      ok: false,
      product: 'drapery',
      ask: {
        field: 'lining',
        options: LINING_TYPES,
        askEn: 'How much light do you want to block — unlined, light-filtering lining, or full blackout?',
        askZh: '遮光要做到什么程度?不加里布、加半遮光里布,还是全遮光?',
      },
    }
  }

  const fabric = resolveFabricPrices(params)
  if ('ask' in fabric) return { ok: false, product: 'drapery', ask: FABRIC_QUESTION }

  if (!aappConfigured()) return { ok: false, product: 'drapery', error: 'not_configured' }

  const assumed: Record<string, string> = {}
  const composition = params.composition || 'fabric_only'
  if (!params.composition) assumed.composition = 'fabric only (no sheer layer)'
  const operation = params.operation || 'split'
  if (!params.operation) assumed.operation = 'centre-open pair'

  const prices = await Promise.all(
    fabric.prices.map((pricePerYard) =>
      callAappAction({
        action: 'catalog_price_estimate',
        productVariant: 'drapery',
        widthIn: params.finishedWidthIn,
        heightIn: params.finishedHeightIn,
        productConfig: {
          finalSize: {
            finishedWidthIn: params.finishedWidthIn,
            finishedHeightIn: params.finishedHeightIn,
          },
          composition,
          styleFamily: family,
          styleKey,
          operation,
          layers: {
            main: {
              enabled: composition !== 'sheer_only',
              pricePerYard,
              widthNormalizedIn: DRAPERY_FABRIC_WIDTH_IN,
              liningType: lining,
            },
            sheer: {
              enabled: composition === 'fabric_plus_sheer' || composition === 'sheer_only',
              ...(composition === 'fabric_plus_sheer' || composition === 'sheer_only'
                ? { pricePerYard, widthNormalizedIn: DRAPERY_FABRIC_WIDTH_IN }
                : {}),
            },
          },
        },
      })
    )
  )
  return finish('drapery', prices, fabric.pricedAt, assumed)
}

// ── Handcrafted roman shade ─────────────────────────────────────────────────

export interface RomanEstimateParams {
  /** RAW measured window size — the engine applies the mount coverage add. */
  widthIn: number
  heightIn: number
  mount?: string
  styleKey?: string
  lining?: string
  fabricTier?: string
  fabricPricePerYard?: number
}

export async function romanEstimate(params: RomanEstimateParams): Promise<CatalogEstimate> {
  if (!(params.widthIn > 0) || !(params.heightIn > 0)) {
    return { ok: false, product: 'roman', error: 'missing_size' }
  }

  const styleKey = String(params.styleKey || '')
  if (!ROMAN_STYLE_KEYS.includes(styleKey)) {
    return {
      ok: false,
      product: 'roman',
      ask: {
        field: 'style_key',
        options: ROMAN_STYLE_KEYS,
        askEn: 'Which roman style — flat (crisp and tailored), soft or slouch (relaxed folds), or hobbled (stacked folds all the way down)?',
        askZh: '罗马帘想要哪种?平板 flat(挺括利落)、soft/slouch(自然垂坠),还是 hobbled(整片叠褶)?',
      },
    }
  }

  const lining = String(params.lining || '')
  if (!LINING_TYPES.includes(lining)) {
    return {
      ok: false,
      product: 'roman',
      ask: {
        field: 'lining',
        options: LINING_TYPES,
        askEn: 'How much light should it block — unlined, light-filtering, or blackout?',
        askZh: '遮光做到什么程度?不加里布、半遮光,还是全遮光?',
      },
    }
  }

  const fabric = resolveFabricPrices(params)
  if ('ask' in fabric) return { ok: false, product: 'roman', ask: FABRIC_QUESTION }

  if (!aappConfigured()) return { ok: false, product: 'roman', error: 'not_configured' }

  const assumed: Record<string, string> = {}
  const mount = params.mount === 'inner' || params.mount === 'outer' ? params.mount : 'inner'
  if (!params.mount) assumed.mount = 'inside mount'

  const prices = await Promise.all(
    fabric.prices.map((pricePerYard) =>
      callAappAction({
        action: 'catalog_price_estimate',
        productVariant: 'handcrafted_roman_shade',
        widthIn: params.widthIn,
        heightIn: params.heightIn,
        productConfig: {
          mount,
          styleKey,
          // fabricName is required by the engine but is a label, not a price
          // input — the $/yard beside it is what actually prices the shade.
          fabric: { fabricName: 'reference', pricePerYard, widthNormalizedIn: DRAPERY_FABRIC_WIDTH_IN },
          lining: { type: lining },
        },
      })
    )
  )
  return finish('roman', prices, fabric.pricedAt, assumed)
}

// ── Shared response handling ────────────────────────────────────────────────

function finish(
  product: 'drapery' | 'roman',
  results: (Awaited<ReturnType<typeof callAappAction>>)[],
  pricedAt: string,
  assumed: Record<string, string>
): CatalogEstimate {
  const values: number[] = []
  let lastError = 'estimate_failed'
  for (const r of results) {
    if (!r) { lastError = 'network'; continue }
    const json: any = r.data
    if (!json) { lastError = `upstream_${r.status}`; continue }
    if (json.ok !== true) {
      // AAPP reports drapery/roman gaps as an error string, not `unconfigured`
      // — surface it so the model can ask rather than claim we can't price.
      lastError = String(json.error || (json.unconfigured ? 'incomplete_config' : 'estimate_failed'))
      continue
    }
    const v = Number(json.listPrice)
    if (Number.isFinite(v) && v > 0) values.push(v)
  }
  if (values.length === 0) return { ok: false, product, error: lastError }

  const base: CatalogEstimate = {
    ok: true,
    product,
    pricedAt,
    ...(Object.keys(assumed).length ? { assumed } : {}),
  }
  if (values.length === 1) return { ...base, price: Math.round(values[0]) }
  return { ...base, rangeLow: Math.floor(Math.min(...values)), rangeHigh: Math.ceil(Math.max(...values)) }
}
