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
//
// 三选系列(2026-09-02,Eddie 拍板):同一个合作方 token 现在对应三条可发的
// 链接——通用 / 高性价比(?c=value) / 设计师(?c=designer)。三张 QR 在这里
// 并行生成好整页一起交给 PartnerClient,切换只是换哪张已经生成的图,不再
// 请求任何东西。

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

/** shareUrl 从 AAPP 来,任务书要求先断言它不带查询串——目前确实不带,但如果
 *  哪天 AAPP 改了形状,这里退化成 & 拼接而不是拼出一个坏 URL,同时留痕方便查。 */
function withCollectionParam(shareUrl: string, param: string): string {
  if (shareUrl.includes('?')) {
    console.warn(`[partner] shareUrl already has a query string, appending: ${shareUrl}`)
    return `${shareUrl}&${param}`
  }
  return `${shareUrl}?${param}`
}

export default async function PartnerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const portal = isValidReferralToken(token) ? await fetchReferralPortal(token) : null
  if (!portal || !PARTNER_TYPES.includes(portal.type)) notFound()

  const links = {
    generic: portal.shareUrl,
    value: withCollectionParam(portal.shareUrl, 'c=value'),
    designer: withCollectionParam(portal.shareUrl, 'c=designer'),
  }

  const [generic, value, designer] = await Promise.all([
    qrPng(links.generic),
    qrPng(links.value),
    qrPng(links.designer),
  ])

  return <PartnerClient portal={portal} qrs={{ generic, value, designer }} links={links} />
}
