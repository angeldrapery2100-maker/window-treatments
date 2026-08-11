import { describe, it, expect } from 'vitest'
import {
  FABRIC_FLAG_PRICED, FABRIC_FLAG_SHEER, FABRIC_INDEX_FIELDS,
  allFabrics, buildIndex, featuredFabrics, fabricDetail, fabricImageUrl, getFabric,
} from './draperyFabricLibrary'

const index = buildIndex()
const fabrics = allFabrics()

describe('generated fabric catalogue', () => {
  it('has fabrics and unique ids', () => {
    expect(fabrics.length).toBeGreaterThan(1000)
    expect(new Set(fabrics.map((f) => f.id)).size).toBe(fabrics.length)
  })

  it('never carries a price without saying it is ready, or the reverse', () => {
    // The whole point of priceStatus is that /design can trust it — a row that
    // says `ready` with no number would produce an estimate built on nothing.
    for (const f of fabrics) {
      if (f.priceStatus === 'ready') expect(f.pricePerYard).toBeGreaterThan(0)
      else expect(f.pricePerYard).toBeNull()
    }
  })

  it('bands every priced fabric and no unpriced one', () => {
    for (const f of fabrics) {
      if (f.priceStatus === 'ready') expect(['$', '$$', '$$$', '$$$$']).toContain(f.priceBand)
      else expect(f.priceBand).toBeNull()
    }
  })

  it('always lists the shown colour family first among the searchable ones', () => {
    for (const f of fabrics) {
      if (!f.colorFamily) continue
      expect(f.colorFamilies[0]).toBe(f.colorFamily)
    }
  })
})

describe('compact index', () => {
  it('describes the row layout it actually emits', () => {
    expect(index.rows[0]).toHaveLength(FABRIC_INDEX_FIELDS.length)
    expect(index.count).toBe(fabrics.length)
  })

  it('round-trips a fabric through the dictionaries', () => {
    const source = fabrics[0]
    const row = index.rows[0]
    expect(row[0]).toBe(source.id)
    expect(index.dict.brand[row[3] as number]).toBe(source.brand)
    expect(index.dict.pattern[row[6] as number]).toBe(source.patternType)
    expect((row[5] as number[]).map((i) => index.dict.color[i])).toEqual(source.colorFamilies)
  })

  it('sets the flags the grid filters on', () => {
    for (let i = 0; i < 400; i++) {
      const f = fabrics[i], flags = index.rows[i][9] as number
      expect(!!(flags & FABRIC_FLAG_SHEER)).toBe(f.sheer)
      expect(!!(flags & FABRIC_FLAG_PRICED)).toBe(f.priceStatus === 'ready')
    }
  })

  it('keeps the per-yard figure off the wire while the toggle is off', () => {
    // NEXT_PUBLIC_SHOW_FABRIC_PRICES defaults to off; bands must still ship or
    // the $/$$/$$$ filter would have nothing to work with.
    if (!index.showPrices) {
      expect(index.rows.every((r) => r[11] === 0)).toBe(true)
      expect(index.dict.band.length).toBeGreaterThan(0)
      expect(fabricDetail(fabrics.find((f) => f.priceStatus === 'ready')!).pricePerYard).toBeNull()
    }
  })
})

describe('lookups', () => {
  it('finds a fabric by id and misses cleanly', () => {
    expect(getFabric(fabrics[10].id)?.id).toBe(fabrics[10].id)
    expect(getFabric('nope::nope::nope')).toBeNull()
  })

  it('resolves every featured id, and only to quotable fabrics with a photo', () => {
    // /design opens on these; a broken id there is a blank first impression.
    const seeds = featuredFabrics()
    expect(seeds.length).toBeGreaterThan(0)
    for (const f of seeds) {
      expect(f.img).toBeTruthy()
      expect(f.priceStatus).toBe('ready')
    }
  })

  it('builds both image sizes, and nothing at all without a key', () => {
    expect(fabricImageUrl('Carole/x', 'thumb')).toContain('/fabric-swatches/thumb/Carole/x.webp')
    expect(fabricImageUrl('Carole/x', 'large')).toContain('/fabric-swatches/large/Carole/x.webp')
    expect(fabricImageUrl(null, 'thumb')).toBeNull()
  })
})
