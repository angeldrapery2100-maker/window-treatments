import { describe, it, expect } from 'vitest'
import { somfyEstimate, SOMFY_TRACK_TYPES } from './somfyPricing'
import { parseMissing } from './aappAction'

describe('somfy guards and the one question we do ask', () => {
  it('needs a track length before anything else', async () => {
    const r = await somfyEstimate({ widthIn: 0 })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('missing_width')
    expect(r.ask).toBeUndefined()
  })

  it('asks pinch-pleat vs ripplefold — the one thing a customer can answer', async () => {
    const r = await somfyEstimate({ widthIn: 120 })
    expect(r.ask?.field).toBe('track_type')
    expect(r.ask?.options).toEqual(SOMFY_TRACK_TYPES)
    expect(r.ask?.askZh).toBeTruthy()
  })

  it('never asks for a motor id', async () => {
    const r = await somfyEstimate({ widthIn: 120, trackType: 'pinch_pleat' })
    // With no AAPP token this can't price, but it must not have turned the
    // motor into a customer-facing question.
    expect(r.ask).toBeUndefined()
  })

  it('rejects a track type AAPP does not have', async () => {
    const r = await somfyEstimate({ widthIn: 120, trackType: 'roman_track' })
    expect(r.ask?.field).toBe('track_type')
  })
})

describe('motor list parsing', () => {
  // VERBATIM probe response from the live function, 2026-08-10 —
  // somfy_motorized_track, 120" pinch pleat, no motorId.
  const REAL_PROBE = 'motorId (glydea35/glydea60/irismo45/irismo35)'

  it('reads ids out of the real unconfigured probe response', () => {
    const { field, options } = parseMissing(REAL_PROBE)
    expect(field).toBe('motorId')
    expect(options).toEqual(['glydea35', 'glydea60', 'irismo45', 'irismo35'])
  })

  it('the live roster fits under the fan-out ceiling, so nothing is clipped', () => {
    // If this ever fails, the tool starts quoting a partial span and the
    // coverage_note kicks in — worth noticing deliberately, not by surprise.
    expect(parseMissing(REAL_PROBE).options.length).toBeLessThanOrEqual(6)
  })

  it('handles the width-only probe AAPP returns when the config is bare', () => {
    expect(parseMissing('widthIn (> 0)').field).toBe('widthIn')
    // "> 0" is prose, not a value — it must never be sent back as one.
    expect(parseMissing('widthIn (> 0)').options).toEqual([])
  })
})
