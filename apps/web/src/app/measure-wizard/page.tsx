import type { Metadata } from 'next'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import MeasureWizardPageClient from './MeasureWizardPageClient'

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
    <main className="relative w-full">
      <SiteNav activePage="" />
      <MeasureWizardPageClient />
      <SiteFooter />
    </main>
  )
}
