// Drapery work-order FORM payload builder.
//
// Eddie wants the website's work order to look/behave EXACTLY like AAPP's
// editable drapery work order (public/work-orders/drapery-order.html), which is
// the real AAPP form embedded via iframe. That form is populated by a
// postMessage `DRAPERY_LOAD` payload of shape { meta, rows }. This module maps a
// website order (its items + the AAPP-engine production breakdown captured in
// work_orders.items_snapshot) into that exact payload.
//
// The field derivation mirrors AAPP app-workorder-preview.js `_draperyRowFromItem`
// 1:1 so an autofilled row reads identically to one produced inside AAPP:
//   cutW = finishedWidth / panelCount        cutH = finishedHeight
//   botton (扣/幅/裁): ripple → N+"+3"; pleated 横做 → round(perSide)"; else widths/side
//   ret  = calcDraperyReturnIn(isSheer, hwReturn, composition, styleFamily)
// Everything the autofill can't determine is left blank — the form is fully
// editable, exactly like AAPP's, so the workshop completes it by hand.
//
// 扣/幅/裁 (widths-per-side) is normally computed by the pricing engine. When a
// product isn't wired to that engine (no production snapshot), we recompute JUST
// the geometry with the same spacing-first math (draperyMainGeometry) — no
// pricing touched — so the factory number still appears. Fabric bolt width falls
// back to 54" when unknown; the workshop can adjust.

import { draperyMainGeometry } from '@window-treatments/shared/pricing/aapp'

export interface FormOption {
  name?: string
  displayLabel?: string
  value?: string
  valueLabel?: string
}

export interface FormOrderItem {
  productName?: string
  productType?: string
  productId?: string
  width?: number | string
  height?: number | string
  widthFraction?: string | number
  heightFraction?: string | number
  options?: FormOption[]
  location?: string
  notes?: string
}

/** One order line + its captured AAPP engine breakdown + resolved fabric widths. */
export interface DraperyFormEntry {
  item: FormOrderItem
  /** work_orders.items_snapshot production breakdown (drapery.ts engine keys). */
  production?: Record<string, number | string> | null
  /** Main-fabric bolt width (in) from product params — display only. */
  mainFabricWidthIn?: number
  /** Sheer-fabric bolt width (in) from product params — display only. */
  sheerFabricWidthIn?: number
}

export interface DraperyFormLayer {
  name: string
  color: string
  width: string
  cutW: string
  cutH: string
  panels: string
  botton: string
  lining: string
  ret: string
}

export interface DraperyFormRow {
  location: string
  size: string
  operation: string
  operationKey: string
  style: string
  styleKey: string
  styleFamily: string
  layers: DraperyFormLayer[]
  notes: string
}

export interface DraperyFormPayload {
  meta: {
    company: string
    address: string
    phone: string
    website: string
    po: string
    sidemark: string
    date: string
    complete: string
    ops: { k: string; label: string }[]
    styles: { pleated: { k: string; label: string }[]; ripple: { k: string; label: string }[] }
  }
  rows: DraperyFormRow[]
}

// Angel Drapery letterhead — matches the AAPP form exactly (一模一样).
const COMPANY = 'Angel Drapery, Inc'
const ADDRESS = '8831 Las Tunas Dr, Temple City, CA 91780'
const PHONE = '888-689-9989'
const WEBSITE = 'angel-drapery.com'

// Operation + pleat-style option sets — keys MUST match the drapery engine
// config (packages/shared/src/pricing/aapp/drapery.ts styleKey/operation),
// mirrors AAPP _DR_OPS / _DR_STYLES.
export const DR_OPS = [
  { k: 'split', label: 'Split Draw' },
  { k: 'single_left', label: 'One Way Left' },
  { k: 'single_right', label: 'One Way Right' },
]
export const DR_STYLES = {
  pleated: [
    { k: 'pinch_2', label: '2-Fold Pinch' },
    { k: 'pinch_3', label: '3-Fold Pinch' },
    { k: 'tailored_2', label: '2-Fold Tailored' },
    { k: 'tailored_3', label: '3-Fold Tailored' },
  ],
  ripple: [
    { k: 'cn_6cm', label: 'Perfect Wave' },
    { k: 'cn_7cm', label: 'Grand Wave' },
    { k: 'us_60', label: 'US 60%' },
    { k: 'us_80', label: 'US 80%' },
    { k: 'us_100', label: 'US 100%' },
    { k: 'us_120', label: 'US 120%' },
  ],
}

const STYLE_LABELS: Record<string, string> = {
  pinch_2: '2-Fold Pinch', pinch_3: '3-Fold Pinch',
  tailored_2: '2-Fold Tailored', tailored_3: '3-Fold Tailored',
  cn_6cm: 'Perfect Wave', cn_7cm: 'Grand Wave',
  us_60: 'US 60%', us_80: 'US 80%', us_100: 'US 100%', us_120: 'US 120%',
}
const OP_LABELS: Record<string, string> = {
  split: 'Split Draw', single_left: 'One Way Left', single_right: 'One Way Right',
}

/** Inches → mixed fraction to the nearest 1/8 — 1:1 port of AAPP fmtInch(). */
export function fmtInch(val: number): string {
  if (!val) return '—'
  let w = Math.floor(val)
  let f = Math.round((val - w) * 8)
  if (f >= 8) { w++; f = 0 }
  const fr = ['', '1/8', '1/4', '3/8', '½', '5/8', '3/4', '7/8']
  return w + (f > 0 ? ' ' + fr[f] : '') + '"'
}

/** Drapery return inches — 1:1 port of AAPP calcDraperyReturnIn(). */
export function calcDraperyReturnIn(
  isSheer: boolean,
  hwReturn: number | undefined,
  composition: string,
  styleFamily: string,
): number {
  const base = isSheer && composition === 'fabric_plus_sheer' ? 1.5 : (Number(hwReturn) || 3.5)
  const offset = styleFamily === 'pleated' ? 3.5 : 0
  return base + offset
}

function styleFamilyFromKey(k: string): string {
  return /^(cn_|us_)/.test(String(k || '')) ? 'ripple' : 'pleated'
}

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function parseFraction(f: unknown): number {
  if (f == null || f === '' || f === '0') return 0
  const s = String(f).trim()
  if (s.includes('/')) {
    const [a, b] = s.split('/').map(Number)
    return b ? a / b : 0
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

// Case/format-tolerant option finders.
function findOption(item: FormOrderItem, matchers: RegExp[]): FormOption | undefined {
  const opts = item.options || []
  for (const re of matchers) {
    const hit = opts.find(o => re.test(String(o.name || '')) || re.test(String(o.displayLabel || '')))
    if (hit) return hit
  }
  return undefined
}

function lining(code: unknown): string {
  const c = String(code || '').toUpperCase()
  return c === 'NO' || c === 'LF' || c === 'BO' ? c : (code ? c : '—')
}

// 扣/幅/裁 value — mirrors AAPP _draperyCol6Val (clean, no 竖拼/横做 suffix).
function bottonVal(
  styleFamily: string,
  orientation: string,
  n: number,
  perSide: number,
  wps: number | null,
): string {
  if (styleFamily === 'ripple') return n ? n + '+3' : ''
  // website orientation strings: 'railroaded' == AAPP 横做, 'vertical' == 竖拼
  if (orientation === 'railroaded' || orientation === '横做') {
    return perSide ? Math.round(perSide) + '″' : ''
  }
  return wps != null && !Number.isNaN(wps) && wps !== 0 ? String(wps) : ''
}

// Parse an inch string like "3 1/2", "3 1/2 inches", "3½"" → 3.5.
function parseInches(s: unknown): number {
  if (s == null) return 0
  let t = String(s).toLowerCase().replace(/inches?|in\b|["″']/g, '').trim()
  for (const [g, v] of Object.entries({ '⅛': .125, '¼': .25, '⅜': .375, '½': .5, '⅝': .625, '¾': .75, '⅞': .875 })) t = t.replace(g, ' ' + v)
  const m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/) // "3 1/2"
  if (m) return Number(m[1]) + (Number(m[3]) ? Number(m[2]) / Number(m[3]) : 0)
  const f = t.match(/^(\d+)\/(\d+)$/) // "1/2"
  if (f) return Number(f[2]) ? Number(f[1]) / Number(f[2]) : 0
  const n = Number(t)
  return Number.isFinite(n) ? n : 0
}

// ── Fallbacks from the ORDER OPTIONS (used when there's no engine breakdown) ──
// Website drapery lines carry pleat_style / operation / lining / return as
// selected options; the AAPP-parity engine isn't always wired, so these are
// usually the real source of truth for the work order.
function opKeyFromOption(item: FormOrderItem): string {
  const o = findOption(item, [/^operation$/i, /operation|draw|split/i])
  const s = `${o?.value || ''} ${o?.valueLabel || ''}`.toLowerCase()
  if (!s.trim()) return ''
  if (/left|owl|\bl\b/.test(s)) return 'single_left'
  if (/right|owr|\br\b/.test(s)) return 'single_right'
  if (/center|c\/o|split|both/.test(s)) return 'split'
  return ''
}
function styleFromOption(item: FormOrderItem): { key: string; family: string } {
  const o = findOption(item, [/pleat_style|^pleat$|^style$/i, /pleat|fold|wave/i])
  const s = `${o?.value || ''} ${o?.valueLabel || ''}`.toLowerCase()
  if (!s.trim()) return { key: '', family: '' }
  if (/us\s*120|120%/.test(s)) return { key: 'us_120', family: 'ripple' }
  if (/us\s*100|100%/.test(s)) return { key: 'us_100', family: 'ripple' }
  if (/us\s*80|80%/.test(s)) return { key: 'us_80', family: 'ripple' }
  if (/us\s*60|60%/.test(s)) return { key: 'us_60', family: 'ripple' }
  if (/grand|7\s*cm/.test(s)) return { key: 'cn_7cm', family: 'ripple' }
  if (/perfect|ripple|wave|6\s*cm/.test(s)) return { key: 'cn_6cm', family: 'ripple' }
  if (/3.*tailor|tailor.*3/.test(s)) return { key: 'tailored_3', family: 'pleated' }
  if (/tailor/.test(s)) return { key: 'tailored_2', family: 'pleated' }
  if (/3.*(fold|pinch)|pinch.*3|triple/.test(s)) return { key: 'pinch_3', family: 'pleated' }
  if (/pinch|fold/.test(s)) return { key: 'pinch_2', family: 'pleated' }
  return { key: '', family: '' }
}
function liningFromOption(item: FormOrderItem): string {
  const o = findOption(item, [/^lining$/i, /lining/i])
  const s = `${o?.value || ''} ${o?.valueLabel || ''}`.toLowerCase()
  if (!s.trim()) return ''
  if (/black\s*out|\bbo\b/.test(s)) return 'BO'
  if (/light|filter|\blf\b|privacy|interlin/.test(s)) return 'LF'
  if (/no\b|none|unlined/.test(s)) return 'NO'
  return ''
}

/**
 * Build one drapery-form row from an order line + its engine breakdown.
 * Prefers the engine breakdown when present; otherwise pulls operation / pleat
 * style / lining / return straight from the order options. Anything still
 * unknown (e.g. 扣/幅/裁 widths, which only the engine computes) is left blank
 * for the workshop to fill in the fully-editable form.
 */
export function draperyRowFromEntry(entry: DraperyFormEntry, index: number): DraperyFormRow {
  const { item } = entry
  const p = entry.production || {}

  // Finished size — prefer the engine breakdown (authoritative), fall back to
  // the order line's raw W/H + fractions.
  const finW = num(p.finishedWidthIn) || (num(item.width) + parseFraction(item.widthFraction))
  const finH = num(p.finishedHeightIn) || (num(item.height) + parseFraction(item.heightFraction))

  const optStyle = styleFromOption(item)
  const operation = String(p.operation || '') || opKeyFromOption(item) || 'split'
  const styleKey = String(p.styleKey || '') || optStyle.key
  const styleFamily = String(p.styleFamily || '') || optStyle.family || styleFamilyFromKey(styleKey)
  const panelCt = operation === 'split' ? 2 : 1
  const singleW = panelCt > 1 ? finW / panelCt : finW

  // Which layers does this line carry? Inferred from the breakdown keys.
  const hasMain = 'mainPerSide' in p || 'mainCutDrop' in p
  const hasSheer = 'sheerPerSide' in p || 'sheerYds' in p
  const isStandaloneSheer = (item.productType || '').toLowerCase() === 'sheer'
  const composition = hasMain && hasSheer
    ? 'fabric_plus_sheer'
    : (hasSheer || isStandaloneSheer) && !hasMain
      ? 'sheer_only'
      : 'fabric_only'

  const mainFabOpt = findOption(item, [/^fabric_color$/i, /main.*fabric/i, /^fabric$/i, /fabric.*color/i])
  const sheerFabOpt = findOption(item, [/sheer.*fabric/i, /sheer.*color/i, /^sheer$/i])
  const hwReturnOpt = findOption(item, [/^return$/i, /return/i])
  // Explicit return chosen on the order (e.g. "3 1/2 inches") wins over the
  // style-derived default; fall back to 3.5" only when nothing is set.
  const returnOptIn = hwReturnOpt ? parseInches(hwReturnOpt.value || hwReturnOpt.valueLabel) : 0
  const hwReturn = returnOptIn > 0 ? returnOptIn : 3.5
  const optLining = liningFromOption(item)

  // No engine breakdown → recompute the MAIN layer's shop geometry (same spacing
  // math the engine uses) so 扣/幅/裁 fills. Pricing is never touched.
  let geo: ReturnType<typeof draperyMainGeometry> | null = null
  if (!hasMain && finW > 0 && finH > 0 && styleKey) {
    try {
      geo = draperyMainGeometry({
        finishedWidthIn: finW, finishedHeightIn: finH,
        styleFamily, styleKey, operation,
        fabricWidthIn: entry.mainFabricWidthIn ?? 54,
        returnIn: hwReturn,
      })
    } catch { geo = null }
  }

  const layers: DraperyFormLayer[] = []

  const mkLayer = (isSheer: boolean, fabOpt: FormOption | undefined, fabricWidthIn: number | undefined): DraperyFormLayer => {
    const prefix = isSheer ? 'sheer' : 'main'
    const useGeo = !isSheer && geo
    const perSide = useGeo ? geo!.perSide : num(p[`${prefix}PerSide`])
    const orientation = useGeo ? geo!.orientation : String(p[`${prefix}Orientation`] || '')
    const wpsRaw = p[`${prefix}Wps`]
    const wps = useGeo ? geo!.widthsPerSide : (wpsRaw === '' || wpsRaw == null ? null : num(wpsRaw))
    // ripple carrier count N: main has it (mainNp); the sheer layer shares the
    // same N (same window width + system) so reuse mainNp when present.
    const n = useGeo ? geo!.np : (num(p[`${prefix}Np`]) || num(p.mainNp))
    const ret = calcDraperyReturnIn(isSheer, hwReturn, composition, styleFamily)
    const liningCode = isSheer ? '—' : (p.mainLiningType != null ? p.mainLiningType : (optLining || 'NO'))
    return {
      name: fabOpt?.valueLabel || '',
      color: fabOpt?.value && fabOpt.value !== fabOpt.valueLabel ? String(fabOpt.value) : '',
      width: fabricWidthIn ? fabricWidthIn + '″' : '',
      cutW: fmtInch(singleW),
      cutH: fmtInch(finH),
      panels: String(panelCt),
      botton: bottonVal(styleFamily, orientation, n, perSide, wps),
      lining: lining(liningCode),
      ret: fmtInch(ret),
    }
  }

  if (composition === 'sheer_only') {
    layers.push(mkLayer(true, sheerFabOpt || mainFabOpt, entry.sheerFabricWidthIn ?? entry.mainFabricWidthIn))
  } else {
    if (hasMain || composition === 'fabric_only') layers.push(mkLayer(false, mainFabOpt, entry.mainFabricWidthIn))
    if (hasSheer) layers.push(mkLayer(true, sheerFabOpt, entry.sheerFabricWidthIn))
  }
  // Guarantee at least one row so the card is never empty.
  if (layers.length === 0) layers.push(mkLayer(false, mainFabOpt, entry.mainFabricWidthIn))

  const location = item.location || String((item.options || []).find(o => /location|room|window/i.test(String(o.name || o.displayLabel || '')))?.valueLabel || '') || item.productName || `Window ${index + 1}`

  return {
    location,
    size: fmtInch(finW) + ' × ' + fmtInch(finH),
    operation: OP_LABELS[operation] || operation,
    operationKey: operation,
    style: (STYLE_LABELS[styleKey] || styleKey || '').replace(/\s*Pleat$/i, ''),
    styleKey,
    styleFamily,
    layers,
    notes: item.notes || '',
  }
}

/** Build the full DRAPERY_LOAD payload from an order + its drapery/sheer lines. */
export function buildDraperyFormPayload(
  order: { order_number?: string; customer_name?: string; created_at?: string; poNumber?: string },
  entries: DraperyFormEntry[],
): DraperyFormPayload {
  const date = order.created_at ? String(order.created_at).slice(0, 10) : ''
  return {
    meta: {
      company: COMPANY,
      address: ADDRESS,
      phone: PHONE,
      website: WEBSITE,
      po: order.poNumber || order.order_number || '',
      sidemark: order.customer_name || '',
      date,
      complete: '',
      ops: DR_OPS,
      styles: DR_STYLES,
    },
    rows: entries.map((e, i) => draperyRowFromEntry(e, i)),
  }
}
