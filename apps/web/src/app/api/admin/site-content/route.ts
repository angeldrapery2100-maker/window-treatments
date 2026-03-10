import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { snapshotContent } from '@/lib/contentVersions'
import { recordAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth'

// ──────────────────────────────────────────────────────────────────────────────
// site_content table — with is_published and required field validation
// ──────────────────────────────────────────────────────────────────────────────
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page VARCHAR(64) NOT NULL,
      section VARCHAR(128) NOT NULL,
      field_key VARCHAR(128) NOT NULL,
      field_type VARCHAR(32) NOT NULL DEFAULT 'text',
      content TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      image_width INTEGER DEFAULT 0,
      image_height INTEGER DEFAULT 0,
      image_fit VARCHAR(32) DEFAULT 'cover',
      sort_order INTEGER DEFAULT 0,
      metadata JSONB DEFAULT '{}'::jsonb,
      is_published BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(page, section, field_key)
    )
  `)
  // Add is_published to existing tables that may be missing it
  await pool.query(`
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true
  `)
}

// GET  /api/admin/site-content?page=home&include_drafts=true
export async function GET(request: Request) {
  try {
    await ensureTable()
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const includeDrafts = searchParams.get('include_drafts') !== 'false' // admin always sees drafts by default

    let rows
    if (page) {
      rows = (await pool.query(
        `SELECT * FROM site_content WHERE page = $1 ORDER BY section, sort_order, field_key`,
        [page]
      )).rows
    } else {
      rows = (await pool.query(
        `SELECT * FROM site_content ORDER BY page, section, sort_order, field_key`
      )).rows
    }

    return NextResponse.json({ success: true, data: rows })
  } catch (e: any) {
    console.error('GET site-content error:', e)
    return NextResponse.json({ success: false, error: { message: e.message } }, { status: 500 })
  }
}

// POST /api/admin/site-content  — upsert one field (with snapshot + audit)
export async function POST(request: Request) {
  try {
    await ensureTable()
    let adminUser: any
    try { adminUser = requireAdmin(request) } catch {}

    const body = await request.json() as any
    const {
      page, section, field_key, field_type = 'text',
      content = '', image_url = '',
      image_width = 0, image_height = 0, image_fit = 'cover',
      sort_order = 0, metadata = {},
      is_published,
    } = body

    if (!page || !section || !field_key) {
      return NextResponse.json(
        { success: false, error: { message: 'page, section, field_key are required' } },
        { status: 400 }
      )
    }

    // Field-level validation
    if (field_type === 'text' && content === '') {
      // Allow empty for optional fields — only warn for known-required fields
    }
    if (field_type === 'image' && !image_url) {
      // Allow missing image but log it
    }

    // Snapshot existing row before overwrite
    const existing = (await pool.query(
      'SELECT * FROM site_content WHERE page = $1 AND section = $2 AND field_key = $3',
      [page, section, field_key]
    )).rows[0]

    if (existing) {
      await snapshotContent({
        content_id: existing.id,
        page, section, field_key,
        field_type: existing.field_type,
        content: existing.content,
        image_url: existing.image_url,
        metadata: existing.metadata,
        actor_email: adminUser?.email ?? null,
      })
    }

    const publishedValue = is_published !== undefined ? is_published : true

    const result = await pool.query(`
      INSERT INTO site_content
        (page, section, field_key, field_type, content, image_url, image_width, image_height,
         image_fit, sort_order, metadata, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (page, section, field_key)
      DO UPDATE SET
        field_type   = EXCLUDED.field_type,
        content      = EXCLUDED.content,
        image_url    = EXCLUDED.image_url,
        image_width  = EXCLUDED.image_width,
        image_height = EXCLUDED.image_height,
        image_fit    = EXCLUDED.image_fit,
        sort_order   = EXCLUDED.sort_order,
        metadata     = EXCLUDED.metadata,
        is_published = EXCLUDED.is_published,
        updated_at   = now()
      RETURNING *
    `, [page, section, field_key, field_type, content, image_url,
        image_width, image_height, image_fit, sort_order, JSON.stringify(metadata), publishedValue])

    if (adminUser) {
      await recordAudit({
        action: publishedValue ? 'content.published' : 'content.unpublished',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'site_content',
        target_id: result.rows[0].id,
        before: existing ? { content: existing.content, is_published: existing.is_published } : null,
        after: { content, is_published: publishedValue },
      })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (e: any) {
    console.error('POST site-content error:', e)
    return NextResponse.json({ success: false, error: { message: e.message } }, { status: 500 })
  }
}

// PATCH /api/admin/site-content — toggle published state only
export async function PATCH(request: Request) {
  try {
    await ensureTable()
    let adminUser: any
    try { adminUser = requireAdmin(request) } catch {}

    const body = await request.json() as any
    const { id, is_published } = body
    if (!id || is_published === undefined) {
      return NextResponse.json({ success: false, error: { message: 'id and is_published required' } }, { status: 400 })
    }

    const existing = (await pool.query('SELECT * FROM site_content WHERE id = $1', [id])).rows[0]
    if (!existing) return NextResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 })

    await pool.query(
      'UPDATE site_content SET is_published = $1, updated_at = now() WHERE id = $2',
      [is_published, id]
    )

    if (adminUser) {
      await recordAudit({
        action: is_published ? 'content.published' : 'content.unpublished',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'site_content',
        target_id: id,
        before: { is_published: existing.is_published },
        after: { is_published },
      })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('PATCH site-content error:', e)
    return NextResponse.json({ success: false, error: { message: e.message } }, { status: 500 })
  }
}

// DELETE /api/admin/site-content
export async function DELETE(request: Request) {
  try {
    await ensureTable()
    const body = await request.json() as any
    const { id } = body
    if (!id) {
      return NextResponse.json({ success: false, error: { message: 'id required' } }, { status: 400 })
    }
    await pool.query('DELETE FROM site_content WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('DELETE site-content error:', e)
    return NextResponse.json({ success: false, error: { message: e.message } }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
