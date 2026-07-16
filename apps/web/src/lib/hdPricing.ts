// Hunter Douglas reference-price estimates for the store AI assistant.
//
// Backed by the EXISTING AAPP `chatgptAction` Cloud Function's
// `hd_price_lookup` action (functions/hd-pricing.js — 26 series / 173 charts
// extracted + replay-tested from the HD US Price Guide JAN 2026, incl.
// PowerView/motorization surcharges and accessories). No AAPP change needed.
//
// Policy (Eddie 2026-07-16, confirmed OK with HD rep): the website AI may give
// a REFERENCE RANGE only — never an exact figure, never wholesale/net — and
// every estimate must end with "final price via free in-home measure" plus a
// consultation push. We therefore blur the engine's exact list price into a
// $50-granular range here, server-side, so the exact number never even
// reaches the model.

const ACTION_URL = () =>
  process.env.AAPP_CHATGPT_ACTION_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/chatgptAction'

export interface HdLookupParams {
  series?: string
  subProduct?: string
  fabricCode?: string
  widthIn?: number
  heightIn?: number
  operatingSystem?: string
  mountType?: string
  designOptions?: string[]
  accessories?: string[]
}

export interface HdEstimate {
  ok: boolean
  seriesList?: Array<{ series: string; label: string; subProducts?: string[] }>
  series?: string
  label?: string
  rangeLow?: number
  rangeHigh?: number
  /** True when no fabric was given and the range spans this series' fabric tiers. */
  fabricDependent?: boolean
  /** Engine needs the customer to pick something first (e.g. sub_product). */
  needsChoice?: { field: string; options: string[] }
  warnings?: string[]
  needsHuman?: boolean
  error?: string
}

const round50 = (v: number, up: boolean) => (up ? Math.ceil(v / 50) * 50 : Math.floor(v / 50) * 50)

/** Blur an exact list price into the customer-facing reference range. */
export function toReferenceRange(total: number): { low: number; high: number } {
  const low = Math.max(50, round50(total * 0.95, false))
  const high = Math.max(low + 50, round50(total * 1.1, true))
  return { low, high }
}

async function callAction(token: string, body: Record<string, unknown>): Promise<{ status: number; data: any } | null> {
  try {
    const res = await fetch(ACTION_URL(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'hd_price_lookup', ...body }),
      signal: AbortSignal.timeout(12_000),
    })
    return { status: res.status, data: await res.json().catch(() => null) }
  } catch {
    return null
  }
}

/** Sample up to `max` chart ids evenly across the list (keeps min & max tiers in play). */
function sampleCharts(charts: string[], max: number): string[] {
  if (charts.length <= max) return charts
  const out: string[] = []
  for (let i = 0; i < max; i++) out.push(charts[Math.round((i * (charts.length - 1)) / (max - 1))])
  return [...new Set(out)]
}

/**
 * Call hd_price_lookup and convert to a range. Without `series`, returns the
 * available series list (for the AI to guide the customer). Without a fabric
 * code, sweeps the series' price charts and returns a cross-fabric range —
 * customers rarely know their fabric yet. Never throws — returns
 * { ok:false, error } so the chat degrades to "let a person quote it".
 */
export async function hdEstimate(params: HdLookupParams): Promise<HdEstimate> {
  const token = process.env.AAPP_CHATGPT_ACTION_TOKEN
  if (!token) return { ok: false, error: 'hd_estimate_not_configured' }

  const baseBody = {
    series: params.series,
    subProduct: params.subProduct,
    fabricCode: params.fabricCode,
    widthIn: params.widthIn,
    heightIn: params.heightIn,
    operatingSystem: params.operatingSystem,
    mountType: params.mountType,
    designOptions: params.designOptions || [],
    accessories: params.accessories || [],
  }
  const first = await callAction(token, baseBody)
  if (!first) return { ok: false, error: 'hd_lookup_unreachable' }
  if (!first.data) return { ok: false, error: `hd_lookup_http_${first.status}` }
  const data = first.data

  // No series passed → series list mode.
  if (!params.series) {
    return { ok: true, seriesList: Array.isArray(data.series) ? data.series : [] }
  }

  if (data.ok === false) {
    const need = String(data.need || '')
    // Sub-product must be picked by the customer (e.g. vignette rolling/stacking).
    if (need.startsWith('subProduct')) {
      return { ok: true, series: params.series, needsChoice: { field: 'sub_product', options: (data.options || []).map(String) } }
    }
    if (need.startsWith('series')) {
      return { ok: true, seriesList: (data.options || []).map((s: string) => ({ series: String(s), label: String(s) })) }
    }
    if (need.includes('widthIn')) return { ok: false, error: 'missing_dimensions' }
    // No fabric given → sweep the series' charts for a cross-fabric range.
    if (need.includes('fabricCode')) {
      const charts: string[] = Array.isArray(data.charts) ? data.charts.map(String) : []
      const prices: number[] = []
      const sweepWarnings: string[] = []
      for (const chartId of sampleCharts(charts, 6)) {
        const r = await callAction(token, { ...baseBody, chartId })
        const p = Number(r?.data?.listPrice ?? r?.data?.total)
        if (r?.data?.ok !== false && Number.isFinite(p) && p > 0) {
          prices.push(p)
          if (r?.data?.motorizedPriceIncomplete) {
            sweepWarnings.push('Motorization for this series is priced separately — the range does NOT include the motor.')
          }
        }
      }
      if (prices.length === 0) {
        return { ok: true, series: params.series, needsHuman: true, warnings: ['no chart could be priced automatically'] }
      }
      const low = Math.max(50, round50(Math.min(...prices) * 0.95, false))
      const high = Math.max(low + 50, round50(Math.max(...prices) * 1.1, true))
      return {
        ok: true,
        series: params.series,
        rangeLow: low,
        rangeHigh: high,
        fabricDependent: true,
        warnings: [...new Set(sweepWarnings)],
        needsHuman: false,
      }
    }
    return { ok: false, error: String(data.error || need || 'hd_lookup_failed') }
  }

  const warnings: string[] = Array.isArray(data.warnings) ? data.warnings.map(String) : []
  if (data.motorizedPriceIncomplete) {
    warnings.push('Motorization for this series is priced separately — the range does NOT include the motor; a person must quote it.')
  }
  const total = Number(data.total ?? data.listPrice ?? data.price)
  if (!Number.isFinite(total) || total <= 0) {
    // Engine flagged see-separate-table / formula / missing grid → human quote.
    return { ok: true, series: params.series, needsHuman: true, warnings }
  }

  const { low, high } = toReferenceRange(total)
  return {
    ok: true,
    series: String(data.series || params.series),
    label: data.label ? String(data.label) : undefined,
    rangeLow: low,
    rangeHigh: high,
    warnings,
    needsHuman: false,
  }
}
