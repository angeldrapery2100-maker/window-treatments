// 客户版 GPT 的公开入口 —— 唯一真源(P3 §B-6)。
//
// 「Angel Drapery Curtain Advisor · 天使窗帘顾问」发布为「知道链接的任何人」
// 可访问的公开 GPT。链接换了只改这里,或用 NEXT_PUBLIC_CUSTOMER_GPT_URL 覆盖;
// 页面一律走 customerGptUrl(),不许再出现第二个硬编码的 chatgpt.com 地址。
//
// ★ 安全:这条链接是公开落地页,不含也不能含任何密钥。PUBLIC_GPT_KEY 只活在
//   Firebase secret 和 GPT Builder 的认证设置里 —— 前端、URL、网页源码三处
//   永远不出现。customerGpt.test.ts 里有一条断言替这件事站岗。
//
// ★★ 归因为什么不走 URL 参数(2026-08-24,Eddie 无痕窗口实测推翻了上一版):
//   `?ref=<token>` 打开 GPT 后,token 只停在地址栏 —— 输入框是空的、不会生成
//   首条消息、remember_referral 根本不会被调用。`?q=` 在未登录页面同样不预填。
//   OpenAI 只保证公开 GPT 能用直链打开,从没承诺任何查询参数会注入对话。
//   所以链接上不再挂 ref(挂了只会让人以为归因还在),改成:点按钮时把一句
//   带 token 的开场口令复制到剪贴板,并在页面上明说「请粘贴发送」。
//   这条口令的形状必须与 Instructions 的 REFERRAL 一节对得上 —— 它认的是
//   消息里出现 `ref=<token>`。

export const CUSTOMER_GPT_URL =
  'https://chatgpt.com/g/g-69ae086bc2fc81918d1d1ab235935eec-angel-drapery-curtain-advisor-tian-shi-chuang-lian-gu-wen'

/** token 只允许 base64url 字符 —— 别的一概不往口令里拼。 */
const REF_SAFE = /^[A-Za-z0-9_-]{1,64}$/

export function isSafeRefToken(token?: string | null): boolean {
  return REF_SAFE.test(String(token || ''))
}

export function customerGptUrl(): string {
  return String(process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL || CUSTOMER_GPT_URL).trim()
}

/**
 * 要粘进 ChatGPT 的第一句话。`ref=<token>` 必须在里面,Instructions 靠它认人;
 * 后面那半句是给客户看的,顺带让 GPT 知道该怎么开场。
 */
export function referralOpeningLine(token: string, language: 'en' | 'zh' = 'en'): string {
  if (!isSafeRefToken(token)) return ''
  return language === 'zh'
    ? `ref=${token} — 你好，我是朋友推荐来的。`
    : `ref=${token} — Hi, I came from a referral link.`
}

/** 尽力复制。返回是否真的写进了剪贴板 —— 失败时页面要把口令显示出来让人手动复制。 */
export async function copyText(text: string): Promise<boolean> {
  if (!text) return false
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch { /* 权限被拒 / 非安全上下文 —— 走下面的兜底 */ }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch { return false }
}

/** 点「在 ChatGPT 里打开」的行为埋点。失败无所谓 —— 绝不能挡住跳转。 */
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
