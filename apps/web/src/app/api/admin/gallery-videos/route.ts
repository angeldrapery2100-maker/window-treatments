import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
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

  // Custom videos table (user-uploaded)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery_custom_videos (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL DEFAULT '',
      location    TEXT NOT NULL DEFAULT '',
      tag         TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      orientation TEXT NOT NULL DEFAULT 'landscape',
      video_url   TEXT NOT NULL,
      poster_url  TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN DEFAULT true,
      created_at  TIMESTAMPTZ DEFAULT now(),
      updated_at  TIMESTAMPTZ DEFAULT now()
    )
  `)
}

// GET /api/admin/gallery-videos
// Returns overrides map + custom videos
export async function GET() {
  try {
    await ensureTable()
    const { rows: metaRows } = await pool.query(
      'SELECT * FROM gallery_video_meta ORDER BY video_id'
    )
    const map: Record<number, typeof metaRows[0]> = {}
    for (const row of metaRows) map[row.video_id] = row

    const { rows: customRows } = await pool.query(
      'SELECT * FROM gallery_custom_videos ORDER BY sort_order, id'
    )

    return NextResponse.json({ success: true, data: map, customVideos: customRows })
  } catch (e) {
    console.error('GET gallery-videos error:', e)
    return errorResponse('Could not load gallery videos.', 500, e)
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
  } catch (e) {
    console.error('PUT gallery-videos error:', e)
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

// POST /api/admin/gallery-videos
// Create a new custom video
// Body: { title, location, tag, description, orientation, video_url, poster_url }
export async function POST(request: Request) {
  try {
    await ensureTable()
    let adminUser: any
    try { adminUser = requireAdmin(request) } catch {}

    const body = await request.json()
    const { title, location, tag, description, orientation, video_url, poster_url } = body

    if (!video_url || !poster_url) {
      return NextResponse.json({ success: false, error: 'video_url and poster_url required' }, { status: 400 })
    }

    // Get max sort_order
    const { rows: maxRows } = await pool.query('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM gallery_custom_videos')
    const sortOrder = maxRows[0].max_sort + 1

    const { rows } = await pool.query(`
      INSERT INTO gallery_custom_videos (title, location, tag, description, orientation, video_url, poster_url, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [title || '', location || '', tag || '', description || '', orientation || 'landscape', video_url, poster_url, sortOrder])

    if (adminUser) {
      await recordAudit({
        action: 'gallery.updated',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'gallery_custom_video',
        target_id: String(rows[0].id),
        after: { title, video_url },
      })
    }

    return NextResponse.json({ success: true, data: rows[0] })
  } catch (e) {
    console.error('POST gallery-videos error:', e)
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

// DELETE /api/admin/gallery-videos?id=xxx
// Delete a custom video
export async function DELETE(request: Request) {
  try {
    await ensureTable()
    let adminUser: any
    try { adminUser = requireAdmin(request) } catch {}

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    }

    const { rows } = await pool.query('DELETE FROM gallery_custom_videos WHERE id = $1 RETURNING *', [id])

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (adminUser) {
      await recordAudit({
        action: 'gallery.updated',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'gallery_custom_video',
        target_id: String(id),
        after: { deleted: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE gallery-videos error:', e)
    return errorResponse('Could not delete the video. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
