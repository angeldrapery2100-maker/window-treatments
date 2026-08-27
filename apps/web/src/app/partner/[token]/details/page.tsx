import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchReferralPortal, isValidReferralToken, PARTNER_TYPES } from '@/lib/referral'
import PartnerDetailsClient from './PartnerDetailsClient'

// 整改 #24-2 (Eddie 2026-08-26) —— 合作方页拆两层。
//
// 现场:Agent 当面把手机递给客户扫二维码,客户往下一滑就看见了
// 「已推荐 12 / 已成交 3」「佣金发放前须上传 W-9」—— 这些是 Agent 自己的
// 后台信息,不该出现在客户可能看到的那一屏。
//
// 第一层 /partner/[token]        = Share 页:QR + 链接 + 推荐码 + 说明,干净、能直接递出去。
// 第二层 /partner/[token]/details = 这一页:推荐/成交数、W-9、佣金口径,Agent 自己点进来才看得到。
//
// 和 Share 页一样:没有任何金额。佣金是合同的事,归办公室处理,一个可以被
// 转发的链接不是谈钱的地方。

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const title = 'Your Partner Details'
  const description = 'Your referral activity and tax form status.'
  return {
    title,
    description,
    // ★ 和 Share 页一样 noindex:这一页更不该被搜到。
    robots: { index: false, follow: false },

    alternates: { canonical: `/partner/${token}/details` },
  }
}

export default async function PartnerDetailsPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const portal = isValidReferralToken(token) ? await fetchReferralPortal(token) : null
  if (!portal || !PARTNER_TYPES.includes(portal.type)) notFound()

  return <PartnerDetailsClient portal={portal} />
}
