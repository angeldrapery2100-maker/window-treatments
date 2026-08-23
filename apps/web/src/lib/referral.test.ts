import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getReferralFromRequest, isValidReferralToken, TOKEN_RE,
  fetchReferralPortal, lookupReferral, uploadPartnerW9, _clearReferralCache,
  REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE,
  CAMPAIGN_SLUG_RE, ensureCampaignReferralToken,
} from './referral'
import { MOCK_CUSTOMER_TOKEN, MOCK_AGENT_TOKEN, MOCK_CAMPAIGN_TOKEN } from './referral.mock'
import fixtures from './referral-wire-fixtures.json'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const req = (cookie: string) => new Request('https://angel-drapery.com/', { headers: { cookie } })

describe('isValidReferralToken', () => {
  it('accepts URL-safe tokens of 16–32 chars', () => {
    expect(isValidReferralToken('abcdefghijklmnop')).toBe(true)
    expect(isValidReferralToken('A-b_c0123456789012345678901234')).toBe(true)
  })
  it('rejects short, long and non-URL-safe tokens', () => {
    expect(isValidReferralToken('short')).toBe(false)
    expect(isValidReferralToken('x'.repeat(33))).toBe(false)
    expect(isValidReferralToken('has spaces here!')).toBe(false)
    expect(isValidReferralToken('semi;colon;token;')).toBe(false)
    expect(isValidReferralToken(null)).toBe(false)
  })
  it('accepts every mock fixture token (they must be usable end to end)', () => {
    for (const t of [MOCK_CUSTOMER_TOKEN, MOCK_AGENT_TOKEN, MOCK_CAMPAIGN_TOKEN]) {
      expect(TOKEN_RE.test(t)).toBe(true)
    }
  })
})

describe('getReferralFromRequest', () => {
  it('reads a valid ad_ref cookie', () => {
    expect(getReferralFromRequest(req(`ad_ref=${MOCK_CUSTOMER_TOKEN}`))).toBe(MOCK_CUSTOMER_TOKEN)
  })
  it('returns null when there is no cookie at all', () => {
    expect(getReferralFromRequest(new Request('https://angel-drapery.com/'))).toBeNull()
  })
  it('rejects a malformed value instead of passing it through', () => {
    expect(getReferralFromRequest(req('ad_ref=nope'))).toBeNull()
    expect(getReferralFromRequest(req('ad_ref=' + 'x'.repeat(40)))).toBeNull()
    // An injected value must not become a token just because it starts well.
    expect(getReferralFromRequest(req('ad_ref=abcdefghijklmnop$evil'))).toBeNull()
    expect(getReferralFromRequest(req('ad_ref='))).toBeNull()
  })
  it('coexists with ad_campaign and ad_anon in any order', () => {
    const cookie = `ad_anon=abc123; ad_campaign=fall-eddm; ad_ref=${MOCK_AGENT_TOKEN}`
    expect(getReferralFromRequest(req(cookie))).toBe(MOCK_AGENT_TOKEN)
    const reversed = `ad_ref=${MOCK_AGENT_TOKEN}; ad_campaign=fall-eddm`
    expect(getReferralFromRequest(req(reversed))).toBe(MOCK_AGENT_TOKEN)
  })
  it('does not match a cookie whose name merely ends in ad_ref', () => {
    expect(getReferralFromRequest(req(`not_ad_ref=${MOCK_CUSTOMER_TOKEN}`))).toBeNull()
  })
})

describe('fetchReferralPortal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    _clearReferralCache()
  })

  const stub = (payload: Record<string, unknown>) =>
    vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => payload }) as any)

  it('returns null for a deactivated referrer — a forwarded portal link must go dead', async () => {
    stub({ ok: true, type: 'customer', displayName: 'Jenny L.', active: false })
    expect(await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)).toBeNull()
  })

  it('returns the portal for an active referrer', async () => {
    stub({ ok: true, type: 'customer', displayName: 'Jenny L.', discountPct: 5, active: true })
    const portal = await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)
    expect(portal?.type).toBe('customer')
    expect(portal?.discountPct).toBe(5)
    // shareUrl is synthesised when the backend omits it.
    expect(portal?.shareUrl).toContain(`/r/${MOCK_CUSTOMER_TOKEN}`)
  })

  it('never calls the backend with a malformed token', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    expect(await fetchReferralPortal('nope')).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

// ───────────────────────────────────────────────────────────────────────────
// AAPP P0 线格式(契约 §0.2 / §3.3)
//
// 下面的 payload 是 AAPP 真正发出来的样子,不是本仓库的 PortalView。两个仓库
// 并行开发,字段名一改页面不会报错、只会安静地渲染成 0 和空白;上面那组 mock
// 测试也发现不了,因为 mock 走内部形状,根本不过 toPublic / toPortal 翻译层。
// 这一组就是那道缺失的防线 —— 改动任何一边都必须让它继续绿。
// ───────────────────────────────────────────────────────────────────────────
describe('middleware 与 lib 的常量同步', () => {
  // middleware 跑在 edge runtime,不能 import lib/referral(那里有动态
  // import('@/lib/referral.mock'),会被打进 edge bundle),所以这两个常量是
  // 抄过去的。抄过去的东西没人盯着就会漂,而漂了的后果是 cookie 名对不上、
  // 或者正则放行了脏 token —— 页面照常渲染,归因静默失效,没有任何报错。
  const mw = readFileSync(join(__dirname, '..', 'middleware.ts'), 'utf8')

  it('★ cookie 名一致', () => {
    expect(REFERRAL_COOKIE).toBe('ad_ref')
    expect(mw).toContain("const REFERRAL_COOKIE = 'ad_ref'")
  })

  it('★ token 正则一致', () => {
    expect(mw).toContain('const REFERRAL_TOKEN_RE = ' + String(TOKEN_RE))
  })

  it('cookie 有效期一致(90 天)', () => {
    expect(REFERRAL_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 90)
    expect(mw).toContain('const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 90')
  })

  it('★ matcher 覆盖 /r/:token —— 不在 matcher 里 middleware 根本不会跑', () => {
    expect(mw).toContain("'/r/:token'")
  })

  it('★ /r 分支在 JWT_SECRET 拒绝分支之前 return', () => {
    // 顺序反了的话,没配 JWT_SECRET 的环境会把落地页也一起 500 掉 ——
    // 而落地页跟登录八竿子打不着。
    const iBranch = mw.indexOf("pathname.startsWith('/r/')")
    const iJwt = mw.indexOf('const JWT_SECRET = getJwtSecret()', mw.indexOf('export async function middleware'))
    expect(iBranch).toBeGreaterThan(0)
    expect(iJwt).toBeGreaterThan(0)
    expect(iBranch).toBeLessThan(iJwt)
  })

  it('cookie 是 httpOnly —— 前端 JS 读不到,也就伪造不了', () => {
    expect(mw).toContain('httpOnly: true')
  })
})

describe('mock 路径也走翻译层', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    _clearReferralCache()
  })

  it('★ AAPP_REFERRAL_MOCK=1 时输出与线上同形状', async () => {
    // mock 以前存的是内部形状,等于绕开 toPublic / toPortal —— 那正是
    // 2026-08-22 五处字段名对不上的藏身之处。现在 mock 存线格式,必须过翻译层。
    vi.stubEnv('AAPP_REFERRAL_MOCK', '1')
    const p = await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)
    expect(p?.referralCode).toBe('ANG-LIL-4823')
    expect(p?.tierKey).toBe('silver')
    expect(p?.nextTier?.min).toBe(3)
    expect(p?.tiers?.map((t) => t.discountPct)).toEqual([4.8, 6.8, 7.8, 8.8, 10])
  })

  it('mock 的 lookup 同样过 toPublic', async () => {
    vi.stubEnv('AAPP_REFERRAL_MOCK', '1')
    const pub = await lookupReferral(MOCK_CUSTOMER_TOKEN)
    expect(pub?.displayName).toBe('Lily')
    expect(pub?.discountPct).toBe(6.8)
  })

  it('mock 里的活动卡片没有奖励页', async () => {
    vi.stubEnv('AAPP_REFERRAL_MOCK', '1')
    expect(await fetchReferralPortal(MOCK_CAMPAIGN_TOKEN)).toBeNull()
  })
})

describe('AAPP wire format', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    _clearReferralCache()
  })

  const stub = (payload: Record<string, unknown>) =>
    vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => payload }) as any)

  /* ★ 这些 payload **不是手写的** —— 直接读 AAPP 生成的 fixture。
     手写 payload 会和线上慢慢漂开而没人发现;fixture 由 AAPP 那边的
     referral-core 真实代码生成并接进它的 npm test,契约一变那边先红,同步过来
     这边跟着红。这就是 2026-08-22 缺的那道防线。同步方式见 fixture 的 _note。 */
  const LOOKUP_WIRE = fixtures.lookup.customer as any
  const PORTAL_CUSTOMER_WIRE = fixtures.portal.customer as any
  const PORTAL_PARTNER_WIRE = fixtures.portal.agent as any

  it('★ fixture 的等级阶梯就是 AAPP 的 LOY_TIERS(4.8 / 6.8 / 7.8 / 8.8 / 10)', () => {
    // 以前 mock 里写的是 3/5/8/10/12,凭空捏的 —— 没有任何一个测试见过真阶梯。
    expect(PORTAL_CUSTOMER_WIRE.tiers.map((t: any) => t.pct)).toEqual([4.8, 6.8, 7.8, 8.8, 10])
    expect(PORTAL_CUSTOMER_WIRE.tiers.map((t: any) => t.min)).toEqual([0, 1, 3, 6, 10])
    expect(PORTAL_CUSTOMER_WIRE.tiers.map((t: any) => t.tier))
      .toEqual(['member', 'silver', 'gold', 'platinum', 'diamond'])
  })

  it('fixture 的 customer 折扣是券实值 6.8,不是取整值', () => {
    expect(LOOKUP_WIRE.public.discountPct).toBe(6.8)
  })

  it('★ lookup reads the {ok, public:{…}} envelope — the whole attribution chain hangs on it', async () => {
    // 读错信封 → lookupReferral 返回 null → /api/referral/claim 404 →
    // ad_ref cookie 永远种不下去 → 表单、AI 对话、线索全部不带归因。
    stub(LOOKUP_WIRE)
    const pub = await lookupReferral(MOCK_CUSTOMER_TOKEN)
    expect(pub).not.toBeNull()
    expect(pub?.referrerType).toBe('customer')
    expect(pub?.displayName).toBe('Lily')
    expect(pub?.referralCode).toBe('ANG-LIL-4823')
  })

  it('keeps the real discount, not a rounded one', async () => {
    // 4.8 / 6.8 / 7.8 / 8.8 是真实的等级折扣。取整会让落地页写 "7% off"
    // 而优惠码只有 6.8% —— 而且 /rewards 显示的是未取整值,两页互相打脸。
    stub(LOOKUP_WIRE)
    expect((await lookupReferral(MOCK_CUSTOMER_TOKEN))?.discountPct).toBe(6.8)
  })

  it('maps the customer portal: code→referralCode, tier→tierKey, tiers[].pct→discountPct', async () => {
    stub(PORTAL_CUSTOMER_WIRE)
    const p = await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)
    expect(p?.referralCode).toBe('ANG-LIL-4823')   // 奖励页那张大字优惠码卡片
    expect(p?.tierKey).toBe('silver')              // 当前等级高亮 + 进度条颜色
    expect(p?.tiers?.map((t) => t.key)).toEqual(['member', 'silver', 'gold', 'platinum', 'diamond'])
    expect(p?.tiers?.[1].discountPct).toBe(6.8)
    expect(p?.qualifiedReferrals).toBe(1)
    expect(p?.freeVisitCredits).toBe(1)
  })

  it('★ nextTier.min is the ABSOLUTE threshold, not the remaining count', async () => {
    // AAPP 发的是 needed(还差 2 单);RewardsClient 却拿 min 当绝对门槛用,
    // 显示 "1 / 3" 并按 qualified/min 算进度条。直接映射会显示 "1 / 2"、
    // 进度条 50% —— 数字看着合理,但全是错的,而且没人会报错。
    stub(PORTAL_CUSTOMER_WIRE)
    const p = await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)
    expect(p?.nextTier?.key).toBe('gold')
    expect(p?.nextTier?.min).toBe(3)
    expect(p?.nextTier?.discountPct).toBe(7.8)
    // RewardsClient 就是这么算 needed 的,必须还原成 AAPP 发的 2。
    const qualified = p?.qualifiedReferrals ?? 0
    expect(Math.max(0, (p?.nextTier?.min ?? 0) - qualified)).toBe(2)
  })

  it('falls back to needed + qualified when the ladder is missing', async () => {
    stub({ ...PORTAL_CUSTOMER_WIRE, tiers: [] })
    const p = await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)
    expect(p?.nextTier?.min).toBe(3)               // 1 已完成 + 还差 2
  })

  it('maps the partner portal: flat referredLeads/signed → stats', async () => {
    stub(PORTAL_PARTNER_WIRE)
    const p = await fetchReferralPortal(MOCK_AGENT_TOKEN)
    expect(p?.type).toBe('agent')
    expect(p?.referralCode).toBe('AP-LIN-2210')
    expect(p?.stats).toEqual({ referredLeads: 4, signed: 1 })   // 合作方页那两个大数字
    expect(p?.w9).toEqual({ uploaded: true, verified: false })
  })

  it('portal carries no PII and no money — AAPP asserts this too', async () => {
    stub(PORTAL_CUSTOMER_WIRE)
    const p = await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)
    const flat = JSON.stringify(p)
    for (const k of ['phone', 'email', 'address', 'ownerUid', 'commission', 'amount']) {
      expect(flat.toLowerCase()).not.toContain(k.toLowerCase())
    }
  })

  it('★ W-9 goes to referralPartnerW9Upload with a fileBase64 field', async () => {
    // 端点名或字段名错一个字,合作方就永远传不上税表,而 W-9 没核验就发不了佣金。
    let seenUrl = '', seenBody: any = null
    vi.stubGlobal('fetch', async (url: string, init: any) => {
      seenUrl = String(url)
      seenBody = JSON.parse(init.body)
      return { ok: true, json: async () => ({ ok: true }) } as any
    })
    const r = await uploadPartnerW9(MOCK_AGENT_TOKEN, 'JVBERi0xLjQK', 'application/pdf')
    expect(r.ok).toBe(true)
    expect(seenUrl).toContain('/referralPartnerW9Upload')
    expect(seenBody).toMatchObject({ token: MOCK_AGENT_TOKEN, fileBase64: 'JVBERi0xLjQK', mime: 'application/pdf' })
    expect(seenBody.file).toBeUndefined()
  })

  it('a revoked link is not found — AAPP answers ok:false, not a 404', async () => {
    stub({ ok: false, error: 'not_found' })
    expect(await fetchReferralPortal(MOCK_CUSTOMER_TOKEN)).toBeNull()
    _clearReferralCache()
    stub({ ok: false, error: 'not_found' })
    expect(await lookupReferral(MOCK_CUSTOMER_TOKEN)).toBeNull()
  })
})

// ── P2 §4.2 一键建 campaign 推广链接 ────────────────────────────────────────
describe('ensureCampaignReferralToken (P2 §4.2)', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

  const withSecret = () => { vi.stubEnv('AAPP_WEBINTAKE_SECRET', 's3cret'); vi.stubEnv('AAPP_REFERRAL_MOCK', '') }

  it('★ slug 规则与 campaigns.ts 一字不差', () => {
    // 同一条规则抄了三份(这里 / campaigns.ts / AAPP referral-core.js)。
    // 不一致时两边的测试都会是绿的,而人会看到「网站建得出、AAPP 建不出」。
    const src = readFileSync(join(__dirname, 'campaigns.ts'), 'utf8')
    const m = src.match(/export const SLUG_RE = (\/\^\[a-z0-9\][^\/]*\/)/)
    expect(m).not.toBeNull()
    expect(m![1]).toBe(String(CAMPAIGN_SLUG_RE))
  })

  it('rejects a bad slug without touching the network', async () => {
    withSecret()
    let called = 0
    vi.stubGlobal('fetch', async () => { called++; return { ok: true, json: async () => ({ ok: true }) } as any })
    for (const bad of ['Aug Postcard', '-aug', 'a', '', 'aug/postcard', 'x'.repeat(80)]) {
      expect((await ensureCampaignReferralToken(bad)).error).toBe('bad_slug')
    }
    expect(called).toBe(0)
  })

  it('★ refuses to call AAPP when the shared secret is missing', async () => {
    // websiteInquiry 在 secret 缺失时是放行的(公开表单不能因为忘配就全挂),
    // 这个端点相反 —— 它能凭空造出一条归因通道,配不上就别发。
    vi.stubEnv('AAPP_WEBINTAKE_SECRET', '')
    vi.stubEnv('AAPP_REFERRAL_MOCK', '')
    let called = 0
    vi.stubGlobal('fetch', async () => { called++; return { ok: true, json: async () => ({ ok: true }) } as any })
    expect((await ensureCampaignReferralToken('aug-postcard')).error).toBe('not_configured')
    expect(called).toBe(0)
  })

  it('posts slug + name to referralCampaignEnsure with x-ad-key', async () => {
    withSecret()
    let url = '', body: any = null, headers: any = null
    vi.stubGlobal('fetch', async (u: string, init: any) => {
      url = String(u); body = JSON.parse(init.body); headers = init.headers
      return { ok: true, json: async () => ({ ok: true, token: 'CAMPtoken0123456789ab', url: 'https://angel-drapery.com/r/CAMPtoken0123456789ab', reused: false }) } as any
    })
    const r = await ensureCampaignReferralToken('aug-postcard', 'Aug Postcard')
    expect(url).toContain('/referralCampaignEnsure')
    expect(body).toEqual({ slug: 'aug-postcard', name: 'Aug Postcard' })
    expect(headers['x-ad-key']).toBe('s3cret')
    expect(r).toMatchObject({ ok: true, token: 'CAMPtoken0123456789ab', reused: false })
  })

  it('lowercases the slug it sends (the CF compares lowercase)', async () => {
    withSecret()
    let body: any = null
    vi.stubGlobal('fetch', async (_u: string, init: any) => {
      body = JSON.parse(init.body)
      return { ok: true, json: async () => ({ ok: true, token: 'CAMPtoken0123456789ab' }) } as any
    })
    await ensureCampaignReferralToken('AUG-Postcard')
    expect(body.slug).toBe('aug-postcard')
  })

  it('falls back to the slug when no name is given', async () => {
    withSecret()
    let body: any = null
    vi.stubGlobal('fetch', async (_u: string, init: any) => {
      body = JSON.parse(init.body)
      return { ok: true, json: async () => ({ ok: true, token: 'CAMPtoken0123456789ab' }) } as any
    })
    await ensureCampaignReferralToken('aug-postcard')
    expect(body.name).toBe('aug-postcard')
  })

  it('surfaces the AAPP error instead of inventing a token', async () => {
    withSecret()
    vi.stubGlobal('fetch', async () => ({ ok: false, json: async () => ({ ok: false, error: 'bad key' }) } as any))
    expect(await ensureCampaignReferralToken('aug-postcard')).toEqual({ ok: false, error: 'bad key' })
  })

  it('★ a malformed token from AAPP is rejected, not stored', async () => {
    // 存进 campaigns.referral_token 的东西不信任何上游 —— 形状不对的 token
    // 会让 /c/<slug> 每次都种一个种不进去的 cookie,归因悄悄全丢。
    withSecret()
    vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => ({ ok: true, token: 'short' }) } as any))
    expect(await ensureCampaignReferralToken('aug-postcard')).toEqual({ ok: false, error: 'bad_token' })
  })

  it('network failure is an error, never a silent success', async () => {
    withSecret()
    vi.stubGlobal('fetch', async () => { throw new Error('boom') })
    const r = await ensureCampaignReferralToken('aug-postcard')
    expect(r.ok).toBe(false)
    expect(r.token).toBeUndefined()
  })

  it('mock mode is idempotent (the UI must not flip the token on every click)', async () => {
    vi.stubEnv('AAPP_REFERRAL_MOCK', '1')
    const a = await ensureCampaignReferralToken('aug-postcard')
    const b = await ensureCampaignReferralToken('aug-postcard')
    expect(a.ok).toBe(true)
    expect(a.token).toBe(b.token)
    expect(isValidReferralToken(a.token)).toBe(true)
  })
})
