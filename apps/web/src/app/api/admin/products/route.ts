import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { recordAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth'

async function ensureStoreCategories() {
  await query(`CREATE TABLE IF NOT EXISTS store_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(256) NOT NULL,
    slug varchar(128) NOT NULL UNIQUE,
    sort_order int DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  const col = await query(
    `SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='store_category_id'`
  )
  if (col.length === 0) {
    await query(`ALTER TABLE products ADD COLUMN store_category_id uuid REFERENCES store_categories(id) ON DELETE SET NULL`)
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type   = searchParams.get('type')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit  = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  try {
    await ensureStoreCategories()

    let sql = `
      SELECT 
        p.id, p.sku, p.name,
        pt.slug AS type,
        p.base_price, p.images,
        COALESCE(
          p.images->>0,
          p.default_config->'images'->'main'->0->>'url'
        ) AS main_image_url,
        p.default_config,
        p.is_active,
        p.store_category_id,
        sc.name AS store_category_name,
        sc.slug AS store_category_slug,
        p.created_at, p.updated_at
      FROM products p
      JOIN product_types pt ON pt.id = p.product_type_id
      LEFT JOIN store_categories sc ON sc.id = p.store_category_id
      WHERE 1=1
    `
    const params: any[] = []
    let idx = 1

    if (type && type !== 'all') {
      sql += ` AND pt.slug = $${idx++}`
      params.push(type)
    }
    if (status && status !== 'all') {
      sql += ` AND p.is_active = $${idx++}`
      params.push(status === 'active')
    }
    if (search) {
      sql += ` AND (p.name ILIKE $${idx} OR p.sku ILIKE $${idx})`
      params.push(`%${search}%`)
      idx++
    }

    // Count
    const countSql = sql.replace(
      /SELECT[\s\S]*?FROM products/,
      'SELECT COUNT(*) AS cnt FROM products'
    )
    const countRow = await queryOne<{ cnt: string }>(countSql, params)
    const total = parseInt(countRow?.cnt ?? '0', 10)

    sql += ` ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`
    params.push(limit, (page - 1) * limit)

    const products = await query(sql, params)

    const formatted = products.map((p: any) => ({
      ...p,
      status: p.is_active ? 'active' : 'inactive',
      main_image_url: p.main_image_url || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        products: formatted,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    })
  } catch (error) {
    console.error('GET /api/admin/products error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '数据库查询失败' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = requireAdmin(request)
    const body = await request.json() as any

    if (!body.name || !body.type) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '产品名称和系列不能为空' } },
        { status: 400 }
      )
    }

    const typeRows = await query(
      'SELECT id FROM product_types WHERE slug = $1 AND is_active = true',
      [body.type]
    )
    if (typeRows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TYPE', message: `产品系列 "${body.type}" 不存在` } },
        { status: 400 }
      )
    }

    const productTypeId = typeRows[0].id
    const sku = `${body.type.toUpperCase()}-${Date.now()}`
    const isActive = body.status === 'active'

    const rows = await query(
      `INSERT INTO products (product_type_id, sku, name, base_price, default_config, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, sku, is_active, created_at`,
      [productTypeId, sku, body.name, body.base_price ?? 0,
       JSON.stringify({ description: body.description || '', sort_order: body.sort_order || 0 }),
       isActive]
    )
    const newProduct = rows[0]

    await recordAudit({
      action: 'product.created',
      actor_id: adminUser.id,
      actor_email: adminUser.email,
      target_type: 'product',
      target_id: newProduct.id,
      after: { name: body.name, type: body.type },
    })

    return NextResponse.json({
      success: true,
      data: { product_id: newProduct.id, product: newProduct },
      message: 'Product created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/products error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '创建产品失败' } },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
