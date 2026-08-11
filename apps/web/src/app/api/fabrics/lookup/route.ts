import { NextResponse } from 'next/server'
import { fabricDetail, getFabric } from '@/lib/draperyFabricLibrary'

// Several fabrics in one request — /design needs the visitor's whole shortlist
// at once and firing forty separate detail requests for it would be silly.
export const runtime = 'nodejs'

const MAX = 40

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get('ids') || ''
  const ids = raw.split(',').map((s) => decodeURIComponent(s.trim())).filter(Boolean).slice(0, MAX)
  const data = ids.map(getFabric).filter((f) => !!f).map((f) => fabricDetail(f!))
  return NextResponse.json(
    { success: true, data },
    { headers: { 'Cache-Control': 'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800' } }
  )
}
