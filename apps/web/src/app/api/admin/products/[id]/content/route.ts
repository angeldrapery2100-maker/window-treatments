import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const product = await queryOne('SELECT default_config FROM products WHERE id = $1', [id])
    if (!product) return NextResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 })
    const blocks = product.default_config?.content_blocks || []
    return NextResponse.json({ success: true, data: { blocks } })
  } catch (e) {
    return NextResponse.json({ success: false, error: { message: '查询失败' } }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const { blocks } = await request.json()
    const existing = await queryOne('SELECT default_config FROM products WHERE id = $1', [id])
    if (!existing) return NextResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 })

    const updatedConfig = { ...(existing.default_config || {}), content_blocks: blocks }
    await queryOne(
      'UPDATE products SET default_config = $1::jsonb, updated_at = NOW() WHERE id = $2 RETURNING id',
      [JSON.stringify(updatedConfig), id]
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: { message: '保存失败' } }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
