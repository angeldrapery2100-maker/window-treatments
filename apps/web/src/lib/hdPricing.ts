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

/**
 * Call hd_price_lookup and convert to a range. Without `series`, returns the
 * available series list (for the AI to guide the customer). Never throws —
 * returns { ok:false, error } so the chat degrades to "let a person quote it".
 */
export async function hdEstimate(params: HdLookupParams): Promise<HdEstimate> {
  const token = process.env.AAPP_CHATGPT_ACTION_TOKEN
  if (!token) return { ok: false, error: 'hd_estimate_not_configured' }

  let res: Response
  try {
    res = await fetch(ACTION_URL(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: 'hd_price_lookup',
        series: params.series,
        subProduct: params.subProduct,
        fabricCode: params.fabricCode,
        widthIn: params.widthIn,
        heightIn: params.heightIn,
        operatingSystem: params.operatingSystem,
        mountType: params.mountType,
        designOptions: params.designOptions || [],
        accessories: params.accessories || [],
      }),
      signal: AbortSignal.timeout(12_000),
    })
  } catch {
    return { ok: false, error: 'hd_lookup_unreachable' }
  }

  const data: any = await res.json().catch(() => null)
  if (!res.ok || !data) return { ok: false, error: `hd_lookup_http_${res.status}` }

  // No series passed → series list mode.
  if (!params.series) {
    return { ok: true, seriesList: Array.isArray(data.series) ? data.series : [] }
  }
  if (data.ok === false) {
    return { ok: false, error: String(data.error || 'hd_lookup_failed') }
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
