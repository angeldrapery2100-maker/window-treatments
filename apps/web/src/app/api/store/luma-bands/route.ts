import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { ensureFabricTable } from '@/lib/fabricLibrary'

// Public: live fabric SELL-price bands ($/sqm min/max) per series+UI key for
// the Luma marketing-page estimator. Sourced from fabric_library, whose
// price_per_sqm follows AAPP via 「同步 AAPP 价格」— so the estimator can
// never drift from real pricing again. Categories are mapped onto the
// estimator's UI keys; keys with no data are simply omitted (component keeps
// its fallback numbers).
const KEY_MAP: Record<string, Record<string, string[]>> = {
  roller: { lf: ['light_filtering'], blackout: ['blackout'], screen: ['screen'] },
  zebra: { rd: ['room_darkening'], lf: ['light_filtering'] },
  sheer: { lf: ['standard', 'textured', 'embroidered'], rd: ['blackout_matching'] },
}

export async function GET() {
  try {
    await ensureFabricTable()
    const rows = await query<{ series: string; category: string; min: string; max: string }>(
      `SELECT series, category, MIN(price_per_sqm) AS min, MAX(price_per_sqm) AS max
         FROM fabric_library
        WHERE is_active = true AND discontinued = false AND price_per_sqm > 0
        GROUP BY series, category`
    )
    const bands: Record<string, Record<string, { min: number; max: number }>> = {}
    for (const [series, keys] of Object.entries(KEY_MAP)) {
      for (const [uiKey, cats] of Object.entries(keys)) {
        const hit = rows.filter(r => r.series === series && cats.includes(r.category))
        if (hit.length === 0) continue
        bands[series] = bands[series] || {}
        bands[series][uiKey] = {
          min: Math.floor(Math.min(...hit.map(r => Number(r.min)))),
          max: Math.ceil(Math.max(...hit.map(r => Number(r.max)))),
        }
      }
    }
    return NextResponse.json(
      { success: true, data: { bands } },
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } }
    )
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
