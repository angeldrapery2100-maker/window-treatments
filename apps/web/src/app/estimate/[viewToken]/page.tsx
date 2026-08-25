import type { Metadata } from 'next'
import { loadEstimateByViewToken } from '@/lib/aappEstimate'
import EstimateView from './EstimateView'

// 客户的 AI 报价单查看页(P4-4)。
//
// 这条链接由 AAPP 的 save_estimate 生成,客户会把它转发给家人、发进群 ——
// 所以:
//   • noindex/nofollow:每张单一个 URL,内容近乎一致,正是拖垮站点质量信号的
//     薄内容;而且它本来就不该被搜到。
//   • force-dynamic + no-store:单子会改(客户在 GPT 里加一扇窗),缓存住就
//     等于给客户看一份过期的价。
//   • 页面上**只有参考价**。真价从来不出 AAPP —— load_estimate 返回的是
//     toCustomerView 拼的客户面视图,连 basePrice 这个字段名都不存在。
//   • 查不到 / 过期 / 链接被改一个字符 —— 一律走同一个「找不到」页面,不给
//     任何能区分这三种情况的线索。

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  title: 'Your estimate · 您的报价单 — Angel Drapery',
  robots: { index: false, follow: false, nocache: true },
}

export default async function EstimatePage({
  params,
}: {
  params: Promise<{ viewToken: string }>
}) {
  const { viewToken } = await params
  const r = await loadEstimateByViewToken(viewToken)
  return <EstimateView result={r} />
}
