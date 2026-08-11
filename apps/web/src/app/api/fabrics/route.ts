import { NextResponse } from 'next/server'
import { buildIndex } from '@/lib/draperyFabricLibrary'

// The whole fabric library in the compact form the /fabrics grid filters on.
// It is a build artefact — identical for every visitor and only changes when
// someone re-runs build-fabric-catalog.mjs and deploys — so it is computed once
// per lambda and cached hard at the edge.
export const runtime = 'nodejs'
export const dynamic = 'force-static'

let cached: string | null = null

export async function GET() {
  if (!cached) cached = JSON.stringify({ success: true, data: buildIndex() })
  return new NextResponse(cached, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
