import type { Metadata } from 'next'
import { Suspense } from 'react'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import DesignClient from './DesignClient'
import { featuredFabrics, fabricImageUrl } from '@/lib/draperyFabricLibrary'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Design Your Drapery',
  description:
    'Pick a fabric, enter your finished size, choose a heading and hardware, and see a reference estimate for custom drapery made in our own workroom.',
  alternates: { canonical: '/design' },
}

export default function DesignPage() {
  // A visitor who lands here cold still has something to start from — the
  // shortlist is never a precondition (Eddie, 2026-08-11).
  const defaults = featuredFabrics().map((f) => ({
    id: f.id,
    name: f.name,
    color: f.color,
    brand: f.brand,
    thumbUrl: fabricImageUrl(f.img, 'thumb'),
    sheer: f.sheer,
    priceStatus: f.priceStatus,
  }))

  return (
    <main className="min-h-screen bg-white">
      <section className="relative w-full bg-[#12141C]">
        <SiteNav activePage="" />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-36 md:pt-44 pb-10">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            Handcrafted Drapery
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-white leading-[1.08]">
            Design Your Drapery
          </h1>
        </div>
      </section>

      <Suspense fallback={<div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 text-sm text-gray-500">Loading the designer…</div>}>
        <DesignClient defaultFabrics={defaults} />
      </Suspense>

      <SiteFooter dark />
    </main>
  )
}
