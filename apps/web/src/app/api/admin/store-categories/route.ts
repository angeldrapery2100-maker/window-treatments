import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// Ensure store_categories table exists
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS store_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar(256) NOT NULL,
      slug varchar(128) NOT NULL UNIQUE,
      sort_order int DEFAULT 0,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )
  `)
  // Add store_category_id column to products if not exists
  const col = await query(
    `SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='store_category_id'`
  )
  if (col.length === 0) {
    await query(`ALTER TABLE products ADD COLUMN store_category_id uuid REFERENCES store_categories(id) ON DELETE SET NULL`)
  }
}

// GET — list all store categories (with product counts)
export async function GET(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureTable()
    const rows = await query(`
      SELECT sc.*, 
        (SELECT count(*) FROM products p WHERE p.store_category_id = sc.id AND p.is_active = true) AS product_count
      FROM store_categories sc
      ORDER BY sc.sort_order ASC, sc.created_at ASC
    `)
    return NextResponse.json({ success: true, data: rows })
  } catch (e: any) {
    console.error('GET store-categories error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

// POST — create new category
export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureTable()
    const body = await request.json()
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 })
    }
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const sortOrder = body.sort_order ?? 0

    const rows = await query(
      `INSERT INTO store_categories (name, slug, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [body.name, slug, sortOrder]
    )
    return NextResponse.json({ success: true, data: rows[0] }, { status: 201 })
  } catch (e: any) {
    console.error('POST store-categories error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

// PATCH — update category (name, sort_order, is_active)
export async function PATCH(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureTable()
    const body = await request.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })

    const sets: string[] = []
    const params: any[] = []
    let idx = 1

    if (body.name !== undefined) { sets.push(`name = $${idx++}`); params.push(body.name) }
    if (body.slug !== undefined) { sets.push(`slug = $${idx++}`); params.push(body.slug) }
    if (body.sort_order !== undefined) { sets.push(`sort_order = $${idx++}`); params.push(body.sort_order) }
    if (body.is_active !== undefined) { sets.push(`is_active = $${idx++}`); params.push(body.is_active) }
    sets.push(`updated_at = now()`)

    params.push(body.id)
    const rows = await query(
      `UPDATE store_categories SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    )
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

// DELETE — remove a category
export async function DELETE(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureTable()
    const body = await request.json()
    if (!body.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })

    // Unassign products first
    await query(`UPDATE products SET store_category_id = NULL WHERE store_category_id = $1`, [body.id])
    await query(`DELETE FROM store_categories WHERE id = $1`, [body.id])
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
