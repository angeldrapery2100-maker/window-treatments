import { describe, it, expect } from 'vitest'
import { EMPTY_FILTERS, filtersFromSearch, searchFromFilters, type Filters } from './FabricLibraryClient'

// 验收 1: "筛选组合 URL 可分享还原" — a filtered grid has to survive being
// copied into a message and opened by someone else.
describe('fabric filter <-> query string', () => {
  const round = (f: Filters) => filtersFromSearch(searchFromFilters(f))

  it('drops to a bare path when nothing is selected', () => {
    expect(searchFromFilters(EMPTY_FILTERS)).toBe('')
    expect(filtersFromSearch('')).toEqual(EMPTY_FILTERS)
  })

  it('round-trips a full set of filters', () => {
    const f: Filters = {
      q: 'linen',
      type: 'sheer',
      fav: true,
      sel: { c: ['Cream', 'Taupe'], p: ['Solid'], m: ['Linen'], s: ['Modern'], b: ['$$', '$$$'] },
    }
    expect(round(f)).toEqual(f)
  })

  it('round-trips one facet at a time', () => {
    for (const param of ['c', 'p', 'm', 's', 'b']) {
      const f: Filters = { ...EMPTY_FILTERS, sel: { [param]: ['X'] } }
      expect(round(f)).toEqual(f)
    }
  })

  it('keeps a colour with a space in its name intact', () => {
    const f: Filters = { ...EMPTY_FILTERS, sel: { c: ['Off White'] } }
    expect(round(f)).toEqual(f)
  })

  it('ignores a junk fabric type rather than filtering to nothing', () => {
    expect(filtersFromSearch('?type=banana').type).toBe('')
  })

  it('treats a missing fav flag as off', () => {
    expect(filtersFromSearch('?fav=0').fav).toBe(false)
    expect(filtersFromSearch('?fav=1').fav).toBe(true)
  })

  it('does not leave empty facet keys behind', () => {
    expect(filtersFromSearch('?c=')).toEqual(EMPTY_FILTERS)
  })
})
