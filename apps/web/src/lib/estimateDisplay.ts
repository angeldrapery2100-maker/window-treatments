// 报价单页面上的纯展示逻辑。
//
// ★ 为什么单独一个文件:EstimateView 是 'use client' 组件,而 lib/aappEstimate.ts
//   会读 AAPP_WEBINTAKE_SECRET。那个密钥读在函数体里、不会被打进客户端包,但
//   「客户端组件 import 一个装着服务端密钥的模块」这件事本身就不该成立 ——
//   哪天有人把那句 process.env 挪到模块顶层,就是一次真实的泄漏。类型可以
//   import type(编译期擦掉),值必须从这里拿。

/* ── 配置摘要 ────────────────────────────────────────────────────
   config 是 AI 填进去的自由结构。今天里面只有 fabricFullCode / cassette /
   option 这类东西,但它是**上游决定形状**的字段 —— 哪天定价器多回一个
   unitCost、多回一个 dealerPrice,页面要是照单全收就当场把成本印给客户看了。
   所以这边是白名单式的:只留字符串/数字,且键名不像钱。 */
const MONEY_KEY_RE =
  /price|cost|amount|msrp|list|subtotal|total|fee|commission|markup|margin|multiplier|discount|factor|rate|wholesale|dealer/i

export function configSummary(config: unknown, max = 4): string[] {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return []
  const out: string[] = []
  for (const [k, v] of Object.entries(config as Record<string, unknown>)) {
    if (MONEY_KEY_RE.test(k)) continue
    if (typeof v !== 'string' && typeof v !== 'number') continue
    const s = String(v).trim()
    if (!s) continue
    out.push(s.replace(/_/g, ' '))
    if (out.length >= max) break
  }
  return out
}
