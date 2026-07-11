import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { ensureStockColumn } from '@/lib/orderPricing'
import { verifyPreviewToken } from '@/lib/previewToken'

// Public endpoint — no authentication required.
// Returns all data needed by the store product detail page in one request,
// so store components don't need to call any admin API endpoints.
//
// Draft preview (store redesign P4): a valid ?preview=<token> (signed HMAC of
// this product id + hour bucket — lib/previewToken.ts) additionally allows
// fetching THIS product while it is inactive, so the storefront page can be
// previewed before publishing. The list endpoint (../route.ts) never honors
// the token — inactive products stay out of lists/search unconditionally.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await ensureStockColumn().catch(() => {})
    let row = await queryOne(
      `SELECT
        p.id,
        p.name,
        pt.slug          AS type,
        p.base_price,
        p.default_config,
        p.is_active,
        p.stock_qty,
        p.template_key,
        p.store_category_id
       FROM products p
       JOIN product_types pt ON pt.id = p.product_type_id
       WHERE p.id = $1 AND p.is_active = true`,
      [id]
    )

    if (!row) {
      // Not active — allow through ONLY with a valid draft-preview token.
      let previewToken: string | null = null
      try { previewToken = new URL(request.url).searchParams.get('preview') } catch { /* ignore */ }
      if (previewToken && verifyPreviewToken(id, previewToken)) {
        row = await queryOne(
          `SELECT
            p.id,
            p.name,
            pt.slug          AS type,
            p.base_price,
            p.default_config,
            p.is_active,
            p.stock_qty,
            p.template_key,
            p.store_category_id
           FROM products p
           JOIN product_types pt ON pt.id = p.product_type_id
           WHERE p.id = $1`,
          [id]
        )
      }
    }

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
          // Storefront template dispatch (NULL = legacy type-based mapping)
          template_key: row.template_key || null,
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
