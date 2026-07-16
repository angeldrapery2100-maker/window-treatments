// Home Project (整屋方案) — server-side data layer.
//
// A "home project" is a lightweight room-by-room plan a visitor builds with
// the AI sales consultant (and reviews at /store/project). Items are priced
// EXCLUSIVELY by the same server pricing engine checkout uses
// (computeServerUnitPrice) — the AI never invents or estimates numbers; an
// item the engine can't price is stored with quote_error and a human follows
// up. Guests are keyed by an anonymous cookie id (ad_anon) and their project
// is merged into their account the first time they're seen signed in.
//
// Tables self-provision (CREATE TABLE IF NOT EXISTS) like the rest of the
// codebase — no migration step.

import { randomUUID } from 'crypto'
import { query, queryOne } from '@/lib/db'
import { computeServerUnitPrice } from '@/lib/productPricing'

// ── Anonymous visitor identity (cookie) ──────────────────────────────────────

export const ANON_COOKIE = 'ad_anon'
/** 1 year — long enough to survive a normal shopping/consideration cycle. */
export const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function getAnonIdFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|;\s*)ad_anon=([A-Za-z0-9-]{8,64})/)
  return match ? match[1] : null
}

export function newAnonId(): string {
  return randomUUID()
}

// ── Tables ───────────────────────────────────────────────────────────────────

let _ensured = false
export async function ensureProjectTables(): Promise<void> {
  if (_ensured) return
  await query(`CREATE TABLE IF NOT EXISTS home_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    anon_id varchar(64),
    name varchar(200) NOT NULL DEFAULT 'My Home Project',
    status varchar(32) NOT NULL DEFAULT 'active',
    campaign_id varchar(64),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_home_projects_user ON home_projects(user_id)`).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_home_projects_anon ON home_projects(anon_id)`).catch(() => {})

  await query(`CREATE TABLE IF NOT EXISTS project_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    room_name varchar(120) NOT NULL DEFAULT '',
    product_id uuid,
    product_name varchar(256) NOT NULL DEFAULT '',
    product_type varchar(64) NOT NULL DEFAULT '',
    main_image_url text,
    width numeric,
    height numeric,
    width_fraction varchar(16),
    height_fraction varchar(16),
    options jsonb NOT NULL DEFAULT '{}',
    options_display jsonb NOT NULL DEFAULT '[]',
    quantity int NOT NULL DEFAULT 1,
    quoted_price numeric,
    quote_error text,
    quote_history jsonb NOT NULL DEFAULT '[]',
    notes text,
    sort_order int NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_project_items_project ON project_items(project_id)`).catch(() => {})

  await query(`CREATE TABLE IF NOT EXISTS lead_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    anon_id varchar(64),
    project_id uuid,
    type varchar(64) NOT NULL,
    value numeric,
    meta jsonb NOT NULL DEFAULT '{}',
    campaign_id varchar(64),
    created_at timestamptz DEFAULT now()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_lead_events_anon ON lead_events(anon_id, created_at)`).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_lead_events_user ON lead_events(user_id, created_at)`).catch(() => {})
  _ensured = true
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface HomeProjectRow {
  id: string
  user_id: string | null
  anon_id: string | null
  name: string
  status: string
  campaign_id: string | null
  created_at: string
  updated_at: string
}

export interface ProjectItemDisplayOption {
  name: string
  displayLabel: string
  value: string
  valueLabel: string
}

export interface ProjectItemRow {
  id: string
  project_id: string
  room_name: string
  product_id: string | null
  product_name: string
  product_type: string
  main_image_url: string | null
  width: string | number | null
  height: string | number | null
  width_fraction: string | null
  height_fraction: string | null
  options: Record<string, string>
  options_display: ProjectItemDisplayOption[]
  quantity: number
  quoted_price: string | number | null
  quote_error: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProjectOwner {
  userId?: string | null
  anonId?: string | null
}

// ── Project lookup / creation / merge ────────────────────────────────────────

export async function getActiveProject(owner: ProjectOwner): Promise<HomeProjectRow | null> {
  await ensureProjectTables()
  if (owner.userId) {
    const byUser = await queryOne<HomeProjectRow>(
      `SELECT * FROM home_projects WHERE user_id = $1 AND status = 'active' ORDER BY updated_at DESC LIMIT 1`,
      [owner.userId]
    )
    if (byUser) return byUser
  }
  if (owner.anonId) {
    return queryOne<HomeProjectRow>(
      `SELECT * FROM home_projects WHERE anon_id = $1 AND user_id IS NULL AND status = 'active' ORDER BY updated_at DESC LIMIT 1`,
      [owner.anonId]
    )
  }
  return null
}

export async function getOrCreateActiveProject(owner: ProjectOwner, campaignId?: string | null): Promise<HomeProjectRow> {
  const existing = await getActiveProject(owner)
  if (existing) return existing
  if (!owner.userId && !owner.anonId) throw new Error('project_owner_required')
  const row = await queryOne<HomeProjectRow>(
    `INSERT INTO home_projects (user_id, anon_id, campaign_id) VALUES ($1, $2, $3) RETURNING *`,
    [owner.userId ?? null, owner.userId ? null : owner.anonId ?? null, campaignId ?? null]
  )
  if (!row) throw new Error('project_create_failed')
  return row
}

/**
 * Attach a guest's anonymous project to their account. Called lazily whenever
 * a request carries BOTH a session user and an anon cookie. If the account
 * already has an active project, the anon project's items are moved into it
 * (append) and the anon project is marked 'merged'; otherwise the anon project
 * is simply claimed by the user. Idempotent and best-effort.
 */
export async function mergeAnonProjectIntoUser(userId: string, anonId: string): Promise<void> {
  await ensureProjectTables()
  const anonProject = await queryOne<HomeProjectRow>(
    `SELECT * FROM home_projects WHERE anon_id = $1 AND user_id IS NULL AND status = 'active' ORDER BY updated_at DESC LIMIT 1`,
    [anonId]
  )
  if (!anonProject) return
  const userProject = await queryOne<HomeProjectRow>(
    `SELECT * FROM home_projects WHERE user_id = $1 AND status = 'active' ORDER BY updated_at DESC LIMIT 1`,
    [userId]
  )
  if (!userProject) {
    await query(`UPDATE home_projects SET user_id = $1, updated_at = now() WHERE id = $2`, [userId, anonProject.id])
    return
  }
  // Both exist → move items over, keep the account project's name.
  const base = await queryOne<{ m: number }>(
    `SELECT COALESCE(MAX(sort_order), 0) AS m FROM project_items WHERE project_id = $1`,
    [userProject.id]
  )
  await query(
    `UPDATE project_items SET project_id = $1, sort_order = sort_order + $2, updated_at = now() WHERE project_id = $3`,
    [userProject.id, Number(base?.m) || 0, anonProject.id]
  )
  await query(`UPDATE home_projects SET status = 'merged', updated_at = now() WHERE id = $1`, [anonProject.id])
}

export async function renameProject(projectId: string, name: string): Promise<void> {
  const clean = String(name || '').trim().slice(0, 200)
  if (!clean) return
  await query(`UPDATE home_projects SET name = $1, updated_at = now() WHERE id = $2`, [clean, projectId])
}

// ── Items ────────────────────────────────────────────────────────────────────

export async function listItems(projectId: string): Promise<ProjectItemRow[]> {
  await ensureProjectTables()
  return query<ProjectItemRow>(
    `SELECT * FROM project_items WHERE project_id = $1 ORDER BY room_name, sort_order, created_at`,
    [projectId]
  )
}

export async function getItem(projectId: string, itemId: string): Promise<ProjectItemRow | null> {
  return queryOne<ProjectItemRow>(
    `SELECT * FROM project_items WHERE id = $1 AND project_id = $2`,
    [itemId, projectId]
  )
}

export interface UpsertItemInput {
  itemId?: string | null
  roomName?: string
  productId: string
  width?: number | null
  height?: number | null
  widthFraction?: string | null
  heightFraction?: string | null
  options?: Record<string, string> | null
  quantity?: number
  notes?: string | null
}

const num = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

// Map the raw option selections {name: value} to display labels using the
// product's option config, producing the exact CartItemOption[] shape lib/cart
// expects — so /store/project can hand items to the cart without re-fetching
// product configs client-side.
function buildOptionsDisplay(cfgOptions: any[], sel: Record<string, string>): ProjectItemDisplayOption[] {
  const out: ProjectItemDisplayOption[] = []
  for (const [name, value] of Object.entries(sel)) {
    const opt = (cfgOptions || []).find((o: any) => o?.name === name)
    const val = opt?.values?.find((v: any) => String(v?.value) === String(value))
    out.push({
      name,
      displayLabel: String(opt?.label || opt?.display_label || name),
      value: String(value),
      valueLabel: String(val?.label || value),
    })
  }
  return out
}

export interface UpsertItemResult {
  item: ProjectItemRow
  priced: boolean
}

/**
 * Add or update a project item, then price it with the SAME server engine
 * checkout uses. Never throws on an unpriceable configuration — the item is
 * saved with quote_error so a human can follow up (and the AI is told to say
 * exactly that). Throws only on unknown product / bad input.
 */
export async function upsertItem(projectId: string, input: UpsertItemInput): Promise<UpsertItemResult> {
  await ensureProjectTables()

  const productId = String(input.productId || '').trim()
  if (!/^[0-9a-f-]{36}$/i.test(productId)) throw new Error('invalid_product_id')

  const product = await queryOne<{ id: string; name: string; base_price: string; default_config: any; type: string }>(
    `SELECT p.id, p.name, p.base_price, p.default_config, pt.slug AS type
       FROM products p JOIN product_types pt ON pt.id = p.product_type_id
      WHERE p.id = $1 AND p.is_active = true`,
    [productId]
  )
  if (!product) throw new Error('product_not_found')

  const cfg = product.default_config || {}
  const mainImage = cfg?.images?.main?.[0]?.url ?? null

  // Sanitize selections to plain string→string.
  const sel: Record<string, string> = {}
  if (input.options && typeof input.options === 'object' && !Array.isArray(input.options)) {
    for (const [k, v] of Object.entries(input.options)) {
      if (typeof k === 'string' && k.length <= 64 && (typeof v === 'string' || typeof v === 'number')) {
        sel[k] = String(v).slice(0, 128)
      }
    }
  }

  const width = num(input.width)
  const height = num(input.height)
  const widthFraction = input.widthFraction ? String(input.widthFraction).slice(0, 16) : null
  const heightFraction = input.heightFraction ? String(input.heightFraction).slice(0, 16) : null
  const quantity = Math.max(1, Math.min(99, Math.round(Number(input.quantity)) || 1))
  const roomName = String(input.roomName ?? '').trim().slice(0, 120)
  const notes = input.notes ? String(input.notes).trim().slice(0, 2000) : null

  // ── Price via the server engine (fail-soft: store the error, never invent) ─
  let quoted: number | null = null
  let quoteError: string | null = null
  if (product.type === 'accessory') {
    const bp = Math.round(Number(product.base_price) || 0)
    if (bp > 0) quoted = bp
    else quoteError = 'accessory has no base price configured'
  } else {
    try {
      const priced = await computeServerUnitPrice({
        productId,
        width: width ?? undefined,
        height: height ?? undefined,
        widthFraction: widthFraction ?? undefined,
        heightFraction: heightFraction ?? undefined,
        options: sel,
      })
      quoted = priced.unitPrice
    } catch (e: any) {
      quoteError = String(e?.message || 'could not price this configuration').slice(0, 500)
    }
  }

  const optionsDisplay = buildOptionsDisplay(cfg.options || [], sel)
  const historyEntry = JSON.stringify([{ at: new Date().toISOString(), price: quoted, error: quoteError }])

  let row: ProjectItemRow | null = null
  if (input.itemId) {
    row = await queryOne<ProjectItemRow>(
      `UPDATE project_items SET
         room_name = COALESCE(NULLIF($2, ''), room_name),
         product_id = $3, product_name = $4, product_type = $5, main_image_url = $6,
         width = $7, height = $8, width_fraction = $9, height_fraction = $10,
         options = $11::jsonb, options_display = $12::jsonb, quantity = $13,
         quoted_price = $14, quote_error = $15,
         quote_history = quote_history || $16::jsonb,
         notes = COALESCE($17, notes), updated_at = now()
       WHERE id = $1 AND project_id = $18
       RETURNING *`,
      [
        input.itemId, roomName, productId, product.name, product.type, mainImage,
        width, height, widthFraction, heightFraction,
        JSON.stringify(sel), JSON.stringify(optionsDisplay), quantity,
        quoted, quoteError, historyEntry, notes, projectId,
      ]
    )
    if (!row) throw new Error('item_not_found')
  } else {
    const base = await queryOne<{ m: number }>(
      `SELECT COALESCE(MAX(sort_order), 0) AS m FROM project_items WHERE project_id = $1`,
      [projectId]
    )
    row = await queryOne<ProjectItemRow>(
      `INSERT INTO project_items
         (project_id, room_name, product_id, product_name, product_type, main_image_url,
          width, height, width_fraction, height_fraction,
          options, options_display, quantity, quoted_price, quote_error, quote_history, notes, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13,$14,$15,$16::jsonb,$17,$18)
       RETURNING *`,
      [
        projectId, roomName, productId, product.name, product.type, mainImage,
        width, height, widthFraction, heightFraction,
        JSON.stringify(sel), JSON.stringify(optionsDisplay), quantity,
        quoted, quoteError, historyEntry, notes, (Number(base?.m) || 0) + 1,
      ]
    )
    if (!row) throw new Error('item_create_failed')
  }

  await query(`UPDATE home_projects SET updated_at = now() WHERE id = $1`, [projectId]).catch(() => {})
  return { item: row, priced: quoted != null }
}

export async function updateItemQuantity(projectId: string, itemId: string, quantity: number): Promise<ProjectItemRow | null> {
  const q = Math.max(1, Math.min(99, Math.round(Number(quantity)) || 1))
  return queryOne<ProjectItemRow>(
    `UPDATE project_items SET quantity = $3, updated_at = now() WHERE id = $1 AND project_id = $2 RETURNING *`,
    [itemId, projectId, q]
  )
}

export async function removeItem(projectId: string, itemId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM project_items WHERE id = $1 AND project_id = $2 RETURNING id`,
    [itemId, projectId]
  )
  if (rows.length > 0) {
    await query(`UPDATE home_projects SET updated_at = now() WHERE id = $1`, [projectId]).catch(() => {})
    return true
  }
  return false
}

// ── Summary / lead events ────────────────────────────────────────────────────

export interface ProjectSummary {
  itemCount: number
  pricedSubtotal: number
  unpricedCount: number
  rooms: string[]
}

export function projectSummary(items: ProjectItemRow[]): ProjectSummary {
  let pricedSubtotal = 0
  let unpricedCount = 0
  const rooms = new Set<string>()
  for (const it of items) {
    rooms.add(it.room_name || '')
    const p = Number(it.quoted_price)
    if (Number.isFinite(p) && p > 0) pricedSubtotal += p * (Number(it.quantity) || 1)
    else unpricedCount++
  }
  return {
    itemCount: items.length,
    pricedSubtotal: Math.round(pricedSubtotal),
    unpricedCount,
    rooms: [...rooms].filter(Boolean),
  }
}

export interface LeadEventInput {
  userId?: string | null
  anonId?: string | null
  projectId?: string | null
  type: string
  value?: number | null
  meta?: Record<string, unknown> | null
  campaignId?: string | null
}

/** Best-effort behavioral event log (P2 lead scoring reads these). Never throws. */
export async function logLeadEvent(ev: LeadEventInput): Promise<void> {
  try {
    await ensureProjectTables()
    await query(
      `INSERT INTO lead_events (user_id, anon_id, project_id, type, value, meta, campaign_id)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`,
      [
        ev.userId ?? null,
        ev.anonId ?? null,
        ev.projectId ?? null,
        String(ev.type).slice(0, 64),
        ev.value ?? null,
        JSON.stringify(ev.meta ?? {}),
        ev.campaignId ?? null,
      ]
    )
  } catch {
    /* logging must never break the request */
  }
}
