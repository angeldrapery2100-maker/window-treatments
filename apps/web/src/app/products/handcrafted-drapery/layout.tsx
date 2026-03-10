import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Handcrafted Drapery',
  description: 'Explore our handcrafted drapery collection — premium fabrics, custom designs, and expert craftsmanship from Angel Drapery.',
}

export default function HandcraftedDraperyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
