import { describe, it, expect } from 'vitest'
import { isConfigDollarKey, stripConfigDollars, matchLocalLumaFabric, safeShadeSizeCeiling } from './aappCatalogQA'

describe('isConfigDollarKey', () => {
  it('keeps catalog identifiers the Sundance/JC pricer needs', () => {
    for (const k of ['priceGroup', 'priceTier', 'colorName', 'colorCode', 'hardwareType', 'controlSystem', 'rollDirection', 'louverSize', 'manufacturer']) {
      expect(isConfigDollarKey(k)).toBe(false)
    }
  })
  it('flags true dollar / cost fields', () => {
    for (const k of ['netPrice', 'unitPrice', 'msrp', 'dealerCost', 'markup', 'amount', 'retailPrice', 'wholesale', 'surcharge']) {
      expect(isConfigDollarKey(k)).toBe(true)
    }
  })
})

describe('stripConfigDollars', () => {
  it('keeps identifiers, drops dollar fields', () => {
    const out = stripConfigDollars({
      priceGroup: 'PG2', colorName: 'Linen White', hardwareType: 'cassette',
      controlSystem: 'beaded_chain', netPrice: 123, unitPrice: 45, msrp: 600, markup: 2,
    })
    expect(out).toEqual({
      priceGroup: 'PG2', colorName: 'Linen White', hardwareType: 'cassette', controlSystem: 'beaded_chain',
    })
  })
  it('recurses into nested objects and arrays', () => {
    const out = stripConfigDollars({
      options: [{ key: 'a', surcharge: 10 }, { key: 'b' }],
      meta: { retailPrice: 9, tier: 'PG3' },
    })
    expect(out).toEqual({ options: [{ key: 'a' }, { key: 'b' }], meta: { tier: 'PG3' } })
  })
  it('passes primitives and null through', () => {
    expect(stripConfigDollars(null)).toBe(null)
    expect(stripConfigDollars('PG5')).toBe('PG5')
    expect(stripConfigDollars(7)).toBe(7)
  })
})

// W8 (2026-07-21): local Luma fabric-code fallback — identification of codes
// the site's own catalog knows must never depend on AAPP resolve coverage
// (T2-EB regression: EB12-005 came back unidentified from AAPP).
describe('matchLocalLumaFabric', () => {
  it('identifies EB12-005 as a Luma sheer family + valid color', async () => {
    const m = await matchLocalLumaFabric('EB12-005')
    expect(m).toMatchObject({ series: 'sheer', family: 'EB12', color: '005', colorExists: true })
  })
  it('identifies DB1-1 as Luma zebra, normalizing the color to 001', async () => {
    const m = await matchLocalLumaFabric('DB1-1')
    expect(m).toMatchObject({ series: 'zebra', family: 'DB1', color: '001', colorExists: true })
  })
  it('honors legacy codes (TB4 → DB1 zebra)', async () => {
    const m = await matchLocalLumaFabric('TB4')
    expect(m).toMatchObject({ series: 'zebra', family: 'DB1', color: null })
  })
  it('flags a color not in the family list', async () => {
    const m = await matchLocalLumaFabric('DB1-999')
    expect(m).toMatchObject({ family: 'DB1', color: '999', colorExists: false })
  })
  it('returns null for names and unknown codes', async () => {
    expect(await matchLocalLumaFabric('Dorus')).toBe(null)
    expect(await matchLocalLumaFabric('ZZZ99-001')).toBe(null)
  })
})

// 2026-07-22: outdoor zip shade (48–240"W × 36–156"H) must NOT be clamped to
// the Luma indoor 118×120 ceiling — that clamp once telling customers the
// outdoor shade maxes at 118" would cut off the product's main selling point.
describe('safeShadeSizeCeiling', () => {
  it('gives the outdoor zip shade its own 240×156 envelope', () => {
    expect(safeShadeSizeCeiling('outdoor_zip_shade')).toEqual({ w: 240, h: 156 })
  })
  it('keeps every Luma indoor variant at 118×120', () => {
    for (const k of ['roller_shade', 'dual_roller_shade', 'zebra_shade', 'sheer_shade', 'dual_sheer_shade', 'modern_roman_shade']) {
      expect(safeShadeSizeCeiling(k)).toEqual({ w: 118, h: 120 })
    }
  })
  it('defaults unknown variants to the conservative Luma ceiling', () => {
    expect(safeShadeSizeCeiling('some_future_variant')).toEqual({ w: 118, h: 120 })
  })
})
