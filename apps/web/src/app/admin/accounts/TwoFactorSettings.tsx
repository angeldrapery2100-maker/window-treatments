'use client'

import { useState, useEffect } from 'react'

// Self-service two-factor (TOTP) for the signed-in admin. Opt-in; enabling
// requires verifying a code first, so it can never lock you out by accident.
export default function TwoFactorSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [step, setStep] = useState<'idle' | 'setup' | 'disable'>('idle')
  const [secret, setSecret] = useState('')
  const [otpauth, setOtpauth] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = async () => {
    try {
      const r = await fetch('/api/auth/2fa')
      const d = await r.json()
      if (d.success) setEnabled(d.data.enabled)
    } catch { setEnabled(false) }
  }
  useEffect(() => { load() }, [])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const startSetup = async () => {
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/auth/2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'setup' }) })
      const d = await r.json()
      if (d.success) { setSecret(d.data.secret); setOtpauth(d.data.otpauth); setStep('setup'); setCode('') }
      else setErr(d.error || 'Could not start setup')
    } catch { setErr('Could not start setup') } finally { setBusy(false) }
  }

  const confirmEnable = async () => {
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/auth/2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'enable', code }) })
      const d = await r.json()
      if (d.success) { setStep('idle'); setEnabled(true); setSecret(''); setCode(''); flash('Two-factor authentication is on.') }
      else setErr(d.error || 'Could not enable')
    } catch { setErr('Could not enable') } finally { setBusy(false) }
  }

  const confirmDisable = async () => {
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/auth/2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'disable', code }) })
      const d = await r.json()
      if (d.success) { setStep('idle'); setEnabled(false); setCode(''); flash('Two-factor authentication is off.') }
      else setErr(d.error || 'Could not disable')
    } catch { setErr('Could not disable') } finally { setBusy(false) }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Two-Factor Authentication</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {enabled === null ? 'Checking…' : enabled
              ? 'On — a 6-digit code from your authenticator app is required at login.'
              : 'Off — add an extra layer of security to your admin login.'}
          </p>
        </div>
        {step === 'idle' && enabled !== null && (
          enabled
            ? <button onClick={() => { setStep('disable'); setCode(''); setErr('') }} className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Turn Off</button>
            : <button onClick={startSetup} disabled={busy} className="px-3 py-1.5 text-xs rounded-lg bg-[#3d3d3d] text-white hover:bg-gray-700 disabled:opacity-50">Turn On</button>
        )}
      </div>

      {msg && <p className="text-xs text-green-600 mt-3">{msg}</p>}

      {step === 'setup' && (
        <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs text-gray-600">1. In your authenticator app (Google Authenticator, Authy, 1Password…), add an account using this setup key:</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
            <code className="text-sm font-mono tracking-wider break-all text-gray-900">{secret}</code>
          </div>
          <p className="text-[11px] text-gray-400 break-all">Or use this URI: {otpauth}</p>
          <p className="text-xs text-gray-600">2. Enter the 6-digit code it shows to confirm:</p>
          <div className="flex gap-2">
            <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <button onClick={confirmEnable} disabled={busy || code.length !== 6} className="px-4 py-2 text-xs rounded-lg bg-[#3d3d3d] text-white hover:bg-gray-700 disabled:opacity-50">Verify & Enable</button>
            <button onClick={() => { setStep('idle'); setErr('') }} className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Cancel</button>
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      )}

      {step === 'disable' && (
        <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs text-gray-600">Enter a current 6-digit code to turn off two-factor authentication:</p>
          <div className="flex gap-2">
            <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <button onClick={confirmDisable} disabled={busy || code.length !== 6} className="px-4 py-2 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">Turn Off</button>
            <button onClick={() => { setStep('idle'); setErr('') }} className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Cancel</button>
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      )}
    </div>
  )
}
