'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCart, clearCart, type Cart, type CartItem } from '@/lib/cart'
import { SWATCH_SHIPPING_RATES } from '@/lib/site'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ShippingRate {
  rateId: string; carrier: string; service: string; price: number; estimatedDays: string
}

// ─── Payment Form ───
function PaymentForm({ onSuccess, submitting, setSubmitting }: {
  onSuccess: (id: string) => void; submitting: boolean; setSubmitting: (v: boolean) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [payError, setPayError] = useState('')

  const handlePay = async () => {
    if (!stripe || !elements) return
    setSubmitting(true); setPayError('')
    // A return_url is REQUIRED whenever the PaymentIntent enables any
    // redirect-based method (Link, Cash App, US bank, etc. via
    // automatic_payment_methods). With redirect:'if_required' a card payment
    // still completes inline and never uses this URL, but its presence stops
    // Stripe from rejecting the confirm with a generic "an error occurred"
    // when a redirect method is available. Redirect methods land here, where
    // the webhook will have created the order.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store/order-confirmation`,
      },
      redirect: 'if_required',
    })
    if (error) { setPayError(error.message || 'Payment failed'); setSubmitting(false) }
    else if (paymentIntent?.status === 'succeeded') onSuccess(paymentIntent.id)
    else { setPayError('Payment not completed'); setSubmitting(false) }
  }

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {payError && <p className="text-xs text-red-500">{payError}</p>}
      <button onClick={handlePay} disabled={submitting || !stripe}
        className="w-full py-3.5 bg-[#3d3d3d] text-white text-sm font-medium tracking-widest uppercase hover:bg-gray-700 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed">
        {submitting ? 'Processing...' : 'Pay & Place Order'}
      </button>
    </div>
  )
}

// ─── Main ───
export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Cart>({ items: [] })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  // Auth
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Registration
  const [wantAccount, setWantAccount] = useState(false)
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [codeSending, setCodeSending] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [verifyError, setVerifyError] = useState('')

  // Form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [notes, setNotes] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Shipping
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState('')
  const [shippingCalculated, setShippingCalculated] = useState(false)

  // Tax (estimate — shown during shipping-selection step)
  const [taxRate, setTaxRate] = useState(0)
  const [taxSource, setTaxSource] = useState('')   // from /api/store/tax-rate

  // Confirmed amounts from create-payment-intent (authoritative)
  // These replace the local estimates once the PaymentIntent is created.
  const [confirmedTaxAmount, setConfirmedTaxAmount] = useState<number | null>(null)
  const [confirmedTotal,     setConfirmedTotal    ] = useState<number | null>(null)
  const [taxIsAuthoritative, setTaxIsAuthoritative] = useState(false)
  // 'stripe' = Stripe Tax; 'local' = server state-estimate; '' = pre-PI
  const [piTaxSource, setPiTaxSource] = useState<'stripe' | 'local' | ''>('')

  // Countdown timer
  useEffect(() => {
    if (codeCountdown <= 0) return
    const t = setTimeout(() => setCodeCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [codeCountdown])

  // Check auth
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success && d.data?.user) {
        const u = d.data.user; setUser(u); setName(u.name || ''); setEmail(u.email || ''); setPhone(u.phone || '')
        if (u.shipping_address) {
          const sa = u.shipping_address
          const addr = Array.isArray(sa) ? sa[0] : sa
          if (addr) {
            setAddress(addr.street1 || addr.street || '')
            setCity(addr.city || '')
            setState(addr.state || '')
            setZip(addr.zip || '')
            if (addr.name && !u.name) setName(addr.name)
            if (addr.phone && !u.phone) setPhone(addr.phone)
          }
        }
      }
    }).catch(() => {}).finally(() => setAuthLoading(false))
  }, [])

  // Load cart
  useEffect(() => {
    const c = getCart()
    if (c.items.length === 0) { router.replace('/store/cart'); return }
    setCart(c); setLoading(false)
  }, [router])

  // ── Local order-summary totals (shown before PI is created) ─────────────────
  const subtotal = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const discountType = cart.discountType || 'percent'
  const hasDiscount = !!cart.discountCode && (cart.discountPercent ?? 0) > 0
  const discountAmount = hasDiscount
    ? discountType === 'percent' ? Math.round(subtotal * cart.discountPercent! / 100) : Math.round(cart.discountPercent!)
    : 0
  const shippingCost = selectedRate?.price || 0
  const localTaxableAmount = Math.max(0, subtotal - discountAmount)
  const localTaxAmount = Math.round(localTaxableAmount * taxRate * 100) / 100
  const localTotal = Math.max(0, subtotal - discountAmount + shippingCost + localTaxAmount)

  // ── Display values — use server-confirmed amounts after PI creation ──────────
  // Before PI: show local estimates (taxSource from /api/store/tax-rate)
  // After PI:  show amounts returned by create-payment-intent (authoritative)
  const displayTaxAmount = confirmedTaxAmount !== null ? confirmedTaxAmount : localTaxAmount
  const displayTotal     = confirmedTotal     !== null ? confirmedTotal     : localTotal

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  // Swatch-only carts: swatches are free but shipping is charged (flat two-tier
  // rates, no Shippo call needed). Payment goes through Stripe as usual.
  const swatchOnly = cart.items.length > 0 && cart.items.every(i => i.isSwatch)

  // Default swatch-only orders to the standard rate as soon as we know.
  useEffect(() => {
    if (swatchOnly && !selectedRate) setSelectedRate({ ...SWATCH_SHIPPING_RATES[0] })
  }, [swatchOnly, selectedRate])

  const validate = () => {
    if (!name.trim()) return 'Please enter your name'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
    if (!phone.trim()) return 'Please enter your phone number'
    if (!address.trim()) return 'Please enter your address'
    if (!city.trim()) return 'Please enter your city'
    if (!state.trim()) return 'Please enter your state'
    if (!zip.trim()) return 'Please enter your ZIP code'
    return null
  }

  // ─── Step 1: Calculate Shipping (also fetches estimated tax for display) ───
  const calculateShipping = async () => {
    const err = validate()
    if (err) { setError(err); setTouched({ name: true, email: true, phone: true, address: true, city: true, state: true, zip: true }); return }
    setError(''); setShippingError(''); setShippingLoading(true); setShippingRates([]); setSelectedRate(null); setShippingCalculated(false)
    // Reset confirmed amounts when address changes
    setConfirmedTaxAmount(null); setConfirmedTotal(null); setTaxIsAuthoritative(false); setPiTaxSource('')
    try {
      // Fetch shipping rates and a LOCAL TAX ESTIMATE in parallel.
      // ⚠️  The tax-rate API returns an estimate only — NOT the authoritative charge.
      //     The confirmed tax will be set by create-payment-intent in step 2.
      const [shippingRes, taxRes] = await Promise.all([
        fetch('/api/store/shipping-rates', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Swatches ship free in an envelope — excluded from parcel estimation.
            items: cart.items.filter(i => !i.isSwatch).map(i => ({ productId: i.productId, width: i.width, height: i.height, quantity: i.quantity })),
            address: { street: address, city, state, zip },
          })
        }),
        // Estimate only — labelled "(est.)" in UI until PI is created
        fetch('/api/store/tax-rate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state, zip })
        }).catch(() => null)
      ])
      if (taxRes) {
        const taxData = await taxRes.json()
        if (taxData.success) { setTaxRate(taxData.data.rate || 0); setTaxSource(taxData.data.source || '') }
      }
      const data = await shippingRes.json()
      if (data.success && data.data.rates.length > 0) {
        setShippingRates(data.data.rates)
        setSelectedRate(data.data.rates[0])
        setShippingCalculated(true)
      } else {
        setShippingError(data.error || 'No shipping rates available for this address')
      }
    } catch (e: any) { setShippingError(e.message) }
    finally { setShippingLoading(false) }
  }

  // ─── Step 2: Proceed to Payment (creates PI, gets authoritative tax) ────────
  const createPaymentIntent = async () => {
    if (!selectedRate) { setError('Please select a shipping method'); return }
    // Swatch-only flow skips the Shippo step, so the address hasn't been
    // validated yet — do it here before creating the PI.
    if (swatchOnly) {
      const err = validate()
      if (err) { setError(err); setTouched({ name: true, email: true, phone: true, address: true, city: true, state: true, zip: true }); return }
    }
    if (wantAccount && !user) {
      if (!emailVerified) { setError('Please verify your email first'); return }
      if (regPassword.length < 6) { setError('Password must be at least 6 characters'); return }
      if (regPassword !== regConfirm) { setError('Passwords do not match'); return }
    }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/store/create-payment-intent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Full config included: the server recomputes the authoritative price
          // for custom items from width/height/options via the pricing engine.
          items:        cart.items.map(i => ({
            productId: i.productId,
            quantity:  i.quantity,
            price:     i.unitPrice,
            width:          i.width,
            height:         i.height,
            widthFraction:  i.widthFraction,
            heightFraction: i.heightFraction,
            options:        i.options,
            // Display fields: these items are persisted to pending_checkouts and
            // become the order's items when the WEBHOOK creates the order (i.e.
            // the browser never reached /api/store/orders). Without them the
            // admin order view has no product name/type/price to render.
            productName:  i.productName,
            productType:  i.productType,
            mainImageUrl: i.mainImageUrl,
            unitPrice:    i.unitPrice,
            isSwatch:     !!i.isSwatch,
          })),
          discountCode: cart.discountCode || null,
          shippingCost,
          // Shipping method + phone — persisted to pending_checkouts so a
          // webhook-created order carries complete display data.
          shippingCarrier: selectedRate?.carrier,
          shippingService: selectedRate?.service,
          shippingRateId:  selectedRate?.rateId,
          customerPhone:   phone.trim(),
          // Full address — needed by Stripe Tax for jurisdiction detection
          street: address,
          city,
          state,
          zip,
          customerEmail: email,
          customerName:  name,
        })
      })
      const data = await res.json() as any
      if (data.success) {
        setClientSecret(data.data.clientSecret)
        // ── Store server-confirmed amounts so the UI matches what Stripe charges ──
        setConfirmedTaxAmount(data.data.taxAmount)
        setConfirmedTotal(data.data.total)
        setTaxIsAuthoritative(data.data.taxIsAuthoritative ?? false)
        setPiTaxSource(data.data.taxSource || 'local')
        // Keep taxRate in sync for any remaining local calculations
        if (typeof data.data.taxRate === 'number') setTaxRate(data.data.taxRate)
      }
      else setError(data.error || 'Failed to initialize payment')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ─── After Payment ───
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const checkoutAddress = {
        name: name.trim(), phone: phone.trim(),
        street1: address.trim(), street2: '',
        city: city.trim(), state: state.trim(), zip: zip.trim(), country: 'US',
      }

      if (wantAccount && !user) {
        const regRes = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: regPassword, name, phone }) })
        const regData = await regRes.json()
        if (regData.success) {
          await fetch('/api/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shipping_address: [checkoutAddress] }) }).catch(() => {})
        }
      }
      if (user) {
        try {
          const meRes = await fetch('/api/auth/me')
          const meData = await meRes.json()
          let existingAddrs: any[] = []
          if (meData.success && meData.data?.user?.shipping_address) {
            const sa = meData.data.user.shipping_address
            if (Array.isArray(sa)) existingAddrs = sa
            else if (sa && typeof sa === 'object' && sa.street1) existingAddrs = [sa]
          }
          const isDuplicate = existingAddrs.some(a =>
            a.street1 === checkoutAddress.street1 && a.city === checkoutAddress.city && a.state === checkoutAddress.state && a.zip === checkoutAddress.zip
          )
          const updatedAddrs = isDuplicate ? existingAddrs : [...existingAddrs, checkoutAddress]
          await fetch('/api/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, shipping_address: updatedAddrs }) })
        } catch {
          await fetch('/api/auth/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, shipping_address: [checkoutAddress] }) }).catch(() => {})
        }
      }

      // Note: subtotal / taxAmount / total are intentionally NOT sent here.
      // The orders endpoint derives all financial figures from the PaymentIntent
      // (via PI metadata and/or server recomputation) — client-supplied amounts
      // are ignored for financial purposes.
      const res = await fetch('/api/store/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: name.trim(), email: email.trim(), phone: phone.trim(), address: { street: address, city, state, zip } },
          items: cart.items.map(i => ({ productId: i.productId, productName: i.productName, productType: i.productType, mainImageUrl: i.mainImageUrl, width: i.width, height: i.height, heightFraction: i.heightFraction, widthFraction: i.widthFraction, options: i.options, quantity: i.quantity, unitPrice: i.unitPrice, isSwatch: !!i.isSwatch })),
          notes: notes.trim(),
          shipping: selectedRate ? { carrier: selectedRate.carrier, service: selectedRate.service, cost: selectedRate.price, rateId: selectedRate.rateId } : null,
          discount: hasDiscount ? { code: cart.discountCode, type: discountType, value: cart.discountPercent, amount: discountAmount } : null,
          paymentIntentId,
        })
      })
      const data = await res.json()
      if (data.success) { clearCart(); router.push(`/store/order-confirmation?order=${data.data.orderNumber}`) }
      else { setError(data.error || 'Order failed but payment was processed. Please contact us.'); setSubmitting(false) }
    } catch { setError('Order failed but payment was processed. Please contact us.'); setSubmitting(false) }
  }

  const formatDimensions = (item: CartItem) => {
    const parts: string[] = []
    if (item.width) parts.push(`W:${item.width}"`)
    if (item.height) { let h = `H:${item.height}`; if (item.heightFraction && item.heightFraction !== '0') h += ` ${item.heightFraction}`; parts.push(h + '"') }
    return parts.join(' × ')
  }

  const inputCls = (field: string, value: string) =>
    `w-full px-4 py-3 border rounded-lg text-sm focus:outline-none transition-colors ${touched[field] && !value.trim() ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gray-800'}`

  const formLocked = shippingCalculated || !!clientSecret

  // Tax label in the order summary
  // Before PI:  "Tax (est.)" — local estimate, NOT the final charge
  // After PI (local):   "Tax (server est.)" — server state-level, still estimate
  // After PI (Stripe):  "Tax" — Stripe Tax, authoritative
  const taxLabel = !shippingCalculated
    ? 'Tax'
    : !clientSecret
      ? `Tax (est.)${taxRate > 0 ? ` (${(taxRate * 100).toFixed(2)}%)` : ''}`
      : taxIsAuthoritative
        ? `Tax${displayTaxAmount > 0 ? ` (Stripe)` : ''}`
        : `Tax (est.)${taxRate > 0 ? ` (${(taxRate * 100).toFixed(2)}%)` : ''}`

  if (loading && !cart.items.length) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <div><h1 className="text-2xl font-light tracking-wide text-gray-900">Checkout</h1><p className="text-sm text-gray-400 mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p></div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-gray-300">Cart</span><span>›</span>
              <span className={!shippingCalculated ? 'text-gray-900 font-medium' : 'text-gray-300'}>Info</span><span>›</span>
              <span className={shippingCalculated && !clientSecret ? 'text-gray-900 font-medium' : 'text-gray-300'}>Shipping</span><span>›</span>
              <span className={clientSecret ? 'text-gray-900 font-medium' : 'text-gray-300'}>Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left */}
          <div className="lg:col-span-3 space-y-6">
            {user && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Logged in as <span className="font-medium">{user.email}</span>
              </div>
            )}

            {/* Contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-medium text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} onBlur={() => setTouched(t => ({ ...t, name: true }))} placeholder="John Doe" className={inputCls('name', name)} disabled={formLocked} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => setTouched(t => ({ ...t, email: true }))} placeholder="john@example.com" className={inputCls('email', email)} disabled={formLocked || !!user} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Phone *</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => setTouched(t => ({ ...t, phone: true }))} placeholder="(555) 123-4567" className={inputCls('phone', phone)} disabled={formLocked} />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-medium text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Street Address *</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} onBlur={() => setTouched(t => ({ ...t, address: true }))} placeholder="123 Main St, Apt 4" className={inputCls('address', address)} disabled={formLocked} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">City *</label><input type="text" value={city} onChange={e => setCity(e.target.value)} onBlur={() => setTouched(t => ({ ...t, city: true }))} placeholder="Los Angeles" className={inputCls('city', city)} disabled={formLocked} /></div>
                  <div><label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">State *</label><input type="text" value={state} onChange={e => setState(e.target.value)} onBlur={() => setTouched(t => ({ ...t, state: true }))} placeholder="CA" className={inputCls('state', state)} disabled={formLocked} /></div>
                  <div><label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">ZIP *</label><input type="text" value={zip} onChange={e => setZip(e.target.value)} onBlur={() => setTouched(t => ({ ...t, zip: true }))} placeholder="90001" className={inputCls('zip', zip)} disabled={formLocked} /></div>
                </div>
              </div>
            </div>

            {/* Create Account */}
            {!user && !clientSecret && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={wantAccount} onChange={e => setWantAccount(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500" />
                  <div><p className="text-sm font-medium text-gray-900">Create an account</p><p className="text-xs text-gray-500 mt-0.5">Track your orders and speed up future checkouts.</p></div>
                </label>
                {wantAccount && (
                  <div className="mt-4 space-y-4">
                    {!emailVerified ? (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <p className="text-xs text-gray-500">Verify your email: <span className="font-medium text-gray-700">{email || '(enter above)'}</span></p>
                        {!codeSent ? (
                          <button onClick={async () => {
                            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setVerifyError('Enter email first'); return }
                            setCodeSending(true); setVerifyError('')
                            const r = await fetch('/api/auth/send-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
                            const d = await r.json(); if (d.success) { setCodeSent(true); setCodeCountdown(60) } else setVerifyError(d.error); setCodeSending(false)
                          }} disabled={codeSending} className="px-4 py-2 bg-[#3d3d3d] text-white text-xs rounded-lg hover:bg-gray-700 disabled:opacity-50">{codeSending ? 'Sending...' : 'Send Verification Code'}</button>
                        ) : (
                          <div className="flex gap-2">
                            <input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" maxLength={6} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono tracking-widest text-center focus:outline-none focus:border-gray-800" />
                            <button onClick={async () => {
                              if (verifyCode.length !== 6) { setVerifyError('Enter 6-digit code'); return }; setVerifyError('')
                              const r = await fetch('/api/auth/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code: verifyCode }) })
                              const d = await r.json(); if (d.success) setEmailVerified(true); else setVerifyError(d.error)
                            }} className="px-4 py-2 bg-[#3d3d3d] text-white text-xs rounded-lg hover:bg-gray-700">Verify</button>
                          </div>
                        )}
                        {codeSent && codeCountdown > 0 && <p className="text-[11px] text-gray-400">Resend in {codeCountdown}s</p>}
                        {codeSent && codeCountdown <= 0 && <button onClick={async () => { setCodeSending(true); const r = await fetch('/api/auth/send-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const d = await r.json(); if (d.success) setCodeCountdown(60); else setVerifyError(d.error); setCodeSending(false) }} className="text-xs text-gray-500 underline underline-offset-4">Resend code</button>}
                        {verifyError && <p className="text-xs text-red-500">{verifyError}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-4 py-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Email verified
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Password *</label><input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="At least 6 characters" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-800" /></div>
                      <div><label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Confirm *</label><input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Repeat" className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none ${regConfirm && regConfirm !== regPassword ? 'border-red-300' : 'border-gray-200 focus:border-gray-800'}`} /></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-medium text-gray-900 mb-4">Order Notes <span className="text-xs text-gray-400 font-normal">(optional)</span></h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any special instructions..." className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-800 resize-none" disabled={!!clientSecret} />
            </div>

            {/* ─── Errors ─── */}
            {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}
            {shippingError && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{shippingError}</div>}
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-gray-900">Order Summary</h2>
                <span className="text-xs text-gray-400">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="space-y-3 mb-4 max-h-[280px] overflow-y-auto">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {item.mainImageUrl ? <Image src={item.mainImageUrl} alt={item.productName} fill sizes="56px" className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No Img</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-[11px] text-gray-400">{formatDimensions(item)} · Qty {item.quantity}</p>
                      {item.options.length > 0 && <p className="text-[11px] text-gray-400 truncate">{item.options.map(o => o.valueLabel).join(', ')}</p>}
                    </div>
                    <p className="text-sm font-medium text-gray-900 flex-shrink-0">${(item.unitPrice * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* ─── Shipping Method (inside summary) ─── */}
              {shippingCalculated && !clientSecret && (
                <div className="border-t border-gray-100 pt-3 mb-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Method</h3>
                    <button onClick={() => { setShippingCalculated(false); setShippingRates([]); setSelectedRate(null); setClientSecret(''); setTaxRate(0); setTaxSource(''); setConfirmedTaxAmount(null); setConfirmedTotal(null); setTaxIsAuthoritative(false); setPiTaxSource('') }}
                      className="text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2">Change</button>
                  </div>
                  {selectedRate && shippingRates.length > 1 ? (
                    <div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{selectedRate.carrier} — {selectedRate.service}</p>
                            {selectedRate.estimatedDays && <p className="text-[10px] text-gray-400">Est. {selectedRate.estimatedDays} days</p>}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">${selectedRate.price.toFixed(2)}</span>
                      </div>
                      <button onClick={() => setSelectedRate(null)} className="text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 mt-1.5 block">Other options</button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {shippingRates.map(rate => (
                        <label key={rate.rateId}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedRate?.rateId === rate.rateId ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className="flex items-center gap-2">
                            <input type="radio" name="shipping" checked={selectedRate?.rateId === rate.rateId}
                              onChange={() => setSelectedRate(rate)} className="w-3.5 h-3.5 text-gray-900 focus:ring-gray-500" />
                            <div>
                              <p className="text-xs font-medium text-gray-900">{rate.carrier} — {rate.service}</p>
                              {rate.estimatedDays && <p className="text-[10px] text-gray-400">Est. {rate.estimatedDays} days</p>}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-gray-900">${rate.price.toFixed(2)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">${subtotal.toLocaleString()}</span></div>
                {hasDiscount && <div className="flex justify-between text-green-600"><span>Discount ({cart.discountCode})</span><span>-${discountAmount.toLocaleString()}</span></div>}
                {selectedRate && (
                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-medium">${selectedRate.price.toFixed(2)}</span></div>
                )}
                {/* Swatch-only: flat two-tier shipping choice (no Shippo call) */}
                {swatchOnly && !clientSecret && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Swatch Shipping</p>
                    {SWATCH_SHIPPING_RATES.map(rate => (
                      <label key={rate.rateId}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedRate?.rateId === rate.rateId ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-2">
                          <input type="radio" name="swatch-shipping" checked={selectedRate?.rateId === rate.rateId}
                            onChange={() => setSelectedRate({ ...rate })} className="w-3.5 h-3.5 text-gray-900 focus:ring-gray-500" />
                          <div>
                            <p className="text-xs font-medium text-gray-900">{rate.carrier} — {rate.service}</p>
                            <p className="text-[10px] text-gray-400">Est. {rate.estimatedDays} days</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">${rate.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                )}
                {!swatchOnly && !shippingCalculated && <div className="flex justify-between text-gray-400"><span>Shipping</span><span className="text-xs italic">Calculated at next step</span></div>}

                {/* ─── Tax line ─── */}
                {shippingCalculated && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{taxLabel}</span>
                    <span className="font-medium">${displayTaxAmount.toFixed(2)}</span>
                  </div>
                )}
                {swatchOnly && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    {clientSecret
                      ? <span className="font-medium">${displayTaxAmount.toFixed(2)}</span>
                      : <span className="text-xs italic text-gray-400">Calculated at payment</span>}
                  </div>
                )}
                {!swatchOnly && !shippingCalculated && (
                  <div className="flex justify-between text-gray-400"><span>Tax</span><span className="text-xs italic">Calculated at next step</span></div>
                )}

                {/* Est. disclaimer — shown only before PI is confirmed as authoritative */}
                {shippingCalculated && !taxIsAuthoritative && (
                  <p className="text-[10px] text-gray-400 leading-tight">
                    * Tax is an estimate. Final tax will be confirmed when you proceed to payment.
                  </p>
                )}

                <div className="flex justify-between text-base font-semibold border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>${displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* ─── Action Buttons ─── */}
              {swatchOnly && !clientSecret && (
                <button onClick={createPaymentIntent} disabled={loading || !selectedRate}
                  className="w-full mt-4 py-3 bg-[#3d3d3d] text-white text-sm font-medium tracking-widest uppercase hover:bg-gray-700 transition-colors rounded disabled:opacity-50">
                  {loading ? 'Loading...' : 'Continue to Payment'}
                </button>
              )}
              {!swatchOnly && !shippingCalculated && !clientSecret && (
                <button onClick={calculateShipping} disabled={shippingLoading}
                  className="w-full mt-4 py-3 bg-[#3d3d3d] text-white text-sm font-medium tracking-widest uppercase hover:bg-gray-700 transition-colors rounded disabled:opacity-50">
                  {shippingLoading ? 'Calculating...' : 'Calculate Shipping'}
                </button>
              )}
              {!swatchOnly && shippingCalculated && !clientSecret && (
                <button onClick={createPaymentIntent} disabled={loading || !selectedRate}
                  className="w-full mt-4 py-3 bg-[#3d3d3d] text-white text-sm font-medium tracking-widest uppercase hover:bg-gray-700 transition-colors rounded disabled:opacity-50">
                  {loading ? 'Loading...' : 'Continue to Payment'}
                </button>
              )}
              <Link href="/store/cart" className="block text-center mt-3 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-4">← Back to Cart</Link>
            </div>

            {/* Payment (below summary) */}
            {clientSecret && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-3">
                <h2 className="text-base font-medium text-gray-900 mb-4">Payment</h2>
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#1a1a1a' } } }}>
                  <PaymentForm onSuccess={handlePaymentSuccess} submitting={submitting} setSubmitting={setSubmitting} />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
