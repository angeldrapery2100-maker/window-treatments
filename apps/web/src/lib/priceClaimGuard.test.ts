import { describe, it, expect } from 'vitest'
import { extractMoney, findUnsourcedPrices } from './priceClaimGuard'

// The regression this file exists for, verbatim from the live test on
// 2026-08-10: asked for a 120" single-layer decorative rod, the assistant
// answered "$180–$420". The tool had returned $110–$390. Re-asked, it got it
// right. One in five turns invented a price that looked entirely plausible.
const REAL_TOOL_RESULT = JSON.stringify({
  product: 'Drapery hardware',
  reference_range: '$110 – $390',
  range_low: 110,
  range_high: 390,
  profilesPriced: 4,
})
const FABRICATED_REPLY =
  'For a decorative rod at 120" wide, single layer, it\'s about $180–$420 as a reference.'
const HONEST_REPLY =
  'To confirm: a 120" single-layer decorative rod is about $110–$390 as a reference price.'

describe('the live regression', () => {
  it('flags the invented $180–$420', () => {
    const bad = findUnsourcedPrices(FABRICATED_REPLY, [REAL_TOOL_RESULT])
    expect(bad).toContain(180)
    expect(bad).toContain(420)
  })

  it('lets the correct $110–$390 through', () => {
    expect(findUnsourcedPrices(HONEST_REPLY, [REAL_TOOL_RESULT])).toEqual([])
  })
})

describe('formatting must never read as fabrication', () => {
  it('matches a comma-grouped figure against a bare number', () => {
    const src = JSON.stringify({ price: 1623 })
    expect(findUnsourcedPrices('That comes to $1,623 as a reference.', [src])).toEqual([])
  })

  it('matches a decimal tool figure quoted as a round number', () => {
    // AAPP returns 2283.1; the assistant says $2,283.
    const src = JSON.stringify({ range_low: 2283.1, range_high: 2563.1 })
    expect(findUnsourcedPrices('about $2,283–$2,564 as a reference', [src])).toEqual([])
  })

  it('allows honest rounding ("about $520" for 522)', () => {
    expect(findUnsourcedPrices('about $520', [JSON.stringify({ price: 522 })])).toEqual([])
  })

  it('still catches a figure just outside the rounding tolerance', () => {
    // $600 is not a rounding of 522 by any reading.
    expect(findUnsourcedPrices('about $600', [JSON.stringify({ price: 522 })])).toContain(600)
  })
})

describe('what the guard must not block', () => {
  it('ignores replies with no money in them', () => {
    expect(findUnsourcedPrices('Which heading would you like — 2-fold or 3-fold?', [])).toEqual([])
  })

  it('allows the swatch shipping figures the prompt states directly', () => {
    const r = 'Swatches are free, up to 10 — you only pay shipping, $2.99 standard or $9.99 expedited.'
    expect(findUnsourcedPrices(r, [])).toEqual([])
  })

  it('allows the $5,000 whole-home threshold', () => {
    expect(findUnsourcedPrices('Projects over $5,000 are better handled with a designer.', [])).toEqual([])
  })

  it('allows a figure the CUSTOMER introduced (competitor quote)', () => {
    const customerSaid = 'I got another quote for $1,850, can you beat it?'
    const r = 'I hear you on the $1,850 — let me check we are comparing the same configuration.'
    expect(findUnsourcedPrices(r, [customerSaid])).toEqual([])
  })
})

describe('extractMoney', () => {
  it('reads the formats the assistant actually emits', () => {
    expect(extractMoney('$150, $1,623 and $2,283.10')).toEqual([150, 1623, 2283.1])
    expect(extractMoney('$ 470 – $ 561')).toEqual([470, 561])
  })

  it('returns nothing for prose without figures', () => {
    expect(extractMoney('a reference price, excludes install and tax')).toEqual([])
  })
})
