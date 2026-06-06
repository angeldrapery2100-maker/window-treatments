'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  getCart, saveCart, removeCartItem, updateCartItemQuantity,
  type Cart, type CartItem
} from '@/lib/cart'

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [] })
  const [loading, setLoading] = useState(true)
  const [discountInput, setDiscountInput] = useState('')
  const [discountError, setDiscountError] = useState('')
  const [discountLoading, setDiscountLoading] = useState(false)
  const [removeAnim, setRemoveAnim] = useState<string | null>(null)

  useEffect(() => {
    setCart(getCart())
    setLoading(false)
  }, [])

  const refresh = () => setCart(getCart())

  const handleQuantityChange = (itemId: string, qty: number) => {
    updateCartItemQuantity(itemId, qty)
    refresh()
  }

  const handleRemove = (itemId: string) => {
    setRemoveAnim(itemId)
    setTimeout(() => {
      removeCartItem(itemId)
      refresh()
      setRemoveAnim(null)
    }, 300)
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const hasDiscount = !!cart.discountCode && (cart.discountPercent ?? 0) > 0
  const discountType = cart.discountType || 'percent'
  const discountAmount = hasDiscount
    ? discountType === 'percent'
      ? Math.round(subtotal * cart.discountPercent! / 100)
      : Math.round(cart.discountPercent!)
    : 0
  const total = Math.max(0, subtotal - discountAmount)
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  const applyDiscount = async () => {
    if (!discountInput.trim()) return
    setDiscountLoading(true)
    setDiscountError('')
    try {
      const res = await fetch('/api/store/validate-discount', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountInput.trim() })
      })
      const data = await res.json()
      if (data.success) {
        const d = data.data
        if (d.min_order && subtotal < d.min_order) {
          setDiscountError(`Minimum order $${d.min_order} required`)
          return
        }
        const c = getCart()
        c.discountCode = d.code
        c.discountType = d.discount_type
        c.discountPercent = d.discount_value
        saveCart(c)
        refresh()
        setDiscountInput('')
        setDiscountError('')
      } else {
        setDiscountError(data.error || 'Invalid code')
      }
    } catch { setDiscountError('Failed to validate') }
    finally { setDiscountLoading(false) }
  }

  const removeDiscountCode = () => {
    const c = getCart()
    delete c.discountCode
    delete c.discountType
    delete c.discountPercent
    saveCart(c)
    refresh()
  }

  const formatDimensions = (item: CartItem) => {
    const parts: string[] = []
    if (item.width) parts.push(`W: ${item.width}"`)
    if (item.height) {
      let h = `H: ${item.height}`
      if (item.heightFraction && item.heightFraction !== '0') h += ` ${item.heightFraction}`
      parts.push(h + '"')
    }
    return parts.join('  ×  ')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => window.history.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div>
                <h1 className="text-2xl font-light tracking-wide text-gray-900">Shopping Cart</h1>
                <p className="text-sm text-gray-400 mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            <Link href="/store" className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4">Continue Shopping</Link>
          </div>
        </div>
      </div>

      {cart.items.length === 0 ? (
        /* Empty Cart */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="text-6xl mb-6 opacity-20">🛒</div>
          <h2 className="text-xl font-light text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray-400 mb-8">Browse our products and add items to get started.</p>
          <Link href="/store" className="inline-block px-8 py-3 bg-[#3d3d3d] text-white text-sm font-medium tracking-wider uppercase hover:bg-gray-700 transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, idx) => (
                <div key={item.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${removeAnim === item.id ? 'opacity-0 -translate-x-8 scale-95' : ''}`}>
                  <div className="flex items-center">
                    {/* Index Number */}
                    <div className="flex-shrink-0 w-10 flex items-center justify-center bg-gray-50 text-gray-400 font-medium text-sm border-r border-gray-100 self-stretch">
                      {idx + 1}
                    </div>

                    {/* Product Image - 1:1 rounded */}
                    <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 m-3">
                      {item.mainImageUrl ? (
                        <Link href={`/store/${item.productId}`} className="relative block w-full h-full">
                          <Image src={item.mainImageUrl} alt={item.productName} fill sizes="(max-width: 640px) 112px, 144px" className="object-cover rounded-lg hover:opacity-90 transition-opacity" />
                        </Link>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs bg-gray-100 rounded-lg">No Image</div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <Link href={`/store/${item.productId}`} className="text-base font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
                            {item.productName}
                          </Link>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-gray-100 text-gray-500">
                            {item.productType}
                          </span>
                        </div>
                        <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1" title="Remove">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      {/* Specs */}
                      <div className="mt-2 space-y-1">
                        {(item.width || item.height) && (
                          <p className="text-xs text-gray-500">{formatDimensions(item)}</p>
                        )}
                        {item.options.length > 0 && (
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                            {item.options.map((opt, i) => (
                              <span key={i} className="text-xs text-gray-500">
                                <span className="text-gray-400">{opt.displayLabel}:</span> {opt.valueLabel}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quantity + Price */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 uppercase tracking-wider">Qty</span>
                          <div className="flex items-center border border-gray-200 rounded">
                            <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 text-sm">−</button>
                            <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                            <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 text-sm">+</button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">${(item.unitPrice * item.quantity).toLocaleString()}</p>
                          {item.quantity > 1 && (
                            <p className="text-[11px] text-gray-400">${item.unitPrice.toLocaleString()} each</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">${subtotal.toLocaleString()}</span>
                  </div>

                  {/* Discount Code */}
                  {hasDiscount ? (
                    <div className="flex justify-between items-center text-green-600">
                      <div className="flex items-center gap-2">
                        <span>Discount ({cart.discountCode} {discountType === 'percent' ? `${cart.discountPercent}%` : `${cart.discountPercent}`})</span>
                        <button onClick={removeDiscountCode} className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <span className="font-medium">-${discountAmount.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <div className="flex gap-2">
                        <input
                          type="text" value={discountInput}
                          onChange={e => { setDiscountInput(e.target.value.toUpperCase()); setDiscountError('') }}
                          onKeyDown={e => e.key === 'Enter' && applyDiscount()}
                          placeholder="Discount code"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 placeholder-gray-300 uppercase tracking-wider"
                        />
                        <button onClick={applyDiscount} disabled={discountLoading || !discountInput.trim()}
                          className="px-4 py-2 text-xs font-medium uppercase tracking-wider border border-gray-900 text-gray-900 rounded hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                          {discountLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {discountError && <p className="text-xs text-red-500 mt-1.5">{discountError}</p>}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Link href="/store/checkout" className="block w-full mt-6 py-3.5 bg-[#3d3d3d] text-white text-sm font-medium tracking-widest uppercase hover:bg-gray-700 transition-colors rounded text-center">
                  Proceed to Checkout
                </Link>

                <Link href="/store" className="block text-center mt-3 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-4">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
