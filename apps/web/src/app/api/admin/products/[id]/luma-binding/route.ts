import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { queryOne, query } from '@/lib/db'
import { getAappLibrary } from '@/lib/aappLibrary'
import { ensureFabricTable } from '@/lib/fabricLibrary'
import { applyLumaBinding, removeLumaBinding, LUMA_VARIANTS, LUMA_CONTROLS } from '@/lib/lumaBinding'

// Admin: AAPP Luma product binding.
//   GET    → current binding + selectable choices (variants/cassettes/controls
//            from the AAPP snapshot; fabrics from fabric_library with prices)
//   PUT    → apply binding { variant_key, fabric_codes[], cassette_keys[], control_keys[] }
//   DELETE → remove binding

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

function unauthorized(e: any): NextResponse | null {
  const msg = String(e?.message || '')
  if (msg.includes('Admin') || msg.includes('authenticated')) return bad('Not authorized', 401)
  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request)
    const { id } = await params

    const row = await queryOne<{ default_config: any }>(
      `SELECT default_config FROM products WHERE id = $1`, [id]
    )
    if (!row) return bad('Product not found.', 404)
    const binding = row.default_config?.params?.aapp_luma_binding ?? null

    const snap = await getAappLibrary()
    const shade = snap?.data?.shadeCatalog || null

    // Variant choices with their cassettes (single-slot variants only for now).
    const variants = Object.entries(LUMA_VARIANTS).map(([key, meta]) => {
      const raw = shade?.variants?.[key] || {}
      const cassettes = (Array.isArray(raw.cassettes) ? raw.cassettes : []).map((c: any) => ({
        key: String(c?.key || ''),
        label: String(c?.label || c?.key || ''),
        pricePerMeter: Number(c?.pricePerMeter ?? c?.pricePerInch) || 0,
      })).filter((c: any) => c.key)
      return { key, label: meta.label, series: meta.table, cassettes }
    })

    const controls = Object.entries(LUMA_CONTROLS).map(([key, label]) => {
      const raw = shade?.options?.[key]
      const surcharge = typeof raw === 'number' ? raw : Number(raw?.surcharge) || 0
      return { key, label, surcharge }
    })

    // Sellable fabrics (active, not discontinued) with family prices.
    await ensureFabricTable()
    const fabrics = await query<any>(
      `SELECT code, series, family, category, name, image_url, price_per_sqm
         FROM fabric_library
        WHERE is_active = true AND discontinued = false
        ORDER BY series, sort_order, code`
    )

    return NextResponse.json({
      success: true,
      data: {
        binding,
        synced: !!snap,
        syncedAt: snap?.synced_at ?? null,
        variants,
        controls,
        fabrics,
      },
    })
  } catch (e: any) {
    const u = unauthorized(e); if (u) return u
    console.error('[luma-binding] GET failed:', e)
    return bad('Could not load binding data.', 500)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request)
    const { id } = await params
    let body: any
    try { body = await request.json() } catch { return bad('Invalid request body.') }

    const spec = {
      variantKey: String(body?.variant_key ?? ''),
      fabricCodes: Array.isArray(body?.fabric_codes) ? body.fabric_codes.map(String) : [],
      cassetteKeys: Array.isArray(body?.cassette_keys) ? body.cassette_keys.map(String) : [],
      controlKeys: Array.isArray(body?.control_keys) ? body.control_keys.map(String) : [],
    }
    if (!LUMA_VARIANTS[spec.variantKey]) return bad('请选择产品型号。')
    if (spec.fabricCodes.length === 0) return bad('请至少勾选一款面料。')

    const report = await applyLumaBinding(id, spec)
    return NextResponse.json({ success: true, data: { report } })
  } catch (e: any) {
    const u = unauthorized(e); if (u) return u
    if (String(e?.message) === 'product_not_found') return bad('Product not found.', 404)
    console.error('[luma-binding] PUT failed:', e)
    return bad(String(e?.message || 'Could not apply the binding.'), 500)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request)
    const { id } = await params
    await removeLumaBinding(id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const u = unauthorized(e); if (u) return u
    if (String(e?.message) === 'product_not_found') return bad('Product not found.', 404)
    console.error('[luma-binding] DELETE failed:', e)
    return bad('Could not remove the binding.', 500)
  }
}

export const dynamic = 'force-dynamic'
