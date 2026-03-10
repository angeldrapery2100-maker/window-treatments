'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export interface LumaCardData {
  name: string
  tag: string
  desc: string
  image: string
  href: string
}

export interface LumaShowcaseProps {
  cards?: LumaCardData[]
}

const DEFAULTS: LumaCardData[] = [
  {
    name: 'Zebra Shade',
    tag: 'Dual-Layer Light Control',
    desc: 'Alternate sheer and solid bands glide effortlessly to dial in exactly the right light and privacy.',
    image: '/luma-collection/lifestyle-dark-livingroom.png',
    href: '/products/luma-collection',
  },
  {
    name: 'Roller Shade',
    tag: 'Clean · Minimal · Versatile',
    desc: 'A single smooth fabric panel that rolls away completely, keeping your view unobstructed and your lines razor-clean.',
    image: '/roller-collection/lifestyle-minimalist.png',
    href: '/products/roller-collection',
  },
  {
    name: 'Sheer Shade',
    tag: 'Soft Light · Warm Ambiance',
    desc: 'Gossamer fabric diffuses sunlight into a gentle luminous glow — the effortless way to brighten any room without glare.',
    image: '/sheer-collection/lifestyle-sheer-sunlit.png',
    href: '/products/sheer-collection',
  },
]

export default function LumaShowcase({ cards }: LumaShowcaseProps) {
  const products = cards && cards.length === 3 ? cards : DEFAULTS
  return (
    <section className="w-full bg-transparent pt-24 pb-8 md:pt-32 md:pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-[#4DB6E8] text-[10px] font-bold tracking-[0.45em] uppercase mb-5 block">
              <span className="inline-block w-5 h-px bg-[#4DB6E8]" />
              Luma Collection
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter text-[#12141C] leading-[1]">
              Custom made.
              <br />
              <span className="text-[#12141C]/30">Smart value for</span>
              <br />
              <span className="text-[#12141C]/30">modern homes.</span>
            </h2>
          </div>

          <div className="hidden md:block md:text-right max-w-xs">
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Every shade is made to measure — cut and assembled precisely
              for your window, your space, and your style.
            </p>
            <Link
              href="/products/luma-collection"
              className="inline-flex items-center gap-2 text-[#12141C] text-[11px] tracking-widest uppercase font-semibold border-b border-[#12141C]/30 pb-0.5 hover:border-[#12141C] transition-colors"
            >
              View all collections
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* ── Three cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link
                href={p.href}
                className="group block relative overflow-hidden rounded-2xl h-[500px] md:h-[560px] bg-gray-100"
              >
                {/* Image */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Gradient overlay — darker at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />

                {/* Top badges */}
                <div className="absolute top-5 left-5 right-5 flex items-start justify-between gap-2">
                  <span className="inline-block bg-white/15 backdrop-blur-md text-white text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full border border-white/20">
                    {p.tag}
                  </span>
                  <span className="inline-block bg-[#4DB6E8]/20 backdrop-blur-md text-[#4DB6E8] text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border border-[#4DB6E8]/30 whitespace-nowrap">
                    Custom Made
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <h3 className="text-2xl font-light tracking-tight text-white mb-2">
                    {p.name}
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed mb-5 max-w-[240px]">
                    {p.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-white text-[11px] tracking-widest uppercase font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                    Explore
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>

                {/* Hover ring */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 group-hover:ring-white/20 transition-all duration-500 pointer-events-none" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom value strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="hidden md:grid mt-12 grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-t border-gray-100 pt-10"
        >
          {[
            {
              num: '01',
              label: 'Made to Measure',
              desc: 'Every shade is cut to your exact window dimensions — no adapters, no compromise.',
            },
            {
              num: '02',
              label: 'Smart Value',
              desc: 'Premium craftsmanship without the premium markup. Transparent pricing from day one.',
            },
            {
              num: '03',
              label: 'Modern Living',
              desc: 'Motorized, cordless or chain — engineered to match the way you live today.',
            },
          ].map((v) => (
            <div key={v.num} className="flex items-start gap-4 py-6 md:py-0 md:px-8 first:pl-0 last:pr-0">
              <span className="text-[11px] font-bold text-[#4DB6E8] mt-0.5 flex-shrink-0">{v.num}</span>
              <div>
                <p className="text-[#12141C] text-sm font-semibold mb-1">{v.label}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
