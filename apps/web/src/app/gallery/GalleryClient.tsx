'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { type ProjectVideo, DEFAULT_VIDEOS } from '@/lib/gallery-videos-data'

// Re-export for backward-compat with gallery/page.tsx
export type { ProjectVideo }
export { DEFAULT_VIDEOS }

// ─────────────────────────────────────────────────────────────────────────────
// Video Card — plays on hover
// ─────────────────────────────────────────────────────────────────────────────
function VideoFrame({ item, onClick }: { item: ProjectVideo; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    videoRef.current?.play().catch(() => {})
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
      className="group cursor-pointer flex flex-col gap-3 w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ aspectRatio: item.orientation === 'landscape' ? '16/9' : '9/16' }}
      >
        <img
          src={item.poster}
          alt={item.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        />
        <video
          ref={videoRef}
          src={item.video}
          muted loop playsInline preload="none"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-400 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <div className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 border border-white/40 flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
        <span className="absolute top-3 left-3 text-[9px] font-mono bg-black/40 text-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {item.tag}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-medium text-[#3d3d3d] leading-tight">{item.title}</h3>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">{item.location}</p>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox with prev/next navigation + swipe
// ─────────────────────────────────────────────────────────────────────────────
function Lightbox({
  videos,
  currentIndex,
  onClose,
  onNav,
}: {
  videos: ProjectVideo[]
  currentIndex: number
  onClose: () => void
  onNav: (idx: number) => void
}) {
  const item = videos[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < videos.length - 1

  // Touch swipe state
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const goPrev = useCallback(() => { if (hasPrev) onNav(currentIndex - 1) }, [hasPrev, currentIndex, onNav])
  const goNext = useCallback(() => { if (hasNext) onNav(currentIndex + 1) }, [hasNext, currentIndex, onNav])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose, goPrev, goNext])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  const isPortrait = item.orientation === 'portrait'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ isolation: 'isolate', backgroundColor: '#000' }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all group"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 text-white/40 text-xs font-mono tracking-widest">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* Prev arrow */}
      {hasPrev && (
        <button
          onClick={e => { e.stopPropagation(); goPrev() }}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-all"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          onClick={e => { e.stopPropagation(); goNext() }}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-all"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Content — vertical layout: video on top, info below */}
      <div
        className="relative flex flex-col items-center justify-center w-full h-full px-2 md:px-6 py-12 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Video — maximized */}
        <div
          className={`overflow-hidden rounded-lg bg-black flex-shrink-0 ${
            isPortrait
              ? 'h-[82vh] md:h-[88vh] w-auto'
              : 'w-full max-w-[95vw] md:max-w-[85vw] lg:max-w-[80vw]'
          }`}
          style={{ aspectRatio: isPortrait ? '9/16' : '16/9' }}
        >
          <video
            key={item.id}
            src={item.video}
            poster={item.poster}
            controls autoPlay loop playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info bar — compact, below video */}
        <div className="w-full max-w-[85vw] mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[#ef8200] text-[10px] font-bold uppercase tracking-[0.4em]">{item.tag}</span>
            <div className="w-px h-4 bg-white/20 hidden md:block" />
            <h2 className="text-lg md:text-xl font-light text-white leading-tight">{item.title}</h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest hidden md:block">{item.location}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/#contact"
              onClick={onClose}
              className="px-6 py-2.5 bg-white text-gray-900 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-gray-200 transition-colors"
            >
              Book Consultation
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-white/40 hover:text-white text-[10px] uppercase tracking-widest transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  footer: { copyright: string }
  videos?: ProjectVideo[]
}

export default function GalleryClient({ footer, videos: videosProp }: Props) {
  const VIDEOS = videosProp ?? DEFAULT_VIDEOS
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Split videos by orientation
  const landscapes = VIDEOS.filter(v => v.orientation === 'landscape')
  const portraits = VIDEOS.filter(v => v.orientation === 'portrait')

  // Build rows: landscape pairs, portrait groups of 4, and mixed
  type Row = { type: 'landscape-pair'; items: ProjectVideo[] }
    | { type: 'portrait-quad'; items: ProjectVideo[] }
    | { type: 'landscape-single'; items: ProjectVideo[] }

  const rows: Row[] = []
  let li = 0, pi = 0

  // Pattern: 2 landscape, 4 portrait, repeat, then leftover
  while (li < landscapes.length || pi < portraits.length) {
    // 2 landscapes
    if (li < landscapes.length) {
      const pair = landscapes.slice(li, li + 2)
      if (pair.length === 2) {
        rows.push({ type: 'landscape-pair', items: pair })
        li += 2
      } else {
        rows.push({ type: 'landscape-single', items: pair })
        li += pair.length
      }
    }
    // 4 portraits
    if (pi < portraits.length) {
      const quad = portraits.slice(pi, pi + 4)
      rows.push({ type: 'portrait-quad', items: quad })
      pi += quad.length
    }
  }

  const openVideo = (item: ProjectVideo) => {
    const idx = VIDEOS.findIndex(v => v.id === item.id)
    setActiveIndex(idx >= 0 ? idx : 0)
  }

  const [onlineStoreEnabled, setOnlineStoreEnabled] = useState(true)
  useEffect(() => {
    fetch('/api/site-settings').then(r => r.json()).then(d => {
      if (d.success && d.data?.online_store_enabled === false) setOnlineStoreEnabled(false)
    }).catch(() => {})
  }, [])

  const ALL_NAV = [
    { name: 'Home',         href: '/' },
    { name: 'About',        href: '/about' },
    { name: 'Our Projects', href: '/gallery' },
    { name: 'Products',     href: '/products' },
    { name: 'Online Store', href: '/store' },
    { name: 'Contact',      href: '/#contact' },
  ]
  const NAV_ITEMS = onlineStoreEnabled ? ALL_NAV : ALL_NAV.filter(i => i.name !== 'Online Store')

  return (
    <main className="min-h-screen bg-transparent selection:bg-[#3d3d3d] selection:text-white">

      {/* ── Nav ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-12 transition-all duration-500 ${
        isScrolled ? 'py-4 bg-white/95 backdrop-blur-md border-b border-gray-100' : 'py-7 bg-transparent'
      }`}>
        <Link href="/">
          <h1 className="text-xl md:text-2xl font-light tracking-[0.2em] text-[#3d3d3d] uppercase">
            ANGEL DRAPERY, INC
          </h1>
        </Link>
        <nav className="hidden md:block">
          <ul className="flex flex-wrap gap-3 justify-end">
            {NAV_ITEMS.map(item => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onMouseEnter={() => setHoveredNav(item.name)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`block px-5 py-1.5 rounded-full border transition-all duration-300 text-sm font-medium ${
                    item.name === 'Our Projects' || hoveredNav === item.name
                      ? 'bg-[#3d3d3d] text-white border-[#3d3d3d]'
                      : 'bg-transparent text-[#3d3d3d] border-[#3d3d3d]/30 hover:bg-[#3d3d3d] hover:text-white hover:border-[#3d3d3d]'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="pt-52 pb-16 px-8 lg:px-16 max-w-[1800px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <span className="text-[#ef8200] text-[10px] font-bold uppercase tracking-[0.4em] block mb-6">Since 1984</span>
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-light tracking-tighter text-[#3d3d3d] leading-none">
            Handcrafted <span className="font-serif italic text-gray-400">Stories.</span>
          </h2>
        </motion.div>
      </section>

      {/* ── Gallery Grid ── */}
      <section className="px-6 lg:px-12 pb-24 max-w-[1900px] mx-auto space-y-6">
        {rows.map((row, ri) => {
          if (row.type === 'landscape-pair') {
            return (
              <div key={`row-${ri}`} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {row.items.map(v => (
                  <VideoFrame key={v.id} item={v} onClick={() => openVideo(v)} />
                ))}
              </div>
            )
          }
          if (row.type === 'portrait-quad') {
            return (
              <div key={`row-${ri}`} className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {row.items.map(v => (
                  <VideoFrame key={v.id} item={v} onClick={() => openVideo(v)} />
                ))}
              </div>
            )
          }
          // landscape-single (last odd one — full width)
          return (
            <div key={`row-${ri}`} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {row.items.map(v => (
                <VideoFrame key={v.id} item={v} onClick={() => openVideo(v)} />
              ))}
            </div>
          )
        })}
      </section>

      {/* ── CTA ── */}
      <section className="bg-white py-32 text-center flex flex-col items-center justify-center">
        <h2 className="text-5xl md:text-7xl font-light mb-12 tracking-tighter text-[#3d3d3d]">
          Ready to <span className="font-serif italic text-gray-400">begin?</span>
        </h2>
        <Link
          href="/#contact"
          className="inline-block px-12 py-4 bg-[#3d3d3d] text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-[#2a2a2a] transition-all"
        >
          Request Consultation
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-12 bg-[#3d3d3d] text-center border-t border-white/10">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">{footer.copyright}</p>
      </footer>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {activeIndex !== null && (
          <Lightbox
            videos={VIDEOS}
            currentIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
            onNav={setActiveIndex}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
