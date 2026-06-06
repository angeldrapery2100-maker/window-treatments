'use client'

import { useState } from 'react'
import Image from 'next/image'

export interface MainImage { id: string; url: string; name: string; sort_order: number }
export interface GalleryImage { id: string; url: string; title: string; description: string; sort_order: number }

interface Props {
  mainImages: MainImage[]
  galleryImages: GalleryImage[]
}

export default function ImageGallery({ mainImages, galleryImages }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const current = mainImages[selectedIdx]

  return (
    <div className="space-y-4">
      {/* 主图 */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {current ? (
          <Image
            src={current.url}
            alt={current.name || '产品图片'}
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

      {/* 缩略图条 */}
      {mainImages.length > 1 && (
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
        </div>
      )}

      {/* Gallery 图文收纳盒 — 左图(3) 右文(7) */}
      {galleryImages.length > 0 && (
        <div className="space-y-3 pt-2">
          {galleryImages.map(img => (
            <div key={img.id} className="flex gap-0 overflow-hidden border border-gray-100">
              {/* 左：图片 占 30% */}
              <div className="relative w-[30%] flex-shrink-0 aspect-square bg-gray-50">
                <Image src={img.url} alt={img.title} fill sizes="30vw" className="object-cover" />
              </div>
              {/* 右：文字 占 70% */}
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
