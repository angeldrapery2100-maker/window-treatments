'use client'

import { useState } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { motion, AnimatePresence } from 'framer-motion'
import PriceEstimator from '@/components/PriceEstimator'

const BASE = '/sheer-collection'
const SW   = `${BASE}/swatches`

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } },
}
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

// ── Swatch Data ─────────────────────────────────────────────────────────────
// E Series — Standard Sheer (9 patterns)
const ePatterns = [
  { pattern: 'E1',  colors: ['E1-001.jpg','E1-002.jpg','E1-003.jpg','E1-004.jpg','E1-005.jpg','E1-006.jpg'] },
  { pattern: 'E2',  colors: ['E2-001.jpg','E2-002.jpg','E2-003.jpg','E2-004.jpg','E2-005.jpg','E2-006.jpg','E2-007.jpg','E2-008.jpg'] },
  { pattern: 'E3',  colors: ['E3-001.jpg','E3-002.jpg','E3-003.jpg','E3-004.jpg','E3-005.jpg','E3-006.jpg'] },
  { pattern: 'E5',  colors: ['E5-001.jpg','E5-002.jpg','E5-003.jpg'] },
  { pattern: 'E6',  colors: ['E6-001.jpg','E6-002.jpg','E6-003.jpg','E6-004.jpg'] },
  { pattern: 'E7',  colors: ['E7-001.jpg','E7-002.jpg','E7-003.jpg'] },
  { pattern: 'E8',  colors: ['E8-001.jpg','E8-002.jpg','E8-003.jpg','E8-004.jpg','E8-005.jpg','E8-006.jpg','E8-007.jpg','E8-008.jpg'] },
  { pattern: 'E9',  colors: ['E9-001.jpg','E9-002.jpg','E9-003.jpg','E9-004.jpg','E9-005.jpg','E9-006.jpg','E9-007.jpg','E9-008.jpg'] },
  { pattern: 'E11', colors: ['E11-001.jpg','E11-002.jpg','E11-003.jpg','E11-004.jpg','E11-005.jpg','E11-006.jpg','E11-007.jpg','E11-008.jpg','E11-009.jpg','E11-010.jpg','E11-011.jpg','E11-012.jpg'] },
]

// EB Series — Embossed Sheer (3 patterns)
const ebPatterns = [
  { pattern: 'EB4',  colors: ['EB4-001.jpg','EB4-002.jpg','EB4-003.jpg','EB4-004.jpg','EB4-005.jpg','EB4-006.jpg','EB4-007.jpg'] },
  { pattern: 'EB10', colors: ['EB10-001.jpg','EB10-002.jpg','EB10-003.jpg','EB10-004.jpg','EB10-005.jpg','EB10-006.jpg','EB10-007.jpg','EB10-008.jpg'] },
  { pattern: 'EB12', colors: ['EB12-001.jpg','EB12-002.jpg','EB12-003.jpg','EB12-004.jpg','EB12-005.jpg','EB12-006.jpg','EB12-007.jpg','EB12-008.jpg','EB12-009.jpg','EB12-010.jpg','EB12-011.jpg','EB12-012.jpg'] },
]

// N Series — Natural Woven (3 patterns)
const nPatterns = [
  { pattern: 'N1',  colors: ['N1-001.jpg','N1-002.jpg','N1-003.jpg','N1-004.jpg'] },
  { pattern: 'N2',  colors: ['N2-001.jpg','N2-002.jpg','N2-003.jpg','N2-004.jpg'] },
  { pattern: 'NB3', colors: ['NB3-001.jpg','NB3-002.jpg','NB3-003.jpg','NB3-004.jpg'] },
]

type SwatchTab = 'e' | 'eb' | 'n'

export default function SheerCollectionClient() {
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({})
  const [lightbox, setLightbox] = useState<{ srcs: string[]; idx: number; label: string } | null>(null)
  const [activeTab, setActiveTab] = useState<SwatchTab>('e')

  const openLightbox  = (srcs: string[], idx: number, label: string) => setLightbox({ srcs, idx, label })
  const closeLightbox = () => setLightbox(null)
  const lbPrev = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx - 1 + prev.srcs.length) % prev.srcs.length } : null)
  const lbNext = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx + 1) % prev.srcs.length } : null)

  const activePatterns = activeTab === 'e' ? ePatterns : activeTab === 'eb' ? ebPatterns : nPatterns
  const tabLabel       = activeTab === 'e' ? 'Standard Sheer' : activeTab === 'eb' ? 'Embossed Sheer' : 'Natural Woven'

  const galleryImages = [
    { src: `${BASE}/lifestyle-sheer-living-room.png`, alt: 'Sheer shades in living room' },
    { src: `${BASE}/lifestyle-sheer-bedroom.png`,     alt: 'Sheer shades in bedroom' },
    { src: `${BASE}/lifestyle-sheer-dining.png`,      alt: 'Sheer shades in dining room' },
    { src: `${BASE}/lifestyle-sheer-sunlit.png`,      alt: 'Sunlit room with sheer shades' },
    { src: `${BASE}/lifestyle-sheer-office.png`,      alt: 'Home office with sheer shades' },
    { src: `${BASE}/lifestyle-sheer-modern.png`,      alt: 'Modern space with sheer shades' },
  ]

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative w-full h-[70vh] min-h-[540px] overflow-hidden bg-[#d8cfc4]">
        <img
          src={`${BASE}/lifestyle-sheer-living-room.png`}
          alt="Luma Sheer Shades"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/55" />
        <SiteNav activePage="Products" />
        <div className="absolute inset-0 flex items-end pb-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <nav className="flex items-center gap-2 text-white/40 text-xs tracking-[0.2em] uppercase mb-6">
                <Link href="/products" className="hover:text-white/70 transition-colors">Products</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-white/70 transition-colors">Luma</Link>
                <span>/</span>
                <span className="text-white/70">Sheer Shades</span>
              </nav>
              <span className="text-white/50 text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Luma · Angel Drapery Originals</span>
              <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-[1.05]">
                Sheer<br />Shades
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── INTRO ─────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
              <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Luma Collection</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-6">
                Light, softened.<br />Views, preserved.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md">
                Luma Sheer Shades transform harsh sunlight into a soft, luminous glow — without sacrificing your connection to the outside world. Delicate yet durable, they add an effortless layer of privacy while keeping rooms feeling bright and open.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Available in three distinct fabric series — Standard Sheer, Embossed, and Natural Woven — each custom-made to your exact measurements with cordless, continuous chain, or Matter-enabled motorized control.
              </p>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { num: '16', label: 'Fabric Patterns' },
                { num: '98',  label: 'Colors' },
                { num: '3',  label: 'Fabric Series' },
              ].map(s => (
                <div key={s.label} className="bg-[#F7F5F2] rounded-2xl p-6 text-center">
                  <div className="text-3xl font-light tracking-tighter text-[#12141C] mb-1">{s.num}</div>
                  <div className="text-xs text-gray-400 tracking-wide">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── INSTANT ESTIMATOR ── */}
      <PriceEstimator defaultProduct="sheer" />

      {/* ── FABRIC SERIES ─────────────────────────────────────────── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-14">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Fabric Series</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Three fabric families</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                label: 'E Series',
                title: 'Standard Sheer',
                desc: 'Clean, classic sheer fabrics that gently diffuse daylight while maintaining a soft view to the outside. Available in 9 patterns with a wide range of neutral and accent tones.',
                img: `${BASE}/lifestyle-sheer-sunlit.png`,
                stats: ['9 Patterns', '54 Colors', 'Light Diffusion'],
                aspect: 'aspect-[4/3]',
              },
              {
                label: 'EB Series',
                title: 'Embossed Sheer',
                desc: 'Subtle textured weaves with an embossed surface finish that adds visual depth and dimension. A refined choice for modern and transitional interiors.',
                img: `${BASE}/detail-fabric-1.png`,
                stats: ['3 Patterns', '27 Colors', 'Textured Finish'],
                aspect: 'aspect-[4/3]',
              },
              {
                label: 'N Series',
                title: 'Natural Woven',
                desc: 'Organic woven textures inspired by linen and grasscloth. Warm, earthy tones that bring a relaxed, natural aesthetic to any room.',
                img: `${BASE}/detail-fabric-2.png`,
                stats: ['3 Patterns', '12 Colors', 'Woven Texture'],
                aspect: 'aspect-[16/10]',
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12 } } }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <div className={`overflow-hidden ${item.aspect}`}>
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-7">
                  <span className="text-[#4DB6E8] text-[10px] font-bold tracking-[0.3em] uppercase block mb-1">{item.label}</span>
                  <h3 className="text-xl font-light tracking-tight text-[#12141C] mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.stats.map(s => (
                      <span key={s} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
              className="order-2 md:order-1"
            >
              <div className="rounded-3xl overflow-hidden aspect-[4/3]">
                <img
                  src={`${BASE}/lifestyle-sheer-bedroom.png`}
                  alt="Sheer shades light diffusion"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
              className="order-1 md:order-2"
            >
              <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Light Control</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-6">
                Privacy without<br />darkness.
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Soft Light Diffusion',
                    desc: 'The sheer weave scatters incoming sunlight into a gentle, even glow — eliminating harsh glare without blocking the view or darkening the room.',
                  },
                  {
                    title: 'Daytime Privacy',
                    desc: 'During the day, the fabric reduces visibility from outside while you maintain a clear outward view. A perfect balance between openness and privacy.',
                  },
                  {
                    title: 'UV Protection',
                    desc: 'Filter out up to 80% of UV rays to protect your furniture, floors, and artwork from fading — without sacrificing natural light.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-1" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#12141C] mb-1 tracking-tight">{item.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── OPERATING OPTIONS ─────────────────────────────────────── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-14">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Control Options</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">How you operate it</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Continuous Chain',
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                ),
                desc: 'Smooth loop-chain mechanism for effortless, precise control. Ideal for wider shades and high-traffic areas.',
                tags: ['Precise Control', 'Durable', 'Wide Shades'],
              },
              {
                title: 'Motorized',
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
                  </svg>
                ),
                desc: 'Matter-certified smart motor integrates seamlessly with Apple Home, Google Home, and Alexa. Voice control, app scheduling, and scene integration — no hub required.',
                tags: ['Matter Protocol', 'Siri · Google · Alexa', 'App Control', 'Schedules'],
              },
            ].map((opt, i) => (
              <motion.div
                key={opt.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12 } } }}
                className="bg-white rounded-2xl p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F7F5F2] flex items-center justify-center text-[#4DB6E8] mb-5">
                  {opt.icon}
                </div>
                <h3 className="text-xl font-light tracking-tight text-[#12141C] mb-3">{opt.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{opt.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {opt.tags.map(t => (
                    <span key={t} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HARDWARE DETAILS ──────────────────────────────────────── */}
      <section className="w-full bg-[#12141C] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-14">
            <span className="text-white/30 text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Craftsmanship</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-white">Hardware Details</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                img: `${BASE}/detail-round-cassette.png`,
                title: 'Round Cassette',
                desc: 'Sleek cylindrical cassette that fully conceals the rolled fabric when the shade is raised.',
              },
              {
                img: `${BASE}/detail-square-cassette.png`,
                title: 'Square Cassette',
                desc: 'Modern angular cassette profile for a clean architectural look. Available in standard and fascia styles.',
              },
            ].map((d, i) => (
              <motion.div
                key={d.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12 } } }}
                className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={d.img} alt={d.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-white text-lg font-light tracking-tight mb-2">{d.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{d.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMART HOME ────────────────────────────────────────────── */}
      <section className="w-full bg-[#0D0F1A] py-20 md:py-28 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            <div className="md:w-[40%] shrink-0">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
                <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Smart Home Ready</span>
                <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-white mb-6">
                  Say the word.<br />The shade moves.
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
                  Matter-certified motorized sheer shades connect instantly to your smart home. Wake up to gentle morning light, set evening scenes, and control every shade by voice or schedule.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Apple Home', 'Google Home', 'Amazon Alexa', 'Matter Protocol', 'SmartThings', 'Voice Control'].map(p => (
                    <span key={p} className="px-6 py-3 rounded-2xl border border-white/15 bg-white/8 text-sm font-medium text-white/80 tracking-wide">
                      {p}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
              className="md:w-[60%]"
            >
              <div className="rounded-3xl overflow-hidden aspect-[4/3]">
                <img
                  src={`${BASE}/lifestyle-sheer-modern.png`}
                  alt="Smart home controlled sheer shades"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ───────────────────────────────────────────────── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-14">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Inspiration</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Every room. Luminous.</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <motion.button
                key={img.src}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: i * 0.07 } } }}
                onClick={() => openLightbox(galleryImages.map(g => g.src), i, 'Gallery')}
                className="rounded-2xl overflow-hidden aspect-[4/3] relative group cursor-zoom-in"
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607zM10.5 7.5v6m3-3h-6"/>
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SWATCHES ──────────────────────────────────────────────── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-10">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Fabric Library</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Browse fabrics</h2>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-3 mb-10 flex-wrap">
            {([
              { key: 'e',  label: 'Standard Sheer', count: `${ePatterns.length} patterns` },
              { key: 'eb', label: 'Embossed',        count: `${ebPatterns.length} patterns` },
              { key: 'n',  label: 'Natural Woven',   count: `${nPatterns.length} patterns` },
            ] as { key: SwatchTab; label: string; count: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-[#12141C] text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label} <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Swatch grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5"
            >
              {activePatterns.map(({ pattern, colors }) => {
                const selectedIdx = selectedColors[pattern] ?? 0
                const mainSrc = `${SW}/${colors[selectedIdx]}`
                const allSrcs = colors.map(c => `${SW}/${c}`)
                return (
                  <div key={pattern} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <button
                      className="w-full group relative aspect-square overflow-hidden bg-gray-100 block cursor-zoom-in"
                      onClick={() => openLightbox(allSrcs, selectedIdx, `${pattern} — ${tabLabel}`)}
                    >
                      <img src={mainSrc} alt={pattern} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607zM10.5 7.5v6m3-3h-6"/>
                        </svg>
                      </div>
                    </button>
                    <div className="p-3">
                      <p className="text-xs font-medium text-[#12141C] mb-2 tracking-wide">{pattern}</p>
                      {colors.length > 1 && (
                        <div className="flex flex-wrap gap-1.5">
                          {colors.map((c, idx) => (
                            <button
                              key={c}
                              onClick={() => {
                                setSelectedColors(prev => ({ ...prev, [pattern]: idx }))
                                openLightbox(allSrcs, idx, `${pattern} — ${tabLabel}`)
                              }}
                              className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all duration-150 hover:scale-105 ${
                                idx === selectedIdx ? 'border-[#4DB6E8] shadow-sm' : 'border-transparent'
                              }`}
                            >
                              <img src={`${SW}/${c}`} alt={c} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-gray-300 mt-2">{colors.length} color{colors.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Get Started</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-6">
              Find your perfect<br />sheer fabric.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-md mx-auto">
              Schedule a free consultation and let our experts help you choose the ideal fabric series, color, and control system for your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#contact">
                <button className="px-10 py-4 bg-[#12141C] text-white text-sm font-medium tracking-[0.15em] uppercase hover:bg-black transition-colors rounded-full">
                  Schedule Consultation
                </button>
              </Link>
              <Link href="/products">
                <button className="px-10 py-4 border border-gray-200 text-[#12141C] text-sm font-medium tracking-[0.15em] uppercase hover:bg-gray-50 transition-colors rounded-full">
                  View All Products
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── LIGHTBOX ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div className="max-w-[1440px] w-full" onClick={e => e.stopPropagation()}>
              <div className="relative flex items-center justify-center">
                {lightbox.srcs.length > 1 && (
                  <button onClick={lbPrev} className="absolute left-0 -translate-x-12 text-white/50 hover:text-white transition-colors hidden md:block">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
                    </svg>
                  </button>
                )}
                <img
                  src={lightbox.srcs[lightbox.idx]}
                  alt={lightbox.label}
                  className="w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl"
                />
                {lightbox.srcs.length > 1 && (
                  <button onClick={lbNext} className="absolute right-0 translate-x-12 text-white/50 hover:text-white transition-colors hidden md:block">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                    </svg>
                  </button>
                )}
              </div>

              <p className="text-center text-white/40 text-xs tracking-widest uppercase mt-4">{lightbox.label}</p>

              {lightbox.srcs.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {lightbox.srcs.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setLightbox(prev => prev ? { ...prev, idx: i } : null)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        i === lightbox.idx ? 'border-white/80' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img src={s} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
