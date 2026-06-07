import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { requireAdmin } from '@/lib/auth'

// POST /api/admin/gallery-videos/check
// Body: { urls: string[] }
// Checks if video/image URLs are still reachable via HEAD request
export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { urls } = await request.json() as any
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ success: false, error: 'urls array required' }, { status: 400 })
    }

    const MAX = 20 // Limit batch size
    const batch = urls.slice(0, MAX)

    const results = await Promise.all(
      batch.map(async (url: string) => {
        try {
          const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
          return { url, ok: res.ok, status: res.status }
        } catch {
          return { url, ok: false, status: 0 }
        }
      })
    )

    return NextResponse.json({ success: true, data: results })
  } catch (e: any) {
    return errorResponse('Could not check gallery videos.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
