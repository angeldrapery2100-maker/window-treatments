import type { Metadata } from 'next'
import SavedDesignsClient from './SavedDesignsClient'

// Per-visitor data behind a cookie, so nothing here can be cached or
// pre-rendered. The shell is deliberately bare: this page doubles as the
// printed project sheet, and a hero would be the first thing on the paper.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Drapery Project',
  description: 'The drapery designs you have saved — fabrics, sizes, styles and reference estimates, ready to share with your consultant.',
  robots: { index: false, follow: false },
}

export default function SavedDesignsPage() {
  return <SavedDesignsClient />
}
