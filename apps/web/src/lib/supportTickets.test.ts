import { describe, it, expect } from 'vitest'
import { isWithinChangeWindow, ORDER_CHANGE_WINDOW_HOURS } from './supportTickets'

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000)

describe('isWithinChangeWindow (48h order change/cancel window)', () => {
  it('is true for an order placed just now', () => {
    expect(isWithinChangeWindow(new Date())).toBe(true)
  })
  it('is true just inside the window', () => {
    expect(isWithinChangeWindow(hoursAgo(ORDER_CHANGE_WINDOW_HOURS - 1))).toBe(true)
  })
  it('is false just past the window', () => {
    expect(isWithinChangeWindow(hoursAgo(ORDER_CHANGE_WINDOW_HOURS + 1))).toBe(false)
  })
  it('is false for a future timestamp (clock skew)', () => {
    expect(isWithinChangeWindow(new Date(Date.now() + 10 * 60 * 1000))).toBe(false)
  })
  it('is false for an unparseable date', () => {
    expect(isWithinChangeWindow('not-a-date')).toBe(false)
  })
  it('accepts ISO strings and epoch millis', () => {
    expect(isWithinChangeWindow(hoursAgo(1).toISOString())).toBe(true)
    expect(isWithinChangeWindow(hoursAgo(1).getTime())).toBe(true)
  })
})
