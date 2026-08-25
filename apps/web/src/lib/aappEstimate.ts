// Server-side bridge to AAPP `publicQuoteAction` — 统一 AI 报价单 (P4).
//
// 一张 AI 报价单 = 网站 AI / 推广页 AI / 客户 GPT 共用的 `AE-YYMM-XXXX`。
// AAPP 是真源:窗户、条目、参考价全部存在那边,网站这边不缓存价格。
//
// ★ 只从服务端调。`x-ad-key` 是共享密钥(AAPP 的 aiConfig/webIntake.secret),
//   它一旦进浏览器就等于公开 —— 任何人都能拿去建单、读单。所以每个导出的
//   函数第一件事就是拒绝在浏览器里跑,不靠「记得只在 server component 用」。
//
// ★ 这边永远拿不到 basePrice:AAPP 的 load_estimate 返回的是 toCustomerView
//   拼出来的客户面视图,真价连字段名都不出现。网站也不该有能力算真价。

const PUBLIC_QUOTE_URL =
  process.env.AAPP_PUBLIC_QUOTE_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/publicQuoteAction'

/** AE-YYMM-XXXX,尾 4 位是 Crockford(去掉了 0/O/1/I —— 客户要在电话里念)。 */
export const ESTIMATE_NO_RE = /^AE-\d{4}-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/
export const ACCESS_CODE_RE = /^\d{6}$/
export const VIEW_TOKEN_RE = /^[A-Za-z0-9_-]{22}$/

export interface EstimateWindow {
  id: string
  label: string
  room?: string
  widthIn: number
  heightIn: number
  mount: 'inside' | 'outside'
  notes?: string
  photoUrls?: string[]
}

export interface EstimateItem {
  id: string
  windowId?: string | null
  family: string
  variant: string
  config: Record<string, unknown>
  qty: number
  /** 参考价。**没有** basePrice —— 后端不给,网站也不该有。 */
  refPrice: number | null
  range: { low: number | null; high: number | null } | null
  assumed: string[]
  unpriceable?: boolean
}

export interface CustomerEstimate {
  estimateNo: string
  status: string
  lang: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  viewUrl: string | null
  windows: EstimateWindow[]
  items: EstimateItem[]
  totals: { refSubtotal: number; itemCount: number; unpricedCount: number }
  referral: { applied: boolean }
}

export type LoadResult =
  | { ok: true; estimate: CustomerEstimate }
  /** not_found / expired / locked —— 单号不存在和码不对回的是**同一个** not_found。 */
  | { ok: false; error: string }

export interface SaveInput {
  sessionId: string
  lang?: 'en' | 'zh'
  /** 有单号+码 → 改;没有 → 新建。 */
  estimateNo?: string
  accessCode?: string
  refToken?: string
  channel?: 'website_ai' | 'referral_page_ai'
  windows?: unknown[]
  items?: unknown[]
  customer?: { name?: string; phone?: string; email?: string }
}

export interface SaveResult {
  ok: boolean
  estimateNo?: string
  accessCode?: string
  viewUrl?: string
  totals?: { refSubtotal: number; itemCount: number; unpricedCount: number }
  error?: string
}

function assertServerOnly(fn: string): void {
  if (typeof window !== 'undefined') {
    throw new Error(`${fn} is server-only — it carries the AAPP shared secret`)
  }
}

/** 从不抛(除了 server-only 那条断言):调用方是页面和聊天工具,它们要能优雅降级。 */
async function callPublicQuote(
  action: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; data: any; error?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const secret = process.env.AAPP_WEBINTAKE_SECRET
  // ★ 没有密钥就别发:publicQuoteAction 对匿名请求一律 401,发过去只是白等
  //   一个来回,还会在日志里留下一串看不懂的 401。
  if (!secret) {
    console.error('[aapp-estimate] AAPP_WEBINTAKE_SECRET 没配 —— 报价单功能不可用')
    return { ok: false, data: null, error: 'not_configured' }
  }
  headers['x-ad-key'] = secret

  try {
    const res = await fetch(PUBLIC_QUOTE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, ...body }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      // ★ 只记状态码和 error 字段,不要把整份响应倒进日志 —— 里面有客户资料。
      console.error(`[aapp-estimate] ${action} http ${res.status}:`, String(data?.error || '').slice(0, 80))
      return { ok: false, data, error: `http_${res.status}` }
    }
    return { ok: true, data }
  } catch (e) {
    console.error(`[aapp-estimate] ${action} failed:`, (e as Error)?.message)
    return { ok: false, data: null, error: 'network' }
  }
}

/** 用查看链接里的 token 读单(公开页用)。 */
export async function loadEstimateByViewToken(viewToken: string): Promise<LoadResult> {
  assertServerOnly('loadEstimateByViewToken')
  if (!VIEW_TOKEN_RE.test(String(viewToken || ''))) return { ok: false, error: 'not_found' }
  const r = await callPublicQuote('load_estimate', { view_token: viewToken })
  if (!r.ok) return { ok: false, error: r.error || 'unavailable' }
  if (r.data?.ok !== true || !r.data?.estimate) return { ok: false, error: String(r.data?.error || 'not_found') }
  return { ok: true, estimate: r.data.estimate as CustomerEstimate }
}

/** 用单号 + 6 位码读单(AI 工具用)。 */
export async function loadEstimate(estimateNo: string, accessCode: string): Promise<LoadResult> {
  assertServerOnly('loadEstimate')
  const no = String(estimateNo || '').trim().toUpperCase()
  const code = String(accessCode || '').trim()
  // ★ 形状不对就地拒,回的错误和后端「查不到」一模一样 —— 在这边多说一句
  //   「单号格式不对」就等于替攻击者省掉一轮猜测。
  if (!ESTIMATE_NO_RE.test(no) || !ACCESS_CODE_RE.test(code)) return { ok: false, error: 'not_found' }
  const r = await callPublicQuote('load_estimate', { estimate_no: no, access_code: code })
  if (!r.ok) return { ok: false, error: r.error || 'unavailable' }
  if (r.data?.ok !== true || !r.data?.estimate) return { ok: false, error: String(r.data?.error || 'not_found') }
  return { ok: true, estimate: r.data.estimate as CustomerEstimate }
}

/** 建单或改单。★ 不传任何价格字段 —— 后端见到就整单拒。 */
export async function saveEstimate(input: SaveInput): Promise<SaveResult> {
  assertServerOnly('saveEstimate')
  const sessionId = String(input.sessionId || '').trim()
  if (!sessionId) return { ok: false, error: 'need_session' }

  const body: Record<string, unknown> = {
    session_id: sessionId,
    channel: input.channel === 'referral_page_ai' ? 'referral_page_ai' : 'website_ai',
  }
  if (input.lang === 'en' || input.lang === 'zh') body.lang = input.lang
  if (input.refToken) body.ref_token = input.refToken
  const no = String(input.estimateNo || '').trim().toUpperCase()
  const code = String(input.accessCode || '').trim()
  if (ESTIMATE_NO_RE.test(no) && ACCESS_CODE_RE.test(code)) {
    body.estimate_no = no
    body.access_code = code
  }
  if (Array.isArray(input.windows)) body.windows = input.windows
  if (Array.isArray(input.items)) body.items = input.items.map(stripPriceFields)
  if (input.customer) body.customer = input.customer

  const r = await callPublicQuote('save_estimate', body)
  if (!r.ok) return { ok: false, error: r.error || 'unavailable' }
  if (r.data?.ok !== true) return { ok: false, error: String(r.data?.error || 'save_failed') }
  return {
    ok: true,
    estimateNo: r.data.estimate_no,
    accessCode: r.data.access_code,
    viewUrl: r.data.view_url,
    totals: r.data.totals,
  }
}

/** 后端见到条目里带价格字段会整单 400。这边先摘掉,免得 AI 顺手塞一个
 *  `price` 就把整次保存搞砸 —— 但**不是**为了让价格偷偷通过:摘掉的键
 *  一个都不会被送出去,价永远由后端自己算。 */
const PRICE_KEYS = new Set([
  'basePrice', 'base_price', 'refPrice', 'ref_price', 'price', 'rangeLow', 'rangeHigh',
  'range_low', 'range_high', 'cost', 'subtotal', 'total', 'amount', 'msrp', 'listPrice',
])
export function stripPriceFields(item: unknown): unknown {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return item
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
    if (PRICE_KEYS.has(k)) continue
    out[k] = k === 'config' && v && typeof v === 'object' && !Array.isArray(v) ? stripPriceFields(v) : v
  }
  return out
}
