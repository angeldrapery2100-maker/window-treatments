"use client"

import { CDN_BASE } from '@/lib/cdn'
import Image from 'next/image'
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { provenanceLayout } from "./provenance-layout"
import type { CardItem, ImageLabel, SwatchCollection } from "./applause-layout"
import ImageLightbox, { type LightboxImage } from '@/components/ImageLightbox'

interface RelatedProduct {
  name: string; slug: string; cover_image: string | null; description: string
}
interface Props {
  product: any
  related: RelatedProduct[]
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; instagram: string }
}

const IMG = `${CDN_BASE}/hunter-douglas/provenance`

/* ─── Collapsible ─── */
function Collapsible({ title, badge, defaultOpen = false, children }: {
  title: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className="text-lg font-light text-gray-900">{title}</span>
          {badge && <span className="text-xs text-gray-400 bg-gray-200 px-2.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-400 text-lg">&#9662;</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══ Section Components ═══ */

function ScenePairBlock({ scene, index, scenes, onImg }: {
  scene: { image: string; text: string; label: string }; index: number; scenes: { image: string; text: string; label: string }[]; onImg: (images: LightboxImage[], index: number) => void
}) {
  const reverse = index % 2 !== 0
  const sectionImgs = scenes.map(s => ({ src: `${IMG}/${s.image}` }))
  return (
    <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-6`}>
      <div className="flex-[3] cursor-zoom-in rounded-lg overflow-hidden relative" onClick={() => onImg(sectionImgs, index)}>
        <Image src={`${IMG}/${scene.image}`} alt={scene.label || scene.text || 'Provenance Woven Wood shade scene'} width={1200} height={800} sizes="(max-width: 768px) 100vw, 75vw" className="w-full h-auto" />
        {scene.label && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
            <p className="text-[10px] text-white/80 whitespace-pre-line leading-relaxed">{scene.label}</p>
          </div>
        )}
      </div>
      <div className="flex-[1] flex flex-col justify-center">
        {scene.text && <p className="text-xl md:text-2xl font-light text-gray-800 leading-relaxed">{scene.text}</p>}
      </div>
    </div>
  )
}

function CardGrid({ title, cols, cards, onImg }: { title: string; cols: number; cards: CardItem[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const colCls = cols === 4 ? "md:grid-cols-4" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
  const sectionImgs = cards.map((c) => ({ src: `${IMG}/${c.image}` }))
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className={`grid grid-cols-2 ${colCls} gap-x-6 gap-y-8`}>
        {cards.map((c, i) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-3" onClick={() => onImg(sectionImgs, i)}>
              <Image src={`${IMG}/${c.image}`} alt={c.title} width={600} height={600} sizes="(max-width: 768px) 50vw, 25vw" className="w-full h-auto" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">{c.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonGrid({ title, cols, items, onImg }: { title: string; cols: number; items: ImageLabel[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const colCls = cols >= 4 ? "sm:grid-cols-2 md:grid-cols-4" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
  const sectionImgs = items.map((item) => ({ src: `${IMG}/${item.image}` }))
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className={`grid grid-cols-1 ${colCls} gap-6`}>
        {items.map((item, i) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-3" onClick={() => onImg(sectionImgs, i)}>
              <Image src={`${IMG}/${item.image}`} alt={item.label} width={600} height={600} sizes="(max-width: 768px) 50vw, 25vw" className="w-full h-auto" />
            </div>
            <p className="font-semibold text-sm text-gray-900 whitespace-pre-line">{item.label}</p>
            {item.sublabel && <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{item.sublabel}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function MountingGrid({ title, rows, onImg }: { title: string; rows: { items: any[] }[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs = rows.flatMap(row => row.items.map((item: any) => ({ src: `${IMG}/${item.image}` })))
  let imgIndex = 0
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className="space-y-8">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-6">
            {row.items.map((item: any, i: number) => {
              const currentIndex = imgIndex++
              return (
                <div key={i}>
                  <div className="rounded-md overflow-hidden bg-gray-200 cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, currentIndex)}>
                    <Image src={`${IMG}/${item.image}`} alt={`${item.label} ${item.sublabel || ''}`} width={400} height={400} sizes="(max-width: 768px) 33vw, 25vw" className="w-full h-auto" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{item.label}</p>
                  {item.sublabel && <p className="text-xs text-gray-500 italic">{item.sublabel}</p>}
                </div>
              )
            })}
          </div>
        ))}
        <p className="text-[10px] text-gray-400">*When mounting depth is less than the headrail depth. See Reference Guide for all mounting specifications.</p>
      </div>
    </div>
  )
}

/* ── Mounting Profiles (two-column: Shades + Vertical Drapery) ── */
function MountingProfilesSection({ section, onImg }: { section: any; onImg: (images: LightboxImage[], index: number) => void }) {
  const allImgs = [
    ...(section.shades?.rows || []).flatMap((row: any) => row.items.map((item: any) => ({ src: `${IMG}/${item.image}` }))),
    ...(section.drapery?.rows || []).flatMap((row: any) => row.items.map((item: any) => ({ src: `${IMG}/${item.image}` })))
  ]
  let imgIndex = 0

  const Column = ({ data }: { data: any }) => {
    const startIdx = imgIndex
    return (
      <div>
        <h4 className="text-xl font-light text-gray-700 mb-6">{data.heading}</h4>
        <div className="space-y-8">
          {(data.rows || []).map((row: any, ri: number) => (
            <div key={ri} className="grid grid-cols-3 gap-4">
              {row.items.map((item: any, i: number) => {
                const currentIndex = startIdx + imgIndex
                imgIndex++
                return (
                  <div key={i}>
                    <div className="rounded-md overflow-hidden bg-gray-200 cursor-zoom-in mb-2" onClick={() => onImg(allImgs, currentIndex)}>
                      <Image src={`${IMG}/${item.image}`} alt={`${item.label} ${item.sublabel}`} width={400} height={400} sizes="(max-width: 768px) 33vw, 25vw" className="w-full h-auto" />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 italic">{item.sublabel}</p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{section.title}</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {section.shades && <Column data={section.shades} />}
        {section.drapery && <Column data={section.drapery} />}
      </div>
      {section.footnote && <p className="text-[10px] text-gray-400 mt-6">{section.footnote}</p>}
    </div>
  )
}

function HardwareColors({ title, brandLabel, items }: { title: string; brandLabel: string; items: ImageLabel[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-3xl font-light text-gray-800">{title}</h3>
        <p className="text-sm text-gray-400 text-right">{brandLabel}</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <div className="relative aspect-square rounded-sm overflow-hidden border border-gray-200 mb-1">
              <Image src={`${IMG}/${item.image}`} alt={item.label} fill sizes="(max-width: 768px) 25vw, 12vw" className="object-cover" />
            </div>
            <p className="text-[10px] text-gray-600 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Liner Section ── */
function LinerSection({ data, onImg }: { data: any; onImg: (images: LightboxImage[], index: number) => void }) {
  const allImgs: LightboxImage[] = []
  const addImages = (imgs: any[]) => {
    imgs.forEach(img => allImgs.push({ src: `${IMG}/${img.image}` }))
  }

  if (data.independent) {
    if (data.independent.topImages) addImages(data.independent.topImages)
    if (data.independent.duoColors) addImages(data.independent.duoColors)
    if (data.independent.monoColors) addImages(data.independent.monoColors)
    if (data.independent.states) addImages(data.independent.states)
    if (data.independent.opacityOptions) addImages(data.independent.opacityOptions)
  }
  if (data.attached) {
    if (data.attached.topImages) addImages(data.attached.topImages)
    if (data.attached.duoColors) addImages(data.attached.duoColors)
    if (data.attached.monoColors) addImages(data.attached.monoColors)
    if (data.attached.states) addImages(data.attached.states)
    if (data.attached.opacityOptions) addImages(data.attached.opacityOptions)
  }

  let imgIndex = 0

  const ColorGrid = ({ colors }: { colors: { image: string; label: string }[] }) => (
    <div className="grid grid-cols-3 gap-3">
      {(colors || []).map((c: any, i: number) => {
        const currentIndex = imgIndex++
        return (
          <div key={i} className="text-center cursor-zoom-in" onClick={() => onImg(allImgs, currentIndex)}>
            <div className="relative aspect-square rounded-sm overflow-hidden border border-gray-200 mb-1">
              <Image src={`${IMG}/${c.image}`} alt={c.label} fill sizes="(max-width: 768px) 33vw, 16vw" className="object-cover" />
            </div>
            <p className="text-[10px] text-gray-600 leading-tight whitespace-pre-line">{c.label}</p>
          </div>
        )
      })}
    </div>
  )

  const Half = ({ sec }: { sec: any }) => (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-2">{sec.title}</h3>
      <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-2xl">{sec.desc}</p>
      <div className="flex flex-col md:flex-row gap-8" style={{ marginBottom: '-150px' }}>
        <div className="flex-[3] grid grid-cols-2 gap-4">
          {(sec.topImages || []).map((img: any, i: number) => {
            const currentIndex = imgIndex++
            return (
              <div key={i}>
                <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(allImgs, currentIndex)}>
                  <Image src={`${IMG}/${img.image}`} alt={img.label} width={600} height={400} sizes="(max-width: 768px) 50vw, 30vw" className="w-full h-auto" />
                </div>
                {img.label && <p className="text-xs text-gray-600 whitespace-pre-line">{img.label}</p>}
              </div>
            )
          })}
        </div>
        <div className="flex-[2] space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Duo Liner Colors</p>
            <p className="text-[11px] text-gray-500 mb-3">Choose between light-filtering or room-darkening opacities.</p>
            <ColorGrid colors={sec.duoColors} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Mono Liner Colors</p>
            <p className="text-[11px] text-gray-500 mb-3">Same color on both sides for consistency.</p>
            <ColorGrid colors={sec.monoColors} />
          </div>
          <p className="text-[9px] text-gray-400 italic">Actual color may vary. See Liner Accessory Deck for actual samples.</p>
        </div>
      </div>
      {sec.states?.length > 0 && (
        <div className="grid grid-cols-3 gap-4 max-w-xl">
          {sec.states.map((st: any, i: number) => {
            const currentIndex = imgIndex++
            return (
              <div key={i}>
                <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(allImgs, currentIndex)}>
                  <Image src={`${IMG}/${st.image}`} alt={st.label} width={400} height={400} sizes="(max-width: 768px) 33vw, 20vw" className="w-full h-auto" />
                </div>
                <p className="text-xs text-gray-600 whitespace-pre-line">{st.label}</p>
              </div>
            )
          })}
        </div>
      )}
      {sec.opacityOptions?.length > 0 && (
        <div>
          <h4 className="text-xl font-light text-gray-800 mb-4">Liner Opacity Options</h4>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {sec.opacityOptions.map((opt: any, i: number) => {
              const currentIndex = imgIndex++
              return (
                <div key={i}>
                  <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(allImgs, currentIndex)}>
                    <Image src={`${IMG}/${opt.image}`} alt={opt.title} width={400} height={400} sizes="(max-width: 768px) 50vw, 25vw" className="w-full h-auto" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{opt.title}</p>
                  <p className="text-[11px] text-gray-500">{opt.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-16">
      {data.independent && <Half sec={data.independent} />}
      {data.attached && <Half sec={data.attached} />}
    </div>
  )
}

/* ── Shade Styles Section ── */
function ShadeStylesSection({ section, onImg }: { section: any; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs = [
    ...(section.topImages || []).map((img: any) => ({ src: `${IMG}/${img.image}` })),
    ...(section.lineDrawings || []).map((d: any) => ({ src: `${IMG}/${d.image}` }))
  ]
  let imgIndex = (section.topImages || []).length
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{section.title}</h3>
      {/* Top row: product photos right-aligned */}
      <div className="flex justify-end gap-6 mb-6">
        {(section.topImages || []).map((img: any, i: number) => (
          <div key={i} className="cursor-zoom-in" onClick={() => onImg(sectionImgs, i)}>
            <Image src={`${IMG}/${img.image}`} alt={img.label || `${section.title} product photo`} width={400} height={320} sizes="(max-width: 768px) 50vw, 25vw" className="h-80 w-auto object-contain" />
          </div>
        ))}
      </div>
      {/* Line drawings with labels */}
      <div className="grid grid-cols-3 gap-6">
        {(section.lineDrawings || []).map((d: any, i: number) => (
          <div key={i}>
            <div className="cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, imgIndex + i)}>
              <Image src={`${IMG}/${d.image}`} alt={d.label} width={400} height={400} sizes="(max-width: 768px) 33vw, 25vw" className="w-full h-auto" />
            </div>
            <p className="font-semibold text-sm text-gray-900">{d.label}</p>
            {d.desc && <p className="text-xs text-gray-500 mt-1 leading-relaxed italic">{d.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Edge Banding Section ── */
function EdgeBandingSection({ data, onImg }: { data: any; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs = [
    ...(data.widths || []).map((w: any) => ({ src: `${IMG}/${w.image}` })),
    ...(data.colors || []).map((c: any) => ({ src: `${IMG}/${c.image}` }))
  ]
  const widthCount = (data.widths || []).length
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{data.title}</h3>
      {/* Width comparison — horizontal */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {(data.widths || []).map((w: any, i: number) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, i)}>
              <Image src={`${IMG}/${w.image}`} alt={w.label} width={600} height={400} sizes="(max-width: 768px) 50vw, 30vw" className="w-full h-auto" />
            </div>
            <p className="font-semibold text-sm text-gray-900 text-center">{w.label}</p>
            {w.sublabel && <p className="text-xs text-gray-500 text-center italic">{w.sublabel}</p>}
          </div>
        ))}
      </div>
      {/* Description */}
      {data.desc && <p className="text-sm text-gray-600 leading-relaxed mb-8 italic">{data.desc}</p>}
      {/* Color swatches — 2 columns horizontal layout */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {(data.colors || []).map((c: any, i: number) => (
          <div key={i} className="flex items-center gap-3 cursor-zoom-in" onClick={() => onImg(sectionImgs, widthCount + i)}>
            <div className="relative w-20 h-12 rounded-sm overflow-hidden border border-gray-200 flex-shrink-0">
              <Image src={`${IMG}/${c.image}`} alt={c.label} fill sizes="80px" className="object-cover" />
            </div>
            <p className="text-sm text-gray-700">{c.label}</p>
          </div>
        ))}
      </div>
      {/* Footnote */}
      {data.footnote && <p className="text-[10px] text-gray-400 mt-4 italic">{data.footnote}</p>}
    </div>
  )
}

function GalleryGrid({ scenes, onImg }: { scenes: { image: string; text: string; label: string }[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs = scenes.map(s => ({ src: `${IMG}/${s.image}` }))
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scenes.map((s, i) => (
        <div key={i} className={`group rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in relative ${i === 0 ? "md:col-span-2" : ""}`}
          onClick={() => onImg(sectionImgs, i)}>
          <Image src={`${IMG}/${s.image}`} alt={s.text || s.label || 'Provenance Woven Wood shade photo'} width={1200} height={800} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-auto group-hover:opacity-95 transition-opacity" />
          {(s.text || s.label) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              {s.text && <p className="text-white/90 text-sm leading-relaxed">{s.text}</p>}
              {s.label && <p className="text-white/60 text-xs mt-1 whitespace-pre-line">{s.label}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function SwatchPanel({ collection, onImg }: { collection: SwatchCollection; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs = collection.swatches.map((sw) => ({
    src: `${IMG}/${sw.image}`,
    caption: `${collection.name}\n${sw.colorName}\n${sw.specs.join("\n")}`
  }))
  return (
    <Collapsible title={collection.name} badge={`${collection.swatches.length} colors`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {collection.swatches.map((sw, i) => (
          <div key={i} className="cursor-zoom-in" onClick={() => onImg(sectionImgs, i)}>
            <div className="rounded-md overflow-hidden bg-gray-50 border border-gray-200 hover:border-gray-400 transition-colors mb-2">
              <Image src={`${IMG}/${sw.image}`} alt={sw.colorName} width={400} height={400} sizes="(max-width: 768px) 50vw, 16vw" className="w-full h-auto" />
            </div>
            <p className="text-xs font-bold text-gray-800 tracking-wide">{sw.colorName}</p>
            {sw.specs.map((spec, j) => (
              <p key={j} className="text-[10px] text-gray-400 leading-tight">{spec}</p>
            ))}
          </div>
        ))}
      </div>
    </Collapsible>
  )
}

/* ═══ Section Router ═══ */
function SectionRenderer({ section, onImg }: { section: any; onImg: (images: LightboxImage[], index: number) => void }) {
  switch (section.type) {
    case "scene-pair":
      return (
        <div className="space-y-12">
          {(section.scenes as { image: string; text: string; label: string }[]).map((scene, i) => (
            <ScenePairBlock key={i} scene={scene} index={i} scenes={section.scenes} onImg={onImg} />
          ))}
        </div>
      )
    case "card-grid":
      return <CardGrid title={section.title} cols={section.cols} cards={section.cards} onImg={onImg} />
    case "comparison-grid":
      return <ComparisonGrid title={section.title} cols={section.cols} items={section.items} onImg={onImg} />
    case "split-scene":
      return <ComparisonGrid title={section.title} cols={4} items={section.items} onImg={onImg} />
    case "shade-styles":
      return <ShadeStylesSection section={section} onImg={onImg} />
    case "mounting-grid":
      return <MountingGrid title={section.title} rows={section.rows} onImg={onImg} />
    case "mounting-profiles":
      return <MountingProfilesSection section={section} onImg={onImg} />
    case "edge-banding":
      return <EdgeBandingSection data={section} onImg={onImg} />
    case "hardware-colors":
      return <HardwareColors title={section.title} brandLabel={section.brandLabel} items={section.items} />
    case "control-systems":
      return null  // handled separately if needed
    default:
      return null
  }
}

/* ═══════════ MAIN ═══════════ */
export default function ProvenanceDetailClient({ product, related, footer }: Props) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [lbImages, setLbImages] = useState<LightboxImage[]>([])
  const [lbIndex, setLbIndex] = useState(-1)

  const L = provenanceLayout

  const openLightbox = (images: LightboxImage[], index: number) => {
    setLbImages(images)
    setLbIndex(index)
  }
  const closeLightbox = () => setLbIndex(-1)
  const [storeOn, setStoreOn] = useState(true)
  useEffect(() => {
    fetch('/api/site-settings').then(r => r.json()).then(d => {
      if (d.success && d.data?.online_store_enabled === false) setStoreOn(false)
    }).catch(() => {})
  }, [])
  const allNav = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Products", href: "/products" },
    { name: "Online Store", href: "/store" },
  ]
  const nav = storeOn ? allNav : allNav.filter(n => n.name !== 'Online Store')
  const totalSwatches = L.swatchCollections.reduce((s, c) => s + c.swatches.length, 0)

  return (
    <main className="min-h-screen bg-white">
      {lbIndex >= 0 && <ImageLightbox images={lbImages} currentIndex={lbIndex} onNav={setLbIndex} onClose={closeLightbox} />}

      {/* ─── Hero ─── */}
      <section className="relative w-full overflow-hidden">
        <Image src={`${IMG}/${L.heroImage}`} alt={L.name} width={1920} height={1080} priority sizes="100vw" className="w-full h-auto" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        <div className="absolute top-8 left-8 z-20">
          <Link href="/" aria-label="Angel Drapery — home"><span className="block text-xl md:text-2xl font-light tracking-[0.2em] text-white drop-shadow-lg hover:text-gray-300 transition-colors">ANGEL DRAPERY, INC</span></Link>
        </div>
        <nav className="absolute top-8 right-8 z-20">
          <ul className="flex flex-wrap gap-3 justify-end">
            {nav.map((n) => (
              <li key={n.name}>
                <Link href={n.href} onMouseEnter={() => setHoveredNav(n.name)} onMouseLeave={() => setHoveredNav(null)}
                  className={`block px-6 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 text-sm font-medium ${
                    hoveredNav === n.name || n.name === "Products"
                      ? "bg-white/20 text-white border-white/50" : "bg-transparent text-white/80 border-white/20 hover:bg-white/20 hover:border-white/50"
                  }`}>{n.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
              <Link href="/products" className="hover:text-white/80 transition-colors">Products</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-white/80 transition-colors">Hunter Douglas</Link>
              <span>/</span>
              <span className="text-white/80">{L.name}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-light text-white mb-3">{L.name}</h1>
            <p className="text-white/70 text-base md:text-lg max-w-2xl">{L.description}</p>
          </div>
        </div>
        <div className="absolute bottom-4 right-8 text-right">
          <p className="text-[10px] text-white/50 whitespace-pre-line">{L.heroLabel}</p>
        </div>
      </section>

      {/* ═══ Direct Sections ═══ */}
      {L.sections.map((section, i) => (
        <section key={i} className={`w-full py-12 md:py-16 ${i % 2 === 0 ? "bg-[#fafaf8]" : "bg-white"}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionRenderer section={section} onImg={openLightbox} />
          </div>
        </section>
      ))}

      {/* ─── Liner Section ─── */}
      {L.liner && (
        <section className="w-full py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-light text-gray-800 mb-2">Liner</h2>
            <p className="text-base text-gray-500 mb-10 max-w-3xl">Liner color options available for versatility and coordination.</p>
            <LinerSection data={L.liner} onImg={openLightbox} />
          </div>
        </section>
      )}

      {/* ═══ Collapsible Sections ═══ */}
      <section className="w-full bg-[#f5f4f0] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {L.gallery.length > 0 && (
            <Collapsible title="Photo Gallery" badge={`${L.gallery.length} photos`}>
              <GalleryGrid scenes={L.gallery} onImg={openLightbox} />
            </Collapsible>
          )}

          {L.hardwareColors && (
            <Collapsible title="Hardware Color Guide">
              <SectionRenderer section={L.hardwareColors} onImg={openLightbox} />
            </Collapsible>
          )}
          {L.edgeBanding && (
            <Collapsible title="Decorative Edge Banding" badge="8 colors">
              <EdgeBandingSection data={L.edgeBanding} onImg={openLightbox} />
            </Collapsible>
          )}
          {L.swatchCollections.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="text-2xl font-light text-gray-900">Fabric & Color Options</h3>
                <p className="text-sm text-gray-500 mt-1">{totalSwatches} colors across {L.swatchCollections.length} collections</p>
              </div>
              {L.swatchCollections.map((c) => (
                <SwatchPanel key={c.name} collection={c} onImg={openLightbox} />
              ))}
            </>
          )}
        </div>
      </section>

      {/* ─── Related ─── */}
      {related.length > 0 && (
        <section className="w-full bg-white py-16 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-light text-gray-900 mb-8 text-center">Explore More Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/products/${r.slug}`}
                  className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
                  <div className="aspect-[4/3] overflow-hidden bg-[#f0ede8]">
                    {r.cover_image ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <Image src={`${CDN_BASE}/hunter-douglas/${r.slug}/${r.cover_image}`} alt={r.name}
                          fill sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100"><span className="text-gray-400 text-xs">{r.name}</span></div>
                    )}
                  </div>
                  <div className="p-3"><h4 className="text-sm font-medium text-gray-800 group-hover:text-gray-500 transition-colors line-clamp-1">{r.name}</h4></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="w-full bg-[#3d3d3d] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-light mb-4">Interested in {L.name}?</h2>
          <p className="text-gray-300 mb-8">Get a free in-home consultation and see fabric samples in person.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact"><button className="px-8 py-3 bg-white text-[#1a2332] font-medium tracking-wide uppercase hover:bg-gray-200 transition-colors">Schedule Consultation</button></Link>
            <Link href="/products"><button className="px-8 py-3 border-2 border-white text-white font-medium tracking-wide uppercase hover:bg-white hover:text-[#1a2332] transition-colors">Back to All Products</button></Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="w-full bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex gap-6">
              <a href={footer.youtube} className="text-red-600 hover:text-red-700"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
              <a href={footer.etsy} className="text-orange-500 hover:text-orange-600"><span className="text-xl font-bold">Etsy</span></a>
              <a href={footer.tiktok} className="text-gray-900 hover:text-gray-700"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>
              <a href={footer.instagram} className="text-pink-500 hover:text-pink-600 transition-colors" target="_blank" rel="noopener noreferrer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>            </div>
            <div className="text-center text-sm text-gray-600">{footer.copyright}</div>
          </div>
        </div>
      </footer>
    </main>
  )
}
