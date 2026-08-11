import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import DesignClient from './DesignClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Design Your Drapery',
  description:
    'Pick a fabric, enter your finished size, choose a heading and hardware, and see a reference estimate for custom drapery made in our own workroom.',
  alternates: { canonical: '/design' },
}

/**
 * A shell, deliberately.
 *
 * This page used to import the fabric library so it could hand the seeded
 * default swatches down as props — pulling a 6 MB JSON into the route's
 * server bundle to render fourteen thumbnails, and doing it during prerender.
 * The client already fetches its favourites; it fetches the defaults from
 * /api/fabrics/featured the same way, which is cached hard at the edge and
 * shared with the Handcrafted Drapery teaser.
 */
export default function DesignPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative w-full bg-[#12141C]">
        <SiteNav activePage="" />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-36 md:pt-44 pb-10">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-3">
            Handcrafted Drapery
          </span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-white leading-[1.08]">
              Design Your Drapery
            </h1>
            <Link
              href="/design/saved"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              My project →
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 text-sm text-gray-500">Loading the designer…</div>}>
        <DesignClient />
      </Suspense>

      <SiteFooter dark />
    </main>
  )
}
