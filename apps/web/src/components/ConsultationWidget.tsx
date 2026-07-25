'use client'

import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import AntiBotFields, { readAntiBot, type AntiBotHandle } from '@/components/AntiBotFields'

export default function ConsultationWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bookingLink, setBookingLink] = useState('')
  const [error, setError] = useState('')
  // True once Turnstile has a token (or immediately if Turnstile is off).
  const [verifyReady, setVerifyReady] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const antiBotRef = useRef<AntiBotHandle>(null)

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
      // Anti-bot fields (honeypot, fill time, Turnstile token) — see AntiBotFields.
      ...readAntiBot(formData),
      // Token straight from the widget (reliable; FormData proved flaky).
      turnstileToken: antiBotRef.current?.getToken() || '',
    }

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit')
      }

      // If the backend registered the lead and returned a booking link, show it.
      if (typeof json.bookingLink === 'string' && /^https?:\/\//.test(json.bookingLink)) {
        setBookingLink(json.bookingLink)
      }
      setSubmitted(true)
      formRef.current?.reset()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
      // Turnstile tokens are single-use — get a fresh one for any retry.
      antiBotRef.current?.reset()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset submitted state after close animation
    setTimeout(() => {
      setSubmitted(false)
      setError('')
      setBookingLink('')
    }, 300)
  }

  return (
    <>
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
        className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[999] w-full sm:w-[400px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl transition-all duration-300 ease-out flex flex-col max-h-[88dvh] sm:max-h-[85vh] ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
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

        {/* Content — scrolls inside the sheet so tall forms (with the Turnstile
            widget) never push the top fields above the viewport on mobile. */}
        <div className="px-6 py-5 overflow-y-auto overscroll-contain flex-1">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">Thank You!</h4>
              <p className="text-sm text-gray-500">We&apos;ve received your request and will contact you shortly.</p>
              {bookingLink && (
                <div className="mt-5">
                  <a
                    href={bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
                  >
                    📅 Book your appointment
                  </a>
                  <p className="mt-2 text-xs text-gray-400">We&apos;ve also texted this link to your phone.</p>
                </div>
              )}
              <button
                onClick={handleClose}
                className="mt-5 block mx-auto text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Close
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* AI Design Assistant recommendation — nudge visitors to try
                  instant, self-serve help before (or instead of) leaving contact
                  details. The button closes this form and pops open the chat via
                  the global 'ad:open-assistant' event that StoreAssistant listens
                  for. */}
              <button
                type="button"
                onClick={() => {
                  handleClose()
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('ad:open-assistant'))
                  }
                }}
                className="group w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition-colors hover:border-gray-300 hover:bg-gray-100"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none">💬</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Prefer instant answers? Ask our AI Design Assistant
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                      Measure your windows step by step · see the real price for your exact
                      size · get product picks and book a visit — instantly, in any language.
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-gray-900">
                      Chat with the AI Assistant
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                      <span className="ml-1.5 text-[11px] font-normal text-gray-400">我们也说中文</span>
                    </span>
                  </div>
                </div>
              </button>

              {/* Divider with a soft "or leave your details" label */}
              <div className="flex items-center gap-3 pt-1">
                <span className="h-px flex-1 bg-gray-100" />
                <span className="text-[11px] uppercase tracking-wide text-gray-400">or request a callback</span>
                <span className="h-px flex-1 bg-gray-100" />
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

              {/* Honeypot + fill-time + Turnstile (explicit render, robust for
                  this on-open-mounted panel). */}
              <AntiBotFields ref={antiBotRef} onReady={setVerifyReady} />

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !verifyReady}
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
                ) : !verifyReady ? (
                  'Verifying…'
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
