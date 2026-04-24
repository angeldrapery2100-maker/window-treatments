import type { Metadata } from 'next'
import LumaCollectionClient from './LumaCollectionClient'

export const metadata: Metadata = {
  title: 'Luma Collection — Zebra Shades | Angel Drapery',
  description: 'The Luma Collection by Angel Drapery — premium zebra shades with dual-layer light control. Available in cordless, continuous chain, and Matter-enabled motorized options. 46 fabric patterns, 220+ colors.',
  alternates: { canonical: '/products/luma-collection' },
}

export default function LumaCollectionPage() {
  return <LumaCollectionClient />
}
