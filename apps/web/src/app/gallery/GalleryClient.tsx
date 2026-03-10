'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { type ProjectVideo, DEFAULT_VIDEOS } from '@/lib/gallery-videos-data'

// Re-export for backward-compat with gallery/page.tsx
export type { ProjectVideo }
export { DEFAULT_VIDEOS }

// ─────────────────────────────────────────────────────────────────────────────
// Video Card — always colour, plays on hover
// ─────────────────────────────────────────────────────────────────────────────
function VideoFrame({
  item,
  onClick,
}: {
  item: ProjectVideo
  onClick: () => void
}) {
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
      {/* Thumbnail */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ aspectRatio: item.orientation === 'landscape' ? '16/9' : '3/4' }}
      >
        {/* Always-colour poster */}
        <img
          src={item.poster}
          alt={item.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Video on hover */}
        <video
          ref={videoRef}
          src={item.video}
          muted
          loop
          playsInline
          preload="none"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Subtle overlay */}
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-400 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Play button */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        >
          <div className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 border border-white/40 flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Tag pill */}
        <span className="absolute top-3 left-3 text-[9px] font-mono bg-black/40 text-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {item.tag}
        </span>
      </div>

      {/* Caption */}
      <div>
        <h3 className="text-sm font-medium text-[#3d3d3d] leading-tight">{item.title}</h3>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
          {item.location}
        </p>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────────────────────────────────────
function Lightbox({ item, onClose }: { item: ProjectVideo; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const isPortrait = item.orientation === 'portrait'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-6 lg:p-12"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`relative flex flex-col md:flex-row gap-10 items-start ${
          isPortrait ? 'h-[85vh] w-auto' : 'w-full max-w-6xl'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div
          className={`overflow-hidden rounded-xl bg-black ${
            isPortrait ? 'aspect-[3/4] h-full' : 'aspect-video w-full md:w-2/3'
          }`}
        >
          <video
            src={item.video}
            poster={item.poster}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        <div className={`flex flex-col justify-between py-2 ${isPortrait ? 'w-64 h-full' : 'md:w-1/3'}`}>
          <div className="space-y-6">
            <span className="text-[#ef8200] text-[10px] font-bold uppercase tracking-[0.4em]">{item.tag}</span>
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-2">{item.title}</h2>
              <p className="text-gray-400 text-xs uppercase tracking-widest">{item.location}</p>
            </div>
            <div className="w-12 h-px bg-white/20" />
            <p className="text-gray-300 text-sm leading-relaxed font-light">{item.description}</p>
          </div>
          <div className="space-y-4 pt-10">
            <Link
              href="/#contact"
              onClick={onClose}
              className="block w-full text-center py-4 bg-white text-gray-900 text-xs font-bold uppercase tracking-[0.3em] rounded-lg hover:bg-gray-200 transition-colors"
            >
              Book Consultation
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center py-4 text-white/50 hover:text-white text-[10px] uppercase tracking-widest transition-colors"
            >
              Return to Gallery
            </button>
          </div>
        </div>
      </motion.div>
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
  const v = (id: number) => VIDEOS.find(x => x.id === id)!

  const [activeVideo, setActiveVideo] = useState<ProjectVideo | null>(null)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const NAV_ITEMS = [
    { name: 'Home',         href: '/' },
    { name: 'About',        href: '/about' },
    { name: 'Our Projects', href: '/gallery' },
    { name: 'Products',     href: '/products' },
    { name: 'Online Store', href: '/store' },
    { name: 'Contact',      href: '/#contact' },
  ]

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

        {/* Row 1: Full-width feature landscape */}
        <div>
          <VideoFrame item={v(1)} onClick={() => setActiveVideo(v(1))} />
        </div>

        {/* Row 2: 3 portraits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[3, 4, 5].map(id => (
            <VideoFrame key={id} item={v(id)} onClick={() => setActiveVideo(v(id))} />
          ))}
        </div>

        {/* Row 3: wide landscape + portrait (asymmetric 2/3 + 1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <VideoFrame item={v(7)} onClick={() => setActiveVideo(v(7))} />
          </div>
          <div>
            <VideoFrame item={v(9)} onClick={() => setActiveVideo(v(9))} />
          </div>
        </div>

        {/* Row 4: 3 landscapes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[2, 8, 13].map(id => (
            <VideoFrame key={id} item={v(id)} onClick={() => setActiveVideo(v(id))} />
          ))}
        </div>

        {/* Row 5: 4 portraits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[10, 11, 12, 15].map(id => (
            <VideoFrame key={id} item={v(id)} onClick={() => setActiveVideo(v(id))} />
          ))}
        </div>

        {/* Row 6: portrait + wide landscape (1/3 + 2/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <VideoFrame item={v(16)} onClick={() => setActiveVideo(v(16))} />
          </div>
          <div className="md:col-span-2">
            <VideoFrame item={v(14)} onClick={() => setActiveVideo(v(14))} />
          </div>
        </div>

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
        {activeVideo && <Lightbox item={activeVideo} onClose={() => setActiveVideo(null)} />}
      </AnimatePresence>
    </main>
  )
}