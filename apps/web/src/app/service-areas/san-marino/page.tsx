import type { Metadata } from 'next'
import CityPage from '../CityPage'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Custom Drapery & Window Treatments in San Marino',
  description:
    'Traditional pleated drapery, roman shades, and Hunter Douglas treatments for San Marino estates. Preservation-minded measuring and installation since 1984.',
  alternates: { canonical: '/service-areas/san-marino' },
}

export default function SanMarinoPage() {
  return (
    <CityPage
      slug="san-marino"
      heroTitle="Custom Drapery & Window Treatments in San Marino"
      heroSub="Traditional pleated drapery and tailored shades for historic estates — installed with the care those homes deserve."
      introLabel="Serving San Marino"
      introHeading="Respect for older houses."
      introParagraphs={[
        'San Marino’s estates were built with proportions and millwork that deserve traditional treatments: hand-pleated drapery, lined and interlined panels, and roman shades that follow the architecture instead of fighting it. This is the kind of sewing our workroom has done since 1984.',
        'We are also careful installers. Original plaster, vintage casings, and old hardwood call for thoughtful bracket placement and clean drilling — we plan mounting points around the house, not through it.',
      ]}
      services={[
        {
          title: 'Traditional Pleated Drapery',
          desc: 'French pleat, goblet, and pinch-pleat panels, lined and interlined, hung on classic or concealed hardware.',
          href: '/products/handcrafted-drapery',
        },
        {
          title: 'Roman Shades & Top Treatments',
          desc: 'Soft and hobbled romans, valances, and cornices that suit period rooms and library walls.',
          href: '/products/handcrafted-roman-shade',
        },
        {
          title: 'Discreet Motorization',
          desc: 'Quiet, wire-free Somfy and PowerView motors hidden in the headrail — modern convenience without visible technology.',
          href: '/smart-shades',
        },
        {
          title: 'Hunter Douglas',
          desc: 'Silhouette and Luminette shadings for sunrooms and large traditional windows, from an authorized dealer.',
          href: '/products',
        },
      ]}
      whyHeading="Craft that matches the house."
      facts={[
        {
          title: 'Workroom since 1984',
          desc: 'Traditional construction techniques — hand-tacked pleats, weighted hems, interlining — are still standard practice here.',
        },
        {
          title: 'Free in-home measurement',
          desc: 'Older windows are rarely square; we measure each opening individually, at no charge.',
        },
        {
          title: '3-year installation warranty',
          desc: 'Careful mounting backed by a three-year workmanship warranty on every installation.',
        },
      ]}
      ctaHeading="Let's talk about your windows."
      ctaSub="A free in-home consultation lets us see the rooms, the light, and the architecture before recommending anything."
    />
  )
}
