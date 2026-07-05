import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import { PRIMARY_PHONE } from '@/lib/site'

// SEO/GEO audit (2026-07-05) flagged this as a content gap: no independent
// measuring guide existed, despite it being one of the highest-intent
// informational searches in this category ("how to measure windows for
// curtains") and a natural entry point for AI-answer-engine citations.
// Framed to educate AND reinforce the free in-home measurement service —
// this is not meant to replace the professional measurement, it's meant to
// help people understand the process before they book one.

export const revalidate = 300

export const metadata: Metadata = {
  title: 'How to Measure Windows for Drapery, Shades & Shutters',
  description:
    'A plain-English guide to measuring windows for custom drapery, roman shades, roller shades, and shutters — inside vs. outside mount, tools, and common mistakes. Free in-home measurement included with every Angel Drapery project.',
  alternates: { canonical: '/how-to-measure' },
}

const mountTypes = [
  {
    title: 'Inside Mount',
    desc:
      'The treatment sits inside the window frame, flush against the wall. Gives a clean, built-in look and works best when the frame has enough depth for the hardware or headrail. We measure the width in three places (top, middle, bottom) and use the narrowest number, since most frames are not perfectly square.',
  },
  {
    title: 'Outside Mount',
    desc:
      'The treatment mounts on the wall or trim above and around the window, covering the frame entirely. Better for shallow frames, uneven openings, or when you want the window to look larger. Width and height are measured to how far past the frame you want the treatment to extend on each side.',
  },
]

const productGuides = [
  {
    title: 'Custom Drapery',
    points: [
      'Rod width usually extends 4–8" beyond the frame on each side, so panels can stack fully off the glass and let in more light when open.',
      '"Stack back" is the space the fabric takes up when the drapery is pushed open — wider rods and fuller panels need more of it.',
      'Length is typically measured to the floor, sill, or apron depending on style; we account for the specific pleat or heading style when calculating fabric take-up.',
    ],
    href: '/products/handcrafted-drapery',
  },
  {
    title: 'Roman Shades',
    points: [
      'Inside mount needs at least 2–3" of frame depth to sit flush; outside mount is the safer choice for shallow or uneven frames.',
      'Width is measured at the narrowest point for inside mount, or with enough overlap on each side for outside mount to fully block light gaps.',
      'Cordless and motorized lift systems change the hardware clearance needed at the top of the shade — this gets confirmed at the in-home visit.',
    ],
    href: '/products/handcrafted-roman-shade',
  },
  {
    title: 'Roller & Solar Shades',
    points: [
      'Fascia (the trim that hides the roll) adds a small amount to both width and projection — factored in during fabrication, not at the raw measurement stage.',
      'For inside mount, we leave a small tolerance gap on each side so the shade doesn\'t bind against the frame as it rolls.',
      'Motorized and Matter-enabled options need a power source or charging access considered before installation day.',
    ],
    href: '/products/roller-collection',
  },
  {
    title: 'Shutters & Blinds',
    points: [
      'Frame depth matters most here — plantation shutters need real clearance for the panel and hinge to swing freely.',
      'Tilt-rod or hidden-tilt mechanisms and divided-light patterns are matched to your actual window muntins, not a standard grid.',
      'Outside mount is common on shallow stucco returns or windows without enough inside depth.',
    ],
    href: '/products',
  },
]

const mistakes = [
  {
    title: 'Using a cloth tape measure',
    desc: 'Fabric tape stretches. A steel tape measure gives a measurement that stays accurate from the living room to the workroom.',
  },
  {
    title: 'Measuring only once',
    desc: 'Framing settles over decades — measure width and height in three spots and use the smallest number for inside mount so the finished piece always fits.',
  },
  {
    title: 'Rounding up "to be safe"',
    desc: 'A rounded measurement can mean a gap of light at the edges or a shade that binds against the frame. Precise numbers, not rounded ones, are what make a custom piece actually look custom.',
  },
  {
    title: 'Forgetting obstructions',
    desc: 'Door handles, blinds already installed, outlets, and radiators can all interfere with drapery stack-back or shade projection — worth noting before ordering.',
  },
]

const faqs = [
  {
    q: 'Do I need to measure my own windows?',
    a: 'No — every Angel Drapery order includes a free in-home measurement by our own team before anything goes into fabrication. This guide is meant to help you understand the process, compare mount options, and know roughly what to expect walking into your consultation.',
  },
  {
    q: 'What tools do I need if I want to measure myself first?',
    a: 'A steel tape measure (not cloth), a pencil and paper or phone notes app, and a step stool for taller windows. Measure width in three places (top, middle, bottom) and height in three places (left, center, right), and always note whether you\'re measuring for inside or outside mount.',
  },
  {
    q: 'What\'s the difference between inside and outside mount?',
    a: 'Inside mount sits within the window frame for a flush, built-in look and needs adequate frame depth. Outside mount covers the frame and wall around it, which works better for shallow frames, uneven openings, or when you want a window to appear larger. We help you choose during the free consultation.',
  },
  {
    q: 'How much extra fabric does drapery need for fullness?',
    a: 'It depends on the heading style — pinch pleat, ripple fold, and grommet panels each take a different fullness ratio (roughly 2x to 2.5x the rod width in fabric) to hang correctly when closed. This is calculated as part of your custom order, not a flat rule.',
  },
  {
    q: 'What if my walls or window frames aren\'t perfectly square?',
    a: 'Very common in older homes across the San Gabriel Valley — craftsman bungalows and mid-century houses especially. This is exactly why we measure in person rather than working from phone measurements: our workroom builds to the smallest/tightest dimension so everything still fits and operates smoothly.',
  },
  {
    q: 'Is the in-home measurement really free?',
    a: 'Yes, with no obligation to purchase. We come to you, measure every window ourselves, and show fabrics and samples in your actual lighting before you commit to anything.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function HowToMeasurePage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── 1. HERO ── */}
      <section className="relative w-full bg-[#12141C]">
        <SiteNav activePage="" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 md:pt-48 pb-20 md:pb-24">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Measuring Guide
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white leading-[1.08] max-w-3xl">
            How to Measure Windows for Custom Window Treatments
          </h1>
          <p className="text-white/50 text-sm md:text-base leading-relaxed mt-6 max-w-xl">
            A plain-English guide to inside vs. outside mount, what each product type needs, and the
            mistakes that trip people up — plus, every Angel Drapery order includes a free in-home
            measurement, so you never have to get it exactly right on your own.
          </p>
        </div>
      </section>

      {/* ── 2. MOUNT TYPES ── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            Start Here
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-12">
            Inside mount or outside mount?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {mountTypes.map((m) => (
              <div key={m.title} className="bg-[#F7F5F2] rounded-3xl p-8 md:p-10">
                <h3 className="text-xl font-semibold text-[#12141C] tracking-tight mb-4">{m.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PER-PRODUCT GUIDES ── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            By Product
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-12">
            What each treatment needs.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productGuides.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-8">
                <h3 className="text-base font-semibold text-[#12141C] mb-4 tracking-tight">{p.title}</h3>
                <ul className="space-y-3 mb-5">
                  {p.points.map((pt, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/40 mt-1.5 h-1" />
                      <p className="text-sm text-gray-400 leading-relaxed">{pt}</p>
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className="text-sm font-medium text-[#4DB6E8] hover:underline">
                  Explore {p.title} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. COMMON MISTAKES ── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            Avoid These
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-12">
            Common measuring mistakes.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {mistakes.map((m) => (
              <div key={m.title} className="border border-gray-100 rounded-2xl p-7">
                <h3 className="text-base font-semibold text-[#12141C] mb-2 tracking-tight">{m.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            Common Questions
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-12">
            Measuring FAQ
          </h2>
          <div className="max-w-3xl space-y-8">
            {faqs.map((f) => (
              <div key={f.q} className="flex gap-4">
                <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-1" />
                <div>
                  <h3 className="text-base font-semibold text-[#12141C] mb-2 tracking-tight">{f.q}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA ── */}
      <section className="w-full bg-[#12141C] py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Skip the Guesswork
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-white mb-6">
            We'll measure every window for you — free.
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            Book a free in-home consultation and measurement. No obligation, no charge — we bring
            fabric samples and show you how everything looks in your actual light.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`tel:${PRIMARY_PHONE}`}>
              <button className="px-10 py-4 bg-white text-[#12141C] text-sm font-medium tracking-[0.15em] uppercase hover:bg-gray-100 transition-colors rounded-full">
                Call {PRIMARY_PHONE}
              </button>
            </a>
            <Link href="/contact">
              <button className="px-10 py-4 border border-white/20 text-white text-sm font-medium tracking-[0.15em] uppercase hover:bg-white/10 transition-colors rounded-full">
                Request a Consultation
              </button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
