'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { motion, AnimatePresence } from 'framer-motion'

const IMG = '/roman-shade'
const CF = 'https://www.carolefabrics.com/wp-content/uploads/2025/04'

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } },
}
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

/* ─── Roman Shade Styles ─── */
const romanStyles = [
  {
    name: 'Flat Roman Shade',
    image: `${CF}/Carole_Fabrics_Flat_Roman_Shade_cmp.jpg`,
    description: 'Flat when fully lowered. Battens between front and back of shade minimize the need for hand-dressing when raised. A timeless look that showcases your fabric beautifully.',
  },
  {
    name: 'Front Fold Roman Shade',
    image: `${CF}/Carole_Fabrics_Front_Fold_Roman_Shade_cmp.jpg`,
    description: 'Battens sewn into the front of the shade for crisp, structured horizontal folds. A tailored, architectural silhouette perfect for modern interiors.',
  },
  {
    name: 'Hobbled Roman Shade',
    image: `${CF}/Carole_Fabrics_Hobbled_Roman_Shade_cmp.jpg`,
    description: 'Soft continuous folds remain even when the shade is fully lowered. Battens on the backside provide stability while maintaining cascading elegance.',
  },
  {
    name: 'Reverse Fold Roman Shade',
    image: `${CF}/Carole_Fabrics_Reverse_Fold_Roman_Shade_cmp.jpg`,
    description: 'Battens sewn into the back of the shade for crisp folds that stack in the opposite direction — a refined, dimensional silhouette.',
  },
  {
    name: 'Slouch Roman Shade',
    image: `${CF}/Carole_Fabrics_Slouch_Roman_Shade_cmp.jpg`,
    description: 'Body of shade is flat when fully lowered. Soft folds at the bottom hem and fanned bottom hem corners remain in any position — a relaxed, organic look.',
  },
  {
    name: 'Soft Roman Shade',
    image: `${CF}/Carole_Fabrics_Soft_Roman_Shade_cmp.jpg`,
    description: 'Body of shade is flat when fully lowered. Soft folds at the bottom hem remain in any position. Understated elegance for any interior.',
  },
]

const defaultInstallations = [
  { src: `${IMG}/IMG_0077.JPG`,     alt: 'Roman shade in bedroom' },
  { src: `${IMG}/IMG_0078.JPG`,     alt: 'Roman shade in dining room' },
  { src: `${IMG}/IMG_4114.JPG`,     alt: 'Light beige Roman shade installation' },
  { src: `${IMG}/微信图片_20190609163607_Original.JPG`, alt: 'Roman shade partially raised' },
  { src: `${IMG}/IMG_0298_Original.JPG`, alt: 'Roman shade hero view' },
]

export default function HandcraftedRomanShadePage() {
  const [lightbox, setLightbox] = useState<{ srcs: string[]; idx: number } | null>(null)
  const [installations, setInstallations] = useState(defaultInstallations)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/installation-images?productType=handcrafted-roman-shade')
        const json = await res.json()
        if (json.success && json.data.length > 0) {
          const published = json.data.filter((i: any) => i.is_published)
          if (published.length > 0) {
            setInstallations(published.map((i: any) => ({ src: i.image_url, alt: i.caption || '' })))
          }
        }
      } catch {}
    })()
  }, [])

  const openLightbox = (srcs: string[], idx: number) => setLightbox({ srcs, idx })
  const closeLightbox = () => setLightbox(null)
  const lbPrev = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx - 1 + prev.srcs.length) % prev.srcs.length } : null)
  const lbNext = () => setLightbox(prev => prev ? { ...prev, idx: (prev.idx + 1) % prev.srcs.length } : null)

  const styleSrcs = romanStyles.map(s => s.image)
  const installSrcs = installations.map(i => i.src)

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative w-full h-[70vh] min-h-[520px] overflow-hidden bg-[#2a2a2a]">
        <img
          src={`${IMG}/IMG_0298_Original.JPG`}
          alt="Handcrafted Roman Shade"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/65" />
        <SiteNav activePage="Products" />
        <div className="absolute inset-0 flex items-end pb-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <nav className="flex items-center gap-2 text-white/40 text-xs tracking-[0.2em] uppercase mb-6">
                <Link href="/products" className="hover:text-white/70 transition-colors">Products</Link>
                <span>/</span>
                <span className="text-white/70">Roman Shade</span>
              </nav>
              <span className="text-white/50 text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Angel Drapery Handcrafted</span>
              <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-[1.05]">
                Roman<br />Shades
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── INTRO ─────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
              <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Handcrafted in the USA</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-6">
                Elegant<br />and effortless.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-md">
                Whether you're looking for subtle light control or a window treatment that could pass for artwork in its own right, our handcrafted Roman shades set the tone of any room. Celebrate the natural qualities of textiles by combining decorative fabrics with your choice of lining and trimmings.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                For an uncomplicated on-trend look, several styles are available with easy-to-use cordless and motorized lift options. Layer them with drapery panels or let them stand alone as a statement piece.
              </p>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { num: '6', label: 'Distinct Styles' },
                { num: '3000+', label: 'Fabric Options' },
                { num: '100%', label: 'Custom Made' },
              ].map(s => (
                <div key={s.label} className="bg-[#F7F5F2] rounded-2xl p-6 text-center">
                  <div className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-1">{s.num}</div>
                  <div className="text-xs text-gray-400 tracking-wide">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────────── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
            >
              <div className="rounded-3xl overflow-hidden aspect-[4/3]">
                <img
                  src={`${IMG}/Front_Fold_Roman_Shade_2.jpg`}
                  alt="Front Fold Roman Shade"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
              <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Why Choose Us</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-8">
                100% Custom<br />Crafted.
              </h2>
              <div className="space-y-5">
                {[
                  { title: 'Custom Measurements', desc: 'Every shade is made to your exact window dimensions for a perfect, tailored fit.' },
                  { title: '3000+ Fabric Options', desc: 'From sheer linens to textured wovens, bold patterns to elegant silks — the choice is yours.' },
                  { title: 'Multiple Lift Options', desc: 'Cordless, continuous loop, and motorized lift systems available.' },
                  { title: 'Lining Choices', desc: 'Light filtering, room darkening, or blackout linings — pick what your space needs.' },
                  { title: 'Front or Back Mount', desc: 'Position off the front or back of the headrail to minimize light gaps.' },
                  { title: 'Professional Installation', desc: 'Expert measuring and installation by our experienced team, guaranteed.' },
                ].map((feat, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-1" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#12141C] mb-0.5 tracking-tight">{feat.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW ROMAN SHADES WORK ─────────────────────────────────── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-16">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">How Roman Shades Work</h2>
          </motion.div>
          <div className="space-y-20">
            {[
              {
                img: `${IMG}/Flat-Roman-Shade-4.jpg`,
                title: 'Flat When Lowered',
                desc: 'Most Roman shade styles present a clean, flat fabric face when fully lowered, showcasing the beauty of your chosen textile. The fabric hangs smooth against the window, providing light control and privacy while adding warmth and texture to the room.',
                reverse: false,
              },
              {
                img: `${IMG}/Front-Fold-Roman-Shade-1.jpg`,
                title: 'Structured Folds When Raised',
                desc: 'Internal battens — horizontal rods sewn into the fabric — create the signature fold pattern when the shade is raised. Depending on the style, these battens produce different fold effects: from crisp tailored stacks to soft cascading pleats.',
                reverse: true,
              },
              {
                img: `${IMG}/Hobbled-Roman-Shade-3.jpg`,
                title: 'Soft Folds for a Luxurious Look',
                desc: 'Styles like the Hobbled Roman Shade maintain beautiful soft folds even when fully lowered, adding depth and dimension. The cascading fabric creates an elegant layered effect that brings warmth and sophistication to any space.',
                reverse: false,
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
                className={`flex flex-col ${step.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}
              >
                <div className="md:w-1/2 rounded-3xl overflow-hidden aspect-square cursor-zoom-in" onClick={() => openLightbox(styleSrcs, i)}>
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="md:w-1/2 space-y-4">
                  <h3 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C]">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-md">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STYLES ────────────────────────────────────────────────── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-14">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Handcrafted in the USA</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Our Roman Shade Styles</h2>
            <p className="text-gray-400 text-sm mt-3 max-w-lg">
              Each style offers a unique aesthetic — from clean modern lines to luxurious cascading folds. All custom made to your exact measurements.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {romanStyles.map((style, i) => (
              <motion.div
                key={style.name}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08 } } }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-zoom-in group"
                onClick={() => openLightbox(styleSrcs, i)}
              >
                <div className="aspect-square overflow-hidden">
                  <img src={style.image} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="text-base font-semibold text-[#12141C] mb-2 tracking-tight">{style.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{style.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTALLATIONS ─────────────────────────────────────────── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="mb-14">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">Real Projects</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">Our Installations</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {installations.map((img, i) => (
              <motion.div
                key={img.src}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: i * 0.07 } } }}
                className="rounded-2xl overflow-hidden aspect-[3/4] cursor-zoom-in group"
                onClick={() => openLightbox(installSrcs, i)}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="w-full bg-[#12141C] py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">Get Started</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-white mb-6">
              Ready to transform<br />your windows?
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-md mx-auto">
              Schedule a free in-home consultation. We'll help you choose the perfect Roman shade style, fabric, and lining for your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#contact">
                <button className="px-10 py-4 bg-white text-[#12141C] text-sm font-medium tracking-[0.15em] uppercase hover:bg-gray-100 transition-colors rounded-full">
                  Schedule Consultation
                </button>
              </Link>
              <Link href="/products">
                <button className="px-10 py-4 border border-white/20 text-white text-sm font-medium tracking-[0.15em] uppercase hover:bg-white/10 transition-colors rounded-full">
                  View All Products
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── LIGHTBOX ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <div className="max-w-[1440px] w-full" onClick={e => e.stopPropagation()}>
              <div className="relative flex items-center justify-center">
                {lightbox.srcs.length > 1 && (
                  <button onClick={lbPrev} className="absolute left-0 -translate-x-12 text-white/50 hover:text-white hidden md:block">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
                  </button>
                )}
                <img src={lightbox.srcs[lightbox.idx]} alt="" className="w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
                {lightbox.srcs.length > 1 && (
                  <button onClick={lbNext} className="absolute right-0 translate-x-12 text-white/50 hover:text-white hidden md:block">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                  </button>
                )}
              </div>
              {lightbox.srcs.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {lightbox.srcs.map((s, i) => (
                    <button key={s} onClick={() => setLightbox(prev => prev ? { ...prev, idx: i } : null)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox.idx ? 'border-white/80' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                      <img src={s} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
