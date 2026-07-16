// Fabric library (面料库) — the single fabric registry for Luma-series shades
// (roller / zebra / sheer / roman). One row per COLORWAY (full code like
// "ME2-002"): code · image · display name · hardware (cassette) color.
//
// Design (Eddie, 2026-07-16): AAPP's SWATCH_FABRIC_TABLES is the authoritative
// family/color catalog (extracted into fabricCatalog.generated.ts); this table
// enriches it with the fields AAPP lacks — display name, image, hardware
// color. It is the foundation ("底座") for the AAPP library sync (P②→①) and
// for product fabric binding; prices stay in AAPP and arrive via sync later
// (price_per_sqm column reserved).
//
// Rules:
// - Customer-facing surfaces show IMAGE + NAME only; the CODE is for ordering
//   (work orders, factory POs) and admin.
// - Hardware colors are the cassette colors used by AAPP work orders:
//   white / grey / beige / brown / black.
// - syncFabricCatalog(): inserts codes newly present in the generated catalog
//   and marks vanished codes discontinued (never deletes — history stays).

import { query, queryOne } from '@/lib/db'
import { FABRIC_CATALOG } from '@/lib/fabricCatalog.generated'

export const HARDWARE_COLORS = ['white', 'grey', 'beige', 'brown', 'black'] as const
export type HardwareColor = (typeof HARDWARE_COLORS)[number]

export const FABRIC_SERIES = ['roller', 'zebra', 'sheer', 'roman'] as const

export interface FabricRow {
  id: string
  series: string
  family: string
  code: string
  category: string
  name: string
  hardware_color: string
  image_url: string | null
  price_per_sqm: string | number | null
  is_active: boolean
  discontinued: boolean
  legacy_codes: string[]
  sort_order: number
  created_at: string
  updated_at: string
}

let _ensured = false
export async function ensureFabricTable(): Promise<void> {
  if (_ensured) return
  await query(`CREATE TABLE IF NOT EXISTS fabric_library (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    series varchar(16) NOT NULL,
    family varchar(16) NOT NULL,
    code varchar(32) NOT NULL UNIQUE,
    category varchar(32) NOT NULL DEFAULT '',
    name varchar(200) NOT NULL DEFAULT '',
    hardware_color varchar(16) NOT NULL DEFAULT '',
    image_url text,
    price_per_sqm numeric,
    is_active boolean NOT NULL DEFAULT true,
    discontinued boolean NOT NULL DEFAULT false,
    legacy_codes jsonb NOT NULL DEFAULT '[]',
    sort_order int NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_fabric_library_series ON fabric_library(series, family)`).catch(() => {})
  _ensured = true
}

/**
 * Diff the generated catalog into the table.
 * - Insert colorways not present yet (code = FAMILY-COLOR).
 * - Un-discontinue codes that came back.
 * - Mark codes missing from the catalog as discontinued (kept, never deleted).
 * Returns counts for the admin sync report.
 */
export async function syncFabricCatalog(): Promise<{ inserted: number; discontinued: number; restored: number; total: number }> {
  await ensureFabricTable()

  const catalogCodes = new Set<string>()
  let inserted = 0
  let sort = 0
  for (const fam of FABRIC_CATALOG) {
    for (const color of fam.colors) {
      const code = `${fam.code}-${color}`
      catalogCodes.add(code)
      sort++
      const res = await query<{ id: string }>(
        `INSERT INTO fabric_library (series, family, code, category, legacy_codes, sort_order)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6)
         ON CONFLICT (code) DO NOTHING
         RETURNING id`,
        [fam.series, fam.code, code, fam.category, JSON.stringify(fam.legacyCodes || []), sort]
      )
      if (res.length > 0) inserted++
    }
  }

  // Restore codes that reappeared in the catalog.
  const restoredRows = await query<{ code: string }>(
    `UPDATE fabric_library SET discontinued = false, updated_at = now()
      WHERE discontinued = true AND code = ANY($1) RETURNING code`,
    [[...catalogCodes]]
  )

  // Codes in the table but no longer in the catalog → discontinued.
  const discontinuedRows = await query<{ code: string }>(
    `UPDATE fabric_library SET discontinued = true, is_active = false, updated_at = now()
      WHERE discontinued = false AND NOT (code = ANY($1)) RETURNING code`,
    [[...catalogCodes]]
  )

  const totalRow = await queryOne<{ n: string }>(`SELECT COUNT(*) AS n FROM fabric_library`)
  return {
    inserted,
    discontinued: discontinuedRows.length,
    restored: restoredRows.length,
    total: Number(totalRow?.n) || 0,
  }
}

export async function listFabrics(filter?: { series?: string; category?: string; q?: string }): Promise<FabricRow[]> {
  await ensureFabricTable()
  const conds: string[] = []
  const args: any[] = []
  if (filter?.series && (FABRIC_SERIES as readonly string[]).includes(filter.series)) {
    args.push(filter.series)
    conds.push(`series = $${args.length}`)
  }
  if (filter?.category) {
    args.push(filter.category)
    conds.push(`category = $${args.length}`)
  }
  if (filter?.q) {
    args.push(`%${filter.q.trim()}%`)
    conds.push(`(code ILIKE $${args.length} OR name ILIKE $${args.length} OR family ILIKE $${args.length})`)
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
  return query<FabricRow>(
    `SELECT * FROM fabric_library ${where} ORDER BY series, sort_order, code`,
    args
  )
}

export interface FabricPatch {
  name?: string
  hardware_color?: string
  image_url?: string | null
  is_active?: boolean
}

export async function updateFabric(code: string, patch: FabricPatch): Promise<FabricRow | null> {
  await ensureFabricTable()
  const sets: string[] = []
  const args: any[] = [code]
  if (patch.name !== undefined) {
    args.push(String(patch.name).trim().slice(0, 200))
    sets.push(`name = $${args.length}`)
  }
  if (patch.hardware_color !== undefined) {
    const hc = String(patch.hardware_color).toLowerCase()
    args.push((HARDWARE_COLORS as readonly string[]).includes(hc) ? hc : '')
    sets.push(`hardware_color = $${args.length}`)
  }
  if (patch.image_url !== undefined) {
    args.push(patch.image_url ? String(patch.image_url).slice(0, 1000) : null)
    sets.push(`image_url = $${args.length}`)
  }
  if (patch.is_active !== undefined) {
    args.push(patch.is_active === true)
    sets.push(`is_active = $${args.length}`)
  }
  if (sets.length === 0) return queryOne<FabricRow>(`SELECT * FROM fabric_library WHERE code = $1`, [code])
  return queryOne<FabricRow>(
    `UPDATE fabric_library SET ${sets.join(', ')}, updated_at = now() WHERE code = $1 RETURNING *`,
    args
  )
}

/** Bulk: set hardware color for every colorway in a family (per-row override still possible after). */
export async function setFamilyHardwareColor(family: string, hardwareColor: string): Promise<number> {
  await ensureFabricTable()
  const hc = String(hardwareColor).toLowerCase()
  if (!(HARDWARE_COLORS as readonly string[]).includes(hc) && hc !== '') return 0
  const rows = await query<{ code: string }>(
    `UPDATE fabric_library SET hardware_color = $2, updated_at = now() WHERE family = $1 RETURNING code`,
    [family, hc]
  )
  return rows.length
}

/**
 * Pull images + display names from the store's existing Luma/shade products:
 * scan every active product's fabric option values, match value or label text
 * against a full fabric code (normalized "ME2-002"), and fill image_url/name
 * where the library row is still empty. Never overwrites what Eddie already
 * set by hand.
 */
export async function importFromProducts(): Promise<{ matchedImages: number; matchedNames: number; scannedValues: number }> {
  await ensureFabricTable()
  const products = await query<{ id: string; name: string; default_config: any }>(
    `SELECT p.id, p.name, p.default_config
       FROM products p JOIN product_types pt ON pt.id = p.product_type_id
      WHERE p.is_active = true AND pt.slug IN ('shade', 'sheer')`
  ).catch(() => [])

  // code lookup, normalized: uppercase, unify separators.
  const rows = await query<{ code: string; name: string; image_url: string | null }>(
    `SELECT code, name, image_url FROM fabric_library`
  )
  const byNorm = new Map<string, { code: string; hasName: boolean; hasImage: boolean }>()
  const norm = (s: string) => s.toUpperCase().replace(/[\s_/]+/g, '-').replace(/-+/g, '-')
  for (const r of rows) byNorm.set(norm(r.code), { code: r.code, hasName: !!r.name, hasImage: !!r.image_url })

  const CODE_RE = /[A-Z]{2,3}\d{1,2}-\d{3}/g

  let matchedImages = 0
  let matchedNames = 0
  let scannedValues = 0
  for (const p of products) {
    const options: any[] = p.default_config?.options || []
    for (const opt of options) {
      if (!/fabric|color/i.test(String(opt?.name || ''))) continue
      for (const v of opt.values || []) {
        scannedValues++
        const hay = norm(`${v?.value ?? ''} ${v?.label ?? ''}`)
        const m = hay.match(CODE_RE)
        if (!m) continue
        const hit = byNorm.get(m[0])
        if (!hit) continue
        const img = v?.params?.image_url || v?.image_url || null
        const label = String(v?.label || '').trim()
        // Name candidate: the label minus the code text itself.
        const cleanName = label.replace(/[A-Za-z]{2,3}\d{1,2}[-\s]?\d{3}/g, '').replace(/[()·—-]+/g, ' ').trim()
        if (img && !hit.hasImage) {
          await updateFabric(hit.code, { image_url: String(img) })
          hit.hasImage = true
          matchedImages++
        }
        if (cleanName && !hit.hasName) {
          await updateFabric(hit.code, { name: cleanName.slice(0, 200) })
          hit.hasName = true
          matchedNames++
        }
      }
    }
  }
  return { matchedImages, matchedNames, scannedValues }
}
