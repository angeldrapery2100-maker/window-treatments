'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter email and password'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Login failed')
        return
      }

      // Check if user is admin
      const meRes = await fetch('/api/auth/me')
      const meData = await meRes.json()

      if (meData.success && meData.data.user.role === 'admin') {
        router.push('/admin')
      } else {
        setError('This account does not have admin access')
        // Log out
        await fetch('/api/auth/logout', { method: 'POST' })
      }
    } catch (err: any) {
      setError(err.message || 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-sm font-bold text-gray-900 tracking-tight">ANGEL DRAPERY</h1>
          <p className="text-[11px] text-gray-400 mt-1 tracking-widest uppercase">Admin</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="admin@example.com"
                autoComplete="email"
                autoFocus
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-6">Admin access only</p>
      </div>
    </div>
  )
}
