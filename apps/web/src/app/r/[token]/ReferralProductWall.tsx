'use client'

// 推荐落地页产品卡片墙(2026-09-02,Eddie 拍板)。三张自制款永远置顶,后面接
// value(Luma 三 + 本地合作四)或 designer(HD 四 + Lutron 二)之一,取决于
// agent 发的链接带的 ?c=。合作四款/HD 四款的封面来自 DB(covers 由 page.tsx
// 的 covers.ts 解析,超时/查询失败时这里退占位色块+名字,不能崩、不能空白)。

import Image from 'next/image'
import Link from 'next/link'
import { tr, type UiLanguage } from '@/lib/uiLanguage'
import {
  collectionCards,
  referralLandingPath,
  HD_ALL_HREF,
  ALL_PRODUCTS_HREF,
  type ProductCard,
  type ReferralCollection,
} from '@/lib/referralCollections'

interface Props {
  collection: ReferralCollection
  language: UiLanguage
  token: string
  /** DB-resolved covers keyed by slug, for the cards whose static image is null. */
  covers: Record<string, { image: string; name?: string }>
}

function ProductCardTile({
  card,
  language,
  covers,
}: {
  card: ProductCard
  language: UiLanguage
  covers: Props['covers']
}) {
  // image === null 的卡(合作四款 / HD 四款)靠 DB 封面;库挂了/超时/没查到
  // 都拿不到 covers[slug],此时不能崩——退占位色块 + 名字。
  const dbCover = card.image === null ? covers[card.slug] : undefined
  const image = card.image ?? dbCover?.image ?? null
  const nameEn = dbCover?.name || card.nameEn
  const name = tr(language, nameEn, card.nameZh)
  const tagline = tr(language, card.tagEn, card.tagZh)

  return (
    <Link
      href={card.href}
      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white text-left transition-colors hover:border-[#12141C]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f0ede8]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-[12px] text-gray-500">
            {name}
          </div>
        )}
      </div>
      <div className="px-2.5 py-2">
        <div className="text-[13px] font-medium leading-snug text-[#12141C]">{name}</div>
        <div className="mt-0.5 text-[11.5px] leading-snug text-gray-500">{tagline}</div>
      </div>
    </Link>
  )
}

export default function ReferralProductWall({ collection, language, token, covers }: Props) {
  const { top, rest } = collectionCards(collection)
  const otherCollection: ReferralCollection = collection === 'designer' ? 'value' : 'designer'
  const otherHref = referralLandingPath(token, otherCollection)

  return (
    <div className="mt-8 text-left">
      <div className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
        {tr(language, 'Made in our workroom', '我们自己工厂做的')}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {top.map((card) => (
          <ProductCardTile key={card.slug} card={card} language={language} covers={covers} />
        ))}
      </div>

      <div className="mt-8 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
        {collection === 'designer'
          ? tr(language, 'Designer lines — Hunter Douglas & Lutron', '设计师系列')
          : tr(
              language,
              'Everyday favorites — practical, warrantied, serviced locally',
              '家里常用 · 功能实用 · 本地保修有保障'
            )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {rest.map((card) => (
          <ProductCardTile key={card.slug} card={card} language={language} covers={covers} />
        ))}
        {collection === 'designer' && (
          <Link
            href={HD_ALL_HREF}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 px-3 text-center text-[13px] font-medium text-[#12141C] transition-colors hover:border-[#12141C]"
          >
            <span>{tr(language, 'All 20 Hunter Douglas styles', '全部 20 款 HD')}</span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      <Link
        href={ALL_PRODUCTS_HREF}
        className="mx-auto mt-7 flex min-h-[48px] w-full max-w-sm items-center justify-center gap-2
                   rounded-full border-2 border-[#12141C] px-6 text-[15px] font-medium
                   transition-colors hover:bg-[#12141C] hover:text-white"
      >
        {tr(language, 'Browse all products', '浏览全部产品')}
        <span aria-hidden="true">→</span>
      </Link>

      {/* 切换系列用真链接(带 ?c=),不是 client state——URL 本身就是系列,
          agent 复制地址栏也是对的,middleware 重新种 cookie 也没有副作用。 */}
      <p className="mt-3 text-center text-[12.5px]">
        <Link href={otherHref} className="text-[#17698F] hover:underline">
          {collection === 'designer'
            ? tr(language, 'See everyday favorites →', '看看常用款 →')
            : tr(language, 'Looking for designer lines? →', '找设计师系列？→')}
        </Link>
      </p>
    </div>
  )
}
