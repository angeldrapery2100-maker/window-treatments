'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface RelatedProduct {
  id: string
  name: string
  type: string
  main_image_url: string | null
}

export default function RelatedProducts({ currentId }: { currentId: string }) {
  const [products, setProducts] = useState<RelatedProduct[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    fetch('/api/store/products')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const others = d.data.products
            .filter((p: RelatedProduct) => p.id !== currentId)
          setProducts(others)
        }
      })
      .catch(() => {})
  }, [currentId])

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [products])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('a')
    const amount = card ? card.offsetWidth + 16 : 280
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <div className="mt-16 border-t border-gray-200 pt-10">
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
      <h2 className="text-lg font-light tracking-widest uppercase text-gray-800 mb-6">You May Also Like</h2>
      <div className="relative group/related">
        {canScrollLeft && (
          <button onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:shadow-xl transition-all opacity-0 group-hover/related:opacity-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:shadow-xl transition-all opacity-0 group-hover/related:opacity-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
        <div ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {products.map(p => (
            <a key={p.id} href={`/store/${p.id}`} className="group/card block flex-shrink-0 w-[calc(25%-12px)]" style={{ minWidth: '200px' }}>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                {p.main_image_url ? (
                  <Image src={p.main_image_url} alt={p.name} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover group-hover/card:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📷</div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-800 group-hover/card:text-gray-600 transition-colors truncate">{p.name}</p>
              <p className="text-xs text-gray-400 capitalize">{p.type}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
