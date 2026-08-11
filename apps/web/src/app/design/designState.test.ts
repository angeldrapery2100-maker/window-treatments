import { describe, it, expect } from 'vitest'
import { searchFromState, stateFromSearch, type State } from './DesignClient'
import { isCombinationLegal } from '@window-treatments/shared/design'

// 验收 2: "非法组合(如 grommet+track)在 UI 上选不出来" — including via a
// hand-edited or stale link, which is the one route that bypasses the picker.
describe('design state <-> query string', () => {
  it('round-trips a complete design', () => {
    const s: State = {
      fabricId: 'carole::a-day-off::indigo', width: '96', height: '84',
      heading: 'pinch2', split: false, lining: 'BO', hardware: 'h_rail', mount: 'ceiling',
    }
    expect(stateFromSearch(searchFromState(s), '')).toEqual(s)
  })

  it('repairs an illegal heading/hardware pair from a stale link', () => {
    const s = stateFromSearch('?heading=grommet&hw=alu_track', '')
    expect(s.heading).toBe('grommet')
    expect(s.hardware).toBe('wood_pole')
    expect(isCombinationLegal(s.heading, s.hardware)).toBe(true)
  })

  it('repairs a mount the chosen hardware does not offer', () => {
    // Wood poles are wall-mounted only.
    expect(stateFromSearch('?heading=pinch3&hw=wood_pole&mount=ceiling', '').mount).toBe('wall')
  })

  it('falls back to the seeded fabric when the link has none', () => {
    expect(stateFromSearch('?w=90', 'seed::fabric::id').fabricId).toBe('seed::fabric::id')
  })

  it('defaults to a centre-open pair and only opts out explicitly', () => {
    expect(stateFromSearch('', '').split).toBe(true)
    expect(stateFromSearch('?split=0', '').split).toBe(false)
  })

  it('ignores an unknown heading, lining or hardware', () => {
    const s = stateFromSearch('?heading=zzz&lining=zzz&hw=zzz', '')
    expect(s.heading).toBe('pinch3')
    expect(s.lining).toBe('LF')
    expect(isCombinationLegal(s.heading, s.hardware)).toBe(true)
  })
})
