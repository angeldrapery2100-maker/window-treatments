import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query } from '@/lib/db'

// Public read-only endpoint — returns active store products with category info.
// Supports optional ?type=shade|drapery|sheer|hardware filter.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const typeFilter = searchParams.get('type')

    const whereClause = typeFilter
      ? `WHERE p.is_active = true AND pt.slug = $1`
      : `WHERE p.is_active = true`
    const queryArgs = typeFilter ? [typeFilter] : []

    // NOTE: the products table uses is_active (boolean), not a status text column.
    const products = await query(`
      SELECT
        p.id, p.name, p.base_price, p.default_config,
        pt.slug AS type,
        COALESCE(
          p.default_config->'images'->'main'->0->>'url'
        ) AS main_image_url,
        sc.id   AS store_category_id,
        sc.name AS store_category_name,
        sc.slug AS store_category_slug
      FROM products p
      JOIN product_types pt ON pt.id = p.product_type_id
      LEFT JOIN store_categories sc ON sc.id = p.store_category_id
      ${whereClause}
      ORDER BY p.created_at DESC
    `, queryArgs).catch(() => [])

    return NextResponse.json(
      { success: true, data: { products } },
      // Catalog changes rarely; let the edge serve it for 5 min.
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (e) {
    return errorResponse('Could not load products.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
