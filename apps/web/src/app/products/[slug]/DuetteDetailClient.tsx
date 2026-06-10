'use client'

import Image from 'next/image'
import { CDN_BASE } from '@/lib/cdn'

import { useState } from 'react'
import Link from 'next/link'
import { m as motion, AnimatePresence } from 'framer-motion'
import { buildDuetteLayout } from './duette-layout'
import type { SectionLayout, CardItem, ImageLabel, SwatchCollection, ControlSystemPanel } from './applause-layout'
import ImageLightbox, { type LightboxImage } from '@/components/ImageLightbox'

interface RelatedProduct {
  name: string; slug: string; cover_image: string | null; description: string
}
interface Props {
  product: any
  related: RelatedProduct[]
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; instagram: string }
}

const IMG_BASE = `${CDN_BASE}/hunter-douglas/duette`

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

/* ═══ Section Renderers - 精确还原PDF布局 ═══ */

/** 场景图对 - 交替左右布局，图片上叠加面料标注（与PDF一致） */
function ScenePairSection({ scenes, onImg }: { scenes: { image: string; text: string; label: string }[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = scenes.map(s => ({ src: `${IMG_BASE}/${s.image}` }))
  return (
    <div className="space-y-12">
      {scenes.map((scene, i) => (
        <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6`}>
          <div className="flex-[3] cursor-zoom-in rounded-lg overflow-hidden relative" onClick={() => onImg(sectionImgs, i)}>
            <img src={`${IMG_BASE}/${scene.image}`} alt={scene.label || scene.text || 'Duette honeycomb shade scene'} className="w-full h-auto" loading="lazy" />
            {scene.label && (
              <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-sm px-3 py-2 rounded max-w-[70%]">
                <p className="text-[11px] text-white/90 whitespace-pre-line leading-relaxed">{scene.label}</p>
              </div>
            )}
          </div>
          <div className="flex-[1] flex flex-col justify-center">
            {scene.text && <p className="text-xl md:text-2xl font-light text-gray-800 leading-relaxed">{scene.text}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

/** 截图3/6/7: 卡片网格 - 图片+粗体标题+描述，PDF原版4列 */
function CardGridSection({ title, cols, cards, onImg }: { title: string; cols: number; cards: CardItem[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = cards.map(c => ({ src: `${IMG_BASE}/${c.image}` }))
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className={`grid grid-cols-2 ${cols === 4 ? 'md:grid-cols-4' : cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-x-6 gap-y-8`}>
        {cards.map((card, i) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-3"
              onClick={() => onImg(sectionImgs, i)}>
              <img src={`${IMG_BASE}/${card.image}`} alt={card.title} className="w-full h-auto" loading="lazy" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">{card.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 截图4/5: 对比网格 - 图片+粗体标签+描述 */
function ComparisonGridSection({ title, cols, items, onImg }: { title: string; cols: number; items: ImageLabel[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = items.map(item => ({ src: `${IMG_BASE}/${item.image}` }))
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className={`grid grid-cols-1 ${cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-6`}>
        {items.map((item, i) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-3"
              onClick={() => onImg(sectionImgs, i)}>
              <img src={`${IMG_BASE}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
            </div>
            <p className="font-semibold text-sm text-gray-900">{item.label}</p>
            {item.sublabel && <p className="text-xs text-gray-500 mt-0.5">{item.sublabel}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function PowerViewOperatingRowSection({ title, items, onImg }: { title: string; items: ImageLabel[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = items.map(item => ({ src: `${IMG_BASE}/${item.image}` }))
  const find = (key: string) => items.find((it) => it.label.toLowerCase().includes(key.toLowerCase()))
  const powerView = find('PowerView')
  const liteRise = find('LiteRise')
  const ultraGlide = find('UltraGlide')

  const features = [
    {
      title: 'Incredible Convenience',
      desc: 'Achieve your perfect light automatically—morning, noon and night',
    },
    {
      title: 'Effortless Control',
      desc: 'Compatible with voice assistants and many home automation systems*',
    },
    {
      title: 'Privacy and Security',
      desc: 'Schedule shades to move automatically, when you’re home or away',
    },
    {
      title: 'Energy Efficiency',
      desc: 'Program shades to be in the best positions to heat and cool your home',
    },
    {
      title: 'Child and Pet Safety',
      desc: 'Simple, cord-free operation',
    },
    {
      title: 'Flexible Power Options',
      desc: 'Choose from several power options, including a rechargeable battery, internal rechargeable battery and hardwiring capability',
    },
  ]

  const sideItems = [liteRise, ultraGlide].filter(Boolean) as ImageLabel[]

  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-5">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-[1.8fr_0.66fr_0.66fr] gap-4 items-stretch">
        <div className="md:col-span-1 h-full flex flex-col md:py-2">
          {powerView && (
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2 md:max-w-[45%] md:mx-auto" onClick={() => onImg(sectionImgs, items.indexOf(powerView))}>
              <img
                src={`${IMG_BASE}/${powerView.image}`}
                alt={powerView.label}
                className="w-full h-auto"
                loading="lazy"
                suppressHydrationWarning
              />
            </div>
          )}
          <div className="flex-1 flex flex-col justify-between md:max-w-[45%] md:mx-auto">
            <div className="space-y-1.5">
              {features.map((f) => (
                <div key={f.title}>
                  <p className="font-semibold text-[13px] leading-tight text-gray-800">{f.title}</p>
                  <p className="text-[11px] leading-snug text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {sideItems.map((item) => (
          <div key={item.label} className="h-full flex flex-col">
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(item))}>
              <img
                src={`${IMG_BASE}/${item.image}`}
                alt={item.label}
                className="w-full h-auto"
                loading="lazy"
                suppressHydrationWarning
              />
            </div>
            <div className="mt-auto">
              <p className="font-semibold text-sm text-gray-900">{item.label}</p>
              {item.sublabel && <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{item.sublabel}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DuetteOperatingSystemsSection({ items, onImg }: { items: ImageLabel[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = items.map(item => ({ src: `${IMG_BASE}/${item.image}` }))
  const find = (key: string) => items.find((it) => it.label.toLowerCase().includes(key.toLowerCase()))
  const ordered = (keys: string[]) => keys.map((k) => find(k)).filter(Boolean) as ImageLabel[]
  const liteRise = find('LiteRise')
  const ultraGlide = find('UltraGlide')

  const vertiglideMain = find('Vertiglide™')
  const vertiglideCards = ordered([
    'Vertiglide Duolite',
    'Traveling Center Stack',
    'Vertiglide Split Stack',
    'Left/Right Stack',
  ])
  const skyLift = find('SkyLift')
  const powerViewShapes = find('PowerView® Operable Specialty Shapes')
  const simplicitySkylight = find('Simplicity™ (Skylight/Manual)')

  if (liteRise || ultraGlide) {
    const simpleItems = [liteRise, ultraGlide].filter(Boolean) as ImageLabel[]
    return (
      <div>
        <h3 className="text-3xl font-light text-gray-800 mb-6">Operating Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {simpleItems.map((item, i) => (
            <div key={i}>
              <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(item))}>
                <img src={`${IMG_BASE}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="font-semibold text-sm text-gray-900">{item.label}</p>
              {item.sublabel && <p className="text-xs text-gray-500 mt-1">{item.sublabel}</p>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-3xl font-light text-gray-800 mb-6">Operating Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vertiglideMain && (
            <div className="md:col-span-1">
              <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(vertiglideMain))}>
                <img src={`${IMG_BASE}/${vertiglideMain.image}`} alt={vertiglideMain.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="font-semibold text-sm text-gray-900">{vertiglideMain.label}</p>
              {vertiglideMain.sublabel && <p className="text-xs text-gray-500 mt-1">{vertiglideMain.sublabel}</p>}
            </div>
          )}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {vertiglideCards.map((item, i) => (
              <div key={i}>
                <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(item))}>
                  <img src={`${IMG_BASE}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
                </div>
                <p className="font-semibold text-sm text-gray-900">{item.label}</p>
                {item.sublabel && <p className="text-xs text-gray-500 mt-1">{item.sublabel}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-2xl font-light text-gray-800 mb-5">Additional Operating Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="hidden md:block" />

          {powerViewShapes && (
            <div className="md:col-span-1">
              <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(powerViewShapes))}>
                <img src={`${IMG_BASE}/${powerViewShapes.image}`} alt={powerViewShapes.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="font-semibold text-sm text-gray-900">{powerViewShapes.label}</p>
              {powerViewShapes.sublabel && <p className="text-xs text-gray-500 mt-1">{powerViewShapes.sublabel}</p>}
            </div>
          )}

          <div className="space-y-6">
            {skyLift && (
              <div>
                <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(skyLift))}>
                  <img src={`${IMG_BASE}/${skyLift.image}`} alt={skyLift.label} className="w-full h-auto" loading="lazy" />
                </div>
                <p className="font-semibold text-sm text-gray-900">{skyLift.label}</p>
                {skyLift.sublabel && <p className="text-xs text-gray-500 mt-1">{skyLift.sublabel}</p>}
              </div>
            )}

            {simplicitySkylight && (
              <div>
                <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(simplicitySkylight))}>
                  <img src={`${IMG_BASE}/${simplicitySkylight.image}`} alt={simplicitySkylight.label} className="w-full h-auto" loading="lazy" />
                </div>
                <p className="font-semibold text-sm text-gray-900">{simplicitySkylight.label}</p>
                {simplicitySkylight.sublabel && <p className="text-xs text-gray-500 mt-1">{simplicitySkylight.sublabel}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DuetteMountingProfilesSection({ items, onImg }: { items: ImageLabel[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = items.map(item => ({ src: `${IMG_BASE}/${item.image}` }))
  const find = (key: string) => items.find((it) => it.label.toLowerCase().includes(key.toLowerCase()))
  const topGrid = [
    find('Inside Mount 3/4'),
    find('Outside Mount 3/4'),
    find('Inside Mount 1 1/4'),
    find('Outside Mount 1 1/4'),
  ].filter(Boolean) as ImageLabel[]

  const secondTop = [
    find('Partial Mount 3/4'),
    find('Vertiglide® Inside Mount'),
    find('Vertiglide® Outside Mount'),
  ].filter(Boolean) as ImageLabel[]

  const partial125 = find('Partial Mount 1 1/4')
  const valance1 = find('Grandover')
  const valance2 = find('Sydney Valance')

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div>
          <h3 className="text-5xl md:text-4xl font-light text-gray-600 leading-none">Mounting Profiles</h3>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          {topGrid.map((item, i) => (
            <div key={i}>
              <div className="rounded-md overflow-hidden bg-[#a3a8a4] cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(item))}>
                <img src={`${IMG_BASE}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="text-xs text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {secondTop.map((item, i) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-[#a3a8a4] cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(item))}>
              <img src={`${IMG_BASE}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
            </div>
            <p className="text-xs text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {partial125 && (
          <div>
            <div className="rounded-md overflow-hidden bg-[#a3a8a4] cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(partial125))}>
              <img src={`${IMG_BASE}/${partial125.image}`} alt={partial125.label} className="w-full h-auto" loading="lazy" />
            </div>
            <p className="text-xs text-gray-600">{partial125.label}</p>
          </div>
        )}

        <div className="md:col-span-2 space-y-4">
          {valance1 && (
            <div>
              <div className="rounded-md overflow-hidden bg-[#a3a8a4] cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(valance1))}>
                <img src={`${IMG_BASE}/${valance1.image}`} alt={valance1.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="text-xs text-gray-600">{valance1.label}</p>
            </div>
          )}
          {valance2 && (
            <div>
              <div className="rounded-md overflow-hidden bg-[#a3a8a4] cursor-zoom-in mb-2" onClick={() => onImg(sectionImgs, items.indexOf(valance2))}>
                <img src={`${IMG_BASE}/${valance2.image}`} alt={valance2.label} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="text-xs text-gray-600">{valance2.label}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AdditionalOperatingOptionsSection({ title, items, onImg }: { title: string; items: ImageLabel[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = items.map(item => ({ src: `${IMG_BASE}/${item.image}` }))
  const find = (key: string) => items.find((it) => it.label.toLowerCase().includes(key.toLowerCase()))

  const powerViewShapes = find('PowerView® Operable Specialty Shapes')
  const skyLift = find('SkyLift')
  const simplicity = find('Simplicity™**')
  const simplicityShapes = find('Simplicity™ (Specialty Shapes)')

  const vertiglideMain = find('Vertiglide™')
  const vertiglideDuolite = find('Vertiglide Duolite')
  const vertiglideSplit = find('Vertiglide Split Stack')
  const vertiglideTraveling = find('Vertiglide Traveling Center Stack')
  const vertiglideLeftRight = find('Left Stack or Right Stack')

  const renderCard = (item: ImageLabel, fillHeight = false) => (
    <div className={`flex flex-col ${fillHeight ? 'h-full' : ''}`}>
      <div
        className={`rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2 ${fillHeight ? 'flex-1 min-h-[220px]' : ''}`}
        onClick={() => onImg(sectionImgs, items.indexOf(item))}
      >
        <img src={`${IMG_BASE}/${item.image}`} alt={item.label} className={`w-full ${fillHeight ? 'h-full object-cover' : 'h-auto'}`} loading="lazy" />
      </div>
      <p className="font-semibold text-sm text-gray-900">{item.label}</p>
      {item.sublabel && <p className="text-xs text-gray-500 mt-1">{item.sublabel}</p>}
    </div>
  )

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-3xl font-light text-gray-800 mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div>{powerViewShapes && renderCard(powerViewShapes, true)}</div>
          <div className="flex flex-col gap-6 h-full">
            {skyLift && <div className="flex-1">{renderCard(skyLift, true)}</div>}
            {simplicity && <div className="flex-1">{renderCard(simplicity, true)}</div>}
          </div>
          <div>{simplicityShapes && renderCard(simplicityShapes, true)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div>{vertiglideMain && renderCard(vertiglideMain)}</div>
        <div className="space-y-6">
          {vertiglideDuolite && renderCard(vertiglideDuolite)}
          {vertiglideSplit && renderCard(vertiglideSplit)}
        </div>
        <div className="space-y-6">
          {vertiglideTraveling && renderCard(vertiglideTraveling)}
          {vertiglideLeftRight && renderCard(vertiglideLeftRight)}
        </div>
      </div>
    </div>
  )
}

/** 截图8: 安装方式网格 - 上排3个, 下排4个 */
function MountingGridSection({ title, rows, onImg }: { title: string; rows: { items: ImageLabel[] }[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = rows.flatMap(row => row.items.map(item => ({ src: `${IMG_BASE}/${item.image}` })))
  let globalIndex = 0
  return (
    <div>
      <h3 className="text-3xl font-light text-gray-800 mb-8">{title}</h3>
      <div className="space-y-8">
        {rows.map((row, ri) => (
          <div key={ri} className={`grid grid-cols-2 ${row.items.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-6`}>
            {row.items.map((item, i) => {
              const currentIndex = globalIndex
              globalIndex++
              return (
                <div key={i}>
                  <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2"
                    onClick={() => onImg(sectionImgs, currentIndex)}>
                    <img src={`${IMG_BASE}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
                  </div>
                  <p className="text-xs text-gray-600">{item.label}</p>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** 截图9: Cell Size - 2列对比 + 品牌标签 */
function CellSizeSection({ title, brandLabel, items, onImg }: { title: string; brandLabel: string; items: ImageLabel[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = items.map(item => ({ src: `${IMG_BASE}/${item.image}` }))
  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-3xl font-light text-gray-800">{title}</h3>
        <p className="text-sm text-gray-400 whitespace-pre-line text-right">{brandLabel}</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {items.map((item, i) => (
          <div key={i}>
            <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2"
              onClick={() => onImg(sectionImgs, i)}>
              <img src={`${IMG_BASE}/${item.image}`} alt={item.label} className="w-full h-auto" loading="lazy" />
            </div>
            <p className="font-semibold text-sm text-gray-900">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 截图10: Hardware Color Guide - 8列色块网格 */
function HardwareColorsSection({ title, brandLabel, items }: { title: string; brandLabel: string; items: ImageLabel[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-3xl font-light text-gray-800">{title}</h3>
        <p className="text-sm text-gray-400 whitespace-pre-line text-right">{brandLabel}</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <div className="relative aspect-square rounded-sm overflow-hidden border border-gray-200 mb-1">
              <Image src={`${IMG_BASE}/${item.image}`} alt={item.label} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <p className="text-[10px] text-gray-600 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 截图11-13: 色卡集合 - 按PDF格式：左右并排色卡，下方颜色名+代码 */
function SwatchCollectionSection({ collection, onImg }: { collection: SwatchCollection; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = collection.swatches.map((sw: any) => ({
    src: `${IMG_BASE}/${sw.image}`,
    caption: `${collection.name}\n${sw.colorName}\n${sw.specs.join('\n')}`
  }))
  return (
    <Collapsible title={collection.name} badge={`${collection.swatches.length} colors`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {collection.swatches.map((sw, i) => {
          return (
            <div key={i} className="cursor-zoom-in" onClick={() => onImg(sectionImgs, i)}>
              <div className="rounded-md overflow-hidden bg-gray-50 border border-gray-200 hover:border-gray-400 transition-colors mb-2">
                <img src={`${IMG_BASE}/${sw.image}`} alt={sw.colorName} className="w-full h-auto" loading="lazy" />
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

/** Page 18: PowerView Automation + Operating Systems */
function ControlSystemsSection({ panels, sceneImage, sceneLabel, onImg }: {
  panels: ControlSystemPanel[]; sceneImage: string; sceneLabel: string; onImg: (images: LightboxImage[], index: number) => void
}) {
  const leftPanel = panels[0]
  const rightPanel = panels[1]
  const sectionImgs: LightboxImage[] = [
    ...(leftPanel.image ? [{ src: `${IMG_BASE}/${leftPanel.image}` }] : []),
    ...(rightPanel.items?.map((item: any) => ({ src: `${IMG_BASE}/${item.image}` })) || [])
  ]
  return (
    <div className="space-y-10">
      {/* PowerView® Automation - 横向布局: 左图+右边features两列(左4右3) */}
      <div>
        <h3 className="text-3xl font-light text-gray-800 mb-5">{leftPanel.title}</h3>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {leftPanel.image && (
            <div className="shrink-0 cursor-zoom-in" onClick={() => onImg(sectionImgs, 0)}>
              <Image src={`${IMG_BASE}/${leftPanel.image}`} alt={leftPanel.title} width={144} height={144} className="w-36 h-auto rounded-md" loading="lazy" />
            </div>
          )}
          <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3">
            {leftPanel.features?.map((f, i) => (
              <div key={i} className="flex gap-3" style={{ gridColumn: i < 4 ? 1 : 2, gridRow: i < 4 ? i + 1 : i - 3 }}>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
            {leftPanel.footnote && (
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed col-span-2">{leftPanel.footnote}</p>
            )}
          </div>
        </div>
      </div>

      {/* Operating Systems - 横排，图片原始比例，文字在下方 */}
      <div>
        <h3 className="text-3xl font-light text-gray-800 mb-5">{rightPanel.title}</h3>
        <div className={`grid gap-4 ${(rightPanel.items?.length || 0) <= 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {rightPanel.items?.map((item, i) => (
            <div key={i}>
              <div className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2"
                onClick={() => onImg(sectionImgs, (leftPanel.image ? 1 : 0) + i)}>
                <img src={`${IMG_BASE}/${item.image}`} alt={item.title} className="w-full h-auto" loading="lazy" />
              </div>
              <p className="font-semibold text-xs text-gray-900">{item.title}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Gallery - 场景图可折叠 */
function GallerySection({ scenes, onImg }: { scenes: { image: string; text: string; label: string }[]; onImg: (images: LightboxImage[], index: number) => void }) {
  const sectionImgs: LightboxImage[] = scenes.map(s => ({ src: `${IMG_BASE}/${s.image}` }))
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scenes.map((scene, i) => (
        <div key={i} className={`group rounded-lg overflow-hidden bg-[#e5e7e2] cursor-zoom-in relative ${i === 0 ? 'md:col-span-2' : ''}`}
          onClick={() => onImg(sectionImgs, i)}>
          <div className={`relative w-full ${i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
            <Image
              src={`${IMG_BASE}/${scene.image}`}
              alt={scene.text || scene.label || 'Duette honeycomb shade photo'}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:opacity-95 transition-opacity"
              loading="eager"
              decoding="sync"
            />
          </div>
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

/* ═══ Section Router ═══ */
function SectionRenderer({ section, onImg }: { section: SectionLayout; onImg: (images: LightboxImage[], index: number) => void }) {
  switch (section.type) {
    case 'scene-pair':
      return <ScenePairSection scenes={section.scenes} onImg={onImg} />
    case 'card-grid':
      return <CardGridSection title={section.title} cols={section.cols} cards={section.cards} onImg={onImg} />
    case 'comparison-grid':
      if (section.title === 'Operating Systems') {
        return <DuetteOperatingSystemsSection items={section.items} onImg={onImg} />
      }
      if (section.title === 'PowerView and Operating Systems') {
        return <PowerViewOperatingRowSection title={section.title} items={section.items} onImg={onImg} />
      }
      if (section.title === 'Additional Operating Options') {
        return <AdditionalOperatingOptionsSection title={section.title} items={section.items} onImg={onImg} />
      }
      return <ComparisonGridSection title={section.title} cols={section.cols} items={section.items} onImg={onImg} />
    case 'image-label-grid':
      return <ComparisonGridSection title={section.title} cols={section.cols} items={section.items} onImg={onImg} />
    case 'mounting-grid':
      if (section.title === 'Mounting Profiles') {
        return <DuetteMountingProfilesSection items={section.rows.flatMap((r) => r.items)} onImg={onImg} />
      }
      return <MountingGridSection title={section.title} rows={section.rows} onImg={onImg} />
    case 'cell-size':
      return <CellSizeSection title={section.title} brandLabel={section.brandLabel} items={section.items} onImg={onImg} />
    case 'hardware-colors':
      return <HardwareColorsSection title={section.title} brandLabel={section.brandLabel} items={section.items} />
    case 'control-systems':
      return <ControlSystemsSection panels={section.panels} sceneImage={section.sceneImage} sceneLabel={section.sceneLabel} onImg={onImg} />
    default:
      return null
  }
}

/* ═══════════ MAIN ═══════════ */
export default function DuetteDetailClient({ product, related, footer }: Props) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [lbImages, setLbImages] = useState<LightboxImage[]>([])
  const [lbIndex, setLbIndex] = useState(-1)

  const layout = buildDuetteLayout(product as any)

  const openLightbox = (images: LightboxImage[], index: number) => {
    setLbImages(images)
    setLbIndex(index)
  }
  const closeLightbox = () => setLbIndex(-1)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Products', href: '/products' },
    { name: 'Online Store', href: '/store' },
  ]

  const totalSwatches = layout.swatchCollections.reduce((sum, c) => sum + c.swatches.length, 0)

  return (
    <main className="min-h-screen bg-white">
      <AnimatePresence>
        {lbIndex >= 0 && <ImageLightbox images={lbImages} currentIndex={lbIndex} onNav={setLbIndex} onClose={closeLightbox} />}
      </AnimatePresence>

      {/* ─── Hero ─── */}
      <section className="relative w-full overflow-hidden">
        <Image src={`${IMG_BASE}/${layout.heroImage}`} alt={layout.name} width={2000} height={1000} priority sizes="100vw" className="w-full h-auto" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Nav */}
        <div className="absolute top-8 left-8 z-20">
          <Link href="/" aria-label="Angel Drapery — home"><span className="block text-xl md:text-2xl font-light tracking-[0.2em] text-white drop-shadow-lg hover:text-gray-300 transition-colors">ANGEL DRAPERY, INC</span></Link>
        </div>
        <nav className="absolute top-8 right-8 z-20">
          <ul className="flex flex-wrap gap-3 justify-end">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href} onMouseEnter={() => setHoveredNav(item.name)} onMouseLeave={() => setHoveredNav(null)}
                  className={`block px-6 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 text-sm font-medium ${
                    hoveredNav === item.name || item.name === 'Products'
                      ? 'bg-white/20 text-white border-white/50' : 'bg-transparent text-white/80 border-white/20 hover:bg-white/20 hover:border-white/50'
                  }`}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
              <Link href="/products" className="hover:text-white/80 transition-colors">Products</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-white/80 transition-colors">Hunter Douglas</Link>
              <span>/</span>
              <span className="text-white/80">{layout.name}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-light text-white mb-3">{layout.name}</h1>
            <p className="text-white/70 text-base md:text-lg max-w-2xl">{layout.description}</p>
          </div>
        </div>

        {/* 右下角面料标注 */}
        <div className="absolute bottom-4 right-8 text-right">
          <p className="text-[10px] text-white/50 whitespace-pre-line">{layout.heroLabel}</p>
        </div>
      </section>

      {/* ═══ Direct Sections ═══ */}
      {layout.sections.map((section, i) => (
        <section key={i} className={`w-full py-12 md:py-16 ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafaf8]'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionRenderer section={section} onImg={openLightbox} />
          </div>
        </section>
      ))}

      {/* ═══ Collapsible Sections ═══ */}
      <section className="w-full bg-[#f5f4f0] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">

          {/* Photo Gallery */}
          {layout.gallery.length > 0 && (
            <Collapsible title="Photo Gallery" badge={`${layout.gallery.length} photos`}>
              <GallerySection scenes={layout.gallery} onImg={openLightbox} />
            </Collapsible>
          )}

          {/* Cell Size */}
          {layout.cellSize && (
            <Collapsible title="Cell Size and Construction">
              <SectionRenderer section={layout.cellSize} onImg={openLightbox} />
            </Collapsible>
          )}

          {/* Hardware Colors */}
          {layout.hardwareColors && (
            <Collapsible title="Hardware Color Guide">
              <SectionRenderer section={layout.hardwareColors} onImg={openLightbox} />
            </Collapsible>
          )}

          {/* Fabric Swatches */}
          {layout.swatchCollections.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="text-2xl font-light text-gray-900">Fabric & Color Options</h3>
                <p className="text-sm text-gray-500 mt-1">{totalSwatches} colors across {layout.swatchCollections.length} collections</p>
                <p className="text-xs text-gray-400 mt-1">Data Index: {layout.fieldMap.length} fields / {layout.imageMap.length} images</p>
              </div>
              {layout.swatchCollections.map((collection, i) => (
                <SwatchCollectionSection key={collection.name} collection={collection} onImg={openLightbox} />
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
              {related.map((item) => (
                <Link key={item.slug} href={`/products/${item.slug}`}
                  className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
                  <div className="aspect-[4/3] overflow-hidden bg-[#f0ede8]">
                    {item.cover_image ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <Image src={`${CDN_BASE}/hunter-douglas/${item.slug}/${item.cover_image}`} alt={item.name}
                          fill sizes="(max-width: 768px) 100vw, 25vw" className="object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
