'use client'

import Link from 'next/link'
import { tr, useUiLanguage } from '@/lib/uiLanguage'
import { PRIMARY_PHONE } from '@/lib/site'
import { estimateOpeningLine } from '@/lib/customerGpt'
import OpenInChatGpt from '@/components/OpenInChatGpt'
import { configSummary } from '@/lib/estimateDisplay'
import type { LoadResult, CustomerEstimate } from '@/lib/aappEstimate'

const money = (n: number | null | undefined) =>
  n == null ? '—' : '$' + Math.round(n).toLocaleString('en-US')

const inches = (n: number) => (Number.isFinite(n) ? `${n}"` : '—')

export default function EstimateView({ result }: { result: LoadResult }) {
  const est = result.ok ? result.estimate : null
  const [language, setLanguage] = useUiLanguage(est?.lang === 'zh' ? 'zh' : 'en')

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <Link href="/" className="text-[15px] font-medium tracking-wide text-[#12141C]">
          ANGEL DRAPERY
        </Link>
        <button
          type="button"
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          className="rounded-full border border-gray-300 px-3 py-1 text-[12px] text-gray-600 hover:border-[#12141C] hover:text-[#12141C]"
        >
          {language === 'zh' ? 'EN' : '中文'}
        </button>
      </header>

      {!est ? <NotFound language={language} /> : <Estimate est={est} language={language} />}
    </main>
  )
}

/* ★ 查不到 / 过期 / 链接被改了一个字符 —— 同一个页面、同一句话。
   分开说等于告诉试链接的人「这一串是真的,只是过期了」。 */
function NotFound({ language }: { language: 'en' | 'zh' }) {
  return (
    <section className="rounded-2xl border border-gray-200 p-8 text-center">
      <h1 className="text-[20px] font-medium text-[#12141C]">
        {tr(language, 'We could not open this estimate', '这张报价单打不开')}
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-gray-600">
        {tr(language,
            'The link may be incomplete, or the estimate is no longer available. Estimates are kept for 90 days.',
            '链接可能不完整，或者这张单子已经不在了。报价单保留 90 天。')}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          href="/contact"
          className="inline-block rounded-full bg-[#12141C] px-6 py-2.5 text-[14px] text-white"
        >
          {tr(language, 'Book a free measure', '预约免费量窗')}
        </Link>
        <a href={`tel:${PRIMARY_PHONE}`} className="text-[13px] text-gray-500 underline">
          {PRIMARY_PHONE}
        </a>
      </div>
    </section>
  )
}

function Estimate({ est, language }: { est: CustomerEstimate; language: 'en' | 'zh' }) {
  const byWindow = new Map(est.windows.map((w) => [w.id, w]))
  const expires = new Date(est.expiresAt)
  const expiresText = Number.isFinite(expires.getTime())
    ? expires.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' })
    : ''

  return (
    <>
      <section className="rounded-2xl border border-gray-200 p-6">
        <p className="text-[12px] uppercase tracking-widest text-gray-500">
          {tr(language, 'Estimate', '报价单')}
        </p>
        <h1 className="mt-1 font-mono text-[24px] tracking-wide text-[#12141C]">{est.estimateNo}</h1>
        {est.referral.applied && (
          <p className="mt-2 inline-block rounded-full bg-[#F4F1EA] px-3 py-1 text-[12px] text-[#7A6A4F]">
            {tr(language, 'A referral benefit is attached to this estimate',
                          '这张单子带着推荐优惠')}
          </p>
        )}
        <p className="mt-3 text-[13px] text-gray-500">
          {tr(language, `Valid until ${expiresText}`, `有效期至 ${expiresText}`)}
        </p>
      </section>

      {est.windows.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-[15px] font-medium text-[#12141C]">
            {tr(language, 'Windows', '窗户')}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-gray-50 text-[12px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{tr(language, 'Window', '窗户')}</th>
                  <th className="px-4 py-3 font-medium">{tr(language, 'Size', '尺寸')}</th>
                  <th className="px-4 py-3 font-medium">{tr(language, 'Mount', '安装')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {est.windows.map((w) => (
                  <tr key={w.id}>
                    <td className="px-4 py-3 text-[#12141C]">
                      {w.label}
                      {w.room ? <span className="text-gray-500"> · {w.room}</span> : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-700">
                      {inches(w.widthIn)} × {inches(w.heightIn)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {w.mount === 'inside'
                        ? tr(language, 'Inside', '内装')
                        : tr(language, 'Outside', '外装')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-[15px] font-medium text-[#12141C]">
          {tr(language, 'Products', '产品')}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-gray-50 text-[12px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">{tr(language, 'Product', '产品')}</th>
                <th className="px-4 py-3 font-medium">{tr(language, 'Qty', '数量')}</th>
                <th className="px-4 py-3 text-right font-medium">
                  {tr(language, 'Reference', '参考价')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {est.items.map((it) => {
                const w = it.windowId ? byWindow.get(it.windowId) : null
                return (
                  <tr key={it.id}>
                    <td className="px-4 py-3">
                      <span className="text-[#12141C]">{it.variant || it.family}</span>
                      {w ? <span className="text-gray-500"> · {w.label}</span> : null}
                      <ConfigLine config={it.config} />
                      {it.assumed.length > 0 && (
                        <p className="mt-1 text-[12px] text-gray-500">
                          {tr(language, 'Some options were estimated.', '部分选项是按常见配置估的。')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-700">{it.qty}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#12141C]">
                      {it.unpriceable || it.refPrice == null ? (
                        <span className="text-[13px] text-gray-500">
                          {tr(language, 'Designer will confirm', '待设计师确认')}
                        </span>
                      ) : (
                        money(it.refPrice)
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50">
              <tr>
                <td className="px-4 py-3 text-[13px] text-gray-600" colSpan={2}>
                  {tr(language, 'Reference subtotal', '参考价合计')}
                  {est.totals.unpricedCount > 0 && (
                    <span className="text-gray-500">
                      {tr(language,
                          ` (${est.totals.unpricedCount} item(s) not yet priced)`,
                          `（还有 ${est.totals.unpricedCount} 项未定价）`)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-[16px] tabular-nums text-[#12141C]">
                  {money(est.totals.refSubtotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ★ 三句话必须一起出现,和后端 must_say 是同一套口径:
          这是参考价 / 不含安装与税 / 最终价由设计师上门量尺后确认。 */}
      <p className="mt-4 rounded-2xl bg-[#F7F6F3] p-4 text-[13px] leading-relaxed text-gray-600">
        {tr(language,
            'These are REFERENCE prices. They do not include installation or sales tax, and the final price is confirmed by your designer after the free in-home measure.',
            '以上均为参考价，不含安装费和销售税；最终价格由设计师上门免费量尺后确认。')}
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/contact"
          className="rounded-full bg-[#12141C] px-6 py-3 text-center text-[14px] text-white"
        >
          {tr(language, 'Book a free measure', '预约免费量窗')}
        </Link>
        <OpenInChatGpt
          token=""
          language={language}
          variant="secondary"
          lineOverride={estimateOpeningLine(est.estimateNo, language)}
          hint={tr(language,
              'The advisor will ask for your 6-digit access code before making any changes.',
              '顾问会先问你那 6 位取件码，才会改这张单子。')}
        />
      </section>

      <p className="mt-6 text-center text-[13px] text-gray-500">
        {tr(language, 'Questions? Call ', '有问题？请致电 ')}
        <a href={`tel:${PRIMARY_PHONE}`} className="underline">{PRIMARY_PHONE}</a>
      </p>
    </>
  )
}

function ConfigLine({ config }: { config: Record<string, unknown> }) {
  const parts = configSummary(config)
  if (!parts.length) return null
  return <p className="mt-1 text-[12px] text-gray-500">{parts.join(' · ')}</p>
}
