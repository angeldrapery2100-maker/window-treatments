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
}

export interface InquiryResult {
  ok: boolean
  link?: string
  smsSent?: boolean
  error?: string
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
    return {
      ok: data?.ok === true,
      link: typeof data?.link === 'string' ? data.link : undefined,
      smsSent: data?.smsSent === true,
      error: data?.ok === true ? undefined : (data?.error || 'inquiry_failed'),
    }
  } catch (e: any) {
    console.error('[aapp-intake] request failed:', e?.message || e)
    return { ok: false, error: 'request_failed' }
  }
}
