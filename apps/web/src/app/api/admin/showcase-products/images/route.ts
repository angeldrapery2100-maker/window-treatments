import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// POST — add image record
export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { product_id, image_url, image_width = 0, image_height = 0, image_fit = 'cover', caption = '', image_type = 'thumb', sort_order = 0 } = body

    if (!product_id || !image_url) {
      return NextResponse.json({ success: false, error: { message: 'product_id and image_url required' } }, { status: 400 })
    }

    const result = await pool.query(`
      INSERT INTO showcase_product_images (product_id, image_url, image_width, image_height, image_fit, caption, image_type, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [product_id, image_url, image_width, image_height, image_fit, caption, image_type, sort_order])

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (e) {
    console.error('POST showcase-products/images error:', e)
    return NextResponse.json({ success: false, error: { message: 'Could not save changes. Please try again.' } }, { status: 500 })
  }
}

// DELETE — remove image record
export async function DELETE(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: { message: 'id required' } }, { status: 400 })
    await pool.query('DELETE FROM showcase_product_images WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE showcase-products/images error:', e)
    return NextResponse.json({ success: false, error: { message: 'Could not delete the image. Please try again.' } }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
