import { describe, it, expect } from 'vitest'
import { carrierTrackingUrl, resolveTrackingUrl } from './carrierTracking'

describe('carrierTrackingUrl', () => {
  it('builds UPS / USPS / FedEx / DHL links from the number', () => {
    expect(carrierTrackingUrl('UPS', '1Z999')).toBe('https://www.ups.com/track?tracknum=1Z999')
    expect(carrierTrackingUrl('USPS', '9400111')).toBe('https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111')
    expect(carrierTrackingUrl('FedEx', '7712')).toBe('https://www.fedex.com/fedextrack/?trknbr=7712')
    expect(carrierTrackingUrl('DHL Express', 'JD01')).toContain('tracking-id=JD01')
  })
  it('is case-insensitive and encodes the number', () => {
    expect(carrierTrackingUrl('ups', 'TEST-63RD-001')).toBe('https://www.ups.com/track?tracknum=TEST-63RD-001')
  })
  it('returns empty for unknown carrier or missing number', () => {
    expect(carrierTrackingUrl('SomeLocalCourier', '123')).toBe('')
    expect(carrierTrackingUrl('UPS', '')).toBe('')
    expect(carrierTrackingUrl('', '123')).toBe('')
  })
})

describe('resolveTrackingUrl', () => {
  it('prefers the carrier-provided (Shippo) url', () => {
    expect(resolveTrackingUrl('https://carrier/track/x', 'UPS', '1Z999')).toBe('https://carrier/track/x')
  })
  it('derives from carrier+number when no url (manual shipment)', () => {
    expect(resolveTrackingUrl(null, 'UPS', 'TEST-63RD-001')).toBe('https://www.ups.com/track?tracknum=TEST-63RD-001')
  })
  it('empty when nothing usable', () => {
    expect(resolveTrackingUrl(null, 'Local', '123')).toBe('')
  })
})
