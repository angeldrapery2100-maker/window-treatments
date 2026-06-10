import type { Metadata } from 'next'
import LutronPalladiomClient from './LutronPalladiomClient'

export const metadata: Metadata = {
  title: 'Lutron PALLADIOM® Shading System',
  description: 'PALLADIOM® by Lutron — engineered to be beautiful. Whisper-quiet automated roller shades with machined aluminum brackets, carbon fiber tube, and Intelligent Hembar Alignment technology.',
  alternates: { canonical: '/products/lutron-palladiom' },
}

export default function LutronPalladiomPage() {
  return <LutronPalladiomClient />
}
