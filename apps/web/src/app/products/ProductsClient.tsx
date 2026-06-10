'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import FooterSocial from '@/components/FooterSocial'

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
            <FooterSocial youtube={footer.youtube} etsy={footer.etsy} tiktok={footer.tiktok} instagram={footer.instagram} />
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
