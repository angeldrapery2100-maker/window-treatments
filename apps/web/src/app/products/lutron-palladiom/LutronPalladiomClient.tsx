'use client'

import Image from 'next/image'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { m as motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9 } },
}

const BASE = '/lutron/palladiom'

// Finish swatches from PDF spec page (p9-right)
const finishes = [
  { label: 'Pure White',      bg: '#F5F5F3' },
  { label: 'Black Anodized',  bg: '#2A2A28' },
  { label: 'Clear Anodized',  bg: '#C8C6C2' },
  { label: 'Satin Nickel',    bg: '#B0ADA8' },
  { label: 'Brass',           bg: '#C8A84B' },
  { label: 'Satin Graphite',  bg: '#6B6B68' },
  { label: 'Opal White',      bg: '#E8E6E2' },
]

const specs = [
  { label: 'Material',      value: 'Machined aluminum unibody structure' },
  { label: 'Shade Width',   value: '20″ to 144″' },
  { label: 'Shade Height',  value: '12″ to 144″' },
  { label: 'Power',         value: '35V DC low-voltage' },
  { label: 'Bottom Rail',   value: 'Extruded aluminum with machined end caps' },
  { label: 'Light Gap',     value: 'Symmetrical ½″ on each side' },
]

const features = [
  'Unibody bracket structure',
  'Integrated wiring',
  'Concealed but accessible programming',
  'Concealed fasteners',
  'Engineered wire management',
  'Symmetrical ½″ light gaps',
]

export default function LutronPalladiomClient() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden bg-[#1a1a1a]">
        {/* Background video — falls back to poster image */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={`${BASE}/hero.jpg`}
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src={`${BASE}/hero.mp4`} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />

        <SiteNav activePage="Products" />

        <div className="absolute inset-0 flex items-end pb-20 md:pb-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="text-white/50 text-[11px] font-bold tracking-[0.4em] uppercase block mb-4">
                Lutron · Smart Shading
              </span>
              <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-white leading-[1] mb-4">
                PALLADIOM<span className="text-white/40 text-4xl md:text-5xl align-super ml-1">®</span>
              </h1>
              <p className="text-white/60 text-xl md:text-2xl font-light tracking-wide max-w-xl">
                Engineered to be beautiful.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BREADCRUMB
      ══════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-6">
        <nav className="flex items-center gap-2 text-xs text-gray-400 tracking-wider">
          <Link href="/" className="hover:text-gray-700 transition-colors uppercase">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-700 transition-colors uppercase">Products</Link>
          <span>/</span>
          <span className="text-gray-700 uppercase">Lutron PALLADIOM</span>
        </nav>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 1 — CRAFTED TO STAY THAT WAY
      ══════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">

            {/* Text */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <span className="text-[#8B6914] text-[11px] font-bold tracking-[0.4em] uppercase block mb-6">Since 1993</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] leading-tight mb-8">
                Crafted to<br /><span className="font-semibold">stay that way.</span>
              </h2>
              <div className="space-y-5 text-gray-500 text-base leading-relaxed max-w-lg">
                <p>
                  In 1993, Lutron invented the quiet automated shade — whisper-quiet devices designed for, and befitting, sophisticated homes. These weren't the rumbling rollers cheaply adapted from offices.
                </p>
                <p>
                  In creating them, Lutron established an entirely new category of shading systems, combining groundbreaking technology with refined style. 55 years of cutting-edge innovation later, PALLADIOM redefines the standard again.
                </p>
                <p className="font-medium text-[#12141C]">
                  Distinctly crafted design and breakthrough engineering — the hallmarks of Lutron's next revolution.
                </p>
              </div>
            </motion.div>

            {/* Machining photo */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeIn}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/p2-machining.jpg`}
                  alt="Precision machining of PALLADIOM bracket"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#12141C] text-white px-6 py-4 rounded-2xl shadow-2xl hidden md:block">
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-1">Precision</p>
                <p className="text-sm font-medium tracking-wide">Machined Aluminum</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — FORM FOLLOWS FUNCTION
      ══════════════════════════════════════════ */}
      <section className="w-full bg-[#F7F6F3] py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="text-gray-400 text-lg md:text-xl italic tracking-wide mb-4">
              "There's a familiar axiom in modern design:
            </p>
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-[#12141C]">
              Form follows <span className="font-semibold">function.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Keypads */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeIn}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden"
            >
              <Image
                src={`${BASE}/p3-keypads.jpg`}
                alt="Lutron smart keypads and thermostat on wall"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>

            {/* Mount close-up + copy */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="flex flex-col justify-between gap-6"
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/p3-mount-closeup.jpg`}
                  alt="PALLADIOM ceiling mount close-up"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="bg-white rounded-3xl p-8 md:p-10">
                <p className="text-gray-500 text-base leading-relaxed">
                  With PALLADIOM shades, Lutron didn't want to hide the technology — they wanted to feature it. The result is a superbly crafted instrument: one as beautiful inside as it is outside.
                </p>
                <p className="text-gray-500 text-base leading-relaxed mt-4">
                  PALLADIOM embodies everything Lutron stands for: <strong className="text-[#12141C]">continuous innovation, superior quality and a celebration of design.</strong>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — FULL-WIDTH LIFESTYLE (VIEW)
      ══════════════════════════════════════════ */}
      <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={`${BASE}/p4-living-room.jpg`}
            alt="PALLADIOM shades in a modern open-plan living room"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16 w-full">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <p className="text-white/60 text-lg md:text-xl font-light tracking-wide mb-2">What's important is the view.</p>
              <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-white">
                Inside and <span className="font-semibold">out.</span>
              </h2>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — INTELLIGENT HEMBAR ALIGNMENT
      ══════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">

            {/* Room with shades deployed */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeIn}
              className="order-2 md:order-1"
            >
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/p5-room-shades.jpg`}
                  alt="PALLADIOM shades fully deployed in glass-wall living room"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="order-1 md:order-2"
            >
              <span className="text-[#8B6914] text-[11px] font-bold tracking-[0.4em] uppercase block mb-6">Patented Technology</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] leading-tight mb-8">
                It starts with a<br /><span className="font-semibold">single line.</span>
              </h2>
              <div className="space-y-5 text-gray-500 text-base leading-relaxed">
                <p>
                  The lines of PALLADIOM are level, graceful. Beginning with the slender, carefully balanced bottom rail, PALLADIOM ensures a balanced aesthetic — from roller to window sill.
                </p>
                <p>
                  PALLADIOM features Lutron's patented <strong className="text-[#12141C]">Intelligent Hembar Alignment (IHA)</strong> — a two-part electronic control system that synchronizes all automated shades in a single room, or an entire home.
                </p>
                <p>
                  IHA maintains hembar alignment within <strong className="text-[#12141C]">one-eighth of an inch</strong> during motion, and at all resting positions. The movement is effortless; balance is maintained.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — ENGINEERING STRENGTH
      ══════════════════════════════════════════ */}
      <section className="w-full bg-[#F7F6F3] py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">

            {/* Text */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <span className="text-[#8B6914] text-[11px] font-bold tracking-[0.4em] uppercase block mb-6">Carbon Fiber Engineering</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] leading-tight mb-4">
                PALLADIOM isn't<br />just beautiful.
              </h2>
              <p className="text-2xl md:text-3xl font-light text-gray-400 tracking-tight mb-8">
                It's <span className="font-semibold text-[#12141C]">strong</span>, too.
              </p>
              <div className="space-y-5 text-gray-500 text-base leading-relaxed">
                <p>
                  The roller shade can handle a <strong className="text-[#12141C]">12-by-12-foot window opening</strong> — and the fabric required to cover it — with a startlingly slim tube.
                </p>
                <p>
                  Barely <strong className="text-[#12141C]">2 inches in diameter</strong>, this high-tech carbon fiber wonder is remarkably rigid, yet light as a feather. Maximum strength, minimum profile.
                </p>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-gray-200">
                {[
                  { num: '2″', label: 'Tube diameter' },
                  { num: '12×12', label: 'Max window ft.' },
                  { num: '35V', label: 'DC low-voltage' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-3xl font-light text-[#12141C] tracking-tighter">{s.num}</p>
                    <p className="text-xs text-gray-400 tracking-wide uppercase mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Interior photo */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeIn}
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/p6-interior-large.jpg`}
                  alt="PALLADIOM shades in a bright modern interior"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — DESIGN VERSATILITY
      ══════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] leading-tight">
              The <span className="font-semibold italic">little black dress</span><br />
              of window coverings.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Fabric close-up */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeIn}
              className="relative"
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/p7-fabric-closeup.jpg`}
                  alt="PALLADIOM fabric texture close-up"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Kitchen installation + copy */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="flex flex-col gap-6"
            >
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/p7-kitchen.jpg`}
                  alt="PALLADIOM shades installed in a modern kitchen"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="bg-[#F7F6F3] rounded-3xl p-8 md:p-10 flex-1">
                <p className="text-gray-500 text-base leading-relaxed">
                  Sleek and sophisticated, the PALLADIOM design fits anywhere. It blends into any architectural style seamlessly — particularly when the jamb bracket is integrated into a frame or window recess.
                </p>
                <p className="text-gray-500 text-base leading-relaxed mt-4">
                  The handsome circular bracket visually extends the structural tube outward and into the wall: <strong className="text-[#12141C]">the shade appears to float in midair.</strong>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7 — SILENT OPERATION
      ══════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Loft image */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeIn}
            className="relative aspect-[4/3] md:aspect-auto md:min-h-[600px] overflow-hidden"
          >
            <Image
              src={`${BASE}/p8-loft.jpg`}
              alt="PALLADIOM shades in an industrial loft with large windows"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>

          {/* Text panel */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="bg-[#12141C] text-white flex items-center justify-center p-12 md:p-20"
          >
            <div className="max-w-sm">
              <p className="text-white/40 text-lg font-light tracking-wide mb-3">Built to be seen,</p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-8">
                not <span className="font-semibold">heard.</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed mb-6">
                Lutron automated shades are already the quietest in the industry. PALLADIOM continues the tradition: it is all but imperceptible.
              </p>
              <div className="border-t border-white/10 pt-8">
                <Image
                  src={`${BASE}/p8-bracket-overhead.jpg`}
                  alt="PALLADIOM bracket overhead close-up"
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 384px"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8 — FORWARD-THINKING TECHNOLOGY
      ══════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="mb-16"
          >
            <span className="text-[#8B6914] text-[11px] font-bold tracking-[0.4em] uppercase block mb-6">Intelligent Design</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">
              Technology that's <span className="font-semibold">forward-thinking.</span>
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* 4-up bracket photos — 45% width, natural image ratio */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeIn}
              className="md:w-[45%] shrink-0"
            >
              <div className="rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/p9-brackets-4up.jpg`}
                  alt="PALLADIOM bracket open/close mechanism — four views"
                  width={900}
                  height={1100}
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                The bracket rings slide open to reveal programming buttons and indicator LEDs. The design is utterly seamless.
              </p>
            </motion.div>

            {/* Features list — 55% width */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="md:w-[55%] space-y-6"
            >
              <p className="text-gray-500 text-base leading-relaxed">
                The brackets combine superior workmanship with ingeniously hidden electronics, machined into an aluminum unibody structure that honors the integrity of pure architectural form across a range of mounting conditions — ceiling, wall or jamb.
              </p>
              <div className="grid grid-cols-1 gap-3 pt-4">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B6914] mt-2 shrink-0" />
                    <span className="text-gray-600 text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 9 — SPECIFICATIONS
      ══════════════════════════════════════════ */}
      <section className="w-full bg-[#1E1E1C] text-white py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="mb-16"
          >
            <span className="text-white/30 text-[11px] font-bold tracking-[0.4em] uppercase block mb-4">Technical Details</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter">Specification</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 md:gap-24">

            {/* Specs table */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <div className="space-y-0">
                {specs.map((s, i) => (
                  <div key={i} className="flex gap-6 py-5 border-b border-white/8">
                    <span className="text-white/40 text-xs font-bold tracking-[0.25em] uppercase w-32 shrink-0 pt-0.5">{s.label}</span>
                    <span className="text-white/80 text-sm leading-relaxed">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Finish swatches */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <p className="text-white/40 text-[11px] font-bold tracking-[0.3em] uppercase mb-8">Available Finishes</p>
              <div className="grid grid-cols-4 gap-5">
                {finishes.map((f) => (
                  <div key={f.label} className="flex flex-col items-center gap-2">
                    <div
                      className="w-14 h-14 rounded-full shadow-lg border border-white/10"
                      style={{ background: f.bg }}
                    />
                    <span className="text-white/50 text-[10px] text-center leading-tight tracking-wide">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Bracket diagram */}
              <div className="mt-12">
                <p className="text-white/40 text-[11px] font-bold tracking-[0.3em] uppercase mb-6">Bracket Types</p>
                <div className="rounded-2xl overflow-hidden">
                  <Image
                    src={`${BASE}/p10-diagrams.jpg`}
                    alt="PALLADIOM end bracket, center bracket, and jamb bracket diagrams"
                    width={900}
                    height={600}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 10 — TRADITION OF EXCELLENCE
      ══════════════════════════════════════════ */}
      <section className="w-full py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">

            {/* Precision machining photo */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeIn}
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                <Image
                  src={`${BASE}/p10-precision.jpg`}
                  alt="Precision manufacturing of PALLADIOM components"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <span className="text-[#8B6914] text-[11px] font-bold tracking-[0.4em] uppercase block mb-6">50+ Years of Innovation</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C] leading-tight mb-8">
                A tradition of <span className="font-semibold">excellence.</span>
              </h2>
              <div className="space-y-5 text-gray-500 text-base leading-relaxed">
                <p>
                  For more than 50 years, Lutron has been a pioneer in technology, innovation, and design — inventors of modern electronic lighting control.
                </p>
                <p>
                  The PALLADIOM Shading System embodies the best of Lutron's capabilities. Whether admiring the precision of its workmanship or the wonder of its technology, PALLADIOM is a thing of beauty.
                </p>
                <p className="font-medium text-[#12141C]">
                  Enjoy what you see, from any direction. The view is limitless.
                </p>
              </div>
              <div className="mt-10">
                <a
                  href="https://lutron.com/palladiomshades"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#8B6914] font-medium tracking-wider uppercase hover:underline"
                >
                  Learn more at lutron.com →
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section className="w-full bg-[#3d3d3d] text-white py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <span className="text-white/30 text-[11px] font-bold tracking-[0.4em] uppercase block mb-6">Angel Drapery · Authorized Lutron Dealer</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-6">
              Ready to experience PALLADIOM?
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              Contact us for a free in-home consultation. We'll help you find the perfect shading solution for your space.
            </p>
            <Link
              href="/#contact"
              className="inline-block px-10 py-4 bg-white text-[#12141C] text-sm font-semibold tracking-[0.2em] uppercase rounded-full hover:bg-gray-100 transition-colors"
            >
              Request a Consultation
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER BREADCRUMB BACK
      ══════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-8 border-t border-gray-100">
        <Link href="/products" className="text-xs text-gray-400 tracking-wider uppercase hover:text-gray-700 transition-colors">
          ← Back to All Products
        </Link>
      </div>

    </main>
  )
}
