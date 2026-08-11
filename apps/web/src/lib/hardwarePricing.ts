// Drapery hardware (rods / poles / tracks / H-rails) reference prices, via
// AAPP's `catalog_price_estimate` (variant `drapery_hardware`).
//
// WHY THIS ONE NEEDED A STATIC TAXONOMY
// AAPP rejects an underspecified call with a bare `{error:'missing_profile'}` —
// no list of what it would accept — and `libraryExport` doesn't ship
// `draperyHardwareCatalog`, so the website has no runtime way to discover the
// profiles. `draperyHardwareCatalog.generated.ts` carries the taxonomy (and
// nothing else — no prices; those always come from AAPP at request time).
//
// WHAT WE ASK vs WHAT WE FILL
// A `profileKey` like `metal_rod_double_1_3_8_1_1_8_wall` is an internal SKU;
// reading that list to a customer would be absurd. So we ask the two or three
// things a person actually knows — pole or track, manual or motorised, single
// or double (a sheer layer) — then price EVERY profile that matches and quote
// the span. Wall vs ceiling mount is spanned rather than asked: it moves the
// price far less than the layer count, and the customer often hasn't decided.
//
// Colour is filled silently: AAPP demands a colorKey but never prices on it.

import { callAappAction, aappConfigured } from '@/lib/aappAction'
import { HARDWARE_PROFILES, type HardwareProfileRow } from '@/lib/draperyHardwareCatalog.generated'

/** Bound the fan-out. The widest real filter (track / manual / single) hits 5
 *  profiles today; 8 leaves room without letting a catalog edit turn one chat
 *  turn into a stampede. Clipping is reported, never silent. */
const MAX_PROFILES_PRICED = 8

export interface HardwareEstimateParams {
  /** Rod/track length in inches — usually the finished drapery width. */
  lengthIn: number
  kind?: string
  /** true = motorised. Poles are never motorised, so it's skipped for those. */
  motorized?: boolean
  /** 'single' | 'double' — double carries a drape + sheer. */
  layer?: string
  /** Optional narrowing; spanned when absent. */
  mount?: string
}

export interface HardwareEstimate {
  ok: boolean
  price?: number
  rangeLow?: number
  rangeHigh?: number
  profilesPriced?: number
  profilesMatched?: number
  clipped?: boolean
  /** Profiles AAPP refused to price (no price set in the library yet). */
  unpriced?: string[]
  ask?: { field: string; options: string[]; askEn: string; askZh: string }
  assumed?: Record<string, string>
  error?: string
}

export function matchProfiles(params: HardwareEstimateParams): HardwareProfileRow[] {
  return HARDWARE_PROFILES.filter((p) => {
    if (params.kind && p.kind !== params.kind) return false
    if (params.layer && p.layer !== params.layer) return false
    if (params.mount && p.mount !== params.mount) return false
    if (params.motorized != null && p.motorized !== params.motorized) return false
    return true
  })
}

async function priceProfile(lengthIn: number, p: HardwareProfileRow) {
  return callAappAction({
    action: 'catalog_price_estimate',
    productVariant: 'drapery_hardware',
    widthIn: lengthIn,
    productConfig: {
      lengthIn,
      hardware: {
        profileKey: p.key,
        familyKey: p.family,
        // Required by the engine's guard, ignored by its maths.
        ...(p.color ? { colorKey: p.color } : {}),
      },
    },
  })
}

export async function hardwareEstimate(params: HardwareEstimateParams): Promise<HardwareEstimate> {
  if (!(params.lengthIn > 0)) return { ok: false, error: 'missing_length' }

  const kind = String(params.kind || '')
  if (kind !== 'pole' && kind !== 'track') {
    return {
      ok: false,
      ask: {
        field: 'kind',
        options: ['pole', 'track'],
        askEn: 'Are you after a decorative rod you can see, or a low-profile track that tucks away?',
        askZh: '想要看得见的装饰杆,还是走隐蔽的轨道?',
      },
    }
  }

  // Poles are never motorised in this catalog — don't waste a question.
  const isPole = kind === 'pole'
  const motorized = isPole ? false : params.motorized
  if (!isPole && motorized == null) {
    return {
      ok: false,
      ask: {
        field: 'motorized',
        options: ['manual', 'motorized'],
        askEn: 'Manual, or motorised so it opens with a remote or an app?',
        askZh: '手动拉,还是电动的(遥控/手机开合)?',
      },
    }
  }

  const layer = String(params.layer || '')
  if (layer !== 'single' && layer !== 'double') {
    return {
      ok: false,
      ask: {
        field: 'layer',
        options: ['single', 'double'],
        askEn: 'One layer, or a double so you can hang a sheer behind the drapery?',
        askZh: '单层就够,还是要双层(布帘后面再挂一层纱)?',
      },
    }
  }

  if (!aappConfigured()) return { ok: false, error: 'not_configured' }

  const matched = matchProfiles({ ...params, kind, layer, motorized: motorized ?? undefined })
  if (matched.length === 0) return { ok: false, error: 'no_matching_profile' }

  const assumed: Record<string, string> = {}
  if (!params.mount) assumed.mount = 'spans wall and ceiling mounting'
  if (isPole && params.motorized) assumed.motorized = 'rods are manual — quoted as a manual rod'

  const priced = matched.slice(0, MAX_PROFILES_PRICED)
  const results = await Promise.all(priced.map((p) => priceProfile(params.lengthIn, p)))

  const values: number[] = []
  const unpriced: string[] = []
  for (let i = 0; i < results.length; i++) {
    const json: any = results[i]?.data
    if (json?.ok === true) {
      const v = Number(json.listPrice)
      if (Number.isFinite(v) && v > 0) { values.push(v); continue }
    }
    // `missing_price` = the library has no price for that profile yet. Worth
    // naming in the result so it can be fixed, but it is not a failure.
    unpriced.push(priced[i].key)
  }

  if (values.length === 0) {
    return {
      ok: false,
      error: 'no_price',
      profilesMatched: matched.length,
      unpriced: unpriced.slice(0, 8),
    }
  }

  const low = Math.floor(Math.min(...values))
  const high = Math.ceil(Math.max(...values))
  return {
    ok: true,
    ...(low === high ? { price: low } : { rangeLow: low, rangeHigh: high }),
    profilesPriced: values.length,
    profilesMatched: matched.length,
    clipped: matched.length > MAX_PROFILES_PRICED,
    ...(unpriced.length ? { unpriced: unpriced.slice(0, 8) } : {}),
    assumed: Object.keys(assumed).length ? assumed : undefined,
  }
}
