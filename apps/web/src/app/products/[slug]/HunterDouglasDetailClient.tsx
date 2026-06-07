'use client'

import { CDN_BASE } from '@/lib/cdn'

import Image from 'next/image'
import { useState } from 'react'
import ImageLightbox, { type LightboxImage } from '@/components/ImageLightbox'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Types ─── */
interface PageSection {
  page: number
  category: string
  text: string
  images: { filename: string; width: number; height: number }[]
}

interface Swatch {
  image: string
  width: number
  height: number
  color_name: string
  specs: string[]
  fabric_collection?: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  cover_image: string | null
  benefits: PageSection[]
  control_options: PageSection[]
  design_options: PageSection[]
  mounting: PageSection[]
  product_details: PageSection[]
  gallery: PageSection[]
  vane_sizes: PageSection[]
  hardware_colors: PageSection[]
  fabric_swatches: Record<string, Swatch[]>
  stats: Record<string, number>
}

interface RelatedProduct {
  name: string
  slug: string
  cover_image: string | null
  description: string
}

interface Props {
  product: Product
  related: RelatedProduct[]
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; instagram: string }
}


/* ─── Collapsible Section ─── */
function CollapsibleSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-light text-gray-900">{title}</span>
          {badge && <span className="text-xs text-gray-400 bg-gray-200 px-2.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-400 text-lg">▾</motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
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

/* ═══════════════════════════════════════════════════════════════
   PDF-Faithful Page Renderer
   
   核心原则：保持每页图片原始比例，文字紧贴图片下方
   根据图片数量和尺寸比例自动选择最接近PDF的布局
   ═══════════════════════════════════════════════════════════════ */
function PageRenderer({
  section,
  imgBase,
  onImageClick,
}: {
  section: PageSection
  imgBase: string
  onImageClick: (images: LightboxImage[], index: number) => void
}) {
  const { images, text } = section
  const sectionImgs = images.map(img => ({ src: `${imgBase}/${img.filename}` }))
  const textLines = text.split('\n').filter(l => l.trim() && !/^\d+$/.test(l.trim()) && !l.trim().startsWith('FPO'))

  // 分离标题行和描述行
  const parseLines = () => {
    const parsed: { type: 'heading' | 'label' | 'body'; text: string }[] = []
    for (const line of textLines) {
      const t = line.trim()
      if (!t) continue
      // 面料/颜色/操作系统标注行
      if (/^(Fabric|Product|Color|Operating System|Deck)\s/.test(t) || /^(Sheer|Semi-Sheer|Semi-Opaque)\s+\|/.test(t)) {
        parsed.push({ type: 'label', text: t })
      }
      // 短行 + 标题风格
      else if (t.length < 50 && /^[A-Z]/.test(t) && !t.includes('.')) {
        parsed.push({ type: 'heading', text: t })
      }
      else {
        parsed.push({ type: 'body', text: t })
      }
    }
    return parsed
  }

  const parsed = parseLines()

  // 将图片按行配对（模拟PDF的2列布局）
  // 计算每张图片在2列布局中应该占的宽度比例
  const getImageWeight = (img: { width: number; height: number }) => {
    // 宽图占满 or 大图占满
    if (img.width > 2000) return 2
    if (img.width > 1400 && img.height < img.width * 0.8) return 2
    return 1
  }

  // 将文字和图片配对显示
  // 策略：先尝试把文字和图片配对（Benefits风格），否则自然流排列
  
  // === Benefits 风格：多张相似尺寸图 + 结构化标题+描述 ===
  const allSimilarSize = images.length >= 3 && images.every(img => {
    const ref = images[0]
    return Math.abs(img.width - ref.width) < ref.width * 0.3 &&
           Math.abs(img.height - ref.height) < ref.height * 0.3
  })
  
  const headings = parsed.filter(p => p.type === 'heading')
  const bodies = parsed.filter(p => p.type === 'body')
  
  // Benefits 模式：图+标题+描述 的卡片网格
  if (allSimilarSize && images.length >= 3 && headings.length >= 2) {
    // 配对：每张图配一个标题和描述
    const cards: { img: typeof images[0]; heading: string; desc: string }[] = []
    let hIdx = 0, bIdx = 0

    for (let i = 0; i < images.length; i++) {
      cards.push({
        img: images[i],
        heading: hIdx < headings.length ? headings[hIdx++].text : '',
        desc: bIdx < bodies.length ? bodies[bIdx++].text : '',
      })
    }

    const cols = images.length <= 4 ? 2 : 3
    return (
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-8`}>
        {cards.map((card, i) => (
          <div key={i}>
            <div
              className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-3"
              onClick={() => onImageClick(sectionImgs, i)}
            >
              <img
                src={`${imgBase}/${card.img.filename}`}
                alt={card.heading}
                className="w-full h-auto hover:opacity-90 transition-opacity"
                loading="lazy"
              />
            </div>
            {card.heading && <p className="font-medium text-gray-900 text-sm mb-1">{card.heading}</p>}
            {card.desc && <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>}
          </div>
        ))}
      </div>
    )
  }

  // === Opacity / Light Control 模式：几张对比图 + 标签 ===
  const hasOpacityLabels = parsed.some(p => /Sheer|Opaque|Opacity|Light|Privacy/.test(p.text))
  if (hasOpacityLabels && images.length >= 2 && images.length <= 4) {
    const labels = parsed.filter(p => p.type === 'label' || p.type === 'heading')
    return (
      <div>
        {/* 标题 */}
        {parsed.find(p => p.type === 'heading' && p.text.length > 10) && (
          <h4 className="text-xl font-light text-gray-900 mb-6">
            {parsed.find(p => p.type === 'heading' && p.text.length > 10)?.text}
          </h4>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {images.map((img, i) => (
            <div key={i}>
              <div
                className="rounded-md overflow-hidden bg-gray-100 cursor-zoom-in mb-2"
                onClick={() => onImageClick(sectionImgs, i)}
              >
                <img
                  src={`${imgBase}/${img.filename}`}
                  alt={i < labels.length ? labels[i].text : 'Hunter Douglas shade'}
                  className="w-full h-auto hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              </div>
              {i < labels.length && (
                <p className="text-sm text-gray-700 font-medium">{labels[i].text}</p>
              )}
            </div>
          ))}
        </div>
        {/* 底部标注 */}
        {parsed.filter(p => p.type === 'body').length > 0 && (
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            {parsed.filter(p => p.type === 'body').map((p, i) => (
              <p key={i}>{p.text}</p>
            ))}
          </div>
        )}
      </div>
    )
  }

  // === 默认模式：按图片宽度比例自然排列 ===
  // 模拟PDF双栏 - 图片保持原始比例，按宽度占位
  return (
    <div>
      {/* 文字区域（标题和描述） */}
      {parsed.length > 0 && (
        <div className="mb-4">
          {parsed.map((p, i) => {
            if (p.type === 'heading') {
              return <h4 key={i} className="text-lg font-medium text-gray-900 mb-2">{p.text}</h4>
            }
            if (p.type === 'label') {
              return <p key={i} className="text-xs text-gray-400 mt-1">{p.text}</p>
            }
            return <p key={i} className="text-sm text-gray-600 leading-relaxed mb-1">{p.text}</p>
          })}
        </div>
      )}
      {/* 图片区域 - 用 flex wrap 模拟PDF的自然排列 */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => {
            const weight = getImageWeight(img)
            const widthClass = weight === 2 ? 'w-full' : images.length === 1 ? 'w-full' : 'flex-1 min-w-[200px] max-w-[calc(50%-6px)]'
            return (
              <div
                key={i}
                className={`${widthClass} rounded-md overflow-hidden bg-gray-100 cursor-zoom-in`}
                onClick={() => onImageClick(sectionImgs, i)}
              >
                <img
                  src={`${imgBase}/${img.filename}`}
                  alt={parsed.find(p => p.type === 'heading')?.text || 'Hunter Douglas shade'}
                  className="w-full h-auto hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Section Group Renderer ─── */
function SectionGroup({
  sections,
  imgBase,
  onImageClick,
}: {
  sections: PageSection[]
  imgBase: string
  onImageClick: (images: LightboxImage[], index: number) => void
}) {
  if (sections.length === 0) return null
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <PageRenderer
          key={section.page}
          section={section}
          imgBase={imgBase}
          onImageClick={onImageClick}
        />
      ))}
    </div>
  )
}

/* ─── Gallery Grid (场景图) ─── */
function GalleryGrid({
  sections,
  imgBase,
  onImageClick,
}: {
  sections: PageSection[]
  imgBase: string
  onImageClick: (images: LightboxImage[], index: number) => void
}) {
  const sectionImgs = sections.map(section => {
    const mainImg = section.images.find(img => img.width > 1200) || section.images[0]
    return { src: `${imgBase}/${mainImg.filename}` }
  })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((section, idx) => {
        const mainImg = section.images.find(img => img.width > 1200) || section.images[0]
        if (!mainImg) return null
        const textLines = section.text.split('\n').filter(l => l.trim() && !/^\d+$/.test(l.trim()))

        return (
          <div
            key={section.page}
            className={`group rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in relative ${
              idx === 0 ? 'md:col-span-2' : ''
            }`}
            onClick={() => onImageClick(sectionImgs, idx)}
          >
            <img
              src={`${imgBase}/${mainImg.filename}`}
              alt={textLines[0] || 'Hunter Douglas shade photo'}
              className="w-full h-auto group-hover:opacity-95 transition-opacity"
              loading="lazy"
            />
            {textLines.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                {textLines.slice(0, 2).map((line, i) => (
                  <p key={i} className="text-white/90 text-xs md:text-sm leading-relaxed">{line}</p>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Swatch Collection ─── */
function SwatchCollection({
  name,
  swatches,
  slug,
  defaultOpen = false,
  onSwatchClick,
}: {
  name: string
  swatches: Swatch[]
  slug: string
  defaultOpen?: boolean
  onSwatchClick: (images: LightboxImage[], index: number) => void
}) {
  const sectionImgs = swatches.map(swatch => ({ src: `${CDN_BASE}/hunter-douglas/${slug}/${swatch.image}` }))
  return (
    <CollapsibleSection title={name} badge={`${swatches.length} colors`} defaultOpen={defaultOpen}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {swatches.map((swatch, i) => (
          <div key={i} className="text-center cursor-zoom-in" onClick={() => onSwatchClick(sectionImgs, i)}>
            <div className="rounded-md overflow-hidden bg-gray-50 mb-2 border border-gray-200 hover:border-gray-400 transition-colors">
              <img
                src={`${CDN_BASE}/hunter-douglas/${slug}/${swatch.image}`}
                alt={swatch.color_name}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <p className="text-xs font-medium text-gray-800 uppercase tracking-wide">{swatch.color_name}</p>
            {swatch.specs.length > 0 && (
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{swatch.specs[0]}</p>
            )}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  )
}

/* ═══════════════════════ Main Component ═══════════════════════ */
export default function HunterDouglasDetailClient({ product, related, footer }: Props) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [lbImages, setLbImages] = useState<LightboxImage[]>([])
  const [lbIndex, setLbIndex] = useState(-1)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Products', href: '/products' },
    { name: 'Online Store', href: '/store' },
  ]

  const imgBase = `${CDN_BASE}/hunter-douglas/${product.slug}`
  const swatchEntries = Object.entries(product.fabric_swatches || {})
  const totalSwatches = swatchEntries.reduce((sum, [, v]) => sum + v.length, 0)

  // 收集所有直接展示的section，按页码排序
  const directSections = [
    ...product.benefits.map(s => ({ ...s, _type: 'benefits' as const })),
    ...product.product_details.map(s => ({ ...s, _type: 'details' as const })),
    ...product.control_options.map(s => ({ ...s, _type: 'control' as const })),
    ...product.design_options.map(s => ({ ...s, _type: 'design' as const })),
    ...product.mounting.map(s => ({ ...s, _type: 'mounting' as const })),
  ].sort((a, b) => a.page - b.page)

  const openLightbox = (images: LightboxImage[], index: number) => {
    setLbImages(images)
    setLbIndex(index)
  }
  const closeLightbox = () => setLbIndex(-1)

  // 按类型分组，保持组内页码顺序，组间按首页排序
  type SectionType = 'benefits' | 'details' | 'control' | 'design' | 'mounting'
  const sectionLabels: Record<SectionType, string> = {
    benefits: 'Benefits',
    details: 'Product Details',
    control: 'Control Options & Operating Systems',
    design: 'Design Options',
    mounting: 'Mounting & Framing Profiles',
  }

  // 提取有序的section组
  const sectionGroups: { type: SectionType; label: string; sections: PageSection[] }[] = []
  const seen = new Set<SectionType>()
  for (const s of directSections) {
    if (!seen.has(s._type)) {
      seen.add(s._type)
      sectionGroups.push({
        type: s._type,
        label: sectionLabels[s._type],
        sections: directSections.filter(ds => ds._type === s._type),
      })
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <AnimatePresence>
        {lbIndex >= 0 && <ImageLightbox images={lbImages} currentIndex={lbIndex} onNav={setLbIndex} onClose={closeLightbox} />}
      </AnimatePresence>

      {/* ─── Hero ─── */}
      <section className="relative w-full h-[55vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          {product.cover_image ? (
            <Image src={`${imgBase}/${product.cover_image}`} alt={product.name} fill sizes="100vw" priority className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a2332] to-[#2a3a4e]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </div>

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
                      ? 'bg-white/20 text-white border-white/50'
                      : 'bg-transparent text-white/80 border-white/20 hover:bg-white/20 hover:border-white/50'
                  }`}
                >{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
              <Link href="/products" className="hover:text-white/80 transition-colors">Products</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-white/80 transition-colors">Hunter Douglas</Link>
              <span>/</span>
              <span className="text-white/80">{product.name}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-light text-white mb-3">{product.name}</h1>
            <p className="text-white/70 text-base md:text-lg max-w-2xl">{product.description}</p>
          </div>
        </div>
      </section>

      {/* ═══ Direct Display Sections (按PDF原始顺序) ═══ */}
      {sectionGroups.map((group, gi) => (
        <section key={group.type} className={`w-full py-12 md:py-16 ${gi % 2 === 0 ? 'bg-white' : 'bg-[#fafaf8]'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-10">{group.label}</h3>
            <SectionGroup sections={group.sections} imgBase={imgBase} onImageClick={openLightbox} />
          </div>
        </section>
      ))}

      {/* ═══ Collapsible Sections ═══ */}
      <section className="w-full bg-[#f5f4f0] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">

          {product.gallery.length > 0 && (
            <CollapsibleSection title="Photo Gallery" badge={`${product.gallery.length} photos`}>
              <GalleryGrid sections={product.gallery} imgBase={imgBase} onImageClick={openLightbox} />
            </CollapsibleSection>
          )}

          {product.vane_sizes.length > 0 && (
            <CollapsibleSection title="Vane / Slat Sizes">
              <SectionGroup sections={product.vane_sizes} imgBase={imgBase} onImageClick={openLightbox} />
            </CollapsibleSection>
          )}

          {product.hardware_colors.length > 0 && (
            <CollapsibleSection title="Hardware Color Guide">
              <SectionGroup sections={product.hardware_colors} imgBase={imgBase} onImageClick={openLightbox} />
            </CollapsibleSection>
          )}

          {swatchEntries.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="text-2xl font-light text-gray-900">Fabric & Color Options</h3>
                <p className="text-sm text-gray-500 mt-1">{totalSwatches} colors across {swatchEntries.length} collection{swatchEntries.length > 1 ? 's' : ''}</p>
              </div>
              {swatchEntries.map(([name, swatches], i) => (
                <SwatchCollection key={name} name={name} swatches={swatches} slug={product.slug} defaultOpen={i === 0} onSwatchClick={openLightbox} />
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
                          fill sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-500" />
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
          <h2 className="text-3xl font-light mb-4">Interested in {product.name}?</h2>
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
