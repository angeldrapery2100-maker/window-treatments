'use client'

// Guest order tracking — no login required. Looks up by order number + email
// via POST /api/store/track (rate-limited, display-safe subset only).

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface TrackItem {
  productName: string
  productType: string | null
  width: number | null
  height: number | null
  quantity: number
}

interface TrackShipment {
  carrier: string | null
  service: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  status: string | null
  createdAt: string
}

interface TrackData {
  orderNumber: string
  status: string
  paymentStatus: string
  createdAt: string
  updatedAt: string
  items: TrackItem[]
  subtotal: number
  discountAmount: number
  shippingCost: number
  taxAmount: number
  total: number
  shippingMethod: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  shipments: TrackShipment[]
}

const STEPS = [
  { key: 'pending',       label: 'Order Placed' },
  { key: 'in_production', label: 'In Production' },
  { key: 'shipped',       label: 'Shipped' },
  { key: 'completed',     label: 'Delivered' },
]

function statusIndex(status: string): number {
  const i = STEPS.findIndex(s => s.key === status)
  return i === -1 ? 0 : i
}

function fmtDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return '' }
}

function TrackContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<TrackData | null>(null)

  // Support ticket ("Report a problem")
  const [supportOpen, setSupportOpen] = useState(false)
  const [supportCategory, setSupportCategory] = useState('damaged')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [supportDone, setSupportDone] = useState(false)
  const [supportError, setSupportError] = useState('')

  const submitSupport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (supportMessage.trim().length < 5) { setSupportError('Please describe the issue.'); return }
    setSupportSubmitting(true); setSupportError('')
    try {
      const res = await fetch('/api/store/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim(), category: supportCategory, message: supportMessage.trim() }),
      })
      const json = await res.json()
      if (json.success) { setSupportDone(true); setSupportOpen(false); setSupportMessage('') }
      else setSupportError(json.error || 'Could not submit. Please try again.')
    } catch {
      setSupportError('Something went wrong. Please try again.')
    } finally {
      setSupportSubmitting(false)
    }
  }

  // Prefill order number from ?order= (e.g. from the confirmation email link).
  useEffect(() => {
    const o = searchParams.get('order')
    if (o) setOrderNumber(o.toUpperCase())
  }, [searchParams])

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim() || !email.trim()) { setError('Please enter both your order number and email.'); return }
    setLoading(true); setError(''); setData(null)
    try {
      const res = await fetch('/api/store/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      })
      const json = await res.json()
      if (json.success) setData(json.data)
      else setError(json.error || 'Order not found.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cancelled = data?.status === 'cancelled'
  const activeIdx = data ? statusIndex(data.status) : 0

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-light tracking-wide text-gray-900 text-center mb-2">Track Your Order</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Enter your order number and the email address used at checkout.
        </p>

        {/* ── Lookup form ── */}
        <form onSubmit={lookup} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="track-order" className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Order Number</label>
              <input
                id="track-order"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="AD260607-XXXX"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-300"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="track-email" className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                id="track-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                autoComplete="email"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 mt-3" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 bg-[#3d3d3d] text-white text-sm font-medium tracking-widest uppercase rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Looking up…' : 'Track Order'}
          </button>
        </form>

        {/* ── Result ── */}
        {data && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Order</p>
                <p className="text-lg font-mono font-bold text-gray-900">{data.orderNumber}</p>
              </div>
              <p className="text-xs text-gray-400">Placed {fmtDate(data.createdAt)}</p>
            </div>

            {cancelled ? (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
                This order has been cancelled. If you have questions, contact us at admin@angel-drapery.com.
              </div>
            ) : (
              /* ── Status timeline ── */
              <div className="mb-8">
                <div className="flex items-center">
                  {STEPS.map((step, i) => (
                    <div key={step.key} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                          ${i <= activeIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {i < activeIdx ? '✓' : i + 1}
                        </div>
                        <span className={`mt-1.5 text-[11px] text-center leading-tight w-16
                          ${i <= activeIdx ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 -mt-5 ${i < activeIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tracking numbers ── */}
            {(data.shipments.length > 0 || data.trackingNumber) && (
              <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Shipment Tracking</p>
                <div className="space-y-2">
                  {data.shipments.length > 0 ? data.shipments.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                      <span className="text-gray-600">{[s.carrier, s.service].filter(Boolean).join(' · ') || 'Package'} {data.shipments.length > 1 ? `#${i + 1}` : ''}</span>
                      {s.trackingUrl ? (
                        <a href={s.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 hover:underline">{s.trackingNumber}</a>
                      ) : (
                        <span className="font-mono text-gray-900">{s.trackingNumber}</span>
                      )}
                    </div>
                  )) : (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                      <span className="text-gray-600">{data.shippingMethod || 'Package'}</span>
                      {data.trackingUrl ? (
                        <a href={data.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 hover:underline">{data.trackingNumber}</a>
                      ) : (
                        <span className="font-mono text-gray-900">{data.trackingNumber}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Items ── */}
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Items</p>
            <div className="divide-y divide-gray-100 mb-6">
              {data.items.map((item, i) => (
                <div key={i} className="py-2.5 flex justify-between text-sm">
                  <div>
                    <p className="text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-400">
                      {[item.productType ? item.productType.toUpperCase() : null,
                        item.width && item.height ? `W:${item.width}" × H:${item.height}"` : null]
                        .filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="text-gray-500">×{item.quantity}</span>
                </div>
              ))}
            </div>

            {/* ── Totals ── */}
            <div className="space-y-1 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${data.subtotal.toFixed(2)}</span></div>
              {data.discountAmount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-${data.discountAmount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between text-gray-500"><span>Shipping{data.shippingMethod ? ` (${data.shippingMethod})` : ''}</span><span>{data.shippingCost > 0 ? `$${data.shippingCost.toFixed(2)}` : 'Free'}</span></div>
              <div className="flex justify-between text-gray-500"><span>Tax</span><span>${data.taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-gray-900 text-base border-t border-gray-100 pt-2 mt-2"><span>Total</span><span>${data.total.toFixed(2)}</span></div>
            </div>

            {/* ── Report a problem ── */}
            <div className="border-t border-gray-100 mt-6 pt-5">
              {supportDone ? (
                <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg px-4 py-3">
                  Thanks — we've received your request and will be in touch by email shortly.
                </div>
              ) : supportOpen ? (
                <form onSubmit={submitSupport} className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Report a problem with this order</p>
                  <div>
                    <label htmlFor="support-cat" className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Issue type</label>
                    <select
                      id="support-cat"
                      value={supportCategory}
                      onChange={e => setSupportCategory(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                    >
                      <option value="damaged">Arrived damaged</option>
                      <option value="wrong_size">Wrong size</option>
                      <option value="defect">Defect / quality issue</option>
                      <option value="missing_item">Missing item</option>
                      <option value="wrong_item">Wrong item</option>
                      <option value="late">Late / not received</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="support-msg" className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Describe the issue</label>
                    <textarea
                      id="support-msg"
                      value={supportMessage}
                      onChange={e => setSupportMessage(e.target.value)}
                      rows={4}
                      placeholder="Tell us what's wrong and how we can help…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                    />
                  </div>
                  {supportError && <p className="text-sm text-red-600" role="alert">{supportError}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={supportSubmitting}
                      className="flex-1 py-2.5 bg-[#3d3d3d] text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50">
                      {supportSubmitting ? 'Submitting…' : 'Submit Request'}
                    </button>
                    <button type="button" onClick={() => { setSupportOpen(false); setSupportError('') }}
                      className="px-4 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setSupportOpen(true)}
                  className="text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900">
                  Report a problem with this order
                </button>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Need help? <Link href="/contact" className="underline underline-offset-2 hover:text-gray-600">Contact us</Link> or email admin@angel-drapery.com
        </p>
      </div>
    </main>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}>
      <TrackContent />
    </Suspense>
  )
}
