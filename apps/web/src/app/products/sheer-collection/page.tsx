import type { Metadata } from 'next'
import SheerCollectionClient from './SheerCollectionClient'

export const metadata: Metadata = {
  title: 'Luma Sheer Shades',
  description: 'Luma Sheer Shades — softly diffuse natural light while maintaining your view. 16 patterns, 98 colors, smart home ready.',
  alternates: { canonical: '/products/sheer-collection' },
}

export default function SheerCollectionPage() {
  return <SheerCollectionClient />
}
