import { describe, it, expect } from 'vitest'
import { isConfigDollarKey, stripConfigDollars } from './aappCatalogQA'

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
