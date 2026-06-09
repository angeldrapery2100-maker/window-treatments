'use client'

// Customer review submission. Verified by order number + email (same model as
// order tracking). Reviews are held for moderation before appearing.

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface ReviewableProduct { productId: string; name: string; reviewed: boolean }

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)} aria-label={`${i} star${i > 1 ? 's' : ''}`}
          className="p-0.5">
          <svg className={`w-7 h-7 ${i <= (hover || value) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.31 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

function ReviewContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [products, setProducts] = useState<ReviewableProduct[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Selected product + form
  const [productId, setProductId] = useState('')
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [doneFor, setDoneFor] = useState<string[]>([])

  useEffect(() => {
    const o = searchParams.get('order'); if (o) setOrderNumber(o.toUpperCase())
  }, [searchParams])

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim() || !email.trim()) { setError('Please enter both your order number and email.'); return }
    setLoading(true); setError(''); setProducts(null)
    try {
      const res = await fetch(`/api/store/reviews?order=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`)
      const json = await res.json()
      if (json.success) {
        setProducts(json.data.products)
        const first = json.data.products.find((p: ReviewableProduct) => !p.reviewed)
        if (first) setProductId(first.productId)
      } else setError(json.error || 'Order not found.')
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1) { setError('Please choose a star rating.'); return }
    if (bodyText.trim().length < 3) { setError('Please write a short review.'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/store/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim(), productId, rating, title: title.trim(), body: bodyText.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        setDoneFor(prev => [...prev, productId])
        setProducts(prev => prev ? prev.map(p => p.productId === productId ? { ...p, reviewed: true } : p) : prev)
        setRating(0); setTitle(''); setBodyText('')
        const next = products?.find(p => p.productId !== productId && !p.reviewed && !doneFor.includes(p.productId))
        setProductId(next?.productId || '')
      } else setError(json.error || 'Could not submit. Please try again.')
    } catch { setError('Something went wrong. Please try again.') }
    finally { setSubmitting(false) }
  }

  const remaining = products?.filter(p => !p.reviewed) || []

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-light tracking-wide text-gray-900 text-center mb-2">Write a Review</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Share your experience to help other customers.</p>

        {!products && (
          <form onSubmit={lookup} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="rv-order" className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Order Number</label>
                <input id="rv-order" value={orderNumber} onChange={e => setOrderNumber(e.target.value.toUpperCase())} placeholder="AD260607-XXXX"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-300" autoComplete="off" />
              </div>
              <div>
                <label htmlFor="rv-email" className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input id="rv-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" autoComplete="email" />
              </div>
            </div>
            {error && <p className="text-sm text-red-600 mt-3" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="mt-4 w-full py-3 bg-[#3d3d3d] text-white text-sm font-medium tracking-widest uppercase rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {loading ? 'Looking up…' : 'Continue'}
            </button>
          </form>
        )}

        {products && remaining.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-gray-700">Thank you! You've reviewed every item in this order.</p>
            <p className="text-xs text-gray-400 mt-2">Reviews are published after a quick check by our team.</p>
            <Link href="/store" className="inline-block mt-5 text-sm text-gray-600 underline hover:text-gray-900">Back to store</Link>
          </div>
        )}

        {products && remaining.length > 0 && (
          <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            {doneFor.length > 0 && (
              <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg px-4 py-2.5">
                Review submitted — thank you! {remaining.length} item{remaining.length === 1 ? '' : 's'} left.
              </div>
            )}
            <div>
              <label htmlFor="rv-product" className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Product</label>
              <select id="rv-product" value={productId} onChange={e => setProductId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300">
                {remaining.map(p => <option key={p.productId} value={p.productId}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Rating</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <label htmlFor="rv-title" className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Title (optional)</label>
              <input id="rv-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={160} placeholder="Sum it up in a few words"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
            </div>
            <div>
              <label htmlFor="rv-body" className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Your Review</label>
              <textarea id="rv-body" value={bodyText} onChange={e => setBodyText(e.target.value)} rows={4} maxLength={4000} placeholder="How are the drapes? Fit, quality, color, service…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300" />
            </div>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full py-3 bg-[#3d3d3d] text-white text-sm font-medium tracking-widest uppercase rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}>
      <ReviewContent />
    </Suspense>
  )
}
