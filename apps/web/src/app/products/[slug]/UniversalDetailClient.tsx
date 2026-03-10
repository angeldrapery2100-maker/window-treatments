'use client'

import { CDN_BASE } from '@/lib/cdn'

import { useState } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductLayout, SectionLayout, CardItem, ImageLabel, SwatchCollection, ControlSystemPanel, SceneRow } from './types'

interface RelatedProduct {
  name: string; slug: string; cover_image: string | null; description: string
}
interface Props {
  layout: ProductLayout
  product: any
  related: RelatedProduct[]
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; linkedin: string }
}

/* ─── Lightbox ─── */
function Lightbox({ src, caption, chipSrc, onClose }: { src: string; caption?: string; chipSrc?: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl z-10">✕</button>
      <div className="relative max-w-full max-h-[90vh]">
        <img src={src} alt="" className="max-w-full max-h-[90vh] object-contain" />
        {chipSrc && (
          <div className="absolute bottom-4 left-4 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-sm overflow-hidden border-2 border-white shadow-lg">
            <img src={chipSrc} alt="Fabric detail" className="w-full h-full object-cover" />
          </div>
        )}
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
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-400 text-lg">▾</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══ Helpers ═══ */

/** Extract width×height from filename like page005_img01_1955x1505.jpeg */
function parseDims(filename: string): { w: number; h: number } | null {
  const m = filename.match(/_(\d+)x(\d+)\.\w+$/)
  return m ? { w: +m[1], h: +m[2] } : null
}

/** Returns true if image is landscape or square (width >= height) */
function isLandscape(filename: string): boolean {
  const d = parseDims(filename)
  return !d || d.w >= d.h
}

/** Split array into chunks of given size */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

/* ═══ Section Renderers ═══ */

function ScenePairSection({ scenes, imgBase, onImg }: { scenes: { image: string; text: string; label: string }[]; imgBase: string; onImg: (s: string) => void }) {
  /* Filter out portrait/vertical images */
  const filtered = scenes.filter(s => isLandscape(s.image))

  return (
    <div className="space-y-8">
      {filtered.map((scene, i) => {
        const dir = i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
        return (
          <div key={i} className={`flex flex-col ${dir} rounded-lg overflow-hidden`}>
            {/* Image: 4/5 width on desktop, natural aspect ratio */}
            <div className="md:flex-[4] relative cursor-zoom-in overflow-hidden flex items-center justify-center" onClick={() => onImg(`${imgBase}/${scene.image}`)}>
              <img src={`${imgBase}/${scene.image}`} alt="" className="w-full h-auto object-contain" loading="lazy" />
              {scene.label && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
                  <p className="text-[10px] text-white/80 whitespace-pre-line leading-relaxed">{scene.label}</p>
                </div>
              )}
            </div>
            {/* Text: 1/5 width on desktop, stacks below on mobile */}
            <div className="md:flex-[1] flex items-center justify-center p-6 md:p-8">
              {scene.text && <p className="text-base md:text-lg font-light text-gray-700 leading-relaxed">{scene.text}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Alustra-style scene rows with textSide */
function AlustraSceneSection({ scenes, imgBase, onImg }: { scenes: SceneRow[]; imgBase: string; onImg: (s: string) => void }) {
  const filtered = scenes.filter(s => isLandscape(s.image))
  return (
    <div className="space-y-8">
      {filtered.map((scene, i) => {
        const dir = scene.textSide === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'
        return (
          <div key={i} className={`flex flex-col ${dir} rounded-lg overflow-hidden`}>
            <div className="md:flex-[4] relative cursor-zoom-in overflow-hidden flex items-center justify-center" onClick={() => onImg(`${imgBase}/${scene.image}`)}>
              <img src={`${imgBase}/${scene.image}`} alt="" className="w-full h-auto object-contain" loading="lazy" />
              {scene.label && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
                  <p className="text-[10px] text-white/80 whitespace-pre-line leading-relaxed">{scene.label}</p>
                </div>
              )}
            </div>
            <div className="md:flex-[1] flex items-center justify-center p-6 md:p-8">
              {scene.text && <p className="text-base md:text-lg font-light text-gray-700 leading-relaxed">{scene.text}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CardGridSection({ title, cols, cards, imgBase, onImg }: { title: string; cols: number; cards: CardItem[]; imgBase: string; onImg: (s: string) => void }) {
  /* Auto-split cards into 2:1 proportioned chunks (2 rows per chunk) */
  const rowsPerChunk = 2
  const itemsPerChunk = cols * rowsPerChunk
  const chunks = chunk(cards, itemsPerChunk)
  const colClass = cols === 4 ? 'md:grid-cols-4' : cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'

  return (
    <div className="space-y-10">
      {chunks.map((chunkCards, ci) => (
        <div key={ci}>
          {ci === 0 && <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>}
          <div className={`grid grid-cols-2 ${colClass} gap-x-6 gap-y-8`} style={{ gridTemplateRows: 'auto auto auto' }}>
            {chunkCards.map((card, i) => (
              <div key={i} className="grid" style={{ gridRow: 'span 3', gridTemplateRows: 'subgrid' }}>
                <div className="rounded-md overflow-hidden cursor-zoom-in flex items-end"
                  onClick={() => onImg(`${imgBase}/${card.image}`)}>
                  <img src={`${imgBase}/${card.image}`} alt={card.title} className="w-full h-auto" loading="lazy" />
                </div>
                <h4 className="font-semibold text-sm text-gray-900 mt-3">{card.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ComparisonGridSection({ title, cols, items, imgBase, onImg }: { title: string; cols: number; items: ImageLabel[]; imgBase: string; onImg: (s: string) => void }) {
  /* Auto-split items into 2:1 proportioned chunks (2 rows per chunk) */
  const rowsPerChunk = 2
  const itemsPerChunk = cols * rowsPerChunk
  const chunks = chunk(items, itemsPerChunk)
  const colClass = cols === 6 ? 'sm:grid-cols-3 md:grid-cols-6' : cols === 5 ? 'sm:grid-cols-3 md:grid-cols-5' : cols === 4 ? 'sm:grid-cols-2 md:grid-cols-4' : cols === 2 ? 'sm:grid-cols-2' : cols === 1 ? '' : 'sm:grid-cols-3'
  const baseGridCols = cols === 1 ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className="space-y-10">
      {chunks.map((chunkItems, ci) => (
        <div key={ci}>
          {ci === 0 && <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>}
          {ci > 0 && <h4 className="text-xl font-light text-gray-600 mb-6">{title} (cont.)</h4>}
          <div className={`grid ${baseGridCols} ${colClass} gap-6 ${cols === 1 ? 'max-w-xl mx-auto' : ''}`}>
            {chunkItems.map((item, i) => {
              const portrait = !isLandscape(item.image)
              return (
                <div key={i} className={portrait ? 'text-center' : ''}>
                  <div className={`rounded-md overflow-hidden cursor-zoom-in mb-3 ${portrait ? 'max-h-[360px]' : ''}`}
                    onClick={() => onImg(`${imgBase}/${item.image}`)}>
                    <img src={`${imgBase}/${item.image}`} alt={item.label} className={`w-full ${portrait ? 'max-h-[360px] object-contain mx-auto' : 'h-auto'}`} loading="lazy" />
                  </div>
                  <p className="font-semibold text-sm text-gray-900 whitespace-pre-line">{item.label}</p>
                  {item.sublabel && <p className="text-xs text-gray-500 mt-0.5">{item.sublabel}</p>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function MountingGridSection({ title, rows, imgBase, onImg }: { title: string; rows: { label?: string; items: ImageLabel[] }[]; imgBase: string; onImg: (s: string) => void }) {
  const maxCols = Math.max(...rows.map(r => r.items.length))
  const colClass = maxCols >= 5 ? 'md:grid-cols-5' : maxCols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className="space-y-8">
        {rows.map((row, ri) => (
          <div key={ri}>
            {row.label && <h4 className="font-semibold text-base text-gray-800 mb-3">{row.label}</h4>}
            <div className={`grid grid-cols-2 ${colClass} gap-4`}>
              {row.items.map((item, i) => (
                <div key={i}>
                  <div className="rounded-md overflow-hidden cursor-zoom-in mb-2"
                    onClick={() => onImg(`${imgBase}/${item.image}`)}>
                    <img src={`${imgBase}/${item.image}`} alt={item.label} className="w-full h-auto object-contain" loading="lazy" />
                  </div>
                  <p className="text-[11px] font-semibold text-gray-700 whitespace-pre-line leading-tight">{item.label}</p>
                  {item.sublabel && <p className="text-[10px] text-gray-500">{item.sublabel}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CellSizeSection({ title, brandLabel, items, imgBase, onImg }: { title: string; brandLabel: string; items: ImageLabel[]; imgBase: string; onImg: (s: string) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-3xl font-light text-gray-800">{title}</h3>
        <p className="text-sm text-gray-400 whitespace-pre-line text-right">{brandLabel}</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {items.map((item, i) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden cursor-zoom-in mb-2"
              onClick={() => onImg(`${imgBase}/${item.image}`)}>
              <img src={`${imgBase}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
            </div>
            <p className="font-semibold text-sm text-gray-900">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function HardwareColorsSection({ title, brandLabel, items, imgBase }: { title: string; brandLabel: string; items: ImageLabel[]; imgBase: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-3xl font-light text-gray-800">{title}</h3>
        <p className="text-sm text-gray-400 whitespace-pre-line text-right">{brandLabel}</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <div className="aspect-square rounded-sm overflow-hidden border border-gray-200 mb-1 flex items-center justify-center">
              <img src={`${imgBase}/${item.image}`} alt={item.label} className="max-w-full max-h-full object-contain" loading="lazy" />
            </div>
            <p className="text-[10px] text-gray-600 leading-tight">{item.label}</p>
            {(item as any).sublabel && <p className="text-[9px] text-gray-400 leading-tight">{(item as any).sublabel}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function SwatchCollectionSection({ collection, imgBase, onImg }: { collection: SwatchCollection; imgBase: string; onImg: (s: string, caption?: string, chipSrc?: string) => void }) {
  return (
    <Collapsible title={collection.name} badge={`${collection.swatches.length} colors`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {collection.swatches.map((sw, i) => {
          const caption = `${collection.name}\n${sw.colorName}\n${sw.specs.join('\n')}`
          const chipSrc = (sw as any).chip ? `${imgBase}/${(sw as any).chip}` : undefined
          return (
            <div key={i} className="cursor-zoom-in" onClick={() => onImg(`${imgBase}/${sw.image}`, caption, chipSrc)}>
              <div className="relative rounded-md overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors mb-2 aspect-square">
                <img src={`${imgBase}/${sw.image}`} alt={sw.colorName} className="w-[200%] h-auto origin-top-left" loading="lazy" />
                {(sw as any).chip && (
                  <div className="absolute bottom-1.5 left-1.5 w-[28%] h-[28%] rounded-sm overflow-hidden border-2 border-white shadow-md">
                    <img src={`${imgBase}/${(sw as any).chip}`} alt={`${sw.colorName} fabric detail`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
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

function ControlSystemsSection({ panels, sceneImage, sceneLabel, imgBase, onImg }: {
  panels: ControlSystemPanel[]; sceneImage: string | null; sceneLabel: string; imgBase: string; onImg: (s: string) => void
}) {
  const scenePortrait = sceneImage ? !isLandscape(sceneImage) : false
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{sceneLabel || 'Operating Systems'}</h3>
      <div className="flex flex-col md:flex-row rounded-lg overflow-hidden">
        {/* Scene image side */}
        {sceneImage && (
          <div className={`md:flex-[1] relative cursor-zoom-in overflow-hidden flex items-center justify-center ${scenePortrait ? 'md:max-h-[600px]' : ''}`}
            onClick={() => onImg(`${imgBase}/${sceneImage}`)}>
            <img src={`${imgBase}/${sceneImage}`} alt={sceneLabel} className={`object-contain ${scenePortrait ? 'h-full w-auto max-h-[600px]' : 'w-full h-auto'}`} loading="lazy" />
          </div>
        )}
        {/* Operating system panels side */}
        {sceneImage ? (
          <div className="md:flex-[1] p-6 md:p-8 space-y-8 flex flex-col justify-center">
            {panels.map((panel, pi) => (
              <div key={pi}>
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {panel.image && (
                    <div className="shrink-0 cursor-zoom-in" onClick={() => onImg(`${imgBase}/${panel.image}`)}>
                      <img src={`${imgBase}/${panel.image}`} alt={panel.title} className="w-32 h-auto rounded-md object-contain" loading="lazy" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900 mb-3">{panel.title}</h4>
                    {panel.features?.map((f, i) => (
                      <div key={i} className="flex gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                        <div>
                          {f.title !== panel.title && <p className="font-semibold text-sm text-gray-900">{f.title}</p>}
                          <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                    {panel.items?.map((item, i) => (
                      <div key={i} className="flex gap-4 items-start mb-3">
                        <div className="w-16 shrink-0 cursor-zoom-in rounded-md overflow-hidden"
                          onClick={(e) => { e.stopPropagation(); onImg(`${imgBase}/${item.image}`) }}>
                          <img src={`${imgBase}/${item.image}`} alt={item.title} className="w-full h-auto object-contain" loading="lazy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                    {panel.footnote && <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{panel.footnote}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full space-y-8">
            {/* Panels with features: show image + features side by side */}
            {panels.filter(p => p.features).map((panel, pi) => (
              <div key={pi} className="bg-white rounded-lg p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {panel.image && (
                    <div className="shrink-0 cursor-zoom-in" onClick={() => onImg(`${imgBase}/${panel.image}`)}>
                      <img src={`${imgBase}/${panel.image}`} alt={panel.title} className="w-40 h-auto rounded-md object-contain" loading="lazy" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900 mb-3">{panel.title}</h4>
                    {panel.features?.map((f, i) => (
                      <div key={i} className="flex gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                        <div>
                          {f.title !== panel.title && <p className="font-semibold text-sm text-gray-900">{f.title}</p>}
                          <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                    {panel.footnote && <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{panel.footnote}</p>}
                  </div>
                </div>
              </div>
            ))}
            {/* Panels with items: render items in a single row */}
            {panels.filter(p => p.items).map((panel, pi) => {
              const itemCount = panel.items?.length || 0
              const itemColClass = itemCount >= 4 ? 'md:grid-cols-4' : itemCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
              return (
                <div key={pi}>
                  <h4 className="font-semibold text-lg text-gray-900 mb-4">{panel.title}</h4>
                  <div className={`grid grid-cols-2 ${itemColClass} gap-4`}>
                    {panel.items?.map((item, i) => (
                      <div key={i} className="bg-white rounded-lg p-4 text-center">
                        <div className="cursor-zoom-in rounded-md overflow-hidden mb-3 flex justify-center"
                          onClick={() => onImg(`${imgBase}/${item.image}`)}>
                          <img src={`${imgBase}/${item.image}`} alt={item.title} className="h-72 w-auto object-contain" loading="lazy" />
                        </div>
                        <p className="font-semibold text-sm text-gray-900 mb-1">{item.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══ Control-Systems Pair (two operating-system groups side-by-side, like PDF page 36) ═══ */
function ControlSystemsPairSection({ groups, imgBase, onImg }: {
  groups: { title: string; sceneImage: string; panels: ControlSystemPanel[] }[]; imgBase: string; onImg: (s: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {groups.map((group, gi) => {
        /* Determine grid: top row = scene + first N panels, bottom row = remaining panels */
        const topPanels = group.panels.slice(0, 2)
        const bottomPanels = group.panels.slice(2)
        const bottomColsClass = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5'][bottomPanels.length] || 'grid-cols-3'
        return (
          <div key={gi} className="rounded-lg overflow-hidden p-5">
            {/* Group title */}
            <h3 className="text-xl font-light text-gray-800 mb-4 leading-snug">{group.title}</h3>
            {/* Top row: scene image + first 2 panels */}
            <div className="flex gap-4 mb-4">
              {group.sceneImage && (
                <div className="flex-1 cursor-zoom-in rounded-md overflow-hidden" onClick={() => onImg(`${imgBase}/${group.sceneImage}`)}>
                  <img src={`${imgBase}/${group.sceneImage}`} alt={group.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              {topPanels.map((panel, pi) => (
                <div key={pi} className="flex-1 flex flex-col items-center text-center">
                  {panel.image && (
                    <div className="cursor-zoom-in rounded-md overflow-hidden mb-2 w-full aspect-square flex items-center justify-center" onClick={() => onImg(`${imgBase}/${panel.image}`)}>
                      <img src={`${imgBase}/${panel.image}`} alt={panel.title} className="max-w-full max-h-full object-contain" loading="lazy" />
                    </div>
                  )}
                  <p className="font-semibold text-xs text-gray-900">{panel.title}</p>
                  {panel.features?.map((f, fi) => (
                    <p key={fi} className="text-[10px] text-gray-500 leading-relaxed mt-0.5">{f.desc}</p>
                  ))}
                </div>
              ))}
            </div>
            {/* Bottom row: remaining panels */}
            {bottomPanels.length > 0 && (
              <div className={`grid ${bottomColsClass} gap-4`}>
                {bottomPanels.map((panel, pi) => (
                  <div key={pi} className="flex flex-col items-center text-center">
                    {panel.image && (
                      <div className="cursor-zoom-in rounded-md overflow-hidden mb-2 w-full aspect-[4/3] flex items-center justify-center" onClick={() => onImg(`${imgBase}/${panel.image}`)}>
                        <img src={`${imgBase}/${panel.image}`} alt={panel.title} className="max-w-full max-h-full object-contain" loading="lazy" />
                      </div>
                    )}
                    <p className="font-semibold text-xs text-gray-900">{panel.title}</p>
                    {panel.features?.map((f, fi) => (
                      <p key={fi} className="text-[10px] text-gray-500 leading-relaxed mt-0.5">{f.desc}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function GallerySection({ scenes, imgBase, onImg }: { scenes: { image: string; text: string; label: string }[]; imgBase: string; onImg: (s: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scenes.map((scene, i) => (
        <div key={i} className={`group rounded-lg overflow-hidden cursor-zoom-in relative ${i === 0 ? 'md:col-span-2' : ''}`}
          onClick={() => onImg(`${imgBase}/${scene.image}`)}>
          <img src={`${imgBase}/${scene.image}`} alt="" className="w-full h-auto group-hover:opacity-95 transition-opacity" loading="lazy" />
          {(scene.text || scene.label) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              {scene.text && <p className="text-white/90 text-sm leading-relaxed">{scene.text}</p>}
              <p className="text-white/60 text-xs mt-1 whitespace-pre-line">{scene.label}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Product-specific section renderers ── */

function ShadeStylesSection({ section, imgBase, onImg }: { section: any; imgBase: string; onImg: (s: string) => void }) {
  const topImg = (section.topImages || [])[0]
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{section.title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: scene image (2/3) */}
        {topImg && (
          <div className="md:col-span-2">
            <div className="relative cursor-zoom-in rounded-lg overflow-hidden" onClick={() => onImg(`${imgBase}/${topImg.image}`)}>
              <img src={`${imgBase}/${topImg.image}`} alt={topImg.label || ''} className="w-full h-auto" loading="lazy" />
              {topImg.label && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-16">
                  <p className="text-white font-light text-lg">{topImg.label}</p>
                </div>
              )}
            </div>
            {topImg.desc && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{topImg.desc}</p>}
          </div>
        )}
        {/* Right: line drawings (1/3) */}
        <div className="space-y-6">
          {(section.lineDrawings || []).map((d: any, i: number) => (
            <div key={i}>
              <div className="cursor-zoom-in mb-2 rounded-md overflow-hidden" onClick={() => onImg(`${imgBase}/${d.image}`)}>
                <img src={`${imgBase}/${d.image}`} alt={d.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="font-semibold text-sm text-gray-900">{d.label}</p>
              {d.desc && <p className="text-xs text-gray-500 mt-1 leading-relaxed italic">{d.desc}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MountingProfilesSection({ section, imgBase, onImg }: { section: any; imgBase: string; onImg: (s: string) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-4">{section.title}</h3>
      {section.description && <p className="text-sm text-gray-600 mb-8 leading-relaxed">{section.description}</p>}
      <div className="space-y-8">
        {(section.topTreatments || []).map((t: any, i: number) => (
          <div key={i} className="border border-gray-100 rounded-lg p-5">
            <h4 className="font-semibold text-base text-gray-900 mb-2">{t.title}</h4>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">{t.desc}</p>
            <div className="flex gap-4">
              {t.insideMount && (
                <div className="flex-1">
                  <div className="cursor-zoom-in rounded-md overflow-hidden mb-2" onClick={() => onImg(`${imgBase}/${t.insideMount}`)}>
                    <img src={`${imgBase}/${t.insideMount}`} alt="Inside Mount" className="w-full h-auto" loading="lazy" />
                  </div>
                  <p className="text-[10px] text-gray-500 text-center">Inside Mount</p>
                </div>
              )}
              {t.outsideMount && (
                <div className="flex-1">
                  <div className="cursor-zoom-in rounded-md overflow-hidden mb-2" onClick={() => onImg(`${imgBase}/${t.outsideMount}`)}>
                    <img src={`${imgBase}/${t.outsideMount}`} alt="Outside Mount" className="w-full h-auto" loading="lazy" />
                  </div>
                  <p className="text-[10px] text-gray-500 text-center">Outside Mount</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {section.bottomBar && (
          <div className="flex gap-6 items-start">
            <div className="w-32 cursor-zoom-in" onClick={() => onImg(`${imgBase}/${section.bottomBar.image}`)}>
              <img src={`${imgBase}/${section.bottomBar.image}`} alt="" className="w-full h-auto rounded-md" loading="lazy" />
            </div>
            <p className="text-sm text-gray-600 flex-1">{section.bottomBar.desc}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ReverseRollSection({ section, imgBase, onImg }: { section: any; imgBase: string; onImg: (s: string) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{section.title}</h3>
      <div className="grid grid-cols-2 gap-6 mb-6">
        {(section.items || []).map((item: any, i: number) => (
          <div key={i}>
            <div className="cursor-zoom-in rounded-md overflow-hidden mb-2" onClick={() => onImg(`${imgBase}/${item.image}`)}>
              <img src={`${imgBase}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
            </div>
            <p className="font-semibold text-sm text-gray-900">{item.label}</p>
            {item.desc && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>}
          </div>
        ))}
      </div>
      {(section.variations || []).length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-4">
          {section.variations.map((v: any, i: number) => (
            <div key={i} className="cursor-zoom-in rounded-md overflow-hidden" onClick={() => onImg(`${imgBase}/${v.image}`)}>
              <img src={`${imgBase}/${v.image}`} alt={v.label} className="w-full h-auto" loading="lazy" />
            </div>
          ))}
        </div>
      )}
      {section.variationNote && <p className="text-[10px] text-gray-400 italic leading-relaxed">{section.variationNote}</p>}
    </div>
  )
}

function EdgeBandingSection({ data, imgBase, onImg }: { data: any; imgBase: string; onImg: (s: string) => void }) {
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{data.title}</h3>
      <div className="grid grid-cols-2 gap-6 mb-6">
        {(data.widths || []).map((w: any, i: number) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden cursor-zoom-in mb-2" onClick={() => onImg(`${imgBase}/${w.image}`)}>
              <img src={`${imgBase}/${w.image}`} alt={w.label} className="w-full h-auto" loading="lazy" />
            </div>
            <p className="font-semibold text-sm text-gray-900 text-center">{w.label}</p>
            {w.sublabel && <p className="text-xs text-gray-500 text-center italic">{w.sublabel}</p>}
          </div>
        ))}
      </div>
      {data.desc && <p className="text-sm text-gray-600 leading-relaxed mb-8 italic">{data.desc}</p>}
      <div className={`grid gap-3 ${(data.colors || []).length >= 8 ? 'grid-cols-4 sm:grid-cols-8' : 'grid-cols-2 gap-x-8 gap-y-3'}`}>
        {(data.colors || []).map((c: any, i: number) => (
          (data.colors || []).length >= 8 ? (
            <div key={i} className="text-center">
              <div className="rounded-sm overflow-hidden border border-gray-200 cursor-zoom-in mb-1.5 aspect-square" onClick={() => onImg(`${imgBase}/${c.image}`)}>
                <img src={`${imgBase}/${c.image}`} alt={c.label} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-[11px] text-gray-700 leading-tight">{c.label}</p>
            </div>
          ) : (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 h-12 rounded-sm overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                <img src={`${imgBase}/${c.image}`} alt={c.label} className="max-w-full max-h-full object-contain" loading="lazy" />
              </div>
              <p className="text-sm text-gray-700">{c.label}</p>
            </div>
          )
        ))}
      </div>
      {data.footnote && <p className="text-[10px] text-gray-400 mt-4 italic">{data.footnote}</p>}
    </div>
  )
}

/** Duette-specific: PowerView and Operating Systems row layout */
function DuetteOperatingRowSection({ title, items, imgBase, onImg }: { title: string; items: ImageLabel[]; imgBase: string; onImg: (s: string) => void }) {
  // PowerView items at top, then horizontal divider, then operating systems
  const pvItems = items.filter(it => it.label.toLowerCase().includes('powerview') || it.label.toLowerCase().includes('automation'))
  const osItems = items.filter(it => !pvItems.includes(it))
  const top = pvItems.length > 0 ? pvItems : items.slice(0, Math.ceil(items.length / 2))
  const bottom = pvItems.length > 0 ? osItems : items.slice(Math.ceil(items.length / 2))

  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      {top.length > 0 && (
        <div className={`grid grid-cols-${Math.min(top.length, 4)} gap-4 mb-8`}>
          {top.map((item, i) => (
            <div key={i}>
              <div className="rounded-md overflow-hidden cursor-zoom-in mb-2" onClick={() => onImg(`${imgBase}/${item.image}`)}>
                <img src={`${imgBase}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="font-semibold text-xs text-gray-900">{item.label}</p>
              {item.sublabel && <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{item.sublabel}</p>}
            </div>
          ))}
        </div>
      )}
      {bottom.length > 0 && (
        <div className={`grid grid-cols-${Math.min(bottom.length, 4)} gap-4`}>
          {bottom.map((item, i) => (
            <div key={i}>
              <div className="rounded-md overflow-hidden cursor-zoom-in mb-2" onClick={() => onImg(`${imgBase}/${item.image}`)}>
                <img src={`${imgBase}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="font-semibold text-xs text-gray-900">{item.label}</p>
              {item.sublabel && <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{item.sublabel}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══ Mixed Grid (main cols + stacked column on right) ═══ */
function MixedGridSection({ title, cols, items, stackedItems, imgBase, onImg }: {
  title: string; cols: number; items: ImageLabel[]; stackedItems: ImageLabel[]; imgBase: string; onImg: (s: string) => void
}) {
  const totalCols = cols + 1 // e.g. 3 main + 1 stacked = 4
  const gridClass = totalCols === 4 ? 'md:grid-cols-4' : totalCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-5'
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className={`grid grid-cols-2 ${gridClass} gap-6`}>
        {/* Main items (each takes 1 column) */}
        {items.map((item, i) => {
          const portrait = !isLandscape(item.image)
          return (
            <div key={`main-${i}`}>
              <div className={`rounded-md overflow-hidden cursor-zoom-in mb-3 ${portrait ? 'max-h-[360px]' : ''}`}
                onClick={() => onImg(`${imgBase}/${item.image}`)}>
                <img src={`${imgBase}/${item.image}`} alt={item.label}
                  className={`w-full ${portrait ? 'max-h-[360px] object-contain mx-auto' : 'h-auto'}`} loading="lazy" />
              </div>
              <p className="font-semibold text-sm text-gray-900">{item.label}</p>
              {item.sublabel && <p className="text-xs text-gray-500 mt-0.5">{item.sublabel}</p>}
            </div>
          )
        })}
        {/* Stacked items in last column */}
        <div className="flex flex-col gap-4">
          {stackedItems.map((item, i) => (
            <div key={`stacked-${i}`}>
              <div className="rounded-md overflow-hidden cursor-zoom-in mb-2"
                onClick={() => onImg(`${imgBase}/${item.image}`)}>
                <img src={`${imgBase}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="font-semibold text-sm text-gray-900">{item.label}</p>
              {item.sublabel && <p className="text-xs text-gray-500 mt-0.5">{item.sublabel}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══ Split-Scene (PDF spread style: big scene + detail grid) ═══ */
function SplitSceneSection({ title, sceneImage, sceneLabel, sceneSide, items, imgBase, onImg }: {
  title: string; sceneImage: string; sceneLabel?: string; sceneSide: 'left' | 'right'; items: ImageLabel[]; imgBase: string; onImg: (s: string, caption?: string) => void
}) {
  const isRight = sceneSide === 'right'
  const flexDir = isRight ? 'md:flex-row' : 'md:flex-row-reverse'
  /* Detail grid: 1 col if ≤2 items, 2 cols if more */
  const gridCols = items.length <= 2 ? 'grid-cols-1' : 'grid-cols-2'
  /* Check if scene image is portrait (tall) */
  const scenePortrait = !isLandscape(sceneImage)
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className={`flex flex-col ${flexDir} rounded-lg overflow-hidden`}>
        {/* Detail items side */}
        <div className="md:flex-[1] p-4 flex items-center justify-center">
          <div className={`grid ${gridCols} gap-x-4 w-full`} style={{ gridTemplateRows: 'auto auto auto '.repeat(Math.ceil(items.length / (items.length <= 2 ? 1 : 2))).trim() }}>
            {items.map((item, i) => (
              <div key={i} className="grid cursor-zoom-in" style={{ gridRow: 'span 3', gridTemplateRows: 'subgrid' }} onClick={() => onImg(`${imgBase}/${item.image}`, item.label)}>
                <div className="rounded-md overflow-hidden flex items-end">
                  <img src={`${imgBase}/${item.image}`} alt={item.label} className="w-full h-auto object-contain" loading="lazy" />
                </div>
                <p className="font-semibold text-xs text-gray-900 mt-2">{item.label}</p>
                <div>{(item.sublabel || item.desc) && <p className="text-[10px] text-gray-500 leading-relaxed">{item.sublabel || item.desc}</p>}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Scene image side — constrained to match the height of the detail side */}
        <div className="md:flex-[0.7] relative cursor-zoom-in overflow-hidden flex items-end justify-center rounded-lg" onClick={() => onImg(`${imgBase}/${sceneImage}`, sceneLabel)}>
          <img src={`${imgBase}/${sceneImage}`} alt={sceneLabel || title} className="w-full h-full object-cover" loading="lazy" />
          {sceneLabel && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
              <p className="text-[10px] text-white/80 whitespace-pre-line leading-relaxed">{sceneLabel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══ Liner Section (Independent Operable + Attached) ═══ */
function LinerColorChips({ colors, imgBase, onImg }: { colors: { image: string; label: string }[]; imgBase: string; onImg: (s: string, caption?: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((c, i) => (
        <div key={i} className="text-center cursor-zoom-in" onClick={() => onImg(`${imgBase}/${c.image}`, c.label)}>
          <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors mb-1">
            <img src={`${imgBase}/${c.image}`} alt={c.label} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <p className="text-[9px] text-gray-600 leading-tight max-w-[70px]">{c.label}</p>
        </div>
      ))}
    </div>
  )
}

function LinerSection({ section, imgBase, onImg }: { section: any; imgBase: string; onImg: (s: string, caption?: string) => void }) {
  const { independent, attached } = section
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{section.title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Independent Operable Liner */}
        {independent && (
          <div className="space-y-5">
            <h4 className="text-lg font-semibold text-gray-800">{independent.title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{independent.desc}</p>
            {independent.photos && (
              <div className="flex gap-3">
                {independent.photos.map((p: any, i: number) => (
                  <div key={i} className="flex-1 cursor-zoom-in text-center" onClick={() => onImg(`${imgBase}/${p.image}`, p.label)}>
                    <div className="rounded-md overflow-hidden mb-1">
                      <img src={`${imgBase}/${p.image}`} alt={p.label} className="w-full h-auto object-contain" loading="lazy" />
                    </div>
                    <p className="text-[9px] text-gray-500 whitespace-pre-line leading-tight">{p.label}</p>
                  </div>
                ))}
              </div>
            )}
            {independent.duo && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{independent.duo.title}</p>
                <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">{independent.duo.desc}</p>
                <LinerColorChips colors={independent.duo.colors} imgBase={imgBase} onImg={onImg} />
              </div>
            )}
            {independent.mono && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{independent.mono.title}</p>
                <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">{independent.mono.desc}</p>
                <LinerColorChips colors={independent.mono.colors} imgBase={imgBase} onImg={onImg} />
              </div>
            )}
          </div>
        )}
        {/* Attached Liner */}
        {attached && (
          <div className="space-y-5">
            <h4 className="text-lg font-semibold text-gray-800">{attached.title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{attached.desc}</p>
            {attached.photos && (
              <div className="flex gap-3">
                {attached.photos.map((p: any, i: number) => (
                  <div key={i} className="flex-1 cursor-zoom-in text-center" onClick={() => onImg(`${imgBase}/${p.image}`, p.label)}>
                    <div className="rounded-md overflow-hidden mb-1">
                      <img src={`${imgBase}/${p.image}`} alt={p.label} className="w-full h-auto object-contain" loading="lazy" />
                    </div>
                    <p className="text-[9px] text-gray-500 whitespace-pre-line leading-tight">{p.label}</p>
                  </div>
                ))}
              </div>
            )}
            {attached.duo && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{attached.duo.title}</p>
                <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">{attached.duo.desc}</p>
                <LinerColorChips colors={attached.duo.colors} imgBase={imgBase} onImg={onImg} />
              </div>
            )}
            {attached.mono && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{attached.mono.title}</p>
                <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">{attached.mono.desc}</p>
                <LinerColorChips colors={attached.mono.colors} imgBase={imgBase} onImg={onImg} />
              </div>
            )}
            {attached.opacity && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">{attached.opacity.title}</p>
                <div className="flex gap-4">
                  {attached.opacity.items.map((item: any, i: number) => (
                    <div key={i} className="flex-1 cursor-zoom-in text-center" onClick={() => onImg(`${imgBase}/${item.image}`, item.label)}>
                      <div className="rounded-md overflow-hidden mb-1">
                        <img src={`${imgBase}/${item.image}`} alt={item.label} className="w-full h-auto object-contain" loading="lazy" />
                      </div>
                      <p className="text-[9px] font-semibold text-gray-700">{item.label}</p>
                      <p className="text-[9px] text-gray-500 leading-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══ Section Router ═══ */
function SectionRenderer({ section, imgBase, onImg }: { section: SectionLayout; imgBase: string; onImg: (s: string, caption?: string) => void }) {
  switch (section.type) {
    case 'scene-pair':
      return <ScenePairSection scenes={section.scenes} imgBase={imgBase} onImg={onImg} />
    case 'card-grid':
      return <CardGridSection title={section.title} cols={section.cols} cards={section.cards} imgBase={imgBase} onImg={onImg} />
    case 'comparison-grid':
    case 'image-label-grid':
      return <ComparisonGridSection title={section.title} cols={section.cols} items={section.items} imgBase={imgBase} onImg={onImg} />
    case 'mixed-grid':
      return <MixedGridSection title={section.title} cols={section.cols} items={section.items} stackedItems={section.stackedItems} imgBase={imgBase} onImg={onImg} />
    case 'mounting-grid':
      return <MountingGridSection title={section.title} rows={section.rows} imgBase={imgBase} onImg={onImg} />
    case 'cell-size':
      return <CellSizeSection title={section.title} brandLabel={section.brandLabel} items={section.items} imgBase={imgBase} onImg={onImg} />
    case 'hardware-colors':
      return <HardwareColorsSection title={section.title} brandLabel={section.brandLabel} items={section.items} imgBase={imgBase} />
    case 'control-systems':
      return <ControlSystemsSection panels={section.panels} sceneImage={section.sceneImage} sceneLabel={section.sceneLabel} imgBase={imgBase} onImg={onImg} />
    case 'control-systems-pair':
      return <ControlSystemsPairSection groups={section.groups} imgBase={imgBase} onImg={onImg} />
    case 'shade-styles':
      return <ShadeStylesSection section={section} imgBase={imgBase} onImg={onImg} />
    case 'mounting-profiles':
      return <MountingProfilesSection section={section} imgBase={imgBase} onImg={onImg} />
    case 'reverse-roll':
      return <ReverseRollSection section={section} imgBase={imgBase} onImg={onImg} />
    case 'edge-banding':
      return <EdgeBandingSection data={section} imgBase={imgBase} onImg={onImg} />
    case 'liner':
      return <LinerSection section={section} imgBase={imgBase} onImg={onImg} />
    case 'split-scene':
      return <SplitSceneSection title={section.title} sceneImage={section.sceneImage} sceneLabel={section.sceneLabel} sceneSide={section.sceneSide} items={section.items} imgBase={imgBase} onImg={onImg} />
    default:
      return null
  }
}

/* ═══════════ MAIN ═══════════ */
export default function UniversalDetailClient({ layout, product, related, footer }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxCaption, setLightboxCaption] = useState<string | undefined>(undefined)
  const [lightboxChip, setLightboxChip] = useState<string | undefined>(undefined)

  const openLightbox = (src: string, caption?: string, chipSrc?: string) => {
    setLightboxSrc(src)
    setLightboxCaption(caption)
    setLightboxChip(chipSrc)
  }
  const closeLightbox = () => {
    setLightboxSrc(null)
    setLightboxCaption(undefined)
    setLightboxChip(undefined)
  }

  const imgBase = `${CDN_BASE}/hunter-douglas/${layout.slug}`
  const totalSwatches = layout.swatchCollections.reduce((sum, c) => sum + c.swatches.length, 0)

  return (
    <main className="min-h-screen bg-white">
      <AnimatePresence>
        {lightboxSrc && <Lightbox src={lightboxSrc} caption={lightboxCaption} chipSrc={lightboxChip} onClose={closeLightbox} />}
      </AnimatePresence>

      {/* ─── Hero (2:1) ─── */}
      <section className="relative w-full overflow-hidden aspect-[2/1]">
        <img src={`${imgBase}/${layout.heroImage}`} alt={layout.name} className="absolute inset-0 w-full h-full object-contain bg-[#f5f4f0]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        <SiteNav activePage="Products" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
              <Link href="/products" className="hover:text-white/80 transition-colors">Products</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-white/80 transition-colors">Hunter Douglas</Link>
              <span>/</span>
              <span className="text-white/80">{layout.name}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">{layout.name}</h2>
            <p className="text-white/70 text-base md:text-lg max-w-2xl">{layout.description}</p>
          </div>
        </div>

        <div className="absolute bottom-4 right-8 text-right">
          <p className="text-[10px] text-white/50 whitespace-pre-line">{layout.heroLabel}</p>
        </div>
      </section>

      {/* ═══ Standalone Scenes (Alustra-style) ═══ */}
      {layout.scenes && layout.scenes.length > 0 && (
        <section className="w-full py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <AlustraSceneSection scenes={layout.scenes} imgBase={imgBase} onImg={openLightbox} />
          </div>
        </section>
      )}

      {/* ═══ Direct Sections ═══ */}
      {layout.sections.map((section, i) => (
        <section key={i} className={`w-full py-12 md:py-16 ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafaf8]'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionRenderer section={section} imgBase={imgBase} onImg={openLightbox} />
          </div>
        </section>
      ))}

      {/* ═══ Collapsible Sections ═══ */}
      <section className="w-full py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">

          {layout.gallery.length > 0 && (
            <Collapsible title="Photo Gallery" badge={`${layout.gallery.length} photos`}>
              <GallerySection scenes={layout.gallery} imgBase={imgBase} onImg={openLightbox} />
            </Collapsible>
          )}

          {layout.cellSize && (
            <Collapsible title="Cell Size and Opacity">
              <SectionRenderer section={layout.cellSize} imgBase={imgBase} onImg={openLightbox} />
            </Collapsible>
          )}
          {layout.edgeBanding && (
            <Collapsible title={(layout.edgeBanding as any)?.title || 'Edge Banding'}>
              <EdgeBandingSection data={layout.edgeBanding} imgBase={imgBase} onImg={openLightbox} />
            </Collapsible>
          )}

          {layout.hardwareColors && (
            <Collapsible title={(layout.hardwareColors as any)?.title || 'Hardware Color Guide'}>
              <SectionRenderer section={layout.hardwareColors} imgBase={imgBase} onImg={openLightbox} />
            </Collapsible>
          )}

          {layout.decorativeTapes && (
            <Collapsible title={(layout.decorativeTapes as any)?.title || 'Decorative Tapes'}>
              <SectionRenderer section={layout.decorativeTapes} imgBase={imgBase} onImg={openLightbox} />
            </Collapsible>
          )}

          {layout.liner && (layout.liner as any)?.groups && (
            <Collapsible title={(layout.liner as any)?.title || 'Liner Colors'}>
              <div className="space-y-6">
                {(layout.liner as any).groups.map((group: any, gi: number) => (
                  <div key={gi}>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">{group.heading}</h4>
                    {group.subgroups.map((sg: any, si: number) => (
                      <div key={si} className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-1">{sg.title}</p>
                        <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">{sg.desc}</p>
                        <div className="flex flex-wrap gap-3">
                          {sg.colors.map((c: any, ci: number) => (
                            <div key={ci} className="text-center cursor-zoom-in" onClick={() => openLightbox(`${imgBase}/${c.image}`, c.label)}>
                              <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors mb-1">
                                <img src={`${imgBase}/${c.image}`} alt={c.label} className="w-full h-full object-cover" loading="lazy" />
                              </div>
                              <p className="text-[9px] text-gray-600 leading-tight max-w-[70px]">{c.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Collapsible>
          )}

          {layout.swatchCollections.length > 0 && (() => {
            /* Group collections by opacity series (e.g. "Sheer", "Semi-Sheer") extracted from name after " — " */
            const seriesMap = new Map<string, SwatchCollection[]>()
            layout.swatchCollections.forEach((c) => {
              const dash = c.name.lastIndexOf('\u2014')
              const series = dash >= 0 ? c.name.slice(dash + 1).trim() : 'Other'
              if (!seriesMap.has(series)) seriesMap.set(series, [])
              seriesMap.get(series)!.push(c)
            })
            const seriesGroups = Array.from(seriesMap.entries())
            const hasMultipleSeries = seriesGroups.length > 1

            return (
              <>
                <div className="pt-4 pb-2">
                  <h3 className="text-2xl font-light text-gray-900">Fabric & Color Options</h3>
                  <p className="text-sm text-gray-500 mt-1">{totalSwatches} colors across {layout.swatchCollections.length} collections</p>
                </div>
                {hasMultipleSeries ? seriesGroups.map(([series, collections]) => {
                  const seriesColors = collections.reduce((s, c) => s + c.swatches.length, 0)
                  return (
                    <Collapsible key={series} title={`${series}  (${collections.length} collections, ${seriesColors} colors)`}>
                      {collections.map((collection) => (
                        <SwatchCollectionSection key={collection.name} collection={collection} imgBase={imgBase} onImg={openLightbox} />
                      ))}
                    </Collapsible>
                  )
                }) : layout.swatchCollections.map((collection) => (
                  <SwatchCollectionSection key={collection.name} collection={collection} imgBase={imgBase} onImg={openLightbox} />
                ))}
              </>
            )
          })()}
        </div>
      </section>

      {/* ─── Related ─── */}
      {related.length > 0 && (
        <section className="w-full bg-white py-16 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-light text-gray-900 mb-8 text-center">Explore More Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link key={item.slug} href={`/products/${item.slug}`}
                  className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
                  <div className="aspect-[4/3] overflow-hidden bg-[#f0ede8]">
                    {item.cover_image ? (
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <img src={`${CDN_BASE}/hunter-douglas/${item.slug}/${item.cover_image}`} alt={item.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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

      {/* ─── CTA ─── */}
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

      {/* Footer */}
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
