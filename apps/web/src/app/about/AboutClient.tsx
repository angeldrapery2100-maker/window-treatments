'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SiteNav from '@/components/SiteNav'
import FooterSocial from '@/components/FooterSocial'

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
  story: { title: string; paragraphs: string[]; image: ImageData | null; image2: ImageData | null }
  values: { title: string; items: { icon: string; title: string; desc: string }[] }
  services: { title: string; items: { title: string; desc: string; image: ImageData | null }[] }
  brands: { title: string; items: { name: string; logo: ImageData | null }[] }
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; instagram: string }
  featuredProducts?: FeaturedProduct[]
}

// Line icons for the Values cards (replaces the old emoji set 🎨👥⭐💎).
const VALUE_ICONS: React.ReactNode[] = [
  // Quality Craftsmanship — scissors
  <svg key="craft" viewBox="0 0 24 24" className="w-9 h-9 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
  </svg>,
  // Customer First — people
  <svg key="people" viewBox="0 0 24 24" className="w-9 h-9 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  // Serving LA Since 1984 — clock
  <svg key="since" viewBox="0 0 24 24" className="w-9 h-9 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>,
  // Premium Materials — layers
  <svg key="materials" viewBox="0 0 24 24" className="w-9 h-9 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l10 6-10 6L2 8l10-6zM2 16l10 6 10-6" />
  </svg>,
]

function CmsImg({ data, className, placeholder }: { data: ImageData | null; className?: string; placeholder?: string }) {
  if (data?.url) {
    return (
      <div className={`relative ${className || ''}`}>
        <Image src={data.url} alt={data.alt} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: data.fit as any }} />
      </div>
    )
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
            <Image src={hero.bgImage.url} alt={hero.title || 'About us'} fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800" />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <SiteNav activePage="About" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10">
            <h1 className="text-5xl md:text-6xl font-light tracking-wide text-white mb-4 drop-shadow-2xl">{hero.title}</h1>
            <p className="text-white/90 text-lg tracking-wide drop-shadow-lg">{hero.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="w-full bg-white py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={storyRef} className="grid md:grid-cols-2 gap-12 items-center slide-in-left">
            <div className="aspect-[3/4] rounded-lg shadow-2xl overflow-hidden">
              <CmsImg data={story.image} className="w-full h-full" placeholder="[待补充: 1980s 老照片或老师傅工坊照]" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-light tracking-wide mb-6">{story.title}</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {story.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              {/* Owner/team photo — only rendered once the CMS image (story.image_2) is uploaded */}
              {story.image2?.url && (
                <div className="mt-8 aspect-[16/9] rounded-lg shadow-xl overflow-hidden">
                  <CmsImg data={story.image2} className="w-full h-full" />
                </div>
              )}
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
                  {/* Line icons (brand style) — legacy emoji values from the CMS are ignored */}
                  <div className="mb-4 text-[#4DB6E8]">{VALUE_ICONS[i % VALUE_ICONS.length]}</div>
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
                  <div className="relative aspect-square rounded-lg shadow-xl mb-4 overflow-hidden group-hover:shadow-2xl transition-all group-hover:scale-105 duration-300 bg-gradient-to-br from-gray-200 to-gray-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 280px, 320px"
                        className="object-cover"
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
            <FooterSocial youtube={footer.youtube} etsy={footer.etsy} tiktok={footer.tiktok} instagram={footer.instagram} />
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
