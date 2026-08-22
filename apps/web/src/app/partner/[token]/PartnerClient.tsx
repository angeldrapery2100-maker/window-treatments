'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { tr, useUiLanguage, type UiLanguage } from '@/lib/uiLanguage'
import { PRIMARY_PHONE, BUSINESS_ADDRESS, BUSINESS_HOURS, COPYRIGHT } from '@/lib/site'
import { W9_MAX_BYTES, W9_MIME, type PortalView } from '@/lib/referral'

interface Props {
  portal: PortalView
  /** PNG data URL of the partner's share link (server-rendered). */
  qr: string
}

export default function PartnerClient({ portal, qr }: Props) {
  const [language, setLanguage] = useUiLanguage(portal.lang === 'zh' ? 'zh' : 'en')
  const [toast, setToast] = useState('')
  const [canShare, setCanShare] = useState(false)
  const [w9State, setW9State] = useState<'idle' | 'uploading' | 'done'>('idle')
  const [w9Error, setW9Error] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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

  const onPickFile = async (file: File | null) => {
    // Always clear the input first: a browser fires no change event when the
    // same file is picked twice, so a rejected file could never be retried
    // (and the Upload button would look dead).
    const resetInput = () => { if (fileRef.current) fileRef.current.value = '' }
    if (!file) return
    setW9Error('')
    if (!W9_MIME.includes(file.type)) {
      setW9Error(tr(language, 'PDF, JPG or PNG only', '只支持 PDF、JPG 或 PNG'))
      resetInput()
      return
    }
    if (file.size > W9_MAX_BYTES) {
      setW9Error(tr(language, 'That file is over 8MB', '文件超过 8MB'))
      resetInput()
      return
    }
    setW9State('uploading')
    try {
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = String(reader.result || '')
          // Strip the "data:<mime>;base64," prefix — the API takes raw base64.
          resolve(result.slice(result.indexOf(',') + 1))
        }
        reader.onerror = () => reject(new Error('read_failed'))
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/referral/w9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: portal.token, file: base64, mime: file.type }),
      })
      const json = await res.json().catch(() => null)
      if (json?.success) {
        setW9State('done')
        setToast(tr(language, 'W-9 received', 'W-9 已收到'))
      } else {
        setW9State('idle')
        setW9Error(tr(language, "Upload didn't go through — please try again", '上传没成功，请再试一次'))
      }
    } catch {
      setW9State('idle')
      setW9Error(tr(language, "Upload didn't go through — please try again", '上传没成功，请再试一次'))
    } finally {
      resetInput()
    }
  }

  const w9 = portal.w9 ?? { uploaded: false, verified: false }
  const uploaded = w9.uploaded || w9State === 'done'
  const stats = portal.stats ?? { referredLeads: 0, signed: 0 }

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

        {/* ── Activity. Counts only — commission figures live in AAPP. ─── */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
            {tr(language, 'Your referrals', '你的推荐')}
          </h2>
          <div className="mt-4 flex items-baseline gap-6">
            <div>
              <div className="text-[30px] font-light">{stats.referredLeads}</div>
              <div className="text-[12px] text-gray-500">{tr(language, 'referred', '已推荐')}</div>
            </div>
            <div>
              <div className="text-[30px] font-light">{stats.signed}</div>
              <div className="text-[12px] text-gray-500">{tr(language, 'signed', '已成交')}</div>
            </div>
          </div>
          <p className="mt-4 text-[12px] text-gray-500">
            {tr(
              language,
              'Questions about a specific project or your commission? Call us — we keep those details off the web.',
              '想问具体项目或佣金？请直接打电话给我们——这些细节我们不放在网页上。'
            )}
          </p>
        </section>

        {/* ── W-9 ──────────────────────────────────────────────────────── */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
            {tr(language, 'Tax form (W-9)', '税表 W-9')}
          </h2>

          {uploaded && w9.verified && (
            <p className="mt-3 text-[15px] text-[#1F7A4D]">
              ✅ {tr(language, 'W-9 on file — you are all set', 'W-9 已存档——一切就绪')}
            </p>
          )}

          {uploaded && !w9.verified && (
            <p className="mt-3 text-[15px] text-gray-600">
              {tr(language, 'W-9 received — pending review', 'W-9 已收到——正在审核')}
            </p>
          )}

          {!uploaded && (
            <>
              <p className="mt-3 text-[14px] font-medium text-[#C0392B]">
                {tr(
                  language,
                  'Commission cannot be paid until your W-9 is on file',
                  '佣金发放前须上传 W-9'
                )}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                {tr(
                  language,
                  'PDF, JPG or PNG, up to 8MB. It goes straight into our office system — it is never stored on this website.',
                  '支持 PDF、JPG、PNG，最大 8MB。文件直接进我们办公系统，不会存在这个网站上。'
                )}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                disabled={w9State === 'uploading'}
                onClick={() => fileRef.current?.click()}
                className="mt-4 rounded-full bg-[#12141C] px-6 py-2.5 text-[14px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {w9State === 'uploading'
                  ? tr(language, 'Uploading…', '上传中…')
                  : tr(language, 'Upload W-9', '上传 W-9')}
              </button>
              {w9Error && <p className="mt-3 text-[13px] text-[#C0392B]">{w9Error}</p>}
            </>
          )}
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
