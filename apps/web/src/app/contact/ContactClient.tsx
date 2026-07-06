'use client'

import { useState } from 'react'
import { m as motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { MAPS_EMBED_URL } from '@/lib/site'
import SiteFooter from '@/components/SiteFooter'
import AntiBotFields, { readAntiBot } from '@/components/AntiBotFields'

interface ContactData {
  title: string
  subtitle: string
  address: string
  email: string
  phones: string[]
  qrLine: { url: string; alt: string } | null
  qrWechat: { url: string; alt: string } | null
}

interface Props {
  contact: ContactData
  footer: { copyright: string }
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function ContactClient({ contact, footer }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const data = new FormData(form)
    const body = {
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      address: data.get('address'),
      message: data.get('message'),
      // A2P 10DLC: explicit, verifiable SMS opt-in. Unchecked by default and
      // optional, so this is a true affirmative consent record.
      smsConsent: data.get('smsConsent') === 'on',
      // Anti-bot fields required by /api/consultation (honeypot, fill time,
      // Turnstile token) — without these the endpoint rejects the form (403).
      ...readAntiBot(data),
    }
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSubmitStatus({ type: 'success', message: 'Your message has been sent. We\'ll be in touch shortly!' })
        form.reset()
      } else {
        throw new Error('Failed')
      }
    } catch {
      setSubmitStatus({ type: 'error', message: 'Something went wrong. Please call us directly.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#12141C]">

      {/* ── Hero ── */}
      <section className="relative h-[55vh] overflow-hidden flex items-end">
        <img
          src="/roman-shade/IMG_0298_Original.JPG"
          alt="Angel Drapery showroom"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

        <SiteNav activePage="Contact" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-16 w-full">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="text-[#4DB6E8] text-[10px] font-bold tracking-[0.4em] uppercase block mb-4">
              Temple City, CA · Since 1984
            </span>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-none">
              Let&apos;s Talk <br />
              <span className="font-serif italic text-white/70">Window Treatments.</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="w-full py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* ── Left: Contact Details ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tighter mb-3">{contact.title}</h2>
              <p className="text-gray-500 leading-relaxed">{contact.subtitle}</p>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4 group">
              <div className="relative flex items-center justify-center w-8 h-8 mt-0.5 shrink-0">
                <motion.div
                  className="absolute w-8 h-8 bg-[#4DB6E8] rounded-full"
                  animate={{ scale: [1, 2.2], opacity: [0.35, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                />
                <svg viewBox="0 0 24 24" className="w-5 h-5 relative z-10 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Address</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-gray-800 text-lg leading-relaxed hover:text-[#4DB6E8] transition-colors"
                >
                  {contact.address}
                </a>
                <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-semibold tracking-widest text-amber-700 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  By Appointment Only
                </span>
              </div>
            </div>

            {/* Phones — one prominent primary line; extra lines stay quiet to avoid confusion */}
            <div className="space-y-4">
              {contact.phones.slice(0, 1).map((phone, i) => {
                const clean = phone.replace(/[^0-9]/g, '')
                return (
                  <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400">Call or Text</span>
                      <a href={`tel:${phone}`} className="text-2xl md:text-3xl font-medium hover:text-[#4DB6E8] transition-colors">
                        {phone}
                      </a>
                    </div>
                    <motion.a
                      href={`sms:+1${clean}`}
                      whileHover={{ scale: 1.1 }}
                      className="ml-2 p-2 rounded-full bg-gray-50 hover:bg-[#4DB6E8]/10 transition-colors"
                      title="Text for a quote"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400 fill-none stroke-current stroke-[1.5]">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </motion.a>
                  </div>
                )
              })}
              {contact.phones.length > 1 && (
                <p className="text-xs text-gray-400">
                  Workroom &amp; office lines:{' '}
                  {contact.phones.slice(1).map((p, i) => (
                    <span key={p}>
                      {i > 0 && ' · '}
                      <a href={`tel:${p}`} className="hover:text-gray-600 transition-colors">{p}</a>
                    </span>
                  ))}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <a href={`mailto:${contact.email}`} className="text-lg text-gray-700 hover:text-[#4DB6E8] transition-colors">
                {contact.email}
              </a>
            </div>

            {/* QR Codes */}
            {(contact.qrLine?.url || contact.qrWechat?.url) && (
              <div className="flex gap-8 pt-6 border-t border-gray-100">
                {contact.qrLine?.url && (
                  <div className="text-center">
                    <div className="relative w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center mb-2 border border-gray-200 overflow-hidden">
                      <img src={contact.qrLine.url} alt="LINE QR" className="w-[85%] h-[85%] object-contain" />
                    </div>
                    <p className="text-[10px] tracking-widest text-gray-500 uppercase">LINE</p>
                  </div>
                )}
                {contact.qrWechat?.url && (
                  <div className="text-center">
                    <div className="relative w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center mb-2 border border-gray-200 overflow-hidden">
                      <img src={contact.qrWechat.url} alt="WeChat QR" className="w-[85%] h-[85%] object-contain" />
                    </div>
                    <p className="text-[10px] tracking-widest text-gray-500 uppercase">WeChat</p>
                  </div>
                )}
              </div>
            )}

            {/* Google Maps embed */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md h-48">
              <iframe
                title="Angel Drapery Location"
                width="100%"
                height="100%"
                loading="lazy"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
                src={MAPS_EMBED_URL}
              />
            </div>
          </motion.div>

          {/* ── Right: Contact Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-50 p-8 md:p-10 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50"
          >
            <h3 className="text-2xl font-light tracking-tight mb-2">Request a Consultation</h3>
            <p className="text-gray-500 text-sm mb-8">Free in-home measurement and design consultation — no obligation.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                name="name" type="text" required placeholder="Your Name *" aria-label="Your Name"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
              />
              <input
                name="email" type="email" required placeholder="Email Address *" aria-label="Email Address"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
              />
              <input
                name="phone" type="tel" required placeholder="Phone Number *" aria-label="Phone Number"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
              />

              {/* SMS opt-in (A2P 10DLC) — directly below phone, unchecked by default, optional */}
              <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-gray-500">
                <input
                  type="checkbox" name="smsConsent" defaultChecked={false}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span>
                  I agree to receive text messages (SMS) from Angel Drapery, Inc at the phone
                  number provided, about my inquiry — appointment scheduling, intake forms, and
                  quote and order updates. Message frequency varies. Msg &amp; data rates may apply.
                  Reply STOP to opt out, HELP for help. Consent is not a condition of any purchase.
                  See our <Link href="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link> and{' '}
                  <Link href="/terms" className="underline hover:text-gray-700">SMS Terms</Link>.
                </span>
              </label>

              <input
                name="address" type="text" placeholder="Project Address (Optional)" aria-label="Project Address (optional)"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
              />
              <textarea
                name="message" rows={4} placeholder="Tell us about your window treatment project..." aria-label="Project details"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all resize-none"
              />

              <AntiBotFields />

              <AnimatePresence>
                {submitStatus.type && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className={`text-sm text-center py-2 px-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                  >
                    {submitStatus.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isSubmitting || submitStatus.type === 'success'}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 bg-[#12141C] text-white rounded-sm font-medium tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending…' : submitStatus.type === 'success' ? 'Message Sent ✓' : 'Send Message'}
              </motion.button>

              <p className="text-[11px] text-gray-400 text-center mt-2">
                Or call us directly at <a href="tel:626-451-9841" className="underline hover:text-gray-700">626-451-9841</a>
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ── Warranty & Service ── */}
      <section className="w-full border-t border-gray-100 bg-[#F8F8F6] py-14 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gray-500 mb-6">Warranty &amp; Service</p>
          <div className="grid gap-8 md:grid-cols-2 text-sm leading-relaxed text-gray-600">
            <div>
              <h3 className="text-base font-medium text-[#12141C] mb-2">Three-Year Installation Warranty</h3>
              <p>Our installation work is covered for three years — if anything we installed needs attention, we'll come back and fix it, free of charge.</p>
            </div>
            <div>
              <h3 className="text-base font-medium text-[#12141C] mb-2">Free In-Home Measurement</h3>
              <p>Consultations and measurements are always free within our service area — we measure every window ourselves before fabrication.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark CTA ── */}
      <section className="bg-[#12141C] py-20 px-6 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl mx-auto space-y-6">
          <span className="text-[#4DB6E8] text-[10px] font-bold tracking-[0.4em] uppercase">Showroom Hours</span>
          <p className="text-white/80 text-lg font-light">
            Mon – Fri &nbsp;9:00 am – 5:00 pm &nbsp;·&nbsp; Sat &nbsp;10:00 am – 3:00 pm
          </p>
          <p className="text-white/50 text-sm tracking-wide">
            ✦ &nbsp;Showroom visits are by appointment only — please call or submit the form to schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/gallery">
              <motion.span whileHover={{ scale: 1.04 }} className="inline-block border border-white/30 px-8 py-3 text-white text-sm tracking-widest uppercase hover:bg-white/10 transition-colors rounded-sm cursor-pointer">
                View Our Work
              </motion.span>
            </Link>
            <Link href="/products">
              <motion.span whileHover={{ scale: 1.04 }} className="inline-block bg-white px-8 py-3 text-[#12141C] text-sm tracking-widest uppercase hover:bg-gray-100 transition-colors rounded-sm cursor-pointer">
                Explore Products
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <SiteFooter dark copyright={footer.copyright} />
    </main>
  )
}
