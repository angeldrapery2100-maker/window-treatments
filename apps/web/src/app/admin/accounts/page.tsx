'use client'

import { useState, useEffect, useCallback } from 'react'

interface AdminUser {
  id: string
  email: string
  name: string
  phone: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [saving, setSaving] = useState(false)

  // Current user
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/accounts')
      const data = await res.json()
      if (data.success) setUsers(data.data || [])
      else if (res.status === 401 || res.status === 403) setError(data.error)
    } catch { setError('Failed to load accounts') }
    finally { setLoading(false) }
  }, [])

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) setCurrentUserId(data.data.user.id)
    } catch {}
  }, [])

  useEffect(() => { fetchUsers(); fetchMe() }, [fetchUsers, fetchMe])

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000) }
    else { setMessage(msg); setTimeout(() => setMessage(''), 3000) }
  }

  const openCreate = () => {
    setEditingUser(null)
    setForm({ name: '', email: '', phone: '', password: '' })
    setShowModal(true)
  }

  const openEdit = (user: AdminUser) => {
    setEditingUser(user)
    setForm({ name: user.name, email: user.email, phone: user.phone || '', password: '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { flash('Name and email are required', true); return }
    if (!editingUser && (!form.password || form.password.length < 6)) { flash('Password must be at least 6 characters', true); return }

    setSaving(true)
    try {
      if (editingUser) {
        // Update
        const body: any = { id: editingUser.id, name: form.name, email: form.email, phone: form.phone }
        if (form.password) body.password = form.password
        const res = await fetch('/api/admin/accounts', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        const data = await res.json()
        if (data.success) { flash('Account updated'); setShowModal(false); fetchUsers() }
        else flash(data.error || 'Update failed', true)
      } else {
        // Create
        const res = await fetch('/api/admin/accounts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        const data = await res.json()
        if (data.success) { flash('Account created'); setShowModal(false); fetchUsers() }
        else flash(data.error || 'Create failed', true)
      }
    } catch (e: any) { flash(e.message, true) }
    finally { setSaving(false) }
  }

  const toggleActive = async (user: AdminUser) => {
    if (user.id === currentUserId) { flash('Cannot disable your own account', true); return }
    const res = await fetch('/api/admin/accounts', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, is_active: !user.is_active })
    })
    const data = await res.json()
    if (data.success) { flash(user.is_active ? 'Account disabled' : 'Account enabled'); fetchUsers() }
    else flash(data.error || 'Failed', true)
  }

  const removeUser = async (user: AdminUser) => {
    if (user.id === currentUserId) { flash('Cannot remove your own account', true); return }
    if (!confirm(`Remove admin access for ${user.name}? They will be downgraded to a customer account.`)) return
    const res = await fetch(`/api/admin/accounts?id=${user.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { flash('Admin access removed'); fetchUsers() }
    else flash(data.error || 'Failed', true)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  if (error && users.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Accounts</h1>
              <p className="text-sm text-gray-400 mt-0.5">{users.length} admin {users.length === 1 ? 'user' : 'users'}</p>
            </div>
            <div className="flex items-center gap-2">
              {message && <span className="text-sm px-3 py-1 rounded bg-green-50 text-green-700">{message}</span>}
              {error && <span className="text-sm px-3 py-1 rounded bg-red-50 text-red-600">{error}</span>}
              <button onClick={openCreate}
                className="px-4 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 text-sm font-medium">
                <svg className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            <p className="text-gray-400 mb-4">No admin accounts yet</p>
            <button onClick={openCreate} className="px-4 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 text-sm">Create First Admin</button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-center font-medium w-20">Status</th>
                  <th className="px-4 py-3 text-right font-medium w-44">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const isMe = user.id === currentUserId
                  return (
                    <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${!user.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500 flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              {isMe && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">You</span>}
                            </div>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.phone || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(user)}
                          disabled={isMe}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:cursor-not-allowed ${user.is_active ? 'bg-[#3d3d3d]' : 'bg-gray-300'}`}
                          title={isMe ? 'Cannot disable your own account' : user.is_active ? 'Disable' : 'Enable'}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${user.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button onClick={() => openEdit(user)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487L19.5 7.125" /></svg>
                          </button>
                          <button onClick={() => removeUser(user)}
                            disabled={isMe}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed" title={isMe ? 'Cannot remove yourself' : 'Remove admin access'}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
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
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full mx-4 border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">{editingUser ? 'Edit Admin Account' : 'New Admin Account'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder={editingUser ? 'New password' : 'Min 6 characters'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium">
                {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
