#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""apps/web/src/lib/referral.ts — 对齐 AAPP P0 的真实线格式(推广系统 §0 契约)。

P0 已经部署,四个端点的实际返回和这个文件的解析对不上,共 4 处。
契约(任务书 §0.2 / §3.3)是仲裁标准,四处都是网站这边漂了:

 ① referralLookup 的信封是 {ok, public:{...}},这里读的是 data.referral —— 取不到
    就退化成读整个信封,信封上没有 referrerType,normalizeType 返回 null,
    lookupReferral 永远返回 null。
    ★ 这条是全链路的总闸:/api/referral/claim 拿不到 lookup 就 404,ad_ref cookie
      根本不会被种下,后面所有归因(表单、AI 对话、线索)全部失效。
 ② referralPortal 的字段名:P0 发 code / tier / nextTier.needed / tiers[].pct /
    partner 的 referredLeads+signed 摊平在顶层;这里读的是 referralCode /
    tierKey / nextTier.min / tiers[].discountPct / stats.{...}。
    对不上的后果是奖励页不显示优惠码、等级高亮全灭、进度条恒为 0、
    合作方页两个数字恒为 0。
 ③ nextTier 的语义差:UI 把 next.min 当**绝对门槛**用(显示 "1 / 3"、算进度条),
    而 P0 发的是 needed(还差几单)。直接映射会显示 "1 / 2" 并把进度条算错。
    正确做法:绝对门槛从 tiers[] 里按 key 查(那里的 min 就是绝对值),
    查不到再用 needed + qualifiedReferrals 还原。
 ④ W-9 端点名与字段名:P0 是 referralPartnerW9Upload + {fileBase64},
    这里是 partnerW9Upload + {file} —— 404,合作方永远传不上税表。

外加一处口径修正:toPublic 里的 Math.round 会把真实折扣 4.8/6.8/7.8/8.8
四舍五入成 5/7/8/9,落地页写着 "5% off" 而优惠码实际是 4.8% —— 对客户报的
数字和给的数字不一样。奖励页用的是未取整的值,两个页面还会互相打脸。

写法上一律 `新名 ?? 旧名`,两种形态都认 —— 以后哪边再改都不会单方面炸掉。
用法: python3 fix-referral-contract.py --src <repo> --out <repo> [--dry]
"""
import argparse, io, os, sys

REL = os.path.join('apps', 'web', 'src', 'lib', 'referral.ts')

E = []
def add(name, old, new): E.append((name, old, new))

# ── ① + 折扣取整 ──────────────────────────────────────────────────────────
add('toPublic',
"""function toPublic(data: any): ReferralPublic | null {
  const type = normalizeType(data?.referrerType ?? data?.type)
  if (!type) return null
  if (data?.active === false) return null
  const pct = Number(data?.discountPct)
  return {
    referrerType: type,
    displayName: String(data?.displayName ?? '').trim().slice(0, 80) || 'A friend',
    discountPct: Number.isFinite(pct) && pct > 0 ? Math.round(pct) : null,""",
"""function toPublic(data: any): ReferralPublic | null {
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
    discountPct: Number.isFinite(pct) && pct > 0 ? Number(pct.toFixed(1)) : null,""")

add('lookup-envelope',
"""      if (data?.ok !== false) value = toPublic(data?.referral ?? data)""",
"""      // 契约 §0.2:referralLookup → { ok:true, public:<referralPublic doc> }。
      // 只读 data.referral 会取到 undefined,退化成读整个信封,而信封上没有
      // referrerType —— 结果 lookupReferral 永远返回 null,ad_ref cookie 永远
      // 种不下去,整条归因链是死的。data.referral / 裸对象保留为兼容分支。
      if (data?.ok !== false) value = toPublic(data?.public ?? data?.referral ?? data)""")

# ── ② ③ portal 字段映射 ───────────────────────────────────────────────────
add('toPortal',
"""  const tier = (t: any): PortalTier | null => {
    if (!t || typeof t !== 'object') return null
    return {
      key: String(t.key ?? '').slice(0, 32),
      label: String(t.label ?? '').slice(0, 40),
      labelCn: t.labelCn ? String(t.labelCn).slice(0, 40) : undefined,
      min: num(t.min) ?? 0,
      discountPct: num(t.discountPct) ?? 0,
      color: typeof t.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(t.color) ? t.color : undefined,
    }
  }""",
"""  // AAPP 发的是 { tier, label, labelCn, min, pct };本地类型用的是
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
  }""")

add('toPortal-return',
"""    referralCode: data?.referralCode ? String(data.referralCode).slice(0, 40) : null,
    shareUrl:""",
"""    // AAPP 的字段名是 code(契约 §3.3),不是 referralCode —— 奖励页那张
    // 大字优惠码卡片会整块不显示。(toPublic 那边读 referralCode 是对的:
    // referralPublic 文档的字段名就叫 referralCode,见契约 §0.1。)
    referralCode: (data?.code ?? data?.referralCode)
      ? String(data.code ?? data.referralCode).slice(0, 40)
      : null,
    shareUrl:""")

add('toPortal-tierKey',
"""    freeVisitCredits: num(data?.freeVisitCredits),
    qualifiedReferrals: num(data?.qualifiedReferrals),
    tierKey: data?.tierKey ? String(data.tierKey).slice(0, 32) : undefined,
    tierLabel: data?.tierLabel ? String(data.tierLabel).slice(0, 40) : undefined,
    tierLabelCn: data?.tierLabelCn ? String(data.tierLabelCn).slice(0, 40) : undefined,
    nextTier: tier(data?.nextTier),
    tiers: Array.isArray(data?.tiers) ? (data.tiers.map(tier).filter(Boolean) as PortalTier[]) : [],""",
"""    freeVisitCredits: num(data?.freeVisitCredits),
    qualifiedReferrals: num(data?.qualifiedReferrals),
    // AAPP 发 tier,不是 tierKey。对不上会让当前等级高亮和进度条颜色全灭。
    tierKey: (data?.tier ?? data?.tierKey) ? String(data.tier ?? data.tierKey).slice(0, 32) : undefined,
    tierLabel: data?.tierLabel ? String(data.tierLabel).slice(0, 40) : undefined,
    tierLabelCn: data?.tierLabelCn ? String(data.tierLabelCn).slice(0, 40) : undefined,
    nextTier: next,
    tiers: ladder,""")

add('toPortal-stats',
"""    stats: data?.stats
      ? { referredLeads: num(data.stats.referredLeads) ?? 0, signed: num(data.stats.signed) ?? 0 }
      : undefined,""",
"""    // 合作方页的两个数字:AAPP 把 referredLeads / signed 摊平在顶层(契约 §3.3),
    // 没有 stats 这一层。只读 data.stats 会让两个数字恒为 0。
    stats: data?.stats
      ? { referredLeads: num(data.stats.referredLeads) ?? 0, signed: num(data.stats.signed) ?? 0 }
      : (data?.referredLeads != null || data?.signed != null)
        ? { referredLeads: num(data.referredLeads) ?? 0, signed: num(data.signed) ?? 0 }
        : undefined,""")

# ── ④ W-9 ────────────────────────────────────────────────────────────────
add('w9',
"""    const res = await fetch(`${BASE()}/partnerW9Upload`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ token, file: fileBase64, mime }),""",
"""    // 端点名和字段名都按 AAPP 实际部署的来(任务书 §1.5):
    // referralPartnerW9Upload,body 是 { token, fileBase64, mime }。
    const res = await fetch(`${BASE()}/referralPartnerW9Upload`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ token, fileBase64, mime }),""")

# 顺带把文件头那句过期的说明改准(端点是五个 + 名字写错了)
add('header',
"""// The five endpoints live in AAPP (P0). Until they are deployed, set
// AAPP_REFERRAL_MOCK=1 to serve `referral.mock.ts` fixtures locally.""",
"""// The endpoints live in AAPP (P0, deployed 2026-08-22): referralLookup /
// referralVisit / referralPortal / referralPortalPrefs /
// referralPartnerW9Upload. Until they are reachable, set AAPP_REFERRAL_MOCK=1
// to serve `referral.mock.ts` fixtures locally.
//
// ⚠ WIRE SHAPES ARE NOT THIS FILE'S TYPES. AAPP speaks the P0 §0 contract
// (`{ok, public:{...}}`, `code`, `tier`, `nextTier.needed`, `tiers[].pct`,
// flat `referredLeads`/`signed`); `toPublic` / `toPortal` translate. Change a
// name on either side and the page silently renders zeros — keep the `??`
// fallbacks so neither side can break the other alone.""")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    p = os.path.join(a.src, REL)
    s = io.open(p, encoding='utf-8').read()
    if 'referralPartnerW9Upload' in s:
        print('fix-referral-contract: already applied'); return 0
    bad = 0
    for nm, old, new in E:
        n = s.count(old)
        if n != 1:
            print('fix-referral-contract: ABORT anchor %s count=%d (want 1)' % (nm, n), file=sys.stderr); bad += 1
    if bad: return 2
    for nm, old, new in E:
        s = s.replace(old, new)
    if a.dry:
        print('fix-referral-contract: dry ok (%d anchors)' % len(E)); return 0
    io.open(os.path.join(a.out, REL), 'w', encoding='utf-8').write(s)
    print('fix-referral-contract: wrote %s (%d anchors)' % (REL, len(E)))
    return 0

sys.exit(main())
