import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isValidReferralToken, lookupReferral, PARTNER_TYPES } from '@/lib/referral'
import ReferralLanding from './ReferralLanding'

// Referral landing page (推广系统 P1 §1.2).
//
// This URL is what gets pasted into WeChat, iMessage and Facebook, so it must
// BE the page — not a redirect — or the shared preview card loses the
// referrer's name. The ad_ref attribution cookie is seeded by the client
// island through /api/referral/claim (a Server Component cannot write cookies
// in Next 15); the page itself only reads.
//
// noindex on purpose: thousands of per-referrer URLs with near-identical copy
// are exactly the thin-content pattern that drags a site's quality signals
// down, and none of them are meant to rank.

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const ref = isValidReferralToken(token) ? await lookupReferral(token) : null

  const personal =
    ref && (ref.referrerType === 'customer' || PARTNER_TYPES.includes(ref.referrerType))
  const title = personal
    ? `${ref!.displayName} invited you — Free curtain AI consultant`
    : 'Free curtain AI consultant'
  const description =
    'Measure your windows and get an instant curtain estimate. Free in-home measure in Los Angeles.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/r/${token}`,
      siteName: 'Angel Drapery',
      type: 'website',
      images: [{ url: '/og-referral.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-referral.jpg'] },
    robots: { index: false, follow: false },
    alternates: { canonical: `/r/${token}` },
  }
}

export default async function ReferralPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const ref = isValidReferralToken(token) ? await lookupReferral(token) : null
  // A mistyped, revoked or expired link lands on the homepage rather than a
  // 404 — a printed QR code should never dead-end a customer.
  if (!ref) redirect('/')

  return (
    <ReferralLanding
      token={token}
      referrerType={ref.referrerType}
      displayName={ref.displayName}
      discountPct={ref.discountPct}
    />
  )
}
