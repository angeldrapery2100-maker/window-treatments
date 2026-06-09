'use client'

import { useState, useEffect } from 'react'

interface Review { id: string; name: string; rating: number; title: string; body: string; createdAt: string }

function Stars({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(value) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.31 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </span>
  )
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [average, setAverage] = useState(0)
  const [count, setCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/store/reviews?productId=${productId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) { setReviews(d.data.reviews || []); setAverage(d.data.average || 0); setCount(d.data.count || 0) }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [productId])

  // Hide the whole section until we know there's at least one review.
  if (!loaded || count === 0) return null

  return (
    <div className="mt-12 border-t-2 border-black pt-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-light tracking-wide text-gray-900">Customer Reviews</h2>
        <Stars value={average} />
        <span className="text-sm text-gray-500">{average.toFixed(1)} · {count} review{count === 1 ? '' : 's'}</span>
      </div>
      <div className="space-y-5">
        {reviews.map(r => (
          <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0">
            <div className="flex items-center gap-2 mb-1">
              <Stars value={r.rating} />
              <span className="text-sm font-medium text-gray-800">{r.name}</span>
              <span className="text-xs text-gray-400">· {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            {r.title && <p className="text-sm font-medium text-gray-900">{r.title}</p>}
            {r.body && <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{r.body}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
