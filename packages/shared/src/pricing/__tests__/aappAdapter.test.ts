import { describe, it, expect } from 'vitest'
import { calculateAapp, isAappConfigured } from '../aapp/adapter'

// Adapter tests: the same spec §7 numbers must come out when the input travels
// through the store-product mapping (baseParams.aapp_* + option value strings
// + numeric option params) instead of direct engine calls.

describe('aapp adapter', () => {
  it('isAappConfigured detects the opt-in key', () => {
    expect(isAappConfigured({ aapp_engine: 'luma_shade' })).toBe(true)
    expect(isAappConfigured({})).toBe(false)
    expect(isAappConfigured(null)).toBe(false)
  })

  it('L1 via adapter: Luma roller 60×72 ME8 + round_fabric + plastic chain = $226', () => {
    const r = calculateAapp({
      width: 60, height: 72,
      baseParams: { aapp_engine: 'luma_shade', aapp_variant: 'roller_shade' },
      options: { fabric_code: 'ME8', cassette: 'round_fabric', control: 'plastic_chain' },
      optionParams: {},
    })
    expect(r.total).toBe(226)
  })

  it('R1 via adapter: roman flat inner 36×48, $40/yd 54", BO = $391', () => {
    const r = calculateAapp({
      width: 36, height: 48,
      baseParams: { aapp_engine: 'roman_shade' },
      options: { mount: 'inner', style: 'flat', lining: 'BO' },
      optionParams: { fabric_price_per_yard: 40, fabric_width_in: 54 },
    })
    expect(r.total).toBe(391)
  })

  it('D1 via adapter: drapery 2fold split 100×96, $30/yd 55", no lining = $660', () => {
    const r = calculateAapp({
      width: 100, height: 96,
      baseParams: { aapp_engine: 'drapery' },
      options: { style: '2fold_pinch', operation: 'split', lining: 'NO' },
      optionParams: { fabric_price_per_yard: 30, fabric_width_in: 55 },
    })
    expect(r.total).toBe(660)
  })

  it('D2 via adapter: ripple key routes styleFamily=ripple, BO lining = $660', () => {
    const r = calculateAapp({
      width: 120, height: 100,
      baseParams: { aapp_engine: 'drapery' },
      options: { style: 'cn_6cm', operation: 'split', lining: 'BO' },
      optionParams: { fabric_price_per_yard: 45, fabric_width_in: 118 },
    })
    expect(r.total).toBe(660)
  })

  it('D1 + bundled rod: hardware=yes adds $210 (billedFeet 9, min 4 ft) → $870', () => {
    const r = calculateAapp({
      width: 100, height: 96,
      baseParams: { aapp_engine: 'drapery' },
      options: { style: '2fold_pinch', operation: 'split', lining: 'NO', hardware: 'yes' },
      optionParams: {
        fabric_price_per_yard: 30, fabric_width_in: 55,
        hw_base_price: 120, hw_add_per_foot: 18, hw_min_width_in: 48,
      },
    })
    // rod lengthIn = finished width 100" → billedFeet ceil(99.9/12)=9,
    // minFt 4 → 120 + 5×18 = 210; drapery D1 = 660 → 870 total.
    expect(r.breakdown.hardwareSubtotal).toBe(210)
    expect(r.breakdown.hardwareBilledFeet).toBe(9)
    expect(r.total).toBe(870)
  })

  it('D1 + hardware options but hardware="none": rod excluded, stays $660', () => {
    const r = calculateAapp({
      width: 100, height: 96,
      baseParams: { aapp_engine: 'drapery' },
      options: { style: '2fold_pinch', operation: 'split', lining: 'NO', hardware: 'none' },
      optionParams: {
        fabric_price_per_yard: 30, fabric_width_in: 55,
        hw_base_price: 120, hw_add_per_foot: 18, hw_min_width_in: 48,
      },
    })
    expect(r.breakdown.hardwareSubtotal).toBeUndefined()
    expect(r.total).toBe(660)
  })

  it('H1 via adapter: hardware 100" base $120@4ft + $18/ft = $210', () => {
    const r = calculateAapp({
      width: 100, height: 0,
      baseParams: { aapp_engine: 'drapery_hardware' },
      options: {},
      optionParams: { hw_base_price: 120, hw_add_per_foot: 18, hw_min_width_in: 48 },
    })
    expect(r.total).toBe(210)
  })

  it('H2 via adapter: SOMFY pinch 100" split + glydea60 = $2491.65 (no accessories)', () => {
    const r = calculateAapp({
      width: 100, height: 0,
      baseParams: { aapp_engine: 'somfy_track' },
      options: { track_type: 'pinch_pleat', open_type: 'split', motor: 'glydea60' },
      optionParams: {},
    })
    expect(r.total).toBe(2491.65)
  })

  it('fails closed: drapery without a fabric price throws', () => {
    expect(() => calculateAapp({
      width: 100, height: 96,
      baseParams: { aapp_engine: 'drapery' },
      options: { style: '2fold_pinch' },
      optionParams: {},
    })).toThrow()
  })

  it('fails closed: unknown engine key throws', () => {
    expect(() => calculateAapp({
      width: 10, height: 10,
      baseParams: { aapp_engine: 'nope' },
      options: {}, optionParams: {},
    })).toThrow()
  })
})
