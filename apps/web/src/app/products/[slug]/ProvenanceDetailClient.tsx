"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { provenanceLayout } from "./provenance-layout"
import type { CardItem, ImageLabel, SwatchCollection } from "./applause-layout"

interface RelatedProduct {
  name: string; slug: string; cover_image: string | null; description: string
}
interface Props {
  product: any
  related: RelatedProduct[]
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; linkedin: string }
}

const IMG = "/hunter-douglas/provenance"

/* ─── Lightbox ─── */
function Lightbox({ src, caption, onClose }: { src: string; caption?: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl z-10">&times;</button>
      <div className="relative max-w-full max-h-[90vh]">
        <img src={src} alt="" className="max-w-full max-h-[90vh] object-contain" />
        {caption && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded px-3 py-2 max-w-xs text-right">
            <p className="text-white/90 text-sm whitespace-pre-line leading-snug">{caption}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

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

function ScenePairBlock({ scene, index, onImg }: {
  scene: { image: string; text: string; label: string }; index: number; onImg: (s: string) => void
}) {
  const reverse = index % 2 !== 0
  return (
    <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-6`}>
      <div className="flex-[3] cursor-zoom-in rounded-lg overflow-hidden relative" onClick={() => onImg(`${IMG}/${scene.image}`)}>
        <img src={`${IMG}/${scene.image}`} alt="" className="w-full h-auto" loading="lazy" />
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

function CardGrid({ title, cols, cards, onImg }: { title: string; cols: number; cards: CardItem[]; onImg: (s: string) => void }) {
  const colCls = cols === 4 ? "md:grid-cols-4" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className={`grid grid-cols-2 ${colCls} gap-x-6 gap-y-8`}>
        {cards.map((c, i) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-3" onClick={() => onImg(`${IMG}/${c.image}`)}>
              <img src={`${IMG}/${c.image}`} alt={c.title} className="w-full h-auto" loading="lazy" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">{c.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonGrid({ title, cols, items, onImg }: { title: string; cols: number; items: ImageLabel[]; onImg: (s: string) => void }) {
  const colCls = cols >= 4 ? "sm:grid-cols-2 md:grid-cols-4" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className={`grid grid-cols-1 ${colCls} gap-6`}>
        {items.map((item, i) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-3" onClick={() => onImg(`${IMG}/${item.image}`)}>
              <img src={`${IMG}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
            </div>
            <p className="font-semibold text-sm text-gray-900 whitespace-pre-line">{item.label}</p>
            {item.sublabel && <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{item.sublabel}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function MountingGrid({ title, rows, onImg }: { title: string; rows: { items: any[] }[]; onImg: (s: string) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className="space-y-8">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-6">
            {row.items.map((item: any, i: number) => (
              <div key={i}>
                <div className="rounded-md overflow-hidden bg-gray-200 cursor-zoom-in mb-2" onClick={() => onImg(`${IMG}/${item.image}`)}>
                  <img src={`${IMG}/${item.image}`} alt={`${item.label} ${item.sublabel || ''}`} className="w-full h-auto" loading="lazy" />
                </div>
                <p className="text-xs font-semibold text-gray-900">{item.label}</p>
                {item.sublabel && <p className="text-xs text-gray-500 italic">{item.sublabel}</p>}
              </div>
            ))}
          </div>
        ))}
        <p className="text-[10px] text-gray-400">*When mounting depth is less than the headrail depth. See Reference Guide for all mounting specifications.</p>
      </div>
    </div>
  )
}

/* ── Mounting Profiles (two-column: Shades + Vertical Drapery) ── */
function MountingProfilesSection({ section, onImg }: { section: any; onImg: (s: string) => void }) {
  const Column = ({ data }: { data: any }) => (
    <div>
      <h4 className="text-xl font-light text-gray-700 mb-6">{data.heading}</h4>
      <div className="space-y-8">
        {(data.rows || []).map((row: any, ri: number) => (
          <div key={ri} className="grid grid-cols-3 gap-4">
            {row.items.map((item: any, i: number) => (
              <div key={i}>
                <div className="rounded-md overflow-hidden bg-gray-200 cursor-zoom-in mb-2" onClick={() => onImg(`${IMG}/${item.image}`)}>
                  <img src={`${IMG}/${item.image}`} alt={`${item.label} ${item.sublabel}`} className="w-full h-auto" loading="lazy" />
                </div>
                <p className="text-xs font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 italic">{item.sublabel}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

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
            <div className="aspect-square rounded-sm overflow-hidden border border-gray-200 mb-1">
              <img src={`${IMG}/${item.image}`} alt={item.label} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="text-[10px] text-gray-600 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Liner Section ── */
function LinerSection({ data, onImg }: { data: any; onImg: (s: string) => void }) {
  const ColorGrid = ({ colors }: { colors: { image: string; label: string }[] }) => (
    <div className="grid grid-cols-3 gap-3">
      {(colors || []).map((c: any, i: number) => (
        <div key={i} className="text-center">
          <div className="aspect-square rounded-sm overflow-hidden border border-gray-200 mb-1">
            <img src={`${IMG}/${c.image}`} alt={c.label} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <p className="text-[10px] text-gray-600 leading-tight whitespace-pre-line">{c.label}</p>
        </div>
      ))}
    </div>
  )

  const Half = ({ sec }: { sec: any }) => (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-2">{sec.title}</h3>
      <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-2xl">{sec.desc}</p>
      <div className="flex flex-col md:flex-row gap-8" style={{ marginBottom: '-150px' }}>
        <div className="flex-[3] grid grid-cols-2 gap-4">
          {(sec.topImages || []).map((img: any, i: number) => (
            <div key={i}>
              <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(`${IMG}/${img.image}`)}>
                <img src={`${IMG}/${img.image}`} alt={img.label} className="w-full h-auto" loading="lazy" />
              </div>
              {img.label && <p className="text-xs text-gray-600 whitespace-pre-line">{img.label}</p>}
            </div>
          ))}
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
          {sec.states.map((st: any, i: number) => (
            <div key={i}>
              <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(`${IMG}/${st.image}`)}>
                <img src={`${IMG}/${st.image}`} alt={st.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="text-xs text-gray-600 whitespace-pre-line">{st.label}</p>
            </div>
          ))}
        </div>
      )}
      {sec.opacityOptions?.length > 0 && (
        <div>
          <h4 className="text-xl font-light text-gray-800 mb-4">Liner Opacity Options</h4>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {sec.opacityOptions.map((opt: any, i: number) => (
              <div key={i}>
                <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(`${IMG}/${opt.image}`)}>
                  <img src={`${IMG}/${opt.image}`} alt={opt.title} className="w-full h-auto" loading="lazy" />
                </div>
                <p className="text-xs font-semibold text-gray-900">{opt.title}</p>
                <p className="text-[11px] text-gray-500">{opt.desc}</p>
              </div>
            ))}
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
function ShadeStylesSection({ section, onImg }: { section: any; onImg: (s: string) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{section.title}</h3>
      {/* Top row: product photos right-aligned */}
      <div className="flex justify-end gap-6 mb-6">
        {(section.topImages || []).map((img: any, i: number) => (
          <div key={i} className="cursor-zoom-in" onClick={() => onImg(`${IMG}/${img.image}`)}>
            <img src={`${IMG}/${img.image}`} alt="" className="h-80 w-auto object-contain" loading="lazy" />
          </div>
        ))}
      </div>
      {/* Line drawings with labels */}
      <div className="grid grid-cols-3 gap-6">
        {(section.lineDrawings || []).map((d: any, i: number) => (
          <div key={i}>
            <div className="cursor-zoom-in mb-2" onClick={() => onImg(`${IMG}/${d.image}`)}>
              <img src={`${IMG}/${d.image}`} alt={d.label} className="w-full h-auto" loading="lazy" />
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
function EdgeBandingSection({ data, onImg }: { data: any; onImg: (s: string) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{data.title}</h3>
      {/* Width comparison — horizontal */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {(data.widths || []).map((w: any, i: number) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(`${IMG}/${w.image}`)}>
              <img src={`${IMG}/${w.image}`} alt={w.label} className="w-full h-auto" loading="lazy" />
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
          <div key={i} className="flex items-center gap-3">
            <div className="w-20 h-12 rounded-sm overflow-hidden border border-gray-200 flex-shrink-0">
              <img src={`${IMG}/${c.image}`} alt={c.label} className="w-full h-full object-cover" loading="lazy" />
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

function GalleryGrid({ scenes, onImg }: { scenes: { image: string; text: string; label: string }[]; onImg: (s: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scenes.map((s, i) => (
        <div key={i} className={`group rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in relative ${i === 0 ? "md:col-span-2" : ""}`}
          onClick={() => onImg(`${IMG}/${s.image}`)}>
          <img src={`${IMG}/${s.image}`} alt="" className="w-full h-auto group-hover:opacity-95 transition-opacity" loading="lazy" />
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

function SwatchPanel({ collection, onImg }: { collection: SwatchCollection; onImg: (s: string, c?: string) => void }) {
  return (
    <Collapsible title={collection.name} badge={`${collection.swatches.length} colors`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {collection.swatches.map((sw, i) => {
          const caption = `${collection.name}\n${sw.colorName}\n${sw.specs.join("\n")}`
          return (
            <div key={i} className="cursor-zoom-in" onClick={() => onImg(`${IMG}/${sw.image}`, caption)}>
              <div className="rounded-md overflow-hidden bg-gray-50 border border-gray-200 hover:border-gray-400 transition-colors mb-2">
                <img src={`${IMG}/${sw.image}`} alt={sw.colorName} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="text-xs font-bold text-gray-800 tracking-wide">{sw.colorName}</p>
              {sw.specs.map((spec, j) => (
                <p key={j} className="text-[10px] text-gray-400 leading-tight">{spec}</p>
              ))}
            </div>
          )
        })}
      </div>
    </Collapsible>
  )
}

/* ═══ Section Router ═══ */
function SectionRenderer({ section, onImg }: { section: any; onImg: (s: string, c?: string) => void }) {
  switch (section.type) {
    case "scene-pair":
      return (
        <div className="space-y-12">
          {(section.scenes as { image: string; text: string; label: string }[]).map((scene, i) => (
            <ScenePairBlock key={i} scene={scene} index={i} onImg={onImg} />
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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxCaption, setLightboxCaption] = useState<string | undefined>(undefined)

  const openLightbox = (src: string, caption?: string) => { setLightboxSrc(src); setLightboxCaption(caption) }
  const closeLightbox = () => { setLightboxSrc(null); setLightboxCaption(undefined) }

  const L = provenanceLayout
  const nav = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Products", href: "/products" },
    { name: "Online Store", href: "/store" },
  ]
  const totalSwatches = L.swatchCollections.reduce((s, c) => s + c.swatches.length, 0)

  return (
    <main className="min-h-screen bg-white">
      <AnimatePresence>
        {lightboxSrc && <Lightbox src={lightboxSrc} caption={lightboxCaption} onClose={closeLightbox} />}
      </AnimatePresence>

      {/* ─── Hero ─── */}
      <section className="relative w-full overflow-hidden">
        <img src={`${IMG}/${L.heroImage}`} alt={L.name} className="w-full h-auto" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        <div className="absolute top-8 left-8 z-20">
          <Link href="/"><h1 className="text-xl md:text-2xl font-light tracking-[0.2em] text-white drop-shadow-lg hover:text-gray-300 transition-colors">ANGEL DRAPERY, INC</h1></Link>
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
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">{L.name}</h2>
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
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <img src={`/hunter-douglas/${r.slug}/${r.cover_image}`} alt={r.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
              <a href={footer.linkedin} className="text-blue-700 hover:text-blue-800"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
            </div>
            <div className="text-center text-sm text-gray-600">{footer.copyright}</div>
          </div>
        </div>
      </footer>
    </main>
  )
}
