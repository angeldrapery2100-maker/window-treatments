import { describe, it, expect, vi, afterEach } from 'vitest'
import { submitWebsiteInquiry } from './aappIntake'

const VALID_TOKEN = 'mock-customer-0000000000'

/** Capture the outgoing websiteInquiry body without touching the network. */
function stubIntake(response: Record<string, unknown> = { ok: true }) {
  const calls: any[] = []
  vi.stubGlobal('fetch', async (_url: string, init: any) => {
    calls.push(JSON.parse(init.body))
    return {
      ok: true,
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as any
  })
  return calls
}

describe('submitWebsiteInquiry input guard', () => {
  it('returns need_contact (without hitting the network) when there is no contact info', async () => {
    const r = await submitWebsiteInquiry({ message: 'just browsing' })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('need_contact')
  })

  it('also guards when name/phone/email are blank strings', async () => {
    const r = await submitWebsiteInquiry({ name: '  ', phone: '', email: '' })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('need_contact')
  })
})

describe('submitWebsiteInquiry referral attribution', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends referral {token,page} when the token is well formed', async () => {
    const calls = stubIntake()
    const r = await submitWebsiteInquiry({
      name: 'Real Customer',
      phone: '626-451-9841',
      referral: { token: VALID_TOKEN, page: 'assistant' },
    })
    expect(r.ok).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0].referral).toEqual({ token: VALID_TOKEN, page: 'assistant' })
  })

  it('drops a malformed token rather than failing the lead', async () => {
    const calls = stubIntake()
    const r = await submitWebsiteInquiry({
      name: 'Real Customer',
      phone: '626-451-9841',
      referral: { token: 'not-a-token' },
    })
    expect(r.ok).toBe(true)
    expect(calls[0].referral).toBeUndefined()
  })

  it('omits referral entirely when none was supplied', async () => {
    const calls = stubIntake()
    await submitWebsiteInquiry({ name: 'Real Customer', phone: '626-451-9841' })
    expect(calls[0].referral).toBeUndefined()
  })

  it('passes the backend referral echo back to the caller', async () => {
    stubIntake({ ok: true, referral: { applied: true, type: 'customer', label: 'Jenny L.' } })
    const r = await submitWebsiteInquiry({
      name: 'Real Customer',
      phone: '626-451-9841',
      referral: { token: VALID_TOKEN },
    })
    expect(r.referral).toEqual({ applied: true, type: 'customer', label: 'Jenny L.' })
  })
})
