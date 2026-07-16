// Luma product binding (①核心) — binds a store product to an AAPP Luma
// variant + a set of fabric-library colorways, and GENERATES the product's
// pricing config + options from the synced AAPP library snapshot. After this,
// listing a new shade product = create product → bind → tick fabrics → done;
// no per-product price entry, and every AAPP sync re-applies all bindings so
// prices/availability follow AAPP automatically.
//
// What apply() writes into products.default_config:
//   params.aapp_engine  = 'luma_shade'          (shared parity engine)
//   params.aapp_variant = spec.variantKey
//   params.aapp_config  = live catalog slice (fabric $/sqm, cassettes $/m,
//                         option surcharges, motor net prices) — merged over
//                         engine factory defaults at price time.
//   params.aapp_luma_binding = spec              (so sync can re-apply)
//   options: managed fabric_code / cassette / control / motor options
//            (labels+images from fabric_library; existing UNmanaged options
//            are left untouched).
//
// Availability rule (Eddie 2026-07-16): fabric discontinued/deactivated in
// the library → its option value disappears on re-apply; product deactivates
// only when NO sellable fabrics remain. New fabrics never auto-list.

import { query, queryOne } from '@/lib/db'
import { getAappLibrary } from '@/lib/aappLibrary'
import { ensureFabricTable, type FabricRow } from '@/lib/fabricLibrary'

export const LUMA_VARIANTS: Record<string, { label: string; table: string }> = {
  roller_shade: { label: 'Luma Roller Shade', table: 'roller' },
  zebra_shade: { label: 'Luma Zebra Shade', table: 'zebra' },
  sheer_shade: { label: 'Luma Sheer Shade', table: 'sheer' },
  modern_roman_shade: { label: 'Modern Roman Shade', table: 'roman' },
}

export const LUMA_CONTROLS: Record<string, string> = {
  plastic_chain: 'Plastic Chain',
  stainless_chain: 'Stainless Steel Chain',
  cordless: 'Cordless',
  motorized: 'Motorized',
}

export interface LumaBindingSpec {
  variantKey: string
  fabricCodes: string[]
  cassetteKeys: string[]
  controlKeys: string[]
}

const MANAGED_OPTION_NAMES = ['fabric_code', 'cassette', 'control', 'motor']

function surchargeOf(raw: any): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw && typeof raw === 'object' && Number.isFinite(Number(raw.surcharge))) return Number(raw.surcharge)
  return 0
}

function mapMotorRows(rows: any[]): Array<{ key: string; label: string; netPrice: number }> {
  return (Array.isArray(rows) ? rows : [])
    .map((m: any) => ({
      key: String(m?.key ?? m?.id ?? ''),
      label: String(m?.label ?? m?.name ?? m?.key ?? m?.id ?? ''),
      netPrice: Number(m?.netPrice) || Number(m?.sellPrice) || 0,
    }))
    .filter(m => m.key)
}

interface SnapshotSlices {
  fabricsTable: Array<{ code: string; pricePerSqm: number }>
  variant: { maxWidth?: number | null; maxHeight?: number | null; cassettes: Array<{ key: string; label: string; pricePerMeter: number }> }
  options: Record<string, number>
  motorSystem: any | null
}

async function loadSnapshotSlices(variantKey: string): Promise<SnapshotSlices> {
  const meta = LUMA_VARIANTS[variantKey]
  if (!meta) throw new Error(`不支持的产品型号:${variantKey}(双层款后续再支持)`)
  const snap = await getAappLibrary()
  if (!snap?.data) throw new Error('还没有 AAPP library 快照 — 请先在面料库页点「同步 AAPP 价格」')
  const shade = snap.data.shadeCatalog || {}

  const fabricsTable = (Array.isArray(shade.fabrics?.[meta.table]) ? shade.fabrics[meta.table] : [])
    .map((f: any) => ({ code: String(f?.code || ''), pricePerSqm: Number(f?.pricePerSqm) || 0 }))
    .filter((f: any) => f.code && f.pricePerSqm > 0)

  const rawVariant = shade.variants?.[variantKey] || {}
  const cassettes = (Array.isArray(rawVariant.cassettes) ? rawVariant.cassettes : [])
    .map((c: any) => ({
      key: String(c?.key || ''),
      label: String(c?.label || c?.key || ''),
      pricePerMeter: Number(c?.pricePerMeter ?? c?.pricePerInch) || 0,
    }))
    .filter((c: any) => c.key)

  const options: Record<string, number> = {}
  for (const [k, v] of Object.entries(shade.options || {})) options[k] = surchargeOf(v)

  const src = snap.data.lumaMotorSystem
  const motorSystem = src
    ? {
        motors: mapMotorRows(src.motors),
        remotes: mapMotorRows(src.remotes),
        hubs: mapMotorRows(src.hubs),
        accessories: mapMotorRows(src.accessories),
      }
    : null

  return {
    fabricsTable,
    variant: {
      maxWidth: rawVariant.maxWidth ?? null,
      maxHeight: rawVariant.maxHeight ?? null,
      cassettes,
    },
    options,
    motorSystem,
  }
}

export interface ApplyReport {
  productId: string
  variantKey: string
  keptFabrics: string[]
  droppedFabrics: Array<{ code: string; reason: string }>
  deactivated: boolean
}

export async function applyLumaBinding(productId: string, spec: LumaBindingSpec): Promise<ApplyReport> {
  const meta = LUMA_VARIANTS[spec.variantKey]
  if (!meta) throw new Error(`不支持的产品型号:${spec.variantKey}`)
  const slices = await loadSnapshotSlices(spec.variantKey)
  await ensureFabricTable()

  const row = await queryOne<{ id: string; default_config: any }>(
    `SELECT id, default_config FROM products WHERE id = $1`,
    [productId]
  )
  if (!row) throw new Error('product_not_found')

  // ── Resolve fabrics against the library + snapshot prices ──────────────────
  const codes = [...new Set((spec.fabricCodes || []).map(c => String(c).trim()).filter(Boolean))]
  const fabricRows = codes.length
    ? await query<FabricRow>(`SELECT * FROM fabric_library WHERE code = ANY($1)`, [codes])
    : []
  const byCode = new Map(fabricRows.map(f => [f.code, f]))
  const familyPrice = new Map(slices.fabricsTable.map(f => [f.code, f.pricePerSqm]))

  const kept: FabricRow[] = []
  const dropped: Array<{ code: string; reason: string }> = []
  for (const code of codes) {
    const f = byCode.get(code)
    if (!f) { dropped.push({ code, reason: '不在面料库' }); continue }
    if (f.discontinued) { dropped.push({ code, reason: '已停产' }); continue }
    if (!f.is_active) { dropped.push({ code, reason: '已停用' }); continue }
    if (f.series !== meta.table) { dropped.push({ code, reason: `系列不符(${f.series})` }); continue }
    if (!familyPrice.has(f.family)) { dropped.push({ code, reason: 'AAPP 无价格' }); continue }
    kept.push(f)
  }

  const cassettes = slices.variant.cassettes.filter(c =>
    !spec.cassetteKeys?.length || spec.cassetteKeys.includes(c.key)
  )
  const controls = (spec.controlKeys?.length ? spec.controlKeys : ['plastic_chain'])
    .filter(k => LUMA_CONTROLS[k])

  // ── Generated (managed) options ─────────────────────────────────────────────
  const managedOptions: any[] = []
  managedOptions.push({
    name: 'fabric_code',
    label: 'Fabric',
    managed_by: 'aapp_luma',
    values: kept.map((f, i) => ({
      value: f.code,
      label: f.name || f.code,
      sort_order: i,
      params: { ...(f.image_url ? { image_url: f.image_url } : {}) },
    })),
  })
  if (cassettes.length > 0) {
    managedOptions.push({
      name: 'cassette',
      label: 'Cassette',
      managed_by: 'aapp_luma',
      values: cassettes.map((c, i) => ({ value: c.key, label: c.label, sort_order: i, params: {} })),
    })
  }
  managedOptions.push({
    name: 'control',
    label: 'Control',
    managed_by: 'aapp_luma',
    values: controls.map((k, i) => ({ value: k, label: LUMA_CONTROLS[k], sort_order: i, params: {} })),
  })
  if (controls.includes('motorized') && (slices.motorSystem?.motors?.length ?? 0) > 1) {
    managedOptions.push({
      name: 'motor',
      label: 'Motor',
      managed_by: 'aapp_luma',
      values: slices.motorSystem!.motors.map((m: any, i: number) => ({
        value: m.key, label: m.label, sort_order: i, params: {},
      })),
    })
  }

  // ── aapp_config: live catalog slice merged over engine defaults at runtime ─
  const usedFamilies = [...new Set(kept.map(f => f.family))]
  const aappConfig = {
    fabrics: {
      [meta.table]: usedFamilies.map(fam => ({ code: fam, pricePerSqm: familyPrice.get(fam)! })),
    },
    variants: {
      [spec.variantKey]: {
        ...(slices.variant.maxWidth != null ? { maxWidth: slices.variant.maxWidth } : {}),
        ...(slices.variant.maxHeight != null ? { maxHeight: slices.variant.maxHeight } : {}),
        cassettes,
      },
    },
    options: slices.options,
    ...(slices.motorSystem ? { motorSystem: slices.motorSystem } : {}),
  }

  // ── Write default_config (preserve everything not ours) ────────────────────
  const cfg = row.default_config || {}
  const existingOptions: any[] = Array.isArray(cfg.options) ? cfg.options : []
  const keptOther = existingOptions.filter(
    (o: any) => o?.managed_by !== 'aapp_luma' && !MANAGED_OPTION_NAMES.includes(String(o?.name))
  )
  const nextCfg = {
    ...cfg,
    params: {
      ...(cfg.params || {}),
      aapp_engine: 'luma_shade',
      aapp_variant: spec.variantKey,
      aapp_config: aappConfig,
      aapp_luma_binding: { ...spec, fabricCodes: codes },
    },
    options: [...keptOther, ...managedOptions],
  }
  await query(`UPDATE products SET default_config = $2::jsonb, updated_at = now() WHERE id = $1`, [
    productId, JSON.stringify(nextCfg),
  ])

  // ── Availability rule ───────────────────────────────────────────────────────
  let deactivated = false
  if (kept.length === 0) {
    await query(`UPDATE products SET is_active = false, updated_at = now() WHERE id = $1`, [productId])
    deactivated = true
  }

  return {
    productId,
    variantKey: spec.variantKey,
    keptFabrics: kept.map(f => f.code),
    droppedFabrics: dropped,
    deactivated,
  }
}

/** Remove a binding: unsets the aapp_* keys and drops the managed options.
 *  The product keeps whatever legacy pricing params it had before binding. */
export async function removeLumaBinding(productId: string): Promise<void> {
  const row = await queryOne<{ default_config: any }>(
    `SELECT default_config FROM products WHERE id = $1`, [productId]
  )
  if (!row) throw new Error('product_not_found')
  const cfg = row.default_config || {}
  const params = { ...(cfg.params || {}) }
  delete params.aapp_engine
  delete params.aapp_variant
  delete params.aapp_config
  delete params.aapp_luma_binding
  const options = (Array.isArray(cfg.options) ? cfg.options : []).filter(
    (o: any) => o?.managed_by !== 'aapp_luma'
  )
  await query(`UPDATE products SET default_config = $2::jsonb, updated_at = now() WHERE id = $1`, [
    productId, JSON.stringify({ ...cfg, params, options }),
  ])
}

export interface ReapplyReport {
  products: Array<ApplyReport & { name: string; error?: string }>
}

/** Re-apply every bound product against the freshly synced snapshot —
 *  called at the end of each AAPP library sync so prices/availability follow. */
export async function reapplyAllLumaBindings(): Promise<ReapplyReport> {
  const rows = await query<{ id: string; name: string; default_config: any }>(
    `SELECT id, name, default_config FROM products
      WHERE default_config #>> '{params,aapp_luma_binding}' IS NOT NULL`
  ).catch(() => [])
  const products: ReapplyReport['products'] = []
  for (const r of rows) {
    const spec = r.default_config?.params?.aapp_luma_binding
    if (!spec?.variantKey) continue
    try {
      const rep = await applyLumaBinding(r.id, {
        variantKey: String(spec.variantKey),
        fabricCodes: Array.isArray(spec.fabricCodes) ? spec.fabricCodes : [],
        cassetteKeys: Array.isArray(spec.cassetteKeys) ? spec.cassetteKeys : [],
        controlKeys: Array.isArray(spec.controlKeys) ? spec.controlKeys : [],
      })
      products.push({ ...rep, name: r.name })
    } catch (e: any) {
      products.push({
        productId: r.id, name: r.name, variantKey: String(spec.variantKey),
        keptFabrics: [], droppedFabrics: [], deactivated: false,
        error: String(e?.message || 'reapply failed'),
      })
    }
  }
  return { products }
}
