// Fabricated-price hard gate.
//
// WHY (2026-08-10, caught in live testing): asked for a 120" single-layer
// decorative rod, the assistant answered "$180–$420". Neither figure exists
// for that configuration — $420 is the DOUBLE metal rod and $180 is a
// sub-48" base price. Re-asked, it called the tool and said "$110–$390",
// which is correct. So on the first pass it assembled a plausible-looking
// price from context instead of from a tool, on the very turn the customer
// finished answering the tool's own question.
//
// The prompt already forbids this in several places, and the tool result
// even hands the model a pre-formatted `reference_range` string to copy. It
// still happened once in five. Prompts reduce the rate; they don't make it
// zero — so this mirrors orderClaimGuard / contactClaimGuard: a deterministic
// server-side check that a money figure in the reply traces back to something
// a tool actually returned (or the customer themselves typed).
//
// DESIGN NOTES
// - Compares NUMBERS, not strings: "$1,623" in the reply matches 1623 in a
//   tool result. Formatting differences must not read as fabrication.
// - Allows small talk about money that isn't a quote: swatch shipping
//   ($2.99 / $9.99) and the big-project threshold ($5,000) are stated in the
//   prompt and knowledge, not by a tool.
// - Rounding tolerance: the model may legitimately say "about $520" for 522.
//   We accept anything within 2% or $5 of a sourced number, whichever is
//   larger — enough for honest rounding, far too tight to cover an invented
//   figure.
// - Fails OPEN on a reply with no money in it at all: this guard only ever
//   looks at replies that state a price.

/** Figures the prompt/knowledge legitimately allow without a tool call. */
const PROMPT_SANCTIONED = new Set([2.99, 9.99, 5000])

/** Pull every dollar amount out of text. Handles $1,623 · $150 · $2,283.10 */
export function extractMoney(text: string): number[] {
  const out: number[] = []
  const re = /\$\s?([0-9][0-9,]*(?:\.[0-9]{1,2})?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const n = Number(m[1].replace(/,/g, ''))
    if (Number.isFinite(n)) out.push(n)
  }
  return out
}

function withinTolerance(claim: number, source: number): boolean {
  const tol = Math.max(5, source * 0.02)
  return Math.abs(claim - source) <= tol
}

/**
 * Money figures in `reply` that no tool result and no customer message can
 * account for. A non-empty return means the model invented a price.
 *
 * @param sources raw tool-result JSON strings plus the customer's own texts
 */
export function findUnsourcedPrices(reply: string, sources: string[]): number[] {
  const claimed = extractMoney(reply)
  if (claimed.length === 0) return []

  const sourced: number[] = []
  for (const s of sources) {
    sourced.push(...extractMoney(s))
    // Tool results carry bare numbers too (range_low: 110, price: 1623), not
    // just "$110" strings — collect those or every range would look invented.
    const bare = s.match(/-?\d+(?:\.\d+)?/g)
    if (bare) for (const b of bare) {
      const n = Number(b)
      if (Number.isFinite(n)) sourced.push(n)
    }
  }

  const bad: number[] = []
  for (const c of claimed) {
    if (PROMPT_SANCTIONED.has(c)) continue
    if (sourced.some((s) => withinTolerance(c, s))) continue
    bad.push(c)
  }
  return bad
}

export function priceClaimFallbackReply(language: 'zh' | 'en'): string {
  return language === 'zh'
    ? '抱歉,这个尺寸和配置我需要重新核一遍价格才敢报给您——我不想给您一个不准的数字。方便的话我帮您约一次免费上门量尺,设计师现场确认准确报价;也可以直接打 626-451-9841 找我们同事。\n[quick] 帮我约上门量尺 | 我再说说需求 | 打电话联系'
    : "Sorry — I'd rather re-check that price than give you a number I'm not sure of. I can book you a free in-home measure so a designer confirms it exactly, or you can reach us on 626-451-9841.\n[quick] Book a free measure | Tell you more first | Call instead"
}
