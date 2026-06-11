import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { ensureStockColumn } from '@/lib/orderPricing'

// Public endpoint — no authentication required.
// Returns all data needed by the store product detail page in one request,
// so store components don't need to call any admin API endpoints.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await ensureStockColumn().catch(() => {})
    const row = await queryOne(
      `SELECT
        p.id,
        p.name,
        pt.slug          AS type,
        p.base_price,
        p.default_config,
        p.is_active,
        p.stock_qty,
        p.store_category_id
       FROM products p
       JOIN product_types pt ON pt.id = p.product_type_id
       WHERE p.id = $1 AND p.is_active = true`,
      [id]
    )

    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const cfg = row.default_config || {}

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id:          row.id,
          name:        row.name,
          type:        row.type,
          base_price:  row.base_price,
          description: cfg.description || '',
          is_active:   row.is_active,
          // NULL = untracked/unlimited; number = finite stock (hardware)
          stock_qty:   row.stock_qty == null ? null : Number(row.stock_qty),
        },
        // All sub-data extracted from default_config — no extra round-trips needed
        images: {
          main:    cfg.images?.main    || [],
          gallery: cfg.images?.gallery || [],
        },
        options:        cfg.options        || [],
        params:         cfg.params         || {},
        content_blocks: cfg.content_blocks || [],
      }
    })
  } catch (error) {
    console.error(`GET /api/store/products/${id} error:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to load product' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
