import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// default_config.detail_canvas — the free-form 详情版面 layout
// (编辑产品 → 详情版面 tab; rendered by shared/DetailCanvas on the store).
// Dedicated endpoint (not part of the page-level params/options save) so the
// canvas can never clobber pricing params and vice versa: every writer merges
// into default_config preserving sibling keys.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    return NextResponse.json({
      success: true,
      data: { canvas: product.default_config?.detail_canvas || null },
    })
  } catch (error) {
    console.error(`GET /api/admin/products/${id}/detail-canvas error:`, error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '查询详情版面失败' } },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const body = await request.json()
    // canvas: object to set, null to clear (storefront falls back to Gallery).
    const canvas = body?.canvas ?? null
    if (canvas !== null && (typeof canvas !== 'object' || !Array.isArray(canvas.blocks))) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'canvas must be null or { bg, height, blocks[] }' } },
        { status: 400 }
      )
    }

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

    const cfg = { ...(existing.default_config || {}) } as Record<string, any>
    if (canvas === null) delete cfg.detail_canvas
    else cfg.detail_canvas = canvas

    await queryOne(
      `UPDATE products SET default_config = $1::jsonb, updated_at = NOW() WHERE id = $2 RETURNING id`,
      [JSON.stringify(cfg), id]
    )

    return NextResponse.json({ success: true, message: 'Detail canvas saved' })
  } catch (error) {
    console.error(`PUT /api/admin/products/${id}/detail-canvas error:`, error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '保存详情版面失败' } },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
