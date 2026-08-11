import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import { ESTIMATE_DISCLAIMER_LONG } from '@/lib/estimateCopy'
import { fabricDetail, getFabric } from '@/lib/draperyFabricLibrary'
import FabricFavoriteButton from './FabricFavoriteButton'

// Rendered on demand and cached. There are 10,845 colourways — pre-rendering
// them all would be a pointless build, and almost nobody deep-links to a
// specific one; the drawer on /fabrics is the usual way in.
export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 86400

export async function generateStaticParams() { return [] }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const f = getFabric(decodeURIComponent(id))
  if (!f) return { title: 'Fabric not found' }
  return {
    title: `${f.name} — ${f.color} | ${f.brand} drapery fabric`,
    description: `${f.name} in ${f.color} by ${f.brand}. ${f.material}${f.widthIn ? `, ${f.widthIn}" wide` : ''}. Available for custom drapery and roman shades from Angel Drapery.`,
    alternates: { canonical: `/fabrics/${encodeURIComponent(f.id)}` },
  }
}

export default async function FabricDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const found = getFabric(decodeURIComponent(id))
  if (!found) notFound()
  const f = fabricDetail(found)

  const specs: Array<[string, string | null]> = [
    ['Fibre content', f.material],
    ['Width', f.widthIn ? `${f.widthIn}"` : null],
    ['Type', f.sheer ? 'Sheer' : 'Drapery fabric'],
    ['Pattern', f.patternType],
    ['Style', f.style],
    ['Pattern repeat', f.repeatVIn || f.repeatHIn
      ? [f.repeatVIn ? `${f.repeatVIn}" vertical` : null, f.repeatHIn ? `${f.repeatHIn}" horizontal` : null].filter(Boolean).join(' · ')
      : 'No repeat'],
    ['Collection', f.book],
    ['Made in', f.origin],
    ['Fabric price', f.pricePerYard != null ? `$${f.pricePerYard}/yd` : null],
  ]

  return (
    <main className="min-h-screen bg-white">
      <section className="relative w-full bg-[#12141C]">
        <SiteNav activePage="" />
        <div className="h-28 md:h-32" />
      </section>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-10 md:py-16">
        <Link href="/fabrics" className="text-sm text-gray-500 underline underline-offset-4 hover:text-black">
          ← Back to the fabric library
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
            {f.largeUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={f.largeUrl} alt={`${f.name} in ${f.color}`} className="h-full w-full object-cover" />
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400">{f.brand}</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-light tracking-tight text-gray-900">{f.name}</h1>
            <p className="mt-1 text-lg text-gray-500">{f.color}</p>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {specs.filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className={label === 'Fibre content' || label === 'Collection' || label === 'Pattern repeat' ? 'col-span-2' : ''}>
                  <dt className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</dt>
                  <dd className="mt-0.5 text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>

            {f.priceStatus === 'ask_in_store' && (
              <p className="mt-6 rounded-lg bg-[#F7F6F3] px-4 py-3 text-sm text-gray-600">
                Price on consultation — we haven&apos;t published a yardage price for this colourway yet.
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/design?fabric=${encodeURIComponent(f.id)}`}
                className="rounded-full bg-[#12141C] px-6 py-3 text-sm font-medium text-white hover:bg-black"
              >
                Design with this fabric
              </Link>
              <FabricFavoriteButton id={f.id} />
              <Link href="/contact" className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-800 hover:border-gray-500">
                Request a sample
              </Link>
            </div>

            <p className="mt-8 text-[11px] leading-relaxed text-gray-400">{ESTIMATE_DISCLAIMER_LONG}</p>
          </div>
        </div>
      </div>

      <SiteFooter dark />
    </main>
  )
}
