// Marketing campaigns (P3) — short tracked links (/c/<slug>) for flyers,
// EDDM postcards, new-mover mailers, and QR codes. Visiting a campaign link
// sets the ad_campaign cookie (90 days) and logs a campaign_visit lead event;
// downstream events (chats, project items, inquiries) carry the same
// campaign_id so the admin funnel report can attribute them.

import { query, queryOne } from '@/lib/db'

export const CAMPAIGN_COOKIE = 'ad_campaign'
/** 90 days — a typical mailer consideration window. */
export const CAMPAIGN_COOKIE_MAX_AGE = 60 * 60 * 24 * 90

const SLUG_RE = /^[a-z0-9][a-z0-9_-]{1,63}$/

export function normalizeCampaignSlug(v: unknown): string | null {
  const s = String(v ?? '').trim().toLowerCase()
  return SLUG_RE.test(s) ? s : null
}

export function getCampaignFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|;\s*)ad_campaign=([A-Za-z0-9_-]{2,64})/)
  return match ? match[1].toLowerCase() : null
}

let _ensured = false
export async function ensureCampaignsTable(): Promise<void> {
  if (_ensured) return
  await query(`CREATE TABLE IF NOT EXISTS campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug varchar(64) NOT NULL UNIQUE,
    name varchar(200) NOT NULL,
    target_url text NOT NULL DEFAULT '/store',
    notes text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
  )`)
  _ensured = true
}

export interface CampaignRow {
  id: string
  slug: string
  name: string
  target_url: string
  notes: string | null
  is_active: boolean
  created_at: string
}

export async function getCampaignBySlug(slug: string): Promise<CampaignRow | null> {
  await ensureCampaignsTable()
  const clean = normalizeCampaignSlug(slug)
  if (!clean) return null
  return queryOne<CampaignRow>(`SELECT * FROM campaigns WHERE slug = $1`, [clean])
}

export async function createCampaign(input: { slug: string; name: string; targetUrl?: string; notes?: string }): Promise<CampaignRow> {
  await ensureCampaignsTable()
  const slug = normalizeCampaignSlug(input.slug)
  if (!slug) throw new Error('invalid_slug')
  const name = String(input.name || '').trim().slice(0, 200)
  if (!name) throw new Error('name_required')
  // Only allow same-site relative targets — a campaign link must never become
  // an open redirect.
  let target = String(input.targetUrl || '/store').trim()
  if (!target.startsWith('/') || target.startsWith('//')) target = '/store'
  const row = await queryOne<CampaignRow>(
    `INSERT INTO campaigns (slug, name, target_url, notes) VALUES ($1,$2,$3,$4) RETURNING *`,
    [slug, name, target.slice(0, 500), input.notes ? String(input.notes).slice(0, 2000) : null]
  )
  if (!row) throw new Error('campaign_create_failed')
  return row
}

export async function setCampaignActive(id: string, isActive: boolean): Promise<void> {
  await ensureCampaignsTable()
  await query(`UPDATE campaigns SET is_active = $2 WHERE id = $1`, [id, isActive])
}

export async function deleteCampaign(id: string): Promise<void> {
  await ensureCampaignsTable()
  await query(`DELETE FROM campaigns WHERE id = $1`, [id])
}

export interface CampaignFunnelRow extends CampaignRow {
  visits: number
  unique_visitors: number
  chats: number
  project_items: number
  cart_adds: number
  inquiries: number
}

/** Campaign list + attributed funnel counts from lead_events. */
export async function listCampaignsWithFunnel(): Promise<CampaignFunnelRow[]> {
  await ensureCampaignsTable()
  const rows = await query<any>(`
    SELECT c.*,
      COALESCE(e.visits, 0)           AS visits,
      COALESCE(e.unique_visitors, 0)  AS unique_visitors,
      COALESCE(e.chats, 0)            AS chats,
      COALESCE(e.project_items, 0)    AS project_items,
      COALESCE(e.cart_adds, 0)        AS cart_adds,
      COALESCE(e.inquiries, 0)        AS inquiries
    FROM campaigns c
    LEFT JOIN (
      SELECT campaign_id,
        COUNT(*) FILTER (WHERE type = 'campaign_visit')                                    AS visits,
        COUNT(DISTINCT COALESCE(user_id::text, anon_id)) FILTER (WHERE type = 'campaign_visit') AS unique_visitors,
        COUNT(*) FILTER (WHERE type = 'assistant_chat')                                    AS chats,
        COUNT(*) FILTER (WHERE type = 'project_item_added')                                AS project_items,
        COUNT(*) FILTER (WHERE type = 'project_added_to_cart')                             AS cart_adds,
        COUNT(*) FILTER (WHERE type = 'inquiry_submitted')                                 AS inquiries
      FROM lead_events
      WHERE campaign_id IS NOT NULL
      GROUP BY campaign_id
    ) e ON e.campaign_id = c.slug
    ORDER BY c.created_at DESC
  `).catch(() => [])
  return rows.map((r: any) => ({
    ...r,
    visits: Number(r.visits) || 0,
    unique_visitors: Number(r.unique_visitors) || 0,
    chats: Number(r.chats) || 0,
    project_items: Number(r.project_items) || 0,
    cart_adds: Number(r.cart_adds) || 0,
    inquiries: Number(r.inquiries) || 0,
  }))
}
