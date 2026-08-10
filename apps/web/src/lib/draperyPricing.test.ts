import { describe, it, expect } from 'vitest'
import {
  draperyEstimate,
  romanEstimate,
  draperyStyleFamily,
  DRAPERY_STYLE_KEYS,
  ROMAN_STYLE_KEYS,
  LINING_TYPES,
} from './draperyPricing'
import {
  DRAPERY_FABRIC_TIERS,
  DRAPERY_TIER_SPAN,
  DRAPERY_PRICE_BOUNDS,
} from './draperyFabricTiers.generated'

// The ask-then-range contract is the whole point of this module, and all of it
// runs before any network call — so it is fully testable without AAPP.
// (With no AAPP token these calls can never reach `ok: true`; every assertion
// here is about which question comes back, and in what order.)

const SIZE = { finishedWidthIn: 100, finishedHeightIn: 96 }

describe('drapery asks one question at a time, in designer order', () => {
  it('asks for the heading style first', async () => {
    const r = await draperyEstimate({ ...SIZE })
    expect(r.ok).toBe(false)
    expect(r.ask?.field).toBe('style_key')
    expect(r.ask?.askZh).toBeTruthy()
    expect(r.ask?.askEn).toBeTruthy()
  })

  it('asks for lining only after the style is known', async () => {
    const r = await draperyEstimate({ ...SIZE, styleKey: '3fold_pinch' })
    expect(r.ask?.field).toBe('lining')
    expect(r.ask?.options).toEqual(LINING_TYPES)
  })

  it('asks about fabric last, and offers "not sure" as an answer', async () => {
    const r = await draperyEstimate({ ...SIZE, styleKey: '3fold_pinch', lining: 'BO' })
    expect(r.ask?.field).toBe('fabric_tier')
    expect(r.ask?.options).toContain('unknown')
    expect(r.ask?.options).toContain('mid')
  })

  it('stops asking once every price-moving choice is answered', async () => {
    const r = await draperyEstimate({ ...SIZE, styleKey: '3fold_pinch', lining: 'BO', fabricTier: 'mid' })
    expect(r.ask).toBeUndefined()
  })

  it('rejects an unknown style rather than silently defaulting one', async () => {
    const r = await draperyEstimate({ ...SIZE, styleKey: 'box_pleat_deluxe' })
    expect(r.ask?.field).toBe('style_key')
  })

  it('needs the FINISHED size before anything else', async () => {
    const r = await draperyEstimate({ finishedWidthIn: 0, finishedHeightIn: 96 })
    expect(r.error).toBe('missing_finished_size')
    expect(r.ask).toBeUndefined()
  })
})

describe('roman follows the same contract', () => {
  it('asks style, then lining, then fabric', async () => {
    expect((await romanEstimate({ widthIn: 36, heightIn: 58 })).ask?.field).toBe('style_key')
    expect((await romanEstimate({ widthIn: 36, heightIn: 58, styleKey: 'flat' })).ask?.field).toBe('lining')
    expect(
      (await romanEstimate({ widthIn: 36, heightIn: 58, styleKey: 'flat', lining: 'LF' })).ask?.field
    ).toBe('fabric_tier')
  })

  it('guards a missing size', async () => {
    expect((await romanEstimate({ widthIn: 36, heightIn: 0 })).error).toBe('missing_size')
  })
})

describe('style vocabulary matches AAPP', () => {
  it('maps every known key to a family', () => {
    for (const k of DRAPERY_STYLE_KEYS) expect(draperyStyleFamily(k)).not.toBeNull()
    expect(draperyStyleFamily('2fold_pinch')).toBe('pleated')
    expect(draperyStyleFamily('us_100')).toBe('ripple')
    expect(draperyStyleFamily('nope')).toBeNull()
  })

  it('offers the roman styles the AAPP catalog defines', () => {
    expect(ROMAN_STYLE_KEYS).toContain('hobbled')
    expect(ROMAN_STYLE_KEYS).toContain('flat')
  })
})

describe('fabric tiers stay inside the real catalog', () => {
  it('has entry < mid < high', () => {
    const [entry, mid, high] = DRAPERY_FABRIC_TIERS
    expect(entry.pricePerYard).toBeLessThan(mid.pricePerYard)
    expect(mid.pricePerYard).toBeLessThan(high.pricePerYard)
  })

  it('spans from entry to designer when the customer is unsure', () => {
    expect(DRAPERY_TIER_SPAN.low).toBe(DRAPERY_FABRIC_TIERS[0].pricePerYard)
    expect(DRAPERY_TIER_SPAN.high).toBe(DRAPERY_FABRIC_TIERS[2].pricePerYard)
  })

  it('keeps every tier inside the book it was generated from', () => {
    for (const t of DRAPERY_FABRIC_TIERS) {
      expect(t.pricePerYard).toBeGreaterThanOrEqual(DRAPERY_PRICE_BOUNDS.min)
      expect(t.pricePerYard).toBeLessThanOrEqual(DRAPERY_PRICE_BOUNDS.max)
    }
  })

  it('ignores a caller-supplied $/yard that falls outside the book', async () => {
    // A hallucinated 5000/yd must not become a quote — it falls back to asking.
    const r = await draperyEstimate({ ...SIZE, styleKey: 'us_100', lining: 'NO', fabricPricePerYard: 5000 })
    expect(r.ask?.field).toBe('fabric_tier')
  })
})
