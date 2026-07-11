'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// "Pair with a sheer layer" cross-sell on drapery product pages.
//
// Deliberate design (Eddie 2026-07-11): we do NOT price a sheer layer inside
// the drapery configurator — customers can't see which sheer they'd be buying,
// and a layered look needs a double rod/track they may not have. Instead we
// link to the REAL sheer product listings (visible colors, own configurator,
// own price) so the customer buys the sheer as a separate, fully-informed item.
interface SheerProduct {
  id: string
  name: string
  type: string
  main_image_url: string | null
}

export default function SheerCrossSell({ currentId }: { currentId: string }) {
  const [products, setProducts] = useState<SheerProduct[]>([])

  useEffect(() => {
    fetch('/api/store/products?type=sheer')
      .then(r => r.json())
      .then(d => {
        if (d?.success) {
          setProducts(
            (d.data.products as SheerProduct[])
              .filter(p => p.id !== currentId)
              .slice(0, 3)
          )
        }
      })
      .catch(() => {})
  }, [currentId])

  if (products.length === 0) return null

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-medium text-gray-900">Pair with a sheer layer</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        Many clients hang a sheer behind their drapery for soft daytime light.
        Sold separately with its own colors and pricing — a layered look
        requires a double rod or double track.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {products.map(p => (
          <Link key={p.id} href={`/store/${p.id}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
              {p.main_image_url ? (
                <Image
                  src={p.main_image_url}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 30vw, 140px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-gray-300">📷</div>
              )}
            </div>
            <p className="mt-1.5 truncate text-xs font-medium text-gray-800 group-hover:text-gray-600">
              {p.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
