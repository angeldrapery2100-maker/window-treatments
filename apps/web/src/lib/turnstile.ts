// Cloudflare Turnstile server-side verification.
//
// Verifies the token produced by the browser widget against Cloudflare's
// siteverify endpoint before we save/email a consultation request.
//
// Behaviour:
//  - No TURNSTILE_SECRET_KEY configured (local dev / preview without secrets):
//    verification is SKIPPED so the form keeps working. A warning is logged so
//    the misconfiguration is visible. Set the secret in production to enforce.
//  - Secret set + missing/invalid token: returns ok=false → caller replies 403.
//  - Network error talking to Cloudflare: fails OPEN (ok=true, skipped=true) so a
//    Cloudflare hiccup can't take the form down. The honeypot, timing, rate-limit
//    and heuristic layers still apply. Flip to fail-closed if abuse resumes.

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileResult {
  ok: boolean
  skipped: boolean
  error?: string
}

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification')
    return { ok: true, skipped: true }
  }
  if (!token || !String(token).trim()) {
    return { ok: false, skipped: false, error: 'missing-token' }
  }

  try {
    const form = new URLSearchParams()
    form.append('secret', secret)
    form.append('response', String(token))
    if (remoteIp && remoteIp !== 'unknown') form.append('remoteip', remoteIp)

    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })
    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] }
    if (!data.success) {
      return {
        ok: false,
        skipped: false,
        error: (data['error-codes'] || []).join(',') || 'verification-failed',
      }
    }
    return { ok: true, skipped: false }
  } catch (err) {
    console.error('[turnstile] siteverify request failed (failing open):', err)
    return { ok: true, skipped: true, error: 'verify-request-failed' }
  }
}
