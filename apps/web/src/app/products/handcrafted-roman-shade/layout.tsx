import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Handcrafted Roman Shades',
  description: 'Explore our handcrafted Roman shade collection — elegant designs with premium fabrics from Angel Drapery.',
  alternates: { canonical: '/products/handcrafted-roman-shade' },
}

export default function HandcraftedRomanShadeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
