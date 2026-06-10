'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { m as motion, AnimatePresence } from 'framer-motion'

const BASE = '/top-treatments'

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } },
}
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

/* ─── Data ─── */
const cornices = [
  { name: 'Albany Cornice',        image: `${BASE}/cornices/image_001.jpg`, description: 'A padded cornice with a straight step shape.' },
  { name: 'Atlanta Cornice',       image: `${BASE}/cornices/image_002.jpg`, description: 'A padded cornice that features an inset arched design with a downward center point.' },
  { name: 'Belvedere Cornice',     image: `${BASE}/cornices/image_003.jpg`, description: 'A padded cornice with a straight angled-step shape.' },
  { name: 'Low Profile Belvedere', image: `${BASE}/cornices/image_004.jpg`, description: 'A straight angled-step cornice that is unpadded with a shorter long point than the original Belvedere.' },
  { name: 'Chateau Cornice',       image: `${BASE}/cornices/image_005.jpg`, description: 'A padded cornice with an intricate curved shape.' },
  { name: 'Decatur Cornice',       image: `${BASE}/cornices/image_006.jpg`, description: 'A padded cornice that features an intricate inset arched design with an upward center point.' },
  { name: 'Florence Cornice',      image: `${BASE}/cornices/image_007.jpg`, description: 'A padded cornice with an inset centered arch shape.' },
  { name: 'Marietta Cornice',      image: `${BASE}/cornices/image_008.jpg`, description: 'A padded cornice that features an intricate inset curved design with an upward center point.' },
  { name: 'Richmond Cornice',      image: `${BASE}/cornices/image_009.jpg`, description: 'A padded cornice that features a curved center design with partial scallops at each end.' },
  { name: 'Savannah Cornice',      image: `${BASE}/cornices/image_010.jpg`, description: 'A padded cornice with an arched center and upward points at each end.' },
  { name: 'Low Profile Savannah',  image: `${BASE}/cornices/image_011.jpg`, description: 'An arched center cornice with upward points at each end, unpadded with a shorter long point.' },
  { name: 'Statler Cornice',       image: `${BASE}/cornices/image_012.jpg`, description: 'A classic straight padded cornice.' },
  { name: 'Low Profile Statler',   image: `${BASE}/cornices/image_013.jpg`, description: 'A classic straight cornice that is unpadded with a shorter long point than the original Statler.' },
]

const boardValances = [
  { name: 'Berkshire Valance',    image: `${BASE}/board-mounted-valances/image_001.jpg`, description: 'A valance with box pleats and a scalloped hem.' },
  { name: 'Charleston Valance',   image: `${BASE}/board-mounted-valances/image_002.jpg`, description: 'A valance that features a scalloped hem with overlaid pleated pelmets.' },
  { name: 'Diana Valance',        image: `${BASE}/board-mounted-valances/image_003.jpg`, description: 'A scalloped pleated valance with cascades at each end.' },
  { name: 'Handkerchief Valance', image: `${BASE}/board-mounted-valances/image_004.jpg`, description: 'A three-panel valance with a straight center panel and gently angled side panels.' },
  { name: 'Hathaway Valance',     image: `${BASE}/board-mounted-valances/image_005.jpg`, description: 'A valance with box pleats and a curved hem.' },
  { name: 'Judith Valance',       image: `${BASE}/board-mounted-valances/image_006.jpg`, description: 'A single fold, straight valance with a bottom skirt that mimics the look of a raised Roman shade.' },
  { name: 'Kennedy Valance',      image: `${BASE}/board-mounted-valances/image_007.jpg`, description: 'A contemporary swag valance with cascades at each end.' },
  { name: 'Madison Valance',      image: `${BASE}/board-mounted-valances/image_008.jpg`, description: 'A valance with box pleated corners and a straight hem.' },
  { name: 'Monticello Valance',   image: `${BASE}/board-mounted-valances/image_009.jpg`, description: 'An arched, box pleated valance with cascades at each end.' },
  { name: 'Sheldon Valance',      image: `${BASE}/board-mounted-valances/image_010.jpg`, description: 'A classic box pleated valance with a straight hem.' },
  { name: 'Stagecoach Valance',   image: `${BASE}/board-mounted-valances/image_011.jpg`, description: 'A hobbled straight valance with knotted ties at each end.' },
  { name: 'Welles Valance',       image: `${BASE}/board-mounted-valances/image_012.jpg`, description: 'A contemporary valance with horizontal pleats and a straight hem.' },
]

const rodValances = [
  { name: 'Briscoe Valance',    image: `${BASE}/rod-mounted-valances/image_001.jpg`, description: 'A three-panel valance with a straight center panel and gently angled side panels.' },
  { name: 'Brooklyn Valance',   image: `${BASE}/rod-mounted-valances/image_002.jpg`, description: 'A hidden tab, straight hem valance that creates uniform waves.' },
  { name: 'Danby Valance',      image: `${BASE}/rod-mounted-valances/image_003.jpg`, description: 'An inverted center pleat creates a swag as the sides are pulled up with ties.' },
  { name: 'Lifton Valance',     image: `${BASE}/rod-mounted-valances/image_004.jpg`, description: 'A valance with box pleats and a curved hem.' },
  { name: 'Plaza I Valance',    image: `${BASE}/rod-mounted-valances/image_005.jpg`, description: 'A pinch pleated valance available in Three Finger Pinch Pleat or Inverted Pleat with multiple fullness options.' },
  { name: 'Plaza II Valance',   image: `${BASE}/rod-mounted-valances/image_006.jpg`, description: 'A rod pocket valance with multiple fullness choices and optional header that gathers above the rod.' },
  { name: 'Spencer Valance',    image: `${BASE}/rod-mounted-valances/image_007.jpg`, description: 'A valance with inverted box pleats and a straight hem.' },
  { name: 'Summerton Valance',  image: `${BASE}/rod-mounted-valances/image_008.jpg`, description: 'A valance with box pleats and a scalloped hem.' },
  { name: 'Winchester Valance', image: `${BASE}/rod-mounted-valances/image_009.jpg`, description: 'A rod pocket tapered valance with multiple fullness choices and optional header.' },
]

const swags = [
  { name: 'Astor Swag',                    image: `${BASE}/swags/image_002.jpg`, description: 'Up to nine traditional swags mounted on a board. Cascades draped at each end for a grand, layered effect.' },
  { name: 'Pole Swag',                     image: `${BASE}/swags/image_003.jpg`, description: 'Up to seven traditional swags installed on a decorative drapery rod. Cascades draped at each end.' },
  { name: 'Westlake Swag',                 image: `${BASE}/swags/image_004.jpg`, description: 'A single traditional swag mounted on a board. Clean and classic elegance.' },
  { name: 'Westlake Swag with Cascades',   image: `${BASE}/swags/image_005.jpg`, description: 'A single traditional swag draped over cascades and mounted on a board.' },
]

const defaultSwagInstallations = [
  `${BASE}/swags/photo_001.jpg`,
  `${BASE}/swags/photo_002.jpg`,
  `${BASE}/swags/photo_003.jpg`,
  `${BASE}/swags/photo_004.jpg`,
  `${BASE}/swags/photo_005.jpg`,
  `${BASE}/swags/photo_006.jpg`,
]

const categories = [
  { label: 'Cornices',               id: 'cornices' },
  { label: 'Board Mounted Valances', id: 'board-mounted-valances' },
  { label: 'Rod Mounted Valances',   id: 'rod-mounted-valances' },
  { label: 'Swags',                  id: 'swags' },
]

/* ─── Style grid section ─── */
function StyleGrid({
  id, tag, title, subtitle, styles, bg, onOpen, offset,
}: {
  id: string; tag: string; title: string; subtitle: string
  styles: typeof cornices; bg: string; onOpen: (srcs: string[], idx: number) => void; offset: number
}) {
  const srcs = styles.map(s => s.image)
  return (
    <section id={id} className={`w-full ${bg} py-20 md:py-28 scroll-mt-24`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
          className="mb-14"
        >
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">{tag}</span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">{title}</h2>
          <p className="text-gray-400 text-sm mt-3 max-w-lg">{subtitle}</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {styles.map((style, i) => (
            <motion.div
              key={style.name}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.06 } } }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-zoom-in group"
              onClick={() => onOpen(srcs, i)}
            >
              <div className="overflow-hidden">
                <Image
                  src={style.image} alt={style.name} loading="lazy"
                  width={600} height={450}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="w-full h-auto block group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h4 className="text-sm font-semibold text-[#12141C] mb-1.5 tracking-tight">{style.name}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{style.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HandcraftedTopTreatmentPage() {
  const [lightbox, setLightbox] = useState<{ srcs: string[]; idx: number } | null>(null)
  const [swagInstallations, setSwagInstallations] = useState(defaultSwagInstallations)

  const openLightbox = (srcs: string[], idx: number) => setLightbox({ srcs, idx })
  const closeLightbox = () => setLightbox(null)
  const lbPrev = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx - 1 + prev.srcs.length) % prev.srcs.length } : null)
  const lbNext = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx + 1) % prev.srcs.length } : null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/installation-images?productType=handcrafted-top-treatment')
        const json = await res.json()
        if (json.success && json.data.length > 0) {
          const published = json.data.filter((i: any) => i.is_published)
          if (published.length > 0) {
            setSwagInstallations(published.map((i: any) => i.image_url))
          }
        }
      } catch {}
    })()
  }, [])

  const swagSrcs = swags.map(s => s.image)

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative w-full h-[70vh] min-h-[520px] overflow-hidden bg-[#2a2a2a]">
        <Image
          src={`${BASE}/cover.jpg`}
          alt="Handcrafted Top Treatment"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/65" />
        <SiteNav activePage="Products" />
        <div className="absolute inset-0 flex items-end pb-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <nav className="flex items-center gap-2 text-white/40 text-xs tracking-[0.2em] uppercase mb-6">
                <Link href="/products" className="hover:text-white/70 transition-colors">Products</Link>
                <span>/</span>
                <span className="text-white/70">Top Treatment</span>
              </nav>
              <span className="text-white/50 text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Angel Drapery Handcrafted</span>
              <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-[1.05]">
                Top<br />Treatments
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
              <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Handcrafted in the USA</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-6">
                The finishing touch<br />your windows deserve.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-md">
                A well-designed top treatment transforms a window from functional to extraordinary. Whether you choose the structured elegance of a cornice, the soft flow of a valance, or the timeless drama of a swag, each piece is custom crafted to complement your interior and your lifestyle.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Our workroom artisans bring decades of experience to every project — selecting premium fabrics, hand-finishing details, and tailoring each piece to your exact measurements and design vision.
              </p>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { num: '38+',  label: 'Distinct Styles' },
                { num: '3000+', label: 'Fabric Options' },
                { num: '100%', label: 'Custom Made' },
              ].map(s => (
                <div key={s.label} className="bg-[#F7F5F2] rounded-2xl p-6 text-center">
                  <div className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-1">{s.num}</div>
                  <div className="text-xs text-gray-400 tracking-wide">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY ANCHORS ──────────────────────────────────────── */}
      <section className="w-full bg-[#F7F5F2] py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp}>
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gray-400 text-center mb-6">Browse by Style</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="block text-center py-4 px-3 rounded-2xl border border-[#E8E4DF] bg-white hover:bg-[#12141C] hover:text-white hover:border-[#12141C] transition-all duration-300 text-sm font-medium text-[#12141C] tracking-tight"
                >
                  {cat.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────────── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
                <Image
                  src={`${BASE}/board-mounted-valances/image_013.jpg`}
                  alt="Board mounted valance in a bright interior"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
              <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Why Choose Us</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-8">
                100% Custom<br />Crafted.
              </h2>
              <div className="space-y-5">
                {[
                  { title: 'Custom Measurements',    desc: 'Every piece is made to your exact window dimensions — inside or outside mount.' },
                  { title: 'Premium Fabric Selection', desc: 'Thousands of fabric choices from textured wovens to elegant silks and linens.' },
                  { title: 'Hand-Finished Construction', desc: 'Our artisans hand-sew and hand-finish every detail for lasting quality.' },
                  { title: 'Optional Upgrades',      desc: 'Padding, trim, lining, and contrast welt options available across most styles.' },
                  { title: 'Design Consultation',    desc: 'Expert guidance to help you choose the right style for your space.' },
                  { title: 'Professional Installation', desc: 'Precise measuring and installation by our experienced team.' },
                ].map((feat, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-1" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#12141C] mb-0.5 tracking-tight">{feat.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CORNICES ──────────────────────────────────────────────── */}
      <StyleGrid
        id="cornices"
        tag="Structured Elegance"
        title="Cornices"
        subtitle="Fabric upholstered over an all-wood construction. Available in inside or outside mount, with a variety of optional upgrades. Adds a clean, architectural finish to any window."
        styles={cornices}
        bg="bg-[#F7F5F2]"
        onOpen={openLightbox}
        offset={0}
      />

      {/* Cornices room shots */}
      <section className="w-full bg-[#F7F5F2] pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[`${BASE}/cornices/image_014.jpg`, `${BASE}/cornices/image_015.jpg`].map((src, i) => (
              <motion.div
                key={src}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } } }}
                className="rounded-2xl overflow-hidden cursor-zoom-in group"
                onClick={() => openLightbox([`${BASE}/cornices/image_014.jpg`, `${BASE}/cornices/image_015.jpg`], i)}
              >
                <Image src={src} alt={`Cornice installation ${i + 1}`} width={800} height={600} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOARD MOUNTED VALANCES ────────────────────────────────── */}
      <StyleGrid
        id="board-mounted-valances"
        tag="Soft & Sculptural"
        title="Board Mounted Valances"
        subtitle="Decorative fabric draped over an all-wood frame. Soft and structured in equal measure, these valances add warmth and personality to any window."
        styles={boardValances}
        bg="bg-white"
        onOpen={openLightbox}
        offset={cornices.length}
      />

      {/* Board Mounted room shots */}
      <section className="w-full bg-white pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[`${BASE}/board-mounted-valances/image_013.jpg`, `${BASE}/board-mounted-valances/image_014.jpg`].map((src, i) => (
              <motion.div
                key={src}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } } }}
                className="rounded-2xl overflow-hidden cursor-zoom-in group"
                onClick={() => openLightbox([`${BASE}/board-mounted-valances/image_013.jpg`, `${BASE}/board-mounted-valances/image_014.jpg`], i)}
              >
                <Image src={src} alt={`Board mounted valance ${i + 1}`} width={800} height={600} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROD MOUNTED VALANCES ──────────────────────────────────── */}
      <StyleGrid
        id="rod-mounted-valances"
        tag="Light & Tailored"
        title="Rod Mounted Valances"
        subtitle="Handcrafted from decorative fabric and installed on concealed hardware. A tailored yet lightweight top treatment that pairs beautifully with drapery panels or stands alone."
        styles={rodValances}
        bg="bg-[#F7F5F2]"
        onOpen={openLightbox}
        offset={cornices.length + boardValances.length}
      />

      {/* Rod Mounted room shots */}
      <section className="w-full bg-[#F7F5F2] pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[`${BASE}/rod-mounted-valances/image_010.jpg`, `${BASE}/rod-mounted-valances/image_011.jpg`].map((src, i) => (
              <motion.div
                key={src}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } } }}
                className="rounded-2xl overflow-hidden cursor-zoom-in group"
                onClick={() => openLightbox([`${BASE}/rod-mounted-valances/image_010.jpg`, `${BASE}/rod-mounted-valances/image_011.jpg`], i)}
              >
                <Image src={src} alt={`Rod mounted valance ${i + 1}`} width={800} height={600} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SWAGS ─────────────────────────────────────────────────── */}
      <StyleGrid
        id="swags"
        tag="Timeless Grandeur"
        title="Swags & Cascades"
        subtitle="Complete your window design with the classic elegance of custom swags. These timeless top treatments create a sense of grandeur and can be further personalized with optional upgrades."
        styles={swags}
        bg="bg-white"
        onOpen={openLightbox}
        offset={cornices.length + boardValances.length + rodValances.length}
      />

      {/* Swag installation photos */}
      <section className="w-full bg-white pb-20 md:pb-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp} className="mb-10">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block">Real Projects</span>
            <h3 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mt-2">Our Swag Installations</h3>
          </motion.div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {swagInstallations.map((src, i) => (
              <div key={i} className="break-inside-avoid">
                <motion.div
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } } }}
                  className="rounded-2xl overflow-hidden cursor-zoom-in group"
                  onClick={() => openLightbox(swagInstallations, i)}
                >
                  <Image src={src} alt={`Swag installation ${i + 1}`} width={800} height={1000} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="w-full bg-[#12141C] py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Get Started</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-white mb-6">
              Ready to transform<br />your windows?
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-md mx-auto">
              Schedule a free in-home consultation. We&apos;ll help you choose the perfect top treatment style, fabric, and finish for your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#contact">
                <button className="px-10 py-4 bg-white text-[#12141C] text-sm font-medium tracking-[0.15em] uppercase hover:bg-gray-100 transition-colors rounded-full">
                  Schedule Consultation
                </button>
              </Link>
              <Link href="/products">
                <button className="px-10 py-4 border border-white/20 text-white text-sm font-medium tracking-[0.15em] uppercase hover:bg-white/10 transition-colors rounded-full">
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="max-w-[1440px] w-full" onClick={e => e.stopPropagation()}>
              <div className="relative flex items-center justify-center">
                {lightbox.srcs.length > 1 && (
                  <button onClick={lbPrev} className="absolute left-0 -translate-x-12 text-white/50 hover:text-white hidden md:block">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                )}
                <Image src={lightbox.srcs[lightbox.idx]} alt={`Handcrafted top treatment, image ${lightbox.idx + 1}`} width={1440} height={1080} sizes="(max-width: 1440px) 100vw, 1440px" className="w-full h-auto max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
                {lightbox.srcs.length > 1 && (
                  <button onClick={lbNext} className="absolute right-0 translate-x-12 text-white/50 hover:text-white hidden md:block">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </button>
                )}
              </div>
              {lightbox.srcs.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {lightbox.srcs.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setLightbox(prev => prev ? { ...prev, idx: i } : null)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox.idx ? 'border-white/80' : 'border-transparent opacity-50 hover:opacity-80'}`}
                    >
                      <Image src={s} alt={`Handcrafted top treatment thumbnail ${i + 1}`} fill sizes="48px" className="object-cover" />
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
