import { describe, it, expect } from 'vitest'
import { hardwareEstimate, matchProfiles } from './hardwarePricing'
import { HARDWARE_PROFILES } from './draperyHardwareCatalog.generated'

const LEN = { lengthIn: 120 }

describe('hardware asks the answerable things, one at a time', () => {
  it('needs a length first', async () => {
    const r = await hardwareEstimate({ lengthIn: 0 })
    expect(r.error).toBe('missing_length')
    expect(r.ask).toBeUndefined()
  })

  it('asks rod-vs-track first', async () => {
    expect((await hardwareEstimate(LEN)).ask?.field).toBe('kind')
  })

  it('asks manual-vs-motorised for tracks', async () => {
    expect((await hardwareEstimate({ ...LEN, kind: 'track' })).ask?.field).toBe('motorized')
  })

  it('SKIPS the motor question for rods — no motorised pole exists', async () => {
    // Straight to the layer question, not back to motorised.
    expect((await hardwareEstimate({ ...LEN, kind: 'pole' })).ask?.field).toBe('layer')
    expect(HARDWARE_PROFILES.filter((p) => p.kind === 'pole' && p.motorized)).toHaveLength(0)
  })

  it('asks single-vs-double last', async () => {
    expect(
      (await hardwareEstimate({ ...LEN, kind: 'track', motorized: false })).ask?.field
    ).toBe('layer')
  })

  it('stops asking once kind + layer (+ motor for tracks) are known', async () => {
    expect((await hardwareEstimate({ ...LEN, kind: 'pole', layer: 'single' })).ask).toBeUndefined()
    expect(
      (await hardwareEstimate({ ...LEN, kind: 'track', motorized: true, layer: 'double' })).ask
    ).toBeUndefined()
  })
})

describe('profile matching', () => {
  it('classifies H-rails as tracks, not poles', () => {
    // isTrackType is false for every H-rail in AAPP — classifying off that
    // flag would have put them on the pole side. This guards the fix.
    const hrails = HARDWARE_PROFILES.filter((p) => p.family.includes('h_rail'))
    expect(hrails.length).toBeGreaterThan(0)
    for (const p of hrails) expect(p.kind).toBe('track')
  })

  it('only wood and metal rods are poles', () => {
    for (const p of HARDWARE_PROFILES.filter((x) => x.kind === 'pole')) {
      expect(['wood_pole', 'metal_rod']).toContain(p.family)
    }
  })

  it('finds candidates for every question combination a customer can reach', () => {
    for (const kind of ['pole', 'track'] as const) {
      for (const layer of ['single', 'double'] as const) {
        const motors = kind === 'pole' ? [false] : [false, true]
        for (const motorized of motors) {
          const m = matchProfiles({ lengthIn: 120, kind, layer, motorized })
          expect(m.length, `${kind}/${layer}/${motorized}`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('narrows further when a mount is given', () => {
    const all = matchProfiles({ lengthIn: 120, kind: 'track', layer: 'single', motorized: false })
    const ceiling = matchProfiles({ lengthIn: 120, kind: 'track', layer: 'single', motorized: false, mount: 'ceiling' })
    expect(ceiling.length).toBeGreaterThan(0)
    expect(ceiling.length).toBeLessThan(all.length)
  })

  it('stays under the fan-out ceiling for every reachable filter', () => {
    for (const kind of ['pole', 'track'] as const) {
      for (const layer of ['single', 'double'] as const) {
        for (const motorized of [false, true]) {
          expect(matchProfiles({ lengthIn: 120, kind, layer, motorized }).length).toBeLessThanOrEqual(8)
        }
      }
    }
  })
})

describe('generated catalog integrity', () => {
  it('carries no price fields — prices must only ever come from AAPP', () => {
    const banned = ['price', 'pricePerFoot', 'basePriceAtMinWidth', 'addPricePerFoot', 'cost']
    for (const p of HARDWARE_PROFILES) {
      for (const k of Object.keys(p)) {
        expect(banned, `${p.key}.${k}`).not.toContain(k)
      }
    }
  })

  it('gives every profile a colour to satisfy the engine gate', () => {
    // An empty palette means AAPP would answer missing_color and that profile
    // would silently drop out of every span.
    const missing = HARDWARE_PROFILES.filter((p) => !p.colors.length)
    expect(missing.map((p) => p.key)).toEqual([])
  })

  it('offers finials on poles and H-rails, and none on plain tracks', () => {
    for (const p of HARDWARE_PROFILES) {
      if (p.canHaveFinial) expect(p.finials.length, p.key).toBeGreaterThan(0)
      else expect(p.finials, p.key).toEqual([])
    }
    expect(HARDWARE_PROFILES.find((p) => p.key === 'aluminum_track_single_wall')!.canHaveFinial).toBe(false)
    expect(HARDWARE_PROFILES.find((p) => p.key === 'wood_pole_single_2in_wall')!.canHaveFinial).toBe(true)
  })

  it('has unique keys', () => {
    const keys = HARDWARE_PROFILES.map((p) => p.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('family narrowing (used by /design, where the customer names the hardware)', () => {
  it('keeps wood poles apart from metal rods', () => {
    const wood = matchProfiles({ lengthIn: 120, kind: 'pole', family: 'wood_pole' })
    expect(wood.length).toBeGreaterThan(0)
    expect(wood.every((p) => p.family === 'wood_pole')).toBe(true)
  })

  it('treats the ceiling variant as the same product', () => {
    // `h_rail` and `ceiling_h_rail` are one thing to a customer choosing
    // "H-rail" and then "ceiling mount".
    const rails = matchProfiles({ lengthIn: 120, kind: 'track', family: 'h_rail', motorized: false })
    const families = new Set(rails.map((p) => p.family))
    expect(families).toContain('h_rail')
    expect(families).toContain('ceiling_h_rail')
    expect([...families].some((f) => f.includes('aluminum'))).toBe(false)
  })

  it('does not let an aluminium track answer to h_rail', () => {
    const track = matchProfiles({ lengthIn: 120, kind: 'track', family: 'aluminum_track', motorized: false })
    expect(track.length).toBeGreaterThan(0)
    expect(track.every((p) => p.family.includes('aluminum'))).toBe(true)
  })

  it('changes nothing when no family is given', () => {
    const all = matchProfiles({ lengthIn: 120, kind: 'track', motorized: false })
    expect(all.length).toBeGreaterThan(3)
  })
})
