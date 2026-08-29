import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import { PRIMARY_PHONE } from '@/lib/site'

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
