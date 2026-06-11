import type { Metadata } from 'next'
import CityPage from '../CityPage'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Custom Drapery & Window Treatments in San Gabriel | Angel Drapery',
  description:
    'Durable custom drapery, cordless roman shades, and motorized treatments for San Gabriel family homes. Free in-home measurement and a 3-year installation warranty.',
  alternates: { canonical: '/service-areas/san-gabriel' },
}

export default function SanGabrielPage() {
  return (
    <CityPage
      slug="san-gabriel"
      heroTitle="Custom Drapery & Window Treatments in San Gabriel"
      heroSub="Hard-working treatments for busy family homes — cordless, durable, and easy to live with, made just up the road."
      introLabel="Serving San Gabriel"
      introHeading="Made for full houses."
      introParagraphs={[
        'San Gabriel homes tend to be full — kids, grandparents, and everyone in between under one roof. The window treatments that work here are the ones that survive daily use: cordless lifts that are safe around children, washable and durable fabrics, and shades that go up and down a dozen times a day without complaint.',
        'Our workroom is a few minutes away in Temple City, which makes measuring, delivery, and any follow-up adjustment genuinely convenient for San Gabriel families.',
      ]}
      services={[
        {
          title: 'Cordless Roman Shades',
          desc: 'Child-safe cordless lifts as the default — no dangling cords in bedrooms or playrooms.',
          href: '/products/handcrafted-roman-shade',
        },
        {
          title: 'Everyday Drapery',
          desc: 'Durable, easy-care fabrics sewn into panels that handle daily opening and closing for years.',
          href: '/products/handcrafted-drapery',
        },
        {
          title: 'Motorized Shades',
          desc: 'One button (or one schedule) for the whole house — useful when several generations share the controls.',
          href: '/smart-shades',
        },
        {
          title: 'Hunter Douglas',
          desc: 'Authorized-dealer access to LiteRise and PowerView operating systems across the Hunter Douglas line.',
          href: '/products',
        },
      ]}
      whyHeading="Neighbors, not a call center."
      facts={[
        {
          title: 'Since 1984',
          desc: 'Forty years serving the San Gabriel Valley from one workroom — many customers are second-generation.',
        },
        {
          title: 'Free in-home measurement',
          desc: 'We schedule around your household, measure every window, and leave samples to live with.',
        },
        {
          title: '3-year installation warranty',
          desc: 'If a bracket loosens or a track needs adjusting, we come back and fix it — covered for three years.',
        },
      ]}
      ctaHeading="Let's make the windows easy."
      ctaSub="Book a free in-home measurement — evenings and weekends can usually be arranged for busy households."
    />
  )
}
