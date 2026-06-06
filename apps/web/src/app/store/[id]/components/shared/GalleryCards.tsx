'use client'

import Image from 'next/image'
import { GalleryImage } from './useProductData'

export default function GalleryCards({ galleryImages }: { galleryImages: GalleryImage[] }) {
  if (galleryImages.length === 0) return null

  return (
    <div className="space-y-4 mt-4 border-t-2 border-black pt-4">
      {galleryImages.map(img => (
        <div key={img.id} className="flex overflow-hidden">
          {/* 左：16:9 图片 */}
          <div className="w-1/2 flex-shrink-0">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <Image
                src={img.url}
                alt={img.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
          {/* 右：文字 */}
          <div className="w-1/2 px-6 flex flex-col justify-center bg-white">
            {img.title && (
              <h4 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">{img.title}</h4>
            )}
            {img.description && (
              <p className="text-sm text-gray-500 leading-relaxed">{img.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
