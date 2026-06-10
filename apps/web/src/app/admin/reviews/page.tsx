'use client'

import { useState, useEffect, useCallback } from 'react'

interface Review {
  id: string
  product_id: string
  product_name: string | null
  order_number: string
  customer_name: string
  customer_email: string
  rating: number
  title: string
  body: string
  status: string
  created_at: string
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-green-50 text-green-600 border-green-200',
  rejected: 'bg-gray-100 text-gray-500 border-gray-200',
}
const STATUSES = ['pending', 'approved', 'rejected']

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= value ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.31 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </span>
  )
}

function fmt(s: string) {
  try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return s }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchReviews = useCallback(async (f: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews${f !== 'all' ? `?status=${f}` : ''}`)
      const data = await res.json()
      if (data.success) { setReviews(data.data.reviews || []); setPendingCount(data.data.pendingCount || 0) }
    } catch { /* noop */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchReviews(filter) }, [filter, fetchReviews])

  const flash = (m: string) => { setMessage(m); setTimeout(() => setMessage(''), 2500) }

  const moderate = async (id: string, status: string) => {
    setBusyId(id)
    try {
      const res = await fetch('/api/admin/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
      const d = await res.json()
      if (d.success) { flash('Updated'); fetchReviews(filter) } else flash(d.error || 'Failed')
    } catch { flash('Failed') } finally { setBusyId(null) }
  }

  const remove = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.success) { flash('Deleted'); fetchReviews(filter) } else flash(d.error || 'Failed')
    } catch { flash('Failed') } finally { setBusyId(null) }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">{reviews.length} shown{pendingCount > 0 ? ` · ${pendingCount} pending` : ''}</p>
      </div>

      {message && <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{message}</div>}

      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize ${filter === s ? 'bg-[#3d3d3d] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s}{s === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-gray-400 text-sm">No reviews.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Stars value={r.rating} />
                    <span className={`px-2 py-0.5 rounded-full text-[11px] border ${STATUS_STYLE[r.status] || STATUS_STYLE.rejected}`}>{r.status}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1.5">{r.product_name || 'Product'} {r.title ? <span className="text-gray-500 font-normal">— {r.title}</span> : null}</p>
                  {r.body && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{r.body}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    {r.customer_name || 'Anonymous'} · <span className="font-mono">{r.order_number}</span> · {fmt(r.created_at)}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {r.status !== 'approved' && (
                    <button onClick={() => moderate(r.id, 'approved')} disabled={busyId === r.id}
                      className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50">Approve</button>
                  )}
                  {r.status !== 'rejected' && (
                    <button onClick={() => moderate(r.id, 'rejected')} disabled={busyId === r.id}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">Reject</button>
                  )}
                  <button onClick={() => remove(r.id)} disabled={busyId === r.id}
                    className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
