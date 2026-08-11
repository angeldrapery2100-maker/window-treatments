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
  /** Optional narrowing to one catalogue family (`wood_pole`, `h_rail`,
   *  `aluminum_track`, …). The chat flow leaves this off and spans every
   *  family that matches "pole" or "track"; /design sets it, because there the
   *  customer has already picked wood pole vs track vs H-rail by name.
   *  Ceiling variants are separate families, so a prefix match is used. */
  family?: string
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

/** A catalogue family and its ceiling twin are the same product to a customer:
 *  `h_rail` covers `ceiling_h_rail`, `aluminum_track` covers
 *  `aluminum_ceiling_track`. (Motorised variants are excluded by the
 *  `motorized` filter, not by this one.) */
function familyMatches(profileFamily: string, wanted: string): boolean {
  return profileFamily.replace('_ceiling', '').replace('ceiling_', '') === wanted.replace('_ceiling', '').replace('ceiling_', '')
}

export function matchProfiles(params: HardwareEstimateParams): HardwareProfileRow[] {
  return HARDWARE_PROFILES.filter((p) => {
    if (params.kind && p.kind !== params.kind) return false
    if (params.layer && p.layer !== params.layer) return false
    if (params.mount && p.mount !== params.mount) return false
    if (params.motorized != null && p.motorized !== params.motorized) return false
    if (params.family && !familyMatches(p.family, params.family)) return false
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
        // Required by the engine's guard, ignored by its maths — so the
        // first colour in the palette is a gate-filler, not a choice.
        ...(p.colors[0] ? { colorKey: p.colors[0].key } : {}),
      },
    },
  })
}

/**
 * Price ONE named profile, with the customer's colour and finial.
 *
 * The spanning `hardwareEstimate` below exists for the chat, where nobody has
 * named a rod. On /design they have: they picked the diameter, the finish and
 * the end, so we ask AAPP about exactly that and get back exactly what the
 * sales app would quote — finials included, which is the single biggest reason
 * the two numbers used to disagree.
 *
 * AAPP charges each end separately and its own client sets both ends to the
 * same finial (`hw.rightFinialKey = hw.leftFinialKey`), so we do too.
 */
export async function hardwareProfileEstimate(params: {
  lengthIn: number
  profileKey: string
  colorKey?: string | null
  finialKey?: string | null
}): Promise<HardwareEstimate> {
  if (!(params.lengthIn > 0)) return { ok: false, error: 'missing_length' }
  const profile = HARDWARE_PROFILES.find((p) => p.key === params.profileKey)
  if (!profile) return { ok: false, error: 'missing_profile' }
  if (!aappConfigured()) return { ok: false, error: 'not_configured' }

  const res = await callAappAction({
    action: 'catalog_price_estimate',
    productVariant: 'drapery_hardware',
    widthIn: params.lengthIn,
    productConfig: {
      lengthIn: params.lengthIn,
      hardware: {
        profileKey: profile.key,
        familyKey: profile.family,
        ...(params.colorKey ? { colorKey: params.colorKey } : {}),
        ...(params.finialKey ? { leftFinialKey: params.finialKey, rightFinialKey: params.finialKey } : {}),
      },
    },
  })
  const json = res?.data as { ok?: boolean; listPrice?: number; error?: string } | null
  if (!json || json.ok !== true) {
    return { ok: false, error: String(json?.error || (res ? `upstream_${res.status}` : 'network')) }
  }
  const value = Number(json.listPrice)
  if (!Number.isFinite(value) || value <= 0) return { ok: false, error: 'no_price' }
  return { ok: true, price: Math.round(value), profilesPriced: 1, profilesMatched: 1 }
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
