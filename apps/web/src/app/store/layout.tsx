import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Store',
  description: 'Shop premium custom window treatments online — drapery, sheers, shades, and hardware from Angel Drapery.',
  alternates: { canonical: '/store' },
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
