'use client'

import { useState, useEffect, useCallback } from 'react'

interface DiscountCode {
  id: string
  code: string
  description: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order: number
  max_uses: number | null
  used_count: number
  starts_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
}

const emptyForm = {
  code: '',
  description: '',
  discount_type: 'percent' as 'percent' | 'fixed',
  discount_value: '',
  min_order: '',
  max_uses: '',
  starts_at: new Date().toISOString().slice(0, 16),
  expires_at: '',
}

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const flash = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/discount-codes')
      const data = await res.json()
      if (data.success) setCodes(data.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCodes() }, [fetchCodes])

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (c: DiscountCode) => {
    setForm({
      code: c.code,
      description: c.description || '',
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order: c.min_order ? String(c.min_order) : '',
      max_uses: c.max_uses != null ? String(c.max_uses) : '',
      starts_at: c.starts_at ? new Date(c.starts_at).toISOString().slice(0, 16) : '',
      expires_at: c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : '',
    })
    setEditingId(c.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.code.trim() || !form.discount_value) {
      flash('Please fill in the discount code and value', 'error')
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        code: form.code.trim(),
        description: form.description,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order: form.min_order ? parseFloat(form.min_order) : 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        starts_at: form.starts_at || new Date().toISOString(),
        expires_at: form.expires_at || null,
      }

      if (editingId) {
        payload.id = editingId
        await fetch('/api/admin/discount-codes', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        const res = await fetch('/api/admin/discount-codes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!data.success) {
          flash(data.error, 'error')
          setSaving(false); return
        }
      }
      setShowForm(false)
      flash('Saved')
      fetchCodes()
    } catch { flash('Save failed', 'error') }
    finally { setSaving(false) }
  }

  const handleToggle = async (id: string, current: boolean) => {
    await fetch('/api/admin/discount-codes', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current })
    })
    fetchCodes()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discount code?')) return
    await fetch('/api/admin/discount-codes', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchCodes()
  }

  const getStatus = (c: DiscountCode) => {
    if (!c.is_active) return { text: 'Disabled', color: 'bg-gray-100 text-gray-500' }
    const now = new Date()
    if (c.starts_at && new Date(c.starts_at) > now) return { text: 'Scheduled', color: 'bg-amber-50 text-amber-700' }
    if (c.expires_at && new Date(c.expires_at) < now) return { text: 'Expired', color: 'bg-red-50 text-red-600' }
    if (c.max_uses != null && c.used_count >= c.max_uses) return { text: 'Exhausted', color: 'bg-gray-100 text-gray-500' }
    return { text: 'Active', color: 'bg-green-50 text-green-700' }
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Discount Codes</h1>
              <p className="text-sm text-gray-400 mt-0.5">Create and manage store discount codes</p>
            </div>
            <div className="flex gap-3 items-center">
              {message && (
                <span className={`text-sm px-3 py-1.5 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </span>
              )}
              <button onClick={openCreate} className="px-5 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 font-medium text-sm">
                + Create Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : codes.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm mb-4">No discount codes yet</p>
            <button onClick={openCreate} className="px-5 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 text-sm font-medium">
              Create First Code
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Code</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Discount</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Min Order</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Usage</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Validity</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codes.map(c => {
                  const status = getStatus(c)
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-mono font-semibold text-gray-900 tracking-wider">{c.code}</div>
                        {c.description && <div className="text-[11px] text-gray-400 mt-0.5">{c.description}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                        {c.discount_type === 'percent' ? `${c.discount_value}%` : `$${c.discount_value}`}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {c.min_order > 0 ? `$${c.min_order}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ' / ∞'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[11px] text-gray-400">
                          <div>Start: {formatDate(c.starts_at)}</div>
                          <div>End: {formatDate(c.expires_at)}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-md ${status.color}`}>{status.text}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg>
                          </button>
                          <button onClick={() => handleToggle(c.id, c.is_active)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            title={c.is_active ? 'Disable' : 'Enable'}>
                            {c.is_active ? (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md border border-gray-200 p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-semibold text-gray-900">{editingId ? 'Edit Discount Code' : 'Create Discount Code'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Code *</label>
                <input type="text" value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. WELCOME10"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm uppercase tracking-wider focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Description</label>
                <input type="text" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="New customer welcome offer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Discount Type *</label>
                  <select value={form.discount_type}
                    onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Discount Value *</label>
                  <div className="relative">
                    <input type="number" step="0.01" value={form.discount_value}
                      onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                      placeholder={form.discount_type === 'percent' ? 'e.g. 10' : 'e.g. 50'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm pr-8 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {form.discount_type === 'percent' ? '%' : '$'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Minimum Order ($)</label>
                  <input type="number" step="0.01" value={form.min_order}
                    onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
                    placeholder="0 = no minimum"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Max Uses</label>
                  <input type="number" value={form.max_uses}
                    onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                    placeholder="Empty = unlimited"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Start Date</label>
                  <input type="datetime-local" value={form.starts_at}
                    onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Expiry Date</label>
                  <input type="datetime-local" value={form.expires_at}
                    onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none" />
                  <p className="text-[10px] text-gray-400 mt-1">Leave empty for no expiration</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-[#3d3d3d] text-white rounded-md text-sm hover:bg-gray-700 disabled:opacity-50 font-medium transition-colors">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
