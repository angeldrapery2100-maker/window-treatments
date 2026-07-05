'use client'

import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

// Public Turnstile site key. When unset (local dev / preview without the key)
// the widget is skipped and the server-side check skips too, so the form works.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const PRODUCT_OPTIONS = [
  'Custom Drapery',
  'Roman Shades',
  'Roller Shades',
  'Drapery Hardware/Track',
  'Motorized',
]

const ROOM_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+']
const WINDOW_OPTIONS = ['1–3', '4–6', '7–10', '11–15', '16–20', '20+']
const BUDGET_OPTIONS = [
  { value: '<$2k', label: 'Under $2,000' },
  { value: '$2-5k', label: '$2,000 – $5,000' },
  { value: '$5-10k', label: '$5,000 – $10,000' },
  { value: '$10k+', label: '$10,000+' },
  { value: 'not sure', label: 'Not sure yet' },
]

const inputCls =
  'w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function WholeHomeClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  // Timestamp (ms) of when the form rendered, for the minimum-fill-time
  // anti-bot check (mirrors ConsultationWidget).
  const renderedAtRef = useRef<number>(0)

  useEffect(() => {
    renderedAtRef.current = Date.now()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: (formData.get('address') as string) || '',
      rooms: (formData.get('rooms') as string) || '',
      windows: (formData.get('windows') as string) || '',
      products: formData.getAll('products') as string[],
      budget: (formData.get('budget') as string) || '',
      contactMethod: (formData.get('contactMethod') as string) || '',
      message: (formData.get('message') as string) || '',
      // Anti-bot: honeypot field (must stay empty), time-on-screen, and the
      // Turnstile token injected into the form as a hidden input.
      company: (formData.get('company') as string) || '',
      elapsedMs: renderedAtRef.current ? Date.now() - renderedAtRef.current : 10000,
      turnstileToken: (formData.get('cf-turnstile-response') as string) || '',
    }

    try {
      const res = await fetch('/api/store/whole-home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to submit')
      }

      setSubmitted(true)
      formRef.current?.reset()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Load the Turnstile script only when a site key is configured. */}
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
          strategy="afterInteractive"
        />
      )}

      {/* Hero */}
      <section className="relative w-full h-[45vh] min-h-[340px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <SiteNav activePage="Online Store" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10 px-6">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide text-white mb-4 drop-shadow-2xl">
              Whole-Home Custom
            </h1>
            <p className="text-white/90 text-base md:text-lg tracking-wide drop-shadow-lg max-w-2xl mx-auto">
              One designer. Every room. Measured, matched, and quoted for you.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="w-full bg-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-gray-900 mb-4">
            Furnishing multiple rooms?
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            For multi-room and whole-home projects, our design team works with you one-on-one —
            we help you measure every window, choose coordinating fabrics, and put together a
            complete quote. Enjoy a <span className="font-medium text-gray-900">free in-home consultation</span> within
            our Los Angeles service area, or remote assistance with photos if you&apos;re outside it.
            Tell us about your project below and our design team will contact you within 1 business day.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="w-full bg-gray-50 py-14 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Thank You!</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We&apos;ve received your request. Our design team will contact you within 1 business day
                to talk through your project and schedule your consultation.
              </p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 space-y-5">
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Request a Design Consultation</h3>
                <p className="text-xs text-gray-500 mt-0.5">Free, no obligation. We&apos;ll reach out within 1 business day.</p>
              </div>

              {/* Honeypot — hidden from humans; only bots fill this. Positioned
                  off-screen (more robust than display:none). Do not remove. */}
              <div
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
              >
                <label htmlFor="wh-company">Company</label>
                <input id="wh-company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wh-name" className={labelCls}>
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input id="wh-name" name="name" type="text" required placeholder="Your full name" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="wh-phone" className={labelCls}>
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input id="wh-phone" name="phone" type="tel" required placeholder="(555) 123-4567" className={inputCls} />
                </div>
              </div>

              <div>
                <label htmlFor="wh-email" className={labelCls}>
                  Email <span className="text-red-400">*</span>
                </label>
                <input id="wh-email" name="email" type="email" required placeholder="you@example.com" className={inputCls} />
              </div>

              <div>
                <label htmlFor="wh-address" className={labelCls}>Project Address</label>
                <input id="wh-address" name="address" type="text" placeholder="Street, City, State, ZIP" className={inputCls} />
                <p className="text-xs text-gray-400 mt-1">Helps us confirm free in-home consultation availability in the LA area.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wh-rooms" className={labelCls}>Number of Rooms</label>
                  <select id="wh-rooms" name="rooms" defaultValue="" className={inputCls}>
                    <option value="">Select…</option>
                    {ROOM_OPTIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="wh-windows" className={labelCls}>Number of Windows</label>
                  <select id="wh-windows" name="windows" defaultValue="" className={inputCls}>
                    <option value="">Select…</option>
                    {WINDOW_OPTIONS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className={labelCls}>Interested Products</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {PRODUCT_OPTIONS.map(p => (
                    <label key={p} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        name="products"
                        value={p}
                        className="h-4 w-4 shrink-0 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="wh-budget" className={labelCls}>Budget Range</label>
                <select id="wh-budget" name="budget" defaultValue="" className={inputCls}>
                  <option value="">Select…</option>
                  {BUDGET_OPTIONS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className={labelCls}>Preferred Contact Method</span>
                <div className="flex flex-wrap gap-5 mt-1">
                  {[
                    { value: 'phone', label: 'Phone Call' },
                    { value: 'text', label: 'Text Message' },
                    { value: 'email', label: 'Email' },
                  ].map(m => (
                    <label key={m.value} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="contactMethod"
                        value={m.value}
                        className="h-4 w-4 shrink-0 border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="wh-message" className={labelCls}>Message</label>
                <textarea
                  id="wh-message"
                  name="message"
                  rows={4}
                  placeholder="Tell us about your project — rooms, style preferences, timeline, anything that helps us prepare…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Cloudflare Turnstile — renders a challenge and injects a hidden
                  input named "cf-turnstile-response" into this form. Rendered only
                  when a site key is configured. */}
              {TURNSTILE_SITE_KEY && (
                <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gray-900 text-white text-sm font-medium tracking-widest uppercase rounded-lg hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Request Free Consultation'
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
