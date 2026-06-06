'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { motion, AnimatePresence } from 'framer-motion'
import PriceEstimator from '@/components/PriceEstimator'

const BASE = '/luma-collection'
const SW = `${BASE}/swatches`

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

// ── Swatch Data ─────────────────────────────────────────────
const dbPatterns = [
  { pattern: 'DB1',  colors: ['DB1-1.jpg','DB1-2.jpg','DB1-3.jpg','DB1-4.jpg'] },
  { pattern: 'DB2',  colors: ['DB2-1.jpg','DB2-2.jpg','DB2-3.jpg','DB2-4.jpg','DB2-5.jpg'] },
  { pattern: 'DB3',  colors: ['DB3-1.jpg','DB3-2.jpg','DB3-3.jpg'] },
  { pattern: 'DB4',  colors: ['DB4-1.jpg','DB4-2.jpg','DB4-3.jpg'] },
  { pattern: 'DB5',  colors: ['DB5-1.jpg','DB5-2.jpg'] },
  { pattern: 'DB6',  colors: ['DB6-1.jpg','DB6-2.jpg','DB6-3.jpg','DB6-4.jpg'] },
  { pattern: 'DB7',  colors: ['DB7-1.jpg','DB7-2.jpg','DB7-3.jpg','DB7-4.jpg','DB7-5.jpg'] },
  { pattern: 'DB8',  colors: ['DB8-1.jpg','DB8-2.jpg','DB8-3.jpg','DB8-4.jpg'] },
  { pattern: 'DB9',  colors: ['DB9-1.jpg','DB9-2.jpg','DB9-3.jpg'] },
  { pattern: 'DB10', colors: ['DB10-1.jpg','DB10-2.jpg','DB10-3.jpg','DB10-4.jpg'] },
  { pattern: 'DB11', colors: ['DB11-1.jpg','DB11-2.jpg'] },
  { pattern: 'DB12', colors: ['DB12-1.jpg','DB12-2.jpg'] },
  { pattern: 'DB13', colors: ['DB13-1.jpg','DB13-2.jpg'] },
  { pattern: 'DB14', colors: ['DB14-1.jpg','DB14-2.jpg','DB14-3.jpg','DB14-4.jpg','DB14-5.jpg','DB14-6.jpg','DB14-7.jpg'] },
  { pattern: 'DB15', colors: ['DB15-1.jpg','DB15-2.jpg','DB15-3.jpg','DB15-4.jpg','DB15-5.jpg'] },
  { pattern: 'DB16', colors: ['DB16-1.jpg','DB16-2.jpg','DB16-3.jpg','DB16-4.jpg'] },
  { pattern: 'DB17', colors: ['DB17-1.jpg','DB17-2.jpg','DB17-3.jpg','DB17-4.jpg','DB17-5.jpg','DB17-6.jpg'] },
  { pattern: 'DB18', colors: ['DB18-1.jpg','DB18-2.jpg','DB18-3.jpg','DB18-4.jpg'] },
  { pattern: 'DB19', colors: ['DB19-1.jpg','DB19-2.jpg','DB19-3.jpg'] },
  { pattern: 'DB20', colors: ['DB20-1.jpg','DB20-2.jpg','DB20-3.jpg','DB20-4.jpg'] },
  { pattern: 'DB21', colors: ['DB21-1.jpg','DB21-2.jpg','DB21-3.jpg'] },
  { pattern: 'DB22', colors: ['DB22-1.jpg','DB22-2.jpg','DB22-3.jpg'] },
  { pattern: 'DB23', colors: ['DB23-1.jpg','DB23-2.jpg','DB23-3.jpg'] },
]

const dePatterns = [
  { pattern: 'DE1',  colors: ['DE1-1.jpg','DE1-2.jpg','DE1-3.jpg'] },
  { pattern: 'DE2',  colors: ['DE2-1.jpg','DE2-2.jpg','DE2-3.jpg','DE2-4.jpg'] },
  { pattern: 'DE3',  colors: ['DE3-1.jpg','DE3-2.jpg','DE3-3.jpg','DE3-4.jpg','DE3-5.jpg','DE3-6.jpg','DE3-7.jpg'] },
  { pattern: 'DE4',  colors: ['DE4-1.jpg','DE4-2.jpg','DE4-3.jpg'] },
  { pattern: 'DE5',  colors: ['DE5-1.jpg'] },
  { pattern: 'DE6',  colors: ['DE6-1.jpg','DE6-2.jpg','DE6-3.jpg','DE6-4.jpg'] },
  { pattern: 'DE7',  colors: ['DE7-1.jpg','DE7-2.jpg','DE7-3.jpg','DE7-4.jpg','DE7-5.jpg'] },
  { pattern: 'DE8',  colors: ['DE8-1.jpg'] },
  { pattern: 'DE9',  colors: ['DE9-1.jpg','DE9-2.jpg','DE9-3.jpg'] },
  { pattern: 'DE10', colors: ['DE10-1.jpg','DE10-2.jpg','DE10-3.jpg','DE10-4.jpg'] },
  { pattern: 'DE11', colors: ['DE11-1.jpg','DE11-2.jpg','DE11-3.jpg'] },
  { pattern: 'DE12', colors: ['DE12-1.jpg','DE12-2.jpg','DE12-3.jpg','DE12-4.jpg','DE12-5.jpg'] },
  { pattern: 'DE13', colors: ['DE13-1.jpg','DE13-2.jpg','DE13-3.jpg','DE13-4.jpg'] },
  { pattern: 'DE14', colors: ['DE14-1.jpg','DE14-2.jpg','DE14-3.jpg','DE14-4.jpg','DE14-5.jpg'] },
  { pattern: 'DE15', colors: ['DE15-1.jpg','DE15-2.jpg','DE15-3.jpg','DE15-4.jpg','DE15-5.jpg','DE15-6.jpg'] },
  { pattern: 'DE16', colors: ['DE16-1.jpg','DE16-2.jpg','DE16-3.jpg'] },
  { pattern: 'DE17', colors: ['DE17-1.jpg','DE17-2.jpg','DE17-3.jpg','DE17-4.jpg','DE17-5.jpg','DE17-6.jpg'] },
  { pattern: 'DE18', colors: ['DE18-1.jpg','DE18-2.jpg','DE18-3.jpg','DE18-4.jpg'] },
  { pattern: 'DE19', colors: ['DE19-1.jpg','DE19-2.jpg','DE19-3.jpg','DE19-4.jpg','DE19-5.jpg'] },
  { pattern: 'DE20', colors: ['DE20-1.jpg','DE20-2.jpg','DE20-3.jpg','DE20-4.jpg'] },
  { pattern: 'DE21', colors: ['DE21-1.jpg','DE21-2.jpg','DE21-3.jpg','DE21-4.jpg'] },
  { pattern: 'DE22', colors: ['DE22-1.jpg','DE22-2.jpg','DE22-3.jpg','DE22-4.jpg','DE22-5.jpg','DE22-6.jpg','DE22-7.jpg'] },
  { pattern: 'DE23', colors: ['DE23-1.jpg','DE23-2.jpg','DE23-3.jpg','DE23-4.jpg','DE23-5.jpg','DE23-6.jpg'] },
]

const dfPatterns = [
  { pattern: 'DF1', colors: ['DF1-1.jpg','DF1-2.jpg','DF1-3.jpg'] },
  { pattern: 'DF2', colors: ['DF2-1.jpg','DF2-2.jpg'] },
  { pattern: 'DF3', colors: ['DF3-1.jpg','DF3-2.jpg'] },
  { pattern: 'DF4', colors: ['DF4-1.jpg','DF4-2.jpg'] },
  { pattern: 'DF5', colors: ['DF5-1.jpg','DF5-2.jpg'] },
  { pattern: 'DF6', colors: ['DF6-1.jpg','DF6-2.jpg','DF6-3.jpg'] },
  { pattern: 'DF7', colors: ['DF7-1.jpg','DF7-2.jpg','DF7-3.jpg'] },
]

type SwatchTab = 'db' | 'de' | 'df'

const operatingOptions = [
  {
    key: 'cordless',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M12 3v4M12 17v4M4.22 6.22l2.83 2.83M16.95 14.95l2.83 2.83M3 12h4M17 12h4M4.22 17.78l2.83-2.83M16.95 9.05l2.83-2.83"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    title: 'Cordless',
    subtitle: 'Clean · Safe · Simple',
    desc: 'Effortlessly raise or lower the shade with a gentle push or pull. No cords means a cleaner look and a safer environment — ideal for homes with children and pets.',
    tag: 'Most Popular',
    tagColor: 'bg-emerald-50 text-emerald-700',
  },
  {
    key: 'chain',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    title: 'Continuous Chain',
    subtitle: 'Precise · Reliable · Classic',
    desc: 'A looped beaded chain gives you smooth, precise control over shade position and band alignment. Great for larger windows where exact positioning matters.',
    tag: 'Best for Large Windows',
    tagColor: 'bg-blue-50 text-blue-700',
  },
  {
    key: 'motorized',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
        <path d="M9 7h6M9 11h6"/>
      </svg>
    ),
    title: 'Motorized + Matter',
    subtitle: 'Smart · Automated · Connected',
    desc: 'Whisper-quiet motor with built-in Matter protocol. Control from anywhere via app, schedule sunrise/sunset routines, and integrate with your entire smart home ecosystem.',
    tag: 'Smart Home Ready',
    tagColor: 'bg-purple-50 text-purple-700',
  },
]

const smartPlatforms = [
  { name: 'Apple Home\n& Siri', color: '#1C1C1E' },
  { name: 'Google Home\n& Assistant', color: '#4285F4' },
  { name: 'Amazon\nAlexa', color: '#00A8E0' },
  { name: 'Matter\nProtocol', color: '#5B4FBE' },
  { name: 'SmartThings', color: '#1428A0' },
]

const galleryImages = [
  { src: 'lifestyle-dining-room.png',    alt: 'Zebra shades in an elegant dining room' },
  { src: 'lifestyle-kitchen-wide.png',   alt: 'Zebra shades across a modern kitchen' },
  { src: 'lifestyle-transforms.png',     alt: 'Transforms light and space' },
  { src: 'lifestyle-office-dining.png',  alt: 'Zebra shades in an office-dining space' },
  { src: 'lifestyle-remote-living.png',  alt: 'Motorized zebra shades with remote' },
  { src: 'lifestyle-dining-portrait.png',alt: 'Zebra shades in a bright dining room' },
]

export default function LumaCollectionClient() {
  const [swatchTab, setSwatchTab] = useState<SwatchTab>('db')
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null)
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({})
  const [lightbox, setLightbox] = useState<{ srcs: string[]; idx: number; patternName: string } | null>(null)

  const currentPatterns = swatchTab === 'db' ? dbPatterns : swatchTab === 'de' ? dePatterns : dfPatterns

  const openLightbox = (srcs: string[], idx: number, patternName: string) => {
    setLightbox({ srcs, idx, patternName })
  }
  const closeLightbox = () => setLightbox(null)
  const lightboxPrev = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx - 1 + prev.srcs.length) % prev.srcs.length } : null)
  const lightboxNext = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx + 1) % prev.srcs.length } : null)

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      {/* ══ HERO ══ */}
      <section className="relative w-full h-[85vh] min-h-[580px] overflow-hidden bg-[#1a1a1a]">
        <Image
          src={`${BASE}/lifestyle-trio-dining.png`}
          alt="Luma Collection Zebra Shades"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        <SiteNav activePage="Products" />
        <div className="absolute inset-0 flex items-end pb-20 md:pb-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="text-white/50 text-[11px] font-bold tracking-[0.4em] uppercase block mb-4">
                Angel Drapery · Value Collection
              </span>
              <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-white leading-[1] mb-4">
                Luma
              </h1>
              <p className="text-white/60 text-xl md:text-2xl font-light tracking-wide max-w-xl">
                Dual-layer zebra shades — designed for modern living.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ BREADCRUMB ══ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-6">
        <nav className="flex items-center gap-2 text-xs text-gray-400 tracking-wider">
          <Link href="/" className="hover:text-gray-700 transition-colors uppercase">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-700 transition-colors uppercase">Products</Link>
          <span>/</span>
          <span className="text-gray-700 uppercase">Luma Collection</span>
        </nav>
      </div>

      {/* ══ INTRO — WHAT IS A ZEBRA SHADE ══ */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.4em] uppercase block mb-6">Dual-Layer Technology</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] leading-tight mb-8">
                Two layers.<br /><span className="font-semibold">Infinite possibilities.</span>
              </h2>
              <div className="space-y-5 text-gray-500 text-base leading-relaxed">
                <p>
                  The Luma Collection features our precision-engineered zebra shade — a modern window treatment with two alternating layers of sheer and solid fabric woven together on a single roller.
                </p>
                <p>
                  Align the bands to <strong className="text-[#12141C]">diffuse soft natural light</strong> while maintaining your view, or shift them to <strong className="text-[#12141C]">overlap for full privacy</strong> and room darkening. One shade does it all.
                </p>
                <p>
                  Custom-made to your exact window size, the Luma Collection delivers a designer look at an accessible price point — with the smart home capabilities you'd expect from premium brands.
                </p>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-gray-100">
                {[
                  { num: '46', label: 'Fabric patterns' },
                  { num: '220+', label: 'Color options' },
                  { num: '3', label: 'Control types' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-3xl font-light text-[#12141C] tracking-tighter">{s.num}</p>
                    <p className="text-xs text-gray-400 tracking-wide uppercase mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeIn}
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/lifestyle-dark-livingroom.png`}
                  alt="Zebra shade close-up showing dual layer bands"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ INSTANT ESTIMATOR ══ */}
      <PriceEstimator defaultProduct="zebra" />

      {/* ══ HOW IT WORKS — LIGHT CONTROL ══ */}
      <section className="w-full bg-[#F7F6F3] py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">
              Your light. <span className="font-semibold">Your way.</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">Shift the bands to transform the mood of any room in seconds.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                img: 'lifestyle-minimal-window.png',
                title: 'Sheer Mode',
                desc: 'Align sheer bands to fill your room with soft, diffused natural light while keeping your view outside clear.',
                badge: 'Bands Aligned',
                badgeColor: 'bg-amber-50 text-amber-700',
              },
              {
                img: 'lifestyle-kitchen-wide.png',
                title: 'Privacy Mode',
                desc: 'Shift the bands so solid layers overlap, blocking direct light and creating complete privacy without rolling the shade up.',
                badge: 'Bands Offset',
                badgeColor: 'bg-gray-100 text-gray-600',
              },
              {
                img: 'lifestyle-kitchen-sink.png',
                title: 'Blackout Mode',
                desc: 'Lower the shade fully with bands aligned — perfect for bedrooms, media rooms, or any space that needs total darkness.',
                badge: 'Fully Lowered',
                badgeColor: 'bg-slate-800 text-white',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 } as any}
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={`${BASE}/${item.img}`} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                  <div className="p-7">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <h3 className="text-xl font-medium text-[#12141C] mt-4 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ OPERATING OPTIONS ══ */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="mb-16"
          >
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.4em] uppercase block mb-4">Choose Your Control</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">
              Three ways to <span className="font-semibold">operate.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {operatingOptions.map((opt, i) => (
              <motion.div
                key={opt.key}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                transition={{ delay: i * 0.12 } as any}
                className="relative bg-[#F7F6F3] rounded-3xl p-8 md:p-10 flex flex-col"
              >
                {opt.tag && (
                  <span className={`absolute top-6 right-6 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${opt.tagColor}`}>
                    {opt.tag}
                  </span>
                )}
                <div className="text-gray-400 mb-6">{opt.icon}</div>
                <h3 className="text-2xl font-medium text-[#12141C] mb-1">{opt.title}</h3>
                <p className="text-xs text-gray-400 tracking-wider uppercase mb-5">{opt.subtitle}</p>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{opt.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HARDWARE DETAILS ══ */}
      <section className="w-full bg-[#12141C] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-14"
          >
            <span className="text-white/30 text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Craftsmanship</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-white">Hardware Details</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                img: '/luma-collection/detail-round-cassette.png',
                title: 'Round Cassette',
                desc: 'Sleek cylindrical cassette that fully conceals the rolled fabric when the shade is raised.',
              },
              {
                img: '/luma-collection/detail-square-cassette.png',
                title: 'Square Cassette',
                desc: 'Modern angular cassette profile for a clean architectural look. Available in standard and fascia styles.',
              },
            ].map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={d.img} alt={d.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
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

      {/* ══ MOTORIZED / SMART HOME ══ */}
      <section className="w-full bg-[#12141C] text-white py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row gap-16 md:gap-20 items-center">

            {/* Left — 40% */}
            <motion.div
              className="w-full md:w-[40%] shrink-0"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <span className="text-white/30 text-[11px] font-bold tracking-[0.4em] uppercase block mb-6">Motorized Option</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-8">
                Say the word.<br /><span className="font-semibold">The shade moves.</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed mb-6">
                Upgrade to our <strong className="text-white">Matter-enabled motor</strong> and unlock a whole new level of comfort. Control your shades from your phone, set automated schedules based on sunrise and sunset, or simply ask your voice assistant.
              </p>
              <p className="text-white/60 text-base leading-relaxed mb-10">
                Matter — the universal smart home standard — ensures your Luma shades work seamlessly with <strong className="text-white">Apple Home, Google Home, Amazon Alexa, SmartThings</strong> and more, without any proprietary hub or extra hardware.
              </p>

              {/* Platform pills */}
              <div className="flex flex-wrap gap-3">
                {smartPlatforms.map(p => (
                  <div key={p.name} className="px-6 py-3 rounded-2xl border border-white/15 bg-white/8 text-sm font-medium text-white/80 whitespace-nowrap tracking-wide">
                    {p.name.replace('\n', ' · ')}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — 60% */}
            <motion.div
              className="w-full md:w-[60%]"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeIn}
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/lifestyle-remote-living.png`}
                  alt="Motorized zebra shade with smart remote control"
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
              {/* Feature callouts */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { icon: '📱', text: 'App Control' },
                  { icon: '🕐', text: 'Sunrise/Sunset Schedules' },
                  { icon: '🎙️', text: 'Voice Control' },
                  { icon: '🏠', text: 'Scene Integration' },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/8">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-white/60 text-xs tracking-wide">{f.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══ GALLERY ══ */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">
              Every room. <span className="font-semibold">Elevated.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <motion.button
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
                transition={{ delay: i * 0.07 } as any}
                className="rounded-2xl overflow-hidden aspect-[16/9] relative group cursor-zoom-in"
                onClick={() => openLightbox(galleryImages.map(g => `${BASE}/${g.src}`), i, img.alt)}
              >
                <Image
                  src={`${BASE}/${img.src}`}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FABRIC SWATCHES ══ */}
      <section className="w-full bg-[#F7F6F3] py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="mb-12"
          >
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.4em] uppercase block mb-4">Fabric Collections</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">
              Find your <span className="font-semibold">perfect shade.</span>
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl">
              46 patterns across three fabric types — each available in multiple colorways. Click any pattern to explore its full color range.
            </p>
          </motion.div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-10 flex-wrap">
            {([
              { key: 'db', label: 'Room Darkening', count: `${dbPatterns.length} patterns · 104 colors`, color: 'bg-[#3d3d3d] text-white' },
              { key: 'de', label: 'Light Filtering', count: `${dePatterns.length} patterns · 103 colors`, color: 'bg-amber-500 text-white' },
              { key: 'df', label: 'Sheer Translucent', count: `${dfPatterns.length} patterns · 17 colors`, color: 'bg-sky-500 text-white' },
            ] as { key: SwatchTab; label: string; count: string; color: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => { setSwatchTab(tab.key); setExpandedPattern(null) }}
                className={`flex flex-col items-start px-5 py-3 rounded-2xl text-left transition-all duration-300 border ${
                  swatchTab === tab.key
                    ? `${tab.color} border-transparent shadow-md`
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-semibold">{tab.label}</span>
                <span className={`text-[10px] tracking-wide mt-0.5 ${swatchTab === tab.key ? 'opacity-70' : 'text-gray-400'}`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Swatch type description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={swatchTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-400 text-sm mb-10 max-w-2xl">
                {swatchTab === 'db' && 'Room Darkening (DB) — Solid fabric bands block light effectively when aligned, providing excellent privacy and sleep-quality darkness in any room.'}
                {swatchTab === 'de' && 'Light Filtering (DE) — Soft-weave fabric bands gently diffuse natural light, maintaining a bright and airy atmosphere while reducing glare and UV exposure.'}
                {swatchTab === 'df' && 'Sheer Translucent (DF) — Ultra-fine weave creates a delicate, flowing aesthetic with maximum light transmission and an elegant sheer appearance.'}
              </p>

              {/* Pattern grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {currentPatterns.map(({ pattern, colors }) => {
                  const selIdx = selectedColors[pattern] ?? 0
                  const isExpanded = expandedPattern === pattern
                  return (
                    <div key={pattern}>
                      {/* Main card */}
                      <div className={`w-full rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                        isExpanded ? 'border-[#4DB6E8] shadow-lg' : 'border-transparent hover:border-gray-200'
                      }`}>
                        {/* Clickable image → opens lightbox */}
                        <button
                          className="w-full group relative aspect-square overflow-hidden bg-gray-100 block"
                          onClick={() => openLightbox(colors.map(c => `${SW}/${c}`), selIdx, pattern)}
                          title="Click to zoom"
                        >
                          <Image
                            src={`${SW}/${colors[selIdx]}`}
                            alt={`${pattern} fabric`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Zoom hint */}
                          <span className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                              <path d="M5 8a3 3 0 1 1 6 0A3 3 0 0 1 5 8zm3-5a5 5 0 1 0 3.54 8.54l3.46 3.46 1.42-1.42-3.46-3.46A5 5 0 0 0 8 3zm-1.5 5V6.5h-1v1H4v1h1.5V10h1V8.5H8v-1H6.5z"/>
                            </svg>
                          </span>
                        </button>
                        {/* Footer: pattern name + expand toggle */}
                        <button
                          className="w-full bg-white px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedPattern(isExpanded ? null : pattern)}
                        >
                          <span className="text-xs font-semibold text-[#12141C]">{pattern}</span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            {colors.length} colors
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              <path d="M4 6l4 4 4-4"/>
                            </svg>
                          </span>
                        </button>
                      </div>

                      {/* Expanded sub-color picker */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 grid grid-cols-4 gap-1.5">
                              {colors.map((c, ci) => (
                                <button
                                  key={ci}
                                  onClick={() => {
                                    setSelectedColors(prev => ({ ...prev, [pattern]: ci }))
                                    openLightbox(colors.map(x => `${SW}/${x}`), ci, pattern)
                                  }}
                                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-150 hover:scale-105 ${
                                    selIdx === ci ? 'border-[#4DB6E8] shadow-md' : 'border-transparent hover:border-gray-300'
                                  }`}
                                  title={`${pattern} color ${ci + 1}`}
                                >
                                  <Image src={`${SW}/${c}`} alt={`${pattern} color ${ci + 1}`} fill sizes="80px" className="object-cover" />
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-400 text-center mt-1.5">
                              Color {selIdx + 1} of {colors.length} — click to zoom
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══ WHY LUMA ══ */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">
              Why <span className="font-semibold">Luma?</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '✦', title: 'Custom Made', desc: 'Every shade is cut and assembled to your exact window measurements. No gaps, no guesswork.' },
              { icon: '◈', title: 'Premium Components', desc: 'Heavy-duty aluminum headrail, anti-rust brackets, and high-density fabric that holds its shape for years.' },
              { icon: '⌘', title: 'Smart Ready', desc: 'Matter-certified motor is compatible with every major smart home platform — no proprietary hub needed.' },
              { icon: '❋', title: 'Free Consultation', desc: 'Our team measures, advises, and installs. You relax and enjoy the results.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                transition={{ delay: i * 0.08 } as any}
                className="p-8 border border-gray-100 rounded-3xl hover:shadow-md transition-shadow"
              >
                <span className="text-2xl text-[#4DB6E8] block mb-4">{f.icon}</span>
                <h4 className="text-lg font-semibold text-[#12141C] mb-3">{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="w-full bg-[#3d3d3d] text-white py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <span className="text-white/30 text-[11px] font-bold tracking-[0.4em] uppercase block mb-6">Ready to transform your space?</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-6">
              Start with a free quote.
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              Share your window dimensions and we'll put together a custom quote — including fabric samples delivered to your door.
            </p>
            <Link
              href="/#contact"
              className="inline-block px-10 py-4 bg-white text-[#12141C] text-sm font-semibold tracking-[0.2em] uppercase rounded-full hover:bg-gray-100 transition-colors"
            >
              Get a Free Quote
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-8 border-t border-gray-100">
        <Link href="/products" className="text-xs text-gray-400 tracking-wider uppercase hover:text-gray-700 transition-colors">
          ← Back to All Products
        </Link>
      </div>

      {/* ══ LIGHTBOX MODAL ══ */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Content — stop propagation so clicking image doesn't close */}
            <div className="relative max-w-[1440px] w-full" onClick={e => e.stopPropagation()}>
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors text-sm tracking-widest uppercase"
              >
                Close ✕
              </button>

              {/* Main image */}
              <motion.div
                key={lightbox.idx}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src={lightbox.srcs[lightbox.idx]}
                  alt={`${lightbox.patternName} color ${lightbox.idx + 1}`}
                  width={1440}
                  height={1080}
                  sizes="(max-width: 1440px) 100vw, 1440px"
                  className="w-full h-auto max-h-[75vh] rounded-2xl object-contain shadow-2xl"
                />
              </motion.div>

              {/* Caption */}
              <p className="text-white/60 text-center text-sm mt-4 tracking-wide">
                {lightbox.patternName} &nbsp;·&nbsp; Color {lightbox.idx + 1} of {lightbox.srcs.length}
              </p>

              {/* Prev / Next */}
              {lightbox.srcs.length > 1 && (
                <>
                  <button
                    onClick={lightboxPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={lightboxNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </>
              )}

              {/* Thumbnail strip */}
              {lightbox.srcs.length > 1 && (
                <div className="flex gap-2 justify-center mt-4 flex-wrap">
                  {lightbox.srcs.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(prev => prev ? { ...prev, idx: i } : null)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        lightbox.idx === i ? 'border-[#4DB6E8] scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <Image src={s} alt="" fill sizes="48px" className="object-cover" />
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
