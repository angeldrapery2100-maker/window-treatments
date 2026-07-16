// AAPP library sync (①) — pulls pricing-library slices from the AAPP
// libraryExport Cloud Function (read-only, secret-protected) and snapshots
// them locally, so store pricing follows AAPP without manual re-entry.
//
// What arrives (see AAPP proposal doc):
//   shadeCatalog.fabrics   — per series (roller/zebra/sheer/roman), rows
//                            { code: FAMILY, pricePerSqm } — price per FAMILY.
//   shadeCatalog.variants  — cassettes ($/m), size limits, labels.
//   shadeCatalog.options   — option surcharges (chain / cordless / …).
//   lumaMotorSystem        — Luma motors/remotes pricing.
//   draperyPricingCatalog  — lining tiers, labor, style ratios.
//   draperyFabricCatalogOverrides — drapery fabric price overrides.
//
// Storage: single-row snapshot table (aapp_library, id=1). Fabric family
// prices are ALSO propagated into fabric_library.price_per_sqm so the admin
// fabric page shows them. Sync is manual (admin button) — never automatic
// writes back to AAPP.

import { query, queryOne } from '@/lib/db'
import { ensureFabricTable } from '@/lib/fabricLibrary'

const EXPORT_URL = () =>
  process.env.AAPP_LIBRARY_EXPORT_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/libraryExport'

let _ensured = false
export async function ensureAappLibraryTable(): Promise<void> {
  if (_ensured) return
  await query(`CREATE TABLE IF NOT EXISTS aapp_library (
    id int PRIMARY KEY,
    data jsonb NOT NULL DEFAULT '{}',
    exported_at timestamptz,
    synced_at timestamptz DEFAULT now()
  )`)
  _ensured = true
}

export interface AappLibrarySnapshot {
  data: any
  exported_at: string | null
  synced_at: string | null
}

let _memo: { at: number; snap: AappLibrarySnapshot | null } | null = null
const MEMO_TTL = 60_000

export async function getAappLibrary(): Promise<AappLibrarySnapshot | null> {
  if (_memo && Date.now() - _memo.at < MEMO_TTL) return _memo.snap
  await ensureAappLibraryTable()
  const row = await queryOne<AappLibrarySnapshot>(
    `SELECT data, exported_at, synced_at FROM aapp_library WHERE id = 1`
  )
  _memo = { at: Date.now(), snap: row }
  return row
}

export function invalidateAappLibraryMemo(): void {
  _memo = null
}

export interface SyncReport {
  exportedAt: string | null
  fabricFamiliesPriced: number
  colorwaysPriced: number
  /** Colorways discontinued because their family vanished from the AAPP live library. */
  colorwaysDiscontinued: number
  /** Colorways restored because their family reappeared in the AAPP live library. */
  colorwaysRestored: number
  hasShadeCatalog: boolean
  hasLumaMotors: boolean
  hasDraperyCatalog: boolean
}

/**
 * Pull the AAPP libraryExport feed, snapshot it, and propagate per-family
 * fabric prices into fabric_library.price_per_sqm. Throws with a
 * human-readable message on config/auth/network problems (the admin route
 * surfaces it verbatim).
 */
export async function syncAappLibrary(): Promise<SyncReport> {
  const secret = process.env.AAPP_WEBEXPORT_SECRET
  if (!secret) throw new Error('AAPP_WEBEXPORT_SECRET 未配置(Vercel 环境变量)')

  let res: Response
  try {
    res = await fetch(EXPORT_URL(), {
      headers: { 'x-ad-key': secret },
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    throw new Error('无法连接 AAPP 导出接口(网络或函数未部署)')
  }
  if (res.status === 403) throw new Error('密钥不匹配(Vercel 与 Firestore aiConfig/webExport 需一致)')
  if (res.status === 503) throw new Error('AAPP 侧未配置导出密钥(aiConfig/webExport.secret)')
  if (!res.ok) throw new Error(`导出接口返回 ${res.status}`)

  const payload: any = await res.json().catch(() => null)
  if (!payload || payload.ok !== true || !payload.data) throw new Error('导出接口返回了无效数据')
  const data = payload.data

  await ensureAappLibraryTable()
  await query(
    `INSERT INTO aapp_library (id, data, exported_at, synced_at)
     VALUES (1, $1::jsonb, $2, now())
     ON CONFLICT (id) DO UPDATE SET data = $1::jsonb, exported_at = $2, synced_at = now()`,
    [JSON.stringify(data), payload.exportedAt ?? null]
  )
  invalidateAappLibraryMemo()

  // ── Propagate per-family $/sqm into fabric_library ─────────────────────────
  // v810 (2026-07-16): the AAPP fabric tables hold FACTORY NET prices and the
  // feed ships shadeCatalog.fabricMarkup (sell = net × mult + addPerSqm).
  // fabric_library stores the SELL price (what admin/binding display).
  // A feed with fabrics but no fabricMarkup means the AAPP-side libraryExport
  // function predates v810 — fail closed, or we'd record净价当售价.
  const fabricsBySeries: Record<string, any[]> = data.shadeCatalog?.fabrics || {}
  const markup: Record<string, { mult?: number; addPerSqm?: number }> | null =
    data.shadeCatalog?.fabricMarkup && typeof data.shadeCatalog.fabricMarkup === 'object'
      ? data.shadeCatalog.fabricMarkup
      : null
  if (Object.keys(fabricsBySeries).length > 0 && !markup) {
    throw new Error(
      'AAPP 导出数据缺少 fabricMarkup(v810 出厂价模型)— 请先重新部署 AAPP 导出函数:firebase deploy --only functions:libraryExport'
    )
  }
  const toSell = (series: string, net: number): number => {
    const mk = markup?.[series]
    const mult = Number(mk?.mult)
    if (!Number.isFinite(mult) || mult <= 0) return net
    return Math.round((net * mult + (Number(mk?.addPerSqm) || 0)) * 100) / 100
  }

  await ensureFabricTable()
  const seriesArr: string[] = []
  const familyArr: string[] = []
  const priceArr: number[] = []
  for (const [series, rows] of Object.entries(fabricsBySeries)) {
    for (const r of Array.isArray(rows) ? rows : []) {
      const price = Number(r?.pricePerSqm)
      const family = String(r?.code || '').trim()
      if (!family || !Number.isFinite(price) || price <= 0) continue
      seriesArr.push(series)
      familyArr.push(family)
      priceArr.push(toSell(series, price))
    }
  }
  let colorwaysPriced = 0
  if (familyArr.length > 0) {
    const updated = await query<{ code: string }>(
      `UPDATE fabric_library fl
          SET price_per_sqm = t.price, updated_at = now()
         FROM unnest($1::text[], $2::text[], $3::numeric[]) AS t(series, family, price)
        WHERE fl.series = t.series AND fl.family = t.family
        RETURNING fl.code`,
      [seriesArr, familyArr, priceArr]
    )
    colorwaysPriced = updated.length
  }

  // ── Follow AAPP availability (下架自动) ────────────────────────────────────
  // A fabric family missing from the AAPP live library = discontinued there
  // (Eddie removes the price row to retire a fabric). Mark those colorways
  // discontinued + inactive so photo import, product binding, and the store
  // all skip them. Families that reappear are restored (discontinued flag
  // cleared; manual is_active is left alone). Only series actually present in
  // the feed are touched — an empty/missing table never mass-discontinues.
  let colorwaysDiscontinued = 0
  let colorwaysRestored = 0
  for (const [series, rows] of Object.entries(fabricsBySeries)) {
    if (!Array.isArray(rows) || rows.length === 0) continue
    const families = rows.map((r: any) => String(r?.code || '').trim()).filter(Boolean)
    if (families.length === 0) continue
    const gone = await query<{ code: string }>(
      `UPDATE fabric_library SET discontinued = true, is_active = false, updated_at = now()
        WHERE series = $1 AND discontinued = false AND NOT (family = ANY($2))
        RETURNING code`,
      [series, families]
    )
    colorwaysDiscontinued += gone.length
    const back = await query<{ code: string }>(
      `UPDATE fabric_library SET discontinued = false, updated_at = now()
        WHERE series = $1 AND discontinued = true AND family = ANY($2)
        RETURNING code`,
      [series, families]
    )
    colorwaysRestored += back.length
  }

  return {
    exportedAt: payload.exportedAt ?? null,
    fabricFamiliesPriced: familyArr.length,
    colorwaysPriced,
    colorwaysDiscontinued,
    colorwaysRestored,
    hasShadeCatalog: !!data.shadeCatalog?.variants && Object.keys(data.shadeCatalog.variants).length > 0,
    hasLumaMotors: !!data.lumaMotorSystem,
    hasDraperyCatalog: !!data.draperyPricingCatalog,
  }
}
