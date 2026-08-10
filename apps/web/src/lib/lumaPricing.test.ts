import { describe, it, expect } from 'vitest'
import {
  lumaEstimate,
  lumaCategories,
  pickRepresentative,
  parseMissing,
  LUMA_VARIANT_SERIES,
} from './lumaPricing'

// These cover the parts that must keep working without AAPP credentials:
// the input guards, the fabric sampler, and the "missing (a/b/c)" parser that
// lets us self-configure instead of interrogating the customer.

describe('lumaEstimate input guards', () => {
  it('rejects a non-Luma variant before touching the network', async () => {
    const r = await lumaEstimate({ variant: 'sundance_roller_shade', widthIn: 36, heightIn: 58 })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('unsupported_variant')
  })

  it('rejects a missing or zero size', async () => {
    for (const p of [
      { variant: 'zebra_shade', widthIn: 0, heightIn: 58 },
      { variant: 'zebra_shade', widthIn: 36, heightIn: 0 },
    ]) {
      const r = await lumaEstimate(p)
      expect(r.ok).toBe(false)
      expect(r.error).toBe('missing_size')
    }
  })

  it('accepts all four single-fabric Luma variants', () => {
    expect(Object.keys(LUMA_VARIANT_SERIES).sort()).toEqual(
      ['modern_roman_shade', 'roller_shade', 'sheer_shade', 'zebra_shade']
    )
  })
})

describe('pickRepresentative', () => {
  it('returns codes for the categories the assistant offers per series', () => {
    const cases: [string, string][] = [
      ['zebra', 'room_darkening'],
      ['zebra', 'light_filtering'],
      ['roller', 'blackout'],
      ['roller', 'screen'],
      ['sheer', 'light_filtering'],
      ['roman', 'blackout'],
    ]
    for (const [series, category] of cases) {
      const codes = pickRepresentative(series, category)
      expect(codes.length, `${series}/${category}`).toBeGreaterThan(0)
      // Every pick must be a FAMILY-COLOR code AAPP can resolve.
      for (const c of codes) expect(c).toMatch(/^[A-Z]+\d+-\d+$/)
      expect(new Set(codes).size).toBe(codes.length)
    }
  })

  it('spans the catalog rather than clustering at the front', () => {
    const codes = pickRepresentative('zebra', 'room_darkening')
    const families = codes.map((c) => c.split('-')[0])
    // DB1 is first in catalog order; the sample must reach past it.
    expect(families[0]).toBe('DB1')
    expect(families[families.length - 1]).not.toBe('DB1')
  })

  it('samples the whole series when no category is given', () => {
    expect(pickRepresentative('zebra').length).toBeGreaterThan(0)
  })

  it('returns nothing for a category that does not exist (caller asks the customer)', () => {
    expect(pickRepresentative('zebra', 'no_such_category')).toEqual([])
    expect(lumaCategories('zebra')).toContain('room_darkening')
  })
})

// The three entries below are the VERBATIM response AAPP returned for
// zebra_shade 36×58 on 2026-08-10 — not invented examples. If AAPP's wording
// changes, these break, which is exactly what we want.
const REAL_MISSING = [
  'cassette (round/square)',
  'option (plastic_chain/stainless_chain/cordless/motorized)',
  'controlSide (left/right)',
]

describe('parseMissing', () => {
  it('parses the real AAPP zebra_shade response', () => {
    expect(REAL_MISSING.map(parseMissing)).toEqual([
      { field: 'cassette', options: ['round', 'square'] },
      { field: 'option', options: ['plastic_chain', 'stainless_chain', 'cordless', 'motorized'] },
      { field: 'controlSide', options: ['left', 'right'] },
    ])
  })

  it('never auto-selects a motor: the control we fill is a chain', () => {
    // Guards the actual bug this test file caught — the old code looked for a
    // bare "chain", missed, and fell through to options[0] by luck. Catalog
    // order must not decide what the customer gets quoted.
    const { options } = parseMissing(REAL_MISSING[1])
    const pick =
      options.find((o) => o === 'plastic_chain') ??
      options.find((o) => o.endsWith('_chain') || o === 'chain') ??
      options.find((o) => o === 'cordless') ??
      options.find((o) => o !== 'motorized')
    expect(pick).toBe('plastic_chain')

    // Same logic must still avoid the motor if the list is reordered.
    const reordered = ['motorized', 'cordless', 'stainless_chain']
    const pick2 =
      reordered.find((o) => o === 'plastic_chain') ??
      reordered.find((o) => o.endsWith('_chain') || o === 'chain') ??
      reordered.find((o) => o === 'cordless') ??
      reordered.find((o) => o !== 'motorized')
    expect(pick2).toBe('stainless_chain')
  })

  it('pulls the field and its offered values out of an AAPP missing entry', () => {
    expect(parseMissing('cassette (open/round/square)')).toEqual({
      field: 'cassette',
      options: ['open', 'round', 'square'],
    })
  })

  it('drops prose options so we never send "see Product Library" as a value', () => {
    const r = parseMissing('cassette (see Product Library)')
    expect(r.field).toBe('cassette')
    expect(r.options).toEqual([])
  })

  it('handles controlSide, which AAPP writes as left/right', () => {
    expect(parseMissing('controlSide (left/right)')).toEqual({
      field: 'controlSide',
      options: ['left', 'right'],
    })
  })

  it('degrades to a bare field name when there are no parentheses', () => {
    expect(parseMissing('motorKey').field).toBe('motorKey')
  })
})
