import type { Metadata } from 'next'
import AngelDraperyApp from "@/features/angel-drapery-software/AngelDraperyApp";

// Internal preview tool — must not appear in search results or share as a
// public-facing page. Middleware also sends X-Robots-Tag: noindex, nofollow
// for this path as a second layer.
export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
  alternates: { canonical: '/angel-preview' },
}

export default function Page() {
  return <AngelDraperyApp />;
}
