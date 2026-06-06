import { describe, it, expect } from 'vitest'
import { UnifiedPricingEngine } from '../engines/UnifiedPricingEngine'
import { evaluateFormula } from '../evaluator'

// These tests LOCK the current production behavior of the single authoritative
// pricing engine (UnifiedPricingEngine). They are intentionally explicit about
// rounding rules — the previous duplicate engines disagreed on rounding, which
// was a latent money bug. If a number here changes, that is a pricing change
// and must be reviewed deliberately.

const ctx = (over: any) => ({
  baseParams: {},
  options: {},
  optionValues: {},
  ...over,
})

describe('UnifiedPricingEngine — drapery', () => {
  const draperyFormula = {
    steps: [
      'panel_count_raw = window_width / 25',
      'fabric_cost_raw = window_width * 2',
      'fabric_yard_raw = window_width / 36',
    ],
  }

  it('basic case: ceil panels, no height/stacking multiplier', () => {
    const r = UnifiedPricingEngine.calculate(
      { width: 100, height: 100 },
      ctx({ productType: 'drapery', formula: draperyFormula, baseParams: { labor_per_panel: 50 } })
    )
    // panel_count = ceil(4) = 4; labor = 4*50*1 = 200; fabric = 200; total = 400
    expect(r.total).toBe(400)
    expect(r.breakdown.panel_count).toBe(4)
    expect(r.breakdown.labor_multiplier).toBe(1)
  })

  it('height >= 120 applies labor multiplier in 12" increments', () => {
    const r = UnifiedPricingEngine.calculate(
      { width: 100, height: 132 },
      ctx({ productType: 'drapery', formula: draperyFormula, baseParams: { labor_per_panel: 50 } })
    )
    // extra = 12 -> 1 increment -> multiplier 1.6; labor = 4*50*1.6 = 320; +200 = 520
    expect(r.breakdown.labor_multiplier).toBeCloseTo(1.6, 5)
    expect(r.total).toBe(520)
  })

  it('panels_per_section > 5 applies stacking surcharge', () => {
    const r = UnifiedPricingEngine.calculate(
      { width: 200, height: 100 },
      ctx({ productType: 'drapery', formula: draperyFormula, baseParams: { labor_per_panel: 50 } })
    )
    // panel_count = ceil(8) = 8; >5 -> surcharge 1.5; labor = 8*50*1.5 = 600; fabric = 400; total = 1000
    expect(r.breakdown.stacking_surcharge).toBe(1.5)
    expect(r.total).toBe(1000)
  })
})

describe('UnifiedPricingEngine — sheer (normal 55" fabric)', () => {
  it('computes labor + fabric with ceil rounding', () => {
    const r = UnifiedPricingEngine.calculate(
      { width: 100, height: 90 },
      ctx({
        productType: 'sheer',
        formula: { steps: [] },
        baseParams: { sheer_unit_price: 10, labor_per_panel: 30, sheer_fabric_width: 55 },
      })
    )
    // labor_panel_count = ceil(100*3.5/50)=7; labor=7*30=210
    // sheer_panel = ceil(350/55)=7; sheer_yard=ceil(7*110/36)=22; fabric=220; total=430
    expect(r.breakdown.calculation_method).toBe('normal')
    expect(r.breakdown.sheer_yard).toBe(22)
    expect(r.total).toBe(430)
  })
})

describe('UnifiedPricingEngine — shade', () => {
  const shadeFormula = { steps: ['area_sqm_raw = window_width * window_height / 1550'] }

  it('computes fabric cost from area', () => {
    const r = UnifiedPricingEngine.calculate(
      { width: 50, height: 62 },
      ctx({ productType: 'shade', formula: shadeFormula, baseParams: { fabric_unit_price: 20 } })
    )
    // area = 3100/1550 = 2; fabric = 40; total = 40
    expect(r.breakdown.area_sqm).toBe(2)
    expect(r.total).toBe(40)
  })

  it('enforces a 1 sqm minimum area', () => {
    const r = UnifiedPricingEngine.calculate(
      { width: 10, height: 10 },
      ctx({ productType: 'shade', formula: shadeFormula, baseParams: { fabric_unit_price: 20 } })
    )
    expect(r.breakdown.area_sqm).toBe(1)
    expect(r.total).toBe(20)
  })
})

describe('evaluateFormula', () => {
  it('evaluates a simple assignment into scope', () => {
    const scope: Record<string, number> = { a: 6, b: 3 }
    evaluateFormula('c = a * b', scope)
    expect(scope.c).toBe(18)
  })

  it('rejects function calls (rounding must live in code layer)', () => {
    expect(() => evaluateFormula('x = ceil(a)', { a: 1.2 })).toThrow(/function call/)
  })

  it('throws on a non-numeric result', () => {
    expect(() => evaluateFormula('x = a', { a: NaN })).toThrow()
  })
})
