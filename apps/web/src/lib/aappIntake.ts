// Server-side bridge to the AAPP `websiteInquiry` Cloud Function.
//
// Both the AI chat assistant (submit_website_inquiry tool) and the "Request a
// Consultation" form call this. The backend does everything else automatically:
// create the customer profile, round-robin the lead to a salesperson (who gets
// an SMS), generate a booking link, text the customer that link (when they
// consented), and run the 12h/24h follow-up automations.
//
// We call it ONLY from the server so the optional shared secret never reaches
// the browser. CORS is already allowed for angel-drapery.com, but server-side
// keeps the door open to enable `x-ad-key` without leaking it.

const WEBSITE_INQUIRY_URL =
  process.env.AAPP_WEBINTAKE_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/websiteInquiry'

import { TOKEN_RE } from '@/lib/referral'

export type InquiryIntent = 'triage' | 'repair'

export interface InquiryInput {
  name?: string
  phone?: string
  email?: string
  address?: string
  message?: string
  productType?: string
  intent?: InquiryIntent
  smsConsent?: boolean
  // 'website_chat' for the AI assistant, 'website_form' for the consultation form.
  source?: string
  /** Referral attribution (推广系统 P1). The token comes from the httpOnly
   *  ad_ref cookie ONLY — never from anything the model or the browser body
   *  claims — and AAPP resolves it to the referrer + any partner pricing. */
  referral?: { token: string; page?: string }
}

export interface InquiryResult {
  ok: boolean
  link?: string
  leadId?: string
  smsSent?: boolean
  error?: string
  /** Echoed by AAPP when the referral token resolved: whether it was applied
   *  and to whom (a label safe to show the customer, e.g. "Jenny L."). */
  referral?: { applied: boolean; type?: string; label?: string }
}

/**
 * Submit a lead to AAPP. Never throws — returns { ok:false, error } on failure
 * so callers (a chat tool, a form handler) can degrade gracefully. Requires at
 * least a name and one of phone/email; without a phone the backend can't SMS.
 */
export async function submitWebsiteInquiry(input: InquiryInput): Promise<InquiryResult> {
  const name = (input.name || '').trim()
  const phone = (input.phone || '').trim()
  const email = (input.email || '').trim()
  if (!name && !phone && !email) {
    return { ok: false, error: 'need_contact' }
  }

  // Dev/preview only: a black-box referral test uses a reserved 555-01xx
  // number, which the guard below blocks before AAPP ever sees the payload —
  // so this is the only place a tester can confirm the token was carried.
  if (process.env.NODE_ENV !== 'production' && input.referral?.token) {
    console.debug('[aapp-intake] referral on inquiry:', input.referral.token, input.referral.page || '')
  }

  // W6 (P0-5): reserved/test identities never reach the real lead system.
  // 555-01xx is the NANP fictional range; example.com/test.com are reserved
  // domains — black-box tests use exactly these, so blocking them here makes
  // testing side-effect-free (no real leads, no real SMS sends) at EVERY
  // caller of this choke point, not just the chat tool.
  {
    const { isReservedTestPhone, isReservedTestEmail } = await import('@/lib/contactClaimGuard')
    if ((phone && isReservedTestPhone(phone)) || (email && isReservedTestEmail(email))) {
      console.warn('[aappIntake] BLOCKED reserved/test identity:', phone || email)
      return { ok: false, error: 'test_identity_blocked' }
    }
  }

  const body: Record<string, unknown> = {
    name,
    phone,
    email,
    address: (input.address || '').trim(),
    message: (input.message || '').trim(),
    productType: (input.productType || '').trim(),
    intent: input.intent === 'repair' ? 'repair' : 'triage',
    smsConsent: input.smsConsent === true,
    source: input.source || 'website_chat',
    website: '', // honeypot — always empty from a legitimate server call
  }
  // Only a well-formed token travels; a malformed one is dropped silently so
  // a junk cookie can never make the whole lead submission fail.
  if (input.referral && TOKEN_RE.test(input.referral.token)) {
    body.referral = {
      token: input.referral.token,
      page: String(input.referral.page || '').slice(0, 120),
    }
  }

  // A text was PROMISED to the customer only when they consented and gave a
  // number — that is the denominator for delivery, not every submission.
  const smsPromised = body.smsConsent === true && !!phone

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  // Optional shared secret: set AAPP_WEBINTAKE_SECRET in Vercel AND the matching
  // Firestore aiConfig/webIntake.secret to enforce it. Absent → not sent.
  const secret = process.env.AAPP_WEBINTAKE_SECRET
  if (secret) headers['x-ad-key'] = secret

  try {
    const res = await fetch(WEBSITE_INQUIRY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      // Don't let a slow backend hang the chat/form request.
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[aapp-intake] websiteInquiry ${res.status}:`, detail.slice(0, 300))
      return { ok: false, error: `http_${res.status}` }
    }
    const data = (await res.json().catch(() => ({}))) as any
    // The CF returns HTTP 200 even for a rejected key ({ok:false,error:"bad key"}),
    // so log the failure reason explicitly — otherwise it's invisible.
    if (data?.ok !== true) {
      console.error('[aapp-intake] websiteInquiry rejected:', JSON.stringify(data).slice(0, 200))
    }
    // Booking-link SMS observability (2026-08-22). The phone channel's weekly
    // review found 3 of 4 links silently failing on Twilio auth/config, and
    // the website rides the SAME backend — but nothing here ever looked at
    // `smsSent`, so a website-side failure would have been invisible. One
    // warn at the choke point covers every caller: chat, consultation form,
    // and anything added later. Grep '[aapp-intake] booking link SMS' in the
    // Vercel logs for the website half of link_attempted / link_delivered.
    if (data?.ok === true && smsPromised && data?.smsSent !== true) {
      console.warn(
        '[aapp-intake] booking link SMS NOT delivered (smsSent!=true) — source:',
        body.source, '· leadId:', data?.leadId || 'n/a'
      )
    }
    return {
      ok: data?.ok === true,
      link: typeof data?.link === 'string' ? data.link : undefined,
      leadId: typeof data?.leadId === 'string' ? data.leadId : undefined,
      smsSent: data?.smsSent === true,
      referral: data?.referral && typeof data.referral === 'object'
        ? {
            applied: data.referral.applied === true,
            type: typeof data.referral.type === 'string' ? data.referral.type : undefined,
            label: typeof data.referral.label === 'string' ? data.referral.label : undefined,
          }
        : undefined,
      error: data?.ok === true ? undefined : (data?.error || 'inquiry_failed'),
    }
  } catch (e: any) {
    console.error('[aapp-intake] request failed:', e?.message || e)
    return { ok: false, error: 'request_failed' }
  }
}
