import { describe, it, expect } from 'vitest'
import {
  priceCambridgeShutter,
  billingSizeFromWindow,
  CAMBRIDGE_SHUTTER_DEFAULT_RATES,
} from '../aapp/cambridgeShutter'

// ⚠️ FROZEN AAPP CALIBRATION CASES — do not edit the expected values.
// Cases 1–4 are the exact reference set from AAPP's
// PHASE-C-3-CAMBRIDGE-SHUTTER-CALIBRATION.md (server verified 4/4 zero drift
// against client csCalcShutterPrice, 2026-04-28; recon re-read 2026-07-19).

describe('priceCambridgeShutter — frozen AAPP calibration', () => {
  it('#1 basswood paint 36×60 standard → 328.50', () => {
    const r = priceCambridgeShutter({ materialId: 'basswood', colorType: 'paint', widthIn: 36, heightIn: 60, styleId: 'standard' })
    expect(r?.subtotal).toBe(328.5)
    expect(r?.areaSqFt).toBe(15)
    expect(r?.matRateKey).toBe('basswood_paint')
    expect(r?.lines).toEqual([]) // standard style: no auto-upgrades fire
  })

  it('#2 basswood stain 48×72 + knob + lock + custom stain → 888', () => {
    const r = priceCambridgeShutter({
      materialId: 'basswood', colorType: 'stain', widthIn: 48, heightIn: 72,
      styleId: 'standard', knobEnabled: true, lockEnabled: true, customFinishType: 'custom_stain',
    })
    expect(r?.subtotal).toBe(888) // 612 + 6 + 18 + 252
    expect(r?.matRateKey).toBe('basswood_stain')
  })

  it('#3 hardwood 60×84 double_hung + buildout 1–3 + divider + raised panel → 962.50', () => {
    const r = priceCambridgeShutter({
      materialId: 'hardwood', widthIn: 60, heightIn: 84, styleId: 'double_hung',
      buildoutType: '1_3', dividerRailEnabled: true, panelSpecialty: 'raised_panel',
    })
    expect(r?.subtotal).toBe(962.5)
  })

  it('#4 poly_vinyl 40×60 bay_window qty 2 → 750', () => {
    const r = priceCambridgeShutter({
      materialId: 'poly_vinyl', widthIn: 40, heightIn: 60, styleId: 'bay_window', quantity: 2,
    })
    expect(r?.subtotal).toBe(750) // (341.67 + 33.33) × 2
    expect(r?.qty).toBe(2)
    expect(r?.installAmount).toBe(40) // flat $20 × 2, excluded from subtotal
  })
})

describe('priceCambridgeShutter — behavior', () => {
  it('doubleHungEnabled does NOT double-charge when style is already double_hung', () => {
    const withToggle = priceCambridgeShutter({
      materialId: 'hardwood', widthIn: 60, heightIn: 84, styleId: 'double_hung', doubleHungEnabled: true,
    })
    const without = priceCambridgeShutter({
      materialId: 'hardwood', widthIn: 60, heightIn: 84, styleId: 'double_hung',
    })
    expect(withToggle?.subtotal).toBe(without?.subtotal)
  })

  it('hidden tilt rod adds $0.50/sqft (AAPP UI default tilt)', () => {
    const base = priceCambridgeShutter({ materialId: 'paulownia', widthIn: 36, heightIn: 48 })
    const tilt = priceCambridgeShutter({ materialId: 'paulownia', widthIn: 36, heightIn: 48, tiltControl: 'hidden_tilt_rod' })
    expect(tilt!.subtotal - base!.subtotal).toBe(6) // 12 sqft × 0.5
  })

  it('bi_fold style auto-adds the $240 track', () => {
    const r = priceCambridgeShutter({ materialId: 'poly_vinyl', widthIn: 48, heightIn: 60, styleId: 'bi_fold' })
    expect(r?.lines).toContainEqual({ label: 'Bi-Fold/By-Pass Track', flat: 240 })
  })

  it('non-basswood ignores colorType (stain rate is basswood-only)', () => {
    const r = priceCambridgeShutter({ materialId: 'hardwood', colorType: 'stain', widthIn: 36, heightIn: 60 })
    expect(r?.rate).toBe(CAMBRIDGE_SHUTTER_DEFAULT_RATES.rates.hardwood)
  })

  it('minAreaSqFt is deliberately NOT enforced (AAPP parity, Eddie 2026-07-19)', () => {
    const r = priceCambridgeShutter({ materialId: 'poly_vinyl', widthIn: 24, heightIn: 30 }) // 5 sqft < 9
    expect(r?.subtotal).toBe(Math.round(5 * 20.5 * 100) / 100) // no 9-sqft floor
  })

  it('missing size or material → null', () => {
    expect(priceCambridgeShutter({ materialId: 'hardwood', widthIn: 0, heightIn: 60 })).toBeNull()
  })

  it('billingSizeFromWindow defaults to +3"/+3" frame adds', () => {
    expect(billingSizeFromWindow(36, 60)).toEqual({ widthIn: 39, heightIn: 63 })
    expect(billingSizeFromWindow(36, 60, 0, 0)).toEqual({ widthIn: 36, heightIn: 60 })
  })
})
