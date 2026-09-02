import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isValidReferralToken, lookupReferral, lookupReferralDetailed, PARTNER_TYPES } from '@/lib/referral'
import { parseCollection, slugsNeedingCover } from '@/lib/referralCollections'
import { resolveCovers } from './covers'
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
//
// ?c=value|designer (2026-09-02, Eddie 拍板): which product-card collection
// the visitor sees. No param / unknown value falls back to value — see
// parseCollection in referralCollections.ts. canonical below is deliberately
// left without ?c= so the two collections of one token count as one URL.

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ c?: string | string[] }>
}): Promise<Metadata> {
  const { token } = await params
  const collection = parseCollection((await searchParams).c)
  const ref = isValidReferralToken(token) ? await lookupReferral(token) : null

  const personal =
    ref && (ref.referrerType === 'customer' || PARTNER_TYPES.includes(ref.referrerType))
  const titleBase = personal
    ? `${ref!.displayName} invited you — Free curtain AI consultant`
    : 'Free curtain AI consultant'
  // 设计师系列链接给 agent/设计师转发用,标题带上品牌名——锦上添花项,不影响归因。
  const title = collection === 'designer' ? `${titleBase} — Hunter Douglas & Lutron` : titleBase
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

export default async function ReferralPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ c?: string | string[] }>
}) {
  const { token } = await params
  const collection = parseCollection((await searchParams).c)

  // 归因查询和封面查询没有依赖关系——并行,别再叠一跳延迟上去
  // (落地页已经因为串行 + 慢后端跳过一次主页,见 [[referral-zombie-token]])。
  const [{ ref, transient }, covers] = await Promise.all([
    isValidReferralToken(token)
      ? lookupReferralDetailed(token)
      : Promise.resolve({ ref: null, transient: false }),
    resolveCovers(slugsNeedingCover(collection)),
  ])

  if (!ref && transient) {
    // 整改 #31:AAPP 没答上来(冷启动 / 网络抖动)≠ 链接失效。middleware 已经把
    // ad_ref cookie 种下去了,归因不丢;这里照常渲染落地页,只是不显示推荐人
    // 那一行。绝不能 redirect('/') —— 那正是「Safari 打开推荐链接跳主页」。
    console.warn(`[referral] backend unavailable, rendering generic landing: ${token}`)
    return (
      <ReferralLanding
        token={token}
        referrerType="company"
        displayName="Angel Drapery"
        discountPct={null}
        isPartner={false}
        collection={collection}
        covers={covers}
      />
    )
  }

  if (!ref) {
    // 死链接(被撤销 / 真源被删 / 打错)。仍然落主页而不是 404 —— 印出去的二维码
    // 不能把客户带进死胡同 —— 但必须留下痕迹,否则「链接跳主页」只能靠客户投诉发现。
    console.warn(`[referral] dead link, redirecting home: ${token}`)
    redirect('/?ref=expired')
  }

  return (
    <ReferralLanding
      token={token}
      referrerType={ref.referrerType}
      displayName={ref.displayName}
      discountPct={ref.discountPct}
      isPartner={PARTNER_TYPES.includes(ref.referrerType)}
      collection={collection}
      covers={covers}
    />
  )
}
