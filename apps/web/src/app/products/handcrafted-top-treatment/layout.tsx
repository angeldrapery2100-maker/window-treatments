import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Handcrafted Top Treatments',
  description: 'Discover our handcrafted top treatment collection — cornices, valances, and swags custom made for your windows by Angel Drapery.',
  alternates: { canonical: '/products/handcrafted-top-treatment' },
}

export default function HandcraftedTopTreatmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
