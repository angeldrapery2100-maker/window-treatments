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
// The endpoints live in AAPP (P0, deployed 2026-08-22): referralLookup /
// referralVisit / referralPortal / referralPortalPrefs /
// referralPartnerW9Upload. Until they are reachable, set AAPP_REFERRAL_MOCK=1
// to serve `referral.mock.ts` fixtures locally.
//
// ⚠ WIRE SHAPES ARE NOT THIS FILE'S TYPES. AAPP speaks the P0 §0 contract
// (`{ok, public:{...}}`, `code`, `tier`, `nextTier.needed`, `tiers[].pct`,
// flat `referredLeads`/`signed`); `toPublic` / `toPortal` translate. Change a
// name on either side and the page silently renders zeros — keep the `??`
// fallbacks so neither side can break the other alone.

export const REFERRAL_COOKIE = 'ad_ref'
/** 90 days — same consideration window as the campaign cookie. */
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 90

/** Opaque referral token: URL-safe, 16–32 chars. */
export const TOKEN_RE = /^[A-Za-z0-9_-]{16,32}$/

/** Campaign slug — must stay byte-identical to `campaigns.ts` SLUG_RE and to
 *  AAPP's `referral-core.js` CAMPAIGN_SLUG_RE. A test compares the literals:
 *  three copies of one rule is how P1's attribution died with all suites green. */
export const CAMPAIGN_SLUG_RE = /^[a-z0-9][a-z0-9_-]{1,63}$/

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
    // 不要四舍五入:AAPP 的等级折扣是 4.8 / 6.8 / 7.8 / 8.8 / 10。取整会让落地页
    // 写着 "5% off" 而优惠码实际只有 4.8% —— 报的数字和给的数字不一样,而且
    // /rewards 用的是未取整的值,两个页面还会互相打脸。只去掉多余的 .0。
    discountPct: Number.isFinite(pct) && pct > 0 ? Number(pct.toFixed(1)) : null,
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
export type ReferralLookup = {
  ref: ReferralPublic | null
  /** true = AAPP 没有给出明确答案(超时 / 网络 / 5xx)。此时 ref 为 null 但
   *  **不代表链接失效** —— 落地页不能因此把客户踢回主页。 */
  transient: boolean
}

// 整改 #31 真因(2026-09-02 实测):referralLookup 云函数冷启动 4.4~5.6s
// (Cloud Run 启动探针日志),而这里原来的超时是 5s —— 冷启动那一下必超时,
// 返回 null 还被缓存 60s,接下来一分钟内所有访客全部被 redirect('/'),
// 归因看起来就像「链接坏了」。链接本身好好的(referralLinks/referralPublic
// 都 active:true)。所以:超时放宽 + 失败重试一次 + 失败绝不进缓存 + 把
// 「不知道」和「确实没有」分开告诉调用方。
const LOOKUP_TIMEOUT_MS = 10_000

async function fetchLookupOnce(token: string): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${BASE()}/referralLookup?t=${encodeURIComponent(token)}`, {
    headers: authHeaders(),
    cache: 'no-store',
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
  })
  const data = res.ok ? await res.json().catch(() => null) : null
  return { ok: !!res.ok, status: Number(res.status) || 0, data }
}

export async function lookupReferralDetailed(token: string): Promise<ReferralLookup> {
  if (!isValidReferralToken(token)) return { ref: null, transient: false }
  const cached = cacheGet(token)
  if (cached) return { ref: cached.value, transient: false }

  if (MOCK()) {
    // ★ 故意让 mock 也走 toPublic —— 翻译层是最容易和 AAPP 漂开的地方,
    //   绕过它的 mock 等于没测(见 referral.mock.ts 文件头)。
    const { MOCK_LOOKUP_WIRE } = await import('@/lib/referral.mock')
    const wire = MOCK_LOOKUP_WIRE[token] as any
    const value = wire ? toPublic(wire?.public ?? wire) : null
    cacheSet(token, value)
    return { ref: value, transient: false }
  }

  let last: any = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetchLookupOnce(token)
      if (r.ok) {
        const data = r.data
        // 契约 §0.2:referralLookup → { ok:true, public:<referralPublic doc> }。
        // 只读 data.referral 会取到 undefined,退化成读整个信封,而信封上没有
        // referrerType —— 结果 lookupReferral 永远返回 null,ad_ref cookie 永远
        // 种不下去,整条归因链是死的。data.referral / 裸对象保留为兼容分支。
        const value = data?.ok !== false ? toPublic(data?.public ?? data?.referral ?? data) : null
        cacheSet(token, value)                       // 只有明确答案才进缓存
        return { ref: value, transient: false }
      }
      last = `status ${r.status}`
      if (r.status >= 400 && r.status < 500) break   // 4xx 不会因为重试变好
    } catch (e: any) {
      last = e?.message || e
    }
  }
  console.warn('[referral] lookup unavailable (not cached):', last)
  return { ref: null, transient: true }
}

export async function lookupReferral(token: string): Promise<ReferralPublic | null> {
  return (await lookupReferralDetailed(token)).ref
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
  // AAPP 发的是 { tier, label, labelCn, min, pct };本地类型用的是
  // { key, label, labelCn, min, discountPct }。两种都认。
  const tier = (t: any): PortalTier | null => {
    if (!t || typeof t !== 'object') return null
    return {
      key: String(t.key ?? t.tier ?? '').slice(0, 32),
      label: String(t.label ?? '').slice(0, 40),
      labelCn: t.labelCn ? String(t.labelCn).slice(0, 40) : undefined,
      min: num(t.min) ?? 0,
      discountPct: num(t.discountPct) ?? num(t.pct) ?? 0,
      color: typeof t.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(t.color) ? t.color : undefined,
    }
  }
  const ladder: PortalTier[] = Array.isArray(data?.tiers)
    ? (data.tiers.map(tier).filter(Boolean) as PortalTier[])
    : []
  const qualified = num(data?.qualifiedReferrals) ?? 0
  /* ★ nextTier 的 min 是「绝对门槛」—— RewardsClient 拿它显示 "1 / 3" 并算进度条。
     AAPP 发的 nextTier 里没有 min,只有 needed(还差几单),直接映射会显示成
     "1 / 2" 且进度条算错。绝对值优先从 tiers[] 里按 key 查(那里的 min 就是
     绝对门槛),查不到再用 needed + 已完成数还原。 */
  const nextRaw = data?.nextTier
  let next = tier(nextRaw)
  if (next && !(num(nextRaw?.min) != null)) {
    const fromLadder = ladder.find((t) => t.key === next!.key)
    const needed = num(nextRaw?.needed)
    next = { ...next, min: fromLadder ? fromLadder.min : (needed != null ? qualified + needed : 0) }
  }
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://angel-drapery.com').replace(/\/$/, '')
  return {
    token,
    type,
    displayName: String(data?.displayName ?? '').trim().slice(0, 80) || 'there',
    lang: data?.lang === 'zh' ? 'zh' : 'en',
    // AAPP 的字段名是 code(契约 §3.3),不是 referralCode —— 奖励页那张
    // 大字优惠码卡片会整块不显示。(toPublic 那边读 referralCode 是对的:
    // referralPublic 文档的字段名就叫 referralCode,见契约 §0.1。)
    referralCode: (data?.code ?? data?.referralCode)
      ? String(data.code ?? data.referralCode).slice(0, 40)
      : null,
    shareUrl:
      typeof data?.shareUrl === 'string' && data.shareUrl.startsWith('http')
        ? data.shareUrl
        : `${site}/r/${token}`,
    discountPct: num(data?.discountPct) ?? null,
    freeVisitCredits: num(data?.freeVisitCredits),
    qualifiedReferrals: num(data?.qualifiedReferrals),
    // AAPP 发 tier,不是 tierKey。对不上会让当前等级高亮和进度条颜色全灭。
    tierKey: (data?.tier ?? data?.tierKey) ? String(data.tier ?? data.tierKey).slice(0, 32) : undefined,
    tierLabel: data?.tierLabel ? String(data.tierLabel).slice(0, 40) : undefined,
    tierLabelCn: data?.tierLabelCn ? String(data.tierLabelCn).slice(0, 40) : undefined,
    nextTier: next,
    tiers: ladder,
    smsOptIn: data?.smsOptIn === true,
    smsOptedOut: data?.smsOptedOut === true,
    // 合作方页的两个数字:AAPP 把 referredLeads / signed 摊平在顶层(契约 §3.3),
    // 没有 stats 这一层。只读 data.stats 会让两个数字恒为 0。
    stats: data?.stats
      ? { referredLeads: num(data.stats.referredLeads) ?? 0, signed: num(data.stats.signed) ?? 0 }
      : (data?.referredLeads != null || data?.signed != null)
        ? { referredLeads: num(data.referredLeads) ?? 0, signed: num(data.signed) ?? 0 }
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
    const { MOCK_PORTAL_WIRE } = await import('@/lib/referral.mock')
    const wire = MOCK_PORTAL_WIRE[token] as any
    if (!wire || wire.ok === false) return null
    return toPortal(token, wire.portal ?? wire)
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
    // 端点名和字段名都按 AAPP 实际部署的来(任务书 §1.5):
    // referralPartnerW9Upload,body 是 { token, fileBase64, mime }。
    const res = await fetch(`${BASE()}/referralPartnerW9Upload`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ token, fileBase64, mime }),
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

// ── campaign 链接一键生成(P2 §4.2)────────────────────────────────────────
// admin 在 campaigns 页点 Generate → 这里去 AAPP 建一条 campaign 类推广链接,
// 回填 campaigns.referral_token。手填仍然保留(AAPP 那边先建好、这里粘贴)。
//
// ⚠ slug 规则三处必须一致:AAPP referral-core.js CAMPAIGN_SLUG_RE、
//   AAPP app-referral-partners.js 的 UI 校验、本仓库 campaigns.ts SLUG_RE。
//   不一致 = 这边建得出、那边建不出,而两边的测试都会是绿的。
//
// 鉴权比 websiteInquiry 严:那个端点 secret 未配置时放行(公开表单不能因为
// 忘配 secret 就全挂),这个不行 —— 它能凭空造出一条归因通道。secret 缺失时
// AAPP 直接 503,这里也提前拦一次,省一次白跑的网络请求。
export interface EnsureCampaignResult {
  ok: boolean
  token?: string
  url?: string
  reused?: boolean
  error?: string
}

export async function ensureCampaignReferralToken(
  slug: string,
  name?: string
): Promise<EnsureCampaignResult> {
  const clean = String(slug ?? '').trim().toLowerCase()
  if (!CAMPAIGN_SLUG_RE.test(clean)) return { ok: false, error: 'bad_slug' }
  if (MOCK()) {
    // 固定 token —— mock 下重复调用要幂等,否则 UI 每点一次都换一个值。
    const t = `mockcamp${clean.replace(/[^a-z0-9]/g, '')}0000000000000000`.slice(0, 22)
    return { ok: true, token: t, url: `https://angel-drapery.com/r/${t}`, reused: false }
  }
  if (!process.env.AAPP_WEBINTAKE_SECRET) return { ok: false, error: 'not_configured' }
  try {
    const res = await fetch(`${BASE()}/referralCampaignEnsure`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ slug: clean, name: String(name || clean).slice(0, 120) }),
      signal: AbortSignal.timeout(15_000),
    })
    const data = (await res.json().catch(() => null)) as any
    if (!res.ok || !data || data.ok !== true) {
      return { ok: false, error: String(data?.error || `http_${res.status}`) }
    }
    // AAPP 已经校验过 token 形状,这里再验一次 —— 存进 DB 的东西不信任何上游。
    if (!isValidReferralToken(data.token)) return { ok: false, error: 'bad_token' }
    return { ok: true, token: String(data.token), url: String(data.url || ''), reused: data.reused === true }
  } catch (e: any) {
    return { ok: false, error: e?.name === 'TimeoutError' ? 'timeout' : 'request_failed' }
  }
}
