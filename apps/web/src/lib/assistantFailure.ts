/**
 * #24-3 (Eddie 2026-08-26) — AI 客服失败分层。
 *
 * 现场:落地页问 AI，前面几个窗帘问题都答得好好的，某一次突然回
 * 「The assistant is having trouble right now.」。凭截图无法判断坏在
 * 哪一层 —— 模型？API？我们自己的函数？工具？
 *
 * 原因是 /api/store/assistant 有**四个**失败出口共用同一句话，日志里也
 * 只有一句 console.error，事后完全对不上号。
 *
 * 这个模块把失败分成有限的几类：
 *   - 日志里打 `[assistant] FAIL <CODE>`，可以按码统计真实失败率；
 *   - 回给前端的 payload 带 `code`；
 *   - 客户看到的那句话末尾附一个小号参考码 —— 下次再截图，看一眼就知道
 *     该查哪一层。
 *
 * ★ 这个文件**不许 import 任何东西**：守卫脚本要用
 *   `node --experimental-strip-types` 直接把它跑起来做真执行测试。
 */

export const ASSISTANT_FAIL_CODES = [
  'AI_TIMEOUT',           // 上游没在时限内回来（我们自己 abort 的，或 408/504）
  'API_RATE_LIMIT',       // 429 / 明说 rate limit
  'API_OVERLOADED',       // 529 / 503 / 明说 overloaded
  'API_AUTH',             // 401 / 403 —— key 没配对或被撤
  'API_ERROR',            // 其它非 2xx，归不了类的
  'TOOL_LOOP_EXHAUSTED',  // 工具来回 5 轮还没给出最终答复
  'INVALID_RESPONSE',     // 上游 200 了，但内容为空 / 只剩一行快捷回复
  'FUNCTION_ERROR',       // 我们自己这一层抛了异常
] as const

export type AssistantFailCode = (typeof ASSISTANT_FAIL_CODES)[number]

/** 工具软失败单独记一类（不直接构成对客失败，但要能统计）。 */
export const QUOTE_TOOL_ERROR = 'QUOTE_TOOL_ERROR'

/** 定价/报价相关的工具 —— 它们坏了，客户拿到的就是错的价或没有价。 */
const PRICING_TOOLS = new Set([
  'reference_estimate',
  'save_estimate',
  'load_estimate',
  'create_quote_draft',
  'price_lookup',
])

export function isPricingTool(name: unknown): boolean {
  return PRICING_TOOLS.has(String(name || ''))
}

/**
 * 上游非 2xx → 错误码。
 * status 先判（它最可信），判不出来再看响应体里的 type/message。
 */
export function classifyUpstreamFailure(status: number, body = ''): AssistantFailCode {
  if (status === 429) return 'API_RATE_LIMIT'
  if (status === 529 || status === 503) return 'API_OVERLOADED'
  if (status === 401 || status === 403) return 'API_AUTH'
  if (status === 408 || status === 504) return 'AI_TIMEOUT'
  const b = String(body || '').toLowerCase()
  if (b.includes('overloaded')) return 'API_OVERLOADED'
  if (b.includes('rate_limit') || b.includes('rate limit')) return 'API_RATE_LIMIT'
  if (b.includes('authentication') || b.includes('invalid x-api-key')) return 'API_AUTH'
  if (b.includes('timeout') || b.includes('timed out')) return 'AI_TIMEOUT'
  return 'API_ERROR'
}

/**
 * 抛出来的异常 → 错误码。
 * ★ abort 要认出来:我们自己的超时闸就是靠 AbortController 关的，
 *   把它算成 FUNCTION_ERROR 会把「上游太慢」误报成「我们的代码有 bug」，
 *   下次照样查错方向。
 */
export function classifyThrownFailure(err: unknown): AssistantFailCode {
  const name = String((err as { name?: unknown })?.name || '')
  const msg = String((err as { message?: unknown })?.message || err || '').toLowerCase()
  if (name === 'AbortError' || name === 'TimeoutError') return 'AI_TIMEOUT'
  if (msg.includes('aborted') || msg.includes('timeout') || msg.includes('timed out')) return 'AI_TIMEOUT'
  return 'FUNCTION_ERROR'
}

/** 对客文案。保持原来那句话不变，只在末尾附参考码。 */
export function assistantFailMessage(code: AssistantFailCode): string {
  return (
    'The assistant is having trouble right now. Please try again, or call us at 626-451-9841.' +
    ` (Ref: ${code})`
  )
}

/** HTTP 状态码:上游的问题算 502，我们自己的算 500。 */
export function assistantFailHttpStatus(code: AssistantFailCode): number {
  return code === 'FUNCTION_ERROR' ? 500 : 502
}
