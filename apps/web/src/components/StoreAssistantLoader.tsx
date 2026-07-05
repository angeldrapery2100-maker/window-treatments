'use client'

import dynamic from 'next/dynamic'

// The AI design assistant is a floating chat widget rendered on every page
// (it repositions itself around the ConsultationWidget on marketing pages).
// Like the consultation widget, it's not above-the-fold-critical, so we
// code-split it and load it on the client after hydration. A client wrapper
// is required because next/dynamic({ ssr: false }) can't be used directly
// inside the Server Component root layout.
const StoreAssistant = dynamic(() => import('./StoreAssistant'), {
  ssr: false,
  loading: () => null,
})

export default function StoreAssistantLoader() {
  return <StoreAssistant />
}
