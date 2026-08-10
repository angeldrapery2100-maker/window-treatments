// One place to call AAPP's `chatgptAction` Cloud Function.
//
// hdPricing.ts, sundanceJcPricing.ts and lumaPricing.ts each carry their own
// copy of this fetch-with-one-retry. New callers use this one instead of
// adding a fourth; the existing three are left alone deliberately — they are
// covered by their own regressions and rewriting them buys nothing today.

export const AAPP_ACTION_URL = () =>
  process.env.AAPP_CHATGPT_ACTION_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/chatgptAction'

export interface AappActionResult {
  status: number
  data: any
}

/** POST one action. Retries once on network error / 5xx / 429 — the eval runs
 *  hit intermittent cold-start hiccups that a single retry absorbs. Returns
 *  null when both attempts failed to produce a response at all. */
export async function callAappAction(
  body: Record<string, unknown>,
  timeoutMs = 12_000
): Promise<AappActionResult | null> {
  const token = process.env.AAPP_CHATGPT_ACTION_TOKEN
  if (!token) return null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(AAPP_ACTION_URL(), {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (res.status >= 500 || res.status === 429) continue
      if (!res.ok) return { status: res.status, data: null }
      return { status: res.status, data: await res.json().catch(() => null) }
    } catch {
      /* network — retry once */
    }
  }
  return null
}

export function aappConfigured(): boolean {
  return !!process.env.AAPP_CHATGPT_ACTION_TOKEN
}

/** AAPP reports a missing required field as `"cassette (round/square)"` —
 *  field name, then the values it will accept. Pull both back out so callers
 *  can self-configure or ask the customer.
 *
 *  Real examples (verified against the live function, 2026-08-10):
 *    "cassette (round/square)"
 *    "option (plastic_chain/stainless_chain/cordless/motorized)"
 *    "controlSide (left/right)"
 *    "motorId (id1/id2/…)"
 *  Prose in the parens ("see Product Library") yields no options — callers
 *  must not send those words as a value. */
export function parseMissing(entry: string): { field: string; options: string[] } {
  const m = /^([A-Za-z]+)\s*\((.*)\)\s*$/.exec(entry.trim())
  if (!m) return { field: entry.trim().split(/\s+/)[0], options: [] }
  return {
    field: m[1],
    options: m[2]
      .split('/')
      .map((s) => s.trim())
      .filter((s) => s && !s.includes(' ')),
  }
}
