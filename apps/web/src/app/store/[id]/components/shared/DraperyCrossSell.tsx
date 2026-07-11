'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// "Layer under drapery" cross-sell on sheer product pages (store redesign P4 —
// docs/STORE-REDESIGN-BLUEPRINT.md §3.2② 交叉销售反向). Mirror image of
// SheerCrossSell: from the sheer page we link to the REAL drapery product
// listings (own colors, own configurator, own price) so the customer buys the
// drapery as a separate, fully-informed item. Same deliberate design as the
// forward direction (Eddie 2026-07-11): no bundled pricing inside the
// configurator, and a layered look needs a double rod or double track.
interface DraperyProductCard {
  id: string
  name: string
  type: string
  main_image_url: string | null
}

export default function DraperyCrossSell({ currentId }: { currentId: string }) {
  const [products, setProducts] = useState<DraperyProductCard[]>([])

  useEffect(() => {
    fetch('/api/store/products?type=drapery')
      .then(r => r.json())
      .then(d => {
        if (d?.success) {
          setProducts(
            (d.data.products as DraperyProductCard[])
              .filter(p => p.id !== currentId)
              .slice(0, 3)
          )
        }
      })
      .catch(() => {})
  }, [currentId])

  if (products.length === 0) return null

  return (
    <div className="mt-4 rounded-lg border border-gray-100 bg-white p-4">
      <p className="text-sm font-light tracking-wide text-gray-900">Layer under drapery</p>
      <p className="mt-1 text-xs font-light leading-relaxed text-gray-500">
        Sheers shine as the soft inner layer behind a drapery panel — filtered
        light by day, full privacy by night. Sold separately with its own
        colors and pricing. Requires a double rod or track.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {products.map(p => (
          <Link key={p.id} href={`/store/${p.id}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-md bg-gray-50">
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
            <p className="mt-1.5 truncate text-xs font-light text-gray-800 group-hover:text-gray-500">
              {p.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
