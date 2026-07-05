import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Store',
  description: 'Shop premium custom window treatments online — drapery, sheers, shades, and hardware from Angel Drapery.',
  alternates: { canonical: '/store' },
}

// Note: the AI shopping assistant (StoreAssistant) is mounted site-wide from
// the root layout now — nothing store-specific to render here.
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
