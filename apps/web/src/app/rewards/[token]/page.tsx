import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchReferralPortal, isValidReferralToken } from '@/lib/referral'
import { qrPng } from '@/lib/qrSvg'
import RewardsClient from './RewardsClient'

// Customer rewards portal (推广系统 P1 §1.5).
//
// The token is the capability: whoever holds the link sees this page, so the
// metadata below carries NO name and NO code — a link pasted into a group
// chat must not leak who it belongs to through the preview card. Live data
// (progress, preferences) means force-dynamic + no-store, the latter set as a
// real response header in next.config.ts.

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const title = 'Your Exclusive Rewards'
  const description = 'Your Angel Drapery rewards: personal code, level, benefits and referral progress.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/rewards/${token}`,
      siteName: 'Angel Drapery',
      type: 'website',
      images: [{ url: '/og-rewards.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-rewards.jpg'] },
    robots: { index: false, follow: false },
    alternates: { canonical: `/rewards/${token}` },
  }
}

export default async function RewardsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const portal = isValidReferralToken(token) ? await fetchReferralPortal(token) : null
  // Partners have their own page (/partner/<token>) with different rules —
  // no tier ladder, no percentages, a W-9 block. Anything that is not a
  // customer portal is a 404 here.
  if (!portal || portal.type !== 'customer') notFound()

  const qr = await qrPng(portal.shareUrl)

  return (
    <RewardsClient
      portal={portal}
      qr={qr}
      reviewUrl={process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || ''}
    />
  )
}
