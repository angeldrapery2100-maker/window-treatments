import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Write a Review | Angel Drapery',
  description: 'Share your experience with your Angel Drapery order.',
  robots: { index: false },
}

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children
}
