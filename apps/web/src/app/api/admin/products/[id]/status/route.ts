import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body = await request.json()
  const { status } = body

  try {
    const isActive = status === 'active'

    const updated = await queryOne(
      `UPDATE products SET is_active = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, is_active`,
      [isActive, id]
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product status updated'
    })
  } catch (error) {
    console.error(`PATCH /api/admin/products/${id}/status error:`, error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '更新状态失败' } },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
