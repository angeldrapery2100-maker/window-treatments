'use client'

import { CDN_BASE } from '@/lib/cdn'

import { useState } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { motion } from 'framer-motion'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  cover_image: string | null
  // DB catalog fields (present when useDbCatalog=true)
  href?:     string   // full link URL (overrides /products/{slug})
  category?: string   // shades / blinds / shutters / sheers / custom / motorized
  source?:   string   // 'hardcoded' | 'cms' | 'store'
  // JSON-only fields (present when useDbCatalog=false, stats from HD JSON)
  stats?: {
    gallery: number
    benefits: number
    control: number
    design: number
    mounting: number
    details: number
    swatch_collections: number
    swatch_colors: number
  }
}

interface ShowcaseProduct {
  id: number
  name: string
  image: { url: string; alt: string; width: number; height: number; fit: string } | null
}

interface Props {
  products: Product[]
  showcaseProducts?: ShowcaseProduct[]
  /** When true, products come from DB catalog and use product.href for links */
  useDbCatalog?: boolean
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; linkedin: string }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } }
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const cardReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
}

// Hunter Douglas product slugs — only these appear in the HD grid section.
// Other products (Handcrafted, Lutron, Luma) have their own hardcoded sections.
const HD_SLUGS = new Set([
  'alustra-architectural','alustra-woven-textures','applause','aria','duette',
  'everwood-parkland','heritance-newstyle','luminette','modern-precious-metals',
  'nantucket','palm-beach','pirouette','provenance','roller-skyline',
  'screen-skyline','silhouette','sonnette','us-banded','verticals','vignette',
])

export default function HunterDouglasClient({ products, showcaseProducts = [], useDbCatalog = false, footer }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // When DB catalog is active, filter to only Hunter Douglas products for the HD grid.
  // Other products (Handcrafted, Lutron, Luma) are shown in their own hardcoded sections.
  const hdProducts = useDbCatalog ? products.filter(p => HD_SLUGS.has(p.slug)) : products

  // Product categories for filtering.
  // When DB catalog is active: use the `category` field from DB.
  // When JSON mode:            use the slug-based mapping below.
  const categories = [
    { key: 'all',      label: 'All Products' },
    { key: 'shades',   label: 'Shades' },
    { key: 'blinds',   label: 'Blinds' },
    { key: 'shutters', label: 'Shutters' },
    { key: 'sheers',   label: 'Sheers & Shadings' },
    { key: 'custom',   label: 'Custom' },
    { key: 'motorized',label: 'Motorized' },
  ].filter(cat => {
    // Only show category tabs that have at least one product
    if (cat.key === 'all') return true
    if (useDbCatalog) return hdProducts.some(p => p.category === cat.key)
    // JSON mode: show only the original 4 tabs
    return ['shades', 'blinds', 'shutters', 'sheers'].includes(cat.key) &&
      hdProducts.some(p => {
        const shadesSlugs   = ['duette','applause','sonnette','vignette','roller-skyline','screen-skyline','us-banded','provenance']
        const blindsSlugs   = ['everwood-parkland','modern-precious-metals','vertical-blinds','verticals','nantucket']
        const shuttersSlugs = ['palm-beach','heritance-newstyle']
        const sheersSlugs   = ['silhouette','pirouette','luminette','aria','alustra-architectural','alustra-woven-textures']
        if (cat.key === 'shades')   return shadesSlugs.includes(p.slug)
        if (cat.key === 'blinds')   return blindsSlugs.includes(p.slug)
        if (cat.key === 'shutters') return shuttersSlugs.includes(p.slug)
        if (cat.key === 'sheers')   return sheersSlugs.includes(p.slug)
        return false
      })
  })

  const filteredProducts = activeFilter === 'all'
    ? hdProducts
    : hdProducts.filter(p => {
        if (useDbCatalog) return p.category === activeFilter
        // JSON fallback: original slug-based categorisation
        const shadesSlugs   = ['duette','applause','sonnette','vignette','roller-skyline','screen-skyline','us-banded','provenance']
        const blindsSlugs   = ['everwood-parkland','modern-precious-metals','vertical-blinds','verticals','nantucket']
        const shuttersSlugs = ['palm-beach','heritance-newstyle']
        const sheersSlugs   = ['silhouette','pirouette','luminette','aria','alustra-architectural','alustra-woven-textures']
        if (activeFilter === 'shades')   return shadesSlugs.includes(p.slug)
        if (activeFilter === 'blinds')   return blindsSlugs.includes(p.slug)
        if (activeFilter === 'shutters') return shuttersSlugs.includes(p.slug)
        if (activeFilter === 'sheers')   return sheersSlugs.includes(p.slug)
        return true
      })

  return (
    <main className="min-h-screen bg-white">

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative w-full h-[65vh] min-h-[500px] overflow-hidden bg-[#3d3d3d]">
        <img
          src={`${CDN_BASE}/hunter-douglas/pirouette/page009_img01_5986x3009.jpeg`}
          alt="Premium window treatments"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        <SiteNav activePage="Products" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end pb-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="text-white/50 text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Premium Window Treatments</span>
              <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-[1.05]">
                Our<br />Products
              </h2>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURED: HANDCRAFTED COLLECTIONS ═══════════════════════ */}
      <section className="w-full bg-white py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeInUp}
            className="mb-16"
          >
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Angel Drapery Originals</span>
            <h3 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Handcrafted Collections</h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Handcrafted Drapery */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              variants={cardReveal}
            >
              <Link
                href="/products/handcrafted-drapery"
                className="group block relative rounded-[20px] overflow-hidden aspect-[4/5] bg-gray-100"
              >
                <img
                  src="/drapery/handcrafted-drapery/IMG_0547.JPG"
                  alt="Handcrafted Drapery"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <span className="text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase block mb-2">Featured Collection</span>
                  <h4 className="text-3xl font-light text-white tracking-tight mb-3">Handcrafted Drapery</h4>
                  <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                    Premium made-to-measure drapery with refined hand-finished construction. 100% custom crafted in the USA.
                  </p>
                  <span className="inline-block mt-5 text-xs text-white/40 group-hover:text-white/80 transition-colors tracking-[0.2em] uppercase">
                    Explore Collection →
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Handcrafted Roman Shade */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              variants={cardReveal}
            >
              <Link
                href="/products/handcrafted-roman-shade"
                className="group block relative rounded-[20px] overflow-hidden aspect-[4/5] bg-gray-100"
              >
                <img
                  src="/roman-shade/IMG_0298_Original.JPG"
                  alt="Handcrafted Roman Shade"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <span className="text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase block mb-2">Featured Collection</span>
                  <h4 className="text-3xl font-light text-white tracking-tight mb-3">Handcrafted Roman Shade</h4>
                  <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                    Elegant custom Roman shades with 6 distinctive styles and 3000+ fabric options. Cordless or motorized.
                  </p>
                  <span className="inline-block mt-5 text-xs text-white/40 group-hover:text-white/80 transition-colors tracking-[0.2em] uppercase">
                    Explore Collection →
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Handcrafted Top Treatment */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              variants={cardReveal}
            >
              <Link
                href="/products/handcrafted-top-treatment"
                className="group block relative rounded-[20px] overflow-hidden aspect-[4/5] bg-gray-100"
              >
                <img
                  src="/top-treatments/cover.jpg"
                  alt="Handcrafted Top Treatment"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <span className="text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase block mb-2">Featured Collection</span>
                  <h4 className="text-3xl font-light text-white tracking-tight mb-3">Handcrafted Top Treatment</h4>
                  <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                    Cornices, valances, and swags — handcrafted to frame your windows with elegance and character.
                  </p>
                  <span className="inline-block mt-5 text-xs text-white/40 group-hover:text-white/80 transition-colors tracking-[0.2em] uppercase">
                    Explore Collection →
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HUNTER DOUGLAS COLLECTION ═══════════════════════ */}
      <section className="w-full bg-[#FAFAF8] py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

          {/* Section header */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeInUp}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6"
          >
            <div>
              <span className="text-gray-400 text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Authorized Dealer</span>
              <h3 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Hunter Douglas</h3>
              <p className="text-gray-400 text-sm mt-3 max-w-md">
                {hdProducts.length} product lines featuring world-class window treatments with industry-leading innovation.
              </p>
            </div>
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-wrap gap-2 mb-12"
          >
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === cat.key
                    ? 'bg-[#3d3d3d] text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Products grid */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            key={activeFilter}
          >
            {filteredProducts.map((product) => {
              // DB catalog: use href from DB; JSON mode: build from slug
              const productHref = (useDbCatalog && product.href) ? product.href : `/products/${product.slug}`
              // DB catalog: cover_image is already an absolute path stored in DB
              // JSON mode:  cover_image is a filename relative to /hunter-douglas/{slug}/
              const imgSrc = product.cover_image
                ? (useDbCatalog || product.cover_image.startsWith('/')
                    ? `${CDN_BASE}${product.cover_image.startsWith('/') ? '' : '/'}${product.cover_image}`
                    : `${CDN_BASE}/hunter-douglas/${product.slug}/${product.cover_image}`)
                : null
              return (
              <motion.div key={product.id || product.slug} variants={cardReveal}>
                <Link
                  href={productHref}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-[#f0ede8] relative">
                    {imgSrc ? (
                      <div className="w-full h-full flex items-center justify-center p-3">
                        <img
                          src={imgSrc}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100">
                        <span className="text-gray-400 text-sm">{product.name}</span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-end justify-center pb-4 pointer-events-none">
                      <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-white text-xs font-medium bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm tracking-wider uppercase">
                        View Collection
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h4 className="text-sm font-semibold text-[#12141C] group-hover:text-gray-500 transition-colors mb-1.5 tracking-tight">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    {/* Stats (only available in JSON mode, not DB catalog) */}
                    {product.stats && (product.stats.swatch_colors > 0 || product.stats.gallery > 0) && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {product.stats.swatch_colors > 0 && (
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            {product.stats.swatch_colors} colors
                          </span>
                        )}
                        {product.stats.gallery > 0 && (
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            {product.stats.gallery} photos
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ LUTRON COLLECTION ═══════════════════════ */}
      <section className="w-full bg-[#12141C] py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeInUp}
            className="mb-8"
          >
            <span className="text-white/30 text-[11px] font-bold tracking-[0.3em] uppercase block mb-2">Authorized Dealer</span>
            <h3 className="text-3xl md:text-4xl font-light tracking-tighter text-white">Lutron</h3>
            <p className="text-white/40 text-sm mt-2 max-w-md">
              World-class smart shading systems — engineered to be beautiful, designed to last.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              variants={cardReveal}
            >
              <Link
                href="/products/lutron-palladiom"
                className="group relative flex flex-col rounded-3xl overflow-hidden bg-[#1E1E1C] border border-white/5 hover:border-white/15 transition-all duration-500 shadow-2xl hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)] h-full"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src="/lutron/palladiom/hero.jpg"
                    alt="Lutron PALLADIOM Shading System"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex flex-col justify-center p-7 md:p-8 flex-1">
                  <span className="text-[#C8A84B] text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">Smart Shading System</span>
                  <h4 className="text-2xl md:text-3xl font-light tracking-tighter text-white mb-3">
                    PALLADIOM<span className="text-white/30 text-xl align-super">®</span>
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-sm">
                    Whisper-quiet automated roller shades with machined aluminum brackets, carbon fiber tube, and patented Intelligent Hembar Alignment. Width 20″ to 144″.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Motorized', 'Smart Home', '7 Finishes', 'Up to 12×12 ft'].map(tag => (
                      <span key={tag} className="text-[10px] text-white/30 bg-white/5 border border-white/10 px-3 py-1 rounded-full tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-white/30 group-hover:text-[#C8A84B] transition-colors tracking-[0.25em] uppercase">
                    Explore PALLADIOM →
                  </span>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              variants={cardReveal}
            >
              <Link
                href="/products/triathlon-roller-shades"
                className="group relative flex flex-col rounded-3xl overflow-hidden bg-[#1E1E1C] border border-white/5 hover:border-white/15 transition-all duration-500 shadow-2xl hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)] h-full"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src="https://assets.lutron.com/a/pdp/triathlon/triathlon-select-ph-an-4272-43e8.jpg"
                    alt="Triathlon® Roller Shades"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex flex-col justify-center p-7 md:p-8 flex-1">
                  <span className="text-[#C8A84B] text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">Sivoia QS Triathlon</span>
                  <h4 className="text-2xl md:text-3xl font-light tracking-tighter text-white mb-3">
                    Triathlon<span className="text-white/30 text-xl align-super">®</span> Roller Shades
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-sm">
                    Precision hybrid drive with Intelligent Hembar Alignment, ultra-quiet operation below 38 dBA, and ClearConnect RF wireless — battery or wired power options.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Motorized', 'Battery/Wired', 'IHA Technology', '20+ Integrations'].map(tag => (
                      <span key={tag} className="text-[10px] text-white/30 bg-white/5 border border-white/10 px-3 py-1 rounded-full tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-white/30 group-hover:text-[#C8A84B] transition-colors tracking-[0.25em] uppercase">
                    Explore Triathlon →
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ LUMA BRAND ═══════════════════════ */}
      <section className="w-full bg-[#F7F5F2] py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

          {/* Brand header */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeInUp}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6"
          >
            <div>
              <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Angel Drapery Originals</span>
              <h3 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Luma</h3>
              <p className="text-gray-400 text-sm mt-3 max-w-md">
                3 product lines — zebra shades, roller shades, and sheer shades with smart home integration, designed exclusively for Angel Drapery clients.
              </p>
            </div>
            <span className="text-xs text-gray-300 tracking-[0.25em] uppercase shrink-0">3 Collections</span>
          </motion.div>

          {/* Product cards — 3 column grid */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Luma Collection — Zebra Shades */}
            <motion.div variants={cardReveal}>
              <Link
                href="/products/luma-collection"
                className="group block relative rounded-[20px] overflow-hidden bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 shadow-sm hover:shadow-xl"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src="/luma-collection/lifestyle-dining-room.png"
                    alt="Luma Collection Zebra Shades"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-7 md:p-8">
                  <span className="text-[#4DB6E8] text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">Zebra Shades</span>
                  <h4 className="text-2xl font-light tracking-tighter text-[#12141C] mb-3">Luma Collection</h4>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">
                    Dual-layer zebra shades with precise light control — from sheer and airy to full privacy. 46 patterns, 220+ colors, with cordless, chain, or Matter-enabled motorized options.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['46 Patterns', '220+ Colors', 'Zebra / Dual Layer', 'Matter Smart Home'].map(tag => (
                      <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-300 group-hover:text-[#4DB6E8] transition-colors tracking-[0.25em] uppercase">
                    Explore Luma Collection →
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Roller Shades */}
            <motion.div variants={cardReveal}>
              <Link
                href="/products/roller-collection"
                className="group block relative rounded-[20px] overflow-hidden bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 shadow-sm hover:shadow-xl"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src="/roller-collection/lifestyle-floor-to-ceiling.png"
                    alt="Luma Roller Shades"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-7 md:p-8">
                  <span className="text-[#4DB6E8] text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">Roller Shades</span>
                  <h4 className="text-2xl font-light tracking-tighter text-[#12141C] mb-3">Luma Roller Shades</h4>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">
                    Clean lines, total light control. Choose from blackout, light-filtering, or solar screen fabrics — with cordless, chain, or Matter-enabled motorized options. 82 patterns, 354+ colors.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['82 Patterns', '354+ Colors', 'Blackout · Filtering · Screen', 'Matter Smart Home'].map(tag => (
                      <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-300 group-hover:text-[#4DB6E8] transition-colors tracking-[0.25em] uppercase">
                    Explore Roller Shades →
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Sheer Shades */}
            <motion.div variants={cardReveal}>
              <Link
                href="/products/sheer-collection"
                className="group block relative rounded-[20px] overflow-hidden bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 shadow-sm hover:shadow-xl"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src="/sheer-collection/lifestyle-sheer-living-room.png"
                    alt="Luma Sheer Shades"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-7 md:p-8">
                  <span className="text-[#4DB6E8] text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">Sheer Shades</span>
                  <h4 className="text-2xl font-light tracking-tighter text-[#12141C] mb-3">Luma Sheer Shades</h4>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">
                    Soft light diffusion with daytime privacy. Three fabric series — Standard, Embossed, and Natural Woven — 16 patterns, 98 colors, with cordless, chain, or motorized options.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['16 Patterns', '98 Colors', 'Standard · Embossed · Natural', 'Matter Smart Home'].map(tag => (
                      <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-300 group-hover:text-[#4DB6E8] transition-colors tracking-[0.25em] uppercase">
                    Explore Sheer Shades →
                  </span>
                </div>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════ SHOWCASE PRODUCTS (from DB) ═══════════════════════ */}
      {showcaseProducts.length > 0 && (
        <section className="w-full bg-white py-24 md:py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeInUp}
              className="mb-16"
            >
              <h3 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">More Products</h3>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {showcaseProducts.map((product) => (
                <motion.div key={product.id} variants={cardReveal}>
                  <Link href={`/products/${product.id}`}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                    <div className="aspect-square overflow-hidden relative bg-gray-50">
                      {product.image?.url ? (
                        <img src={product.image.url} alt={product.image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-lg">{product.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-medium text-[#12141C] text-center group-hover:text-gray-500 transition-colors">{product.name}</h4>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══════════════════════ WHY CHOOSE US ═══════════════════════ */}
      <section className="w-full bg-[#3d3d3d] text-white py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <span className="text-gray-500 text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Why Angel Drapery</span>
            <h3 className="text-4xl md:text-5xl font-light tracking-tighter">The Difference</h3>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-12 md:gap-16"
          >
            {[
              {
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                ),
                title: 'Premium Quality',
                desc: 'We partner exclusively with the finest brands and source only the highest quality materials in the industry.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                ),
                title: 'Custom Crafted',
                desc: 'Every product is tailored to your specific measurements and preferences. No compromises, no shortcuts.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
                title: 'Expert Installation',
                desc: 'Professional installation by our experienced team ensures perfect results every time, guaranteed.'
              },
            ].map((item, i) => (
              <motion.div key={i} variants={cardReveal} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#4DB6E8]">
                  {item.icon}
                </div>
                <h4 className="text-xl font-semibold mb-3 tracking-tight">{item.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="w-full bg-white py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeInUp}
          >
            <h3 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-6">Need Help Choosing?</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-md mx-auto">
              Schedule a free in-home consultation. Our experts will help you find the perfect window treatment for your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#contact">
                <button className="px-10 py-4 bg-[#3d3d3d] text-white text-sm font-medium tracking-[0.15em] uppercase hover:bg-black transition-colors rounded-full">
                  Schedule Consultation
                </button>
              </Link>
              <Link href="/gallery">
                <button className="px-10 py-4 border border-gray-200 text-[#12141C] text-sm font-medium tracking-[0.15em] uppercase hover:bg-gray-50 transition-colors rounded-full">
                  View Gallery
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="w-full bg-[#3d3d3d] border-t border-white/5 py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex gap-8">
              <a href={footer.youtube} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href={footer.etsy} className="text-gray-500 hover:text-white transition-colors">
                <span className="text-sm font-bold tracking-wider">ETSY</span>
              </a>
              <a href={footer.tiktok} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href={footer.linkedin} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
            <div className="text-center text-xs text-gray-500 tracking-wider">{footer.copyright}</div>
          </div>
        </div>
      </footer>
    </main>
  )
}
