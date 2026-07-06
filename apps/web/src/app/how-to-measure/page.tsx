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
      'The treatment sits inside the window frame, flush against the wall — a clean, built-in look. Measure the exact inner frame opening: width at top, middle, and bottom (use the smallest), height at left, center, and right (use the smallest), since most frames aren\'t perfectly square. Give us that exact opening measurement — don\'t deduct anything yourself, we make the factory deductions. Shades generally need about 2–3" of flat frame depth to sit flush.',
  },
  {
    title: 'Outside Mount',
    desc:
      'The treatment mounts on the wall or trim around the window, covering the frame entirely — better for shallow frames, uneven openings, or when you want a window to look larger. As a rule of thumb we add about +5" width / +6" height beyond the opening for roman and roller shades, and 2–3" per side for drapery, to block light gaps. Already know the exact finished size you want? Enter that directly.',
  },
]

const productGuides = [
  {
    title: 'Custom Drapery',
    points: [
      'Width: window/opening width plus stacking room — generally +10" or more per side, scaling up for wider windows, so panels can clear the glass fully when open.',
      'For ceiling-mounted rods/tracks: ceilings are often uneven, so measure ceiling height at left, center, and right. Finished height = ceiling height − rod/track thickness (motorized ceiling track ≈ 1.25", standard ceiling track ≈ 1") − floor clearance (0.5–1"). If the gap from window top to ceiling is over 30", the rod can instead be mounted at the midpoint. For a wall-mounted rod, finished height is simply ceiling height − 4.5" — no separate floor clearance needed.',
      '2-fold pinch pleat gives a tailored, streamlined look; 3-fold pinch pleat is fuller and more traditional; ripplefold gives a modern continuous wave and pairs well with motorized tracks — though it does take up more stack space at the sides when open than pinch pleat styles. For ripplefold we only need your track length and drop, and calculate carriers and fullness (60/80/100/120%) for you.',
    ],
    href: '/products/handcrafted-drapery',
  },
  {
    title: 'Roman Shades',
    points: [
      'Available in 6 styles — flat, slouch, soft, front fold, reverse fold, and hobbled — with 3,000+ fabric options, optional lining, valance, cordless or motorized lift.',
      'Inside mount needs about 2–3" of frame depth to sit flush; outside mount adds roughly +5" width / +6" height beyond the opening.',
      'Cordless and motorized lift systems change the hardware clearance needed at the top of the shade — confirmed at your free in-home visit.',
    ],
    href: '/products/handcrafted-roman-shade',
  },
  {
    title: 'Roller, Zebra & Sheer Shades (Luma Collection)',
    points: [
      'Our Luma collection covers roller, zebra (alternating sheer/solid bands), sheer, and dual (double-layer) shades — maximum single-panel width is 118"; wider windows split into multiple panels.',
      'Outside mount adds roughly +5" width / +6" height beyond the opening, same as roman shades, to block light gaps at the edges.',
      'Choose from plastic chain, stainless chain, cordless, or motorized control — motorized and Matter-enabled options need power or charging access considered before install day.',
    ],
    href: '/products/roller-collection',
  },
  {
    title: 'Hunter Douglas, Shutters & Blinds',
    points: [
      'The full Hunter Douglas lineup (Duette, Silhouette, Palm Beach shutters, and more) is priced through a free consultation rather than the online configurator.',
      'Frame depth matters most for shutters — panels and hinges need real clearance to swing freely, matched to your actual window muntins.',
      'Bay windows, corner windows, arches, and other special shapes always go through an in-home consultation rather than a self-measured order.',
    ],
    href: '/products',
  },
]

const mistakes = [
  {
    title: 'Using a cloth tape measure',
    desc: 'Fabric tape stretches. Use a steel tape measure to the nearest 1/8" — that\'s the precision that keeps a measurement accurate from the living room to the workroom.',
  },
  {
    title: 'Measuring only once',
    desc: 'Framing settles over decades — measure width and height in three spots and use the smallest number for inside mount so the finished piece always fits.',
  },
  {
    title: 'Deducting anything yourself for inside mount',
    desc: 'Give us the exact inner frame opening as measured — don\'t subtract for clearance. We make the correct factory deductions on our end; deducting twice is a common cause of a too-small finished piece.',
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
    q: 'What\'s the difference between ripplefold and pinch pleat, style-wise?',
    a: 'Ripplefold gives a modern, continuous S-wave look and pairs especially well with motorized tracks — it does take up a bit more stack space at the sides when fully open than pinch pleat does, worth knowing if wall space beside the window is tight. Pinch pleat (2-fold or 3-fold) gives a more traditional, tailored look, with 3-fold reading fuller and more formal. For ripplefold, we only need your track length and drop and calculate the rest (carrier counts, fullness percentage) for you.',
  },
  {
    q: 'What if my walls or window frames aren\'t perfectly square?',
    a: 'Very common in older homes across the San Gabriel Valley — craftsman bungalows and mid-century houses especially. This is exactly why we always use the smallest of three measurements per dimension, and why in-home measurement exists: our workroom builds to the tightest number so everything still fits and operates smoothly.',
  },
  {
    q: 'Is the in-home measurement really free?',
    a: 'Yes, with no obligation to purchase. We come to you, measure every window ourselves, and show fabrics and samples in your actual lighting before you commit to anything. If you\'re not in our San Gabriel Valley service area, or just want to get a feel for materials first, you can also order up to 10 free fabric swatches online (you only pay shipping).',
  },
  {
    q: 'What if I measure it myself and get it wrong?',
    a: 'If your own measurement turns out to be off, we can remake or adjust the piece — you\'d just cover return shipping both ways. It\'s a straightforward fix, but ordering free swatches first and measuring carefully (or booking the free in-home measurement) is the easiest way to avoid the extra shipping cost and wait entirely.',
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
