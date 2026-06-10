import './globals.css'
import type { Metadata } from 'next'
import ConsultationWidget from '@/components/ConsultationWidgetLoader'
import MotionProvider from '@/components/MotionProvider'

// ─── schema.org LocalBusiness ─────────────────────────────────────────────
// Surfaces the shop in Google's local results, Knowledge Panel and Maps.
// Keep in sync with the contact page. Update telephone / openingHours if the
// shop relocates or changes its schedule — stale structured data is worse
// than none because Google cross-checks it against the NAP (name / address
// / phone) seen elsewhere on the site.
const LOCAL_BUSINESS_LD = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': 'https://angel-drapery.com/#business',
  name: 'Angel Drapery, Inc',
  alternateName: 'Angel Drapery',
  description:
    'Custom window-treatment fabrication and installation — handcrafted drapery, roman shades, Hunter Douglas blinds and shutters — serving the greater Los Angeles area since 1984.',
  url: 'https://angel-drapery.com',
  logo: 'https://angel-drapery.com/og-image.jpg',
  image: 'https://angel-drapery.com/og-image.jpg',
  telephone: '+1-626-451-9841',
  foundingDate: '1984',
  priceRange: '$$-$$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '8831 E Las Tunas Dr',
    addressLocality: 'Temple City',
    addressRegion: 'CA',
    postalCode: '91780',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'City', name: 'Los Angeles' },
    { '@type': 'City', name: 'Pasadena' },
    { '@type': 'City', name: 'Temple City' },
    { '@type': 'AdministrativeArea', name: 'Los Angeles County' },
    { '@type': 'AdministrativeArea', name: 'Orange County' },
  ],
  makesOffer: [
    'Custom handcrafted drapery',
    'Roman shades',
    'Hunter Douglas blinds and shutters',
    'Top treatments and valances',
    'Motorized window coverings',
  ].map(name => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
  sameAs: [
    'https://www.instagram.com/angeldraperyinc/',
  ],
} as const

export const metadata: Metadata = {
  title: {
    default: 'Angel Drapery, Inc — Custom Window Treatments Since 1984',
    template: '%s | Angel Drapery',
  },
  description:
    'Premium custom window treatments in Los Angeles. Handcrafted drapery, roman shades, Hunter Douglas blinds & shutters. 40+ years of expert design, fabrication & installation.',
  keywords: [
    'custom drapery',
    'window treatments',
    'Hunter Douglas',
    'roman shades',
    'blinds',
    'shutters',
    'Los Angeles',
    'Temple City',
    'Angel Drapery',
  ],
  openGraph: {
    title: 'Angel Drapery, Inc — Custom Window Treatments Since 1984',
    description:
      'Premium custom window treatments in Los Angeles. Handcrafted drapery, roman shades, Hunter Douglas blinds & shutters.',
    url: 'https://angel-drapery.com',
    siteName: 'Angel Drapery',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Angel Drapery — Custom window treatments in Los Angeles since 1984',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Angel Drapery, Inc — Custom Window Treatments Since 1984',
    description:
      'Premium custom window treatments in Los Angeles. Handcrafted drapery, roman shades, Hunter Douglas blinds & shutters.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://angel-drapery.com'),
  // Root-level canonical covers the homepage. Per-page metadata overrides this
  // (e.g. /about → alternates.canonical '/about') so every page publishes its
  // own canonical URL; without this default, the homepage emits no canonical
  // and risks being deduped against trailing-slash or query variants.
  alternates: { canonical: '/' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Warm up the connection to the R2 CDN that serves all images/videos,
            so the first asset fetch skips DNS + TLS negotiation (helps LCP). */}
        <link rel="preconnect" href="https://pub-9090ea94bda94d6daf755d6ce4b62812.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-9090ea94bda94d6daf755d6ce4b62812.r2.dev" />
        {/* schema.org LocalBusiness — feeds Google Knowledge Panel, Maps,
            and "near me" local results. Rendered once, in the root layout,
            so every page inherits the same business identity. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_LD) }}
        />
      </head>
      <body suppressHydrationWarning>
        <MotionProvider>
          {children}
          <ConsultationWidget />
        </MotionProvider>
      </body>
    </html>
  )
}
