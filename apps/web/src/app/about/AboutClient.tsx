'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'

interface ImageData {
  url: string; alt: string; width: number; height: number; fit: string
}

interface FeaturedProduct {
  name: string
  desc: string
  image: string | null
  href: string
}

interface Props {
  hero: { title: string; subtitle: string; bgImage: ImageData | null }
  story: { title: string; paragraphs: string[]; image: ImageData | null }
  values: { title: string; items: { icon: string; title: string; desc: string }[] }
  services: { title: string; items: { title: string; desc: string; image: ImageData | null }[] }
  brands: { title: string; items: { name: string; logo: ImageData | null }[] }
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; linkedin: string }
  featuredProducts?: FeaturedProduct[]
}

function CmsImg({ data, className, placeholder }: { data: ImageData | null; className?: string; placeholder?: string }) {
  if (data?.url) {
    return <img src={data.url} alt={data.alt} className={className} style={{ objectFit: data.fit as any }} />
  }
  return (
    <div className={`bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center ${className || ''}`}>
      <span className="text-gray-400">{placeholder || data?.alt || 'Image'}</span>
    </div>
  )
}

export default function AboutClient({ hero, story, values, services, brands, footer, featuredProducts = [] }: Props) {
  const productsScrollRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const certificationsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const trigger = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect()
          if (rect.top < window.innerHeight * 0.75) ref.current.classList.add('animate-visible')
        }
      }
      trigger(storyRef); trigger(valuesRef); trigger(teamRef); trigger(productsRef); trigger(certificationsRef)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          {hero.bgImage?.url ? (
            <img src={hero.bgImage.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800" />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <SiteNav activePage="About" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10">
            <h2 className="text-5xl md:text-6xl font-light tracking-wide text-white mb-4 drop-shadow-2xl">{hero.title}</h2>
            <p className="text-white/90 text-lg tracking-wide drop-shadow-lg">{hero.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="w-full bg-white py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={storyRef} className="grid md:grid-cols-2 gap-12 items-center slide-in-left">
            <div className="aspect-[3/4] rounded-lg shadow-2xl overflow-hidden">
              <CmsImg data={story.image} className="w-full h-full" placeholder="Company History" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-6">{story.title}</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {story.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="w-full bg-gray-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={valuesRef} className="slide-in-left">
            <h2 className="text-3xl md:text-4xl font-light text-center mb-4 tracking-wide">{values.title}</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">The principles that guide everything we do</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.items.map((v, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="text-4xl mb-4">{v.icon}</div>
                  <h3 className="text-xl font-medium mb-3">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full bg-white py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={teamRef} className="slide-in-left">
            <h2 className="text-3xl md:text-4xl font-light text-center mb-12 tracking-wide">{services.title}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {services.items.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="aspect-square rounded-lg shadow-xl mb-4 overflow-hidden">
                    <CmsImg data={s.image} className="w-full h-full" placeholder={s.title} />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="w-full bg-white py-20 overflow-hidden">
        <div className="w-full px-0">
          <h2 ref={productsRef} className="text-3xl md:text-4xl font-light text-center mb-12 tracking-wide px-4 slide-in-left">Featured Products</h2>
          <div className="relative group">
            <button onClick={() => productsScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div ref={productsScrollRef} className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-8">
              {featuredProducts.map((product, i) => (
                <Link key={i} href={product.href} className="flex-shrink-0 w-[280px] md:w-[320px] text-center group cursor-pointer">
                  <div className="aspect-square rounded-lg shadow-xl mb-4 overflow-hidden group-hover:shadow-2xl transition-all group-hover:scale-105 duration-300 bg-gradient-to-br from-gray-200 to-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">{product.name}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-medium mb-2 group-hover:text-gray-600 transition-colors">{product.name}</h3>
                  {product.desc && <p className="text-gray-600 text-sm line-clamp-2">{product.desc}</p>}
                </Link>
              ))}
            </div>
            <button onClick={() => productsScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>


      {/* Contact CTA */}
      <section className="w-full bg-[#3d3d3d] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-4">Ready to Transform Your Space?</h2>
          <p className="text-gray-300 mb-8">Contact us today for a free consultation</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact"><button className="px-8 py-3 bg-white text-[#1a2332] font-medium tracking-wide uppercase hover:bg-gray-200 transition-colors">Contact Us</button></Link>
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
              <a href={footer.linkedin} className="text-blue-700 hover:text-blue-800 transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
            </div>
            <div className="text-center text-sm text-gray-600">{footer.copyright}</div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .slide-in-left { opacity: 0; transform: translateX(-50px); transition: opacity 1s ease-out, transform 1s ease-out; }
        .slide-in-left.animate-visible { opacity: 1; transform: translateX(0); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}
