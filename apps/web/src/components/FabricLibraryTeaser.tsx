'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * "Explore our fabric library" — the door from the Handcrafted Drapery page
 * into /fabrics.
 *
 * Fetched after mount rather than server-rendered on purpose: this sits well
 * below the fold on a very image-heavy page, and the point of the block is to
 * be discoverable, not to be in the LCP. Renders nothing until it has data, so
 * it can never push the hero around.
 */
interface Teaser {
  id: string
  name: string
  color: string
  brand: string
  thumbUrl: string | null
  material: string
  widthIn: number | null
  repeatVIn: number | null
  patternType: string
}

export default function FabricLibraryTeaser() {
  const [fabrics, setFabrics] = useState<Teaser[]>([])

  useEffect(() => {
    let alive = true
    fetch('/api/fabrics/featured')
      .then((r) => r.json())
      .then((j) => { if (alive && j?.success) setFabrics(j.data as Teaser[]) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  if (!fabrics.length) return null

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[#ef8200] font-bold text-xs tracking-[0.3em] uppercase">Fabrics</span>
          <h3 className="mt-3 text-3xl md:text-5xl font-serif italic text-gray-900 tracking-tight">
            Explore our fabric library
          </h3>
          <p className="mt-4 max-w-xl text-gray-500 leading-relaxed">
            Ten thousand colourways from Carole, Alendel and Kaslen — see the weave, the fibre content
            and the pattern size before anyone comes to your home.
          </p>
        </div>
        <Link
          href="/fabrics"
          className="rounded-full border border-gray-900 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white whitespace-nowrap"
        >
          Browse all fabrics →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
        {fabrics.map((f) => (
          <Link
            key={f.id}
            href={`/fabrics/${encodeURIComponent(f.id)}`}
            className="group shrink-0 w-[180px] md:w-[220px]"
          >
            <span className="block aspect-square w-full overflow-hidden rounded-lg bg-gray-100 shadow-sm">
              {f.thumbUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={f.thumbUrl}
                  alt={`${f.name} in ${f.color}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              )}
            </span>
            <span className="mt-2 block truncate text-sm font-medium text-gray-900">{f.name}</span>
            <span className="block truncate text-xs text-gray-500">{f.color} · {f.brand}</span>
            <span className="mt-1 block truncate text-[11px] text-gray-400">
              {f.patternType}
              {f.widthIn ? ` · ${f.widthIn}" wide` : ''}
              {f.repeatVIn ? ` · ${f.repeatVIn}" repeat` : ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
