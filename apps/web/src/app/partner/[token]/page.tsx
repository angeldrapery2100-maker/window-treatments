import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchReferralPortal, isValidReferralToken, PARTNER_TYPES } from '@/lib/referral'
import { qrPng } from '@/lib/qrSvg'
import PartnerClient from './PartnerClient'

// Partner portal (推广系统 P1 §1.6) — realtors, designers, contractors.
//
// Deliberately shows NO dollar figures: commission is a contract matter
// handled by the office, and a link that can be forwarded is the wrong place
// for it. Counts only, plus the W-9 gate that has to be cleared before
// anything can be paid at all.

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const title = 'Your Angel Drapery Partner Link'
  const description = 'Your partner link, QR code and referral activity.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/partner/${token}`,
      siteName: 'Angel Drapery',
      type: 'website',
      images: [{ url: '/og-rewards.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-rewards.jpg'] },
    robots: { index: false, follow: false },
    alternates: { canonical: `/partner/${token}` },
  }
}

export default async function PartnerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const portal = isValidReferralToken(token) ? await fetchReferralPortal(token) : null
  if (!portal || !PARTNER_TYPES.includes(portal.type)) notFound()

  const qr = await qrPng(portal.shareUrl)

  return <PartnerClient portal={portal} qr={qr} />
}
