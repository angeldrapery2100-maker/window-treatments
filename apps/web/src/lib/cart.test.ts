import { describe, it, expect } from 'vitest'
import { mergeCarts, MAX_SWATCHES_PER_ORDER, type Cart, type CartItem } from './cart'

function item(partial: Partial<CartItem> & { productId: string }): CartItem {
  return {
    id: partial.id ?? `id-${Math.random().toString(36).slice(2)}`,
    productId: partial.productId,
    productName: partial.productName ?? 'Product',
    productType: partial.productType ?? 'drapery',
    mainImageUrl: partial.mainImageUrl ?? null,
    options: partial.options ?? [],
    quantity: partial.quantity ?? 1,
    unitPrice: partial.unitPrice ?? 100,
    addedAt: partial.addedAt ?? Date.now(),
    width: partial.width,
    height: partial.height,
    widthFraction: partial.widthFraction,
    heightFraction: partial.heightFraction,
    isSwatch: partial.isSwatch,
  }
}
const cart = (items: CartItem[], extra: Partial<Cart> = {}): Cart => ({ items, ...extra })

describe('mergeCarts (decision 1A: union, max quantity, swatch cap)', () => {
  it('unions distinct items from both carts', () => {
    const local = cart([item({ productId: 'A' })])
    const server = cart([item({ productId: 'B' })])
    const { cart: merged } = mergeCarts(local, server)
    expect(merged.items.map(i => i.productId).sort()).toEqual(['A', 'B'])
  })

  it('takes the LARGER quantity for the same product+options (not the sum)', () => {
    const opts = [{ name: 'color', displayLabel: 'Color', value: 'natural', valueLabel: 'Natural' }]
    const local = cart([item({ productId: 'A', options: opts, quantity: 2, width: 40, height: 60 })])
    const server = cart([item({ productId: 'A', options: opts, quantity: 5, width: 40, height: 60 })])
    const { cart: merged } = mergeCarts(local, server)
    expect(merged.items).toHaveLength(1)
    expect(merged.items[0].quantity).toBe(5)
  })

  it('treats different dimensions/options as different lines', () => {
    const local = cart([item({ productId: 'A', width: 40 })])
    const server = cart([item({ productId: 'A', width: 50 })])
    const { cart: merged } = mergeCarts(local, server)
    expect(merged.items).toHaveLength(2)
  })

  it('caps total swatches at MAX_SWATCHES_PER_ORDER and flags the trim', () => {
    const mk = (n: number) => Array.from({ length: n }, (_, k) =>
      item({ productId: `S${k}`, isSwatch: true, quantity: 1, unitPrice: 0 }))
    const local = cart(mk(7))
    const server = cart(mk(7).map(s => ({ ...s, productId: s.productId + '-srv' }))) // 14 distinct swatches total
    const { cart: merged, swatchesTrimmed } = mergeCarts(local, server)
    const swatchTotal = merged.items.filter(i => i.isSwatch).reduce((s, i) => s + i.quantity, 0)
    expect(swatchTotal).toBe(MAX_SWATCHES_PER_ORDER)
    expect(swatchesTrimmed).toBe(true)
  })

  it('does not trim when swatches are within the limit', () => {
    const local = cart([item({ productId: 'S1', isSwatch: true })])
    const server = cart([item({ productId: 'S2', isSwatch: true })])
    const { swatchesTrimmed } = mergeCarts(local, server)
    expect(swatchesTrimmed).toBe(false)
  })

  it('keeps the local discount in preference to the server discount', () => {
    const local = cart([item({ productId: 'A' })], { discountCode: 'LOCAL10', discountType: 'percent', discountPercent: 10 })
    const server = cart([item({ productId: 'B' })], { discountCode: 'SERVER20', discountType: 'percent', discountPercent: 20 })
    const { cart: merged } = mergeCarts(local, server)
    expect(merged.discountCode).toBe('LOCAL10')
  })

  it('falls back to the server discount when local has none', () => {
    const local = cart([item({ productId: 'A' })])
    const server = cart([item({ productId: 'B' })], { discountCode: 'SERVER20', discountType: 'percent', discountPercent: 20 })
    const { cart: merged } = mergeCarts(local, server)
    expect(merged.discountCode).toBe('SERVER20')
  })
})
