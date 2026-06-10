import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query } from '@/lib/db'

// Public read-only endpoint — returns active store categories with product counts
export async function GET() {
  try {
    // NOTE: products has is_active (boolean) — there is no status text column.
    // (A previous p.status = 'active' here threw, and the .catch silently
    // returned an empty category list.) Don't swallow query errors.
    const categories = await query(`
      SELECT
        sc.id, sc.name, sc.slug, sc.sort_order,
        COUNT(p.id)::int AS product_count
      FROM store_categories sc
      LEFT JOIN products p ON p.store_category_id = sc.id AND p.is_active = true
      WHERE sc.is_active = true
      GROUP BY sc.id
      ORDER BY sc.sort_order, sc.name
    `)

    return NextResponse.json(
      { success: true, data: categories },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (e) {
    return errorResponse('Could not load categories.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
