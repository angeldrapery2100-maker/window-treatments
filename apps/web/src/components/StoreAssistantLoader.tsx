'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

// The AI design assistant is a floating chat widget rendered on every page —
// the site's only floating entry point (the standalone consultation pill was
// removed 2026-07-22). It's not above-the-fold-critical, so we code-split it
// and load it on the client after hydration. A client wrapper
// is required because next/dynamic({ ssr: false }) can't be used directly
// inside the Server Component root layout.
const StoreAssistant = dynamic(() => import('./StoreAssistant'), {
  ssr: false,
  loading: () => null,
})

export default function StoreAssistantLoader() {
  const pathname = usePathname()
  // The customer-facing shopping assistant has no place in the admin / sales
  // back office — hide it on every /admin route.
  if (pathname?.startsWith('/admin')) return null
  return <StoreAssistant />
}
