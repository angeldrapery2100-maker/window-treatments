import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Booking-link SMS delivery (2026-08-22). The phone channel lost three
// customers in one week to links that were promised and never sent; these
// tests pin the website's two defences: the lead event records whether the
// text landed, and the assistant is explicitly told not to claim a text that
// did not go out.

vi.mock('@/lib/db', () => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null),
}))

const logLeadEvent = vi.fn((_event?: any) => {})
vi.mock('@/lib/homeProjects', () => ({
  getActiveProject: vi.fn(async () => null),
  getOrCreateActiveProject: vi.fn(async () => null),
  mergeAnonProjectIntoUser: vi.fn(async () => {}),
  listItems: vi.fn(async () => []),
  projectSummary: vi.fn(() => ({ itemCount: 0, rooms: [], pricedSubtotal: 0, unpricedCount: 0 })),
  upsertItem: vi.fn(async () => null),
  removeItem: vi.fn(async () => {}),
  logLeadEvent: (event: any) => logLeadEvent(event),
}))

vi.mock('@/lib/leadScoring', () => ({
  getLeadScoreForOwner: vi.fn(async () => ({ score: 0, tier: 'cool', eventCount: 0 })),
}))

const { executeAssistantTool } = await import('./assistantTools')

// A real-looking number (555-01xx is blocked upstream by design) that the
// customer "typed", so the W6 contact-provenance guard lets it through.
const PHONE = '626-451-9841'
const TYPED = [`my number is ${PHONE}`]

function stubBackend(extra: Record<string, unknown>) {
  vi.stubGlobal('fetch', async () => ({
    ok: true,
    json: async () => ({ ok: true, link: 'https://angel-drapery.com/appt.html?t=abc', leadId: 'L1', ...extra }),
    text: async () => '',
  }) as any)
}

const submit = (input: Record<string, unknown>) =>
  executeAssistantTool('submit_website_inquiry', { name: 'Real Customer', message: 'wants a measure', ...input }, null, 'anon-1', null, TYPED)

describe('booking-link SMS delivery', () => {
  beforeEach(() => {
    logLeadEvent.mockClear()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('tells the assistant NOT to claim a text when the backend did not send one', async () => {
    stubBackend({ smsSent: false })
    const r: any = await submit({ phone: PHONE, sms_consent: true })
    expect(r.ok).toBe(true)
    expect(r.sms_delivered).toBe(false)
    expect(r.must_say).toContain('did NOT go out')
    // The customer still has a next step — the link itself survives.
    expect(r.link).toContain('appt.html')
  })

  it('warns in the server log so a silent failure is greppable', async () => {
    stubBackend({ smsSent: false })
    await submit({ phone: PHONE, sms_consent: true })
    const warned = (console.warn as any).mock.calls.map((c: unknown[]) => c.join(' ')).join('\n')
    expect(warned).toContain('booking link SMS NOT delivered')
    // The source tells you WHICH channel failed — chat vs. consultation form.
    expect(warned).toContain('website_chat')
  })

  it('stays quiet and adds no instruction when the text did go out', async () => {
    stubBackend({ smsSent: true })
    const r: any = await submit({ phone: PHONE, sms_consent: true })
    expect(r.must_say).toBeUndefined()
    expect(r.smsSent).toBe(true)
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('does not treat "no text requested" as a delivery failure', async () => {
    stubBackend({ smsSent: false })
    const r: any = await submit({ phone: PHONE, sms_consent: false })
    expect(r.must_say).toBeUndefined()
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('records link_attempted / link_delivered on the lead event', async () => {
    stubBackend({ smsSent: false })
    await submit({ phone: PHONE, sms_consent: true })
    const meta: any = logLeadEvent.mock.calls[0]?.[0]
    expect(meta.type).toBe('inquiry_submitted')
    expect(meta.meta.link_attempted).toBe(true)
    expect(meta.meta.link_delivered).toBe(false)

    logLeadEvent.mockClear()
    stubBackend({ smsSent: true })
    await submit({ phone: PHONE, sms_consent: true })
    const ok: any = logLeadEvent.mock.calls[0]?.[0]
    expect(ok.meta.link_delivered).toBe(true)
  })
})
