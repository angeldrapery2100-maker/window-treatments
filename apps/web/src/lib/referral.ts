// Referral platform bridge (推广系统 P1).
//
// One opaque token identifies a referrer — a happy customer, a partner
// (realtor / designer / contractor), a company account, or a print campaign.
// The token travels in the URL (/r/<token>), is stored in the `ad_ref` cookie
// for 90 days, and rides along with every lead the visitor later creates.
//
// SECURITY MODEL: the server NEVER trusts a token supplied in a request body
// — attribution is read from the cookie only (getReferralFromRequest). The
// token is opaque and grants no account access: /rewards and /partner render
// only what the AAPP portal endpoint returns for that token, and neither page
// is indexable.
//
// The five endpoints live in AAPP (P0). Until they are deployed, set
// AAPP_REFERRAL_MOCK=1 to serve `referral.mock.ts` fixtures locally.

export const REFERRAL_COOKIE = 'ad_ref'
/** 90 days — same consideration window as the campaign cookie. */
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 90

/** Opaque referral token: URL-safe, 16–32 chars. */
export const TOKEN_RE = /^[A-Za-z0-9_-]{16,32}$/

export type ReferrerType = 'customer' | 'agent' | 'designer' | 'contractor' | 'company' | 'campaign'

/** Partner-ish referrer types get partner pricing, never a visible percentage. */
export const PARTNER_TYPES: ReferrerType[] = ['agent', 'designer', 'contractor']

/** Public (non-PII) view of a referrer — safe to render on a landing page. */
export interface ReferralPublic {
  referrerType: ReferrerType
  displayName: string
  discountPct: number | null
  tierLabel?: string
  tierLabelCn?: string
  referralCode?: string | null
  active: boolean
}

export interface PortalTier {
  key: string
  label: string
  labelCn?: string
  /** Qualified referrals needed to reach this level. */
  min: number
  discountPct: number
  color?: string
}

/** Everything /rewards/<token> and /partner/<token> render. Shape mirrors the
 *  AAPP `referralPortal` response (P0 §0). Optional fields are absent for
 *  referrer types that do not have them (a partner has no tier ladder). */
export interface PortalView {
  token: string
  type: ReferrerType
  displayName: string
  lang?: 'en' | 'zh'
  referralCode?: string | null
  shareUrl: string
  discountPct: number | null
  freeVisitCredits?: number
  qualifiedReferrals?: number
  tierKey?: string
  tierLabel?: string
  tierLabelCn?: string
  nextTier?: PortalTier | null
  tiers?: PortalTier[]
  smsOptIn?: boolean
  /** True when the referrer texted STOP — the toggle must stay disabled. */
  smsOptedOut?: boolean
  stats?: { referredLeads: number; signed: number }
  w9?: { uploaded: boolean; verified: boolean }
  active: boolean
}

const BASE = () =>
  (process.env.AAPP_REFERRAL_BASE || 'https://us-central1-angel-drapery.cloudfunctions.net').replace(/\/$/, '')

const MOCK = () => process.env.AAPP_REFERRAL_MOCK === '1'

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { ...(extra || {}) }
  const secret = process.env.AAPP_WEBINTAKE_SECRET
  if (secret) h['x-ad-key'] = secret
  return h
}

export function isValidReferralToken(v: unknown): boolean {
  return TOKEN_RE.test(String(v ?? ''))
}

/**
 * Read the referral token from the request cookie. Mirrors
 * campaigns.getCampaignFromRequest — a hand-rolled match so it works in route
 * handlers, server components and tests alike, with no framework dependency.
 * Returns null unless the value matches TOKEN_RE exactly.
 */
export function getReferralFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|;\s*)ad_ref=([^;\s]*)/)
  if (!match) return null
  const raw = match[1]
  return TOKEN_RE.test(raw) ? raw : null
}

// ── lookup, with a 60s in-memory LRU ────────────────────────────────────────
// A shared referral link can be opened by dozens of people in a burst (a
// WeChat group, an email blast). One backend round-trip per minute per token
// is plenty — the payload is a display name and a percentage.

const LOOKUP_TTL_MS = 60_000
const LOOKUP_MAX = 200
const _lookupCache = new Map<string, { at: number; value: ReferralPublic | null }>()

function cacheGet(token: string): { value: ReferralPublic | null } | null {
  const hit = _lookupCache.get(token)
  if (!hit) return null
  if (Date.now() - hit.at > LOOKUP_TTL_MS) {
    _lookupCache.delete(token)
    return null
  }
  // Refresh recency (Map preserves insertion order → cheap LRU).
  _lookupCache.delete(token)
  _lookupCache.set(token, hit)
  return { value: hit.value }
}

function cacheSet(token: string, value: ReferralPublic | null): void {
  _lookupCache.set(token, { at: Date.now(), value })
  while (_lookupCache.size > LOOKUP_MAX) {
    const oldest = _lookupCache.keys().next().value
    if (oldest === undefined) break
    _lookupCache.delete(oldest)
  }
}

/** Test seam — drop the LRU (used by unit tests). */
export function _clearReferralCache(): void {
  _lookupCache.clear()
}

function normalizeType(v: unknown): ReferrerType | null {
  const s = String(v ?? '').trim().toLowerCase()
  return (['customer', 'agent', 'designer', 'contractor', 'company', 'campaign'] as string[]).includes(s)
    ? (s as ReferrerType)
    : null
}

function toPublic(data: any): ReferralPublic | null {
  const type = normalizeType(data?.referrerType ?? data?.type)
  if (!type) return null
  if (data?.active === false) return null
  const pct = Number(data?.discountPct)
  return {
    referrerType: type,
    displayName: String(data?.displayName ?? '').trim().slice(0, 80) || 'A friend',
    discountPct: Number.isFinite(pct) && pct > 0 ? Math.round(pct) : null,
    tierLabel: data?.tierLabel ? String(data.tierLabel).slice(0, 40) : undefined,
    tierLabelCn: data?.tierLabelCn ? String(data.tierLabelCn).slice(0, 40) : undefined,
    referralCode: data?.referralCode ? String(data.referralCode).slice(0, 40) : null,
    active: true,
  }
}

/**
 * Resolve a token to its public referrer view. Never throws; an unknown,
 * expired or disabled token returns null (the landing page then redirects
 * home rather than showing an error).
 */
export async function lookupReferral(token: string): Promise<ReferralPublic | null> {
  if (!isValidReferralToken(token)) return null
  const cached = cacheGet(token)
  if (cached) return cached.value

  if (MOCK()) {
    const { MOCK_LOOKUP } = await import('@/lib/referral.mock')
    const value = MOCK_LOOKUP[token] ?? null
    cacheSet(token, value)
    return value
  }

  let value: ReferralPublic | null = null
  try {
    const res = await fetch(`${BASE()}/referralLookup?t=${encodeURIComponent(token)}`, {
      headers: authHeaders(),
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    })
    if (res.ok) {
      const data = (await res.json().catch(() => null)) as any
      if (data?.ok !== false) value = toPublic(data?.referral ?? data)
    } else {
      console.warn(`[referral] lookup ${res.status}`)
    }
  } catch (e: any) {
    console.warn('[referral] lookup failed:', e?.message || e)
  }
  cacheSet(token, value)
  return value
}

/**
 * Record a landing-page hit. Fire-and-forget: the visitor's page must never
 * wait on it, and a backend hiccup must never break the render.
 */
export async function recordReferralVisit(token: string, page: string, ua: string): Promise<void> {
  if (!isValidReferralToken(token)) return
  if (MOCK()) return
  try {
    await fetch(`${BASE()}/referralVisit`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ token, page: String(page || '').slice(0, 120), ua: String(ua || '').slice(0, 200) }),
      signal: AbortSignal.timeout(5_000),
    })
  } catch {
    /* fire-and-forget */
  }
}

function toPortal(token: string, data: any): PortalView | null {
  const type = normalizeType(data?.type ?? data?.referrerType)
  if (!type) return null
  // A revoked referrer loses the portal too, not just the landing page: the
  // /rewards and /partner links are permanent and get forwarded around, so
  // "inactive" has to mean the dashboard stops rendering as well.
  if (data?.active === false) return null
  const num = (v: unknown): number | undefined => {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const tier = (t: any): PortalTier | null => {
    if (!t || typeof t !== 'object') return null
    return {
      key: String(t.key ?? '').slice(0, 32),
      label: String(t.label ?? '').slice(0, 40),
      labelCn: t.labelCn ? String(t.labelCn).slice(0, 40) : undefined,
      min: num(t.min) ?? 0,
      discountPct: num(t.discountPct) ?? 0,
      color: typeof t.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(t.color) ? t.color : undefined,
    }
  }
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://angel-drapery.com').replace(/\/$/, '')
  return {
    token,
    type,
    displayName: String(data?.displayName ?? '').trim().slice(0, 80) || 'there',
    lang: data?.lang === 'zh' ? 'zh' : 'en',
    referralCode: data?.referralCode ? String(data.referralCode).slice(0, 40) : null,
    shareUrl:
      typeof data?.shareUrl === 'string' && data.shareUrl.startsWith('http')
        ? data.shareUrl
        : `${site}/r/${token}`,
    discountPct: num(data?.discountPct) ?? null,
    freeVisitCredits: num(data?.freeVisitCredits),
    qualifiedReferrals: num(data?.qualifiedReferrals),
    tierKey: data?.tierKey ? String(data.tierKey).slice(0, 32) : undefined,
    tierLabel: data?.tierLabel ? String(data.tierLabel).slice(0, 40) : undefined,
    tierLabelCn: data?.tierLabelCn ? String(data.tierLabelCn).slice(0, 40) : undefined,
    nextTier: tier(data?.nextTier),
    tiers: Array.isArray(data?.tiers) ? (data.tiers.map(tier).filter(Boolean) as PortalTier[]) : [],
    smsOptIn: data?.smsOptIn === true,
    smsOptedOut: data?.smsOptedOut === true,
    stats: data?.stats
      ? { referredLeads: num(data.stats.referredLeads) ?? 0, signed: num(data.stats.signed) ?? 0 }
      : undefined,
    w9: data?.w9 ? { uploaded: data.w9.uploaded === true, verified: data.w9.verified === true } : undefined,
    active: data?.active !== false,
  }
}

/** Full portal view for /rewards and /partner. Never cached — it shows live
 *  progress and preference state. */
export async function fetchReferralPortal(token: string): Promise<PortalView | null> {
  if (!isValidReferralToken(token)) return null
  if (MOCK()) {
    const { MOCK_PORTAL } = await import('@/lib/referral.mock')
    return MOCK_PORTAL[token] ?? null
  }
  try {
    const res = await fetch(`${BASE()}/referralPortal?t=${encodeURIComponent(token)}`, {
      headers: authHeaders(),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) {
      console.warn(`[referral] portal ${res.status}`)
      return null
    }
    const data = (await res.json().catch(() => null)) as any
    if (!data || data.ok === false) return null
    return toPortal(token, data.portal ?? data)
  } catch (e: any) {
    console.warn('[referral] portal failed:', e?.message || e)
    return null
  }
}

/** Toggle "notify me about my rewards" (SMS). Returns the stored value so the
 *  UI can reconcile — a STOP on the carrier side wins over the toggle. */
export async function setReferralPortalPrefs(
  token: string,
  smsOptIn: boolean
): Promise<{ ok: boolean; smsOptIn?: boolean; error?: string }> {
  if (!isValidReferralToken(token)) return { ok: false, error: 'bad_token' }
  if (MOCK()) return { ok: true, smsOptIn }
  try {
    const res = await fetch(`${BASE()}/referralPortalPrefs`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ token, smsOptIn: smsOptIn === true }),
      signal: AbortSignal.timeout(8_000),
    })
    const data = (await res.json().catch(() => null)) as any
    if (!res.ok || !data || data.ok !== true) {
      return { ok: false, error: String(data?.error || `http_${res.status}`) }
    }
    return { ok: true, smsOptIn: data.smsOptIn === true }
  } catch (e: any) {
    return { ok: false, error: e?.name === 'TimeoutError' ? 'timeout' : 'request_failed' }
  }
}

/** Max W-9 upload size (8MB) — matched on the client before the base64 hop. */
export const W9_MAX_BYTES = 8 * 1024 * 1024
export const W9_MIME = ['application/pdf', 'image/jpeg', 'image/png']

/** Upload a partner's W-9. The file never touches our disk — it is relayed
 *  straight to AAPP, which stores it against the partner record. */
export async function uploadPartnerW9(
  token: string,
  fileBase64: string,
  mime: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isValidReferralToken(token)) return { ok: false, error: 'bad_token' }
  if (!W9_MIME.includes(mime)) return { ok: false, error: 'bad_type' }
  // base64 inflates by 4/3 — check the decoded size.
  if (!fileBase64 || (fileBase64.length * 3) / 4 > W9_MAX_BYTES) return { ok: false, error: 'too_large' }
  if (MOCK()) return { ok: true }
  try {
    const res = await fetch(`${BASE()}/partnerW9Upload`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ token, file: fileBase64, mime }),
      signal: AbortSignal.timeout(30_000),
    })
    const data = (await res.json().catch(() => null)) as any
    if (!res.ok || !data || data.ok !== true) {
      return { ok: false, error: String(data?.error || `http_${res.status}`) }
    }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.name === 'TimeoutError' ? 'timeout' : 'request_failed' }
  }
}
