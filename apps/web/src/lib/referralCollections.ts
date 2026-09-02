// 推荐落地页产品卡片墙 — 系列数据与纯函数(2026-09-02,Eddie 拍板见
// SONNET任务书推荐落地页产品卡片墙20260902.md §1）。
//
// 纯数据 + 纯函数,不 import 任何 React / next 组件,可在 node 环境直接测。
// DB 相关的封面解析故意拆去同目录 covers.ts(server-only,import '@/lib/db'),
// 这个文件不能沾数据库——否则 vitest node 环境和任何 client 组件 import 它
// 都会把 pg 拖进 bundle。

import { PARTNER_LINES } from '@/lib/partnerLines'

export type ReferralCollection = 'value' | 'designer'
export const DEFAULT_COLLECTION: ReferralCollection = 'value'

/** 解析 ?c= 参数。未知值/缺省一律回落 value —— 老链接、手打错的链接都不能空页。 */
export function parseCollection(raw: unknown): ReferralCollection {
  const v = Array.isArray(raw) ? raw[0] : raw
  return v === 'designer' ? 'designer' : 'value'
}

/** 给落地页/合作方页拼链接:通用不带参数,其余带 ?c= */
export function referralLandingPath(token: string, c: ReferralCollection | 'generic'): string {
  return c === 'generic' ? `/r/${token}` : `/r/${token}?c=${c}`
}

export interface ProductCard {
  slug: string
  href: string
  /** 静态图走 public/(已在仓库);DB 封面由 page.tsx 注入后覆盖 image */
  image: string | null
  nameEn: string
  nameZh: string
  /** 一行卖点(高性价比组写保修/交期;设计师组写定位) */
  tagEn: string
  tagZh: string
}

/** 两套链接都置顶的三张自制卡(顺序固定,测试锁死顺序) */
export const HANDCRAFTED_CARDS: ProductCard[] = [
  {
    slug: 'handcrafted-drapery',
    href: '/products/handcrafted-drapery',
    image: '/drapery/handcrafted-drapery/IMG_0547.JPG',
    nameEn: 'Handcrafted Drapery',
    nameZh: '手工定制窗帘',
    tagEn: 'Sewn in our LA workroom',
    tagZh: '洛杉矶自家工厂缝制',
  },
  {
    slug: 'handcrafted-roman-shade',
    href: '/products/handcrafted-roman-shade',
    image: '/roman-shade/IMG_0298_Original.JPG',
    nameEn: 'Handcrafted Roman Shade',
    nameZh: '手工罗马帘',
    tagEn: 'Flat, front-fold or hobbled',
    tagZh: '平板 / 前折 / 波浪',
  },
  {
    slug: 'handcrafted-top-treatment',
    href: '/products/handcrafted-top-treatment',
    image: '/top-treatments/cover.jpg',
    nameEn: 'Handcrafted Top Treatment',
    nameZh: '手工帘头/帘盒',
    tagEn: 'Cornices, valances & swags',
    tagZh: '帘盒 / 帘头 / 垂幔',
  },
]

/** 本地公司长期合作四款的兜底中英文名——DB(showcase_products.name)有值时,
 *  page.tsx/covers.ts 解析出的 DB name 会覆盖这里,这两个名字只是兜底。 */
const PARTNER_NAMES: Record<string, { en: string; zh: string }> = {
  'jc-cambridge-shutter': { en: 'Cambridge Shutters', zh: '百叶木窗 Shutter' },
  'jc-woven-wood-shade': { en: 'Woven Wood Shade', zh: '编织木帘' },
  'sundance-roller-shade': { en: 'Sundance Roller Shade', zh: 'Sundance 卷帘' },
  'sundance-wood-blind': { en: 'Sundance Wood Blind', zh: '实木百叶' },
}

const PARTNER_SLUGS = [
  'jc-cambridge-shutter',
  'jc-woven-wood-shade',
  'sundance-roller-shade',
  'sundance-wood-blind',
] as const

export const VALUE_CARDS: ProductCard[] = [
  {
    slug: 'luma-collection',
    href: '/products/luma-collection',
    image: '/luma-collection/lifestyle-dining-room.png',
    nameEn: 'Luma Zebra Shades',
    nameZh: 'Luma 斑马帘',
    tagEn: 'Light control + privacy, one shade',
    tagZh: '调光遮隐一帘搞定',
  },
  {
    slug: 'roller-collection',
    href: '/products/roller-collection',
    image: '/roller-collection/lifestyle-floor-to-ceiling.png',
    nameEn: 'Luma Roller Shades',
    nameZh: 'Luma 卷帘',
    tagEn: 'Blackout or screen fabrics',
    tagZh: '全遮光 / 透景面料',
  },
  {
    slug: 'sheer-collection',
    href: '/products/sheer-collection',
    image: '/sheer-collection/lifestyle-sheer-living-room.png',
    nameEn: 'Luma Sheer Shades',
    nameZh: 'Luma 柔纱帘',
    tagEn: 'Soft light, clean look',
    tagZh: '柔光通透',
  },
  // 合作四款:image 留 null,由 page.tsx/covers.ts 从 showcase_products 注入;
  // tag 用 partnerLines 的 leadTime —— ★ 保修措辞只能是 "limited lifetime
  // warranty / 厂家有限终身保修",不能把 warrantyPoints 里的具体年限搬上来
  // (那些年限只针对特定部件,搬到卡片上等于对整件产品做了错误的保修承诺)。
  ...PARTNER_SLUGS.map((slug) => {
    const line = PARTNER_LINES[slug]
    const names = PARTNER_NAMES[slug]
    return {
      slug,
      href: `/products/${slug}`,
      image: null,
      nameEn: names.en,
      nameZh: names.zh,
      tagEn: `${line.brand} · ${line.leadTime} · limited lifetime warranty`,
      tagZh: `${line.brand} · ${line.leadTime} · 厂家有限终身保修`,
    } as ProductCard
  }),
]

export const DESIGNER_CARDS: ProductCard[] = [
  { slug: 'silhouette', href: '/products/silhouette', image: null, nameEn: 'Silhouette®', nameZh: 'Silhouette 柔纱帘', tagEn: 'Hunter Douglas', tagZh: 'Hunter Douglas' },
  { slug: 'duette', href: '/products/duette', image: null, nameEn: 'Duette®', nameZh: 'Duette 蜂巢帘', tagEn: 'Hunter Douglas', tagZh: 'Hunter Douglas' },
  { slug: 'pirouette', href: '/products/pirouette', image: null, nameEn: 'Pirouette®', nameZh: 'Pirouette 卷纱帘', tagEn: 'Hunter Douglas', tagZh: 'Hunter Douglas' },
  { slug: 'luminette', href: '/products/luminette', image: null, nameEn: 'Luminette®', nameZh: 'Luminette 垂直纱帘', tagEn: 'Hunter Douglas', tagZh: 'Hunter Douglas' },
  {
    slug: 'lutron-palladiom',
    href: '/products/lutron-palladiom',
    image: '/lutron/palladiom/hero.jpg',
    nameEn: 'Lutron PALLADIOM',
    nameZh: 'Lutron PALLADIOM',
    tagEn: 'Smart shading, wired or battery',
    tagZh: '智能电动,有线/电池',
  },
  {
    slug: 'triathlon-roller-shades',
    href: '/products/triathlon-roller-shades',
    image: 'https://assets.lutron.com/a/pdp/triathlon/triathlon-ph-b56e-443b.jpg',
    nameEn: 'Lutron Triathlon®',
    nameZh: 'Lutron Triathlon',
    tagEn: 'Battery-powered smart roller',
    tagZh: '电池驱动智能卷帘',
  },
]

/** HD 全部 20 款的入口(产品页 HD 分区,带分类 tab) */
export const HD_ALL_HREF = '/products'
export const ALL_PRODUCTS_HREF = '/products'

export function collectionCards(c: ReferralCollection): { top: ProductCard[]; rest: ProductCard[] } {
  return { top: HANDCRAFTED_CARDS, rest: c === 'designer' ? DESIGNER_CARDS : VALUE_CARDS }
}

/** 哪些 slug 需要从 DB 取封面(image === null 的那些) */
export function slugsNeedingCover(c: ReferralCollection): string[] {
  return collectionCards(c).rest.filter((x) => x.image === null).map((x) => x.slug)
}
