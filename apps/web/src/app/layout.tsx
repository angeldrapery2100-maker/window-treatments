import './globals.css'
import type { Metadata } from 'next'
import ConsultationWidget from '@/components/ConsultationWidget'

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
      </head>
      <body suppressHydrationWarning>
        {children}
        <ConsultationWidget />
      </body>
    </html>
  )
}
