import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Order | Angel Drapery',
  description: 'Check the status of your Angel Drapery order using your order number and email address.',
  robots: { index: false },
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children
}
