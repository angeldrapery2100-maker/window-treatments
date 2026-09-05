'use client'
// Renders the legal-fact block for a Partner Line product page (Sundance /
// JC). Content comes from PARTNER_LINES (apps/web/src/lib/partnerLines.ts) —
// never hand-write a second copy of this text anywhere else.
//
// Structural requirement, not a design preference: the manufacturer's
// warranty and Angel Drapery's own installation warranty must stay two
// visually and textually separate blocks. Sundance's warranty terms state
// no retailer may modify them in any way — mixing the two into one block
// would blur exactly that line.

import Link from 'next/link'
import { m as motion } from 'framer-motion'
import type { PartnerLine } from '@/lib/partnerLines'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function PartnerFacts({ line }: { line: PartnerLine }) {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16">

        {/* ── Fact strip ── */}
        <div className="w-full bg-white border-y border-gray-100 py-4 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-center">
            {[line.origin, `Lead time ${line.leadTime}`, 'Installed by our own crew'].map((item, i) => (
              <span key={item} className="flex items-center gap-2 md:gap-3">
                {i > 0 && <span className="hidden md:inline text-gray-300">·</span>}
                <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.28em] uppercase text-gray-500">
                  {item}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* ── Block A: Manufacturer Warranty ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="rounded-3xl border border-gray-100 p-8"
          >
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
              MANUFACTURER WARRANTY · {line.brand}
            </span>
            <h3 className="text-xl font-semibold text-[#12141C] mb-4">{line.warrantyHeadline}</h3>
            <ul className="space-y-3 mb-6">
              {line.warrantyPoints.map((point) => (
                <li key={point} className="flex gap-3 text-gray-500 text-sm leading-relaxed">
                  <span className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-2 h-1" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">{line.warrantyExclusions}</p>
            <p className="text-[11px] text-gray-300 leading-relaxed">{line.warrantySource}</p>
          </motion.div>

          {/* ── Block B: Angel Drapery Installation Warranty ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ delay: 0.08 } as any}
            className="rounded-3xl border border-gray-100 p-8 bg-[#F7F6F3]"
          >
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
              ANGEL DRAPERY · OUR OWN COVERAGE
            </span>
            <h3 className="text-xl font-semibold text-[#12141C] mb-4">
              Three years on the part no manufacturer covers
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Neither manufacturer covers the service visit, the labor, or the measuring — both exclude them in
              writing. We do, for three years from installation, on everything we install. Whichever line you
              choose, the call comes to us.
            </p>
            <Link
              href="/warranty"
              className="text-[#12141C] font-medium underline underline-offset-4 hover:text-[#4DB6E8] text-sm"
            >
              See our full warranty →
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
