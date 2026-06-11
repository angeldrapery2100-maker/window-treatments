import type { Metadata } from 'next'
import CityPage from '../CityPage'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Custom Drapery & Window Treatments in Temple City | Angel Drapery',
  description:
    'Angel Drapery has made custom drapery, roman shades, and motorized window treatments in Temple City since 1984. Workroom and showroom on Las Tunas Drive. Free in-home measurement.',
  alternates: { canonical: '/service-areas/temple-city' },
}

export default function TempleCityPage() {
  return (
    <CityPage
      slug="temple-city"
      heroTitle="Custom Drapery & Window Treatments in Temple City"
      heroSub="Made in our own workroom on Las Tunas Drive — measured, sewn, and installed by the same team since 1984."
      introLabel="Our Hometown"
      introHeading="Forty years on Las Tunas Drive."
      introParagraphs={[
        'Temple City is where Angel Drapery started, and it is still where every panel and shade is cut and sewn. Our showroom and workroom sit right on Las Tunas Drive, so a fabric consultation here is often a same-week visit rather than a scheduled trip.',
        'Many of the homes we dress today belong to families who have been our neighbors for decades — when something needs adjusting years after installation, we are minutes away.',
      ]}
      services={[
        {
          title: 'Handcrafted Drapery',
          desc: 'Pleated, ripplefold, and sheer panels sewn in-house — bring your fabric or choose from thousands of options in our showroom.',
          href: '/products/handcrafted-drapery',
        },
        {
          title: 'Roman Shades',
          desc: 'Six fold styles made to your exact window dimensions, with light-filtering, room-darkening, or blackout linings.',
          href: '/products/handcrafted-roman-shade',
        },
        {
          title: 'Smart Motorized Shades',
          desc: 'Somfy and Hunter Douglas PowerView motorization that works with Apple HomeKit, Google Home, Matter, and Home Assistant.',
          href: '/smart-shades',
        },
        {
          title: 'Hunter Douglas',
          desc: 'As an authorized dealer, we measure, order, and install the full Hunter Douglas line — Duette, Silhouette, Luminette, and more.',
          href: '/products',
        },
      ]}
      whyHeading="The workroom is the showroom."
      facts={[
        {
          title: 'In business since 1984',
          desc: 'Four decades of continuous operation from the same Temple City address — not a franchise, not a pop-up.',
        },
        {
          title: 'Free in-home measurement',
          desc: 'We measure every window ourselves before anything is made, at no charge anywhere in our service area.',
        },
        {
          title: '3-year installation warranty',
          desc: 'Our installation workmanship is covered for three years; being local means warranty visits are quick.',
        },
      ]}
      ctaHeading="Stop by, or we'll come to you."
      ctaSub="Visit the showroom at 8831 E Las Tunas Dr, or book a free in-home measurement and bring the fabric samples to your own light."
    />
  )
}
