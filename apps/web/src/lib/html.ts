/**
 * Escape user-supplied text before interpolating into HTML email bodies.
 * Prevents HTML injection / phishing via name, phone, email, address, product
 * name, tracking number, or any other user- or third-party-controlled field.
 *
 * Use EVERYWHERE a string from a form field, database column, or external API
 * (Shippo, Stripe, etc.) gets inlined into an HTML template — not just the
 * obvious text bodies.
 */
export function escapeHtml(s: unknown): string {
  if (s === null || s === undefined) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Stricter escaping for values that will be placed inside an href="..." or
 * src="..." attribute. Allows only http(s)/mailto/tel URLs; anything else
 * (including "javascript:" or "data:") is turned into "#" so a malicious
 * tracking URL from an upstream provider can never become a clickable XSS.
 */
export function safeUrl(s: unknown): string {
  const str = String(s ?? '').trim()
  if (!str) return '#'
  // Allow only http(s), mailto, tel. Reject javascript:, data:, vbscript:, file:, etc.
  if (!/^(https?:|mailto:|tel:)/i.test(str)) return '#'
  // Still HTML-escape the URL for attribute context (quotes / ampersands).
  return escapeHtml(str)
}
