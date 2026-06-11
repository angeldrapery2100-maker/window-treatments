import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import FooterSocial from '@/components/FooterSocial'
import { COPYRIGHT, PRIMARY_PHONE } from '@/lib/site'
import { CITIES } from './cities'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Service Areas | Custom Window Treatments in the San Gabriel Valley | Angel Drapery',
  description:
    'Angel Drapery serves Temple City, Arcadia, San Marino, Pasadena, San Gabriel, and Alhambra with custom drapery, roman shades, and smart motorized shades. Free in-home measurement.',
  alternates: { canonical: '/service-areas' },
}

export default function ServiceAreasIndexPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative w-full bg-[#12141C]">
        <SiteNav activePage="" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 md:pt-48 pb-20 md:pb-24">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Angel Drapery · Since 1984
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white leading-[1.08] max-w-3xl">
            Where We Work
          </h1>
          <p className="text-white/50 text-sm md:text-base leading-relaxed mt-6 max-w-xl">
            Custom drapery, roman shades, and smart motorized shades across the San Gabriel Valley —
            with free in-home measurement throughout our service area.
          </p>
        </div>
      </section>

      {/* ── CITY LIST ── */}
      <section className="w-full bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CITIES.map((c) => (
              <Link key={c.slug} href={`/service-areas/${c.slug}`} className="group">
                <div className="bg-[#F7F5F2] rounded-2xl p-8 h-full hover:shadow-md transition-shadow">
                  <div className="w-8 h-1 rounded-full bg-[#4DB6E8]/40 mb-5" />
                  <h2 className="text-xl font-light tracking-tight text-[#12141C] mb-2 group-hover:text-[#4DB6E8] transition-colors">
                    {c.name}
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">{c.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-12 max-w-xl">
            Outside these cities? We often travel further for larger projects — call{' '}
            <a href={`tel:${PRIMARY_PHONE}`} className="text-[#4DB6E8] hover:underline">{PRIMARY_PHONE}</a>{' '}
            or <Link href="/contact" className="text-[#4DB6E8] hover:underline">send us a note</Link> and ask.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <FooterSocial />
            <div className="text-center text-sm text-gray-600">{COPYRIGHT}</div>
          </div>
        </div>
      </footer>
    </main>
  )
}
