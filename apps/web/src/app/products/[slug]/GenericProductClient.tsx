'use client'

import { CDN_BASE } from '@/lib/cdn'

import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import ImageLightbox, { type LightboxImage } from '@/components/ImageLightbox'

interface RelatedProduct {
  name: string
  slug: string
  cover_image: string | null
  description: string
}

interface Props {
  product: any
  related: RelatedProduct[]
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; instagram: string }
}

interface LayoutData {
  slug: string
  name: string
  description: string
  heroImage: string
  heroLabel: string
  scenePair: Array<{ image: string; text: string; label: string }>
  sections: any[]
  gallery: Array<{ image: string; text: string; label: string }>
  hardwareColors: any | null
  swatchCollections: Array<{ name: string; swatches: Array<{ image: string; colorName: string; specs: string[] }> }>
}

function Collapsible({ title, badge, defaultOpen = false, children }: { title: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-light text-gray-900">{title}</span>
          {badge && <span className="text-xs text-gray-400 bg-gray-200 px-2.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-400 text-lg">▾</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScenePairSection({ scenes, imgBase, onImg }: { scenes: Array<{ image: string; text: string; label: string }>; imgBase: string; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = scenes.map(s => ({ src: `${imgBase}/${s.image}` }))
  return (
    <div className="space-y-12">
      {scenes.map((scene, i) => (
        <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6`}>
          <div className="flex-[3] cursor-zoom-in rounded-lg overflow-hidden relative" onClick={() => onImg(sectionImgs, i)}>
            <img src={`${imgBase}/${scene.image}`} alt="" className="w-full h-auto" loading="lazy" />
            {scene.label && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
                <p className="text-[10px] text-white/80 whitespace-pre-line leading-relaxed">{scene.label}</p>
              </div>
            )}
          </div>
          <div className="flex-[1] flex items-center">
            {scene.text && <p className="text-xl md:text-2xl font-light text-gray-800 leading-relaxed">{scene.text}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function CardGridSection({ section, imgBase, onImg }: { section: any; imgBase: string; onImg: (images: LightboxImage[], index: number) => void }) {
  const cols = section.cols || 4
  const sectionImgs: LightboxImage[] = section.cards.map((c: any) => ({ src: `${imgBase}/${c.image}` }))
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{section.title}</h3>
      <div className={`grid grid-cols-2 ${cols >= 4 ? 'md:grid-cols-4' : cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-x-6 gap-y-8`}>
        {section.cards.map((card: any, i: number) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-3" onClick={() => onImg(sectionImgs, i)}>
              <img src={`${imgBase}/${card.image}`} alt={card.title} className="w-full h-auto" loading="lazy" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">{card.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonGridSection({ section, imgBase, onImg }: { section: any; imgBase: string; onImg: (images: LightboxImage[], index: number) => void }) {
  const cols = section.cols || 2
  const isVignettePowerView = section.title === 'PowerView and Operating Systems'
  const itemCount = section.items?.length || 0

  /* For 7 items in a 4-col grid, use 4+3 layout with the bottom row centered */
  const useBalancedLayout = cols === 4 && itemCount === 7

  // Build flat array of all images in this section
  const sectionImgs: LightboxImage[] = section.items.map((item: any) => ({ src: `${imgBase}/${item.image}` }))

  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{section.title}</h3>
      {useBalancedLayout ? (
        <>
          {/* Top row: 4 items */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {section.items.slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="flex flex-col">
                <div
                  className="relative rounded-md overflow-hidden bg-gray-50 cursor-zoom-in mb-3"
                  style={{ aspectRatio: '4/3' }}
                  onClick={() => onImg(sectionImgs, i)}
                >
                  <Image src={`${imgBase}/${item.image}`} alt={item.label} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                </div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">{item.label}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.sublabel}</p>
              </div>
            ))}
          </div>
          {/* Bottom row: 3 items, centered */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="hidden md:block" />
            {section.items.slice(4, 7).map((item: any, i: number) => (
              <div key={i + 4} className="flex flex-col">
                <div
                  className="relative rounded-md overflow-hidden bg-gray-50 cursor-zoom-in mb-3"
                  style={{ aspectRatio: '4/3' }}
                  onClick={() => onImg(sectionImgs, i + 4)}
                >
                  <Image src={`${imgBase}/${item.image}`} alt={item.label} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                </div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">{item.label}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.sublabel}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={`grid grid-cols-2 ${cols >= 4 ? 'md:grid-cols-4' : cols >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          {section.items.map((item: any, i: number) => (
            <div key={i} className={isVignettePowerView ? 'h-full flex flex-col' : ''}>
              <div className="relative rounded-md overflow-hidden bg-gray-50 cursor-zoom-in mb-3" style={{ aspectRatio: '4/3' }} onClick={() => onImg(sectionImgs, i)}>
                <Image src={`${imgBase}/${item.image}`} alt={item.label} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
              <div className={isVignettePowerView ? 'mt-auto' : ''}>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">{item.label}</h4>
                {item.sublabel && item.label === 'PowerView® Automation' && isVignettePowerView ? (
                  <div className="space-y-1">
                    {(() => {
                      const lines = String(item.sublabel).split('\n').map((x) => x.trim()).filter(Boolean)
                      const pairs: Array<{ title: string; desc: string }> = []
                      for (let n = 0; n < lines.length; n += 2) pairs.push({ title: lines[n], desc: lines[n + 1] || '' })
                      return pairs.map((pair, idx) => (
                        <div key={idx}>
                          <p className="text-sm font-semibold text-gray-700 leading-tight">{pair.title}</p>
                          {pair.desc && <p className="text-xs text-gray-500 leading-snug">{pair.desc}</p>}
                        </div>
                      ))
                    })()}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{item.sublabel}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HardwareColorsSection({ data, imgBase }: { data: any; imgBase: string }) {
  return (
    <div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {data.items.map((item: any, i: number) => (
          <div key={i} className="text-center">
            <div className="relative rounded-full overflow-hidden bg-gray-50 border border-gray-200 mb-1.5 mx-auto w-14 h-14">
              <Image src={`${imgBase}/${item.image}`} alt={item.label} fill sizes="56px" className="object-cover" />
            </div>
            <p className="text-[9px] text-gray-600 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SwatchCollectionSection({ collection, imgBase, onImg }: { collection: any; imgBase: string; onImg: (images: LightboxImage[], index: number) => void }) {
  const displayName = String(collection.name || '').replace(/\bTM\b/g, '™')
  const sectionImgs: LightboxImage[] = collection.swatches.map((sw: any, i: number) => {
    const captionSpecs = (sw.specs || [])
      .filter((spec: string) => Boolean(spec))
      .filter((spec: string) => !/^Stacking 4" Full Fold \(Room Darkening\)/i.test(spec))
    const caption = [displayName, sw.colorName, ...captionSpecs].join('\n')
    return { src: `${imgBase}/${sw.image}`, caption }
  })
  return (
    <Collapsible title={displayName} badge={`${collection.swatches.length} colors`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {collection.swatches.map((sw: any, i: number) => (
          <div key={i} className="cursor-zoom-in" onClick={() => onImg(sectionImgs, i)}>
            <div className="rounded-md overflow-hidden bg-gray-50 border border-gray-200 hover:border-gray-400 transition-colors mb-2">
              <img src={`${imgBase}/${sw.image}`} alt={sw.colorName} className="w-full h-auto" loading="lazy" />
            </div>
            <p className="text-xs font-bold text-gray-800 tracking-wide">{sw.colorName}</p>
            {(sw.specs || []).map((spec: string, j: number) => (
              <p key={j} className="text-[10px] text-gray-400 leading-tight">{spec}</p>
            ))}
          </div>
        ))}
      </div>
    </Collapsible>
  )
}

function GallerySection({ scenes, imgBase, onImg }: { scenes: Array<{ image: string; text: string; label: string }>; imgBase: string; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = scenes.map(s => ({ src: `${imgBase}/${s.image}` }))
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scenes.map((scene, i) => (
        <div key={i} className="cursor-zoom-in rounded-lg overflow-hidden relative" onClick={() => onImg(sectionImgs, i)}>
          <img src={`${imgBase}/${scene.image}`} alt="" className="w-full h-auto" loading="lazy" />
          {scene.label && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
              <p className="text-[9px] text-white/70 whitespace-pre-line">{scene.label}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function SectionRenderer({ section, imgBase, onImg }: { section: any; imgBase: string; onImg: (images: LightboxImage[], index: number) => void }) {
  switch (section.type) {
    case 'card-grid':
      return <CardGridSection section={section} imgBase={imgBase} onImg={onImg} />
    case 'comparison-grid':
      return <ComparisonGridSection section={section} imgBase={imgBase} onImg={onImg} />
    default:
      return null
  }
}

export default function GenericProductClient({ product, related, footer }: Props) {
  const [lbImages, setLbImages] = useState<LightboxImage[]>([])
  const [lbIndex, setLbIndex] = useState(-1)
  const [layout, setLayout] = useState<LayoutData | null>(null)

  const slug = product.slug
  const imgBase = `${CDN_BASE}/hunter-douglas/${slug}`

  const openLightbox = (images: LightboxImage[], index: number) => {
    setLbImages(images)
    setLbIndex(index)
  }

  const closeLightbox = () => setLbIndex(-1)

  useEffect(() => {
    fetch(`${imgBase}/layout.json`)
      .then((r) => r.json())
      .then(setLayout)
      .catch(() => setLayout(null))
  }, [slug, imgBase])

  if (!layout) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </main>
    )
  }

  const totalSwatches = layout.swatchCollections.reduce((sum, c) => sum + c.swatches.length, 0)
  const mainSections = layout.sections.slice(0, 8)
  const extraSections = layout.sections.slice(8)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: layout.name, href: '#' },
  ]

  return (
    <main className="min-h-screen bg-white">
      <AnimatePresence>
        {lbIndex >= 0 && <ImageLightbox images={lbImages} currentIndex={lbIndex} onNav={setLbIndex} onClose={closeLightbox} />}
      </AnimatePresence>

      <section className="relative w-full overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: '42%' }}>
          <Image src={`${imgBase}/${layout.heroImage}`} alt={layout.name} fill sizes="100vw" priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-end pb-12 md:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex gap-2 text-sm text-white/60 mb-4">
              {navigation.map((n, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-1">/</span>}
                  {n.href !== '#' ? <Link href={n.href} className="hover:text-white">{n.name}</Link> : <span className="text-white/80">{n.name}</span>}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-light text-white mb-3">{layout.name}</h1>
            <p className="text-white/70 text-base md:text-lg max-w-2xl">{layout.description}</p>
          </div>
        </div>
      </section>

      {layout.scenePair.length > 0 && (
        <section className="w-full py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScenePairSection scenes={layout.scenePair} imgBase={imgBase} onImg={openLightbox} />
          </div>
        </section>
      )}

      {mainSections.map((section: any, i: number) => (
        <section key={i} className={`w-full py-12 md:py-16 ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafaf8]'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionRenderer section={section} imgBase={imgBase} onImg={openLightbox} />
          </div>
        </section>
      ))}

      <section className="w-full bg-[#f5f4f0] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {slug !== 'vignette' && extraSections.length > 0 && (
            <Collapsible title="More Details" badge={`${extraSections.length} sections`}>
              <div className="space-y-12">
                {extraSections.map((section: any, i: number) => (
                  <SectionRenderer key={i} section={section} imgBase={imgBase} onImg={openLightbox} />
                ))}
              </div>
            </Collapsible>
          )}

          {layout.gallery.length > 0 && (
            <Collapsible title="Photo Gallery" badge={`${layout.gallery.length} photos`}>
              <GallerySection scenes={layout.gallery} imgBase={imgBase} onImg={openLightbox} />
            </Collapsible>
          )}

          {layout.hardwareColors && (
            <Collapsible title="Hardware Color Guide">
              <HardwareColorsSection data={layout.hardwareColors} imgBase={imgBase} />
            </Collapsible>
          )}

          {layout.swatchCollections.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="text-2xl font-light text-gray-900">Fabric & Color Options</h3>
                <p className="text-sm text-gray-500 mt-1">{totalSwatches} colors across {layout.swatchCollections.length} collections</p>
              </div>
              {layout.swatchCollections.map((collection: any) => (
                <SwatchCollectionSection key={collection.name} collection={collection} imgBase={imgBase} onImg={openLightbox} />
              ))}
            </>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="w-full bg-white py-16 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-light text-gray-900 mb-8 text-center">Explore More Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#f0ede8]">
                    {item.cover_image ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <Image
                          src={`${CDN_BASE}/hunter-douglas/${item.slug}/${item.cover_image}`}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100"><span className="text-gray-400 text-xs">{item.name}</span></div>
                    )}
                  </div>
                  <div className="p-3"><h4 className="text-sm font-medium text-gray-800 group-hover:text-gray-500 transition-colors line-clamp-1">{item.name}</h4></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="w-full bg-[#3d3d3d] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-light mb-4">Interested in {layout.name}?</h2>
          <p className="text-gray-300 mb-8">Get a free in-home consultation and see fabric samples in person.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact"><button className="px-8 py-3 bg-white text-[#1a2332] font-medium tracking-wide uppercase hover:bg-gray-200 transition-colors">Schedule Consultation</button></Link>
            <Link href="/products"><button className="px-8 py-3 border-2 border-white text-white font-medium tracking-wide uppercase hover:bg-white hover:text-[#1a2332] transition-colors">Back to All Products</button></Link>
          </div>
        </div>
      </section>

      <footer className="w-full bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center text-sm text-gray-600">{footer.copyright}</div>
          </div>
        </div>
      </footer>
    </main>
  )
}
