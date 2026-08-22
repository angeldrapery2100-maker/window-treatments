#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""补修 B1/B2 收尾 —— 再补两组断言:
  ① middleware.ts 里内联的 token 正则 / cookie 名必须与 lib/referral.ts 一致。
     那两个常量是抄过去的(edge runtime 不能 import 带动态 import 的模块),
     抄过去的东西没人盯着就会漂 —— 漂了的后果是 cookie 名对不上,归因静默失效。
  ② AAPP_REFERRAL_MOCK=1 的路径也走 toPublic / toPortal 翻译层。
"""
import argparse, io, os, sys
TEST = 'apps/web/src/lib/referral.test.ts'

IMP_OLD = "import fixtures from './referral-wire-fixtures.json'"
IMP_NEW = """import fixtures from './referral-wire-fixtures.json'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'"""

TAIL_ANCHOR = "describe('AAPP wire format', () => {"
TAIL_NEW = r'''describe('middleware 与 lib 的常量同步', () => {
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

describe('AAPP wire format', () => {'''

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    p = os.path.join(a.src, TEST)
    s = io.open(p, encoding='utf-8').read()
    if 'middleware 与 lib 的常量同步' in s:
        print('add-sync-tests: already applied'); return 0
    for nm, old in (('imp', IMP_OLD), ('anchor', TAIL_ANCHOR)):
        if s.count(old) != 1:
            print('ABORT %s count=%d' % (nm, s.count(old)), file=sys.stderr); return 2
    s = s.replace(IMP_OLD, IMP_NEW).replace(TAIL_ANCHOR, TAIL_NEW)
    # lib 的三个导出要 import 进来
    old_imp = """  fetchReferralPortal, lookupReferral, uploadPartnerW9, _clearReferralCache,
} from './referral'"""
    new_imp = """  fetchReferralPortal, lookupReferral, uploadPartnerW9, _clearReferralCache,
  REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE,
} from './referral'"""
    if s.count(old_imp) != 1:
        print('ABORT lib-import count=%d' % s.count(old_imp), file=sys.stderr); return 2
    s = s.replace(old_imp, new_imp)
    if a.dry:
        print('add-sync-tests: dry ok'); return 0
    io.open(os.path.join(a.out, TEST), 'w', encoding='utf-8').write(s)
    print('add-sync-tests: wrote %s' % TEST); return 0

sys.exit(main())
