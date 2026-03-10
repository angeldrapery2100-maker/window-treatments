import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
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
    const product = await queryOne(
      'SELECT default_config FROM products WHERE id = $1',
      [id]
    )

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }

    const params_data = product.default_config?.params || {}

    return NextResponse.json({
      success: true,
      data: { params: params_data }
    })
  } catch (error) {
    console.error(`GET /api/admin/products/${id}/params error:`, error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '查询参数失败' } },
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

    const existing = await queryOne(
      'SELECT default_config FROM products WHERE id = $1',
      [id]
    )

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }

    const updatedConfig = {
      ...(existing.default_config || {}),
      params: body
    }

    await queryOne(
      `UPDATE products SET default_config = $1::jsonb, updated_at = NOW() WHERE id = $2 RETURNING id`,
      [JSON.stringify(updatedConfig), id]
    )


    return NextResponse.json({
      success: true,
      message: 'Parameters saved successfully'
    })
  } catch (error) {
    console.error(`PUT /api/admin/products/${id}/params error:`, error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '保存参数失败' } },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
