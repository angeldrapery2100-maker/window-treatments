'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { tr, useUiLanguage, type UiLanguage } from '@/lib/uiLanguage'
import { PRIMARY_PHONE, BUSINESS_ADDRESS, BUSINESS_HOURS, COPYRIGHT } from '@/lib/site'
import { type PortalView } from '@/lib/referral'

interface Props {
  portal: PortalView
  /** PNG data URL of the partner's share link (server-rendered). */
  qr: string
}

export default function PartnerClient({ portal, qr }: Props) {
  const [language, setLanguage] = useUiLanguage(portal.lang === 'zh' ? 'zh' : 'en')
  const [toast, setToast] = useState('')
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const copy = async (text: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToast(done)
    } catch {
      setToast(tr(language, 'Press and hold to copy', '请长按复制'))
    }
  }

  const webShare = async () => {
    try {
      await navigator.share({ title: 'Angel Drapery', url: portal.shareUrl })
    } catch {
      /* dismissed */
    }
  }


  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#12141C]">
      <header className="flex items-center justify-between px-5 py-5 md:px-10">
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

      <main className="mx-auto max-w-2xl px-5 pb-16">
        <section className="pt-4 text-center">
          <h1 className="text-[26px] font-light md:text-[34px]">
            {tr(language, `Hi ${portal.displayName}`, `${portal.displayName}，你好`)}
          </h1>
          <p className="mt-2 text-[14px] text-gray-500">
            {tr(language, 'Your Angel Drapery partner link', '你的 Angel Drapery 合作方链接')}
          </p>
        </section>

        {/* ── Link + QR + spoken code ──────────────────────────────────── */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="break-all rounded-xl bg-gray-50 px-4 py-3 text-center text-[13px] text-gray-600">
            {portal.shareUrl}
          </div>

          {qr && (
            <div className="mt-6 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt={tr(language, 'QR code for your partner link', '你的合作方链接二维码')}
                className="w-64 max-w-full rounded-2xl border border-gray-200 bg-white p-4"
              />
              <p className="mt-2 text-[12px] text-gray-500">
                {tr(
                  language,
                  'Press and hold to save — put it on a card, a flyer, or send it in a text.',
                  '长按保存——可以放名片、宣传单，或直接发给客户。'
                )}
              </p>
            </div>
          )}

          {portal.referralCode && (
            <div className="mt-6 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                {tr(language, 'Or just tell them this code', '或者直接口头告诉客户')}
              </div>
              <div className="mt-2 select-all font-mono text-[26px] tracking-[0.12em]">{portal.referralCode}</div>
            </div>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => copy(portal.shareUrl, tr(language, 'Link copied', '链接已复制'))}
              className="rounded-full bg-[#12141C] px-5 py-2.5 text-[14px] text-white transition-opacity hover:opacity-90"
            >
              {tr(language, 'Copy link', '复制链接')}
            </button>
            {canShare && (
              <button
                type="button"
                onClick={webShare}
                className="rounded-full border border-[#12141C] px-5 py-2.5 text-[14px] transition-colors hover:bg-[#12141C] hover:text-white"
              >
                {tr(language, 'Share…', '分享…')}
              </button>
            )}
            <a
              href={`sms:?&body=${encodeURIComponent(portal.shareUrl)}`}
              className="rounded-full border border-gray-300 px-5 py-2.5 text-center text-[14px] transition-colors hover:border-[#12141C]"
            >
              {tr(language, 'Text it', '发短信')}
            </a>
            {portal.referralCode && (
              <button
                type="button"
                onClick={() => copy(portal.referralCode!, tr(language, 'Code copied', '已复制'))}
                className="rounded-full border border-gray-300 px-5 py-2.5 text-[14px] transition-colors hover:border-[#12141C]"
              >
                {tr(language, 'Copy code', '复制代码')}
              </button>
            )}
          </div>
        </section>

        {/* PARTNER_DETAILS_LINK —— 整改 #24-2 (Eddie 2026-08-26)。
            这一页现在就是「递给客户扫」的那一屏:QR + 链接 + 推荐码 + 说明。
            推荐数 / 成交数 / W-9 / 佣金口径搬去 /partner/[token]/details,
            Agent 自己点进去才看得到。
            ★ 这个入口的文案刻意是中性的 —— 写成「⚠ 还差 W-9」就等于把
              刚搬走的那件事又贴回客户眼前了。 */}
        <Link
          href={`/partner/${portal.token}/details`}
          className="mt-4 flex min-h-[52px] items-center justify-between rounded-2xl border
                     border-gray-200 bg-white px-6 text-[14px] transition-colors hover:border-[#12141C]"
        >
          <span>{tr(language, 'My partner details', '我的合作方信息')}</span>
          <span aria-hidden="true" className="text-gray-400">→</span>
        </Link>
        <p className="mt-2 px-1 text-[12px] text-gray-500">
          {tr(
            language,
            'Referral activity and your tax form — only you see this.',
            '推荐记录和税表——只有你自己看得到。'
          )}
        </p>

      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#12141C] px-5 py-2.5 text-[13px] text-white shadow-lg">
          {toast}
        </div>
      )}

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
