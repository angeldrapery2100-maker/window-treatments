import type { Metadata } from 'next'
import CityPage from '../CityPage'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Custom Drapery & Window Treatments in Pasadena | Angel Drapery',
  description:
    'Custom drapery, roman shades, and smart motorized shades for Pasadena craftsman bungalows, condos, and everything in between. Free in-home measurement, since 1984.',
  alternates: { canonical: '/service-areas/pasadena' },
}

export default function PasadenaPage() {
  return (
    <CityPage
      slug="pasadena"
      heroTitle="Custom Drapery & Window Treatments in Pasadena"
      heroSub="Craftsman bungalows, mid-century houses, and new condos all live side by side here — and each asks for different windows treatments."
      introLabel="Serving Pasadena"
      introHeading="One city, many kinds of windows."
      introParagraphs={[
        'No two Pasadena streets look alike. A craftsman bungalow with wood casings and divided-light windows wants something very different from a Playhouse District condo with floor-to-ceiling glass. We design for the specific window in front of us, not for a catalog page.',
        'Roman shades mounted inside original wood frames, simple roller shades for condo glass, full drapery for dining rooms — our in-house workroom makes all of it to measure.',
      ]}
      services={[
        {
          title: 'Roman Shades for Bungalows',
          desc: 'Inside-mount romans that preserve craftsman wood casings and divided-light character.',
          href: '/products/handcrafted-roman-shade',
        },
        {
          title: 'Custom Drapery',
          desc: 'From relaxed linen panels to formal pleats — sewn in our own workroom from thousands of fabrics.',
          href: '/products/handcrafted-drapery',
        },
        {
          title: 'Smart Shades for Condos',
          desc: 'Motorized roller and cellular shades for big glass — scheduled, app-controlled, and voice-ready.',
          href: '/smart-shades',
        },
        {
          title: 'Hunter Douglas',
          desc: 'The full authorized-dealer lineup, including Duette honeycomb shades for energy-conscious households.',
          href: '/products',
        },
      ]}
      whyHeading="Designed window by window."
      facts={[
        {
          title: 'Four decades of work nearby',
          desc: 'Founded in 1984 in Temple City — Pasadena projects have been part of the books almost from the start.',
        },
        {
          title: 'Free in-home measurement',
          desc: 'We come to you, measure precisely, and show fabrics in your actual light. No charge, no obligation.',
        },
        {
          title: '3-year installation warranty',
          desc: 'Every installation — bungalow or high-rise — carries a three-year workmanship warranty.',
        },
      ]}
      ctaHeading="What kind of windows do you have?"
      ctaSub="Whatever the answer, a free in-home consultation is the right first step. Call or send us a note."
    />
  )
}
