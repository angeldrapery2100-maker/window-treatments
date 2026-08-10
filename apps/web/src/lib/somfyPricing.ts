// SOMFY motorized drapery track reference prices, via AAPP's
// `catalog_price_estimate` (variant `somfy_motorized_track`).
//
// TWO TRAPS, both verified against functions/index.js _priceSomfyMotorizedTrack:
//
// 1. The width goes INSIDE productConfig. Somfy is in AAPP's
//    `_ONE_DIM_VARIANTS`, and the pricer is called as
//    `_priceSomfyMotorizedTrack(cfg, library)` — the top-level widthIn that
//    every other variant uses is never passed to it. Send cfg.widthIn or you
//    get `unconfigured: ['widthIn (> 0)']` forever.
//
// 2. The motor is a real price driver and the customer cannot possibly answer
//    "which motorId". AAPP refuses to price without one (a track-only figure
//    silently under-quotes). So we PROBE for the motor list, then price the
//    window on every motor and quote the span — "depends on the motor,
//    $X–$Y". That is the ask-then-range policy applied to a question the
//    customer can't be asked.
//
// What we DO ask: pinch-pleat vs ripplefold. A customer knows that one, and
// it changes the track chart AAPP looks the price up in.

import { callAappAction, aappConfigured, parseMissing } from '@/lib/aappAction'

export const SOMFY_TRACK_TYPES = ['pinch_pleat', 'ripplefold']
export const SOMFY_OPEN_TYPES = ['split', 'one_way']
export const SOMFY_FULLNESS = ['80', '100', '120']

/** Bound the fan-out: a library with a long motor list shouldn't turn one
 *  chat turn into twenty Cloud Function calls. When we clip, we say so in the
 *  result rather than quietly quoting a partial span.
 *
 *  The live library holds 4 motors (glydea35 / glydea60 / irismo45 / irismo35,
 *  verified 2026-08-10), so nothing clips today — this is a ceiling for the
 *  day someone adds a dozen. */
const MAX_MOTORS_PRICED = 6

// The motor roster comes from `_somfyResolveConfig(library)`, which ignores
// the per-quote config entirely — so it is the same list for every customer
// and every window. Cache it per lambda instance instead of spending a probe
// round-trip on each quote. Short TTL: an admin editing the library shouldn't
// have to wait out a long stale window.
const MOTOR_CACHE_TTL_MS = 300_000
let _motorCache: { at: number; ids: string[] } | null = null

/** Exposed for tests and for an admin "pricing looks stale" escape hatch. */
export function invalidateSomfyMotorCache(): void {
  _motorCache = null
}

export interface SomfyEstimateParams {
  widthIn: number
  /** 'pinch_pleat' | 'ripplefold'. Asked, not assumed. */
  trackType?: string
  /** 'split' (centre-open, assumed) | 'one_way'. */
  openType?: string
  /** Ripplefold fullness — '80' | '100' (assumed) | '120'. */
  fullness?: string
  /** Only when the customer or a salesperson named a specific motor. */
  motorId?: string
  /** A drape + sheer pair on a double track prices the track twice. */
  doubleLayer?: boolean
}

export interface SomfyEstimate {
  ok: boolean
  price?: number
  rangeLow?: number
  rangeHigh?: number
  /** How many motors the span covers, and whether we clipped the list. */
  motorsPriced?: number
  motorsAvailable?: number
  clipped?: boolean
  ask?: { field: string; options: string[]; askEn: string; askZh: string }
  assumed?: Record<string, string>
  error?: string
}

function buildConfig(params: SomfyEstimateParams, motorId?: string) {
  const cfg: Record<string, unknown> = {
    // ⚠ inside productConfig — see trap 1 at the top of this file.
    widthIn: params.widthIn,
    trackType: params.trackType,
    openType: params.openType || 'split',
    fullness: params.fullness || '100',
  }
  if (motorId) cfg.motorId = motorId
  if (params.doubleLayer) cfg.doubleLayer = true
  return cfg
}

async function priceWith(params: SomfyEstimateParams, motorId?: string) {
  return callAappAction({
    action: 'catalog_price_estimate',
    productVariant: 'somfy_motorized_track',
    widthIn: params.widthIn,
    productConfig: buildConfig(params, motorId),
  })
}

/** Ask AAPP for the motor list by deliberately omitting motorId — the
 *  `unconfigured` response carries the ids it will accept. */
async function fetchMotorIds(params: SomfyEstimateParams): Promise<string[] | null> {
  if (_motorCache && Date.now() - _motorCache.at < MOTOR_CACHE_TTL_MS) return _motorCache.ids

  const probe = await priceWith(params)
  const json: any = probe?.data
  if (!json || json.ok === true) return null
  if (!json.unconfigured || !Array.isArray(json.missing)) return null
  for (const raw of json.missing) {
    const { field, options } = parseMissing(String(raw))
    if (field === 'motorId' && options.length) {
      _motorCache = { at: Date.now(), ids: options }
      return options
    }
  }
  return null
}

export async function somfyEstimate(params: SomfyEstimateParams): Promise<SomfyEstimate> {
  if (!(params.widthIn > 0)) return { ok: false, error: 'missing_width' }

  if (!SOMFY_TRACK_TYPES.includes(String(params.trackType || ''))) {
    return {
      ok: false,
      ask: {
        field: 'track_type',
        options: SOMFY_TRACK_TYPES,
        askEn: 'Is this for pinch-pleat drapery or a ripplefold track? The two use different track systems, so the price differs.',
        askZh: '这套是配褶帘(pinch pleat)还是蛇形帘(ripplefold)?两种轨道系统不一样,价格也不同。',
      },
    }
  }

  if (!aappConfigured()) return { ok: false, error: 'not_configured' }

  const assumed: Record<string, string> = {}
  if (!params.openType) assumed.openType = 'centre-open (split) track'
  if (params.trackType === 'ripplefold' && !params.fullness) assumed.fullness = '100% fullness'

  // Customer named a motor → one authoritative figure.
  if (params.motorId) {
    const r = await priceWith(params, params.motorId)
    const json: any = r?.data
    if (!r) return { ok: false, error: 'network' }
    if (!json || json.ok !== true) {
      return { ok: false, error: String(json?.error || (json?.unconfigured ? 'needs_more' : 'estimate_failed')) }
    }
    const v = Number(json.listPrice)
    if (!Number.isFinite(v) || v <= 0) return { ok: false, error: 'no_price' }
    return { ok: true, price: Math.round(v), assumed: Object.keys(assumed).length ? assumed : undefined }
  }

  // No motor named — price the span across what the library actually stocks.
  const motorIds = await fetchMotorIds(params)
  if (!motorIds || motorIds.length === 0) return { ok: false, error: 'no_motors' }

  const priced = motorIds.slice(0, MAX_MOTORS_PRICED)
  const results = await Promise.all(priced.map((id) => priceWith(params, id)))
  const values: number[] = []
  for (const r of results) {
    const json: any = r?.data
    if (json?.ok !== true) continue
    const v = Number(json.listPrice)
    if (Number.isFinite(v) && v > 0) values.push(v)
  }
  if (values.length === 0) return { ok: false, error: 'no_price' }

  assumed.motor = 'span across the motors we stock'
  const low = Math.floor(Math.min(...values))
  const high = Math.ceil(Math.max(...values))
  return {
    ok: true,
    ...(low === high ? { price: low } : { rangeLow: low, rangeHigh: high }),
    motorsPriced: values.length,
    motorsAvailable: motorIds.length,
    clipped: motorIds.length > MAX_MOTORS_PRICED,
    assumed,
  }
}
