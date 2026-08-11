/**
 * The drapery fabric library — 10,845 colourways from Carole, Alendel and
 * Kaslen, priced against the AAPP catalogue wherever AAPP has a price.
 *
 * SERVER ONLY. The generated file is ~6 MB; it must never reach the browser.
 * The browser gets `buildIndex()`'s compact form over /api/fabrics instead
 * (about a twentieth of the size, and gzipped again by the CDN).
 *
 * Regenerate with `node apps/web/scripts/build-fabric-catalog.mjs`. Nothing in
 * here is hand-maintained.
 */
import raw from '@/data/fabrics.generated.json'
import featured from '@/data/fabric-featured.json'
import { CDN_BASE } from '@/lib/cdn'

export type PriceStatus = 'ready' | 'ask_in_store'
export type PriceBand = '$' | '$$' | '$$$' | '$$$$'

export interface Fabric {
  id: string
  brand: string
  sku: string
  name: string
  color: string
  book: string
  origin: string
  /** Fibre content exactly as the mill states it. */
  material: string
  /** Coarse bucket for the filter (Linen / Cotton / Polyester / Velvet / …). */
  materialClass: string
  /** What we show. */
  colorFamily: string | null
  /** What the filter matches — the shown family plus any the colour name or
   *  the swatch's average colour suggest. */
  colorFamilies: string[]
  patternType: string
  /** Left null on purpose when no rule fired — a blank style filters out
   *  cleanly, a guessed one misleads. */
  style: string | null
  sheer: boolean
  widthIn: number | null
  repeatVIn: number | null
  repeatHIn: number | null
  /** R2 object key stem, e.g. `Carole/0016211001_Aerial_Delft`. */
  img: string | null
  swatchRgb: string | null
  pricePerYard: number | null
  priceStatus: PriceStatus
  priceBand: PriceBand | null
  /** A/B = priced, C = in AAPP with no price yet, D = not in AAPP yet. */
  priceTier: 'A' | 'B' | 'C' | 'D'
  aappColorId: string | null
}

interface Catalog {
  generatedAt: string
  aappSnapshot: string | null
  priceBandCuts: number[]
  count: number
  fabrics: Fabric[]
}

const catalog = raw as unknown as Catalog

/** Eddie's toggle: show a per-yard figure on each fabric, or not. Off by
 *  default — estimates still work either way, the yardage price just isn't
 *  broken out. */
export const SHOW_FABRIC_PRICES = process.env.NEXT_PUBLIC_SHOW_FABRIC_PRICES === 'true'

export const CATALOG_GENERATED_AT = catalog.generatedAt
export const FABRIC_COUNT = catalog.count

export function allFabrics(): Fabric[] {
  return catalog.fabrics
}

let byId: Map<string, Fabric> | null = null
export function getFabric(id: string): Fabric | null {
  if (!byId) byId = new Map(catalog.fabrics.map((f) => [f.id, f]))
  return byId.get(id) || null
}

// A function declaration, not a const arrow: everything else exported from
// this module is hoisted, and one un-hoisted binding in a module this heavily
// bundled is a temporal-dead-zone waiting to happen.
function resolve(ids: string[]): Fabric[] {
  return ids.map(getFabric).filter((f): f is Fabric => !!f)
}

/** Drapery fabrics /design offers before a visitor has favourited anything. */
export function featuredFabrics(): Fabric[] {
  return resolve(featured.ids as string[])
}

/** Sheers for the second layer, same idea. Kept apart from the drapery list
 *  because the two slots are never interchangeable. */
export function featuredSheers(): Fabric[] {
  return resolve(((featured as { sheerIds?: string[] }).sheerIds) || [])
}

// ── image URLs ──────────────────────────────────────────────────────────────

/** Two sizes only: `thumb` (~400px, grid) and `large` (~1600px, detail).
 *  The `fabric-swatches/` prefix deliberately differs from the /fabrics route:
 *  with NEXT_PUBLIC_CDN_URL unset these URLs are same-origin, and `/fabrics/...`
 *  would collide with the page. */
export function fabricImageUrl(img: string | null, size: 'thumb' | 'large'): string | null {
  if (!img) return null
  return `${CDN_BASE}/fabric-swatches/${size}/${img}.webp`
}

// ── the compact index the browser filters on ────────────────────────────────
/**
 * Dictionary-encoded so ten thousand rows stay small: every repeated string
 * (brand, pattern, material, style, colour family, price band) becomes an
 * index into a lookup table, and the row itself is a plain array.
 *
 * Row layout — keep in sync with FABRIC_INDEX_FIELDS below and with the
 * decoder in FabricLibraryClient.tsx.
 */
export const FABRIC_INDEX_FIELDS = [
  'id', 'name', 'color', 'brand', 'img', 'colorFamilies',
  'pattern', 'material', 'style', 'flags', 'band', 'price', 'swatch',
] as const

export const FABRIC_FLAG_SHEER = 1
export const FABRIC_FLAG_PRICED = 2

export interface FabricIndex {
  generatedAt: string
  count: number
  showPrices: boolean
  dict: {
    brand: string[]
    color: string[]
    pattern: string[]
    material: string[]
    style: string[]
    band: string[]
  }
  rows: unknown[][]
}

export function buildIndex(): FabricIndex {
  const dicts = {
    brand: new Map<string, number>(),
    color: new Map<string, number>(),
    pattern: new Map<string, number>(),
    material: new Map<string, number>(),
    style: new Map<string, number>(),
    band: new Map<string, number>(),
  }
  const intern = (d: Map<string, number>, v: string | null): number => {
    if (v == null || v === '') return -1
    let i = d.get(v)
    if (i === undefined) { i = d.size; d.set(v, i) }
    return i
  }

  const rows = catalog.fabrics.map((f) => [
    f.id,
    f.name,
    f.color,
    intern(dicts.brand, f.brand),
    f.img,
    f.colorFamilies.map((c) => intern(dicts.color, c)),
    intern(dicts.pattern, f.patternType),
    intern(dicts.material, f.materialClass),
    intern(dicts.style, f.style),
    (f.sheer ? FABRIC_FLAG_SHEER : 0) | (f.priceStatus === 'ready' ? FABRIC_FLAG_PRICED : 0),
    intern(dicts.band, f.priceBand),
    // The per-yard figure only leaves the server when the toggle is on. The
    // price BAND always ships: the $/$$/$$$ filter has to work either way.
    SHOW_FABRIC_PRICES && f.pricePerYard != null ? f.pricePerYard : 0,
    f.swatchRgb,
  ])

  const keys = (d: Map<string, number>) => Array.from(d.keys())
  return {
    generatedAt: catalog.generatedAt,
    count: rows.length,
    showPrices: SHOW_FABRIC_PRICES,
    dict: {
      brand: keys(dicts.brand),
      color: keys(dicts.color),
      pattern: keys(dicts.pattern),
      material: keys(dicts.material),
      style: keys(dicts.style),
      band: keys(dicts.band),
    },
    rows,
  }
}

/** Everything the detail drawer and /fabrics/[id] show. */
export interface FabricDetail extends Omit<Fabric, 'pricePerYard' | 'aappColorId' | 'priceTier'> {
  pricePerYard: number | null
  thumbUrl: string | null
  largeUrl: string | null
}

export function fabricDetail(f: Fabric): FabricDetail {
  const { pricePerYard, aappColorId: _a, priceTier: _t, ...rest } = f
  void _a; void _t
  return {
    ...rest,
    pricePerYard: SHOW_FABRIC_PRICES ? pricePerYard : null,
    thumbUrl: fabricImageUrl(f.img, 'thumb'),
    largeUrl: fabricImageUrl(f.img, 'large'),
  }
}
