import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getAappLibrary, syncAappLibrary } from '@/lib/aappLibrary'

// Admin AAPP-library sync.
//   GET  → snapshot status (when last synced / exported)
//   POST → run a sync now (pull libraryExport, snapshot, propagate fabric prices)

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
    const snap = await getAappLibrary()
    return NextResponse.json({
      success: true,
      data: {
        synced: !!snap,
        syncedAt: snap?.synced_at ?? null,
        exportedAt: snap?.exported_at ?? null,
      },
    })
  } catch (e: any) {
    const u = unauthorized(e); if (u) return u
    console.error('[admin/aapp-library] GET failed:', e)
    return bad('Could not load sync status.', 500)
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request)
    const report = await syncAappLibrary()
    return NextResponse.json({ success: true, data: { report } })
  } catch (e: any) {
    const u = unauthorized(e); if (u) return u
    console.error('[admin/aapp-library] sync failed:', e)
    return bad(String(e?.message || 'Sync failed.'), 502)
  }
}

export const dynamic = 'force-dynamic'
