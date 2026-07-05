import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import { COPYRIGHT, PRIMARY_PHONE } from '@/lib/site'
import { CITIES } from './cities'

// Shared layout for the six city landing pages. The LAYOUT is shared;
// every word of copy comes in via props so each city page reads
// differently (sentence structure, emphasis, service descriptions).
// Note: city case-photo sections are intentionally omitted for now —
// they can be added later via a CMS slot once local photos exist.

export interface CityService {
  title: string
  desc: string
  href: string
}

export interface CityFact {
  title: string
  desc: string
}

export interface CityPageProps {
  slug: string
  /** H1, e.g. "Custom Drapery & Window Treatments in Arcadia" */
  heroTitle: string
  heroSub: string
  introLabel: string
  introHeading: string
  introParagraphs: string[]
  services: CityService[]
  whyHeading: string
  facts: CityFact[]
  ctaHeading: string
  ctaSub: string
}

export default function CityPage(props: CityPageProps) {
  const others = CITIES.filter((c) => c.slug !== props.slug)

  return (
    <main className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative w-full bg-[#12141C] overflow-hidden">
        <SiteNav activePage="" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 md:pt-48 pb-20 md:pb-24">
          <nav className="flex items-center gap-2 text-white/40 text-xs tracking-[0.2em] uppercase mb-6">
            <Link href="/service-areas" className="hover:text-white/70 transition-colors">Service Areas</Link>
            <span>/</span>
            <span className="text-white/70">{CITIES.find((c) => c.slug === props.slug)?.name}</span>
          </nav>
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Angel Drapery · Since 1984
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white leading-[1.08] max-w-3xl">
            {props.heroTitle}
          </h1>
          <p className="text-white/50 text-sm md:text-base leading-relaxed mt-6 max-w-xl">{props.heroSub}</p>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
              {props.introLabel}
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-6">
              {props.introHeading}
            </h2>
            {props.introParagraphs.map((p, i) => (
              <p key={i} className={`text-sm leading-relaxed max-w-2xl ${i === 0 ? 'text-gray-500 mb-5' : 'text-gray-400'}`}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="w-full bg-[#F7F5F2] py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            What We Make &amp; Install
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C] mb-12">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {props.services.map((s) => (
              <Link key={s.title} href={s.href} className="group">
                <div className="bg-white rounded-2xl p-7 h-full shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-8 h-1 rounded-full bg-[#4DB6E8]/40 mb-5" />
                  <h3 className="text-base font-semibold text-[#12141C] mb-2 tracking-tight group-hover:text-[#4DB6E8] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NEIGHBORS CHOOSE US ── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
                Why Neighbors Choose Us
              </span>
              <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#12141C]">{props.whyHeading}</h2>
            </div>
            <div className="space-y-6">
              {props.facts.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-1" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#12141C] mb-0.5 tracking-tight">{f.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="w-full bg-[#12141C] py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Free In-Home Measurement
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-white mb-6">{props.ctaHeading}</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-md mx-auto">{props.ctaSub}</p>
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

      {/* ── ALSO SERVING ── */}
      <section className="w-full bg-white py-10 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center text-sm text-gray-400">
          <span className="tracking-wide">Also serving: </span>
          {others.map((c, i) => (
            <span key={c.slug}>
              <Link href={`/service-areas/${c.slug}`} className="text-[#4DB6E8] hover:underline">
                {c.name}
              </Link>
              {i < others.length - 1 && <span> · </span>}
            </span>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <SiteFooter />
    </main>
  )
}
