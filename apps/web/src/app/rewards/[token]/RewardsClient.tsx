'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { tr, useUiLanguage, type UiLanguage } from '@/lib/uiLanguage'
import { PRIMARY_PHONE, BUSINESS_ADDRESS, BUSINESS_HOURS, COPYRIGHT } from '@/lib/site'
import type { PortalView, PortalTier } from '@/lib/referral'

interface Props {
  portal: PortalView
  /** PNG data URL of the share link — rendered server-side (lib/qrSvg.ts) so
   *  a phone can press-and-hold to save it into WeChat. */
  qr: string
  reviewUrl: string
}

const TIER_FALLBACK_COLOR: Record<string, string> = {
  member: '#8A94A6',
  silver: '#B9C2CC',
  gold: '#D4A24C',
  platinum: '#6E7A8A',
  diamond: '#4DB6E8',
}

const tierColor = (t: { key?: string; color?: string } | null | undefined) =>
  t?.color || TIER_FALLBACK_COLOR[t?.key || ''] || '#12141C'

const tierName = (t: PortalTier | { label?: string; labelCn?: string }, language: UiLanguage) =>
  language === 'zh' ? t.labelCn || t.label || '' : t.label || ''

export default function RewardsClient({ portal, qr, reviewUrl }: Props) {
  const [language, setLanguage] = useUiLanguage(portal.lang === 'zh' ? 'zh' : 'en')
  const [toast, setToast] = useState('')
  const [canShare, setCanShare] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [smsOptIn, setSmsOptIn] = useState(portal.smsOptIn === true)
  const [smsBusy, setSmsBusy] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const shareText = tr(
    language,
    `I had my window treatments made by Angel Drapery — use my link and you get ${portal.discountPct ?? 5}% off: ${portal.shareUrl}`,
    `我家的窗帘是 Angel Drapery 做的，用我的链接下单可以享 ${portal.discountPct ?? 5}% 优惠：${portal.shareUrl}`
  )

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
      await navigator.share({ title: 'Angel Drapery', text: shareText, url: portal.shareUrl })
    } catch {
      /* the visitor dismissed the sheet — nothing to report */
    }
  }

  const toggleSms = async (next: boolean) => {
    if (smsBusy || portal.smsOptedOut) return
    setSmsBusy(true)
    setSmsOptIn(next) // optimistic
    try {
      const res = await fetch('/api/referral/prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: portal.token, smsOptIn: next }),
      })
      const json = await res.json().catch(() => null)
      if (json?.success) {
        setSmsOptIn(json.data?.smsOptIn === true)
        setToast(next ? tr(language, "You're on the list", '已开启提醒') : tr(language, 'Reminders off', '已关闭提醒'))
      } else {
        setSmsOptIn(!next) // roll back
        setToast(tr(language, "Couldn't save that — please try again", '没保存成功，请再试一次'))
      }
    } catch {
      setSmsOptIn(!next)
      setToast(tr(language, "Couldn't save that — please try again", '没保存成功，请再试一次'))
    } finally {
      setSmsBusy(false)
    }
  }

  const tiers = portal.tiers ?? []
  const currentTier = tiers.find((t) => t.key === portal.tierKey)
  const qualified = portal.qualifiedReferrals ?? 0
  const next = portal.nextTier
  const needed = next ? Math.max(0, next.min - qualified) : 0
  const progress = next && next.min > 0 ? Math.min(100, Math.round((qualified / next.min) * 100)) : 100

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#12141C]">
      <header className="flex items-center justify-between px-5 py-5 md:px-10">
        <Link href="/" aria-label="Angel Drapery — home">
          <span className="text-[12px] md:text-base font-light tracking-[0.2em]">ANGEL DRAPERY, INC</span>
        </Link>
        <div className="flex items-center gap-1 text-[12px]">
          {(['en', 'zh'] as UiLanguage[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`rounded-full px-3 py-1 transition-colors ${
                language === l ? 'bg-[#12141C] text-white' : 'text-gray-500 hover:text-[#12141C]'
              }`}
            >
              {l === 'en' ? 'EN' : '中文'}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-16">
        {/* ── 1. Greeting + tier badge ─────────────────────────────────── */}
        <section className="pt-4 text-center">
          <h1 className="text-[26px] font-light md:text-[34px]">
            {tr(language, `Hi ${portal.displayName}`, `${portal.displayName}，你好`)}
          </h1>
          {portal.tierLabel && (
            <span
              className="mt-3 inline-block rounded-full px-4 py-1 text-[13px] font-medium text-white"
              style={{ backgroundColor: tierColor(currentTier ?? { key: portal.tierKey }) }}
            >
              {tierName({ label: portal.tierLabel, labelCn: portal.tierLabelCn }, language)}
            </span>
          )}
        </section>

        {/* ── 2. Personal code ─────────────────────────────────────────── */}
        {portal.referralCode && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              {tr(language, 'Your code', '你的专属码')}
            </div>
            <div className="mt-3 select-all font-mono text-[28px] tracking-[0.12em] md:text-[34px]">
              {portal.referralCode}
            </div>
            <button
              type="button"
              onClick={() => copy(portal.referralCode!, tr(language, 'Code copied', '已复制'))}
              className="mt-4 rounded-full border border-[#12141C] px-6 py-2 text-[13px] transition-colors hover:bg-[#12141C] hover:text-white"
            >
              {tr(language, 'Copy code', '复制专属码')}
            </button>
          </section>
        )}

        {/* ── 3. Current benefits ──────────────────────────────────────── */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            {tr(language, 'What you get today', '当前权益')}
          </h2>
          <p className="mt-3 text-[16px]">
            {portal.discountPct
              ? tr(language, `${portal.discountPct}% off every project`, `每一单立减 ${portal.discountPct}%`)
              : tr(language, 'Member pricing on every project', '每一单享会员价')}
            {portal.freeVisitCredits
              ? tr(
                  language,
                  ` · ${portal.freeVisitCredits} free service visit${portal.freeVisitCredits > 1 ? 's' : ''}`,
                  ` · ${portal.freeVisitCredits} 次免费上门服务`
                )
              : ''}
          </p>
        </section>

        {/* ── 4. Progress to the next level ────────────────────────────── */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              {tr(language, 'Your progress', '升级进度')}
            </h2>
            <span className="text-[13px] text-gray-500">
              {next ? `${qualified} / ${next.min}` : `${qualified}`}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: tierColor(next ?? { key: portal.tierKey }) }}
            />
          </div>
          <p className="mt-3 text-[14px] text-gray-600">
            {next
              ? tr(
                  language,
                  `${needed} more referral${needed === 1 ? '' : 's'} to ${next.label} (${next.discountPct}% off)`,
                  `再有 ${needed} 位朋友完成项目，就升到${next.labelCn || next.label}（${next.discountPct}% 优惠）`
                )
              : tr(language, "You're at the top level", '你已经是最高等级了')}
          </p>
        </section>

        {/* ── 5. The ladder ────────────────────────────────────────────── */}
        {tiers.length > 0 && (
          <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <h2 className="px-6 pt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              {tr(language, 'Levels', '等级阶梯')}
            </h2>
            <table className="mt-4 w-full text-[14px]">
              <tbody>
                {tiers.map((t) => {
                  const active = t.key === portal.tierKey
                  return (
                    <tr key={t.key} className={active ? 'bg-[#4DB6E8]/5' : ''}>
                      <td className="px-6 py-3">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                          style={{ backgroundColor: tierColor(t) }}
                        />
                        <span className={active ? 'font-medium' : ''}>{tierName(t, language)}</span>
                      </td>
                      <td className="px-2 py-3 text-right text-gray-500">
                        {tr(language, `${t.min}+ referrals`, `${t.min}+ 位朋友`)}
                      </td>
                      <td className="px-6 py-3 text-right">{t.discountPct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="px-6 pb-6 pt-3 text-[12px] text-gray-400">
              {tr(
                language,
                'A referral counts once your friend completes their project.',
                '朋友的项目完成后，这一位才计入。'
              )}
            </p>
          </section>
        )}

        {/* ── 6. Share ─────────────────────────────────────────────────── */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            {tr(language, 'Share with friends', '分享给朋友')}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-gray-600">
            {tr(
              language,
              `Your friends get ${portal.discountPct ?? 5}% off, and you move up a level when they complete a project.`,
              `朋友可享 ${portal.discountPct ?? 5}% 优惠；他们的项目完成后，你就往上升一级。`
            )}
          </p>
          <div className="mt-4 break-all rounded-xl bg-gray-50 px-4 py-3 text-[13px] text-gray-600">
            {portal.shareUrl}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
              href={`sms:?&body=${encodeURIComponent(shareText)}`}
              className="rounded-full border border-gray-300 px-5 py-2.5 text-center text-[14px] transition-colors hover:border-[#12141C]"
            >
              {tr(language, 'Text it', '发短信')}
            </a>
            <button
              type="button"
              onClick={() => setShowQr((v) => !v)}
              className="rounded-full border border-gray-300 px-5 py-2.5 text-[14px] transition-colors hover:border-[#12141C]"
            >
              {showQr ? tr(language, 'Hide QR code', '收起二维码') : tr(language, 'WeChat QR code', '微信二维码')}
            </button>
          </div>
          {showQr && qr && (
            <div className="mt-5 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt={tr(language, 'QR code for your referral link', '你的推荐链接二维码')}
                className="w-48 rounded-xl border border-gray-200 bg-white p-3"
              />
              <p className="mt-2 text-[12px] text-gray-400">
                {tr(language, 'Press and hold to save, then send it in WeChat.', '长按保存，发到微信给朋友。')}
              </p>
            </div>
          )}
        </section>

        {/* ── 7. Google review invite ──────────────────────────────────────
             Deliberately NO reward, discount or incentive wording here:
             Google's policy forbids incentivised reviews, and mixing the ask
             into a rewards page is exactly where that line gets crossed. */}
        {reviewUrl && (
          <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              {tr(language, 'One small favour', '一个小请求')}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-gray-600">
              {tr(
                language,
                'Enjoying your window treatments? A review helps a small family business.',
                '窗帘用得还满意吗？一条评价，对我们这样的小家族生意帮助很大。'
              )}
            </p>
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full border border-[#12141C] px-6 py-2.5 text-[14px] transition-colors hover:bg-[#12141C] hover:text-white"
            >
              {tr(language, 'Write a Google review', '去 Google 写评价')}
            </a>
          </section>
        )}

        {/* ── 8. SMS reminders ─────────────────────────────────────────── */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-medium">
                {tr(language, 'Notify me about my rewards', '奖励有变化时通知我')}
              </h2>
              {portal.smsOptedOut && (
                <p className="mt-2 text-[13px] text-[#B4541F]">
                  {tr(
                    language,
                    'You replied STOP — text START to our number to re-enable',
                    '你之前回复了 STOP——给我们的号码发 START 即可重新开启'
                  )}
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={smsOptIn}
              aria-label={tr(language, 'Notify me about my rewards', '奖励有变化时通知我')}
              disabled={portal.smsOptedOut || smsBusy}
              onClick={() => toggleSms(!smsOptIn)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                portal.smsOptedOut ? 'cursor-not-allowed bg-gray-200' : smsOptIn ? 'bg-[#4DB6E8]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  smsOptIn ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
            {tr(
              language,
              'Reward updates only. Msg & data rates may apply. Reply STOP to opt out.',
              '仅发送奖励相关通知。可能产生短信/数据费用。回复 STOP 退订。'
            )}
          </p>
        </section>
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
