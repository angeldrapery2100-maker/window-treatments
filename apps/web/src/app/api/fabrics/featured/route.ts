import { NextResponse } from 'next/server'
import { fabricDetail, featuredFabrics, featuredSheers } from '@/lib/draperyFabricLibrary'

// The handful of fabrics the Handcrafted Drapery page previews and /design
// starts from. Edited by hand in src/data/fabric-featured.json.
export const runtime = 'nodejs'
export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      // `data` stays the drapery list so the Handcrafted Drapery teaser keeps
      // working unchanged; the sheers ride alongside for /design.
      data: featuredFabrics().map(fabricDetail),
      sheers: featuredSheers().map(fabricDetail),
    },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' } }
  )
}
