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
  source?: string                    // 'web_form' | 'ai_assistant'
  ticket_type?: string               // 'after_sales' | 'order_change' | 'order_cancel'
  requested_changes?: Record<string, unknown> | null
  window_ok?: boolean | null
}

const CATEGORY_LABELS: Record<string, string> = {
  wrong_size: 'Wrong size', damaged: 'Arrived damaged', defect: 'Defect / quality',
  missing_item: 'Missing item', wrong_item: 'Wrong item', late: 'Late / not received', other: 'Other',
}

// Ticket-type badge (distinguishes AI order-change / cancel from plain after-sales).
const TYPE_LABELS: Record<string, string> = {
  after_sales: 'After-sales', order_change: 'Change request', order_cancel: 'Cancel request',
}
const TYPE_STYLE: Record<string, string> = {
  after_sales: 'bg-gray-100 text-gray-600 border-gray-200',
  order_change: 'bg-blue-50 text-blue-700 border-blue-200',
  order_cancel: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-red-50 text-red-600 border-red-200',
  in_progress: 'bg-amber-50 text-amber-600 border-amber-200',
  resolved: 'bg-green-50 text-green-600 border-green-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
}

const STATUSES = ['open', 'in_progress', 'resolved', 'closed']
const SOURCE_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'web_form', label: 'Web form' },
  { key: 'ai_assistant', label: 'AI assistant' },
]

function fmt(s: string) {
  try { return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }
  catch { return s }
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({ all: 0, web_form: 0, ai_assistant: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchTickets = useCallback(async (f: string, src: string) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (f !== 'all') qs.set('status', f)
      if (src !== 'all') qs.set('source', src)
      const res = await fetch(`/api/admin/support${qs.toString() ? `?${qs}` : ''}`)
      const data = await res.json()
      if (data.success) {
        setTickets(data.data.tickets || [])
        setOpenCount(data.data.openCount || 0)
        if (data.data.sourceCounts) setSourceCounts(data.data.sourceCounts)
      }
    } catch { /* noop */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTickets(filter, sourceFilter) }, [filter, sourceFilter, fetchTickets])

  const flash = (m: string) => { setMessage(m); setTimeout(() => setMessage(''), 3000) }

  const update = async (id: string, patch: { status?: string; admin_notes?: string; reply_message?: string }) => {
    setSavingId(id)
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      const data = await res.json()
      if (data.success) { flash('Saved'); fetchTickets(filter, sourceFilter) }
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

      {/* Source tabs: where the ticket came from (web form vs AI assistant). */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {SOURCE_TABS.map(tab => (
          <button key={tab.key} onClick={() => setSourceFilter(tab.key)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 ${sourceFilter === tab.key ? 'border-[#3d3d3d] text-gray-900 font-medium' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {tab.key === 'ai_assistant' && <span className="mr-1">🤖</span>}
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">{sourceCounts[tab.key] ?? 0}</span>
          </button>
        ))}
      </div>

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
                    {t.source === 'ai_assistant' && <span title="Submitted via AI assistant">🤖</span>}
                    <span className="font-mono font-semibold text-gray-900 text-sm">{t.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] border ${STATUS_STYLE[t.status] || STATUS_STYLE.closed}`}>{t.status.replace('_', ' ')}</span>
                    {t.ticket_type && t.ticket_type !== 'after_sales' && (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] border ${TYPE_STYLE[t.ticket_type] || TYPE_STYLE.after_sales}`}>{TYPE_LABELS[t.ticket_type] || t.ticket_type}</span>
                    )}
                    {(t.ticket_type === 'order_change' || t.ticket_type === 'order_cancel') && t.window_ok === false && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] border bg-amber-50 text-amber-700 border-amber-200">Past 48h window</span>
                    )}
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

                  {/* Requested changes (order_change tickets). */}
                  {t.requested_changes && Object.keys(t.requested_changes).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Requested changes</p>
                      <div className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
                        {Object.entries(t.requested_changes).map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                            <span className="font-medium">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancel request → Plan B: staff confirm & refund via the order page. */}
                  {t.ticket_type === 'order_cancel' && (
                    <div className="text-sm bg-red-50 border border-red-100 rounded-lg p-3">
                      <p className="text-red-700 font-medium mb-1">Cancellation request{t.window_ok === false ? ' (past 48h window)' : ''}</p>
                      <p className="text-gray-600 text-xs">
                        Review, then cancel &amp; refund on the order page (full amount minus the card-processing fee).
                        {t.order_id && (
                          <> {' '}<a href={`/admin/orders?search=${t.order_number}`} className="text-red-700 underline hover:text-red-900">Open order to refund →</a></>
                        )}
                      </p>
                    </div>
                  )}

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
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Reply to customer</p>
                    <textarea
                      value={replyDraft[t.id] ?? ''}
                      onChange={e => setReplyDraft(d => ({ ...d, [t.id]: e.target.value }))}
                      rows={3}
                      placeholder="Write a reply — it will be emailed to the customer and logged in the notes below…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                    />
                    <button
                      onClick={async () => {
                        const msg = (replyDraft[t.id] || '').trim()
                        if (!msg) return
                        await update(t.id, { reply_message: msg })
                        setReplyDraft(d => ({ ...d, [t.id]: '' }))
                      }}
                      disabled={savingId === t.id || !(replyDraft[t.id] || '').trim()}
                      className="mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-black disabled:opacity-50">
                      Send Reply
                    </button>
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
