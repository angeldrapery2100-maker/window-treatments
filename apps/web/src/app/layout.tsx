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
    url: 'https://angeldrapery.com',
    siteName: 'Angel Drapery',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://angeldrapery.com'),
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
