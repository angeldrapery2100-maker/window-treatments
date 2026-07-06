import { describe, it, expect } from 'vitest'
import { normalizeZip, isValidOrderNumber, summarizeItems } from './assistantTools'

describe('normalizeZip', () => {
  it('keeps the first 5 digits of a ZIP+4', () => {
    expect(normalizeZip('91780-1234')).toBe('91780')
  })
  it('strips surrounding whitespace and non-digits', () => {
    expect(normalizeZip('  91780 ')).toBe('91780')
    expect(normalizeZip('CA 91780')).toBe('91780')
  })
  it('accepts numbers', () => {
    expect(normalizeZip(917801234)).toBe('91780')
  })
  it('returns empty for junk / nullish', () => {
    expect(normalizeZip('abc')).toBe('')
    expect(normalizeZip(null)).toBe('')
    expect(normalizeZip(undefined)).toBe('')
  })
})

describe('isValidOrderNumber', () => {
  it('accepts the AD######-XXXX format (case-insensitive)', () => {
    expect(isValidOrderNumber('AD250705-9ABC')).toBe(true)
    expect(isValidOrderNumber('ad250705-9abc')).toBe(true)
  })
  it('rejects malformed order numbers', () => {
    expect(isValidOrderNumber('AD25-9ABC')).toBe(false)
    expect(isValidOrderNumber('XX250705-9ABC')).toBe(false)
    expect(isValidOrderNumber('foo')).toBe(false)
    expect(isValidOrderNumber('')).toBe(false)
    expect(isValidOrderNumber(null)).toBe(false)
  })
})

describe('summarizeItems', () => {
  it('summarizes quantity × product name', () => {
    expect(summarizeItems([
      { quantity: 2, productName: 'Custom Drapery' },
      { quantity: 1, productName: 'Roller Shade' },
    ])).toBe('2× Custom Drapery, 1× Roller Shade')
  })
  it('defaults quantity to 1 and falls back to productType', () => {
    expect(summarizeItems([{ productType: 'shade' }])).toBe('1× shade')
  })
  it('returns a dash for empty / non-array', () => {
    expect(summarizeItems([])).toBe('—')
    expect(summarizeItems(null)).toBe('—')
  })
})
