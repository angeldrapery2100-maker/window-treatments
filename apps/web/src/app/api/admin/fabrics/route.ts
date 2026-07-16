import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import {
  listFabrics, updateFabric, setFamilyHardwareColor,
  syncFabricCatalog, importFromProducts, importSwatchesBatch, ensureFabricTable,
} from '@/lib/fabricLibrary'
import { queryOne } from '@/lib/db'

// Admin fabric library (面料库) API.
//   GET    ?series=&category=&q=      → rows (auto-seeds the table on first use)
//   PATCH  { code, ...patch }         → update one colorway (name / hardware_color / image_url / is_active)
//   PATCH  { family, hardware_color } → bulk hardware color for a whole family
//   POST   { action: 'sync' }         → re-diff the generated AAPP catalog into the table
//   POST   { action: 'import' }       → pull images/names from existing store products

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

function unauthorized(e: any): NextResponse | null {
  const msg = String(e?.message || '')
  if (msg.includes('Admin') || msg.includes('authenticated')) return bad('Not authorized', 401)
  return null
}

export async function GET(request: Request) {
  try {
    requireAdmin(request)
    await ensureFabricTable()
    // First use: seed from the generated catalog so the page is never empty.
    const any = await queryOne<{ n: string }>(`SELECT COUNT(*) AS n FROM fabric_library`)
    if (!Number(any?.n)) await syncFabricCatalog()

    const { searchParams } = new URL(request.url)
    const fabrics = await listFabrics({
      series: searchParams.get('series') || undefined,
      category: searchParams.get('category') || undefined,
      q: searchParams.get('q') || undefined,
    })
    return NextResponse.json({ success: true, data: { fabrics } })
  } catch (e: any) {
    const u = unauthorized(e); if (u) return u
    console.error('[admin/fabrics] GET failed:', e)
    return bad('Could not load the fabric library.', 500)
  }
}

export async function PATCH(request: Request) {
  try {
    requireAdmin(request)
    let body: any
    try { body = await request.json() } catch { return bad('Invalid request body.') }

    // Bulk: whole-family hardware color.
    if (body?.family && body?.code === undefined) {
      const updated = await setFamilyHardwareColor(String(body.family), String(body.hardware_color ?? ''))
      return NextResponse.json({ success: true, data: { updated } })
    }

    const code = String(body?.code ?? '')
    if (!code) return bad('code is required.')
    const row = await updateFabric(code, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.hardware_color !== undefined ? { hardware_color: body.hardware_color } : {}),
      ...(body.image_url !== undefined ? { image_url: body.image_url } : {}),
      ...(body.is_active !== undefined ? { is_active: body.is_active === true } : {}),
    })
    if (!row) return bad('Fabric not found.', 404)
    return NextResponse.json({ success: true, data: { fabric: row } })
  } catch (e: any) {
    const u = unauthorized(e); if (u) return u
    console.error('[admin/fabrics] PATCH failed:', e)
    return bad('Could not update the fabric.', 500)
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request)
    let body: any
    try { body = await request.json() } catch { body = {} }
    const action = String(body?.action ?? '')
    if (action === 'sync') {
      const report = await syncFabricCatalog()
      return NextResponse.json({ success: true, data: { report } })
    }
    if (action === 'import') {
      const report = await importFromProducts()
      return NextResponse.json({ success: true, data: { report } })
    }
    // Batched swatch photo import from the AAPP app (Netlify) — the page
    // loops with `after` until nextCursor is null.
    if (action === 'import-swatches') {
      const batch = await importSwatchesBatch(String(body?.after ?? ''), 10)
      return NextResponse.json({ success: true, data: { batch } })
    }
    return bad('Unknown action.')
  } catch (e: any) {
    const u = unauthorized(e); if (u) return u
    console.error('[admin/fabrics] POST failed:', e)
    return bad('Operation failed.', 500)
  }
}

export const dynamic = 'force-dynamic'
