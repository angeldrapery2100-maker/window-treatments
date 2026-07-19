import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import MeasureWizardClient from './MeasureWizardClient'

// Interactive measurement wizard (Eddie 2026-07-19) — the form-style companion
// to the /how-to-measure guide. Drapery recommendations use the AAPP-parity
// engine in @window-treatments/shared/measure (client-side); shutter reference
// quotes come from /api/store/measure/shutter.

export const metadata: Metadata = {
  title: 'Measurement Wizard — Find Your Perfect Window Treatment Size',
  description:
    'Enter your window measurements and get the exact finished size our designers would recommend for custom drapery, the right order size for roman, roller, zebra and sheer shades, or an instant plantation shutter reference price.',
  alternates: { canonical: '/measure-wizard' },
}

export default function MeasureWizardPage() {
  return (
    <main className="w-full">
      {/* ── HERO ── */}
      <section className="relative w-full bg-[#12141C]">
        <SiteNav activePage="" />
        <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-40 md:pb-20 md:pt-48 lg:px-12">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.3em] text-[#4DB6E8]">
            Measurement Wizard
          </span>
          <h1 className="max-w-3xl text-4xl font-light leading-[1.08] tracking-tighter text-white md:text-6xl">
            Measure once. We&apos;ll do the math.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
            Answer a few questions and get the size our designers would recommend — the same rules our
            workroom uses every day. New to measuring? Read the{' '}
            <Link href="/how-to-measure" className="underline underline-offset-2 hover:text-white">
              measuring guide
            </Link>{' '}
            first.
          </p>
        </div>
      </section>

      {/* ── WIZARD ── */}
      <section className="w-full bg-white py-16 md:py-24">
        <MeasureWizardClient />
      </section>

      <SiteFooter />
    </main>
  )
}
