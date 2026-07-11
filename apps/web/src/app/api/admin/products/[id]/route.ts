import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty integer DEFAULT NULL`).catch(() => {})
    await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS template_key varchar(32) DEFAULT NULL`).catch(() => {})
    const product = await queryOne(
      `SELECT
        p.id,
        p.sku,
        p.name,
        pt.slug AS type,
        p.base_price,
        p.images,
        p.default_config,
        p.is_active,
        p.stock_qty,
        p.template_key,
        p.created_at,
        p.updated_at
       FROM products p
       JOIN product_types pt ON pt.id = p.product_type_id
       WHERE p.id = $1`,
      [id]
    )

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }

    const formatted = {
      ...product,
      status: product.is_active ? 'active' : 'inactive',
      description: product.default_config?.description || '',
      sort_order: product.default_config?.sort_order || 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        product: formatted,
        params: {},
        images: { main: [], gallery: [] },
        options: []
      }
    })
  } catch (error) {
    console.error(`GET /api/admin/products/${id} error:`, error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '查询产品失败' } },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const body = await request.json()
    const isActive = body.status === 'active'

    // Optional stock tracking: undefined = leave unchanged; null/'' = untracked
    // (unlimited); otherwise must be a non-negative integer.
    let stockQty: number | null | undefined = undefined
    if ('stock_qty' in body) {
      if (body.stock_qty === null || body.stock_qty === '') {
        stockQty = null
      } else {
        const n = Number(body.stock_qty)
        if (!Number.isInteger(n) || n < 0) {
          return NextResponse.json(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'stock_qty must be a non-negative integer or null' } },
            { status: 400 }
          )
        }
        stockQty = n
      }
    }

    // Optional fixed price (accessory products): undefined = leave unchanged.
    let basePrice: number | undefined = undefined
    if ('base_price' in body && body.base_price !== null && body.base_price !== '') {
      const n = Number(body.base_price)
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'base_price must be a non-negative number' } },
          { status: 400 }
        )
      }
      basePrice = n
    }

    // Optional storefront template override: undefined = leave unchanged;
    // '' / null = clear (fall back to legacy type-based dispatch).
    let templateKey: string | null | undefined = undefined
    if ('template_key' in body) {
      templateKey = typeof body.template_key === 'string' && body.template_key.trim()
        ? body.template_key.trim().slice(0, 32)
        : null
    }

    await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty integer DEFAULT NULL`).catch(() => {})
    await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS template_key varchar(32) DEFAULT NULL`).catch(() => {})

    // 查出 product_type_id
    const productType = await queryOne<{ id: string }>(
      'SELECT id FROM product_types WHERE slug = $1',
      [body.type]
    )

    // 先读取现有 default_config，保留 options/params/images
    const existing = await queryOne(
      'SELECT default_config, base_price FROM products WHERE id = $1',
      [id]
    )
    const mergedConfig = {
      ...(existing?.default_config || {}),
      description: body.description || '',
      sort_order: body.sort_order || 0
    }

    // Publish gate: an ACTIVE product must have a sellable price and at least
    // one main image — otherwise customers see a broken listing. Drafts
    // (inactive) can stay incomplete.
    if (isActive) {
      const cfg: any = mergedConfig
      // Accessory (fixed-price, no engine): the ONLY valid price is
      // base_price > 0 — options/starting_price don't make it sellable.
      const effectiveBasePrice = basePrice ?? (Number(existing?.base_price) || 0)
      const hasPrice = body.type === 'accessory'
        ? effectiveBasePrice > 0
        : (Number(cfg?.starting_price) > 0) ||
          (Array.isArray(cfg?.options) && cfg.options.length > 0)
      const hasImage = Array.isArray(cfg?.images?.main) && cfg.images.main.length > 0
      const missing: string[] = []
      if (!hasPrice) {
        missing.push(body.type === 'accessory'
          ? 'a fixed price (base_price) greater than 0'
          : 'a starting price or at least one priced option')
      }
      if (!hasImage) missing.push('at least one main image')
      if (missing.length > 0) {
        return NextResponse.json(
          { success: false, error: { code: 'PUBLISH_VALIDATION', message: `Cannot publish: product needs ${missing.join(' and ')}. Save it as inactive, or complete the listing first.` } },
          { status: 400 }
        )
      }
    }

    const updated = await queryOne(
      `UPDATE products SET
        name = $1,
        default_config = $2::jsonb,
        is_active = $3,
        product_type_id = COALESCE($5, product_type_id),
        stock_qty = CASE WHEN $6::boolean THEN $7::int ELSE stock_qty END,
        base_price = COALESCE($8::numeric, base_price),
        template_key = CASE WHEN $9::boolean THEN $10::varchar ELSE template_key END,
        updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, is_active, stock_qty, base_price, template_key, updated_at`,
      [body.name, JSON.stringify(mergedConfig), isActive, id, productType?.id ?? null,
       stockQty !== undefined, stockQty ?? null,
       basePrice ?? null,
       templateKey !== undefined, templateKey ?? null]
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }


    return NextResponse.json({
      success: true,
      data: { product: updated },
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error(`PUT /api/admin/products/${id} error:`, error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '更新产品失败' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    const deleted = await queryOne(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    )

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }


    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error(`DELETE /api/admin/products/${id} error:`, error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '删除产品失败' } },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
