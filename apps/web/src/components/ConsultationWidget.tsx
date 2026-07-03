'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

// Public Turnstile site key. When unset (local dev / preview without the key)
// the widget is skipped and the server-side check skips too, so the form works.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export default function ConsultationWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // Timestamp (ms) of when the form became visible, for the minimum-fill-time
  // anti-bot check. Reset each time the panel opens.
  const renderedAtRef = useRef<number>(0)

  useEffect(() => {
    if (isOpen) renderedAtRef.current = Date.now()
  }, [isOpen])

  // Hide on store and admin pages
  if (pathname.startsWith('/store') || pathname.startsWith('/admin')) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      notes: formData.get('notes') as string,
      // A2P 10DLC: explicit, verifiable SMS opt-in. Unchecked + optional.
      smsConsent: formData.get('smsConsent') === 'on',
      // Anti-bot: honeypot field (must stay empty), time-on-screen, and the
      // Turnstile token that the widget injects into the form as a hidden input.
      company: (formData.get('company') as string) || '',
      elapsedMs: renderedAtRef.current ? Date.now() - renderedAtRef.current : 10000,
      turnstileToken: (formData.get('cf-turnstile-response') as string) || '',
    }

    try {
      const res = await fetch('/api/consultation', {
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset submitted state after close animation
    setTimeout(() => {
      setSubmitted(false)
      setError('')
    }, 300)
  }

  return (
    <>
      {/* Load the Turnstile script only when a site key is configured. */}
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
          strategy="afterInteractive"
        />
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998] transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[999] flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-300 group ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Request a consultation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          />
        </svg>
        <span className="text-sm font-medium tracking-wide">Request Consultation</span>
      </button>

      {/* Slide-up Panel */}
      <div
        ref={panelRef}
        className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[999] w-full sm:w-[400px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl transition-all duration-300 ease-out ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Request a Consultation</h3>
            <p className="text-xs text-gray-500 mt-0.5">We&apos;ll get back to you within 24 hours</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">Thank You!</h4>
              <p className="text-sm text-gray-500">We&apos;ve received your request and will contact you shortly.</p>
              <button
                onClick={handleClose}
                className="mt-5 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Close
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot — hidden from humans; only bots fill this. Positioned
                  off-screen (more robust than display:none, which some bots skip).
                  Do not remove. */}
              <div
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
              >
                <label htmlFor="cw-company">Company</label>
                <input
                  id="cw-company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="cw-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="cw-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="cw-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  id="cw-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="(555) 123-4567"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>

              {/* SMS opt-in (A2P 10DLC) — directly below phone, unchecked by default, optional */}
              <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-gray-500">
                <input
                  type="checkbox" name="smsConsent" defaultChecked={false}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span>
                  I agree to receive text messages (SMS) from Angel Drapery, Inc at the phone
                  number provided, about my inquiry — appointment scheduling, intake forms, and
                  quote and order updates. Message frequency varies. Msg &amp; data rates may apply.
                  Reply STOP to opt out, HELP for help. Consent is not a condition of any purchase.
                  See our <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a> and{' '}
                  <a href="/terms" className="underline hover:text-gray-700">SMS Terms</a>.
                </span>
              </label>

              {/* Email */}
              <div>
                <label htmlFor="cw-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="cw-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="cw-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="cw-notes"
                  name="notes"
                  rows={3}
                  placeholder="Tell us about your project — room type, window size, style preferences..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors resize-none"
                />
              </div>

              {/* Cloudflare Turnstile — renders a challenge and injects a hidden
                  input named "cf-turnstile-response" into this form. Rendered only
                  when a site key is configured. */}
              {TURNSTILE_SITE_KEY && (
                <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
              )}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
                  'Submit Request'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
