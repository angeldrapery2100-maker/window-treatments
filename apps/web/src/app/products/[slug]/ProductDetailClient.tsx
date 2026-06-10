'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import FooterSocial from '@/components/FooterSocial'

// Module-level browsing history (persists across client navigations within session)
const HISTORY_KEY = '__viewed_products__'
function getViewedProducts(): { id: number; name: string; cover_image: string; cover_fit: string }[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function addViewedProduct(p: { id: number; name: string; cover_image: string; cover_fit: string }) {
  if (typeof window === 'undefined') return
  const list = getViewedProducts().filter(x => x.id !== p.id)
  list.unshift(p)
  if (list.length > 20) list.length = 20
  try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(list)) } catch {}
}

interface ProductImage {
  id: number; image_url: string; caption: string; image_type: string
}
interface ProductSection {
  id: number; title: string; description: string; image_url: string
  image_width: number; image_height: number; image_fit: string
}
interface RelatedProduct {
  id: number; name: string; cover_image: string; cover_fit: string
}
interface Props {
  product: {
    id: number; name: string; description: string; long_description: string
    features: string[]; cover_image: string; cover_fit: string
    images: ProductImage[]; sections: ProductSection[]
  }
  related: RelatedProduct[]
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; instagram: string }
}

export default function ProductDetailClient({ product, related, footer }: Props) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  // Record this product to browsing history
  useEffect(() => {
    addViewedProduct({
      id: product.id,
      name: product.name,
      cover_image: product.cover_image,
      cover_fit: product.cover_fit,
    })
  }, [product.id, product.name, product.cover_image, product.cover_fit])

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Products', href: '/products' },
    { name: 'Online Store', href: '/store' },
  ]

  // Build all display images: cover first, then uploaded images
  const allImages: { url: string; fit: string }[] = []
  if (product.cover_image) allImages.push({ url: product.cover_image, fit: product.cover_fit || 'cover' })
  for (const img of product.images) {
    allImages.push({ url: img.image_url, fit: 'cover' })
  }
  if (allImages.length === 0) allImages.push({ url: '', fit: 'cover' })

  const currentImg = allImages[selectedImage] || allImages[0]

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <section className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" aria-label="Angel Drapery — home"><span className="block text-lg md:text-xl font-light tracking-[0.2em] text-gray-900 cursor-pointer hover:text-gray-600 transition-colors">ANGEL DRAPERY, INC</span></Link>
            <nav>
              <ul className="flex flex-wrap gap-3">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} onMouseEnter={() => setHoveredNav(item.name)} onMouseLeave={() => setHoveredNav(null)}
                      className={`block px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        hoveredNav === item.name || item.name === 'Products' ? 'bg-[#3d3d3d] text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="w-full bg-white py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-gray-900">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Detail */}
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Images */}
            <div>
              {/* Main Image — fixed 1:1 square */}
              <div className="w-full aspect-square rounded-lg overflow-hidden mb-4">
                {currentImg.url ? (
                  <img
                    src={currentImg.url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg shadow-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-50">
                    <span className="text-gray-400 text-2xl">{product.name}</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((img, index) => (
                    <div key={index} onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded cursor-pointer overflow-hidden transition-all border-2 ${
                        selectedImage === index ? 'border-gray-900' : 'border-transparent hover:border-gray-400'
                      }`}>
                      {img.url ? (
                        <img src={img.url} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">{index + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div>
              <h1 className="text-4xl font-light mb-4">{product.name}</h1>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">{product.description}</p>
              {product.long_description && (
                <p className="text-gray-600 leading-relaxed mb-8">{product.long_description}</p>
              )}

              {/* Features */}
              {product.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-light mb-4">Features</h2>
                  <ul className="space-y-3">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <p className="text-gray-600 mb-4">Interested in this product? Contact us for a free consultation and custom quote.</p>
                <Link href="/#contact" className="block">
                  <button className="w-full px-8 py-4 bg-[#3d3d3d] text-white font-medium tracking-wide uppercase hover:bg-gray-800 transition-colors">Request Free Consultation</button>
                </Link>
                <Link href="/gallery" className="block">
                  <button className="w-full px-8 py-4 border-2 border-gray-900 text-gray-900 font-medium tracking-wide uppercase hover:bg-gray-900 hover:text-white transition-colors">View Gallery</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Sections */}
      {product.sections.length > 0 && (
        <section className="w-full bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {product.sections.map((section, index) => (
                <div key={index} className="relative w-full rounded-lg overflow-hidden"
                  style={{ aspectRatio: section.image_width && section.image_height ? `${section.image_width}/${section.image_height}` : '16/9' }}>
                  {section.image_url ? (
                    <img src={section.image_url} alt={section.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
                    <div className="p-8 text-white">
                      <h3 className="text-2xl font-light mb-2">{section.title}</h3>
                      <p className="text-gray-300">{section.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What to Expect */}
      <section className="w-full bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-center mb-12">What to Expect</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📏</div>
              <h3 className="text-xl font-medium mb-2">1. Consultation</h3>
              <p className="text-gray-600 text-sm">Free in-home consultation to discuss your needs and preferences</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="text-xl font-medium mb-2">2. Custom Fabrication</h3>
              <p className="text-gray-600 text-sm">Your product is handcrafted to your exact specifications</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-medium mb-2">3. Professional Installation</h3>
              <p className="text-gray-600 text-sm">Expert installation ensures perfect fit and function</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="w-full bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-light text-center mb-12">Related Products</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {related.map((rp) => (
                <Link key={rp.id} href={`/products/${rp.id}`} className="group">
                  <div className="aspect-square rounded-lg shadow-lg mb-3 overflow-hidden group-hover:shadow-xl transition-shadow">
                    {rp.cover_image ? (
                      <img src={rp.cover_image} alt={rp.name} className="w-full h-full" style={{ objectFit: (rp.cover_fit as any) || 'cover' }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">{rp.name}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-center text-lg font-medium group-hover:text-gray-600 transition-colors">{rp.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      <RecentlyViewed currentId={product.id} />

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <FooterSocial youtube={footer.youtube} etsy={footer.etsy} tiktok={footer.tiktok} instagram={footer.instagram} />
            <div className="text-center text-sm text-gray-600">{footer.copyright}</div>
          </div>
        </div>
      </footer>
    </main>
  )
}

// ============================================================
// Recently Viewed Products
// ============================================================
function RecentlyViewed({ currentId }: { currentId: number }) {
  const [items, setItems] = useState<{ id: number; name: string; cover_image: string; cover_fit: string }[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Read from sessionStorage after mount, exclude current product
    const viewed = getViewedProducts().filter(p => p.id !== currentId)
    setItems(viewed)
  }, [currentId])

  if (items.length === 0) return null

  return (
    <section className="w-full bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-light mb-8 tracking-wide">Recently Viewed</h2>
        <div className="relative group">
          <button
            onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg text-gray-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -ml-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
            {items.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="flex-shrink-0 w-[180px] group/item">
                <div className="aspect-square rounded-lg overflow-hidden mb-2 shadow-md group-hover/item:shadow-xl transition-shadow">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">{p.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-center text-gray-700 group-hover/item:text-gray-500 transition-colors truncate">{p.name}</p>
              </Link>
            ))}
          </div>
          <button
            onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg text-gray-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -mr-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}
