import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import FabricLibraryClient from './FabricLibraryClient'
import { FABRIC_COUNT } from '@/lib/draperyFabricLibrary'

// The fabric library is a build artefact — it only changes when someone
// re-runs build-fabric-catalog.mjs and deploys — so the shell is fully static
// and the grid hydrates from the cached /api/fabrics payload.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Fabric Library — Custom Drapery Fabrics',
  description:
    'Browse our full drapery and sheer fabric library from Carole, Alendel and Kaslen — filter by colour, material, pattern, style and price, save your favourites, and take them straight into a design.',
  alternates: { canonical: '/fabrics' },
}

export default function FabricsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative w-full bg-[#12141C]">
        <SiteNav activePage="" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-40 md:pt-48 pb-14 md:pb-16">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            Handcrafted Drapery
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white leading-[1.08] max-w-3xl">
            Fabric Library
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-white/70 leading-relaxed">
            {FABRIC_COUNT.toLocaleString()} colourways from Carole, Alendel and Kaslen. Filter down to
            the ones you like, save them, then take them into the designer to see what they cost made
            to your windows.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/design" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#12141C] hover:bg-gray-100">
              Design your drapery
            </Link>
            <Link href="/contact" className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10">
              Request samples
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 md:py-14">
        <Suspense fallback={<p className="text-sm text-gray-500">Loading fabrics…</p>}>
          <FabricLibraryClient />
        </Suspense>
      </section>

      <SiteFooter dark />
    </main>
  )
}
