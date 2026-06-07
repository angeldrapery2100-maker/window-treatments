'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'

interface ImageData {
  url: string; alt: string; width: number; height: number; fit: string
}

interface ProductItem {
  id: number; name: string; image: ImageData | null
}

interface Props {
  hero: { title: string; subtitle: string; bgImage: ImageData | null }
  products: ProductItem[]
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; instagram: string }
}

export default function ProductsClient({ hero, products, footer }: Props) {
  const productsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (productsRef.current) {
        const rect = productsRef.current.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.75) productsRef.current.classList.add('animate-visible')
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative w-full h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          {hero.bgImage?.url ? (
            <img src={hero.bgImage.url} alt={hero.title || 'Our products'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800" />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <SiteNav activePage="Products" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10">
            <h2 className="text-5xl md:text-6xl font-light tracking-wide text-white mb-4 drop-shadow-2xl">{hero.title}</h2>
            <p className="text-white/90 text-lg tracking-wide drop-shadow-lg">{hero.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={productsRef} className="fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="aspect-[4/3] overflow-hidden relative bg-[#f0ede8]">
                    {product.image?.url ? (
                      <img src={product.image.url} alt={product.image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ objectFit: product.image.fit as any }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">{product.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-white text-xs font-medium bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm tracking-wider uppercase">View Details</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">{product.name}</h3>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12">
              <Link
                href="/products/handcrafted-drapery"
                className="group block rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all"
              >
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-[4/3] md:aspect-auto">
                    <Image
                      src="/drapery/handcrafted-drapery/IMG_0547.JPG"
                      alt="Handcrafted Drapery"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <p className="text-xs tracking-[0.16em] uppercase text-gray-500 mb-2">Featured Collection</p>
                    <h3 className="text-3xl font-light text-gray-900 mb-3 group-hover:text-gray-600 transition-colors">
                      Handcrafted Drapery
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Premium made-to-measure drapery with refined hand-finished construction, rich fabric options, and experienced
                      design guidance.
                    </p>
                    <span className="mt-5 text-sm text-gray-500 group-hover:text-gray-800 transition-colors">View product page →</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="w-full bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-6">Why Choose Our Products?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div>
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-medium mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">We only work with the finest brands and materials in the industry</p>
            </div>
            <div>
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="text-xl font-medium mb-2">Custom Made</h3>
              <p className="text-gray-600 text-sm">Every product is tailored to your specific measurements and preferences</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🛠️</div>
              <h3 className="text-xl font-medium mb-2">Expert Installation</h3>
              <p className="text-gray-600 text-sm">Professional installation by our experienced team ensures perfect results</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="w-full bg-[#3d3d3d] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-4">Ready to Transform Your Windows?</h2>
          <p className="text-gray-300 mb-8">Schedule a free in-home consultation to explore our products</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact"><button className="px-8 py-3 bg-white text-[#1a2332] font-medium tracking-wide uppercase hover:bg-gray-200 transition-colors">Schedule Consultation</button></Link>
            <Link href="/gallery"><button className="px-8 py-3 border-2 border-white text-white font-medium tracking-wide uppercase hover:bg-white hover:text-[#1a2332] transition-colors">View Gallery</button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex gap-6">
              <a href={footer.youtube} className="text-red-600 hover:text-red-700 transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
              <a href={footer.etsy} className="text-orange-500 hover:text-orange-600 transition-colors"><span className="text-xl font-bold">Etsy</span></a>
              <a href={footer.tiktok} className="text-gray-900 hover:text-gray-700 transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>
              <a href={footer.instagram} className="text-pink-500 hover:text-pink-600 transition-colors" target="_blank" rel="noopener noreferrer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
            </div>
            <div className="text-center text-sm text-gray-600">{footer.copyright}</div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .fade-in > div > * { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.6s ease-out forwards; }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  )
}
