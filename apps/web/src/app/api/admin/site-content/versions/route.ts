import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import pool from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { recordAudit } from '@/lib/audit'

// GET /api/admin/site-content/versions?content_id=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const content_id = searchParams.get('content_id')
    if (!content_id) return NextResponse.json({ success: false, error: 'content_id required' }, { status: 400 })

    const versions = await query(
      `SELECT * FROM content_versions WHERE content_id = $1 ORDER BY snapshot_at DESC LIMIT 20`,
      [content_id]
    )
    return NextResponse.json({ success: true, data: versions })
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      return NextResponse.json({ success: true, data: [] })
    }
    return errorResponse('Could not load version history.', 500, e)
  }
}

// POST /api/admin/site-content/versions — restore a version
export async function POST(request: Request) {
  try {
    const adminUser = requireAdmin(request)
    const { version_id } = await request.json() as any
    if (!version_id) return NextResponse.json({ success: false, error: 'version_id required' }, { status: 400 })

    const version = await queryOne<any>(
      `SELECT * FROM content_versions WHERE id = $1`,
      [version_id]
    )
    if (!version) return NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 })

    await pool.query(
      `UPDATE site_content
       SET content = $1, image_url = $2, metadata = $3, updated_at = now()
       WHERE id = $4`,
      [version.content, version.image_url, version.metadata ?? '{}', version.content_id]
    )

    await recordAudit({
      action: 'content.version_restored',
      actor_id: adminUser.id,
      actor_email: adminUser.email,
      target_type: 'site_content',
      target_id: version.content_id,
      note: `Restored to version from ${version.snapshot_at}`,
    })

    return NextResponse.json({ success: true, restored: true })
  } catch (e: any) {
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
