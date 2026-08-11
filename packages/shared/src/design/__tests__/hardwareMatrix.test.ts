import { describe, it, expect } from 'vitest'
import {
  HARDWARE_TYPES, HEADING_STYLES, PLEATED_HEADINGS, RIPPLE_HEADINGS,
  combinationProblem, hardwareFor, headingFamily, isCombinationLegal,
  maxWidthFor, mountsFor,
} from '../hardwareMatrix'
import type { HardwareType, HeadingStyle } from '../designParams'

// This matrix is the only thing standing between a customer and a design the
// workroom cannot build, so it gets tested rather than trusted.
describe('the range we actually make', () => {
  it('is ten headings — four pleated, six ripplefold', () => {
    expect(PLEATED_HEADINGS).toHaveLength(4)
    expect(RIPPLE_HEADINGS).toHaveLength(6)
    expect(HEADING_STYLES).toHaveLength(10)
  })

  it('carries AAPP\'s own labels, so the site and the app say the same words', () => {
    const labels = Object.fromEntries(HEADING_STYLES.map((h) => [h.key, h.label]))
    expect(labels['2fold_pinch']).toBe('2 Fold Pinch Pleat')
    expect(labels['3fold_tailored']).toBe('3 Fold Tailored Pleat')
    expect(labels['cn_6cm']).toBe('Perfect Wave')
    expect(labels['cn_7cm']).toBe('Grand Wave')
    expect(labels['us_100']).toBe('US 100%')
  })

  it('does not offer grommet or anything else off the list', () => {
    const keys = HEADING_STYLES.map((h) => h.key) as string[]
    expect(keys).not.toContain('grommet')
    expect(keys).not.toContain('rod_pocket')
    expect(keys).not.toContain('wave')
  })

  it('splits pleated from ripple correctly', () => {
    expect(headingFamily('3fold_pinch')).toBe('pleated')
    expect(headingFamily('us_120')).toBe('ripple')
  })
})

describe('heading x hardware', () => {
  it('keeps ripplefold off a wood pole', () => {
    for (const h of RIPPLE_HEADINGS) {
      expect(isCombinationLegal(h.key, 'wood_pole')).toBe(false)
      expect(combinationProblem(h.key, 'wood_pole')).toMatch(/track/i)
      expect(hardwareFor(h.key)).toEqual(['alu_track', 'h_rail'])
    }
  })

  it('lets every pleated heading hang on all three', () => {
    for (const h of PLEATED_HEADINGS) {
      expect(hardwareFor(h.key)).toEqual(['wood_pole', 'alu_track', 'h_rail'])
    }
  })

  it('leaves every heading with somewhere to hang', () => {
    for (const h of HEADING_STYLES) expect(hardwareFor(h.key).length).toBeGreaterThan(0)
  })
})

describe('mounting', () => {
  it('gives only the aluminium track a choice', () => {
    expect(mountsFor('wood_pole')).toEqual(['wall'])
    expect(mountsFor('h_rail')).toEqual(['wall'])
    expect(mountsFor('alu_track')).toEqual(['wall', 'ceiling'])
  })

  it('never leaves a hardware type without a mount', () => {
    for (const hw of HARDWARE_TYPES) expect(mountsFor(hw.key as HardwareType).length).toBeGreaterThan(0)
  })
})

describe('how wide a wood pole goes', () => {
  it('stops a one-way draw at 96 inches and a pair at 192', () => {
    expect(maxWidthFor('wood_pole', false)).toBe(96)
    expect(maxWidthFor('wood_pole', true)).toBe(192)
  })

  it('allows the width right up to the limit and refuses the inch past it', () => {
    expect(isCombinationLegal('3fold_pinch', 'wood_pole', { split: false, finishedWidthIn: 96 })).toBe(true)
    expect(isCombinationLegal('3fold_pinch', 'wood_pole', { split: false, finishedWidthIn: 97 })).toBe(false)
    expect(isCombinationLegal('3fold_pinch', 'wood_pole', { split: true, finishedWidthIn: 192 })).toBe(true)
    expect(isCombinationLegal('3fold_pinch', 'wood_pole', { split: true, finishedWidthIn: 193 })).toBe(false)
  })

  it('explains the limit in inches the customer can act on', () => {
    expect(combinationProblem('2fold_pinch', 'wood_pole', { split: false, finishedWidthIn: 120 }))
      .toBe('A wood pole spans up to 96" on a one-way draw.')
  })

  it('drops the pole out of the options once the width passes it', () => {
    expect(hardwareFor('2fold_pinch', { split: false, finishedWidthIn: 120 })).toEqual(['alu_track', 'h_rail'])
    expect(hardwareFor('2fold_pinch', { split: false, finishedWidthIn: 90 })).toContain('wood_pole')
  })

  it('does not cap the two track systems below the page\'s own bound', () => {
    for (const hw of ['alu_track', 'h_rail'] as HardwareType[]) {
      expect(maxWidthFor(hw, false)).toBeGreaterThanOrEqual(300)
      expect(maxWidthFor(hw, true)).toBeGreaterThanOrEqual(300)
    }
  })
})

describe('problem messages', () => {
  it('says nothing at all when the combination is fine', () => {
    expect(combinationProblem('3fold_pinch', 'alu_track', { split: true, finishedWidthIn: 200 })).toBeNull()
  })

  it('reports the heading clash before the width', () => {
    // A ripplefold on a pole is wrong for a reason that has nothing to do
    // with size — say that, don't talk about inches.
    const msg = combinationProblem('us_100', 'wood_pole', { split: false, finishedWidthIn: 400 })
    expect(msg).toMatch(/track/i)
    expect(msg).not.toMatch(/spans up to/)
  })
})

describe('every heading key is one the pricing chain accepts', () => {
  // draperyPricing.ts validates against exactly these; a typo here would
  // surface as "we can't price that" rather than as a wrong number.
  const ACCEPTED = new Set([
    '2fold_pinch', '2fold_tailored', '3fold_pinch', '3fold_tailored',
    'cn_6cm', 'cn_7cm', 'us_60', 'us_80', 'us_100', 'us_120',
  ])
  it('matches the engine vocabulary', () => {
    for (const h of HEADING_STYLES) expect(ACCEPTED.has(h.key as HeadingStyle)).toBe(true)
    expect(HEADING_STYLES).toHaveLength(ACCEPTED.size)
  })
})
