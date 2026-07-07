'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { m as motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { type ProjectVideo, DEFAULT_VIDEOS } from '@/lib/gallery-videos-data'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import ImageLightbox, { type LightboxImage } from '@/components/ImageLightbox'

// Re-export for backward-compat with gallery/page.tsx
export type { ProjectVideo }
export { DEFAULT_VIDEOS }

/** One photo tile on the photo wall (installation_images + home gallery merged server-side). */
export interface GalleryPhoto {
  id: string
  src: string
  caption: string
  category: string
  width?: number
  height?: number
}

// Page background tones (opener near-black → footer's #3d3d3d)
const BG = '#101216'
const BG_DEEP = '#0d0f17'

// ─────────────────────────────────────────────────────────────────────────────
// Central video controller — only ONE video plays at a time, page-wide.
// Module-level singleton: hero, featured rows and reel cards all route
// through here so a newly playing video silences the previous one.
// ─────────────────────────────────────────────────────────────────────────────
let _currentPlaying: HTMLVideoElement | null = null

function playExclusive(v: HTMLVideoElement) {
  if (_currentPlaying && _currentPlaying !== v) _currentPlaying.pause()
  _currentPlaying = v
  v.play().catch(() => {})
}

function pauseManaged(v: HTMLVideoElement) {
  v.pause()
  if (_currentPlaying === v) _currentPlaying = null
}

// ─────────────────────────────────────────────────────────────────────────────
// AutoVideo — poster-first, autoplays muted when scrolled into view, pauses
// when offscreen or the tab is hidden. Respects prefers-reduced-motion
// (stays on the poster; tap still opens the lightbox with controls).
// ─────────────────────────────────────────────────────────────────────────────
function AutoVideo({
  item,
  className = '',
  sizes,
  priorityPoster = false,
}: {
  item: ProjectVideo
  className?: string
  sizes: string
  priorityPoster?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const el = wrapRef.current
    const vid = videoRef.current
    if (!el || !vid) return

    const io = new IntersectionObserver(
      entries => {
        const e = entries[0]
        if (e.isIntersecting && e.intersectionRatio >= 0.35) {
          playExclusive(vid)
          setStarted(true)
        } else {
          vid.pause()
        }
      },
      { threshold: [0, 0.35] },
    )
    io.observe(el)

    const onVisibility = () => {
      if (document.hidden) vid.pause()
      else if (_currentPlaying === vid) vid.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      pauseManaged(vid)
    }
  }, [reduced])

  return (
    // NOTE: no `relative` in the base classes — every call site passes its own
    // positioning (`absolute inset-0`). Merging both position utilities let
    // `relative` win in the compiled CSS order, and a relative box with only
    // inset has no height source → the video collapsed to 0px and the
    // IntersectionObserver never fired (videos appeared black / never played).
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      <Image
        src={item.poster}
        alt={item.title}
        fill
        sizes={sizes}
        priority={priorityPoster}
        className={`object-cover transition-opacity duration-700 ${started ? 'opacity-0' : 'opacity-100'}`}
      />
      <video
        ref={videoRef}
        src={item.video}
        poster={item.poster}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${started ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Lightbox — full-screen player with controls + sound, prev/next, swipe
// (adapted from the previous gallery lightbox)
// ─────────────────────────────────────────────────────────────────────────────
function VideoLightbox({
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

  const touchStartX = useRef(0)

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
    const diff = touchStartX.current - e.changedTouches[0].clientX
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
      {/* Close button — 44px touch target */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all hover:bg-white/30"
      >
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 z-50 -translate-x-1/2 font-mono text-xs tracking-widest text-white/40">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* Prev arrow */}
      {hasPrev && (
        <button
          onClick={e => { e.stopPropagation(); goPrev() }}
          aria-label="Previous video"
          className="absolute left-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-white/25 md:left-6"
        >
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          onClick={e => { e.stopPropagation(); goNext() }}
          aria-label="Next video"
          className="absolute right-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-white/25 md:right-6"
        >
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Content — video on top, info below */}
      <div
        className="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto px-2 py-12 md:px-6"
        onClick={e => e.stopPropagation()}
      >
        <div
          className={`flex-shrink-0 overflow-hidden rounded-lg bg-black ${
            isPortrait
              ? 'h-[82vh] w-auto md:h-[88vh]'
              : 'w-full max-w-[95vw] md:max-w-[85vw] lg:max-w-[80vw]'
          }`}
          style={{ aspectRatio: isPortrait ? '9/16' : '16/9' }}
        >
          <video
            key={item.id}
            src={item.video}
            poster={item.poster}
            controls autoPlay loop playsInline
            className="h-full w-full object-cover"
          />
        </div>

        {/* Info bar */}
        <div className="mt-4 flex w-full max-w-[85vw] flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ef8200]">
              {item.tag.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2).join(' · ')}
            </span>
            <div className="hidden h-4 w-px bg-white/20 md:block" />
            <h2 className="text-lg font-light leading-tight text-white md:text-xl">{item.title}</h2>
            <p className="hidden text-[10px] uppercase tracking-widest text-gray-500 md:block">{item.location}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              onClick={onClose}
              className="rounded-full bg-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 transition-colors hover:bg-gray-200"
            >
              Book Consultation
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-white"
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
// Section header — shared eyebrow + heading treatment
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, accent }: { eyebrow: string; title: string; accent?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12 md:mb-16"
    >
      <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.4em] text-[#ef8200]">{eyebrow}</span>
      <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl">
        {title}{accent ? <> <span className="font-serif italic text-white/40">{accent}</span></> : null}
      </h2>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Featured project row — video 60% / copy 40%, alternating
// ─────────────────────────────────────────────────────────────────────────────
function FeaturedRow({
  item,
  index,
  flip,
  onOpen,
}: {
  item: ProjectVideo
  index: number
  flip: boolean
  onOpen: () => void
}) {
  const reduced = useReducedMotion()

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  }
  const child = {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
  }

  const tags = item.tag.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className="grid items-center gap-6 md:grid-cols-5 md:gap-12 lg:gap-16"
    >
      {/* Video — 60% */}
      <motion.div variants={child} className={`md:col-span-3 ${flip ? 'md:order-2' : ''}`}>
        <button
          onClick={onOpen}
          aria-label={`Watch: ${item.title}`}
          className="group relative block w-full cursor-pointer overflow-hidden rounded-xl text-left"
          style={{ aspectRatio: '16/9' }}
        >
          <AutoVideo item={item} className="absolute inset-0" sizes="(max-width: 768px) 100vw, 60vw" />
          {/* Hover affordance */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
            <div className="flex h-12 w-12 scale-75 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Copy — 40% */}
      <div className={`md:col-span-2 ${flip ? 'md:order-1' : ''}`}>
        <motion.p variants={child} className="mb-4 font-mono text-xs tracking-widest text-white/25">
          {String(index + 1).padStart(2, '0')}
        </motion.p>
        <motion.h3 variants={child} className="text-2xl font-light tracking-tight text-white md:text-3xl">
          {item.title}
        </motion.h3>
        <motion.p variants={child} className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/40">
          {item.location}
        </motion.p>
        {tags.length > 0 && (
          <motion.div variants={child} className="mt-4 flex flex-wrap gap-2">
            {tags.map(t => (
              <span key={t} className="rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-white/60">
                {t}
              </span>
            ))}
          </motion.div>
        )}
        {item.description && (
          // Admin project stories can be very long — clamp so the copy column
          // stays balanced with the video; full text is available in the lightbox.
          <motion.p variants={child} className="mt-5 max-w-md text-sm leading-relaxed text-white/60 line-clamp-6">
            {item.description}
          </motion.p>
        )}
        <motion.div variants={child} className="mt-6 h-px w-12 bg-white/15" />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Portrait reel card — poster with hover-play (desktop); tap opens lightbox
// ─────────────────────────────────────────────────────────────────────────────
function PortraitCard({ item, onOpen }: { item: ProjectVideo; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hovered, setHovered] = useState(false)
  const reduced = useReducedMotion()

  const handleEnter = useCallback(() => {
    if (reduced) return
    setHovered(true)
    const v = videoRef.current
    if (v) playExclusive(v)
  }, [reduced])

  const handleLeave = useCallback(() => {
    setHovered(false)
    const v = videoRef.current
    if (v) {
      pauseManaged(v)
      v.currentTime = 0
    }
  }, [])

  return (
    <button
      onClick={onOpen}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      aria-label={`Watch: ${item.title}`}
      className="group relative w-[220px] flex-shrink-0 cursor-pointer snap-start overflow-hidden rounded-xl text-left sm:w-[250px] md:w-[280px]"
      style={{ aspectRatio: '9/16' }}
    >
      <Image
        src={item.poster}
        alt={item.title}
        fill
        sizes="280px"
        className={`object-cover transition-opacity duration-500 ${hovered ? 'opacity-0' : 'opacity-100'}`}
      />
      <video
        ref={videoRef}
        src={item.video}
        muted loop playsInline preload="none"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Bottom gradient + label */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
        <p className="text-sm font-medium leading-tight text-white">{item.title}</p>
        <p className="mt-0.5 text-[9px] uppercase tracking-[0.25em] text-white/50">{item.location}</p>
      </div>
      {/* Play badge */}
      <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M8 5v14l11-7z" /></svg>
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Photo wall — masonry (CSS columns) + filter chips + image lightbox
// ─────────────────────────────────────────────────────────────────────────────
const TILE_RATIOS = ['4 / 5', '3 / 4', '1 / 1', '4 / 5', '2 / 3', '3 / 4']

function tileAspect(photo: GalleryPhoto, index: number): string {
  if (photo.width && photo.height && photo.width > 0 && photo.height > 0) {
    // Clamp extreme ratios so the wall stays even
    const r = Math.min(Math.max(photo.width / photo.height, 0.6), 1.5)
    return `${Math.round(r * 100)} / 100`
  }
  return TILE_RATIOS[index % TILE_RATIOS.length]
}

function PhotoWall({ photos }: { photos: GalleryPhoto[] }) {
  const reduced = useReducedMotion()
  const [filter, setFilter] = useState('All')
  const [lbIndex, setLbIndex] = useState(-1)

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(photos.map(p => p.category)))],
    [photos],
  )
  const filtered = useMemo(
    () => (filter === 'All' ? photos : photos.filter(p => p.category === filter)),
    [photos, filter],
  )
  const lightboxImages: LightboxImage[] = useMemo(
    () => filtered.map(p => ({ src: p.src, caption: p.caption || undefined })),
    [filtered],
  )

  return (
    <div>
      {/* Filter chips */}
      {categories.length > 2 && (
        <div className="scrollbar-hide -mx-6 mb-8 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                filter === c
                  ? 'border-white bg-white text-[#101216]'
                  : 'border-white/20 bg-transparent text-white/60 hover:border-white/50 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Masonry — whole wall crossfades on filter change (no layout jank) */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter}
          initial={{ opacity: 0, scale: reduced ? 1 : 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="columns-2 gap-3 md:gap-4 lg:columns-3"
        >
          {filtered.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setLbIndex(i)}
              aria-label={photo.caption || `View project photo ${i + 1}`}
              className="group relative mb-3 block w-full cursor-zoom-in overflow-hidden rounded-lg text-left break-inside-avoid md:mb-4"
              style={{ aspectRatio: tileAspect(photo, i) }}
            >
              <Image
                src={photo.src}
                alt={photo.caption || `${photo.category} installation`}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
              {/* Caption — gradient reveal on hover (always visible on mobile) */}
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                  <p className="text-xs leading-snug text-white/90">{photo.caption}</p>
                </div>
              )}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Image lightbox — navigates across the filtered set */}
      <AnimatePresence>
        {lbIndex >= 0 && (
          <ImageLightbox
            images={lightboxImages}
            currentIndex={lbIndex}
            onNav={setLbIndex}
            onClose={() => setLbIndex(-1)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  footer: { copyright: string; youtube?: string; etsy?: string; tiktok?: string; instagram?: string }
  videos?: ProjectVideo[]
  photos?: GalleryPhoto[]
}

const TRUST_FACTS = [
  'Since 1984 · Family-owned',
  'Our own LA workroom',
  'Design → sew → install, one team',
  'Serving the San Gabriel Valley & greater LA',
]

export default function GalleryClient({ footer, videos: videosProp, photos = [] }: Props) {
  const VIDEOS = videosProp ?? DEFAULT_VIDEOS
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const reduced = useReducedMotion()

  const landscapes = VIDEOS.filter(v => v.orientation === 'landscape')
  const portraits = VIDEOS.filter(v => v.orientation === 'portrait')

  // Hero pick: Eddie's chosen showcase clip — "Linen drapery with roller shade"
  // (San Gabriel, landscape-07, DEFAULT_VIDEOS id 16). Falls back to the first
  // landscape if that clip is ever unpublished in the admin.
  const HERO_VIDEO_ID = 16
  const heroVideo = landscapes.find(v => v.id === HERO_VIDEO_ID) ?? landscapes[0] ?? null
  const featured = landscapes.filter(v => v !== heroVideo)

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

  return (
    <main
      className="min-h-screen overflow-x-hidden text-white selection:bg-white selection:text-[#101216]"
      style={{ backgroundColor: BG }}
    >
      {/* CSS-first entrance animations — paint before JS hydrates */}
      <style>{`
        @keyframes gal-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gal-track-in {
          from { opacity: 0; letter-spacing: 0.7em; }
          to   { opacity: 1; letter-spacing: 0.42em; }
        }
        @keyframes gal-scroll-pulse {
          0%, 100% { transform: translateY(0);   opacity: 0.4; }
          50%      { transform: translateY(8px); opacity: 1; }
        }
        .gal-eyebrow  { animation: gal-track-in 1.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .gal-headline { animation: gal-fade-up 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
        .gal-subline  { animation: gal-fade-up 1s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both; }
        .gal-watch    { animation: gal-fade-up 1s cubic-bezier(0.22, 1, 0.36, 1) 0.65s both; }
        .gal-scroll-dot { animation: gal-scroll-pulse 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .gal-eyebrow, .gal-headline, .gal-subline, .gal-watch { animation: none; }
          .gal-scroll-dot { animation: none; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ═══ 1 · Cinematic opener ═══ */}
      <section className="relative flex h-[100svh] min-h-[560px] w-full items-center justify-center overflow-hidden">
        {/* Background video (poster-first, autoplay muted in view) */}
        {heroVideo && (
          <AutoVideo item={heroVideo} className="absolute inset-0" sizes="100vw" priorityPoster />
        )}
        {/* Tonal overlay — deep near-black fading into page bg */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${BG_DEEP}b3 0%, ${BG_DEEP}59 40%, ${BG_DEEP}40 65%, ${BG} 100%)`,
          }}
        />

        <SiteNav activePage="Our Projects" />

        {/* Overlay copy */}
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <span className="gal-eyebrow mb-6 block text-[10px] font-bold uppercase tracking-[0.42em] text-[#ef8200] md:text-xs">
            Our Work
          </span>
          <h1 className="gal-headline max-w-4xl text-4xl font-light leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
            Four Decades of <span className="font-serif italic">Handcrafted</span> Windows
          </h1>
          <p className="gal-subline mt-6 max-w-xl text-sm font-light leading-relaxed text-white/70 md:text-base">
            Designed, sewn &amp; installed by our own team across Los Angeles — since 1984.
          </p>
          {heroVideo && (
            <button
              onClick={() => openVideo(heroVideo)}
              className="gal-watch mt-10 rounded-full border border-white/30 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm transition-all hover:border-white hover:bg-white hover:text-[#101216]"
            >
              Watch the Film
            </button>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="text-[9px] uppercase tracking-[0.35em] text-white/40">Scroll</span>
          <div className="h-10 w-px bg-white/15">
            <div className="gal-scroll-dot h-3 w-px bg-white/70" />
          </div>
        </div>
      </section>

      {/* ═══ 2 · Featured Projects ═══ */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-28">
          <SectionHeader eyebrow="Featured Projects" title="Selected" accent="installations." />
          <div className="space-y-20 md:space-y-32">
            {featured.map((item, i) => (
              <FeaturedRow key={item.id} item={item} index={i} flip={i % 2 === 1} onOpen={() => openVideo(item)} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ 3 · Portrait reel ═══ */}
      {portraits.length > 0 && (
        <section className="py-20 md:py-28" style={{ backgroundColor: BG_DEEP }}>
          <div className="mx-auto max-w-[1400px] px-6 md:px-12">
            <SectionHeader eyebrow="On Site" title="Up close, in the" accent="home." />
          </div>
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2 md:px-12"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
              }}
            >
              {portraits.map(item => (
                <PortraitCard key={item.id} item={item} onOpen={() => openVideo(item)} />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══ 4 · Photo wall ═══ */}
      {photos.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-28">
          <SectionHeader eyebrow="Installation Gallery" title="From our" accent="portfolio." />
          <PhotoWall photos={photos} />
        </section>
      )}

      {/* ═══ 5 · Trust strip ═══ */}
      <section className="border-y border-white/10" style={{ backgroundColor: BG_DEEP }}>
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-8 px-6 py-12 md:grid-cols-4 md:px-12 md:py-14">
          {TRUST_FACTS.map(fact => (
            <p key={fact} className="text-center text-[10px] uppercase leading-relaxed tracking-[0.25em] text-white/50 md:text-[11px]">
              {fact}
            </p>
          ))}
        </div>
      </section>

      {/* ═══ 6 · Referral CTA ═══ */}
      <section className="px-6 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-2xl flex-col items-center"
        >
          <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl">
            Sent here by your designer <span className="font-serif italic text-white/40">or a friend?</span>
          </h2>
          <p className="mt-5 text-sm font-light leading-relaxed text-white/60 md:text-base">
            You&apos;re in the right place.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#101216] transition-colors hover:bg-gray-200"
            >
              Book a Free In-Home Consultation
            </Link>
            {onlineStoreEnabled && (
              <Link
                href="/store"
                className="rounded-full border border-white/30 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/90 transition-all hover:border-white hover:bg-white hover:text-[#101216]"
              >
                Browse the Online Store
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* ═══ Footer ═══ */}
      <SiteFooter
        dark
        copyright={footer.copyright}
        youtube={footer.youtube}
        etsy={footer.etsy}
        tiktok={footer.tiktok}
        instagram={footer.instagram}
      />

      {/* ═══ Video lightbox ═══ */}
      <AnimatePresence>
        {activeIndex !== null && (
          <VideoLightbox
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
