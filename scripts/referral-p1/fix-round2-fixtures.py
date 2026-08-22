#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""补修任务书 B2 —— 网站的 mock 与线格式测试改吃 AAPP 生成的 fixture。

以前 referral.mock.ts 里的等级阶梯是手写的 3/5/8/10/12,而 AAPP 真实的
LOY_TIERS 是 4.8/6.8/7.8/8.8/10 —— 没有任何一个测试见过真正的阶梯。
更要命的是 mock 走的是网站**内部**的 PortalView 形状,根本不经过 toPublic /
toPortal 这两个翻译层:cbdcbd2 那五处字段名对不上,mock 一条都发现不了。

改法:mock 存 AAPP 的**线格式**(和线上返回逐字节一致),再由 lookupReferral /
fetchReferralPortal 走同一套翻译层落到内部形状 —— mock 顺带把翻译层也测了。
用法: python3 fix-round2-fixtures.py --src <repo-root> --out <repo-root> [--dry]
"""
import argparse, io, os, sys

W = 'apps/web/src'
MOCK = W + '/lib/referral.mock.ts'
LIB  = W + '/lib/referral.ts'
TEST = W + '/lib/referral.test.ts'

NEW_MOCK = r'''// AAPP 线格式 fixture 的本地包装(AAPP_REFERRAL_MOCK=1 时用)。
//
// ★ 这里存的是 **AAPP 真正发出来的 payload**,不是本仓库的 PortalView。
//   来源:AAPP 的 functions/referral-wire-fixtures.json,由那边的
//   scripts/referral-wire-fixtures.js 用 referral-core 的真实代码生成,并接进
//   AAPP 的 npm test —— 那边契约一变,那边先红。
//
//   为什么不再手写内部形状:mock 走内部形状就等于绕开 toPublic / toPortal 两个
//   翻译层,而 2026-08-22 那五处字段名对不上恰恰全在翻译层里 —— mock 测试一条
//   都没发现,页面在线上安静地渲染成空白和 0。现在 mock 喂线格式,每次都过翻译层。
//
//   同步方式见 fixture 里的 _note 字段。NEVER set AAPP_REFERRAL_MOCK in production.

import fixtures from '@/lib/referral-wire-fixtures.json'

export const MOCK_CUSTOMER_TOKEN = fixtures.tokens.customer
export const MOCK_AGENT_TOKEN    = fixtures.tokens.agent
export const MOCK_CAMPAIGN_TOKEN = fixtures.tokens.campaign

/** referralLookup 的原始返回,按 token 索引。 */
export const MOCK_LOOKUP_WIRE: Record<string, unknown> = {
  [MOCK_CUSTOMER_TOKEN]: fixtures.lookup.customer,
  [MOCK_AGENT_TOKEN]:    fixtures.lookup.agent,
  [MOCK_CAMPAIGN_TOKEN]: fixtures.lookup.campaign,
}

/** referralPortal 的原始返回,按 token 索引。campaign 类没有奖励页。 */
export const MOCK_PORTAL_WIRE: Record<string, unknown> = {
  [MOCK_CUSTOMER_TOKEN]: fixtures.portal.customer,
  [MOCK_AGENT_TOKEN]:    fixtures.portal.agent,
  [MOCK_CAMPAIGN_TOKEN]: fixtures.portal.campaign,
}

export { fixtures as MOCK_WIRE_FIXTURES }
'''

LIB_LOOKUP_OLD = """  if (MOCK()) {
    const { MOCK_LOOKUP } = await import('@/lib/referral.mock')
    const value = MOCK_LOOKUP[token] ?? null
    cacheSet(token, value)
    return value
  }"""
LIB_LOOKUP_NEW = """  if (MOCK()) {
    // ★ 故意让 mock 也走 toPublic —— 翻译层是最容易和 AAPP 漂开的地方,
    //   绕过它的 mock 等于没测(见 referral.mock.ts 文件头)。
    const { MOCK_LOOKUP_WIRE } = await import('@/lib/referral.mock')
    const wire = MOCK_LOOKUP_WIRE[token] as any
    const value = wire ? toPublic(wire?.public ?? wire) : null
    cacheSet(token, value)
    return value
  }"""

LIB_PORTAL_OLD = """  if (MOCK()) {
    const { MOCK_PORTAL } = await import('@/lib/referral.mock')
    return MOCK_PORTAL[token] ?? null
  }"""
LIB_PORTAL_NEW = """  if (MOCK()) {
    const { MOCK_PORTAL_WIRE } = await import('@/lib/referral.mock')
    const wire = MOCK_PORTAL_WIRE[token] as any
    if (!wire || wire.ok === false) return null
    return toPortal(token, wire.portal ?? wire)
  }"""

TEST_IMPORT_OLD = "import { MOCK_CUSTOMER_TOKEN, MOCK_AGENT_TOKEN, MOCK_CAMPAIGN_TOKEN } from './referral.mock'"
TEST_IMPORT_NEW = ("import { MOCK_CUSTOMER_TOKEN, MOCK_AGENT_TOKEN, MOCK_CAMPAIGN_TOKEN } from './referral.mock'\n"
                   "import fixtures from './referral-wire-fixtures.json'")

TEST_CUT_START = """  // referralLookup → { ok, public: <referralPublic doc> }
  const LOOKUP_WIRE = {"""
TEST_CUT_END = """  it('★ lookup reads the {ok, public:"""
TEST_CUT_NEW = r'''  /* ★ 这些 payload **不是手写的** —— 直接读 AAPP 生成的 fixture。
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

'''

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()

    lib = os.path.join(a.src, LIB)
    s = io.open(lib, encoding='utf-8').read()
    if 'MOCK_LOOKUP_WIRE' in s:
        print('fix-round2-fixtures: already applied'); return 0
    for nm, old in (('lookup', LIB_LOOKUP_OLD), ('portal', LIB_PORTAL_OLD)):
        if s.count(old) != 1:
            print('ABORT referral.ts/%s count=%d' % (nm, s.count(old)), file=sys.stderr); return 2
    s = s.replace(LIB_LOOKUP_OLD, LIB_LOOKUP_NEW).replace(LIB_PORTAL_OLD, LIB_PORTAL_NEW)

    t = io.open(os.path.join(a.src, TEST), encoding='utf-8').read()
    if t.count(TEST_IMPORT_OLD) != 1:
        print('ABORT test/import count=%d' % t.count(TEST_IMPORT_OLD), file=sys.stderr); return 2
    if t.count(TEST_CUT_START) != 1 or t.count(TEST_CUT_END) != 1:
        print('ABORT test/cut start=%d end=%d' % (t.count(TEST_CUT_START), t.count(TEST_CUT_END)), file=sys.stderr); return 2
    t = t.replace(TEST_IMPORT_OLD, TEST_IMPORT_NEW)
    i0 = t.find(TEST_CUT_START); i1 = t.find(TEST_CUT_END, i0)
    if i0 < 0 or i1 < 0:
        print('ABORT test/cut order', file=sys.stderr); return 2
    t = t[:i0] + TEST_CUT_NEW + t[i1:]

    if a.dry:
        print('fix-round2-fixtures: dry ok'); return 0
    io.open(lib, 'w', encoding='utf-8').write(s)
    io.open(os.path.join(a.out, TEST), 'w', encoding='utf-8').write(t)
    io.open(os.path.join(a.out, MOCK), 'w', encoding='utf-8').write(NEW_MOCK)
    print('fix-round2-fixtures: wrote referral.ts / referral.test.ts / referral.mock.ts')
    return 0

sys.exit(main())
