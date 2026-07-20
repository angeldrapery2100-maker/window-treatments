import { describe, it, expect } from 'vitest'
import {
  extractOrderNumbers,
  findUnverifiedOrderNumbers,
  orderClaimFallbackReply,
  fallbackLanguageFor,
} from './orderClaimGuard'

// P0 2026-07-20 regression: the assistant told an unverified guest
// "Found it — order AD260720-63RD (Spot Linen Natural Drapery)…" without any
// tool call. These tests pin the guard that now blocks that class of reply.

describe('extractOrderNumbers', () => {
  it('finds AD-format order numbers, case-insensitively', () => {
    expect(extractOrderNumbers('Found it — order AD260720-63RD, placed this morning')).toEqual(['AD260720-63RD'])
    expect(extractOrderNumbers('your order ad260720-63rd')).toEqual(['AD260720-63RD'])
  })
  it('ignores non-matching text', () => {
    expect(extractOrderNumbers('no orders here, AD123-XY is not one')).toEqual([])
  })
})

describe('findUnverifiedOrderNumbers', () => {
  const fabricatedReply = 'Found it — order AD260720-63RD (Spot Linen Natural Drapery), still within the 48-hour window.'

  it('flags the exact D2 incident: order number from nowhere', () => {
    const sources = ['I want to cancel the order I placed this morning. Full refund?']
    expect(findUnverifiedOrderNumbers(fabricatedReply, sources)).toEqual(['AD260720-63RD'])
  })

  it('allows an order number the customer themselves typed', () => {
    const sources = ['Please cancel order AD260720-63RD, ZIP 91780']
    expect(findUnverifiedOrderNumbers(fabricatedReply, sources)).toEqual([])
  })

  it('allows an order number a tool actually returned', () => {
    const sources = [
      'cancel my order please',
      JSON.stringify({ ok: true, orders: [{ orderNumber: 'AD260720-63RD', status: 'processing' }] }),
    ]
    expect(findUnverifiedOrderNumbers(fabricatedReply, sources)).toEqual([])
  })

  it('still flags a second, invented number alongside a verified one', () => {
    const reply = 'I found AD260720-63RD and also AD260720-ZZ99 on your account.'
    const sources = [JSON.stringify({ orders: [{ orderNumber: 'AD260720-63RD' }] })]
    expect(findUnverifiedOrderNumbers(reply, sources)).toEqual(['AD260720-ZZ99'])
  })

  it('passes replies with no order numbers at all', () => {
    expect(findUnverifiedOrderNumbers('Could you share your order number and ZIP?', [])).toEqual([])
  })
})

describe('fallback reply', () => {
  it('is a verification ask, never an order claim', () => {
    for (const lang of ['zh', 'en'] as const) {
      const text = orderClaimFallbackReply(lang)
      expect(extractOrderNumbers(text)).toEqual([])
      expect(text).toMatch(lang === 'zh' ? /订单号/ : /order number/)
    }
  })
  it('language picker: CJK → zh, otherwise en', () => {
    expect(fallbackLanguageFor('我要取消订单')).toBe('zh')
    expect(fallbackLanguageFor('cancel my order')).toBe('en')
  })
})
