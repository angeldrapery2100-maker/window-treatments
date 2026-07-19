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
  assistant_chat:        { points: 2,  cap: 20 },
  project_viewed:        { points: 3,  cap: 12 },
  project_item_added:    { points: 12, cap: 60 },
  hd_estimate:           { points: 15, cap: 30 },
  shutter_estimate:      { points: 15, cap: 30 },
  measure_wizard:        { points: 8,  cap: 24 },
  project_added_to_cart: { points: 20, cap: 40 },
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
