// Server-side bridge to the AAPP `measureSheet` Cloud Function (v869).
//
// A salesperson creates a 'measure' typed link in AAPP (createTypedLink) —
// the URL points at OUR /measure-wizard?t=<token>. This bridge lets the
// wizard (a) prefill the customer's contact info + show the salesperson's
// name card, and (b) submit the finished sheet back to AAPP, where it lands
// on the client profile labelled 客户自测 (customer self-measured).
//
// Server-only, same reasoning as aappIntake.ts: the token is the auth, but
// keeping the call server-side hides the CF URL shape and lets us rate-limit.

const MEASURE_SHEET_URL =
  process.env.AAPP_MEASURE_SHEET_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/measureSheet'

export interface MeasureLinkSalesperson {
  name: string
  phone: string
  avatar: string
  languages: string[]
}

export interface MeasureLinkInfo {
  ok: boolean
  submitted?: boolean
  prefill?: { name?: string; phone?: string; email?: string; address?: string }
  salesperson?: MeasureLinkSalesperson
  company?: string
  error?: string
}

export interface MeasureSubmitContact {
  name?: string
  phone?: string
  email?: string
  address?: string
}

async function callBridge(body: Record<string, unknown>): Promise<any> {
  const res = await fetch(MEASURE_SHEET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // AAPP CFs answer fast; don't let a hiccup hang the wizard.
    signal: AbortSignal.timeout(15000),
  })
  const json = await res.json().catch(() => null)
  if (!json || typeof json !== 'object') return { ok: false, error: `bad response (${res.status})` }
  return json
}

/** Look up a measure link by token. Never throws. */
export async function getMeasureLink(token: string): Promise<MeasureLinkInfo> {
  try {
    return await callBridge({ op: 'get', token })
  } catch (e) {
    console.error('[aappMeasureBridge] get failed:', e)
    return { ok: false, error: 'unreachable' }
  }
}

/** Submit the sheet back to AAPP. Never throws. */
export async function submitMeasureSheet(
  token: string,
  contact: MeasureSubmitContact,
  windows: unknown[],
  language: 'en' | 'zh'
): Promise<{ ok: boolean; windows?: number; resubmit?: boolean; error?: string }> {
  try {
    return await callBridge({ op: 'submit', token, contact, windows, language })
  } catch (e) {
    console.error('[aappMeasureBridge] submit failed:', e)
    return { ok: false, error: 'unreachable' }
  }
}
