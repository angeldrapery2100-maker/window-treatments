import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import { PRIMARY_PHONE } from '@/lib/site'
import { PARTNER_LINES } from '@/lib/partnerLines'

// Full warranty policy page — linked from the Luma product pages' warranty
// section (§5 of SONNET-任务书-Luma保修卖点-2026-08-29.md). All copy here is
// the single source of truth for warranty terms alongside docs/business-facts.md
// and LumaWarranty.tsx — do not restate years/terms elsewhere.

export const metadata: Metadata = {
  title: 'Warranty & Service',
  description:
    'Angel Drapery warranty coverage for the Luma Collection — up to 5 years on the product, 3 years on installation, and half-price replacement after the warranty ends. Family-owned in Los Angeles since 1984.',
  alternates: { canonical: '/warranty' },
}

const warrantyTable = [
  { product: 'Roller Shades', years: '5 years' },
  { product: 'Sheer Shades', years: '5 years' },
  { product: 'Dual Roller Shades', years: '5 years' },
  { product: 'Dual Sheer Shades', years: '5 years' },
  { product: 'Zebra Shades', years: '3 years' },
  { product: 'Modern Roman Shades', years: '3 years' },
]

const notCovered = [
  'Accidental damage, misuse, or abuse',
  'Damage from improper cleaning or harsh cleaning products',
  'Damage from customer self-installation, or from removal and reinstallation not performed by us',
  'Normal wear, and gradual fading or discoloration from sun exposure',
  'Unauthorized modification or third-party repair',
  'Products moved to a window other than the one they were originally made for',
]

const halfPriceTerms = [
  '50% off the current list price at the time of replacement — not the original purchase price',
  'Same window, same size as the original shade',
  'Original purchaser only; proof of purchase (order number or invoice) required',
  'One half-price replacement per window',
  'Not combinable with other promotions or discounts',
  'Covers the shade only — installation, shipping, and sales tax are not included',
  'Subject to the product line still being offered at the time of replacement',
]

// Partner Lines section renders straight from PARTNER_LINES (apps/web/src/lib/partnerLines.ts)
// — never a hand-written second copy of this text. Exact-string dedup only:
// no paraphrasing, so the merged points stay word-for-word what each
// manufacturer's warranty actually says.
function mergeWarrantyPoints(lines: { warrantyPoints: string[] }[]): string[] {
  const seen = new Set<string>()
  const merged: string[] = []
  for (const line of lines) {
    for (const point of line.warrantyPoints) {
      if (!seen.has(point)) {
        seen.add(point)
        merged.push(point)
      }
    }
  }
  return merged
}

const sundanceLines = [PARTNER_LINES['sundance-roller-shade'], PARTNER_LINES['sundance-wood-blind']]
const jcLines = [PARTNER_LINES['jc-woven-wood-shade'], PARTNER_LINES['jc-cambridge-shutter']]
const sundancePoints = mergeWarrantyPoints(sundanceLines)
const jcPoints = mergeWarrantyPoints(jcLines)

const partnerLinesTable = [
  { product: 'Roller Shade', manufacturer: 'Sundance Window Coverings', made: 'Arcadia, California', leadTime: '3–4 weeks' },
  { product: 'Wood Blind', manufacturer: 'Sundance Window Coverings', made: 'Arcadia, California', leadTime: '3–4 weeks' },
  { product: 'Woven Wood Shade', manufacturer: 'JC Window Fashions', made: 'Imported', leadTime: '5–8 weeks' },
  { product: 'Cambridge Shutter', manufacturer: 'JC Window Fashions', made: 'Imported', leadTime: '5–8 weeks' },
]

export default function WarrantyPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteNav activePage="" />

      {/* ── HERO / INTRO ── */}
      <section className="w-full bg-white pt-40 md:pt-48 pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            ANGEL DRAPERY · SINCE 1984
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-[#12141C] leading-[1.08]">
            Warranty &amp; Service
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mt-6 max-w-2xl">
            For forty years we&apos;ve measured, made, and installed window treatments in Los Angeles — same
            family, same crew. Here is exactly what we stand behind, in writing.
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="w-full bg-white pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto px-6 space-y-16">

          <div>
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-6">
              Luma Product Warranty
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#F7F6F3]">
                    <th className="px-6 py-3 font-semibold text-[#12141C]">Product</th>
                    <th className="px-6 py-3 font-semibold text-[#12141C]">Warranty</th>
                  </tr>
                </thead>
                <tbody>
                  {warrantyTable.map((row, i) => (
                    <tr key={row.product} className={i !== warrantyTable.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="px-6 py-3 text-gray-700">{row.product}</td>
                      <td className="px-6 py-3 text-gray-700">{row.years}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mt-6">
              Covers manufacturing and material defects — fabric, mechanism, motor, and hardware. Within the
              warranty period we repair or replace the affected shade at no charge for parts or product.
              Coverage begins on the date of delivery or installation.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-6">
              Installation Warranty — 3 Years
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Every Luma shade we install is installed by our own crew. For three years from the installation
              date, anything to do with that installation — brackets, alignment, operation — we come back and
              fix at no charge. Damage from accidents or misuse is not included.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-6">
              Service in Years 4 and 5
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Products with a five-year warranty remain covered for the product itself in years four and five.
              Because our installation warranty runs three years, a service visit in that window is billed for
              the trip and labor only — the replacement parts or shade are still free.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-6">
              Online Orders We Didn&apos;t Install
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Shades ordered through our online store and shipped to you carry the same product warranty.
              Because we didn&apos;t install them, service is handled by shipping: we send replacement parts, or
              arrange for the shade to come back to our workroom for repair, and we cover shipping both ways
              within the warranty period. On-site service is not included for orders outside our installation
              service area.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-6">
              Half-Price Replacement — After the Warranty Ends
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Once the product warranty on a Luma shade expires, that same window can be re-shaded with any
              Luma product at 50% off.
            </p>
            <ul className="space-y-3">
              {halfPriceTerms.map((term) => (
                <li key={term} className="flex gap-3 text-gray-500 text-sm leading-relaxed">
                  <span className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-2 h-1" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-6">
              What Isn&apos;t Covered
            </h2>
            <ul className="space-y-3">
              {notCovered.map((term) => (
                <li key={term} className="flex gap-3 text-gray-500 text-sm leading-relaxed">
                  <span className="w-1 shrink-0 rounded-full bg-gray-300 mt-2 h-1" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-6">
              How to Make a Claim
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Call {PRIMARY_PHONE} or email admin@angel-drapery.com with your order number and a photo of the
              issue. Online orders can also start at{' '}
              <Link href="/store/track" className="text-[#12141C] font-medium underline underline-offset-4 hover:text-[#4DB6E8]">
                Track Order
              </Link>
              . We&apos;ll tell you within one business day whether it&apos;s a warranty repair, a replacement,
              or something we can walk you through over the phone.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-light tracking-tighter text-[#12141C] mb-6">
              Partner Lines — Sundance &amp; JC
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Two of our lines come from suppliers we&apos;ve worked with for decades. Their warranties are
              their own, and we don&apos;t restate them loosely — here is what each manufacturer actually
              covers, and where our own coverage picks up.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-10">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#F7F6F3]">
                    <th className="px-6 py-3 font-semibold text-[#12141C]">Product</th>
                    <th className="px-6 py-3 font-semibold text-[#12141C]">Manufacturer</th>
                    <th className="px-6 py-3 font-semibold text-[#12141C]">Made</th>
                    <th className="px-6 py-3 font-semibold text-[#12141C]">Lead time</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerLinesTable.map((row, i) => (
                    <tr key={row.product} className={i !== partnerLinesTable.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="px-6 py-3 text-gray-700">{row.product}</td>
                      <td className="px-6 py-3 text-gray-700">{row.manufacturer}</td>
                      <td className="px-6 py-3 text-gray-700">{row.made}</td>
                      <td className="px-6 py-3 text-gray-700">{row.leadTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mb-10">
              <h3 className="text-lg font-semibold text-[#12141C] mb-4">Sundance Window Coverings</h3>
              <ul className="space-y-3 mb-4">
                {sundancePoints.map((point) => (
                  <li key={point} className="flex gap-3 text-gray-500 text-sm leading-relaxed">
                    <span className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-2 h-1" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">{sundanceLines[0].warrantyExclusions}</p>
              <p className="text-[11px] text-gray-300 leading-relaxed">{sundanceLines[0].warrantySource}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#12141C] mb-4">JC Window Fashions</h3>
              <ul className="space-y-3 mb-4">
                {jcPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-gray-500 text-sm leading-relaxed">
                    <span className="w-1 shrink-0 rounded-full bg-[#4DB6E8]/30 mt-2 h-1" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">{jcLines[0].warrantyExclusions}</p>
              <p className="text-[11px] text-gray-300 leading-relaxed">{jcLines[0].warrantySource}</p>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mt-10">
              <span className="font-semibold text-[#12141C]">Where our coverage picks up.</span> Both
              manufacturers exclude the same things: shipping, the trip charge, the labor for removal and
              reinstallation, and the cost of measuring. Our three-year installation warranty covers exactly
              that, on everything we install. Neither manufacturer covers fading from sun exposure, and we
              won&apos;t tell you otherwise.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/products"
              className="text-sm font-medium text-[#4DB6E8] hover:underline"
            >
              ← Back to Products
            </Link>
          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
