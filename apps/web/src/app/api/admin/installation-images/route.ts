import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import pool from '@/lib/db'
import { recordAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth'

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS installation_images (
      id           SERIAL PRIMARY KEY,
      product_type VARCHAR(64) NOT NULL,
      image_url    TEXT NOT NULL,
      caption      TEXT,
      sort_order   INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT true,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_installation_images_type ON installation_images(product_type)`)
}

const VALID_TYPES = ['handcrafted-drapery', 'handcrafted-roman-shade', 'handcrafted-top-treatment']

// GET /api/admin/installation-images?productType=xxx
export async function GET(request: Request) {
  try {
    await ensureTable()
    const { searchParams } = new URL(request.url)
    const productType = searchParams.get('productType')

    if (productType && !VALID_TYPES.includes(productType)) {
      return NextResponse.json({ success: false, error: 'Invalid product type' }, { status: 400 })
    }

    const query = productType
      ? 'SELECT * FROM installation_images WHERE product_type = $1 ORDER BY sort_order, id'
      : 'SELECT * FROM installation_images ORDER BY product_type, sort_order, id'
    const params = productType ? [productType] : []

    const { rows } = await pool.query(query, params)
    return NextResponse.json({ success: true, data: rows })
  } catch (e) {
    console.error('GET installation-images error:', e)
    return errorResponse('Could not load installation images.', 500, e)
  }
}

// POST /api/admin/installation-images
// Body: { product_type, image_url, caption?, sort_order? }
export async function POST(request: Request) {
  try {
    await ensureTable()
    let adminUser: any
    try { adminUser = requireAdmin(request) } catch {}

    const { product_type, image_url, caption, sort_order } = await request.json()

    if (!product_type || !VALID_TYPES.includes(product_type)) {
      return NextResponse.json({ success: false, error: 'Valid product_type required' }, { status: 400 })
    }
    if (!image_url) {
      return NextResponse.json({ success: false, error: 'image_url required' }, { status: 400 })
    }

    // Auto sort_order: max + 1
    const effectiveSort = sort_order ?? (
      await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM installation_images WHERE product_type = $1', [product_type])
    ).rows[0].next

    const { rows } = await pool.query(
      `INSERT INTO installation_images (product_type, image_url, caption, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [product_type, image_url, caption || null, effectiveSort]
    )

    if (adminUser) {
      await recordAudit({
        action: 'installation_image.created',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'installation_image',
        target_id: String(rows[0].id),
        after: { product_type, image_url },
      })
    }

    return NextResponse.json({ success: true, data: rows[0] })
  } catch (e) {
    console.error('POST installation-images error:', e)
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

// PUT /api/admin/installation-images
// Body: { id, caption?, sort_order?, is_published? }
export async function PUT(request: Request) {
  try {
    await ensureTable()
    let adminUser: any
    try { adminUser = requireAdmin(request) } catch {}

    const { id, caption, sort_order, is_published, image_url } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    }

    const sets: string[] = []
    const vals: any[] = []
    let idx = 1

    if (image_url !== undefined) { sets.push(`image_url = $${idx++}`); vals.push(image_url) }
    if (caption !== undefined) { sets.push(`caption = $${idx++}`); vals.push(caption) }
    if (sort_order !== undefined) { sets.push(`sort_order = $${idx++}`); vals.push(sort_order) }
    if (is_published !== undefined) { sets.push(`is_published = $${idx++}`); vals.push(is_published) }
    sets.push(`updated_at = now()`)

    if (sets.length === 1) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    vals.push(id)
    const { rows } = await pool.query(
      `UPDATE installation_images SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      vals
    )

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (adminUser) {
      await recordAudit({
        action: 'installation_image.updated',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'installation_image',
        target_id: String(id),
        after: { caption, sort_order, is_published },
      })
    }

    return NextResponse.json({ success: true, data: rows[0] })
  } catch (e) {
    console.error('PUT installation-images error:', e)
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

// DELETE /api/admin/installation-images?id=xxx
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

    const { rowCount } = await pool.query('DELETE FROM installation_images WHERE id = $1', [id])

    if (adminUser) {
      await recordAudit({
        action: 'installation_image.deleted',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'installation_image',
        target_id: id,
      })
    }

    return NextResponse.json({ success: true, deleted: rowCount })
  } catch (e) {
    console.error('DELETE installation-images error:', e)
    return errorResponse('Could not delete the image. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
