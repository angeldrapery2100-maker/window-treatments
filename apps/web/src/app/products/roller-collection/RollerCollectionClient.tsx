'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { m as motion, AnimatePresence } from 'framer-motion'
import PriceEstimator from '@/components/PriceEstimator'

const BASE = '/roller-collection'
const SW   = `${BASE}/swatches`

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } },
}
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

// ── Swatch Data ────────────────────────────────────────────────────────────────
const mbPatterns = [
  { pattern: 'MB1',  colors: ['MB1-001.jpg','MB1-002.jpg','MB1-003.jpg','MB1-004.jpg'] },
  { pattern: 'MB2',  colors: ['MB2-001.jpg','MB2-002.jpg','MB2-003.jpg'] },
  { pattern: 'MB3',  colors: ['MB3-001.jpg','MB3-002.jpg','MB3-003.jpg','MB3-004.jpg','MB3-005.jpg','MB3-006.jpg','MB3-007.jpg','MB3-008.jpg'] },
  { pattern: 'MB4',  colors: ['MB4-001.jpg','MB4-002.jpg','MB4-003.jpg','MB4-004.jpg','MB4-005.jpg','MB4-006.jpg'] },
  { pattern: 'MB5',  colors: ['MB5-001.jpg','MB5-002.jpg','MB5-003.jpg','MB5-004.jpg'] },
  { pattern: 'MB6',  colors: ['MB6-001.jpg','MB6-002.jpg','MB6-003.jpg','MB6-004.jpg'] },
  { pattern: 'MB7',  colors: ['MB7-001.jpg','MB7-002.jpg','MB7-003.jpg'] },
  { pattern: 'MB8',  colors: ['MB8-001.jpg','MB8-002.jpg','MB8-003.jpg'] },
  { pattern: 'MB9',  colors: ['MB9-001.jpg','MB9-002.jpg','MB9-003.jpg','MB9-004.jpg','MB9-005.jpg'] },
  { pattern: 'MB10', colors: ['MB10-001.jpg','MB10-002.jpg','MB10-003.jpg','MB10-004.jpg','MB10-005.jpg','MB10-006.jpg','MB10-007.jpg','MB10-008.jpg'] },
  { pattern: 'MB11', colors: ['MB11-001.jpg','MB11-002.jpg','MB11-003.jpg','MB11-004.jpg','MB11-005.jpg','MB11-006.jpg'] },
  { pattern: 'MB12', colors: ['MB12-001.jpg','MB12-002.jpg','MB12-003.jpg','MB12-004.jpg','MB12-005.jpg'] },
  { pattern: 'MB13', colors: ['MB13-001.jpg','MB13-002.jpg','MB13-003.jpg','MB13-004.jpg','MB13-005.jpg'] },
  { pattern: 'MB14', colors: ['MB14-001.jpg','MB14-002.jpg','MB14-003.jpg','MB14-004.jpg','MB14-005.jpg','MB14-006.jpg'] },
  { pattern: 'MB15', colors: ['MB15-001.jpg','MB15-002.jpg','MB15-003.jpg','MB15-004.jpg'] },
  { pattern: 'MB16', colors: ['MB16-002.jpg'] },
  { pattern: 'MB17', colors: ['MB17-001.jpg','MB17-002.jpg','MB17-003.jpg'] },
  { pattern: 'MB18', colors: ['MB18-001.jpg','MB18-002.jpg','MB18-003.jpg','MB18-004.jpg','MB18-005.jpg'] },
  { pattern: 'MB19', colors: ['MB19-001.jpg','MB19-002.jpg','MB19-003.jpg','MB19-004.jpg'] },
  { pattern: 'MB20', colors: ['MB20-001.jpg','MB20-002.jpg','MB20-003.jpg'] },
  { pattern: 'MB21', colors: ['MB21-001.jpg','MB21-002.jpg','MB21-003.jpg','MB21-004.jpg'] },
  { pattern: 'MB22', colors: ['MB22-001.jpg','MB22-002.jpg','MB22-003.jpg','MB22-004.jpg'] },
  { pattern: 'MB23', colors: ['MB23-001.jpg','MB23-002.jpg','MB23-003.jpg','MB23-004.jpg','MB23-005.jpg'] },
  { pattern: 'MB24', colors: ['MB24-001.jpg','MB24-002.jpg','MB24-003.jpg','MB24-004.jpg','MB24-005.jpg'] },
  { pattern: 'MB25', colors: ['MB25-001.jpg','MB25-002.jpg','MB25-003.jpg','MB25-004.jpg','MB25-005.jpg'] },
  { pattern: 'MB26', colors: ['MB26-001.jpg','MB26-002.jpg','MB26-003.jpg','MB26-004.jpg'] },
  { pattern: 'MB27', colors: ['MB27-001.jpg','MB27-002.jpg','MB27-003.jpg','MB27-004.jpg','MB27-005.jpg','MB27-006.jpg'] },
  { pattern: 'MB28', colors: ['MB28-002.jpg','MB28-003.jpg','MB28-004.jpg','MB28-005.jpg','MB28-006.jpg'] },
  { pattern: 'MB29', colors: ['MB29-001.jpg','MB29-002.jpg','MB29-003.jpg','MB29-004.jpg','MB29-005.jpg','MB29-006.jpg','MB29-007.jpg'] },
]

const mePatterns = [
  { pattern: 'ME1',  colors: ['ME1-001.jpg','ME1-002.jpg','ME1-003.jpg','ME1-004.jpg'] },
  { pattern: 'ME2',  colors: ['ME2-001.jpg','ME2-002.jpg','ME2-003.jpg'] },
  { pattern: 'ME3',  colors: ['ME3-001.jpg','ME3-002.jpg','ME3-003.jpg','ME3-004.jpg','ME3-005.jpg','ME3-006.jpg','ME3-007.jpg','ME3-008.jpg'] },
  { pattern: 'ME4',  colors: ['ME4-001.jpg','ME4-002.jpg','ME4-003.jpg','ME4-004.jpg','ME4-005.jpg','ME4-006.jpg'] },
  { pattern: 'ME5',  colors: ['ME5-001.jpg','ME5-002.jpg','ME5-003.jpg','ME5-004.jpg'] },
  { pattern: 'ME6',  colors: ['ME6-001.jpg','ME6-002.jpg','ME6-003.jpg','ME6-004.jpg'] },
  { pattern: 'ME7',  colors: ['ME7-001.jpg','ME7-002.jpg','ME7-003.jpg'] },
  { pattern: 'ME8',  colors: ['ME8-001.jpg','ME8-002.jpg','ME8-003.jpg'] },
  { pattern: 'ME9',  colors: ['ME9-001.jpg','ME9-002.jpg','ME9-003.jpg','ME9-004.jpg','ME9-005.jpg'] },
  { pattern: 'ME10', colors: ['ME10-001.jpg','ME10-002.jpg','ME10-003.jpg','ME10-004.jpg','ME10-005.jpg','ME10-006.jpg','ME10-007.jpg'] },
  { pattern: 'ME11', colors: ['ME11-001.jpg','ME11-002.jpg','ME11-003.jpg','ME11-004.jpg','ME11-005.jpg','ME11-006.jpg'] },
  { pattern: 'ME12', colors: ['ME12-001.jpg','ME12-002.jpg','ME12-003.jpg','ME12-004.jpg','ME12-005.jpg'] },
  { pattern: 'ME13', colors: ['ME13-001.jpg','ME13-002.jpg','ME13-003.jpg','ME13-004.jpg','ME13-005.jpg'] },
  { pattern: 'ME14', colors: ['ME14-001.jpg','ME14-002.jpg','ME14-003.jpg','ME14-004.jpg','ME14-005.jpg','ME14-006.jpg'] },
  { pattern: 'ME15', colors: ['ME15-001.jpg','ME15-002.jpg','ME15-003.jpg','ME15-004.jpg'] },
  { pattern: 'ME16', colors: ['ME16-001.jpg','ME16-002.jpg'] },
  { pattern: 'ME17', colors: ['ME17-001.jpg','ME17-002.jpg','ME17-003.jpg','ME17-004.jpg','ME17-005.jpg'] },
  { pattern: 'ME18', colors: ['ME18-001.jpg','ME18-002.jpg','ME18-003.jpg','ME18-004.jpg'] },
  { pattern: 'ME19', colors: ['ME19-001.jpg'] },
  { pattern: 'ME20', colors: ['ME20-001.jpg','ME20-002.jpg','ME20-003.jpg','ME20-004.jpg'] },
  { pattern: 'ME21', colors: ['ME21-001.jpg','ME21-002.jpg','ME21-003.jpg','ME21-004.jpg','ME21-005.jpg'] },
  { pattern: 'ME22', colors: ['ME22-001.jpg','ME22-002.jpg','ME22-003.jpg'] },
  { pattern: 'ME23', colors: ['ME23-001.jpg','ME23-002.jpg','ME23-003.jpg','ME23-004.jpg','ME23-005.jpg'] },
  { pattern: 'ME24', colors: ['ME24-001.jpg','ME24-002.jpg','ME24-003.jpg'] },
  { pattern: 'ME25', colors: ['ME25-001.jpg','ME25-002.jpg','ME25-003.jpg'] },
  { pattern: 'ME26', colors: ['ME26-001.jpg','ME26-002.jpg','ME26-003.jpg'] },
  { pattern: 'ME27', colors: ['ME27-001.jpg','ME27-002.jpg','ME27-003.jpg','ME27-004.jpg'] },
]

const msPatterns = [
  { pattern: 'MS1',  colors: ['MS1-001.jpg','MS1-002.jpg','MS1-003.jpg','MS1-004.jpg'] },
  { pattern: 'MS2',  colors: ['MS2-001.jpg','MS2-002.jpg','MS2-003.jpg'] },
  { pattern: 'MS3',  colors: ['MS3-001.jpg'] },
  { pattern: 'MS4',  colors: ['MS4-001.jpg'] },
  { pattern: 'MS5',  colors: ['MS5-001.jpg'] },
  { pattern: 'MS6',  colors: ['MS6-001.jpg'] },
  { pattern: 'MS7',  colors: ['MS7-001.jpg'] },
  { pattern: 'MS8',  colors: ['MS8-001.jpg','MS8-002.jpg','MS8-003.jpg','MS8-004.jpg'] },
  { pattern: 'MS9',  colors: ['MS9-001.jpg','MS9-002.jpg','MS9-003.jpg','MS9-004.jpg','MS9-005.jpg','MS9-006.jpg'] },
  { pattern: 'MS10', colors: ['MS10-001.jpg','MS10-002.jpg','MS10-003.jpg','MS10-004.jpg','MS10-005.jpg','MS10-006.jpg'] },
  { pattern: 'MS11', colors: ['MS11-001.jpg','MS11-002.jpg','MS11-003.jpg','MS11-004.jpg','MS11-005.jpg','MS11-006.jpg'] },
  { pattern: 'MS12', colors: ['MS12-001.jpg','MS12-002.jpg','MS12-003.jpg','MS12-004.jpg'] },
  { pattern: 'MS13', colors: ['MS13-001.jpg','MS13-002.jpg','MS13-003.jpg','MS13-004.jpg'] },
  { pattern: 'MS14', colors: ['MS14-001.jpg','MS14-002.jpg','MS14-003.jpg','MS14-004.jpg'] },
  { pattern: 'MS15', colors: ['MS15-001.jpg','MS15-002.jpg','MS15-003.jpg','MS15-004.jpg','MS15-005.jpg','MS15-006.jpg','MS15-007.jpg','MS15-008.jpg'] },
  { pattern: 'MS16', colors: ['MS16-001.jpg','MS16-002.jpg','MS16-003.jpg','MS16-004.jpg','MS16-005.jpg','MS16-006.jpg'] },
  { pattern: 'MS17', colors: ['MS17-001.jpg','MS17-002.jpg','MS17-003.jpg'] },
  { pattern: 'MS18', colors: ['MS18-001.jpg','MS18-002.jpg','MS18-003.jpg','MS18-004.jpg'] },
  { pattern: 'MS19', colors: ['MS19-001.jpg','MS19-002.jpg','MS19-003.jpg','MS19-004.jpg','MS19-005.jpg'] },
  { pattern: 'MS20', colors: ['MS20-001.jpg','MS20-002.jpg','MS20-003.jpg','MS20-004.jpg','MS20-005.jpg'] },
  { pattern: 'MS21', colors: ['MS21-001.jpg','MS21-002.jpg','MS21-003.jpg','MS21-004.jpg'] },
  { pattern: 'MS22', colors: ['MS22-001.jpg','MS22-002.jpg','MS22-003.jpg','MS22-004.jpg'] },
  { pattern: 'MS23', colors: ['MS23-001.jpg','MS23-002.jpg','MS23-003.jpg'] },
  { pattern: 'MS24', colors: ['MS24-001.jpg','MS24-002.jpg','MS24-003.jpg'] },
  { pattern: 'MS25', colors: ['MS25-001.jpg','MS25-002.jpg','MS25-003.jpg','MS25-004.jpg','MS25-005.jpg','MS25-006.jpg'] },
  { pattern: 'MS26', colors: ['MS26-001.jpg','MS26-002.jpg','MS26-003.jpg','MS26-004.jpg','MS26-005.jpg','MS26-006.jpg','MS26-007.jpg'] },
]

type SwatchTab = 'mb' | 'me' | 'ms'

const fabricTypes = [
  {
    code: 'MB',
    title: 'Blackout',
    subtitle: 'Total Darkness',
    desc: 'Complete light blockage for bedrooms, media rooms, and anywhere you need total privacy. Our blackout fabric eliminates 100% of incoming light while providing superior insulation.',
    img: `${BASE}/lifestyle-bedroom.png`,
    stats: ['29 Patterns', '135 Colors', '100% Blackout'],
  },
  {
    code: 'ME',
    title: 'Light Filtering',
    subtitle: 'Soft Diffused Light',
    desc: 'Gently diffuse sunlight to create a warm, comfortable glow. Light filtering fabric softens harsh rays while maintaining an outward view, perfect for living rooms and offices.',
    img: `${BASE}/lifestyle-living-room.png`,
    stats: ['27 Patterns', '115 Colors', 'UV Protection'],
  },
  {
    code: 'MS',
    title: 'Solar Screen',
    subtitle: 'View with Protection',
    desc: 'Reduce glare and UV rays while preserving your view to the outside. Solar screen fabric is ideal for sun-drenched rooms where you want protection without losing the outdoor connection.',
    img: `${BASE}/lifestyle-solar-screen.png`,
    stats: ['26 Patterns', '104 Colors', 'Glare Control'],
  },
]

export default function RollerCollectionClient() {
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({})
  const [lightbox, setLightbox] = useState<{ srcs: string[]; idx: number; label: string } | null>(null)
  const [activeTab, setActiveTab] = useState<SwatchTab>('mb')

  const openLightbox  = (srcs: string[], idx: number, label: string) => setLightbox({ srcs, idx, label })
  const closeLightbox = () => setLightbox(null)
  const lbPrev = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx - 1 + prev.srcs.length) % prev.srcs.length } : null)
  const lbNext = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx + 1) % prev.srcs.length } : null)

  const activePatterns = activeTab === 'mb' ? mbPatterns : activeTab === 'me' ? mePatterns : msPatterns
  const tabLabel       = activeTab === 'mb' ? 'Blackout' : activeTab === 'me' ? 'Light Filtering' : 'Solar Screen'

  const galleryImages = [
    { src: `${BASE}/lifestyle-floor-to-ceiling.png`, alt: 'Floor to ceiling roller shades' },
    { src: `${BASE}/lifestyle-modern-living.png`,    alt: 'Modern living room' },
    { src: `${BASE}/lifestyle-office.png`,           alt: 'Home office' },
    { src: `${BASE}/lifestyle-kitchen.png`,          alt: 'Kitchen' },
    { src: `${BASE}/lifestyle-dining-room.png`,      alt: 'Dining room' },
    { src: `${BASE}/lifestyle-corner-window.png`,    alt: 'Corner window' },
  ]

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative w-full h-[70vh] min-h-[540px] overflow-hidden bg-[#1a1a1a]">
        <Image
          src={`${BASE}/lifestyle-floor-to-ceiling.png`}
          alt="Luma Roller Shades"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/65" />
        <SiteNav activePage="Products" />
        <div className="absolute inset-0 flex items-end pb-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <nav className="flex items-center gap-2 text-white/40 text-xs tracking-[0.2em] uppercase mb-6">
                <Link href="/products" className="hover:text-white/70 transition-colors">Products</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-white/70 transition-colors">Luma</Link>
                <span>/</span>
                <span className="text-white/70">Roller Shades</span>
              </nav>
              <span className="text-white/50 text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Luma · Angel Drapery Originals</span>
              <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-[1.05]">
                Roller<br />Shades
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
                Clean lines.<br />Total control.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md">
                Luma Roller Shades deliver precision light management in three fabric types — blackout, light filtering, and solar screen. Engineered for flawless operation with cordless, continuous chain, or Matter-enabled motorized control.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Every shade is custom-made to your exact measurements with your choice of cassette style, bottom rail finish, and fabric. Smart home ready out of the box — works with Siri, Google Home, and Alexa.
              </p>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { num: '82', label: 'Fabric Patterns' },
                { num: '354+', label: 'Colors' },
                { num: '3', label: 'Fabric Types' },
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
      <PriceEstimator defaultProduct="roller" />

      {/* ── FABRIC TYPES ──────────────────────────────────────────── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-14">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Fabric Options</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Choose your fabric</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {fabricTypes.map((item, i) => (
              <motion.div
                key={item.code}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12 } } }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="relative overflow-hidden aspect-square">
                  <Image src={item.img} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="p-7">
                  <span className="text-[#4DB6E8] text-[10px] font-bold tracking-[0.3em] uppercase block mb-1">{item.subtitle}</span>
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

      {/* ── OPERATING OPTIONS ─────────────────────────────────────── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-14">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Control Options</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">How you operate it</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Cordless',
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                ),
                desc: 'Clean, uncluttered look with no dangling cords. Simply push up or pull down to set your desired position. Child-safe and pet-friendly.',
                tags: ['Child Safe', 'Clean Look', 'Easy Lift'],
              },
              {
                title: 'Continuous Chain',
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                ),
                desc: 'Reliable loop chain mechanism for smooth, precise control. Ideal for wider shades and commercial settings. Available in standard or heavy-duty options.',
                tags: ['Precise Control', 'Durable', 'Wide Shades'],
              },
              {
                title: 'Motorized',
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
                  </svg>
                ),
                desc: 'Matter-certified smart motor for seamless integration with Apple Home, Google Home, and Alexa. Set schedules, scenes, and voice control from anywhere.',
                tags: ['Matter Protocol', 'Siri · Google · Alexa', 'App Control', 'Schedules'],
              },
            ].map((opt, i) => (
              <motion.div
                key={opt.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12 } } }}
                className="bg-[#F7F5F2] rounded-2xl p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#4DB6E8] mb-5 shadow-sm">
                  {opt.icon}
                </div>
                <h3 className="text-xl font-light tracking-tight text-[#12141C] mb-3">{opt.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{opt.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {opt.tags.map(t => (
                    <span key={t} className="text-[10px] text-gray-400 bg-white border border-gray-100 px-3 py-1 rounded-full">{t}</span>
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
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: `${BASE}/detail-bottom-rail.png`,    title: 'Bottom Rail',      desc: 'Fabric-wrapped aluminum bottom rail for a seamless, refined finish that matches your chosen fabric.' },
              { img: `${BASE}/detail-round-cassette.png`, title: 'Round Cassette',   desc: 'Sleek cylindrical cassette that fully conceals the rolled fabric when the shade is raised.' },
              { img: `${BASE}/detail-square-cassette.png`,title: 'Square Cassette',  desc: 'Modern angular cassette profile for a clean architectural look. Available in standard and fascia styles.' },
            ].map((d, i) => (
              <motion.div
                key={d.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12 } } }}
                className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={d.img} alt={d.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
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

            {/* Left — text */}
            <div className="md:w-[40%] shrink-0">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
                <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Smart Home Ready</span>
                <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-white mb-6">
                  Say the word.<br />The shade moves.
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
                  Our Matter-certified motorized option connects instantly to your smart home ecosystem. Control by voice, app, or schedule — no hub required.
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

            {/* Right — image */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
              className="md:w-[60%]"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-square">
                <Image
                  src={`${BASE}/lifestyle-smart-home.png`}
                  alt="Smart home controlled roller shades"
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
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
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Every room. Elevated.</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <motion.button
                key={img.src}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: i * 0.07 } } }}
                onClick={() => openLightbox(galleryImages.map(g => g.src), i, 'Gallery')}
                className="rounded-2xl overflow-hidden aspect-[16/9] relative group cursor-zoom-in"
              >
                <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
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
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Choose your fabric</h2>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-3 mb-10 flex-wrap">
            {([
              { key: 'mb', label: 'Blackout',       count: `${mbPatterns.length} patterns` },
              { key: 'me', label: 'Light Filtering', count: `${mePatterns.length} patterns` },
              { key: 'ms', label: 'Solar Screen',    count: `${msPatterns.length} patterns` },
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
                    {/* Main image */}
                    <button
                      className="w-full group relative aspect-square overflow-hidden bg-gray-100 block cursor-zoom-in"
                      onClick={() => openLightbox(allSrcs, selectedIdx, `${pattern} — ${tabLabel}`)}
                    >
                      <Image src={mainSrc} alt={pattern} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                              className={`relative w-7 h-7 rounded-lg overflow-hidden border-2 transition-all duration-150 hover:scale-105 ${
                                idx === selectedIdx ? 'border-[#4DB6E8] shadow-sm' : 'border-transparent'
                              }`}
                            >
                              <Image src={`${SW}/${c}`} alt={c} fill sizes="28px" className="object-cover" />
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
              Ready to transform<br />your space?
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-md mx-auto">
              Schedule a free consultation and let our experts help you choose the perfect fabric, color, and operating system for every room.
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
                <Image
                  src={lightbox.srcs[lightbox.idx]}
                  alt={lightbox.label}
                  width={1440}
                  height={1080}
                  sizes="(max-width: 1440px) 100vw, 1440px"
                  className="w-full h-auto max-h-[75vh] rounded-2xl object-contain shadow-2xl"
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
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        i === lightbox.idx ? 'border-white/80' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <Image src={s} alt={`${lightbox.label} thumbnail ${i + 1}`} fill sizes="48px" className="object-cover" />
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
