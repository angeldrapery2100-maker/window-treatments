import { describe, it, expect } from 'vitest'
import { submitWebsiteInquiry } from './aappIntake'

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
