'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { m as motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT RULES:
//   orientation: 'landscape' → col-span-2 in 4-col grid, aspect-video (16:9)
//   orientation: 'portrait'  → col-span-1 in 4-col grid, aspect-[9/16]
//
//   Desktop (lg, 4 cols):
//     • 2 landscape per row  (each 50% width)
//     • 4 portrait  per row  (each 25% width)
//   Tablet (md, 2 cols):
//     • 1 landscape per row  (full width)
//     • 2 portrait  per row  (each 50% width)
//   Mobile (1 col): everything full width
//
// VIDEO FILES:   /public/videos/projects/
// POSTER IMAGES: /public/videos/projects/posters/
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectVideo {
  id: number
  title: string
  subtitle: string
  orientation: 'landscape' | 'portrait'
  video: string
  poster: string
}

export const PROJECT_VIDEOS: ProjectVideo[] = [
  // ── Row 1: 2 landscape ───────────────────────────────────────────────────
  { id: 1,  orientation: 'landscape', title: 'Custom Drapery',       subtitle: 'Living Room Installation',    video: '/videos/projects/landscape-01.mp4', poster: '/videos/projects/posters/landscape-01.jpg' },
  { id: 2,  orientation: 'landscape', title: 'Smart Roller Shades',   subtitle: 'HomeKit Motorized System',    video: '/videos/projects/landscape-02.mp4', poster: '/videos/projects/posters/landscape-02.jpg' },
  // ── Row 2: 4 portrait ────────────────────────────────────────────────────
  { id: 3,  orientation: 'portrait',  title: 'Roman Shades',          subtitle: 'Handcrafted · San Marino',    video: '/videos/projects/portrait-01.mp4',  poster: '/videos/projects/posters/portrait-01.jpg' },
  { id: 4,  orientation: 'portrait',  title: 'Sheer Panels',          subtitle: 'Floor to Ceiling',            video: '/videos/projects/portrait-02.mp4',  poster: '/videos/projects/posters/portrait-02.jpg' },
  { id: 5,  orientation: 'portrait',  title: 'Blackout Drapery',      subtitle: 'Master Suite',                video: '/videos/projects/portrait-03.mp4',  poster: '/videos/projects/posters/portrait-03.jpg' },
  { id: 6,  orientation: 'portrait',  title: 'Velvet Drapes',         subtitle: 'Formal Dining Room',          video: '/videos/projects/portrait-04.mp4',  poster: '/videos/projects/posters/portrait-04.jpg' },
  // ── Row 3: 2 landscape ───────────────────────────────────────────────────
  { id: 7,  orientation: 'landscape', title: 'Layered Window Treatments', subtitle: 'Arcadia Residence',       video: '/videos/projects/landscape-03.mp4', poster: '/videos/projects/posters/landscape-03.jpg' },
  { id: 8,  orientation: 'landscape', title: '4K Showcase',           subtitle: 'Premium Installation',        video: '/videos/projects/landscape-04.mp4', poster: '/videos/projects/posters/landscape-04.jpg' },
  // ── Row 4: 4 portrait ────────────────────────────────────────────────────
  { id: 9,  orientation: 'portrait',  title: 'Linen Curtains',        subtitle: 'Temple City Home',            video: '/videos/projects/portrait-05.mp4',  poster: '/videos/projects/posters/portrait-05.jpg' },
  { id: 10, orientation: 'portrait',  title: 'Motorized Blinds',      subtitle: 'Smart Home Integration',      video: '/videos/projects/portrait-06.mp4',  poster: '/videos/projects/posters/portrait-06.jpg' },
  { id: 11, orientation: 'portrait',  title: 'Pinch Pleat Drapery',   subtitle: 'Classic Style · Monrovia',    video: '/videos/projects/portrait-07.mp4',  poster: '/videos/projects/posters/portrait-07.jpg' },
  { id: 12, orientation: 'portrait',  title: 'Sheer Overlay',         subtitle: 'Dining Area · Alhambra',      video: '/videos/projects/portrait-08.mp4',  poster: '/videos/projects/posters/portrait-08.jpg' },
  // ── Row 5: 2 landscape + 1 portrait ─────────────────────────────────────
  { id: 13, orientation: 'landscape', title: 'Living Room Reveal',    subtitle: 'Full Installation · Pasadena', video: '/videos/projects/landscape-05.mp4', poster: '/videos/projects/posters/landscape-05.jpg' },
  { id: 14, orientation: 'landscape', title: 'Workshop Process',      subtitle: 'Behind the Craft',             video: '/videos/projects/landscape-06.mp4', poster: '/videos/projects/posters/landscape-06.jpg' },
  // ── Row 6: remaining ─────────────────────────────────────────────────────
  { id: 15, orientation: 'portrait',  title: 'Eyelet Curtains',       subtitle: 'Modern Style',                 video: '/videos/projects/portrait-09.mp4',  poster: '/videos/projects/posters/portrait-09.jpg' },
  { id: 16, orientation: 'landscape', title: 'Before & After',        subtitle: 'Full Room Transformation',     video: '/videos/projects/landscape-07.mp4', poster: '/videos/projects/posters/landscape-07.jpg' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Video Card
// ─────────────────────────────────────────────────────────────────────────────
function VideoCard({
  item,
  index,
  onOpen,
}: {
  item: ProjectVideo
  index: number
  onOpen: (item: ProjectVideo) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [])

  // Grid column span + aspect ratio by orientation
  const colSpan    = item.orientation === 'landscape' ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1 lg:col-span-1'
  const aspectClass = item.orientation === 'landscape' ? 'aspect-video' : 'aspect-[9/16]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.08 }}
      className={`group relative cursor-pointer ${colSpan}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpen(item)}
    >
      {/* Card shell */}
      <div className={`relative ${aspectClass} overflow-hidden rounded-sm shadow-md group-hover:shadow-2xl transition-all duration-500`}>

        {/* Poster */}
        <Image
          src={item.poster}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-cover transition-opacity duration-500 ${
            isHovered && isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Video — muted hover preview */}
        <video
          ref={videoRef}
          src={item.video}
          poster={item.poster}
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Overlay gradient */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isHovered
              ? 'bg-gradient-to-t from-black/40 via-transparent to-transparent'
              : 'bg-gradient-to-t from-black/50 via-black/10 to-transparent'
          }`}
        />

        {/* Orientation badge */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-black/40 backdrop-blur-sm text-white text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-1 rounded-sm">
            {item.orientation === 'landscape' ? '▬ Landscape' : '▮ Portrait'}
          </span>
        </div>

        {/* Click-to-expand badge */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/40 backdrop-blur-sm text-white text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm">
            Expand ⤢
          </div>
        </div>

        {/* Center play ring */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'
        }`}>
          <motion.div
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        </div>

        {/* Bottom title bar — on hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-400 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}>
          <p className="text-white text-xs font-bold uppercase tracking-wider leading-snug drop-shadow">{item.title}</p>
          <p className="text-white/70 text-[10px] mt-0.5 drop-shadow">{item.subtitle}</p>
        </div>

        {/* Orange accent border on hover */}
        <div className={`absolute inset-0 pointer-events-none rounded-sm border-2 transition-all duration-300 ${
          isHovered ? 'border-[#ef8200]/70' : 'border-transparent'
        }`} />
      </div>

      {/* Caption below card */}
      <div className="mt-3 flex items-start justify-between px-0.5">
        <div>
          <h3 className={`text-[#12141C] font-bold leading-snug group-hover:text-[#ef8200] transition-colors duration-300 ${
            item.orientation === 'landscape' ? 'text-sm' : 'text-[13px]'
          }`}>
            {item.title}
          </h3>
          <p className="text-gray-400 text-[11px] mt-0.5 tracking-wide">{item.subtitle}</p>
        </div>
        <span className="text-[10px] font-bold text-gray-300 mt-0.5 shrink-0 ml-2">
          {String(item.id).padStart(2, '0')}
        </span>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox Modal
// ─────────────────────────────────────────────────────────────────────────────
function VideoLightbox({ item, onClose }: { item: ProjectVideo; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (v) { v.currentTime = 0; v.play().catch(() => {}) }
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const isPortrait = item.orientation === 'portrait'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`relative ${isPortrait ? 'max-h-[90vh] w-auto' : 'w-full max-w-5xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video container respects aspect ratio */}
        <div className={`relative overflow-hidden rounded-sm shadow-2xl ${
          isPortrait ? 'aspect-[9/16] h-[85vh] w-auto' : 'aspect-video w-full'
        }`}>
          <video
            ref={videoRef}
            src={item.video}
            poster={item.poster}
            controls
            loop
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        </div>

        {/* Caption */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div>
            <h3 className="text-white font-bold text-base">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${
              isPortrait ? 'bg-[#ef8200]/20 text-[#ef8200]' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isPortrait ? '▮ Portrait' : '▬ Landscape'}
            </span>
            <span className="text-gray-500 text-xs">Esc to close</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────────────────
export function ProjectsSection({ videos = PROJECT_VIDEOS }: { videos?: ProjectVideo[] }) {
  const [activeVideo, setActiveVideo] = useState<ProjectVideo | null>(null)

  const landscapeCount = videos.filter(v => v.orientation === 'landscape').length
  const portraitCount  = videos.filter(v => v.orientation === 'portrait').length

  return (
    <section className="w-full bg-[#FAFAF8] py-28 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 space-y-4"
        >
          <span className="text-[#ef8200] text-[11px] font-bold tracking-[0.45em] uppercase">
            40 Years · 500+ Installations
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-4xl md:text-5xl font-light tracking-wide text-[#12141C]">
              OUR PROJECTS
            </h2>
            {/* Legend */}
            <div className="flex items-center gap-5 text-xs text-gray-400 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 h-3.5 bg-gray-200 rounded-sm" />
                Landscape <span className="font-bold text-gray-500">×{landscapeCount}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-5 bg-gray-200 rounded-sm" />
                Portrait <span className="font-bold text-gray-500">×{portraitCount}</span>
              </span>
              <span className="text-gray-300">Hover to preview · Click to expand</span>
            </div>
          </div>
          <div className="h-px w-full bg-gray-200" />
        </motion.div>

        {/* ── Smart grid ──────────────────────────────────────────────── */}
        {/*
          4-column grid on desktop:
            Landscape (col-span-2) → 2 per row at 16:9
            Portrait  (col-span-1) → 4 per row at 9:16
          2-column grid on tablet:
            Landscape (col-span-2) → full-width 16:9
            Portrait  (col-span-1) → 2 per row at 9:16
        */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {videos.map((item, index) => (
            <VideoCard
              key={item.id}
              item={item}
              index={index}
              onOpen={setActiveVideo}
            />
          ))}
        </div>

      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeVideo && (
          <VideoLightbox item={activeVideo} onClose={() => setActiveVideo(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}

export default ProjectsSection
