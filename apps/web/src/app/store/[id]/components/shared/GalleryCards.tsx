'use client'

import Image from 'next/image'
import { GalleryImage } from './useProductData'

// ─────────────────────────────────────────────────────────────────────────────
// Editorial detail layout (2026-07-13, redesigned to Eddie's reference):
// one unified warm-white canvas, generous whitespace, serif display headings,
// image/text compositions alternating left–right, and full-bleed statement
// images for blocks without text. Shared by ALL product templates, so the
// detail section reads consistently across the store.
//
// Data model is unchanged (gallery image: url + title + description).
// Title convention: "SOFT TEXTURE | 高温记忆定型 持久垂顺" — the part before
// "|" renders as a small-caps English kicker, the part after as the large
// serif heading. A plain title (no "|") is just the heading. An image with
// neither title nor description renders as a full-width statement image.
// ─────────────────────────────────────────────────────────────────────────────

function splitTitle(title: string): { kicker: string; heading: string } {
  const idx = title.indexOf('|')
  if (idx > 0) {
    return { kicker: title.slice(0, idx).trim(), heading: title.slice(idx + 1).trim() }
  }
  return { kicker: '', heading: title.trim() }
}

export default function GalleryCards({ galleryImages }: { galleryImages: GalleryImage[] }) {
  if (galleryImages.length === 0) return null

  return (
    <section className="bg-[#faf9f6] px-6 sm:px-10 lg:px-14 py-14 sm:py-20 space-y-16 sm:space-y-24">
      {galleryImages.map((img, i) => {
        const { kicker, heading } = splitTitle(img.title || '')
        const hasText = !!(heading || img.description)

        // ── Full-bleed statement image (no text) ──
        if (!hasText) {
          return (
            <figure key={img.id} className="relative w-full aspect-[16/9]">
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover"
              />
            </figure>
          )
        }

        // ── Image + text, alternating sides ──
        const reverse = i % 2 === 1
        return (
          <figure
            key={img.id}
            className={`flex flex-col gap-8 sm:gap-12 sm:items-center ${reverse ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}
          >
            <div className="relative w-full sm:w-[58%] shrink-0 aspect-[4/3]">
              <Image
                src={img.url}
                alt={heading || img.title || ''}
                fill
                sizes="(max-width: 640px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
            <figcaption className="sm:flex-1 sm:max-w-sm">
              {kicker && (
                <p className="text-[11px] tracking-[0.3em] uppercase text-gray-400 mb-4">{kicker}</p>
              )}
              {heading && (
                <h4 className="font-serif text-2xl sm:text-[28px] text-gray-900 leading-snug tracking-wide">
                  {heading}
                </h4>
              )}
              <span className="block w-8 h-px bg-gray-300 my-5" aria-hidden />
              {img.description && (
                <p className="text-sm text-gray-500 leading-loose whitespace-pre-line">
                  {img.description}
                </p>
              )}
            </figcaption>
          </figure>
        )
      })}
    </section>
  )
}
