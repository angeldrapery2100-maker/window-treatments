'use client'

import dynamic from 'next/dynamic'

// The consultation widget is a floating CTA rendered on every page. It's not
// above-the-fold-critical, so we code-split it and load it on the client after
// hydration — keeping it (and its form logic) out of the initial bundle / SSR
// payload. A client wrapper is required because next/dynamic({ ssr: false })
// can't be used directly inside the Server Component root layout.
const ConsultationWidget = dynamic(() => import('./ConsultationWidget'), {
  ssr: false,
  loading: () => null,
})

export default function ConsultationWidgetLoader() {
  return <ConsultationWidget />
}
