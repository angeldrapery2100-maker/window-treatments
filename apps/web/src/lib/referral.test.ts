import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getReferralFromRequest, isValidReferralToken, TOKEN_RE,
  fetchReferralPortal, _clearReferralCache,
} from './referral'
import { MOCK_CUSTOMER_TOKEN, MOCK_AGENT_TOKEN, MOCK_CAMPAIGN_TOKEN } from './referral.mock'

const req = (cookie: string) => new Request('https://angel-drapery.com/', { headers: { cookie } })

describe('isValidReferralToken', () => {
  it('accepts URL-safe tokens of 16–32 chars', () => {
    expect(isValidReferralToken('abcdefghijklmnop')).toBe(true)
    expect(isValidReferralToken('A-b_c0123456789012345678901234')).toBe(true)
  })
  it('rejects short, long and non-URL-safe tokens', () => {
    expect(isValidReferralToken('short')).toBe(false)
    expect(isValidReferralToken('x'.repeat(33))).toBe(false)
    expect(isValidReferralToken('has spaces here!')).toBe(false)
    expect(isValidReferralToken('semi;colon;token;')).toBe(false)
    expect(isValidReferralToken(null)).toBe(false)
  })
  it('accepts every mock fixture token (they must be usable end to end)', () => {
    for (const t of [MOCK_CUSTOMER_TOKEN, MOCK_AGENT_TOKEN, MOCK_CAMPAIGN_TOKEN]) {
      expect(TOKEN_RE.test(t)).toBe(true)
    }
  })
})

describe('getReferralFromRequest', () => {
  it('reads a valid ad_ref cookie', () => {
    expect(getReferralFromRequest(req(`ad_ref=${MOCK_CUSTOMER_TOKEN}`))).toBe(MOCK_CUSTOMER_TOKEN)
  })
  it('returns null when there is no cookie at all', () => {
    expect(getReferralFromRequest(new Request('https://angel-drapery.com/'))).toBeNull()
  })
  it('rejects a malformed value instead of passing it through', () => {
    expect(getReferralFromRequest(req('ad_ref=nope'))).toBeNull()
    expect(getReferralFromRequest(req('ad_ref=' + 'x'.repeat(40)))).toBeNull()
    // An injected value must not become a token just because it starts well.
    expect(getReferralFromRequest(req('ad_ref=abcdefghijklmnop$evil'))).toBeNull()
    expect(getReferralFromRequest(req('ad_ref='))).toBeNull()
  })
  it('coexists with ad_campaign and ad_anon in any order', () => {
    const cookie = `ad_anon=abc123; ad_campaign=fall-eddm; ad_ref=${MOCK_AGENT_TOKEN}`
    expect(getReferralFromRequest(req(cookie))).toBe(MOCK_AGENT_TOKEN)
    const reversed = `ad_ref=${MOCK_AGENT_TOKEN}; ad_campaign=fall-eddm`
    expect(getReferralFromRequest(req(reversed))).toBe(MOCK_AGENT_TOKEN)
  })
  it('does not match a cookie whose name merely ends in ad_ref', () => {
    expect(getReferralFromRequest(req(`not_ad_ref=${MOCK_CUSTOMER_TOKEN}`))).toBeNull()
  })
})

describe('fetchReferralPortal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    _clearReferralCache()
  })

  const stub = (payload: Record<string, unknown>) =>
    vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => payload }) as any)

  it('returns null for a deactivated referrer — a forwarded portal link must go dead', async () => {
    stub({ ok: true, type: 'customer', displayName: 'Jenny L.', active: false })
    expect(await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)).toBeNull()
  })

  it('returns the portal for an active referrer', async () => {
    stub({ ok: true, type: 'customer', displayName: 'Jenny L.', discountPct: 5, active: true })
    const portal = await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)
    expect(portal?.type).toBe('customer')
    expect(portal?.discountPct).toBe(5)
    // shareUrl is synthesised when the backend omits it.
    expect(portal?.shareUrl).toContain(`/r/${MOCK_CUSTOMER_TOKEN}`)
  })

  it('never calls the backend with a malformed token', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    expect(await fetchReferralPortal('nope')).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
