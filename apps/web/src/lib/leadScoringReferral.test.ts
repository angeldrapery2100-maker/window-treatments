import { describe, it, expect } from 'vitest'
import { LEAD_SCORE_WEIGHTS, computeLeadScore, scoreTier } from './leadScoring'

describe('referral_visit lead scoring', () => {
  it('is weighted 8 points with a cap of 16', () => {
    expect(LEAD_SCORE_WEIGHTS.referral_visit).toEqual({ points: 8, cap: 16 })
  })

  it('counts one visit, and caps at two', () => {
    expect(computeLeadScore([{ type: 'referral_visit' }])).toBe(8)
    expect(computeLeadScore([{ type: 'referral_visit' }, { type: 'referral_visit' }])).toBe(16)
    // Re-opening the link from a group chat must not inflate the score.
    expect(
      computeLeadScore(Array.from({ length: 10 }, () => ({ type: 'referral_visit' })))
    ).toBe(16)
  })

  it('adds on top of other signals without disturbing them', () => {
    const events = [
      { type: 'referral_visit' },
      { type: 'campaign_visit' },
      { type: 'inquiry_submitted' },
    ]
    expect(computeLeadScore(events)).toBe(8 + 5 + 35)
    expect(scoreTier(computeLeadScore(events))).toBe('warm')
  })
})
