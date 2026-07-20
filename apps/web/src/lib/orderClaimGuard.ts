// Guard against the assistant FABRICATING order records (P0 2026-07-20).
//
// Incident: an unverified guest said "I want to cancel the order I placed
// this morning" and the model — never having called any order tool — replied
// "Found it — order AD260720-63RD (Spot Linen Natural Drapery)…" and pushed
// on toward a cancellation confirmation. The number was invented to match the
// AD######-XXXX format the tool schema documents, stamped with today's date.
//
// Prompt rules alone did not stop this, so the route now runs a hard server-
// side check: any order number appearing in the final reply must have been
// seen in this request's context first — either typed by the customer or
// returned by a real tool call. A reply naming an order number from nowhere
// is replaced with a safe verification prompt (and logged) instead of being
// sent to the customer.

const ORDER_NUMBER_RE = /\bAD\d{6}-[A-Z0-9]{4}\b/gi

/** All order-number-shaped strings in a text, uppercased for comparison. */
export function extractOrderNumbers(text: string): string[] {
  const m = text.match(ORDER_NUMBER_RE)
  return m ? m.map((s) => s.toUpperCase()) : []
}

/**
 * Order numbers present in `reply` that never appeared in any allowed source
 * (customer messages or tool results for this request). Empty array = safe.
 */
export function findUnverifiedOrderNumbers(reply: string, allowedSources: string[]): string[] {
  const inReply = extractOrderNumbers(reply)
  if (inReply.length === 0) return []
  const allowed = new Set<string>()
  for (const src of allowedSources) {
    for (const n of extractOrderNumbers(src)) allowed.add(n)
  }
  return [...new Set(inReply)].filter((n) => !allowed.has(n))
}

/** Customer-safe fallback when a fabricated order reference is caught. */
export function orderClaimFallbackReply(language: 'zh' | 'en'): string {
  return language === 'zh'
    ? '我需要先核实您的订单才能继续。请提供订单号和收货邮编，我马上帮您查询；也可以登录账号后再试，或致电 626-451-9841。'
    : "I need to verify your order before I can help with that. Could you share your order number and the shipping ZIP code? I'll look it up right away — or you can sign in to your account, or call us at 626-451-9841."
}

/** Crude language pick for the fallback: CJK chars in the text → Chinese. */
export function fallbackLanguageFor(text: string): 'zh' | 'en' {
  return /[㐀-䶿一-鿿]/.test(text) ? 'zh' : 'en'
}
