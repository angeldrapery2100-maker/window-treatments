import { query } from '@/lib/db'

/**
 * Drapery designs a visitor has saved from /design.
 *
 * A design is NOT a store product — it has no SKU, it is priced through AAPP
 * rather than the checkout engine, and it may reference a fabric we cannot
 * quote at all. So it gets its own table rather than being forced into
 * home_project_items, which exists to carry things that can go in a cart.
 *
 * Identity is the same pair as the measurement sheet and the Home Project:
 * the signed-in user when there is one, the `ad_anon` cookie otherwise, and
 * both are accepted at read time so a design saved before signing in is still
 * there afterwards.
 *
 * The estimate is stored as a SNAPSHOT of what the customer was shown, and is
 * never recomputed for display — if AAPP's prices move, the consultant should
 * see the number the customer saw, alongside the date it was quoted.
 */

let _ensured = false

export async function ensureSavedDesignsTable(): Promise<void> {
  if (_ensured) return
  await query(`CREATE TABLE IF NOT EXISTS saved_designs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    anon_id text,
    label text NOT NULL,
    window_id uuid,
    config jsonb NOT NULL DEFAULT '{}',
    summary jsonb NOT NULL DEFAULT '{}',
    estimate jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_saved_designs_user ON saved_designs (user_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_saved_designs_anon ON saved_designs (anon_id)`)
  _ensured = true
}

export interface SavedDesignOwner {
  userId: string | null
  anonId: string | null
}

export interface SavedDesignRow {
  id: string
  label: string
  window_id: string | null
  config: Record<string, unknown>
  summary: Record<string, unknown>
  estimate: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

const MAX_PER_OWNER = 40

function ownerWhere(owner: SavedDesignOwner): { clause: string; args: unknown[] } {
  if (owner.userId && owner.anonId) return { clause: '(user_id = $1 OR anon_id = $2)', args: [owner.userId, owner.anonId] }
  if (owner.userId) return { clause: 'user_id = $1', args: [owner.userId] }
  if (owner.anonId) return { clause: 'anon_id = $1', args: [owner.anonId] }
  return { clause: 'false', args: [] }
}

export async function listSavedDesigns(owner: SavedDesignOwner): Promise<SavedDesignRow[]> {
  await ensureSavedDesignsTable()
  const { clause, args } = ownerWhere(owner)
  if (clause === 'false') return []
  return await query<SavedDesignRow>(
    `SELECT id, label, window_id, config, summary, estimate, created_at, updated_at
       FROM saved_designs WHERE ${clause} ORDER BY created_at ASC LIMIT ${MAX_PER_OWNER}`,
    args
  )
}

export async function getSavedDesign(owner: SavedDesignOwner, id: string): Promise<SavedDesignRow | null> {
  await ensureSavedDesignsTable()
  const { clause, args } = ownerWhere(owner)
  if (clause === 'false') return null
  const rows = await query<SavedDesignRow>(
    `SELECT id, label, window_id, config, summary, estimate, created_at, updated_at
       FROM saved_designs WHERE ${clause} AND id = $${args.length + 1} LIMIT 1`,
    [...args, id]
  )
  return rows[0] || null
}

export interface SaveDesignInput {
  id?: string | null
  label: string
  windowId?: string | null
  config: Record<string, unknown>
  summary: Record<string, unknown>
  estimate?: Record<string, unknown> | null
}

export async function saveDesign(owner: SavedDesignOwner, input: SaveDesignInput): Promise<SavedDesignRow | null> {
  await ensureSavedDesignsTable()
  const label = String(input.label || '').trim().slice(0, 80) || 'Untitled window'
  const windowId = input.windowId && /^[0-9a-f-]{36}$/i.test(input.windowId) ? input.windowId : null

  if (input.id) {
    const existing = await getSavedDesign(owner, input.id)
    if (!existing) return null
    const rows = await query<SavedDesignRow>(
      `UPDATE saved_designs
          SET label = $1, window_id = $2, config = $3::jsonb, summary = $4::jsonb,
              estimate = $5::jsonb, updated_at = now()
        WHERE id = $6
        RETURNING id, label, window_id, config, summary, estimate, created_at, updated_at`,
      [label, windowId, JSON.stringify(input.config), JSON.stringify(input.summary),
       input.estimate ? JSON.stringify(input.estimate) : null, input.id]
    )
    return rows[0] || null
  }

  // A shortlist, not a filing cabinet — refuse rather than let one visitor
  // fill the table.
  const { clause, args } = ownerWhere(owner)
  if (clause === 'false') return null
  const [{ n }] = await query<{ n: string }>(`SELECT COUNT(*)::int AS n FROM saved_designs WHERE ${clause}`, args)
  if (Number(n) >= MAX_PER_OWNER) return null

  const rows = await query<SavedDesignRow>(
    `INSERT INTO saved_designs (user_id, anon_id, label, window_id, config, summary, estimate)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb)
     RETURNING id, label, window_id, config, summary, estimate, created_at, updated_at`,
    [owner.userId, owner.anonId, label, windowId,
     JSON.stringify(input.config), JSON.stringify(input.summary),
     input.estimate ? JSON.stringify(input.estimate) : null]
  )
  return rows[0] || null
}

export async function deleteSavedDesign(owner: SavedDesignOwner, id: string): Promise<boolean> {
  await ensureSavedDesignsTable()
  const { clause, args } = ownerWhere(owner)
  if (clause === 'false') return false
  const rows = await query<{ id: string }>(
    `DELETE FROM saved_designs WHERE ${clause} AND id = $${args.length + 1} RETURNING id`,
    [...args, id]
  )
  return rows.length > 0
}

/** Same merge the measurement sheet does when an anonymous visitor signs in. */
export async function mergeAnonDesignsIntoUser(userId: string, anonId: string): Promise<void> {
  await ensureSavedDesignsTable()
  await query(`UPDATE saved_designs SET user_id = $1 WHERE anon_id = $2 AND user_id IS NULL`, [userId, anonId])
}
