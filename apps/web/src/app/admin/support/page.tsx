'use client'

import { useState, useEffect, useCallback } from 'react'

interface Ticket {
  id: string
  order_id: string | null
  order_number: string
  customer_name: string
  customer_email: string
  category: string
  message: string
  status: string
  admin_notes: string
  created_at: string
  updated_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  wrong_size: 'Wrong size', damaged: 'Arrived damaged', defect: 'Defect / quality',
  missing_item: 'Missing item', wrong_item: 'Wrong item', late: 'Late / not received', other: 'Other',
}

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-red-50 text-red-600 border-red-200',
  in_progress: 'bg-amber-50 text-amber-600 border-amber-200',
  resolved: 'bg-green-50 text-green-600 border-green-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
}

const STATUSES = ['open', 'in_progress', 'resolved', 'closed']

function fmt(s: string) {
  try { return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }
  catch { return s }
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchTickets = useCallback(async (f: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/support${f !== 'all' ? `?status=${f}` : ''}`)
      const data = await res.json()
      if (data.success) { setTickets(data.data.tickets || []); setOpenCount(data.data.openCount || 0) }
    } catch { /* noop */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTickets(filter) }, [filter, fetchTickets])

  const flash = (m: string) => { setMessage(m); setTimeout(() => setMessage(''), 3000) }

  const update = async (id: string, patch: { status?: string; admin_notes?: string }) => {
    setSavingId(id)
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      const data = await res.json()
      if (data.success) { flash('Saved'); fetchTickets(filter) }
      else flash(data.error || 'Save failed')
    } catch { flash('Save failed') }
    finally { setSavingId(null) }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Support</h1>
        <p className="text-sm text-gray-500 mt-1">{tickets.length} tickets{openCount > 0 ? ` · ${openCount} open` : ''}</p>
      </div>

      {message && <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{message}</div>}

      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize ${filter === s ? 'bg-[#3d3d3d] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-gray-400 text-sm">No support tickets.</div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-gray-900 text-sm">{t.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] border ${STATUS_STYLE[t.status] || STATUS_STYLE.closed}`}>{t.status.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-400">{CATEGORY_LABELS[t.category] || t.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{t.customer_name || t.customer_email} · {fmt(t.created_at)}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedId === t.id ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>

              {expandedId === t.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                    <p className="text-sm text-gray-700">{t.customer_name || '—'} · <a href={`mailto:${t.customer_email}`} className="text-blue-600 hover:underline">{t.customer_email}</a></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Message</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{t.message}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => update(t.id, { status: s })} disabled={savingId === t.id || t.status === s}
                          className={`px-3 py-1.5 rounded-lg text-xs capitalize border ${t.status === s ? STATUS_STYLE[s] : 'border-gray-200 text-gray-500 hover:bg-gray-50'} disabled:opacity-60`}>
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Internal notes</p>
                    <textarea
                      defaultValue={t.admin_notes}
                      onChange={e => setNotesDraft(d => ({ ...d, [t.id]: e.target.value }))}
                      rows={2}
                      placeholder="Notes for your team…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => update(t.id, { admin_notes: notesDraft[t.id] ?? t.admin_notes })} disabled={savingId === t.id}
                        className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-black disabled:opacity-50">
                        Save Notes
                      </button>
                      {t.order_id && (
                        <a href={`/admin/orders?search=${t.order_number}`} className="text-xs text-gray-500 underline hover:text-gray-700">View order</a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
