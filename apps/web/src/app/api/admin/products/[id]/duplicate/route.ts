import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  try {
    // 读取原产品完整数据（所有内容都在 default_config 里）
    const original = await queryOne(
      `SELECT product_type_id, sku, name, base_price, images, default_config, is_active
       FROM products WHERE id = $1`,
      [id]
    )

    if (!original) {
      return NextResponse.json({ success: false, error: { message: 'Product not found' } }, { status: 404 })
    }

    const toJson = (v: any) => v == null ? '{}' : typeof v === 'string' ? v : JSON.stringify(v)

    const newSku = `${original.sku || 'product'}-copy-${Date.now().toString().slice(-6)}`

    // 直接复制整行，default_config 包含 images/options/params/content_blocks 所有内容
    const newProduct = await queryOne<{ id: string }>(
      `INSERT INTO products (product_type_id, sku, name, base_price, images, default_config, is_active)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, false)
       RETURNING id`,
      [
        original.product_type_id,
        newSku,
        `${original.name} (副本)`,
        original.base_price,
        toJson(original.images),
        toJson(original.default_config),
      ]
    )

    return NextResponse.json({ success: true, data: { new_product_id: newProduct!.id } })
  } catch (error) {
    console.error('Duplicate product error:', error)
    return NextResponse.json(
      { success: false, error: { message: (error instanceof Error ? error.message : '') || '复制产品失败' } },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
