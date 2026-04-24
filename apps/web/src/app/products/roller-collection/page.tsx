import type { Metadata } from 'next'
import RollerCollectionClient from './RollerCollectionClient'

export const metadata: Metadata = {
  title: 'Luma Roller Shades | Angel Drapery',
  description: 'Luma Roller Shades — precision-crafted roller shades in blackout, light-filtering, and solar screen fabrics. 82 patterns, 354+ colors, smart home ready.',
  alternates: { canonical: '/products/roller-collection' },
}

export default function RollerCollectionPage() {
  return <RollerCollectionClient />
}
