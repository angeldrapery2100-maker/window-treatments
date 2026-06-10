'use client'
import { m as motion } from 'framer-motion'
import Image from 'next/image'

// ─── Value card data ──────────────────────────────────────────────────────────
const values = [
  {
    icon: '✦',
    label: '40 Years of Craft',
    sub: '始于 1986，Temple City 家族工坊',
    detail: '每一针、每一褶，皆由经验传承的工匠亲手完成。',
  },
  {
    icon: '⌁',
    label: 'Apple HomeKit Certified',
    sub: '官方认证 Matter & HomeKit 集成',
    detail: '用 Siri 或 Apple Home App 一键控制每一片光影。',
  },
  {
    icon: '◎',
    label: 'LA Local Install',
    sub: '洛杉矶全区上门安装服务',
    detail: '量身测量、现场安装、调试到位，全程无忧。',
  },
]

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const fadeRight = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const scaleIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 18, delay: 0.3 } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Component ────────────────────────────────────────────────────────────────
export const AboutSection = () => {
  return (
    <section
      className="relative w-full py-24 bg-[#F8F8F6] overflow-hidden"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.012) 3px, rgba(0,0,0,0.012) 4px), repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.006) 3px, rgba(0,0,0,0.006) 4px)',
      }}
    >
      {/* ── Decorative ambient blobs ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#ef8200]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 w-[360px] h-[360px] rounded-full bg-[#12141C]/5 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* ════════════════════════════════════════════════════════════════════
            Top row: photo  +  brand narrative
        ════════════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* ── Left: Workshop photo ───────────────────────────────────────── */}
          <motion.div
            className="relative"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
              <Image
                src="/drapery/handcrafted-drapery/IMG_5390.jpg"
                alt="Our Workshop — Temple City, CA"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover grayscale-[0.25] hover:grayscale-0 transition-all duration-700"
              />
              {/* Inner decorative frame */}
              <div className="absolute inset-4 border border-white/20 pointer-events-none rounded-sm" />
              {/* Subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#12141C]/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating experience badge */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="absolute -bottom-10 -right-6 lg:-right-10 bg-[#12141C] text-white p-10 rounded-full w-44 h-44 lg:w-48 lg:h-48 flex flex-col items-center justify-center shadow-2xl z-10"
            >
              <span className="text-4xl font-serif italic leading-none">40+</span>
              <span className="text-[9px] uppercase tracking-[0.22em] font-bold mt-2 text-center leading-snug">
                Years of<br />Craft
              </span>
            </motion.div>

            {/* Since tag */}
            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-700 shadow-sm">
              Est. 1986
            </div>
          </motion.div>

          {/* ── Right: Brand narrative ─────────────────────────────────────── */}
          <motion.div
            className="space-y-10 lg:pl-4"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <div className="space-y-6">
              <span className="text-[#ef8200] text-[11px] font-bold tracking-[0.4em] uppercase">
                Since 1986 · Temple City, CA
              </span>
              <h2 className="text-5xl md:text-6xl font-serif italic text-gray-900 leading-[1.1]">
                Where Tradition <br />
                Meets{' '}
                <span className="not-italic font-bold text-[#12141C]">
                  Smart<br />Innovation.
                </span>
              </h2>
              <p className="text-gray-600 text-[1.0625rem] leading-[1.8] font-light max-w-xl">
                始于 Temple City，我们是一家拥有 40 年经验的家族经营工坊。从第一针手工缝制的窗帘，到如今无缝集成的 Apple HomeKit 电动系统，我们始终致力于为洛杉矶房主量身定制光影空间。
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200">
              <div className="space-y-1.5">
                <p className="text-3xl font-serif italic text-[#12141C]">500+</p>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-800">Projects Installed</h4>
                <p className="text-xs text-gray-500 leading-relaxed">覆盖大洛杉矶地区每个社区。</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-3xl font-serif italic text-[#12141C]">100%</p>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-800">Certified Tech</h4>
                <p className="text-xs text-gray-500 leading-relaxed">官方认证 Matter 与 HomeKit 集成专家。</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-3xl font-serif italic text-[#12141C]">4.9★</p>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-800">Client Rating</h4>
                <p className="text-xs text-gray-500 leading-relaxed">来自 Google 与 Yelp 的真实评分。</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-3xl font-serif italic text-[#12141C]">3 Gen</p>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-800">Family Business</h4>
                <p className="text-xs text-gray-500 leading-relaxed">三代家族传承的工匠精神。</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="bg-[#12141C] text-white px-10 py-4 text-[11px] uppercase tracking-[0.3em] font-bold shadow-xl hover:bg-[#ef8200] transition-colors duration-300"
            >
              Our Full Story →
            </motion.button>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            Bottom row: Three glassmorphism value cards
        ════════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="mt-28 grid md:grid-cols-3 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {values.map((v, i) => (
            <motion.div
              key={i}
              variants={cardVariant}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="relative group rounded-sm overflow-hidden border border-white/60 shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Top accent bar */}
              <div className="h-0.5 w-full bg-gradient-to-r from-[#ef8200] via-[#ef8200]/50 to-transparent" />

              <div className="p-8 space-y-4">
                {/* Icon */}
                <span className="text-[#ef8200] text-2xl font-mono select-none">{v.icon}</span>

                {/* Label */}
                <div>
                  <h3 className="text-lg font-bold text-[#12141C] leading-snug">{v.label}</h3>
                  <p className="text-[11px] text-[#ef8200] font-bold uppercase tracking-[0.2em] mt-1">{v.sub}</p>
                </div>

                {/* Divider */}
                <div className="h-px w-12 bg-gray-300 group-hover:w-24 transition-all duration-500" />

                {/* Detail */}
                <p className="text-sm text-gray-600 leading-relaxed">{v.detail}</p>
              </div>

              {/* Hover shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

export default AboutSection
