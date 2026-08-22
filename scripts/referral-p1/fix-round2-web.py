#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""补修任务书 B1–B4 — window-treatments 网站侧(确定性锚点替换,计数不对就整体中止)。
用法: python3 fix-round2-web.py --src <repo-root> --out <repo-root> [--dry]
"""
import argparse, io, os, sys

W = 'apps/web/src'
F = {}
def add(rel, name, old, new):
    F.setdefault(rel, []).append((name, old, new))

# ═══════════════════════════════════════════════════════════════════════════
# B1 middleware —— cookie 走服务端主路径
# ═══════════════════════════════════════════════════════════════════════════
add(W + '/middleware.ts', 'consts',
"""// Paths that must never be indexed by search engines.""",
"""// ── 推广归因 cookie(补修 B1)────────────────────────────────────────────
// 以前 ad_ref 只由 /api/referral/claim 种,而那个路由按 IP 限流 30 次/10 分钟。
// 微信内置浏览器、公司 NAT、展会 Wi-Fi 都是共享出口 IP —— 一个群里几十个人点
// 同一条链接,前 30 个之后的访客全部拿不到 cookie,归因静默失效。这不是边角
// 情况,这就是推广链接的主场景。
// 现在改成 middleware 直接在 /r/<token> 的响应上种 cookie:没有网络往返、没有
// 限流、禁 JS 也照种。claim 降级成「统计 + 埋点」的次路径。
// 无效 token 不落地(正则挡掉);就算落地了,AAPP 端 resolveReferralCore 也只会
// 返回 null 当成没有推荐人 —— 零副作用,所以这里不做网络校验。
// ★ 这两个常量必须与 src/lib/referral.ts 的 TOKEN_RE / REFERRAL_COOKIE 一致。
//   不 import 是因为 middleware 跑在 edge runtime,而 lib/referral.ts 里有
//   动态 import('@/lib/referral.mock'),会被打进 edge bundle。
//   referral.test.ts 里有一条断言盯着这两处别漂开。
const REFERRAL_COOKIE = 'ad_ref'
const REFERRAL_TOKEN_RE = /^[A-Za-z0-9_-]{16,32}$/
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 90   // 90 天,同 campaign cookie

// Paths that must never be indexed by search engines.""")

add(W + '/middleware.ts', 'branch',
"""export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const JWT_SECRET = getJwtSecret()
""",
"""export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── /r/<token>:种归因 cookie 然后立刻放行 ────────────────────────────
  // ★ 必须在 getJwtSecret() 的拒绝分支之前 return —— 否则没配 JWT_SECRET 的
  //   环境会把落地页也一起 500 掉,而落地页跟登录八竿子打不着。
  if (pathname.startsWith('/r/')) {
    const res = NextResponse.next()
    const token = pathname.slice(3).split('/')[0]
    if (REFERRAL_TOKEN_RE.test(token)) {
      res.cookies.set(REFERRAL_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFERRAL_COOKIE_MAX_AGE,
        path: '/',
      })
    }
    return res
  }

  const JWT_SECRET = getJwtSecret()
""")

add(W + '/middleware.ts', 'matcher',
"""  matcher: ['/api/admin/:path*', '/admin/:path*', '/angel-preview/:path*', '/angel-preview'],""",
"""  // '/r/:token' 在这里是为了种归因 cookie(补修 B1),不走 noindex 那套。
  matcher: ['/api/admin/:path*', '/admin/:path*', '/angel-preview/:path*', '/angel-preview', '/r/:token'],""")

# ═══════════════════════════════════════════════════════════════════════════
# B1 claim route —— 降级为统计路径
# ═══════════════════════════════════════════════════════════════════════════
CLAIM = W + '/app/api/referral/claim/route.ts'
add(CLAIM, 'header',
"""// Seed the referral attribution cookie for /r/<token>.
//""",
"""// /r/<token> 的**次**路径:埋点 + 给推荐人的仪表盘计一次访问。
//
// ★ 补修 B1:cookie 的主路径已经搬到 middleware.ts 了。原因是这个路由按 IP
//   限流,而微信群 / 公司 NAT / 展会 Wi-Fi 都是共享出口 IP —— 一条链接在群里
//   转开,前几十个人之后的访客就全部拿不到 cookie,归因静默失效。
//   这里保留是为了 referralVisit 统计和 logLeadEvent,cookie 顺手再种一次
//   (幂等,值一样),但它不再是唯一来源,被限流也不影响归因。
//""")

add(CLAIM, 'ratelimit',
"""    const ip = getClientIp(request)
    const limit = await rateLimit('referral_claim', ip, { max: 30, windowSeconds: 600 })
    if (!limit.allowed) return NextResponse.json({ success: false }, { status: 429 })
""",
"""    const ip = getClientIp(request)
    let body0: any = null
    try { body0 = await request.clone().json() } catch { body0 = null }
    const token0 = String(body0?.token ?? '')
    /* 限流口径改成「每 token 每 IP 每 10 分钟 1 次」,和 AAPP 端 referralVisit
       的 _rateLimitAllow('refVisit', token+'|'+ip, 1, 600000) 完全一致 ——
       两边各记各的,口径不同就会对不上账。
       ★ 不再按纯 IP 限流:共享出口 IP 下那会把整群人挡在门外。
       被限流不是错误,是「这次不用重复计数」——返回 200,页面什么都不用做。 */
    const limit = await rateLimit('referral_claim', token0 + '|' + ip, { max: 1, windowSeconds: 600 })
    if (!limit.allowed) return NextResponse.json({ success: true, deduped: true })
""")

# ═══════════════════════════════════════════════════════════════════════════
# B3 可访问性 —— 三个页面共有的两处
# ═══════════════════════════════════════════════════════════════════════════
for rel in (W + '/app/r/[token]/ReferralLanding.tsx',
            W + '/app/rewards/[token]/RewardsClient.tsx',
            W + '/app/partner/[token]/PartnerClient.tsx'):
    # 可见文字是 "ANGEL DRAPERY, INC",aria-label 却是别的 → 2.5.3 Label in Name。
    add(rel, 'label-in-name',
        """        <Link href="/" aria-label="Angel Drapery — home">""",
        """        {/* 可见文字就是可访问名(WCAG 2.5.3 Label in Name):
            再加一个内容不同的 aria-label 会把它整个盖掉,语音控制说
            "click Angel Drapery" 就点不动了。 */}
        <Link href="/">""")
    # 语言切换:26px 高、4px 间距 → 触控目标不达标(2.5.8 / Lighthouse tap targets)
    add(rel, 'lang-toggle-gap',
        """        <div className="flex items-center gap-1 text-[12px]">""",
        """        <div className="flex items-center gap-2 text-[12px]">""")
    add(rel, 'lang-toggle-size',
        """              className={`rounded-full px-3 py-1 transition-colors ${""",
        """              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-4 transition-colors ${""")
    # 灰度不足:gray-400 在白底只有 2.54:1,AA 要 4.5。gray-500 = 4.83。
    add(rel, 'gray400', 'text-gray-400', 'text-gray-500')

# 只有 /r 缺 <main>
RL = W + '/app/r/[token]/ReferralLanding.tsx'
add(RL, 'main-open',
"""      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-4 pt-6 text-center md:pt-12">""",
"""      {/* 主地标 —— 屏幕阅读器靠它「跳到正文」。/rewards 和 /partner 早就有了,
          只有这一页漏了。 */}
      <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-4 pt-6 text-center md:pt-12">""")
add(RL, 'main-close',
"""      {/* ── NAP footer ───────────────────────────────────────────────────── */}
      <footer""",
"""      </main>

      {/* ── NAP footer ───────────────────────────────────────────────────── */}
      <footer""")
# 品牌蓝当正文链接色只有 2.29:1
add(RL, 'link-blue',
"""                  <Link key={l.href} href={l.href} className="text-[13px] text-[#4DB6E8] hover:underline">""",
"""                  <Link
                    key={l.href}
                    href={l.href}
                    /* 品牌蓝 #4DB6E8 在白底只有 2.29:1,当正文链接色不合格。
                       #17698F 是同色系压暗版,6.08:1。背景/填充仍然用品牌蓝。
                       行高与间距一起提到 44px 触控目标。 */
                    className="flex min-h-[44px] items-center text-[13px] text-[#17698F] hover:underline"
                  >""")
add(RL, 'link-gap',
"""              <div className="mt-4 flex flex-col gap-1">""",
"""              <div className="mt-4 flex flex-col gap-2">""")
add(RL, 'disabled-btn',
"""            className="w-full max-w-sm cursor-not-allowed rounded-full border border-gray-200 px-5 py-2.5 text-[14px] text-gray-300\"""",
"""            /* gray-300 只有 1.47:1,谁都看不清。禁用态不代表可以不可读。 */
            className="w-full max-w-sm cursor-not-allowed rounded-full border border-gray-300 px-5 py-2.5 text-[14px] text-gray-500 opacity-80\"""")

# /rewards 的短信开关:28px 高,触控目标不够
RW = W + '/app/rewards/[token]/RewardsClient.tsx'
add(RW, 'switch',
"""              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                portal.smsOptedOut ? 'cursor-not-allowed bg-gray-200' : smsOptIn ? 'bg-[#4DB6E8]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  smsOptIn ? 'left-6' : 'left-1'
                }`}
              />
            </button>""",
"""              /* 轨道看着还是 28px 高,但按钮本身撑到 44px —— 触控目标够了,
                 视觉一点没变(2.5.8 Target Size)。 */
              className="relative flex h-11 w-12 shrink-0 items-center justify-center"
            >
              <span
                className={`block h-7 w-12 rounded-full transition-colors ${
                  portal.smsOptedOut ? 'cursor-not-allowed bg-gray-200' : smsOptIn ? 'bg-[#4DB6E8]' : 'bg-gray-300'
                }`}
              />
              <span
                className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all ${
                  smsOptIn ? 'left-6' : 'left-1'
                }`}
              />
            </button>""")

# ═══════════════════════════════════════════════════════════════════════════
# B3-④ + B4 StoreAssistant
# ═══════════════════════════════════════════════════════════════════════════
SA = W + '/components/StoreAssistant.tsx'
add(SA, 'import',
"""import { usePathname } from 'next/navigation'""",
"""import { usePathname } from 'next/navigation'
import { tr, useUiLanguage } from '@/lib/uiLanguage'""")

add(SA, 'teaser-label',
"""            <button
              type="button"
              onClick={openChat}
              className="text-left"
              aria-label="Open design assistant chat"
            >
              {onStore ? TEASER_STORE : TEASER_MAIN}
            </button>""",
"""            {/* 气泡里那句话本身就是这个按钮的名字。再挂一个内容完全不同的
                aria-label 会把它盖掉(WCAG 2.5.3),语音控制念不出来。 */}
            <button type="button" onClick={openChat} className="text-left">
              {onStore ? TEASER_STORE : TEASER_MAIN}
            </button>""")

add(SA, 'fab',
"""        <button
          onClick={openChat}
          aria-label="Open design assistant chat"
""",
"""        <button
          onClick={openChat}
          /* 可访问名必须**包含**可见文字(2.5.3)。以前可见的是 "Ask AI"、
             aria-label 却是 "Open design assistant chat",两者毫无交集。 */
          aria-label={tr(uiLang, 'Ask AI — open design assistant chat', 'AI 助手 — 打开设计助手对话')}
""")

add(SA, 'fab-label',
"""          <span className="text-[13px] font-medium tracking-wide">Ask AI</span>""",
"""          {/* 补修 B4:悬浮球跟着落地页的语言走(同一个 ad_lang 键)。
              整站中文用户看到一颗英文球,像是别人家的控件。 */}
          <span className="text-[13px] font-medium tracking-wide">{tr(uiLang, 'Ask AI', 'AI 助手')}</span>""")

add(SA, 'panel-inert',
"""        role="dialog"
        aria-label="Design Assistant chat"
        aria-hidden={!open}
      >""",
"""        role="dialog"
        aria-label="Design Assistant chat"
        aria-hidden={!open}
        /* ★ 关着的时候面板还留在 DOM 里做退场动画,里面的输入框和按钮照样能
           Tab 进去 —— aria-hidden=true 的容器里有可聚焦元素,是键盘用户会
           凭空掉进一个看不见的表单,也是 Lighthouse 直接判红的一条。
           inert 把整棵子树移出 tab 顺序和无障碍树,视觉与动画一点不动
           (React 19 原生支持)。 */
        inert={!open}
      >""")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    staged = []
    for rel, pairs in F.items():
        p = os.path.join(a.src, rel)
        if not os.path.exists(p):
            print('fix-round2-web: ABORT missing %s' % rel, file=sys.stderr); return 2
        s = io.open(p, encoding='utf-8').read()
        if '补修 B' in s or 'REFERRAL_TOKEN_RE' in s:
            print('fix-round2-web: %s already applied, skip' % rel); continue
        for nm, old, new in pairs:
            n = s.count(old)
            if nm == 'gray400':
                # 这一条是「全文替换」而不是唯一锚点:有的页面本来就没用 gray-400。
                print('   %s: text-gray-400 → text-gray-500 x%d' % (rel.split('/')[-1], n))
                continue
            if n != 1:
                print('fix-round2-web: ABORT %s/%s count=%d (want 1)' % (rel, nm, n), file=sys.stderr); return 2
        for nm, old, new in pairs:
            s = s.replace(old, new)
        staged.append((rel, s))
    if a.dry:
        print('fix-round2-web: dry ok (%d files)' % len(staged)); return 0
    for rel, s in staged:
        io.open(os.path.join(a.out, rel), 'w', encoding='utf-8').write(s)
        print('fix-round2-web: wrote %s' % rel)
    return 0

sys.exit(main())
