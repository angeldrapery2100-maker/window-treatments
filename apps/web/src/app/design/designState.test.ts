import { describe, it, expect } from 'vitest'
import { searchFromState, stateFromSearch, type State } from './DesignClient'
import { combinationProblem } from '@window-treatments/shared/design'

// A link is the one route into /design that bypasses the picker entirely, so
// it is where an unbuildable design would slip through if anywhere.
describe('design state <-> query string', () => {
  it('round-trips a complete design', () => {
    const s: State = {
      fabricId: 'carole::a-day-off::indigo', width: '96', height: '84',
      heading: '2fold_tailored', split: false, lining: 'BO', hardware: 'h_rail', mount: 'wall',
    }
    expect(stateFromSearch(searchFromState(s), '')).toEqual(s)
  })

  it('round-trips a ripplefold on a track', () => {
    const s: State = {
      fabricId: 'x::y::z', width: '140', height: '96',
      heading: 'us_100', split: true, lining: 'LF', hardware: 'alu_track', mount: 'ceiling',
    }
    expect(stateFromSearch(searchFromState(s), '')).toEqual(s)
  })

  it('moves a ripplefold off a wood pole', () => {
    const s = stateFromSearch('?heading=cn_6cm&hw=wood_pole', '')
    expect(s.heading).toBe('cn_6cm')
    expect(s.hardware).not.toBe('wood_pole')
    expect(combinationProblem(s.heading, s.hardware, { split: s.split })).toBeNull()
  })

  it('moves a too-wide one-way draw off a wood pole', () => {
    // 120" one-way is past the pole's 96" limit; 90" is not.
    const wide = stateFromSearch('?heading=2fold_pinch&hw=wood_pole&split=0&w=120', '')
    expect(wide.hardware).not.toBe('wood_pole')
    const ok = stateFromSearch('?heading=2fold_pinch&hw=wood_pole&split=0&w=90', '')
    expect(ok.hardware).toBe('wood_pole')
  })

  it('keeps a wide pair on a wood pole, because a pair may go to 192"', () => {
    const s = stateFromSearch('?heading=3fold_pinch&hw=wood_pole&w=180', '')
    expect(s.hardware).toBe('wood_pole')
  })

  it('repairs a mount the chosen hardware does not offer', () => {
    // Only the aluminium track offers a choice; a pole and an H-rail are wall.
    expect(stateFromSearch('?heading=3fold_pinch&hw=wood_pole&mount=ceiling', '').mount).toBe('wall')
    expect(stateFromSearch('?heading=us_100&hw=h_rail&mount=ceiling', '').mount).toBe('wall')
    expect(stateFromSearch('?heading=us_100&hw=alu_track&mount=ceiling', '').mount).toBe('ceiling')
  })

  it('falls back to the seeded fabric when the link has none', () => {
    expect(stateFromSearch('?w=90', 'seed::fabric::id').fabricId).toBe('seed::fabric::id')
  })

  it('defaults to a centre-open pair and only opts out explicitly', () => {
    expect(stateFromSearch('', '').split).toBe(true)
    expect(stateFromSearch('?split=0', '').split).toBe(false)
  })

  it('ignores an unknown heading, lining or hardware', () => {
    const s = stateFromSearch('?heading=grommet&lining=zzz&hw=zzz', '')
    expect(s.heading).toBe('3fold_pinch')
    expect(s.lining).toBe('LF')
    expect(combinationProblem(s.heading, s.hardware, { split: s.split })).toBeNull()
  })

  it('never hands back a state the picker would refuse', () => {
    for (const q of [
      '?heading=us_120&hw=wood_pole&split=0&w=200',
      '?heading=2fold_tailored&hw=wood_pole&split=0&w=300',
      '?heading=cn_7cm&hw=wood_pole&w=40',
    ]) {
      const s = stateFromSearch(q, '')
      expect(combinationProblem(s.heading, s.hardware, { split: s.split, finishedWidthIn: Number(s.width) || undefined })).toBeNull()
    }
  })
})
