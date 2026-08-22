#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""补修 B5 —— P1 任务书里 cookie 的落地方式已经变了(§1.2 / §7),文档跟上。"""
import argparse, io, os, sys

DOC = 'OPUS-任务书-推广系统P1-网站-2026-08-22.md'

A_OLD = "- 服务端副作用（在 `page.tsx` 里用 `cookies()`/`headers()`，Next 15 写法）：种 `ad_ref=<token>`（httpOnly, lax, secure in prod, 90 天, path `/`）；无 `ad_anon` 则种；`logLeadEvent({anonId, type:'referral_visit', meta:{token, type, ua}})`；`recordReferralVisit(token,'/r',ua)`。⚠ Server Component 不能直接 set cookie —— 若 Next 版本限制，改为 `route.ts` 先 302 到 `/r/[token]/view`（照 `/c/` 模板），再由 `view/page.tsx` 渲染。两种实现二选一，**cookie 必须在首屏前种好**。"

A_NEW = """- 服务端副作用：**cookie 由 `middleware.ts` 种**（2026-08-22 补修 B1 定案）。matcher 加 `'/r/:token'`，命中且 token 过 `TOKEN_RE` 就在 `NextResponse.next()` 上 `set-cookie: ad_ref=<token>`（httpOnly, lax, secure in prod, 90 天, path `/`），然后立刻 return —— 必须排在 `getJwtSecret()` 的拒绝分支**之前**，否则没配 `JWT_SECRET` 的环境会把落地页一起 500 掉。
  - 为什么不是 `page.tsx` / route handler：Server Component 在 Next 15 里不能写 cookie；而先前那版把 cookie 交给客户端 POST `/api/referral/claim`，那个路由**按 IP 限流 30 次 / 10 分钟** —— 微信内置浏览器、公司 NAT、展会 Wi-Fi 都是共享出口 IP，一条链接在群里转开，前 30 个人之后的访客全部拿不到 cookie，归因静默失效。这不是边角情况，这就是推广链接的主场景。middleware 没有网络往返、没有限流、**禁用 JS 也照种**。
  - 无效 token 不落地（正则挡掉）；就算落地，AAPP 的 `resolveReferralCore` 也只会返回 null 当成没有推荐人 —— 零副作用，所以 middleware 里不做网络校验。
  - `/api/referral/claim` **保留但降级**：只负责 `logLeadEvent({anonId, type:'referral_visit', …})` 与 `recordReferralVisit(token,'/r',ua)`，cookie 顺手再种一次（幂等）。限流口径改为 **每 token 每 IP 每 10 分钟 1 次**，与 AAPP 端 `referralVisit` 的 `_rateLimitAllow('refVisit', token+'|'+ip, 1, 600000)` 对齐（两边各记各的，口径不同就会对不上账）；被限流返回 200 + `deduped:true`，不是错误。
  - ⚠ middleware 里的 `REFERRAL_COOKIE` / `REFERRAL_TOKEN_RE` / `REFERRAL_COOKIE_MAX_AGE` 是从 `lib/referral.ts` **抄过去**的（edge runtime 不能 import 带动态 `import()` 的模块）。`referral.test.ts` 的「middleware 与 lib 的常量同步」组盯着它们别漂开。"""

B_OLD = "7. `/r/mock-customer-0000000000` 200，`<meta property=\"og:title\">` 含 displayName，`set-cookie` 含 `ad_ref`；`/r/bad` → 302 `/`。"
B_NEW = """7. `/r/<token>` 200，`<meta property="og:title">` 含 displayName，**响应头直接**含 `set-cookie: ad_ref=…; HttpOnly; Max-Age=7776000`（由 middleware 种，不依赖任何客户端 JS —— `curl -sI` 就能看到）；`/r/bad` → 302 `/`。
   补充验收：禁用 JS 的浏览器上下文打开 `/r/<token>` 后再提交 `/api/consultation`，AAPP 端收到的 body 必须含 `referral.token`。"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    p = os.path.join(a.src, DOC)
    s = io.open(p, encoding='utf-8').read()
    if 'middleware.ts` 种' in s:
        print('fix-p1-doc: already applied'); return 0
    for nm, old in (('A', A_OLD), ('B', B_OLD)):
        if s.count(old) != 1:
            print('ABORT %s count=%d' % (nm, s.count(old)), file=sys.stderr); return 2
    s = s.replace(A_OLD, A_NEW).replace(B_OLD, B_NEW)
    if a.dry:
        print('fix-p1-doc: dry ok'); return 0
    io.open(os.path.join(a.out, DOC), 'w', encoding='utf-8').write(s)
    print('fix-p1-doc: wrote %s' % DOC); return 0

sys.exit(main())
