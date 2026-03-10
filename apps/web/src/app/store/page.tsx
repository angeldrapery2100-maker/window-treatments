'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { getCartCount } from '@/lib/cart'

interface StoreProduct {
  id: string
  name: string
  type: string
  base_price: number
  main_image_url: string | null
  default_config?: any
  store_category_id: string | null
  store_category_name: string | null
  store_category_slug: string | null
}

interface StoreCategory {
  id: string
  name: string
  slug: string
  sort_order: number
  product_count: number
}

// Recently viewed helper
function getRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('store_recently_viewed') || '[]') } catch { return [] }
}

// Product card component
function ProductCard({ p, calcPrice }: { p: StoreProduct; calcPrice?: number | null }) {
  const displayPrice = (calcPrice != null && calcPrice > 0) ? calcPrice : (p.base_price != null ? Number(p.base_price) : null)
  return (
    <Link href={`/store/${p.id}`}
      className="group cursor-pointer bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 block">
      <div className="aspect-square rounded-t-lg overflow-hidden relative">
        {p.main_image_url ? (
          <img src={p.main_image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center"><span className="text-gray-400 text-lg">{p.name}</span></div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">View Details</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-medium mb-1 group-hover:text-gray-600 transition-colors">{p.name}</h3>
        {displayPrice != null && displayPrice > 0 && (
          <span className="text-sm text-gray-600">Starting at <span className="text-lg font-bold text-gray-900">${displayPrice.toFixed(2)}</span></span>
        )}
      </div>
    </Link>
  )
}

// Recommended section with horizontal scroll
function RecommendedSection({ products, startingPrices }: { products: StoreProduct[]; startingPrices: Record<string, number | null> }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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
    // Scroll by the width of one card + gap
    const card = el.querySelector('a')
    const scrollAmount = card ? card.offsetWidth + 24 : 300 // 24 = gap-6
    el.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-2 text-gray-900">Recommended</h2>
          <p className="text-gray-500 text-sm">Our handpicked selections for you</p>
        </div>
        <div className="relative group/carousel">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all opacity-0 group-hover/carousel:opacity-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          {/* Right Arrow */}
          {canScrollRight && (
            <button onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all opacity-0 group-hover/carousel:opacity-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          {/* Scrollable container */}
          <div ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {products.map(p => (
              <div key={p.id} className="flex-shrink-0 w-[calc(25%-18px)]" style={{ minWidth: '260px' }}>
                <ProductCard p={p} calcPrice={startingPrices[p.id]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function OnlineStorePage() {
  const [storeEnabled, setStoreEnabled] = useState<boolean | null>(null)
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [categories, setCategories] = useState<StoreCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [recentProducts, setRecentProducts] = useState<StoreProduct[]>([])
  const [startingPrices, setStartingPrices] = useState<Record<string, number | null>>({})
  const [cartCount, setCartCount] = useState(0)

  // Check if store is enabled
  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(data => {
        setStoreEnabled(data.success ? (data.data?.online_store_enabled !== false) : true)
      })
      .catch(() => setStoreEnabled(true))
  }, [])

  // Listen for cart changes
  useEffect(() => {
    const update = () => setCartCount(getCartCount())
    update()
    window.addEventListener('cart-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('cart-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  useEffect(() => {
    if (storeEnabled === false) return
    Promise.all([
      fetch('/api/store/products?status=active').then(r => r.json()),
      fetch('/api/store/categories').then(r => r.json()),
      fetch('/api/store/starting-prices').then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([prodData, catData, priceData]) => {
      const prods: StoreProduct[] = prodData.success ? (prodData.data.products || []) : []
      setProducts(prods)
      // The categories API already filters is_active = true server-side, no need to re-filter
      if (catData.success) setCategories(catData.data || [])
      if (priceData.success) setStartingPrices(priceData.data || {})

      // Load recently viewed
      const recentIds = getRecentlyViewed()
      if (recentIds.length > 0) {
        const recentMap = new Map(prods.map(p => [p.id, p]))
        const recent = recentIds.map(id => recentMap.get(id)).filter(Boolean).slice(0, 4) as StoreProduct[]
        setRecentProducts(recent)
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [storeEnabled])


  // Featured: products marked as is_featured in default_config AND active
  const featured = products.filter(p => p.default_config?.is_featured)

  const grouped: Record<string, StoreProduct[]> = {}
  const uncategorized: StoreProduct[] = []
  products.forEach(p => {
    if (p.store_category_id) {
      if (!grouped[p.store_category_id]) grouped[p.store_category_id] = []
      grouped[p.store_category_id].push(p)
    } else {
      uncategorized.push(p)
    }
  })

  const displayCategories = categories.filter(c => grouped[c.id]?.length > 0)

  const scrollToCategory = (id: string) => {
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Coming Soon screen
  if (storeEnabled === false) {
    return (
      <main className="min-h-screen bg-white">
        <section className="relative w-full min-h-screen overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <SiteNav />
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
            <span className="inline-flex items-center gap-2 text-[#4DB6E8] text-[10px] font-bold tracking-[0.45em] uppercase mb-6">
              <span className="inline-block w-5 h-px bg-[#4DB6E8]" />
              Online Store
            </span>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-none mb-6">
              Coming Soon
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-sm leading-relaxed mb-10">
              We're putting the finishing touches on our online store.<br />
              Check back soon — it won't be long.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-white text-[11px] tracking-widest uppercase font-semibold border-b border-white/30 pb-0.5 hover:border-white transition-colors"
            >
              Get in touch
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <div className="relative z-10 px-10 pb-10 pt-6 border-t border-white/10 text-center">
            <p className="text-white/25 text-xs tracking-widest uppercase">
              Angel Drapery, Inc &nbsp;·&nbsp; Custom Window Treatments Since 1984
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
      {/* Hero */}
      <section className="relative w-full h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800"><div className="absolute inset-0 bg-black/30" /></div>
        <SiteNav activePage="Online Store" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10">
            <h2 className="text-5xl md:text-6xl font-light tracking-wide text-white mb-4 drop-shadow-2xl">Online Store</h2>
            <p className="text-white/90 text-lg tracking-wide drop-shadow-lg">Shop Our Custom Window Treatment Products</p>
          </div>
        </div>
      </section>

      {/* Category Nav */}
      {displayCategories.length > 0 && (
        <section className="w-full bg-white py-4 border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {displayCategories.map(cat => (
                <button key={cat.id} onClick={() => scrollToCategory(cat.id)}
                  className="px-6 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all duration-300">
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Recommended - Horizontal Scroll */}
          {featured.length > 0 && <RecommendedSection products={featured} startingPrices={startingPrices} />}

          {/* Category Sections */}
          {displayCategories.map((cat, catIdx) => (
            <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-20">
              {catIdx > 0 && <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="border-t-2 border-black" /></div>}
              <div className="w-full bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-3xl md:text-4xl font-light tracking-wide">{cat.name}</h2>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-400">{grouped[cat.id].length} products</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {grouped[cat.id].map(p => <ProductCard key={p.id} p={p} calcPrice={startingPrices[p.id]} />)}
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* Uncategorized */}
          {uncategorized.length > 0 && (
            <section className="scroll-mt-20">
              {displayCategories.length > 0 && <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="border-t-2 border-black" /></div>}
              <div className="w-full bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-3xl md:text-4xl font-light tracking-wide">Other Products</h2>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-400">{uncategorized.length} products</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {uncategorized.map(p => <ProductCard key={p.id} p={p} calcPrice={startingPrices[p.id]} />)}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Recently Viewed */}
          {recentProducts.length > 0 && (
            <section className="w-full bg-gray-50 py-16 border-t border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-2xl md:text-3xl font-light tracking-wide text-gray-900">Recently Viewed</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recentProducts.map(p => <ProductCard key={p.id} p={p} calcPrice={startingPrices[p.id]} />)}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Floating Buttons */}
      {!loading && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
          <Link href="/store/account"
            className="w-12 h-12 bg-white text-gray-600 border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>
          <Link href="/store/cart"
            className="w-14 h-14 bg-[#3d3d3d] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-700 hover:scale-110 transition-all duration-200 relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex gap-6">
              <a href="#" className="text-red-600 hover:text-red-700"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
              <a href="#" className="text-orange-500 hover:text-orange-600"><span className="text-xl font-bold">Etsy</span></a>
              <a href="#" className="text-gray-900 hover:text-gray-700"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>
              <a href="#" className="text-blue-700 hover:text-blue-800"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
            </div>
            <div className="text-center text-sm text-gray-600">©2025 by Angel Drapery</div>
          </div>
        </div>
      </footer>
    </main>
  )
}
