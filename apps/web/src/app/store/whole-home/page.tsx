import type { Metadata } from 'next'
import WholeHomeClient from './WholeHomeClient'

export const metadata: Metadata = {
  title: 'Whole-Home Custom Window Treatments | Angel Drapery',
  description:
    'Furnishing multiple rooms or a whole home? Our design team helps you measure, choose fabrics, and quote — free in-home consultation within our LA service area, or remote assistance with photos.',
  alternates: { canonical: '/store/whole-home' },
}

export default function WholeHomePage() {
  return <WholeHomeClient />
}
