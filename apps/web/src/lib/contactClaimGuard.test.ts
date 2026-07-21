import { describe, it, expect } from 'vitest'
import {
  extractPhones,
  extractEmails,
  isReservedTestPhone,
  isReservedTestEmail,
  phoneProvidedInSources,
  emailProvidedInSources,
  findUnverifiedContacts,
  contactClaimFallbackReply,
  scrubContactsFromText,
} from './contactClaimGuard'

// W6 2026-07-21 regressions: F6 (assistant ready to book with a phone number
// pulled from browser-persisted data the customer never typed) and P0-5
// (fabricated test identities submitted into the real lead system).

describe('extraction & normalization', () => {
  it('matches common phone formats to one normalized value', () => {
    for (const s of ['323-555-0148', '(323) 555-0148', '323.555.0148', '+1 323 555 0148', '3235550148']) {
      expect(extractPhones(s)).toEqual(['3235550148'])
    }
  })
  it('ignores dates, dimensions, and order-number fragments', () => {
    expect(extractPhones('ordered 2026-07-21, window 60 x 84, order AD260720-63RD')).toEqual([])
  })
  it('extracts emails case-insensitively', () => {
    expect(extractEmails('Reach me at Test-F@Example.com!')).toEqual(['test-f@example.com'])
  })
})

describe('reserved test identities (P0-5)', () => {
  it('flags NANP fictional 555-01xx numbers', () => {
    expect(isReservedTestPhone('323-555-0148')).toBe(true)
    expect(isReservedTestPhone('555-0100')).toBe(true)
    expect(isReservedTestPhone('+1 (212) 555-0199')).toBe(true)
  })
  it('does not flag real-shaped numbers', () => {
    expect(isReservedTestPhone('626-451-9841')).toBe(false)
    expect(isReservedTestPhone('323-556-0148')).toBe(false)
  })
  it('flags reserved email domains', () => {
    expect(isReservedTestEmail('test-f@example.com')).toBe(true)
    expect(isReservedTestEmail('a@sub.example.org')).toBe(true)
    expect(isReservedTestEmail('bob@test.com')).toBe(true)
    expect(isReservedTestEmail('x@foo.invalid')).toBe(true)
  })
  it('does not flag real domains', () => {
    expect(isReservedTestEmail('jane@gmail.com')).toBe(false)
    expect(isReservedTestEmail('info@angel-drapery.com')).toBe(false)
  })
})

describe('provenance', () => {
  it('accepts a phone the customer typed, in any format', () => {
    expect(phoneProvidedInSources('(626) 234-5678', ['my number is 626.234.5678 thanks'])).toBe(true)
  })
  it('rejects a phone that appears nowhere in this conversation', () => {
    expect(phoneProvidedInSources('626-234-5678', ['I want to book a measure for 3 bedrooms'])).toBe(false)
  })
  it('email provenance is substring, case-insensitive', () => {
    expect(emailProvidedInSources('Jane@Gmail.com', ['email: jane@gmail.com'])).toBe(true)
    expect(emailProvidedInSources('jane@gmail.com', ['no email here'])).toBe(false)
  })
})

describe('reply gate — findUnverifiedContacts', () => {
  it('F6 regression: blocks a phone from saved data, not this conversation', () => {
    const reply = "Since I already have your number 323-555-0148 from earlier, want me to book you in?"
    expect(findUnverifiedContacts(reply, ['Someone said you do free in-home consultations?'])).toEqual(['3235550148'])
  })
  it('allows the company phone and customer-typed numbers', () => {
    const reply = 'You can call us at 626-451-9841, or we can text 626-234-5678 as you shared.'
    expect(findUnverifiedContacts(reply, ['my cell is 6262345678'])).toEqual([])
  })
  it('allows contacts echoed from tool results', () => {
    const reply = 'I have your booking under 626-234-5678.'
    const sources = [JSON.stringify({ ok: true, phone: '626-234-5678' })]
    expect(findUnverifiedContacts(reply, sources)).toEqual([])
  })
  it('fallback replies contain no contact leak and match language', () => {
    expect(contactClaimFallbackReply('zh')).toContain('626-451-9841')
    expect(findUnverifiedContacts(contactClaimFallbackReply('en'), [])).toEqual([])
  })
})

describe('scrubContactsFromText', () => {
  it('removes phones and emails but keeps sizes and dates', () => {
    const s = scrubContactsFromText('Jamie 323-555-0148 jamie@example.com wants 60x84, deliver 2026-07-21')
    expect(s).not.toContain('323')
    expect(s).not.toContain('@')
    expect(s).toContain('60x84')
    expect(s).toContain('2026-07-21')
  })
})
