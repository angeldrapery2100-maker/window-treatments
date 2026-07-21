// Contact-detail guards for the store assistant (W6, 2026-07-21).
//
// Incident (Sonnet retest 7/21, F6): browser-persisted data (measurement
// sheet / project notes saved under the long-lived ad_anon cookie) contained
// a name+phone from an EARLIER visitor/session on the same browser. The
// assistant treated it as "your name and number from earlier" and was ready
// to submit a REAL booking with someone else's phone number. Separately
// (P0-5), test runs submitted fabricated identities (Taylor Nguyen /
// 323-555-0148 / test-f@example.com) straight into the production lead
// system, triggering real SMS sends.
//
// Two server-side defenses live here:
// 1. PROVENANCE — a phone/email may only be submitted (or echoed in a reply)
//    if the CUSTOMER typed it in this request's user messages (or a tool
//    returned it). Saved sheets, project notes, and model memory don't count.
// 2. RESERVED TEST IDENTITIES — 555-01xx numbers and example.com/test.com
//    style addresses are never real; block them from ever reaching the lead
//    system. (Testers should ALWAYS use these — that makes black-box tests
//    side-effect-free by construction.)

// ── Extraction / normalization ───────────────────────────────────────────────

// Phone-shaped sequences: 7–11 digits with common separators. We normalize to
// digits and compare on the last 10 (or 7) digits so "(323) 555-0148" matches
// "323-555-0148" and "3235550148".
const PHONE_RE = /(?:\+?1[-. (]*)?(?:\d[-. )(]*){7,11}\d/g
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  // Strip US country code; compare on the trailing 10 digits.
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}

// A normalized US phone is exactly 10 digits (or bare 7-digit local form).
// Requiring exactly 7 or 10 keeps 8-digit dates (2026-07-21) and order-number
// fragments from being mistaken for phones.
function isPhoneLength(n: string): boolean {
  return n.length === 10 || n.length === 7
}

export function extractPhones(text: string): string[] {
  const out = new Set<string>()
  for (const m of text.match(PHONE_RE) ?? []) {
    const n = normalizePhone(m)
    if (isPhoneLength(n)) out.add(n)
  }
  return [...out]
}

export function extractEmails(text: string): string[] {
  return [...new Set((text.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()))]
}

// ── Reserved / test identities (P0-5) ────────────────────────────────────────

// NANP fictional exchange: XXX-555-01xx. Matches both 10-digit and bare
// 7-digit forms.
export function isReservedTestPhone(raw: string): boolean {
  const n = normalizePhone(raw)
  if (n.length === 10) return n.slice(3, 6) === '555' && n.slice(6, 8) === '01'
  if (n.length === 7) return n.slice(0, 3) === '555' && n.slice(3, 5) === '01'
  return false
}

const RESERVED_EMAIL_DOMAIN_RE =
  /@(?:[A-Za-z0-9-]+\.)*(?:example\.(?:com|org|net)|test\.com)$|\.(?:test|example|invalid)$/i

export function isReservedTestEmail(raw: string): boolean {
  return RESERVED_EMAIL_DOMAIN_RE.test(raw.trim())
}

// ── Provenance checks ────────────────────────────────────────────────────────

/**
 * True when `phone` (normalized) appears in any of the source texts.
 * Sources should be THIS request's user-message texts (and, for reply
 * checking, tool-result JSON).
 */
export function phoneProvidedInSources(phone: string, sources: string[]): boolean {
  const target = normalizePhone(phone)
  if (target.length < 7) return false
  for (const src of sources) {
    for (const p of extractPhones(src)) {
      if (p === target || p.endsWith(target) || target.endsWith(p)) return true
    }
  }
  return false
}

export function emailProvidedInSources(email: string, sources: string[]): boolean {
  const target = email.trim().toLowerCase()
  if (!target) return false
  return sources.some((src) => src.toLowerCase().includes(target))
}

// Company contacts the assistant may always state.
const CONTACT_WHITELIST_PHONES = new Set(['6264519841'])
const CONTACT_WHITELIST_EMAILS = new Set(['admin@angel-drapery.com'])

/**
 * Phones/emails in `reply` that are neither whitelisted company contacts nor
 * present in any source (user messages + tool results for this request).
 * Non-empty result ⇒ the model injected contact details from nowhere
 * (typically stale saved data) and the reply must not be sent as-is.
 */
export function findUnverifiedContacts(reply: string, sources: string[]): string[] {
  const bad: string[] = []
  for (const p of extractPhones(reply)) {
    if (CONTACT_WHITELIST_PHONES.has(p)) continue
    if (!phoneProvidedInSources(p, sources)) bad.push(p)
  }
  for (const e of extractEmails(reply)) {
    if (CONTACT_WHITELIST_EMAILS.has(e)) continue
    if (!emailProvidedInSources(e, sources)) bad.push(e)
  }
  return bad
}

/** Customer-safe fallback when a reply leaks an unverified contact detail. */
export function contactClaimFallbackReply(language: 'zh' | 'en'): string {
  return language === 'zh'
    ? '不好意思，我刚才把信息弄混了，已经纠正。如果您希望我们跟进，请直接在这里告诉我您的联系方式；也可以致电 626-451-9841。'
    : "Sorry — I mixed something up just now and have corrected it. If you'd like us to follow up, please share your contact info right here — or call us at 626-451-9841."
}

/** Strip phone/email patterns out of free-text fields destined for storage
 * (project item notes, measurement locations) so PII never enters the
 * browser-persisted layer in the first place. */
export function scrubContactsFromText(text: string): string {
  return text.replace(EMAIL_RE, '[removed]').replace(PHONE_RE, (m) => {
    const n = normalizePhone(m)
    return isPhoneLength(n) ? '[removed]' : m
  })
}
