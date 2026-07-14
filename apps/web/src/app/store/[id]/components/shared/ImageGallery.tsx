'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export interface MainImage { id: string; url: string; name: string; sort_order: number }
export interface GalleryImage { id: string; url: string; title: string; description: string; sort_order: number }

interface Props {
  mainImages: MainImage[]
  galleryImages: GalleryImage[]
  /** Selected variant's showcase image (v4 redesign, 2026-07-13): when set,
   *  it appears as an extra thumbnail slot and the stage auto-switches to it
   *  whenever the URL changes (e.g. the customer picks a pleat style). The
   *  customer can always tab back to the lifestyle photos. */
  styleImage?: { url: string; label?: string } | null
}

export default function ImageGallery({ mainImages, galleryImages, styleImage }: Props) {
  // selectedIdx: 0..n-1 = main images; -1 = the style slot.
  const [selectedIdx, setSelectedIdx] = useState(0)

  // Auto-switch the stage to the style image whenever it CHANGES — but not on
  // first render, so the page always opens on the hero lifestyle photo.
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return }
    if (styleImage?.url) setSelectedIdx(-1)
  }, [styleImage?.url])

  // Style slot removed (e.g. switched to a style without an image) → back to hero.
  useEffect(() => {
    if (!styleImage?.url && selectedIdx === -1) setSelectedIdx(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleImage?.url])

  const current = selectedIdx === -1 && styleImage?.url
    ? { url: styleImage.url, name: styleImage.label || 'Selected style' }
    : mainImages[Math.max(0, selectedIdx)]

  const showThumbs = mainImages.length > 1 || !!styleImage?.url

  return (
    <div className="space-y-4">
      {/* 主图 stage */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {current ? (
          <Image
            src={current.url}
            alt={current.name || 'Product image'}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
            <div className="text-6xl mb-2">□</div>
            <p className="text-xs tracking-widest uppercase text-gray-300">No Image</p>
          </div>
        )}
      </div>

      {/* 缩略图条（末位 = 当前款式图） */}
      {showThumbs && (
        <div className="flex gap-2 flex-wrap">
          {mainImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-14 h-14 flex-shrink-0 overflow-hidden transition-all duration-200 ${
                selectedIdx === idx
                  ? 'ring-2 ring-gray-900 ring-offset-1'
                  : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt={img.name} fill sizes="56px" className="object-cover" />
            </button>
          ))}
          {styleImage?.url && (
            <button
              onClick={() => setSelectedIdx(-1)}
              title={styleImage.label || 'Selected style'}
              className={`relative w-14 h-14 flex-shrink-0 overflow-hidden transition-all duration-200 ${
                selectedIdx === -1
                  ? 'ring-2 ring-gray-900 ring-offset-1'
                  : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={styleImage.url} alt={styleImage.label || 'Selected style'} fill sizes="56px" className="object-cover" />
            </button>
          )}
        </div>
      )}

      {/* Gallery 图文收纳盒 — 左图(3) 右文(7) */}
      {galleryImages.length > 0 && (
        <div className="space-y-3 pt-2">
          {galleryImages.map(img => (
            <div key={img.id} className="flex gap-0 overflow-hidden border border-gray-100">
              <div className="relative w-[30%] flex-shrink-0 aspect-square bg-gray-50">
                <Image src={img.url} alt={img.title} fill sizes="30vw" className="object-cover" />
              </div>
              <div className="flex-1 px-4 py-3 flex flex-col justify-center bg-gray-50">
                {img.title && (
                  <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">{img.title}</p>
                )}
                {img.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{img.description}</p>
                )}
                {!img.title && !img.description && (
                  <p className="text-xs text-gray-300 italic">No description</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
