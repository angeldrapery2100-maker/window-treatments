'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { tr, useUiLanguage, type UiLanguage } from '@/lib/uiLanguage'
import { PRIMARY_PHONE, BUSINESS_ADDRESS, BUSINESS_HOURS, COPYRIGHT } from '@/lib/site'
import type { ReferrerType } from '@/lib/referral'
import type { ReferralCollection } from '@/lib/referralCollections'
import OpenInChatGpt from '@/components/OpenInChatGpt'
import ReferralProductWall from './ReferralProductWall'

interface Props {
  token: string
  referrerType: ReferrerType
  displayName: string
  discountPct: number | null
  /** Computed on the server from PARTNER_TYPES — kept as a prop so the client
   *  bundle does not have to pull in lib/referral just for a list of strings,
   *  and so the two never drift apart. */
  isPartner: boolean
  /** ?c=value|designer — which product-card collection to show (2026-09-02). */
  collection: ReferralCollection
  /** DB-resolved covers for the cards whose image is null in referralCollections.ts,
   *  keyed by slug. Resolved server-side (covers.ts) so this client component
   *  never touches the database. */
  covers: Record<string, { image: string; name?: string }>
}

const BOOK_PREFILL_EN = "I'd like to book a free in-home measure"
const BOOK_PREFILL_ZH = '我想预约免费上门量窗'

export default function ReferralLanding({
  token,
  referrerType,
  displayName,
  discountPct,
  isPartner,
  collection,
  covers,
}: Props) {
  const [language, setLanguage] = useUiLanguage('en')
  const claimed = useRef(false)
  const [ready, setReady] = useState(false)

  // Seed the ad_ref attribution cookie as soon as the page is interactive —
  // see the comment in /api/referral/claim for why this is a POST and not a
  // cookie written during render.
  useEffect(() => {
    if (claimed.current) return
    claimed.current = true
    fetch('/api/referral/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // page 带上 collection——AAPP 的 referralVisit 记录能分出 value/designer
      // 两种链接各自的访问量 (recordReferralVisit 会把这个字段截到 120 字符内)。
      body: JSON.stringify({ token, page: '/r?c=' + collection }),
      keepalive: true,
    })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [token, collection])

  const openAssistant = (prefill?: string) => {
    const fire = () =>
      window.dispatchEvent(
        new CustomEvent('ad:open-assistant', {
          detail: {
            ref: { token, type: referrerType, displayName, discountPct, language },
            ...(prefill ? { prefill } : {}),
          },
        })
      )
    // The cookie is what actually attributes the lead; if the claim POST is
    // still in flight, give it a beat rather than racing it.
    if (ready) fire()
    else setTimeout(fire, 350)
  }


  const steps = [
    {
      n: '1',
      title: tr(language, 'Measure', '量窗户'),
      body: tr(
        language,
        'Two numbers is enough to start — width and height. Our guide walks you through it.',
        '先量两个数就够了：宽和高。看我们的图解说明，一步一步来。'
      ),
      // 2026-09-02 Eddie 拍板:「在线量窗助手」升级成主按钮,和下面「问 AI 顾问」
      // 视觉权重相同——量窗(1)→问 AI(2)是同一条主路径上的两步,都用实心深色
      // 按钮;第 3 步「免费上门量窗」仍是次要转化点,保持描边。(这条替换了原来
      // 「页面唯一的实心深色按钮留给问 AI」的说法——现在有两个了。)
      links: [
        { href: '/measure-wizard', label: tr(language, 'Measurement wizard', '在线量窗助手'), primary: true },
        { href: '/how-to-measure', label: tr(language, 'Measuring guide', '测量指南') },
      ],
    },
    {
      n: '2',
      title: tr(language, 'Ask AI', '问 AI'),
      body: tr(
        language,
        'Tell our AI consultant about your windows and get a reference estimate in a minute — no calls, no pressure.',
        '把窗户情况告诉我们的 AI 顾问，一分钟给你参考价——不用打电话，也没人催你。'
      ),
    },
    {
      n: '3',
      title: tr(language, 'Free in-home measure', '免费上门量窗'),
      body: tr(
        language,
        'Like the numbers? We come out, measure properly, and confirm the real price — free in the Los Angeles area.',
        '价格合适的话，我们上门精确测量、确认最终价格——洛杉矶地区免费。'
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-white text-[#12141C]">
      {/* ── Header: brand + language toggle ──────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-5 md:px-10 md:py-7">
        {/* 可见文字就是可访问名(WCAG 2.5.3 Label in Name):
            再加一个内容不同的 aria-label 会把它整个盖掉,语音控制说
            "click Angel Drapery" 就点不动了。 */}
        <Link href="/">
          <span className="text-[12px] md:text-base font-light tracking-[0.2em]">ANGEL DRAPERY, INC</span>
        </Link>
        <div className="flex items-center gap-2 text-[12px]">
          {(['en', 'zh'] as UiLanguage[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-4 transition-colors ${
                language === l ? 'bg-[#12141C] text-white' : 'text-gray-500 hover:text-[#12141C]'
              }`}
            >
              {l === 'en' ? 'EN' : '中文'}
            </button>
          ))}
        </div>
      </header>

      {/* 主地标 —— 屏幕阅读器靠它「跳到正文」。/rewards 和 /partner 早就有了,
          只有这一页漏了。 */}
      <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-4 pt-6 text-center md:pt-12">
        <h1 className="text-[26px] font-light leading-tight tracking-tight md:text-[40px]">
          {tr(language, 'Measure your windows and get an instant curtain estimate', '量一量窗户，马上拿到窗帘参考价')}
        </h1>

        {/* Referrer line. Partners get a plain "partner pricing applied" —
            the percentage behind a partner link is never shown publicly. */}
        {referrerType === 'customer' && (
          <p className="mt-5 inline-block rounded-full bg-[#4DB6E8]/10 px-5 py-2 text-[14px] text-[#12141C]">
            {discountPct
              ? tr(
                  language,
                  `${displayName} sent you this — friends get ${discountPct}% off your first project`,
                  `${displayName} 把这个链接发给你——朋友首单可享 ${discountPct}% 优惠`
                )
              : tr(
                  language,
                  `${displayName} sent you this`,
                  `${displayName} 把这个链接发给你`
                )}
          </p>
        )}
        {isPartner && (
          <p className="mt-5 inline-block rounded-full bg-[#4DB6E8]/10 px-5 py-2 text-[14px] text-[#12141C]">
            {tr(
              language,
              `Referred by ${displayName} · partner pricing applied`,
              `由 ${displayName} 推荐 · 已套用合作方价格`
            )}
          </p>
        )}

        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-gray-600">
          {tr(
            language,
            'Custom drapery, shades and shutters, made in our own Los Angeles workroom since 1984.',
            '定制窗帘、卷帘、百叶——1984 年起在洛杉矶自家工厂制作。'
          )}
        </p>

        {/* 产品卡片墙 —— 整改 #24-1 之后的下一步(Eddie 09-02)。以前这里是一个
            「浏览产品」描边按钮 + 一行小字,现在直接铺开缩略图:三张自制款置顶,
            后面跟 value/designer 两套之一,agent 发的链接决定客户先看到什么。 */}
        <ReferralProductWall collection={collection} language={language} token={token} covers={covers} />
      </section>

      {/* ── Three steps ──────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-4xl gap-4 px-5 py-8 md:grid-cols-3 md:py-12">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-gray-200 p-6 text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#12141C] text-[13px] text-white">
              {s.n}
            </div>
            <h2 className="mt-4 text-[17px] font-medium">{s.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{s.body}</p>
            {s.links && (
              <div className="mt-4 flex flex-col gap-2">
                {s.links.map((l) =>
                  l.primary ? (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="mt-0 flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#12141C] px-5 py-2.5 text-[14px] text-white transition-opacity hover:opacity-90"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <Link
                      key={l.href}
                      href={l.href}
                      /* 品牌蓝 #4DB6E8 在白底只有 2.29:1,当正文链接色不合格。
                         #17698F 是同色系压暗版,6.08:1。背景/填充仍然用品牌蓝。
                         行高与间距一起提到 44px 触控目标。 */
                      className="flex min-h-[44px] items-center text-[13px] text-[#17698F] hover:underline"
                    >
                      {l.label} →
                    </Link>
                  )
                )}
              </div>
            )}
            {s.n === '2' && (
              <button
                type="button"
                onClick={() => openAssistant()}
                className="mt-4 w-full rounded-full bg-[#12141C] px-5 py-2.5 text-[14px] text-white transition-opacity hover:opacity-90"
              >
                {tr(language, 'Ask our AI consultant', '问 AI 顾问')}
              </button>
            )}
            {s.n === '3' && (
              <button
                type="button"
                onClick={() => openAssistant(tr(language, BOOK_PREFILL_EN, BOOK_PREFILL_ZH))}
                className="mt-4 w-full rounded-full border border-[#12141C] px-5 py-2.5 text-[14px] transition-colors hover:bg-[#12141C] hover:text-white"
              >
                {tr(language, 'Book a free measure', '预约免费量窗')}
              </button>
            )}
          </div>
        ))}
      </section>

      {/* ── Secondary entry points ───────────────────────────────────────── */}
      {/* #24-1:原来这里还有第二个「浏览产品」灰色文字链接。同一个入口出现
          两次,上面那个就不像主路径了 —— 删掉,只留 ChatGPT 那一个。 */}
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-5 pb-14">
        <OpenInChatGpt token={token} language={language} variant="secondary" className="w-full max-w-sm" />
      </section>

      </main>

      {/* ── NAP footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-5 py-8 text-center text-[12px] leading-relaxed text-gray-500">
        <div>Angel Drapery, Inc · {BUSINESS_ADDRESS}</div>
        <div className="mt-1">
          <a href={`tel:${PRIMARY_PHONE.replace(/-/g, '')}`} className="hover:text-[#12141C]">
            {PRIMARY_PHONE}
          </a>
          {' · '}
          {BUSINESS_HOURS}
        </div>
        <div className="mt-2">{COPYRIGHT}</div>
      </footer>
    </div>
  )
}
