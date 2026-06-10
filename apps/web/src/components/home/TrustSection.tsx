'use client'

import { m as motion } from 'framer-motion'
import { CA_LICENSE } from '@/lib/site'

// Homepage trust block — sits between the hero and the brand wall.
// Facts only (license / years in business / free measurement + warranty) —
// no curated testimonial cards, which read as staged.

const BADGES: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: 'Licensed & Insured',
    desc: `CA License #${CA_LICENSE}`,
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: '40+ Years Serving Greater Los Angeles',
    desc: 'Family workroom in Temple City since 1984',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: 'Free In-Home Measurement',
    desc: 'Installation warranty on every project',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
]

export default function TrustSection() {
  return (
    <section className="w-full bg-[#F8F8F6] py-14 md:py-20 border-b border-gray-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Trust badges */}
        <div className="grid gap-4 sm:grid-cols-3 md:gap-6">
          {BADGES.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-sm"
            >
              <div className="mt-0.5 text-[#4DB6E8]">{b.icon}</div>
              <div>
                <p className="text-sm font-semibold text-[#12141C] leading-snug">{b.title}</p>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
