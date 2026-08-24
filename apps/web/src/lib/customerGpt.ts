// 客户版 GPT 的公开入口 —— 唯一真源(P3 §B-6)。
//
// 「Angel Drapery Curtain Advisor · 天使窗帘顾问」发布为「知道链接的任何人」
// 可访问的公开 GPT。链接换了只改这里,或用 NEXT_PUBLIC_CUSTOMER_GPT_URL 覆盖;
// 页面里一律走 customerGptUrl(),不许再出现第二个硬编码的 chatgpt.com 地址。
//
// ★ 安全:这条链接是公开落地页,不含也不能含任何密钥。PUBLIC_GPT_KEY 只活在
//   Firebase secret 和 GPT Builder 的认证设置里 —— 前端、URL、网页源码三处
//   永远不出现。customerGpt.test.ts 里有一条断言替这件事站岗。
//
// ref 参数:GPT 的 Instructions 第一节写着「首条消息里带 ref=<token> 就静默调
// remember_referral」。所以推荐人的 token 要跟着链接过去,归因才不断。

export const CUSTOMER_GPT_URL =
  'https://chatgpt.com/g/g-69ae086bc2fc81918d1d1ab235935eec-angel-drapery-curtain-advisor-tian-shi-chuang-lian-gu-wen'

/** 出参编码前的形状闸:token 只允许 base64url 字符,别的一概不往 URL 上拼。 */
const REF_SAFE = /^[A-Za-z0-9_-]{1,64}$/

export function customerGptUrl(refToken?: string | null): string {
  const base = String(process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL || CUSTOMER_GPT_URL).trim()
  if (!base) return ''
  const t = String(refToken || '')
  if (!t || !REF_SAFE.test(t)) return base
  return `${base}${base.includes('?') ? '&' : '?'}ref=${encodeURIComponent(t)}`
}

/** 点击「在 ChatGPT 里打开」的行为埋点。失败无所谓 —— 绝不能挡住跳转。 */
export function logGptOpen(): void {
  try {
    fetch('/api/store/lead-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'gpt_open' }),
      keepalive: true,
    }).catch(() => {})
  } catch { /* 老浏览器没有 fetch / keepalive —— 静默放过 */ }
}
