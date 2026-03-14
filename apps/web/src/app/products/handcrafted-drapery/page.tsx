'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import SiteNav from '@/components/SiteNav'
import { DEFAULT_VIDEOS, type ProjectVideo } from '@/lib/gallery-videos-data'

const IMG = '/drapery/handcrafted-drapery'

/* ─── Drapery keyword filter ─── */
const DRAPERY_KEYWORDS = /drapery|drape|sheer|pleat|linen|curtain/i

/* ─── Linen texture background wrapper ─── */
function TactileBg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`w-full py-20 md:py-32 overflow-hidden relative ${className || ''}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.012) 3px, rgba(0,0,0,0.012) 4px), repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(0,0,0,0.008) 5px, rgba(0,0,0,0.008) 6px)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">{children}</div>
    </section>
  )
}

/* ─── Lightbox ─── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl z-10">&times;</button>
      <motion.img initial={{ scale: 0.92 }} animate={{ scale: 1 }} src={src} alt="" className="max-w-full max-h-[90vh] object-contain" />
    </motion.div>
  )
}

/* ─── Cinema-style Video Lightbox ─── */
function CinemaPlayer({ videos, startIndex = 0, onClose }: { videos: ProjectVideo[]; startIndex?: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex)
  const videoRef = useRef<HTMLVideoElement>(null)
  const item = videos[index]

  // Keyboard navigation
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler) }
  }, [onClose])

  // Auto-play when switching
  useEffect(() => {
    const v = videoRef.current
    if (v) { v.currentTime = 0; v.play().catch(() => {}) }
  }, [index])

  if (!item) return null
  const isPortrait = item.orientation === 'portrait'

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      style={{ isolation: 'isolate' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 md:px-10 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#ef8200] text-[10px] font-bold tracking-[0.3em] uppercase">Angel Drapery</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40 text-xs">{index + 1} / {videos.length}</span>
        </div>
        <button
          onClick={onClose}
          className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <span className="text-xs tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Main video area ── */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 md:px-10">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className={`relative ${isPortrait ? 'h-full max-h-[68vh] aspect-[9/16]' : 'w-full max-w-5xl aspect-video'}`}
        >
          <video
            ref={videoRef}
            src={item.video}
            poster={item.poster}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain rounded-lg"
          />
        </motion.div>
      </div>

      {/* ── Title ── */}
      <motion.div
        key={`t-${index}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-center py-2 shrink-0"
      >
        <h3 className="text-white text-sm md:text-base font-light tracking-wide">{item.title}</h3>
      </motion.div>

      {/* ── Thumbnail row — equal height, natural aspect ratio ── */}
      <div className="shrink-0 px-6 md:px-10 pb-4 pt-1">
        <div className="flex gap-2 md:gap-3 justify-center items-center overflow-x-auto scrollbar-hide">
          {videos.map((v, i) => {
            const active = i === index
            // All thumbnails same height, width adapts to aspect ratio
            const aspect = v.orientation === 'landscape' ? 16 / 9 : 9 / 16
            const h = 64 // base height in px
            const w = Math.round(h * aspect)

            return (
              <button
                key={v.id}
                onClick={() => setIndex(i)}
                className="group relative shrink-0 overflow-hidden rounded-md transition-all duration-300"
                style={{ width: w, height: h }}
              >
                {/* Poster */}
                <img src={v.poster} alt={v.title} className="w-full h-full object-cover" />

                {/* Overlay */}
                <div className={`absolute inset-0 transition-all duration-300 ${
                  active
                    ? 'bg-transparent ring-2 ring-[#ef8200] ring-inset rounded-md'
                    : 'bg-black/50 group-hover:bg-black/20'
                }`} />

                {/* Play icon on active */}
                {active && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#ef8200] flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                )}

                {/* Title below on hover */}
                <div className={`absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
                  active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <p className="text-white text-[8px] leading-tight truncate text-center">{v.title}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Tactile clickable image ─── */
function TactileImg({ src, alt, className, onOpen }: { src: string; alt: string; className?: string; onOpen: (s: string) => void }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`cursor-zoom-in overflow-hidden rounded-sm ${className || ''}`} onClick={() => onOpen(src)}>
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    </motion.div>
  )
}

/* ─── Reveal on scroll ─── */
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function HandcraftedDraperyPage() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [videoOpen, setVideoOpen] = useState(false)
  const [videoStartIndex, setVideoStartIndex] = useState(0)
  const [draperyVideos, setDraperyVideos] = useState<ProjectVideo[]>([])
  const open = (s: string) => setLightboxSrc(s)

  // Fetch admin-edited video data and filter drapery-related ones
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/gallery-videos')
        const data = await res.json()
        const overrides: Record<number, any> = data.success ? data.data : {}

        const merged = DEFAULT_VIDEOS.map(v => {
          const o = overrides[v.id]
          if (!o) return v
          return { ...v, title: o.title ?? v.title, location: o.location ?? v.location, tag: o.tag ?? v.tag, description: o.description ?? v.description }
        })

        // Filter for drapery-related videos by title
        const filtered = merged.filter(v => DRAPERY_KEYWORDS.test(v.title))
        setDraperyVideos(filtered.length > 0 ? filtered : merged.slice(0, 7))
      } catch {
        // Fallback to all defaults
        const filtered = DEFAULT_VIDEOS.filter(v => DRAPERY_KEYWORDS.test(v.title))
        setDraperyVideos(filtered.length > 0 ? filtered : DEFAULT_VIDEOS.slice(0, 7))
      }
    })()
  }, [])

  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <AnimatePresence>
        {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
        {videoOpen && draperyVideos.length > 0 && (
          <CinemaPlayer videos={draperyVideos} startIndex={videoStartIndex} onClose={() => setVideoOpen(false)} />
        )}
      </AnimatePresence>

      {/* ═══════════ 1. Hero: Tactile Close-up (IMG_0547) ═══════════ */}
      <section className="relative h-[80vh] overflow-hidden flex items-end pb-20 md:pb-24 px-8 md:px-20 border-b-[12px] border-[#1A1D29]">
        <motion.img
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          src={`${IMG}/IMG_0547.JPG`}
          alt="French pleat drapery close-up"
          className="absolute inset-0 w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

        <SiteNav activePage="Products" />

        {/* Hero text */}
        <div className="relative z-10 max-w-5xl">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-white/70 tracking-[0.4em] text-xs uppercase mb-6 drop-shadow-md">
            Handcrafted in Temple City, CA
          </motion.p>
          <motion.h2
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl font-serif text-white leading-[0.95] italic mb-8 drop-shadow-2xl"
          >
            Tactile <br /><span className="ml-12 md:ml-32 not-italic">Artistry.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="text-white/80 text-lg max-w-xl mb-8 font-light drop-shadow-md">
            Experience the fine texture and precision of our bespoke drapery. Over 3,000 fabrics. 40 years of local expertise.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            className="flex items-center gap-6">
            <button className="bg-white px-10 py-4 text-black text-sm uppercase tracking-widest font-bold hover:bg-[#ef8200] hover:text-white transition-all duration-300 shadow-lg">
              Request Consultation
            </button>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Link href="/products" className="hover:text-white/70 transition-colors">Products</Link>
              <span>/</span>
              <span className="text-white/60">Handcrafted Drapery</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 2. Styles: Tactile Cards ═══════════ */}
      <TactileBg className="bg-[#FAF9F7]">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-[#ef8200] font-bold text-xs tracking-[0.3em] uppercase">Six Signature Styles</span>
            <h3 className="text-4xl md:text-6xl font-serif italic text-gray-900 mt-4 tracking-tight">The Collection</h3>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start">
          {/* Left: composite image */}
          <Reveal>
            <TactileImg
              src={`${IMG}/04_fa469c_c8ae22a6dc774d28a6e6e3b637ad406c~mv2.jpeg`}
              alt="Pinch Pleat and Tailored Pleat styles"
              className="w-full aspect-[4/5] shadow-xl"
              onOpen={open}
            />
          </Reveal>

          {/* Right: tactile style cards */}
          <div className="space-y-6">
            {[
              { title: '2-Fold Pinch Pleat', desc: 'The most popular choice — timeless, elegant, with luxurious fullness that defines traditional drapery.' },
              { title: '3-Fold Pinch Pleat', desc: 'Triple-folded for extra depth and body, creating rich, dramatic pleats that catch light beautifully.' },
              { title: '2-Fold Tailored Pleat', desc: 'A cleaner, more structured approach — modern sophistication with a tailored silhouette.' },
              { title: '3-Fold Tailored Pleat', desc: 'Maximum structure meets refined fullness. The pinnacle of contemporary pleat design.' },
            ].map((style, idx) => (
              <Reveal key={idx} delay={idx * 0.1}>
                <div className="bg-white p-8 rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 group hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl font-serif italic text-[#ef8200]/20">0{idx + 1}</span>
                    <h4 className="text-xl font-serif text-gray-900 group-hover:text-[#ef8200] transition-colors duration-300">{style.title}</h4>
                  </div>
                  <p className="text-gray-500 leading-relaxed pl-14">{style.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Ripple Fold + Grommet row */}
        <Reveal className="mt-16">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start">
            <div className="space-y-6">
              {[
                { title: 'Ripple Fold', desc: 'Contemporary wave-like folds that glide effortlessly on a track — the choice for minimalist, modern interiors.' },
                { title: 'Grommet', desc: 'Bold metal rings create uniform, sculptural folds. A statement piece that balances industrial edge with soft fabric.' },
              ].map((style, idx) => (
                <Reveal key={idx} delay={idx * 0.1}>
                  <div className="bg-white p-8 rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 group hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-3xl font-serif italic text-[#ef8200]/20">0{idx + 5}</span>
                      <h4 className="text-xl font-serif text-gray-900 group-hover:text-[#ef8200] transition-colors duration-300">{style.title}</h4>
                    </div>
                    <p className="text-gray-500 leading-relaxed pl-14">{style.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <TactileImg
              src={`${IMG}/05_fa469c_9d6c408529b640c0b7bdb6ab0277d248~mv2.jpg`}
              alt="Ripple Fold and Grommet styles"
              className="w-full aspect-[4/5] shadow-xl"
              onOpen={open}
            />
          </div>
        </Reveal>
      </TactileBg>

      {/* ═══════════ 3. 100% Custom — Feature Strip ═══════════ */}
      <section className="py-20 md:py-28 px-6 md:px-10 bg-[#3d3d3d] text-white relative overflow-hidden"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px), repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(255,255,255,0.01) 5px, rgba(255,255,255,0.01) 6px)',
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
              <div className="lg:w-1/3 shrink-0">
                <span className="text-[#ef8200] font-bold text-xs tracking-[0.3em] uppercase">Bespoke Quality</span>
                <h3 className="text-3xl md:text-5xl font-serif italic text-white leading-tight mt-4 tracking-tight">
                  100% Custom<br />Crafted in<br />the USA
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 lg:w-2/3">
                {[
                  ['6 custom styles', 'Pinch pleat, tailored pleat, ripple fold, grommet and more.'],
                  ['270%+ fullness', 'Luxurious, rich folds that drape with unmatched elegance.'],
                  ['3,000+ fabrics', 'From sheer linens to bold patterns — the perfect match for your home.'],
                  ['Wall & ceiling mount', 'Versatile mounting options for any architectural style.'],
                  ['Custom dimensions', 'Precise lengths and widths, tailored to your windows.'],
                  ['Double-turned hems', 'High-quality side and bottom hems for a polished finish.'],
                  ['Blackout lining', 'Optional blackout fabric for complete light control and privacy.'],
                ].map(([title, desc], idx) => (
                  <Reveal key={idx} delay={idx * 0.05}>
                    <div className="border-l-2 border-[#ef8200]/40 pl-5 py-1">
                      <p className="text-base font-semibold text-white">{title}</p>
                      <p className="text-sm text-white/50 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ 4. How We Make: Asymmetric Collage ═══════════ */}
      <TactileBg className="bg-white">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          {/* Sticky left */}
          <div className="lg:w-1/3 lg:sticky lg:top-32 space-y-6">
            <Reveal>
              <span className="text-[#ef8200] font-bold text-xs tracking-[0.3em] uppercase">The Process</span>
              <h3 className="text-4xl md:text-5xl font-serif italic text-gray-900 tracking-tight mt-4">At the Atelier</h3>
              <p className="text-gray-500 leading-relaxed font-light italic mt-6 text-lg">
                &ldquo;Our master craftspeople measure, cut, and sew every drape in our USA workshop, ensuring 100% bespoke quality and a perfect 270%+ fullness.&rdquo;
              </p>
            </Reveal>
          </div>

          {/* Asymmetric collage right */}
          <div className="lg:w-2/3 grid grid-cols-2 gap-5">
            {[
              { src: `${IMG}/06_fa469c_cca674eb66bd4de89cdb21c54b1777fe~mv2.jpg`, title: 'Measure & Cut', offset: false,
                desc: 'Floor to rod height, minus 1" for rings, plus 16" for header and hem.' },
              { src: `${IMG}/07_fa469c_c2525d0710da44e280725f3f9222e746~mv2.jpg`, title: 'Blind Stitch Hem', offset: true,
                desc: 'Folded 8", double-hemmed with enclosed weights. 4" seamless finish.' },
              { src: `${IMG}/08_fa469c_b3fe01b8538d4205b0babddf41bdc2fb~mv2.jpg`, title: 'Fold & Press Lining', offset: false,
                desc: '2" double-folded hem, blind-stitched for an invisible interior finish.' },
              { src: `${IMG}/09_fa469c_17345f9b1b6641dcb0d613016d49c095~mv2.jpg`, title: 'Create Header', offset: true,
                desc: '4" Buckram inserted, pleats folded and secured with thimble machine.' },
            ].map((step, idx) => (
              <Reveal key={idx} delay={idx * 0.1} className={step.offset ? 'mt-12' : ''}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative group cursor-zoom-in"
                  onClick={() => open(step.src)}
                >
                  <img src={step.src} alt={step.title}
                    className="w-full h-[320px] md:h-[380px] object-cover rounded-sm shadow-xl transition-shadow duration-500 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.18)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-colors duration-500 rounded-sm flex flex-col justify-end p-5 md:p-6">
                    <span className="text-3xl font-serif italic text-white/20 mb-1">0{idx + 1}</span>
                    <span className="text-white text-lg font-bold tracking-tight">{step.title}</span>
                    <p className="text-white/60 text-sm mt-1 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">{step.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </TactileBg>

      {/* ═══════════ 5. Installation Gallery + Videos ═══════════ */}
      <TactileBg className="bg-[#F3F2EF]">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-[#ef8200] font-bold text-xs tracking-[0.3em] uppercase">Portfolio</span>
            <h3 className="text-4xl md:text-6xl font-serif italic text-gray-900 mt-4 tracking-tight">Our Installations</h3>
          </div>
        </Reveal>

        {/* Photo gallery — masonry */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {[
            { src: `${IMG}/IMG_2531.PNG`, alt: 'Contemporary living room with custom drapery' },
            { src: `${IMG}/IMG_0547.JPG`, alt: 'Pleated drapery on decorative rod' },
            { src: `${IMG}/IMG_9864.JPG`, alt: 'Elegant living space with floor-to-ceiling drapery' },
            { src: `${IMG}/IMG_3146.jpg`, alt: 'White sheer pinch-pleat drapery' },
            { src: `${IMG}/IMG_6600.jpg`, alt: 'Textured drapery on black rod' },
            { src: `${IMG}/IMG_9865.JPG`, alt: 'Modern entryway with custom drapery' },
            { src: `${IMG}/FullSizeRender.JPG`, alt: 'Ceiling-mounted pleated panels' },
          ].map((img, idx) => (
            <Reveal key={idx} delay={idx * 0.04}>
              <TactileImg src={img.src} alt={img.alt} className="w-full shadow-lg break-inside-avoid" onOpen={open} />
            </Reveal>
          ))}
        </div>

        {/* Video row */}
        {draperyVideos.length > 0 && (
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gray-300" />
                <span className="text-[#ef8200] font-bold text-[11px] tracking-[0.3em] uppercase whitespace-nowrap">Drapery in Motion</span>
                <div className="h-px flex-1 bg-gray-300" />
              </div>
            </Reveal>

            <div className="flex gap-3 md:gap-4 justify-center items-center overflow-x-auto pb-2 scrollbar-hide">
              {draperyVideos.map((v, i) => {
                const aspect = v.orientation === 'landscape' ? 16 / 9 : 9 / 16
                const h = 390
                const w = Math.round(h * aspect)

                return (
                  <Reveal key={v.id} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.3 }}
                      className="relative shrink-0 overflow-hidden rounded-lg cursor-pointer group shadow-lg"
                      style={{ width: w, height: h }}
                      onClick={() => { setVideoOpen(true); setVideoStartIndex(i) }}
                    >
                      <img src={v.poster} alt={v.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-all duration-400" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center group-hover:bg-[#ef8200]/80 group-hover:border-[#ef8200] transition-all duration-300">
                          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                        <p className="text-white text-[11px] font-medium leading-tight line-clamp-2">{v.title}</p>
                      </div>
                    </motion.div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        )}
      </TactileBg>

      {/* ═══════════ 6. Fabric & Hardware — Split Editorial ═══════════ */}
      <TactileBg className="bg-white">
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
          <Reveal className="md:col-span-7">
            <TactileImg src={`${IMG}/IMG_1304.jpg`} alt="Fabric samples on decorative rod"
              className="w-full shadow-2xl" onOpen={open} />
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5 space-y-8">
            <span className="text-[#ef8200] font-bold text-xs tracking-[0.3em] uppercase">Materials</span>
            <h3 className="text-3xl md:text-5xl font-serif italic text-gray-900 leading-tight tracking-tight">
              Premium Fabrics<br />&amp; Hardware
            </h3>
            <p className="text-gray-500 leading-relaxed text-base">
              Choose from over 3,000 fashionable fabrics — from sheer linens and elegant silks to textured
              wovens and bold patterns. Every fabric is carefully paired with high-quality rods, rings,
              and mounting hardware to create a polished, coordinated look.
            </p>
            <TactileImg src={`${IMG}/IMG_1310.WEBP`} alt="Patterned drapery on decorative rod"
              className="w-full aspect-[3/2] shadow-lg" onOpen={open} />
          </Reveal>
        </div>
      </TactileBg>

      {/* ═══════════ 7. Behind the Scenes ═══════════ */}
      <TactileBg className="bg-[#FAF9F7]">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-[#ef8200] font-bold text-xs tracking-[0.3em] uppercase">Workshop</span>
            <h3 className="text-4xl md:text-6xl font-serif italic text-gray-900 mt-4 tracking-tight">Behind the Scenes</h3>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { src: `${IMG}/IMG_5390.jpg`, alt: 'Artisan at sewing machine' },
            { src: `${IMG}/IMG_5391.jpg`, alt: 'Workshop team at work' },
            { src: `${IMG}/IMG_0993.jpg`, alt: 'Drapery production process' },
          ].map((img, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <TactileImg src={img.src} alt={img.alt} className="w-full aspect-[4/3] shadow-lg" onOpen={open} />
            </Reveal>
          ))}
        </div>
      </TactileBg>

      {/* ═══════════ 8. Footer ═══════════ */}
      <footer className="py-16 px-8 md:px-20 bg-[#3d3d3d]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 4px)',
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-8">
            <div>
              <h4 className="text-white font-serif italic text-xl tracking-tight">Angel Drapery</h4>
              <p className="text-white/30 text-sm mt-2">&copy;2025 by Angel Drapery, Inc</p>
            </div>
            <div className="flex items-center gap-8">
              <a href="https://youtube.com/@angeldrapery1544" target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors duration-300" title="YouTube">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://www.etsy.com/shop/AngelDrapery?ref=shop-header-name&listing_id=825450511" target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors duration-300 font-bold text-xs tracking-wider uppercase" title="Etsy">Etsy</a>
              <a href="http://www.tiktok.com/@angeldrapery2100" target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors duration-300" title="TikTok">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              <a href="https://instagram.com/angeldrapery?igshid=MjEwN2IyYWYwYw==" target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors duration-300" title="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
