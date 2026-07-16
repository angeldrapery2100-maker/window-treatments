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
import { LOCAL_SWATCH_FILES } from '@/lib/swatchManifest.generated'
import { uploadToR2 } from '@/lib/r2'

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

  // Flatten the catalog into parallel arrays and insert in ONE batched
  // statement per chunk. (The first version did 738 sequential INSERT
  // round-trips and got killed by the serverless timeout after ~24 rows.)
  const series: string[] = []
  const families: string[] = []
  const codes: string[] = []
  const categories: string[] = []
  const legacies: string[] = []
  const sorts: number[] = []
  const catalogCodes = new Set<string>()
  let sort = 0
  for (const fam of FABRIC_CATALOG) {
    for (const color of fam.colors) {
      const code = `${fam.code}-${color}`
      catalogCodes.add(code)
      sort++
      series.push(fam.series)
      families.push(fam.code)
      codes.push(code)
      categories.push(fam.category)
      legacies.push(JSON.stringify(fam.legacyCodes || []))
      sorts.push(sort)
    }
  }

  let inserted = 0
  const CHUNK = 250
  for (let i = 0; i < codes.length; i += CHUNK) {
    const res = await query<{ code: string }>(
      `INSERT INTO fabric_library (series, family, code, category, legacy_codes, sort_order)
       SELECT s, f, c, cat, l::jsonb, so
         FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::int[])
              AS t(s, f, c, cat, l, so)
       ON CONFLICT (code) DO NOTHING
       RETURNING code`,
      [
        series.slice(i, i + CHUNK),
        families.slice(i, i + CHUNK),
        codes.slice(i, i + CHUNK),
        categories.slice(i, i + CHUNK),
        legacies.slice(i, i + CHUNK),
        sorts.slice(i, i + CHUNK),
      ]
    )
    inserted += res.length
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

// ── Swatch image import from the AAPP app (Netlify) ─────────────────────────
// The AAPP web app ships the full swatch photo set at /Swatches/<folder>/
// <FULLCODE>.jpg (app-catalog.js SWATCH_FOLDERS; SWATCH_FILE_MAP is empty —
// filenames are exactly the code). We fetch each missing image server-side,
// re-host it on our R2 bucket (products/fabric-library/<code>.jpg) and set
// image_url. Batched (cursor + small limit) to stay inside the serverless
// timeout — the admin page loops until done.

const AAPP_APP_URL = () =>
  (process.env.AAPP_APP_URL || 'https://angeldraperyapp.netlify.app').replace(/\/$/, '')

const SWATCH_FOLDERS: Record<string, string> = {
  roller: 'Swatches/ Roller Shade swatch',
  zebra: 'Swatches/Zebra Shade swatchs',
  sheer: 'Swatches/Sheer Shade Swatch',
  roman: 'Swatches/Roman Shade Swatch',
}

// ── Local swatch fill (preferred, instant) ──────────────────────────────────
// The website itself ships professional swatch photos in apps/web/public:
//   roller-collection/swatches/MB1-001.jpg   (full code)
//   sheer-collection/swatches/E1-001.jpg     (full code)
//   luma-collection/swatches/DB1-1.jpg       (zebra, short color index)
// For any fabric row missing an image, point image_url straight at the
// static file — no fetching, no re-hosting. Roman has no local set and falls
// through to the AAPP (Netlify) fetch batches.

function localSwatchPath(series: string, family: string, code: string): string | null {
  if (series === 'roller') {
    const f = `${code}.jpg`
    return LOCAL_SWATCH_FILES.roller.includes(f) ? `/roller-collection/swatches/${f}` : null
  }
  if (series === 'sheer') {
    const f = `${code}.jpg`
    return LOCAL_SWATCH_FILES.sheer.includes(f) ? `/sheer-collection/swatches/${f}` : null
  }
  if (series === 'zebra') {
    const color = code.slice(family.length + 1) // "DB1-001" → "001"
    const f = `${family}-${parseInt(color, 10)}.jpg` // → "DB1-1.jpg"
    return LOCAL_SWATCH_FILES.zebra.includes(f) ? `/luma-collection/swatches/${f}` : null
  }
  if (series === 'roman') {
    const f = `${code}.jpg`
    return LOCAL_SWATCH_FILES.roman?.includes(f) ? `/roman-collection/swatches/${f}` : null
  }
  return null
}

/** One-shot: fill every missing image from the site's own public swatch files. */
export async function fillImagesFromLocalSwatches(): Promise<{ filled: number }> {
  await ensureFabricTable()
  const rows = await query<{ code: string; series: string; family: string }>(
    `SELECT code, series, family FROM fabric_library
      WHERE discontinued = false AND (image_url IS NULL OR image_url = '')`
  )
  const codes: string[] = []
  const urls: string[] = []
  for (const r of rows) {
    const p = localSwatchPath(r.series, r.family, r.code)
    if (p) { codes.push(r.code); urls.push(p) }
  }
  if (codes.length > 0) {
    await query(
      `UPDATE fabric_library fl SET image_url = t.url, updated_at = now()
         FROM unnest($1::text[], $2::text[]) AS t(code, url)
        WHERE fl.code = t.code`,
      [codes, urls]
    )
  }
  return { filled: codes.length }
}

export interface SwatchImportBatch {
  processed: number
  uploaded: number
  failed: string[]
  /** Pass back as `after` for the next call; null when finished. */
  nextCursor: string | null
  remaining: number
}

export async function importSwatchesBatch(afterCode: string, limit = 10): Promise<SwatchImportBatch> {
  await ensureFabricTable()
  const rows = await query<{ code: string; series: string }>(
    `SELECT code, series FROM fabric_library
      WHERE discontinued = false AND (image_url IS NULL OR image_url = '') AND code > $1
      ORDER BY code LIMIT $2`,
    [afterCode || '', limit]
  )
  const remainRow = await queryOne<{ n: string }>(
    `SELECT COUNT(*) AS n FROM fabric_library
      WHERE discontinued = false AND (image_url IS NULL OR image_url = '') AND code > $1`,
    [afterCode || '']
  )

  let uploaded = 0
  const failed: string[] = []
  for (const row of rows) {
    const folder = SWATCH_FOLDERS[row.series]
    if (!folder) { failed.push(row.code); continue }
    try {
      const url = `${AAPP_APP_URL()}/${encodeURI(folder)}/${encodeURIComponent(row.code)}.jpg`
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      const type = res.headers.get('content-type') || ''
      if (!res.ok || !type.startsWith('image/')) { failed.push(row.code); continue }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 100) { failed.push(row.code); continue }
      const hosted = await uploadToR2(`products/fabric-library/${row.code}.jpg`, buf, 'image/jpeg')
      await updateFabric(row.code, { image_url: hosted })
      uploaded++
    } catch {
      failed.push(row.code)
    }
  }

  const last = rows.length > 0 ? rows[rows.length - 1].code : null
  const remaining = Math.max(0, (Number(remainRow?.n) || 0) - rows.length)
  return {
    processed: rows.length,
    uploaded,
    failed,
    nextCursor: rows.length === limit ? last : null,
    remaining,
  }
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
