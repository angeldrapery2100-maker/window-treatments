import { describe, it, expect, vi, beforeEach } from 'vitest'

// buildAiSalesSummary talks to Postgres for the project, the score and recent
// HD estimates. Everything it reads is mocked here so the test can assert the
// one thing P1 added: the referral token reaches the salesperson's handoff
// note. (Without mocks the function swallows the DB error and returns '',
// which would make this test pass for the wrong reason.)
vi.mock('@/lib/db', () => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null),
}))

vi.mock('@/lib/homeProjects', () => ({
  getActiveProject: vi.fn(async () => null),
  getOrCreateActiveProject: vi.fn(async () => null),
  mergeAnonProjectIntoUser: vi.fn(async () => {}),
  listItems: vi.fn(async () => []),
  projectSummary: vi.fn(() => ({ itemCount: 0, rooms: [], pricedSubtotal: 0, unpricedCount: 0 })),
  upsertItem: vi.fn(async () => null),
  removeItem: vi.fn(async () => {}),
  logLeadEvent: vi.fn(() => {}),
}))

vi.mock('@/lib/leadScoring', () => ({
  getLeadScoreForOwner: vi.fn(async () => ({ score: 43, tier: 'warm', eventCount: 6 })),
}))

const { buildAiSalesSummary } = await import('./assistantTools')

const TOKEN = 'mock-customer-0000000000'

describe('buildAiSalesSummary — referral line', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds "Referral: <token>" when the visitor arrived through a referral link', async () => {
    const summary = await buildAiSalesSummary({ userId: null, anonId: 'anon-1', refToken: TOKEN })
    expect(summary).toContain('--- AI Sales Summary ---')
    expect(summary).toContain(`Referral: ${TOKEN}`)
  })

  it('says nothing about referrals when there is no token', async () => {
    const summary = await buildAiSalesSummary({ userId: null, anonId: 'anon-1' })
    expect(summary).toContain('--- AI Sales Summary ---')
    expect(summary).not.toContain('Referral:')
  })

  it('keeps campaign and referral attribution side by side', async () => {
    const summary = await buildAiSalesSummary({
      userId: null, anonId: 'anon-1', campaignId: 'fall-eddm', refToken: TOKEN,
    })
    expect(summary).toContain('Campaign: fall-eddm')
    expect(summary).toContain(`Referral: ${TOKEN}`)
  })
})
