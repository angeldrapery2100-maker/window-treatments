import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// POST — create or update section
export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { id, product_id, title = '', description = '', image_url = '', image_width = 0, image_height = 0, image_fit = 'cover', sort_order = 0 } = body

    if (!product_id) {
      return NextResponse.json({ success: false, error: { message: 'product_id required' } }, { status: 400 })
    }

    if (id) {
      const result = await pool.query(`
        UPDATE showcase_product_sections SET title=$1, description=$2, image_url=$3, image_width=$4, image_height=$5, image_fit=$6, sort_order=$7
        WHERE id=$8 RETURNING *
      `, [title, description, image_url, image_width, image_height, image_fit, sort_order, id])
      return NextResponse.json({ success: true, data: result.rows[0] })
    } else {
      const result = await pool.query(`
        INSERT INTO showcase_product_sections (product_id, title, description, image_url, image_width, image_height, image_fit, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, [product_id, title, description, image_url, image_width, image_height, image_fit, sort_order])
      return NextResponse.json({ success: true, data: result.rows[0] })
    }
  } catch (e) {
    console.error('POST showcase-products/sections error:', e)
    return NextResponse.json({ success: false, error: { message: 'Could not save changes. Please try again.' } }, { status: 500 })
  }
}

// DELETE
export async function DELETE(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: { message: 'id required' } }, { status: 400 })
    await pool.query('DELETE FROM showcase_product_sections WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE showcase-products/sections error:', e)
    return NextResponse.json({ success: false, error: { message: 'Could not delete the section. Please try again.' } }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
