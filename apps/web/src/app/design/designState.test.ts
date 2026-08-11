import { describe, it, expect } from 'vitest'
import { searchFromState, stateFromSearch, type State } from './DesignClient'
import { combinationProblem } from '@window-treatments/shared/design'
import { designProfiles } from '@/lib/designHardware'

// A link is the one route into /design that bypasses the picker entirely, so
// it is where an unbuildable design would slip through if anywhere.
describe('design state <-> query string', () => {
  it('round-trips a complete design', () => {
    const s: State = {
      composition: 'fabric_only', sheerFabricId: '',
      fabricId: 'carole::a-day-off::indigo', width: '96', height: '84',
      heading: '2fold_tailored', split: false, lining: 'BO', hardware: 'h_rail', mount: 'wall',
      profileKey: 'h_rail_single_1_1_8_wall', colorKey: 'Satin Gold', finialKey: 'crystal_finial',
    }
    expect(stateFromSearch(searchFromState(s), '')).toEqual(s)
  })

  it('round-trips a ripplefold on a track', () => {
    const s: State = {
      composition: 'fabric_only', sheerFabricId: '',
      fabricId: 'x::y::z', width: '140', height: '96',
      heading: 'us_100', split: true, lining: 'LF', hardware: 'alu_track', mount: 'ceiling',
      profileKey: 'aluminum_ceiling_track_single', colorKey: 'Black', finialKey: '',
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

  it('round-trips a drape with a sheer behind it, on a double rod', () => {
    const s: State = {
      composition: 'fabric_plus_sheer', fabricId: 'a::b::c', sheerFabricId: 'd::e::f',
      width: '110', height: '96', heading: '3fold_pinch', split: true, lining: 'NO',
      hardware: 'h_rail', mount: 'wall',
      profileKey: 'h_rail_double_1_3_8_1_1_8_wall', colorKey: 'Old Gold', finialKey: 'ball_finial',
    }
    expect(stateFromSearch(searchFromState(s), '')).toEqual(s)
  })

  it('puts a two-layer design on a DOUBLE rod and a one-layer design on a single', () => {
    // A single rod cannot carry a drape and a sheer, so quoting one would
    // price hardware the design can't hang on.
    expect(stateFromSearch('?comp=fabric_plus_sheer&hw=wood_pole', '').profileKey)
      .toBe('wood_pole_double_2in_1_3_8_wall')
    expect(stateFromSearch('?comp=fabric_only&hw=wood_pole&prof=wood_pole_double_2in_1_3_8_wall', '').profileKey)
      .toMatch(/^wood_pole_single_/)
  })

  it('drops the sheer id the moment the design is not two layers', () => {
    expect(stateFromSearch('?comp=fabric_only&sheer=a::b::c', '').sheerFabricId).toBe('')
    expect(stateFromSearch('?comp=sheer_only&sheer=a::b::c', '').sheerFabricId).toBe('')
    expect(stateFromSearch('?comp=fabric_plus_sheer&sheer=a::b::c', '').sheerFabricId).toBe('a::b::c')
  })

  it('ignores an unknown composition', () => {
    expect(stateFromSearch('?comp=triple_layer', '').composition).toBe('fabric_only')
  })

  it('always lands on a rod AAPP will accept, with a colour', () => {
    // AAPP answers `missing_color` for a profile whose palette went unanswered,
    // so an empty colour is a silently unpriceable design.
    for (const q of ['', '?hw=wood_pole', '?hw=alu_track&mount=ceiling', '?hw=h_rail',
                     '?hw=alu_track&prof=nonsense&col=Chartreuse',
                     '?comp=fabric_plus_sheer&hw=alu_track&mount=ceiling', '?comp=fabric_plus_sheer&hw=h_rail']) {
      const s = stateFromSearch(q, '')
      const allowed = designProfiles(s.hardware, s.mount, s.composition)
      expect(allowed.map((p) => p.key), q).toContain(s.profileKey)
      expect(s.colorKey, q).toBeTruthy()
    }
  })

  it('drops a finial the chosen rod does not offer, and never invents one', () => {
    // A finial IS a price input, so a wrong one would move the number.
    const track = stateFromSearch('?hw=alu_track&fin=ball_finial', '')
    expect(track.finialKey).toBe('')
    const pole = stateFromSearch('?hw=wood_pole&fin=ball_finial', '')
    expect(pole.finialKey).toBe('ball_finial')
    const bogus = stateFromSearch('?hw=wood_pole&fin=not_a_finial', '')
    expect(bogus.finialKey).toBe('')
  })

  it('swaps the rod when the mount moves it to another AAPP family', () => {
    // Ceiling aluminium track is a different family, not a flag on the wall one.
    expect(stateFromSearch('?hw=alu_track&mount=wall', '').profileKey).toBe('aluminum_track_single_wall')
    expect(stateFromSearch('?hw=alu_track&mount=ceiling', '').profileKey).toBe('aluminum_ceiling_track_single')
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
