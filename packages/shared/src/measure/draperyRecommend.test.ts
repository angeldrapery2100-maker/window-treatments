import { describe, it, expect } from 'vitest'
import { recommendDraperySize } from './draperyRecommend'

// ⚠️ FROZEN AAPP-PARITY EXPECTATIONS — do not edit the numbers.
// Generated 2026-07-19 by executing the ORIGINAL AAPP draperyRecommendSize
// (app-quotes-drapery.js L400 + context resolver L355) in node against these
// exact inputs. A failure here means the port drifted from AAPP — fix the
// port, never these values (see aapp-pricing-critical memory / docs).

describe('recommendDraperySize — frozen AAPP parity', () => {
  it('pleated split, unmeasured side clearances, wall rod (gap 20 → mid-mount)', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 60, windowHeightIn: 84, clearTopIn: 20, clearBottomIn: 0,
        styleFamily: 'pleated', operation: 'split', rodType: 'wall_rod',
      })
    ).toEqual({ recommendedFinishedWidthIn: 74, recommendedFinishedHeightIn: 109.5 })
  })

  it('pleated split clamped by side clearances + measured wall heights, ceiling track', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 100, windowHeightIn: 60, clearLeftIn: 6, clearRightIn: 6,
        clearTopIn: 12, clearBottomIn: 24, wallHeightsIn: [96, 95.75, 96],
        styleFamily: 'pleated', operation: 'split', rodType: 'ceiling_track',
      })
    ).toEqual({ recommendedFinishedWidthIn: 111, recommendedFinishedHeightIn: 94.5 })
  })

  it('pleated single_left with 30" clearance, wall rod', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 48, windowHeightIn: 60, clearLeftIn: 30,
        clearTopIn: 24, clearBottomIn: 12,
        styleFamily: 'pleated', operation: 'single_left', rodType: 'wall_rod',
      })
    ).toEqual({ recommendedFinishedWidthIn: 62, recommendedFinishedHeightIn: 103.5 })
  })

  it('pleated single_right limited by an 8" clearance, measured wall height', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 72, windowHeightIn: 80, clearRightIn: 8,
        clearTopIn: 10, clearBottomIn: 14, wallHeightsIn: [104],
        styleFamily: 'pleated', operation: 'single_right', rodType: 'ceiling_track',
      })
    ).toEqual({ recommendedFinishedWidthIn: 80, recommendedFinishedHeightIn: 102.75 })
  })

  it('ripple split cn_6cm, motorized ceiling track', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 120, windowHeightIn: 90, clearTopIn: 15, clearBottomIn: 0,
        wallHeightsIn: [108],
        styleFamily: 'ripple', operation: 'split', rippleStyleKey: 'cn_6cm',
        rodType: 'motorized_ceiling_track',
      })
    ).toEqual({ recommendedFinishedWidthIn: 176, recommendedFinishedHeightIn: 106.25 })
  })

  it('ripple split us_80 clamped by total available width, wall rod', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 96, windowHeightIn: 72, clearLeftIn: 12, clearRightIn: 12,
        clearTopIn: 18, clearBottomIn: 20,
        styleFamily: 'ripple', operation: 'split', rippleStyleKey: 'us_80', rodType: 'wall_rod',
      })
    ).toEqual({ recommendedFinishedWidthIn: 119, recommendedFinishedHeightIn: 105.5 })
  })

  it('ripple single_right with 10" clearance, ceiling track', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 72, windowHeightIn: 84, clearRightIn: 10,
        clearTopIn: 12, clearBottomIn: 10,
        styleFamily: 'ripple', operation: 'single_right', rippleStyleKey: 'us_80',
        rodType: 'ceiling_track',
      })
    ).toEqual({ recommendedFinishedWidthIn: 82, recommendedFinishedHeightIn: 104.75 })
  })

  it('inner-frame-only measurement (gap 36 → mid-mount)', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 40, windowHeightIn: 56, clearTopIn: 36, clearBottomIn: 20,
        styleFamily: 'pleated', operation: 'split', rodType: 'wall_rod',
      })
    ).toEqual({ recommendedFinishedWidthIn: 50, recommendedFinishedHeightIn: 125.5 })
  })

  it('hardware return + finials shrink available width; height offset applies', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 80, windowHeightIn: 70, clearLeftIn: 14, clearRightIn: 14,
        clearTopIn: 22, clearBottomIn: 26,
        styleFamily: 'pleated', operation: 'split', rodType: 'wall_rod',
        hardware: { returnIn: 3.5, leftFinialLengthIn: 3, rightFinialLengthIn: 3, maxCurtainHeightOffsetIn: 1.5 },
      })
    ).toEqual({ recommendedFinishedWidthIn: 94, recommendedFinishedHeightIn: 123 })
  })

  it('motorized ceiling track with custom 1" floor clearance and wall heights', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 60, windowHeightIn: 84, clearTopIn: 20, clearBottomIn: 0,
        wallHeightsIn: [106, 105.5, 106], clearanceFromFloorIn: 1,
        styleFamily: 'pleated', operation: 'split', rodType: 'motorized_ceiling_track',
      })
    ).toEqual({ recommendedFinishedWidthIn: 74, recommendedFinishedHeightIn: 103.25 })
  })

  it('no style family → height only, width null', () => {
    expect(
      recommendDraperySize({
        windowWidthIn: 50, windowHeightIn: 60, clearTopIn: 30, clearBottomIn: 10,
        wallHeightsIn: [100], rodType: 'ceiling_track',
      })
    ).toEqual({ recommendedFinishedWidthIn: null, recommendedFinishedHeightIn: 98.75 })
  })

  it('missing window dims → null', () => {
    expect(recommendDraperySize({ windowWidthIn: 0, windowHeightIn: 80 })).toBeNull()
  })
})
