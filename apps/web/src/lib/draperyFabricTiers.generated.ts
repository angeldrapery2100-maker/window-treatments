// GENERATED from AAPP data/handcrafted_drapery_fabric_catalog.grouped.json
// (2026-04-10T20:56:41.857777+00:00) — the same 4-brand drapery fabric book the AAPP quote builder prices
// from: Kaslen, Alendel, Carole, RSC.
//
// WHY TIERS: AAPP prices handcrafted drapery and roman shades from a fabric's
// $/yard, and a website visitor never knows that number. So when a customer
// can't name a fabric we price the SAME window at the catalog's 25th and 75th
// percentile and quote the span — real numbers off Eddie's real book, never
// an invented "roughly".
//
// Regenerate when the fabric book changes:
//   python3 - <<'EOF'  (see git history of this file for the extraction script)
//   …reads default_price_per_yard per fabric, falls back to the median of its
//   colorways, drops unpriced rows, emits the percentiles below.
//   EOF
//
// Source rows: 2242 fabrics carried a usable price (of 2579 in the book;
// 757 colorway rows had no price and were skipped).

export interface DraperyFabricTier {
  key: 'entry' | 'mid' | 'high'
  /** Customer-facing label — never show the percentile itself. */
  labelEn: string
  labelZh: string
  pricePerYard: number
}

export const DRAPERY_FABRIC_TIERS: DraperyFabricTier[] = [
  { key: 'entry', labelEn: 'entry-level fabrics', labelZh: '入门面料', pricePerYard: 41.69 },
  { key: 'mid',   labelEn: 'mid-range fabrics',   labelZh: '中档面料', pricePerYard: 65.40 },
  { key: 'high',  labelEn: 'designer fabrics',    labelZh: '高档面料', pricePerYard: 83.49 },
]

/** The pair we price when the customer has no fabric in mind (p25 / p75). */
export const DRAPERY_TIER_SPAN = { low: 41.69, high: 83.49 }

/** Median bolt width in the book — the engine's widthNormalizedIn default. */
export const DRAPERY_FABRIC_WIDTH_IN = 55.0

/** Absolute ends of the book, for sanity-checking a caller-supplied price. */
export const DRAPERY_PRICE_BOUNDS = { min: 12.60, max: 211.40 }

