'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export interface LightboxImage {
  src: string
  caption?: string
  chipSrc?: string
}

/**
 * Shared image lightbox with prev/next navigation, keyboard support, and swipe.
 *
 * Usage:
 *   const [lbImages, setLbImages] = useState<LightboxImage[]>([])
 *   const [lbIndex, setLbIndex]   = useState<number>(-1)
 *
 *   const openLightbox = (images: LightboxImage[], index: number) => {
 *     setLbImages(images); setLbIndex(index)
 *   }
 *
 *   <ImageLightbox images={lbImages} currentIndex={lbIndex}
 *     onNav={setLbIndex} onClose={() => setLbIndex(-1)} />
 */
export default function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNav,
}: {
  images: LightboxImage[]
  currentIndex: number
  onClose: () => void
  onNav: (idx: number) => void
}) {
  if (currentIndex < 0 || currentIndex >= images.length) return null

  const item = images[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-zoom-out"
      style={{ isolation: 'isolate', backgroundColor: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 text-white/50 text-xs font-mono tracking-widest">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Prev */}
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

      {/* Next */}
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

      {/* Image */}
      <motion.div
        key={item.src}
        initial={{ opacity: 0.6, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-[92vw] h-[88vh]"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={item.src}
          alt=""
          fill
          sizes="100vw"
          className="object-contain"
        />
        {/* Caption */}
        {(item.caption || item.chipSrc) && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded px-3 py-2 max-w-xs text-right flex items-center gap-2">
            {item.chipSrc && (
              <span className="relative w-8 h-8 flex-shrink-0">
                <Image src={item.chipSrc} alt="" fill sizes="32px" className="rounded-full object-cover" />
              </span>
            )}
            {item.caption && <p className="text-white/90 text-sm whitespace-pre-line leading-snug">{item.caption}</p>}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
