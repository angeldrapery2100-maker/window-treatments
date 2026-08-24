// Lead scoring (P2) — a simple, explainable score computed from lead_events.
// Used two ways:
//   1. The AI assistant's submit_website_inquiry handoff appends the score +
//      tier to the AI Sales Summary so the salesperson sees engagement at a
//      glance.
//   2. (Later) admin views can rank open leads.
// Weights are deliberately plain constants — few enough to reason about, and
// per-type caps stop any one behavior (e.g. opening the chat 50 times) from
// inflating the score.

import { query } from '@/lib/db'
import { ensureProjectTables } from '@/lib/homeProjects'

export interface ScoreWeight {
  points: number
  cap: number
}

export const LEAD_SCORE_WEIGHTS: Record<string, ScoreWeight> = {
  campaign_visit:        { points: 5,  cap: 10 },
  // A referral link is a warmer touch than a flyer: someone the visitor
  // trusts handed it to them. Capped at two visits so re-opening the link
  // from a chat thread doesn't inflate the score.
  referral_visit:        { points: 8,  cap: 16 },
  assistant_chat:        { points: 2,  cap: 20 },
  project_viewed:        { points: 3,  cap: 12 },
  project_item_added:    { points: 12, cap: 60 },
  hd_estimate:           { points: 15, cap: 30 },
  shutter_estimate:      { points: 15, cap: 30 },
  sundance_jc_estimate:  { points: 15, cap: 30 },
  measure_wizard:        { points: 8,  cap: 24 },
  project_added_to_cart: { points: 20, cap: 40 },
  // Saving a made-to-measure design is as strong a signal as a cart add: the
  // visitor has chosen fabric, size, heading and hardware for a real window.
  design_saved:          { points: 20, cap: 40 },
  // 点「在 ChatGPT 里打开」= 愿意离开我们的站去跟顾问聊,比在页面上多点两下
  // 强得多,但比量窗助手弱 —— 那边已经在报尺寸了。封顶两次:同一个人来回开
  // 链接不该刷分。
  gpt_open:              { points: 8,  cap: 16 },
  inquiry_submitted:     { points: 35, cap: 35 },
}

export type LeadTier = 'hot' | 'warm' | 'cool'

export function scoreTier(score: number): LeadTier {
  if (score >= 70) return 'hot'
  if (score >= 35) return 'warm'
  return 'cool'
}

/** Pure: score a set of events with per-type caps. */
export function computeLeadScore(events: Array<{ type: string }>): number {
  const byType: Record<string, number> = {}
  for (const e of events) {
    const w = LEAD_SCORE_WEIGHTS[e.type]
    if (!w) continue
    byType[e.type] = Math.min((byType[e.type] ?? 0) + w.points, w.cap)
  }
  return Object.values(byType).reduce((a, b) => a + b, 0)
}

/**
 * Score a visitor from their last 90 days of lead events (by user id and/or
 * anon id). Best-effort: returns 0 on any DB problem.
 */
export async function getLeadScoreForOwner(userId: string | null, anonId: string | null): Promise<{ score: number; tier: LeadTier; eventCount: number }> {
  if (!userId && !anonId) return { score: 0, tier: 'cool', eventCount: 0 }
  try {
    await ensureProjectTables()
    const events = await query<{ type: string }>(
      `SELECT type FROM lead_events
        WHERE created_at > now() - interval '90 days'
          AND ((($1::uuid IS NOT NULL) AND user_id = $1::uuid) OR (($2::text IS NOT NULL) AND anon_id = $2))
        LIMIT 500`,
      [userId ?? null, anonId ?? null]
    )
    const score = computeLeadScore(events)
    return { score, tier: scoreTier(score), eventCount: events.length }
  } catch {
    return { score: 0, tier: 'cool', eventCount: 0 }
  }
}

export interface LeadRow {
  ownerKey: string
  userId: string | null
  anonId: string | null
  name: string | null
  email: string | null
  phone: string | null
  score: number
  tier: LeadTier
  eventCount: number
  inquiries: number
  lastActivity: string
  topSignals: string[]
}

// Score contribution of a (type,count) pair under the per-type cap.
function contribution(type: string, count: number): number {
  const w = LEAD_SCORE_WEIGHTS[type]
  if (!w) return 0
  return Math.min(count * w.points, w.cap)
}

const SIGNAL_LABEL: Record<string, string> = {
  inquiry_submitted: '已留资',
  project_added_to_cart: '加购',
  project_item_added: '方案条目',
  hd_estimate: 'HD 询价',
  shutter_estimate: '百叶询价',
  sundance_jc_estimate: 'Sundance/JC 询价',
  store_estimate: '商店询价',
  measure_wizard: '量窗',
  design_saved: '存设计',
  assistant_chat: 'AI 对话',
  campaign_visit: '活动访问',
  referral_visit: '推荐链接访问',
  project_viewed: '看方案',
}

/**
 * Rank recent leads by computed score (last 90 days). Groups lead_events by
 * owner, computes each score + tier in JS (respecting per-type caps), enriches
 * signed-in owners with account name/email/phone. Best-effort — [] on error.
 */
export async function listLeads(limit = 100): Promise<LeadRow[]> {
  try {
    await ensureProjectTables()
    const rows = await query<{ user_id: string | null; anon_id: string | null; type: string; n: string; last_at: string }>(
      `SELECT user_id, anon_id, type, COUNT(*) AS n, MAX(created_at) AS last_at
         FROM lead_events
        WHERE created_at > now() - interval '90 days'
        GROUP BY user_id, anon_id, type`
    )
    // Aggregate per owner.
    const byOwner = new Map<string, { userId: string | null; anonId: string | null; byType: Record<string, number>; last: string }>()
    for (const r of rows) {
      const key = r.user_id ? 'u:' + r.user_id : r.anon_id ? 'a:' + r.anon_id : null
      if (!key) continue
      const n = Number(r.n) || 0
      const cur = byOwner.get(key) || { userId: r.user_id, anonId: r.anon_id, byType: {}, last: r.last_at }
      cur.byType[r.type] = (cur.byType[r.type] || 0) + n
      if (r.last_at > cur.last) cur.last = r.last_at
      byOwner.set(key, cur)
    }
    let leads: LeadRow[] = [...byOwner.entries()].map(([ownerKey, o]) => {
      const score = Object.entries(o.byType).reduce((sum, [t, c]) => sum + contribution(t, c), 0)
      const eventCount = Object.values(o.byType).reduce((a, b) => a + b, 0)
      const topSignals = Object.keys(o.byType)
        .filter((t) => LEAD_SCORE_WEIGHTS[t])
        .sort((a, b) => contribution(b, o.byType[b]) - contribution(a, o.byType[a]))
        .slice(0, 3)
        .map((t) => SIGNAL_LABEL[t] || t)
      return {
        ownerKey,
        userId: o.userId,
        anonId: o.anonId,
        name: null,
        email: null,
        phone: null,
        score,
        tier: scoreTier(score),
        eventCount,
        inquiries: o.byType['inquiry_submitted'] || 0,
        lastActivity: o.last,
        topSignals,
      }
    })
    leads.sort((a, b) => b.score - a.score || (a.lastActivity < b.lastActivity ? 1 : -1))
    leads = leads.slice(0, limit)

    // Enrich signed-in owners with account details.
    const userIds = leads.map((l) => l.userId).filter((v): v is string => !!v)
    if (userIds.length) {
      const users = await query<{ id: string; name: string; email: string; phone: string }>(
        `SELECT id, name, email, phone FROM users WHERE id = ANY($1::uuid[])`,
        [userIds]
      )
      const byId = new Map(users.map((u) => [u.id, u]))
      leads = leads.map((l) => {
        const u = l.userId ? byId.get(l.userId) : null
        return u ? { ...l, name: u.name || null, email: u.email || null, phone: u.phone || null } : l
      })
    }
    return leads
  } catch {
    return []
  }
}
