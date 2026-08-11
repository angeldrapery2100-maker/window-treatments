import { describe, it, expect } from 'vitest'
import {
  HARDWARE_TYPES, HEADING_STYLES, hardwareFor, isCombinationLegal, mountsFor,
} from '../hardwareMatrix'
import type { HardwareType, HeadingStyle } from '../designParams'

// This matrix is the only thing standing between a customer and a design we
// cannot build, so it gets tested rather than trusted.
describe('heading x hardware matrix', () => {
  it('lets a wave hang on a track or an H-rail, never on a pole', () => {
    expect(hardwareFor('wave')).toEqual(['alu_track', 'h_rail'])
    expect(isCombinationLegal('wave', 'wood_pole')).toBe(false)
  })

  it('keeps grommets on a wood pole', () => {
    expect(hardwareFor('grommet')).toEqual(['wood_pole'])
    expect(isCombinationLegal('grommet', 'alu_track')).toBe(false)
    expect(isCombinationLegal('grommet', 'h_rail')).toBe(false)
  })

  it('lets a pinch pleat hang on all three', () => {
    for (const h of ['pinch2', 'pinch3'] as HeadingStyle[]) {
      expect(hardwareFor(h)).toHaveLength(3)
      for (const hw of HARDWARE_TYPES) expect(isCombinationLegal(h, hw.key)).toBe(true)
    }
  })

  it('leaves every heading with at least one hardware option', () => {
    // A heading with nothing to hang on would strand the picker.
    for (const h of HEADING_STYLES) expect(hardwareFor(h.key).length).toBeGreaterThan(0)
  })

  it('only names hardware that exists', () => {
    const known = new Set(HARDWARE_TYPES.map((h) => h.key))
    for (const h of HEADING_STYLES) {
      for (const hw of hardwareFor(h.key)) expect(known.has(hw)).toBe(true)
    }
  })

  it('gives a wood pole a wall mount only, and tracks both', () => {
    expect(mountsFor('wood_pole')).toEqual(['wall'])
    expect(mountsFor('alu_track')).toEqual(['wall', 'ceiling'])
    expect(mountsFor('h_rail')).toEqual(['wall', 'ceiling'])
  })

  it('never leaves a hardware type without a mount', () => {
    for (const hw of HARDWARE_TYPES) expect(mountsFor(hw.key as HardwareType).length).toBeGreaterThan(0)
  })
})
