import type { Metadata } from 'next'
import CityPage from '../CityPage'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Custom Drapery & Window Treatments in Arcadia',
  description:
    'Custom drapery, motorized blackout shades, and Hunter Douglas window treatments for Arcadia homes. Oversized windows and sliding doors are our specialty. Free in-home measurement.',
  alternates: { canonical: '/service-areas/arcadia' },
}

export default function ArcadiaPage() {
  return (
    <CityPage
      slug="arcadia"
      heroTitle="Custom Drapery & Window Treatments in Arcadia"
      heroSub="Oversized windows, wide sliding doors, serious blackout — treatments built for newer Arcadia homes, ten minutes from our workroom."
      introLabel="Serving Arcadia"
      introHeading="Built for big windows."
      introParagraphs={[
        'Much of our Arcadia work happens in newer, larger single-family homes — tall living-room windows, wide sliding doors to the backyard, and bedrooms where full blackout is non-negotiable. These are exactly the projects where off-the-shelf treatments fall short.',
        'Because our workroom sews to any dimension, we regularly handle the extra-wide ripplefold tracks and motorized panels that sliding doors demand, and we line bedroom drapery for true darkness rather than “close enough.”',
      ]}
      services={[
        {
          title: 'Motorized Drapery Tracks',
          desc: 'Extra-wide ripplefold and pleated panels on quiet Somfy tracks — the practical answer to Arcadia’s big sliding doors.',
          href: '/products/handcrafted-drapery',
        },
        {
          title: 'Blackout Roman Shades',
          desc: 'Back-mounted shades with blackout lining, positioned to minimize light gaps in bedrooms and media rooms.',
          href: '/products/handcrafted-roman-shade',
        },
        {
          title: 'Smart Shades',
          desc: 'Schedule shades to rise with the morning and seal the room at night — HomeKit, Google Home, Matter, and Home Assistant supported.',
          href: '/smart-shades',
        },
        {
          title: 'Hunter Douglas',
          desc: 'Duette honeycomb shades and Silhouette shadings, measured and installed by an authorized dealer.',
          href: '/products',
        },
      ]}
      whyHeading="A short drive, a long warranty."
      facts={[
        {
          title: 'Since 1984',
          desc: 'The same family workroom has served the San Gabriel Valley for four decades — Arcadia is one of our busiest areas.',
        },
        {
          title: 'Free in-home measurement',
          desc: 'Large openings need precise measuring; we do it ourselves, free, before quoting anything.',
        },
        {
          title: '3-year installation warranty',
          desc: 'Tracks, brackets, and mounting are covered for three years of workmanship.',
        },
      ]}
      ctaHeading="Ready to cover the big glass?"
      ctaSub="Tell us about your windows and sliding doors — we'll measure for free and bring fabric and motor samples to your home."
    />
  )
}
