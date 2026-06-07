import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// ============================================================
// Auto-create tables on first request
// ============================================================
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS showcase_products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(256) NOT NULL,
      slug VARCHAR(256) UNIQUE,
      description TEXT DEFAULT '',
      long_description TEXT DEFAULT '',
      features JSONB DEFAULT '[]'::jsonb,
      cover_image TEXT DEFAULT '',
      cover_width INTEGER DEFAULT 0,
      cover_height INTEGER DEFAULT 0,
      cover_fit VARCHAR(32) DEFAULT 'cover',
      status VARCHAR(32) DEFAULT 'active',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS showcase_product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES showcase_products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      image_width INTEGER DEFAULT 0,
      image_height INTEGER DEFAULT 0,
      image_fit VARCHAR(32) DEFAULT 'cover',
      caption TEXT DEFAULT '',
      image_type VARCHAR(32) DEFAULT 'thumb',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS showcase_product_sections (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES showcase_products(id) ON DELETE CASCADE,
      title VARCHAR(256) DEFAULT '',
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      image_width INTEGER DEFAULT 0,
      image_height INTEGER DEFAULT 0,
      image_fit VARCHAR(32) DEFAULT 'cover',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `)
}

// GET /api/admin/showcase-products
// GET /api/admin/showcase-products?id=3
export async function GET(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureTables()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')

    if (id) {
      // Single product with images and sections
      const product = (await pool.query('SELECT * FROM showcase_products WHERE id = $1', [id])).rows[0]
      if (!product) return NextResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 })

      const images = (await pool.query(
        'SELECT * FROM showcase_product_images WHERE product_id = $1 ORDER BY sort_order', [id]
      )).rows

      const sections = (await pool.query(
        'SELECT * FROM showcase_product_sections WHERE product_id = $1 ORDER BY sort_order', [id]
      )).rows

      return NextResponse.json({ success: true, data: { ...product, images, sections } })
    }

    // All products list
    let query = 'SELECT * FROM showcase_products'
    const params: any[] = []
    if (status) {
      query += ' WHERE status = $1'
      params.push(status)
    }
    query += ' ORDER BY sort_order, id'

    const products = (await pool.query(query, params)).rows
    return NextResponse.json({ success: true, data: products })
  } catch (e) {
    console.error('GET showcase-products error:', e)
    return NextResponse.json({ success: false, error: { message: 'Could not load showcase products.' } }, { status: 500 })
  }
}

// POST /api/admin/showcase-products — create or update product
export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureTables()
    const body = await request.json()
    const {
      id, name, slug, description = '', long_description = '',
      features = [], cover_image = '', cover_width = 0, cover_height = 0,
      cover_fit = 'cover', status = 'active', sort_order = 0
    } = body

    if (!name) {
      return NextResponse.json({ success: false, error: { message: 'name is required' } }, { status: 400 })
    }

    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    if (id) {
      // Update
      const result = await pool.query(`
        UPDATE showcase_products SET
          name = $1, slug = $2, description = $3, long_description = $4,
          features = $5, cover_image = $6, cover_width = $7, cover_height = $8,
          cover_fit = $9, status = $10, sort_order = $11, updated_at = now()
        WHERE id = $12 RETURNING *
      `, [name, autoSlug, description, long_description, JSON.stringify(features),
          cover_image, cover_width, cover_height, cover_fit, status, sort_order, id])

      return NextResponse.json({ success: true, data: result.rows[0] })
    } else {
      // Create
      const result = await pool.query(`
        INSERT INTO showcase_products (name, slug, description, long_description, features, cover_image, cover_width, cover_height, cover_fit, status, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [name, autoSlug, description, long_description, JSON.stringify(features),
          cover_image, cover_width, cover_height, cover_fit, status, sort_order])

      return NextResponse.json({ success: true, data: result.rows[0] })
    }
  } catch (e) {
    console.error('POST showcase-products error:', e)
    return NextResponse.json({ success: false, error: { message: 'Could not save changes. Please try again.' } }, { status: 500 })
  }
}

// DELETE /api/admin/showcase-products
export async function DELETE(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureTables()
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: { message: 'id required' } }, { status: 400 })
    await pool.query('DELETE FROM showcase_products WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE showcase-products error:', e)
    return NextResponse.json({ success: false, error: { message: 'Could not delete the showcase product. Please try again.' } }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
