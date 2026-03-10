'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ============================================================
// Types
// ============================================================
interface OrderItem {
  productName: string
  productType: string
  mainImageUrl: string | null
  width?: number
  height?: number
  options: { displayLabel: string; valueLabel: string }[]
  quantity: number
  unitPrice: number
}

interface Shipment {
  id: string
  order_id: string
  item_indices: number[]
  item_quantities: Record<string, number>
  tracking_number: string | null
  tracking_url: string | null
  carrier: string | null
  service: string | null
  status: string
  created_at: string
}

interface Order {
  id: string
  order_number: string
  status: string
  items: OrderItem[]
  subtotal: number
  discount_code: string | null
  discount_amount: number
  shipping_cost: number
  tax_amount: number
  total: number
  tracking_number: string | null
  tracking_url: string | null
  shipping_carrier: string | null
  shipping_address: any
  shipments: Shipment[]
  created_at: string
}

interface ShippingAddress {
  name: string
  phone: string
  street1: string
  street2: string
  city: string
  state: string
  zip: string
  country: string
}

const EMPTY_ADDRESS: ShippingAddress = {
  name: '', phone: '', street1: '', street2: '', city: '', state: '', zip: '', country: 'US',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:       { label: 'Pending',       color: 'bg-amber-50 text-amber-700', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  confirmed:     { label: 'Confirmed',     color: 'bg-blue-50 text-blue-700',   icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  in_production: { label: 'In Production', color: 'bg-violet-50 text-violet-700', icon: 'M11.42 15.17l-5.384-3.77A1 1 0 005 12.29V17a1 1 0 001.564.826l4.856-3.402zM18.42 15.17l-5.384-3.77A1 1 0 0012 12.29V17a1 1 0 001.564.826l4.856-3.402z' },
  partially_shipped: { label: 'Partially Shipped', color: 'bg-cyan-50 text-cyan-700', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' },
  shipped:       { label: 'Shipped',       color: 'bg-cyan-50 text-cyan-700',   icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' },
  completed:     { label: 'Completed',     color: 'bg-green-50 text-green-700',  icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  cancelled:     { label: 'Cancelled',     color: 'bg-red-50 text-red-600',     icon: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

// ============================================================
// Main Component
// ============================================================
export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'profile'>('orders')

  // Auth mode
  const [showLogin, setShowLogin] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register fields
  const [regEmail, setRegEmail] = useState('')
  const [regCode, setRegCode] = useState('')
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regStep, setRegStep] = useState<'email' | 'verify' | 'details'>('email')
  const [codeSent, setCodeSent] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)

  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Shipping address
  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [editingAddr, setEditingAddr] = useState<ShippingAddress | null>(null)
  const [editingAddrIdx, setEditingAddrIdx] = useState<number>(-1) // -1 = new
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrMessage, setAddrMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Profile edit
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Countdown timer
  useEffect(() => {
    if (codeCountdown <= 0) return
    const t = setTimeout(() => setCodeCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [codeCountdown])

  // Check auth
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.user) {
          setUser(d.data.user)
          setProfileName(d.data.user.name || '')
          setProfilePhone(d.data.user.phone || '')
          // Parse shipping addresses
          const sa = d.data.user.shipping_address
          if (sa && Array.isArray(sa)) {
            setAddresses(sa)
          } else if (sa && typeof sa === 'object' && sa.street1) {
            setAddresses([sa])
          } else {
            setAddresses([])
          }
          fetchOrders()
        } else {
          setShowLogin(true)
        }
      })
      .catch(() => setShowLogin(true))
      .finally(() => setLoading(false))
  }, [])

  const fetchOrders = async () => {
    const res = await fetch('/api/store/my-orders')
    const data = await res.json()
    if (data.success) setOrders(data.data || [])
  }

  // ─── Auth handlers ───
  const handleLogin = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (data.success) {
        // Reload to get full user data
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()
        if (meData.success && meData.data?.user) {
          setUser(meData.data.user)
          setProfileName(meData.data.user.name || '')
          setProfilePhone(meData.data.user.phone || '')
          const sa = meData.data.user.shipping_address
          if (sa && Array.isArray(sa)) setAddresses(sa)
          else if (sa && typeof sa === 'object' && sa.street1) setAddresses([sa])
        }
        setShowLogin(false)
        fetchOrders()
      } else {
        setAuthError(data.error)
      }
    } catch { setAuthError('Network error') }
    finally { setAuthLoading(false) }
  }

  const handleSendCode = async () => {
    if (!regEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setAuthError('Please enter a valid email'); return
    }
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail }),
      })
      const data = await res.json()
      if (data.success) {
        setCodeSent(true)
        setCodeCountdown(60)
        setRegStep('verify')
      } else {
        setAuthError(data.error)
      }
    } catch { setAuthError('Failed to send code') }
    finally { setAuthLoading(false) }
  }

  const handleVerifyCode = async () => {
    if (regCode.length !== 6) { setAuthError('Please enter the 6-digit code'); return }
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, code: regCode }),
      })
      const data = await res.json()
      if (data.success) setRegStep('details')
      else setAuthError(data.error)
    } catch { setAuthError('Verification failed') }
    finally { setAuthLoading(false) }
  }

  const handleRegister = async () => {
    if (!regName.trim()) { setAuthError('Please enter your name'); return }
    if (regPassword.length < 6) { setAuthError('Password must be at least 6 characters'); return }
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, name: regName, phone: regPhone }),
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.data.user)
        setProfileName(data.data.user.name || '')
        setProfilePhone(data.data.user.phone || '')
        setShowLogin(false)
        fetchOrders()
      } else setAuthError(data.error)
    } catch { setAuthError('Registration failed') }
    finally { setAuthLoading(false) }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setOrders([])
    setAddresses([])
    setShowLogin(true)
    setIsRegister(false)
    setRegStep('email')
    setRegEmail(''); setRegCode(''); setRegName(''); setRegPhone(''); setRegPassword('')
    setLoginEmail(''); setLoginPassword('')
  }

  const switchMode = () => {
    setIsRegister(!isRegister)
    setAuthError('')
    setRegStep('email')
    setRegCode('')
  }

  // ─── Address handlers ───
  const saveAddresses = async (newAddresses: ShippingAddress[]) => {
    setAddrSaving(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping_address: newAddresses }),
      })
      const data = await res.json()
      if (data.success) {
        setAddresses(newAddresses)
        setAddrMessage({ text: 'Saved', type: 'success' })
      } else {
        setAddrMessage({ text: 'Save failed', type: 'error' })
      }
    } catch {
      setAddrMessage({ text: 'Save failed', type: 'error' })
    }
    setAddrSaving(false)
    setTimeout(() => setAddrMessage(null), 2500)
  }

  const handleSaveAddr = () => {
    if (!editingAddr) return
    if (!editingAddr.name.trim() || !editingAddr.street1.trim() || !editingAddr.city.trim() || !editingAddr.state || !editingAddr.zip.trim()) {
      setAddrMessage({ text: 'Please fill in required fields', type: 'error' })
      setTimeout(() => setAddrMessage(null), 2500)
      return
    }
    const newAddrs = [...addresses]
    if (editingAddrIdx >= 0) {
      newAddrs[editingAddrIdx] = editingAddr
    } else {
      newAddrs.push(editingAddr)
    }
    saveAddresses(newAddrs)
    setEditingAddr(null)
    setEditingAddrIdx(-1)
  }

  const handleDeleteAddr = (idx: number) => {
    if (!confirm('Delete this address?')) return
    const newAddrs = addresses.filter((_, i) => i !== idx)
    saveAddresses(newAddrs)
  }

  // ─── Profile handlers ───
  const handleSaveProfile = async () => {
    setProfileSaving(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      })
      const data = await res.json()
      if (data.success) {
        setUser((u: any) => ({ ...u, name: profileName, phone: profilePhone }))
        setProfileMessage({ text: 'Saved', type: 'success' })
      } else {
        setProfileMessage({ text: 'Save failed', type: 'error' })
      }
    } catch {
      setProfileMessage({ text: 'Save failed', type: 'error' })
    }
    setProfileSaving(false)
    setTimeout(() => setProfileMessage(null), 2500)
  }

  const getStatus = (s: string) => STATUS_CONFIG[s] || { label: s, color: 'bg-gray-100 text-gray-600', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>

  // ════════════════════════════════════════════════════════════
  // LOGIN / REGISTER
  // ════════════════════════════════════════════════════════════
  if (showLogin) {
    return (
      <main className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-4">
        <div className="max-w-[400px] w-full">
          <div className="text-center mb-8">
            <h1 className="text-xs font-semibold tracking-[0.25em] text-gray-900 uppercase">Angel Drapery</h1>
            <div className="w-8 h-px bg-gray-300 mx-auto mt-3" />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-7">
            {/* ── LOGIN ── */}
            {!isRegister && (
              <>
                <h2 className="text-lg font-light text-gray-900 text-center mb-1">Sign In</h2>
                <p className="text-xs text-gray-400 text-center mb-6">Access your orders and account settings</p>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                  </div>
                  {authError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-md">{authError}</p>}
                  <button onClick={handleLogin} disabled={authLoading}
                    className="w-full py-3 bg-[#3d3d3d] text-white text-xs font-semibold tracking-[0.15em] uppercase hover:bg-gray-700 transition-colors rounded-md disabled:opacity-50">
                    {authLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                  <p className="text-center text-xs text-gray-400 pt-1">
                    Don&apos;t have an account?{' '}
                    <button onClick={switchMode} className="text-gray-900 font-medium hover:underline underline-offset-4">Create one</button>
                  </p>
                </div>
              </>
            )}

            {/* ── REGISTER STEP 1: EMAIL ── */}
            {isRegister && regStep === 'email' && (
              <>
                <h2 className="text-lg font-light text-gray-900 text-center mb-1">Create Account</h2>
                <p className="text-xs text-gray-400 text-center mb-6">We&apos;ll send a verification code to your email</p>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendCode()} autoFocus
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                  </div>
                  {authError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-md">{authError}</p>}
                  <button onClick={handleSendCode} disabled={authLoading}
                    className="w-full py-3 bg-[#3d3d3d] text-white text-xs font-semibold tracking-[0.15em] uppercase hover:bg-gray-700 transition-colors rounded-md disabled:opacity-50">
                    {authLoading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                  <p className="text-center text-xs text-gray-400 pt-1">
                    Already have an account?{' '}
                    <button onClick={switchMode} className="text-gray-900 font-medium hover:underline underline-offset-4">Sign In</button>
                  </p>
                </div>
              </>
            )}

            {/* ── REGISTER STEP 2: VERIFY ── */}
            {isRegister && regStep === 'verify' && (
              <>
                <h2 className="text-lg font-light text-gray-900 text-center mb-1">Verify Email</h2>
                <p className="text-xs text-gray-400 text-center mb-6">
                  Code sent to <span className="font-medium text-gray-700">{regEmail}</span>
                </p>
                <div className="space-y-3.5">
                  <input type="text" value={regCode} onChange={e => setRegCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyCode()} autoFocus
                    placeholder="000000" maxLength={6}
                    className="w-full px-3.5 py-3.5 border border-gray-200 rounded-md text-center text-xl font-mono tracking-[0.4em] focus:outline-none focus:border-gray-900 transition-colors" />
                  {authError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-md">{authError}</p>}
                  <button onClick={handleVerifyCode} disabled={authLoading || regCode.length !== 6}
                    className="w-full py-3 bg-[#3d3d3d] text-white text-xs font-semibold tracking-[0.15em] uppercase hover:bg-gray-700 transition-colors rounded-md disabled:opacity-50">
                    {authLoading ? 'Verifying...' : 'Verify'}
                  </button>
                  <div className="flex justify-between items-center pt-1">
                    <button onClick={() => { setRegStep('email'); setAuthError('') }}
                      className="text-xs text-gray-400 hover:text-gray-700">Change email</button>
                    <button onClick={handleSendCode} disabled={codeCountdown > 0 || authLoading}
                      className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-40">
                      {codeCountdown > 0 ? `Resend in ${codeCountdown}s` : 'Resend code'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── REGISTER STEP 3: DETAILS ── */}
            {isRegister && regStep === 'details' && (
              <>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-xs text-green-600 font-medium">Email verified</span>
                </div>
                <h2 className="text-lg font-light text-gray-900 text-center mb-1">Complete Registration</h2>
                <p className="text-xs text-gray-400 text-center mb-6">{regEmail}</p>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)} autoFocus
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Phone <span className="text-gray-300">(optional)</span></label>
                    <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Password *</label>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRegister()}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                  </div>
                  {authError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-md">{authError}</p>}
                  <button onClick={handleRegister} disabled={authLoading}
                    className="w-full py-3 bg-[#3d3d3d] text-white text-xs font-semibold tracking-[0.15em] uppercase hover:bg-gray-700 transition-colors rounded-md disabled:opacity-50">
                    {authLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </div>

          <Link href="/store" className="block text-center mt-5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Back to Store
          </Link>
        </div>
      </main>
    )
  }

  // ════════════════════════════════════════════════════════════
  // ACCOUNT DASHBOARD
  // ════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/store" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">My Account</h1>
                <p className="text-xs text-gray-400 mt-0.5">{user?.name} &middot; {user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Sign Out</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-1.5">
            {(['orders', 'address', 'profile'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-[#3d3d3d] text-white' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}>
                {tab === 'orders' ? 'Orders' : tab === 'address' ? 'Addresses' : 'Profile'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ═══ ORDERS TAB ═══ */}
        {activeTab === 'orders' && (
          <>
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
                <p className="text-sm text-gray-400 mb-4">No orders yet</p>
                <Link href="/store" className="inline-block px-5 py-2.5 bg-[#3d3d3d] text-white text-xs font-semibold tracking-[0.1em] uppercase hover:bg-gray-700 transition-colors rounded-md">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const expanded = expandedId === order.id
                  const status = getStatus(order.status)
                  const shipments = order.shipments || []
                  const hasShipments = shipments.length > 0

                  return (
                    <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Order header row */}
                      <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                        onClick={() => setExpandedId(expanded ? null : order.id)}>
                        <svg className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
                          fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-semibold text-sm text-gray-900">{order.order_number}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-md ${status.color}`}>{status.label}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            {' '}&middot;{' '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            {hasShipments && ` · ${shipments.length} parcel${shipments.length !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">${Number(order.total).toFixed(2)}</p>
                      </div>

                      {/* Expanded detail */}
                      {expanded && (
                        <div className="border-t border-gray-100">
                          {/* Items */}
                          <div className="px-5 py-4 space-y-2.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-md">
                                <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                                  {item.mainImageUrl ? (
                                    <img src={item.mainImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px]">No img</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                  <p className="text-[11px] text-gray-400">
                                    {item.productType.toUpperCase()} &middot; Qty: {item.quantity}
                                    {item.width ? ` · W:${item.width}"` : ''}{item.height ? ` H:${item.height}"` : ''}
                                  </p>
                                  {item.options?.length > 0 && (
                                    <p className="text-[11px] text-gray-400 truncate">{item.options.map(o => `${o.displayLabel}: ${o.valueLabel}`).join(' · ')}</p>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-gray-700 flex-shrink-0">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>

                          {/* Shipments / Tracking */}
                          {hasShipments && (
                            <div className="px-5 pb-4 space-y-2">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tracking</p>
                              {shipments.map((s, sIdx) => {
                                const shippedItems = (s.item_indices || []).map((idx: number) => {
                                  const item = order.items[idx]
                                  if (!item) return null
                                  const qty = s.item_quantities?.[String(idx)] || item.quantity
                                  return { name: item.productName, qty }
                                }).filter(Boolean)

                                return (
                                  <div key={s.id} className="border border-gray-200 rounded-md p-3.5">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs font-semibold text-gray-900">
                                            {shipments.length > 1 ? `Parcel ${sIdx + 1}` : 'Shipment'}
                                          </span>
                                          {s.carrier && <span className="text-[10px] text-gray-400 uppercase">{s.carrier}</span>}
                                          {s.status === 'shipped' && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded font-medium">Shipped</span>
                                          )}
                                        </div>
                                        {s.tracking_number && (
                                          <p className="font-mono text-xs text-gray-600 mb-1">{s.tracking_number}</p>
                                        )}
                                        {shippedItems.length > 0 && (
                                          <p className="text-[11px] text-gray-400">
                                            {shippedItems.map((si: any) => `${si.name} ×${si.qty}`).join(', ')}
                                          </p>
                                        )}
                                        <p className="text-[10px] text-gray-300 mt-1">
                                          {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                      </div>
                                      {s.tracking_url && (
                                        <a href={s.tracking_url} target="_blank" rel="noopener noreferrer"
                                          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-gray-700">
                                          Track
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Legacy single tracking (fallback) */}
                          {!hasShipments && order.tracking_number && (
                            <div className="px-5 pb-4">
                              <div className="border border-gray-200 rounded-md p-3.5">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-semibold text-gray-900">Shipment</span>
                                      {order.shipping_carrier && <span className="text-[10px] text-gray-400 uppercase">{order.shipping_carrier}</span>}
                                    </div>
                                    <p className="font-mono text-xs text-gray-600">{order.tracking_number}</p>
                                  </div>
                                  {order.tracking_url && (
                                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-gray-700">
                                      Track
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Order totals */}
                          <div className="px-5 pb-4">
                            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-gray-700">${Number(order.subtotal).toFixed(2)}</span></div>
                              {Number(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Discount{order.discount_code ? ` (${order.discount_code})` : ''}</span>
                                  <span>-${Number(order.discount_amount).toFixed(2)}</span>
                                </div>
                              )}
                              {Number(order.shipping_cost) > 0 && (
                                <div className="flex justify-between"><span className="text-gray-400">Shipping</span><span className="text-gray-700">${Number(order.shipping_cost).toFixed(2)}</span></div>
                              )}
                              {Number(order.tax_amount) > 0 && (
                                <div className="flex justify-between"><span className="text-gray-400">Tax</span><span className="text-gray-700">${Number(order.tax_amount).toFixed(2)}</span></div>
                              )}
                              <div className="flex justify-between font-semibold pt-1.5 border-t border-gray-100">
                                <span className="text-gray-900">Total</span><span className="text-gray-900">${Number(order.total).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* View / Print button */}
                          <div className="px-5 pb-4 flex justify-end">
                            <button
                              onClick={() => window.open(`/store/account/orders/print/${order.id}`, '_blank')}
                              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                              </svg>
                              View / Print Order
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ ADDRESSES TAB ═══ */}
        {activeTab === 'address' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Shipping Addresses</h2>
                <p className="text-xs text-gray-400 mt-0.5">Saved addresses for faster checkout</p>
              </div>
              <div className="flex items-center gap-3">
                {addrMessage && (
                  <span className={`text-xs px-2.5 py-1 rounded-md ${addrMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {addrMessage.text}
                  </span>
                )}
                <button onClick={() => { setEditingAddr({ ...EMPTY_ADDRESS }); setEditingAddrIdx(-1) }}
                  className="px-4 py-2 bg-[#3d3d3d] text-white text-xs font-semibold rounded-md hover:bg-gray-700 transition-colors">
                  + Add Address
                </button>
              </div>
            </div>

            {addresses.length === 0 && !editingAddr && (
              <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
                <p className="text-sm text-gray-400 mb-4">No saved addresses</p>
                <button onClick={() => { setEditingAddr({ ...EMPTY_ADDRESS }); setEditingAddrIdx(-1) }}
                  className="px-5 py-2.5 bg-[#3d3d3d] text-white text-xs font-semibold tracking-[0.1em] uppercase hover:bg-gray-700 transition-colors rounded-md">
                  Add Your First Address
                </button>
              </div>
            )}

            {/* Address cards */}
            <div className="space-y-3">
              {addresses.map((addr, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{addr.name}</p>
                      {addr.phone && <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>}
                      <p className="text-sm text-gray-600 mt-1.5">{addr.street1}</p>
                      {addr.street2 && <p className="text-sm text-gray-600">{addr.street2}</p>}
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingAddr({ ...addr }); setEditingAddrIdx(idx) }}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Edit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteAddr(idx)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Address edit form */}
            {editingAddr && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-semibold text-gray-900">{editingAddrIdx >= 0 ? 'Edit Address' : 'Add Address'}</h3>
                    <button onClick={() => { setEditingAddr(null); setEditingAddrIdx(-1) }} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                        <input type="text" value={editingAddr.name} onChange={e => setEditingAddr({ ...editingAddr, name: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
                        <input type="tel" value={editingAddr.phone} onChange={e => setEditingAddr({ ...editingAddr, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Street Address *</label>
                      <input type="text" value={editingAddr.street1} onChange={e => setEditingAddr({ ...editingAddr, street1: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Apt / Suite / Unit</label>
                      <input type="text" value={editingAddr.street2} onChange={e => setEditingAddr({ ...editingAddr, street2: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">City *</label>
                        <input type="text" value={editingAddr.city} onChange={e => setEditingAddr({ ...editingAddr, city: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">State *</label>
                        <select value={editingAddr.state} onChange={e => setEditingAddr({ ...editingAddr, state: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors">
                          <option value="">Select</option>
                          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">ZIP *</label>
                        <input type="text" value={editingAddr.zip} onChange={e => setEditingAddr({ ...editingAddr, zip: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                    <button onClick={() => { setEditingAddr(null); setEditingAddrIdx(-1) }}
                      className="px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleSaveAddr} disabled={addrSaving}
                      className="px-5 py-2 bg-[#3d3d3d] text-white rounded-md text-sm hover:bg-gray-700 disabled:opacity-50 font-medium transition-colors">
                      {addrSaving ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ PROFILE TAB ═══ */}
        {activeTab === 'profile' && (
          <div className="max-w-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">Update your personal information</p>
              </div>
              {profileMessage && (
                <span className={`text-xs px-2.5 py-1 rounded-md ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {profileMessage.text}
                </span>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
                <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900 transition-colors" />
              </div>
              <div className="pt-2">
                <button onClick={handleSaveProfile} disabled={profileSaving}
                  className="px-5 py-2.5 bg-[#3d3d3d] text-white text-xs font-semibold rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors">
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Account created {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
