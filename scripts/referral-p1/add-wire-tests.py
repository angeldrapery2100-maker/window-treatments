#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""apps/web/src/lib/referral.test.ts — 锁死 AAPP P0 的**线格式**。

这一组用的是 AAPP 真实返回的 payload(契约 §0.2 / §3.3 的原文示例),不是
本仓库内部的 PortalView 形状。之所以要单独锁:P0 和 P1 是两个仓库并行开发的,
字段名一改,页面不会报错,只会安静地渲染成 0 / 空白 —— mock 测试永远发现不了,
因为 mock 走的是内部形状,根本不过 toPublic / toPortal 这两个翻译层。
用法: python3 add-wire-tests.py --src <repo> --out <repo> [--dry]
"""
import argparse, io, os, sys

REL = os.path.join('apps', 'web', 'src', 'lib', 'referral.test.ts')

IMP_OLD = """import {
  getReferralFromRequest, isValidReferralToken, TOKEN_RE,
  fetchReferralPortal, _clearReferralCache,
} from './referral'"""
IMP_NEW = """import {
  getReferralFromRequest, isValidReferralToken, TOKEN_RE,
  fetchReferralPortal, lookupReferral, uploadPartnerW9, _clearReferralCache,
} from './referral'"""

TAIL_OLD = """  it('never calls the backend with a malformed token', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    expect(await fetchReferralPortal('nope')).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})"""

TAIL_NEW = """  it('never calls the backend with a malformed token', async () => {
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
describe('AAPP wire format', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    _clearReferralCache()
  })

  const stub = (payload: Record<string, unknown>) =>
    vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => payload }) as any)

  // referralLookup → { ok, public: <referralPublic doc> }
  const LOOKUP_WIRE = {
    ok: true,
    public: {
      referrerType: 'customer',
      displayName: 'Lily',
      discountPct: 6.8,
      tierLabel: 'VIP Silver',
      tierLabelCn: 'VIP 银卡',
      referralCode: 'ANG-LIL-4823',
      active: true,
      _updatedAt: '2026-08-22T00:00:00.000Z',
    },
  }

  // referralPortal(customer)— 顶层平铺,键名是 code / tier / nextTier.needed /
  // tiers[].pct,和本仓库的 referralCode / tierKey / min / discountPct 都不同名。
  const PORTAL_CUSTOMER_WIRE = {
    ok: true,
    type: 'customer',
    displayName: 'Lily',
    code: 'ANG-LIL-4823',
    shareUrl: `https://angel-drapery.com/r/${MOCK_CUSTOMER_TOKEN}`,
    tier: 'silver',
    tierLabel: 'VIP Silver',
    tierLabelCn: 'VIP 银卡',
    discountPct: 6.8,
    qualifiedReferrals: 1,
    freeVisitCredits: 1,
    nextTier: { tier: 'gold', label: 'VIP Gold', labelCn: 'VIP 金卡', discountPct: 7.8, needed: 2 },
    tiers: [
      { tier: 'member',   label: 'Member',       labelCn: '会员',     min: 0,  pct: 4.8 },
      { tier: 'silver',   label: 'VIP Silver',   labelCn: 'VIP 银卡', min: 1,  pct: 6.8 },
      { tier: 'gold',     label: 'VIP Gold',     labelCn: 'VIP 金卡', min: 3,  pct: 7.8 },
      { tier: 'platinum', label: 'VIP Platinum', labelCn: 'VIP 铂金', min: 6,  pct: 8.8 },
      { tier: 'diamond',  label: 'VIP Diamond',  labelCn: 'VIP 钻石', min: 10, pct: 10 },
    ],
    smsOptIn: false,
    smsOptedOut: false,
    lang: 'en',
  }

  // referralPortal(partner)— referredLeads / signed 摊平在顶层,没有 stats 这层。
  const PORTAL_PARTNER_WIRE = {
    ok: true,
    type: 'agent',
    displayName: 'Linda Chen',
    code: 'AP-LIN-2210',
    shareUrl: `https://angel-drapery.com/r/${MOCK_AGENT_TOKEN}`,
    referredLeads: 4,
    signed: 1,
    w9: { uploaded: true, verified: false },
    lang: 'en',
  }

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
})"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    p = os.path.join(a.src, REL)
    s = io.open(p, encoding='utf-8').read()
    if 'AAPP wire format' in s:
        print('add-wire-tests: already applied'); return 0
    for nm, old in (('import', IMP_OLD), ('tail', TAIL_OLD)):
        n = s.count(old)
        if n != 1:
            print('add-wire-tests: ABORT anchor %s count=%d (want 1)' % (nm, n), file=sys.stderr); return 2
    s = s.replace(IMP_OLD, IMP_NEW).replace(TAIL_OLD, TAIL_NEW)
    if a.dry:
        print('add-wire-tests: dry ok'); return 0
    io.open(os.path.join(a.out, REL), 'w', encoding='utf-8').write(s)
    print('add-wire-tests: wrote %s' % REL); return 0

sys.exit(main())
