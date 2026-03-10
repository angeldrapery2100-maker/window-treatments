import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { recordAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth'

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery_video_meta (
      id          SERIAL PRIMARY KEY,
      video_id    INTEGER NOT NULL UNIQUE,
      title       TEXT,
      location    TEXT,
      tag         TEXT,
      description TEXT,
      is_published BOOLEAN DEFAULT true,
      updated_at  TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`ALTER TABLE gallery_video_meta ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true`)
}

// GET /api/admin/gallery-videos
// Returns all rows keyed by video_id
export async function GET() {
  try {
    await ensureTable()
    const { rows } = await pool.query(
      'SELECT * FROM gallery_video_meta ORDER BY video_id'
    )
    const map: Record<number, typeof rows[0]> = {}
    for (const row of rows) map[row.video_id] = row
    return NextResponse.json({ success: true, data: map })
  } catch (e: any) {
    console.error('GET gallery-videos error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

// PUT /api/admin/gallery-videos
// Body: { video_id, title, location, tag, description, is_published? }
export async function PUT(request: Request) {
  try {
    await ensureTable()
    let adminUser: any
    try { adminUser = requireAdmin(request) } catch {}

    const { video_id, title, location, tag, description, is_published = true } = await request.json() as any

    if (!video_id) {
      return NextResponse.json({ success: false, error: 'video_id required' }, { status: 400 })
    }

    const { rows } = await pool.query(`
      INSERT INTO gallery_video_meta (video_id, title, location, tag, description, is_published, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, now())
      ON CONFLICT (video_id)
      DO UPDATE SET
        title        = EXCLUDED.title,
        location     = EXCLUDED.location,
        tag          = EXCLUDED.tag,
        description  = EXCLUDED.description,
        is_published = EXCLUDED.is_published,
        updated_at   = now()
      RETURNING *
    `, [video_id, title, location, tag, description, is_published])

    if (adminUser) {
      await recordAudit({
        action: is_published ? 'gallery.published' : 'gallery.unpublished',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'gallery_video',
        target_id: String(video_id),
        after: { title, is_published },
      })
    }

    return NextResponse.json({ success: true, data: rows[0] })
  } catch (e: any) {
    console.error('PUT gallery-videos error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

// POST /api/admin/gallery-videos/check-validity
// Checks if video URLs are still accessible (HEAD requests)
// This is triggered separately via a dedicated route
export const dynamic = 'force-dynamic'
