import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { ensureFabricTable } from '@/lib/fabricLibrary'

// Read-only feed for AAPP: fabric display names + hardware (cassette) colors
// maintained in the website fabric library (/admin/fabrics). AAPP's library
// gets a "Sync from Website" button that pulls this map so work orders can
// auto-fill Cassette Color from the chosen fabric.
//
// Deliberately public: contains ONLY names, hardware colors and active flags —
// all of which are visible on public product pages anyway. No prices.
export async function GET() {
  try {
    await ensureFabricTable()
    const rows = await query<{ code: string; name: string; hardware_color: string; is_active: boolean; discontinued: boolean }>(
      `SELECT code, name, hardware_color, is_active, discontinued
         FROM fabric_library
        WHERE hardware_color <> '' OR name <> ''`
    )
    const fabrics: Record<string, { name?: string; hardwareColor?: string; active: boolean }> = {}
    for (const r of rows) {
      fabrics[r.code] = {
        ...(r.name ? { name: r.name } : {}),
        ...(r.hardware_color ? { hardwareColor: r.hardware_color } : {}),
        active: r.is_active && !r.discontinued,
      }
    }
    return NextResponse.json(
      { ok: true, count: rows.length, fabrics },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (e) {
    console.error('[aapp/fabric-meta] failed:', e)
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
