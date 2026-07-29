// Saved window measurement sheet (尺寸表) for the /measure-wizard page.
//
// Customers measure any number of windows; each becomes a card they can edit
// or delete, persisted server-side against the same identity pair the Home
// Project uses (signed-in user_id, or the ad_anon guest cookie), so the AI
// assistant can read the sheet with its list_measured_windows tool and the
// sheet follows a guest who later signs in (merge below).
//
// The wizard's计算结果 (recommended size / order size / shutter reference
// price) is snapshotted into `result` at save time for card display and AI
// reading; it is NOT a checkout price — reference only.

import { query, queryOne } from '@/lib/db'

let _ensured = false
export async function ensureWindowMeasurementsTable(): Promise<void> {
  if (_ensured) return
  await query(`CREATE TABLE IF NOT EXISTS measured_windows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    anon_id text,
    label text NOT NULL,
    kind text NOT NULL DEFAULT 'window',
    product text NOT NULL,
    config jsonb NOT NULL DEFAULT '{}',
    dims jsonb NOT NULL DEFAULT '{}',
    result jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_measured_windows_user ON measured_windows (user_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_measured_windows_anon ON measured_windows (anon_id)`)
  _ensured = true
}

export interface MeasuredWindowOwner {
  userId: string | null
  anonId: string | null
}

export interface MeasuredWindowRow {
  id: string
  label: string
  kind: string
  product: string
  config: any
  dims: any
  result: any
  created_at: string
  updated_at: string
}

const PRODUCTS = ['drapery', 'shades', 'shutters']
const KINDS = ['window', 'sliding_door', 'french_door']

function ownerWhere(owner: MeasuredWindowOwner): { clause: string; args: any[] } {
  if (owner.userId && owner.anonId) {
    return { clause: '(user_id = $1 OR anon_id = $2)', args: [owner.userId, owner.anonId] }
  }
  if (owner.userId) return { clause: 'user_id = $1', args: [owner.userId] }
  if (owner.anonId) return { clause: 'anon_id = $1', args: [owner.anonId] }
  return { clause: 'false', args: [] }
}

export async function listMeasuredWindows(owner: MeasuredWindowOwner): Promise<MeasuredWindowRow[]> {
  await ensureWindowMeasurementsTable()
  const { clause, args } = ownerWhere(owner)
  if (clause === 'false') return []
  return await query<MeasuredWindowRow>(
    `SELECT id, label, kind, product, config, dims, result, created_at, updated_at
       FROM measured_windows WHERE ${clause} ORDER BY created_at ASC LIMIT 100`,
    args
  )
}

/** Guest signs in → their anon-saved windows follow the account. */
export async function mergeAnonWindowsIntoUser(userId: string, anonId: string): Promise<void> {
  await ensureWindowMeasurementsTable()
  await query(
    `UPDATE measured_windows SET user_id = $1, updated_at = now() WHERE anon_id = $2 AND user_id IS NULL`,
    [userId, anonId]
  )
}

export interface SaveMeasuredWindowInput {
  id?: string // present = update
  label: string
  kind: string
  product: string
  config: Record<string, unknown>
  dims: Record<string, unknown>
  result: Record<string, unknown>
}

function sanitize(input: SaveMeasuredWindowInput): SaveMeasuredWindowInput | null {
  const label = String(input.label || '').trim().slice(0, 80)
  if (!label) return null
  const product = String(input.product || '')
  if (!PRODUCTS.includes(product)) return null
  const kind = KINDS.includes(String(input.kind)) ? String(input.kind) : 'window'
  const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})
  // Hard cap the JSON payloads so nobody can stuff megabytes into a row.
  const capped = (v: Record<string, unknown>) => (JSON.stringify(v).length > 4000 ? {} : v)
  return {
    id: input.id ? String(input.id) : undefined,
    label,
    kind,
    product,
    config: capped(obj(input.config)),
    dims: capped(obj(input.dims)),
    result: capped(obj(input.result)),
  }
}

export async function saveMeasuredWindow(
  owner: MeasuredWindowOwner,
  input: SaveMeasuredWindowInput
): Promise<MeasuredWindowRow | null> {
  await ensureWindowMeasurementsTable()
  const clean = sanitize(input)
  if (!clean) return null
  if (clean.id) {
    const { clause, args } = ownerWhere(owner)
    if (clause === 'false') return null
    const row = await queryOne<MeasuredWindowRow>(
      `UPDATE measured_windows
          SET label = $${args.length + 2}, kind = $${args.length + 3}, product = $${args.length + 4},
              config = $${args.length + 5}::jsonb, dims = $${args.length + 6}::jsonb,
              result = $${args.length + 7}::jsonb, updated_at = now()
        WHERE id = $${args.length + 1} AND ${clause}
        RETURNING id, label, kind, product, config, dims, result, created_at, updated_at`,
      [...args, clean.id, clean.label, clean.kind, clean.product, JSON.stringify(clean.config), JSON.stringify(clean.dims), JSON.stringify(clean.result)]
    )
    return row
  }
  // Cap sheet size per owner.
  const { clause, args } = ownerWhere(owner)
  if (clause === 'false') return null
  const countRow = await queryOne<{ n: string }>(`SELECT COUNT(*) AS n FROM measured_windows WHERE ${clause}`, args)
  if (Number(countRow?.n) >= 60) return null
  return await queryOne<MeasuredWindowRow>(
    `INSERT INTO measured_windows (user_id, anon_id, label, kind, product, config, dims, result)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb)
     RETURNING id, label, kind, product, config, dims, result, created_at, updated_at`,
    [owner.userId, owner.anonId, clean.label, clean.kind, clean.product, JSON.stringify(clean.config), JSON.stringify(clean.dims), JSON.stringify(clean.result)]
  )
}

export async function deleteMeasuredWindow(owner: MeasuredWindowOwner, id: string): Promise<boolean> {
  await ensureWindowMeasurementsTable()
  const { clause, args } = ownerWhere(owner)
  if (clause === 'false') return false
  const rows = await query<{ id: string }>(
    `DELETE FROM measured_windows WHERE id = $${args.length + 1} AND ${clause} RETURNING id`,
    [...args, String(id)]
  )
  return rows.length > 0
}
