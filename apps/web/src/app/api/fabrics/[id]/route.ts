import { NextResponse } from 'next/server'
import { fabricDetail, getFabric } from '@/lib/draperyFabricLibrary'

// One fabric, everything the detail drawer shows. Split out from /api/fabrics
// so the grid payload stays small — the drawer fetches this on open.
export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fabric = getFabric(decodeURIComponent(id))
  if (!fabric) return NextResponse.json({ success: false, error: 'Fabric not found' }, { status: 404 })
  return NextResponse.json(
    { success: true, data: fabricDetail(fabric) },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' } }
  )
}
