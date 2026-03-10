import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Public read-only endpoint — returns active store categories with product counts
export async function GET() {
  try {
    const categories = await query(`
      SELECT
        sc.id, sc.name, sc.slug, sc.sort_order,
        COUNT(p.id)::int AS product_count
      FROM store_categories sc
      LEFT JOIN products p ON p.store_category_id = sc.id AND p.status = 'active'
      WHERE sc.is_active = true
      GROUP BY sc.id
      ORDER BY sc.sort_order, sc.name
    `).catch(() => [])

    return NextResponse.json({ success: true, data: categories })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
