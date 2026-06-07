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
      return NextResponse.json({ success: false, error: { message: 'Product not found' } }, { status: 404 })
    }
    const images = product.default_config?.images || { main: [], gallery: [] }
    return NextResponse.json({ success: true, data: images })
  } catch (error) {
    console.error('GET images error:', error)
    return NextResponse.json({ success: false, error: { message: '查询图片失败' } }, { status: 500 })
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
    const mainImages = body.main || []
    const galleryImages = body.gallery || []

    if (mainImages.length > 0) {
    }

    // 先检查产品存不存在
    const existing = await queryOne(
      'SELECT id, default_config FROM products WHERE id = $1',
      [id]
    )
    
    
    if (!existing) {
      return NextResponse.json({ success: false, error: { message: `Product not found: ${id}` } }, { status: 404 })
    }

    const primaryImageUrl = mainImages.length > 0 ? mainImages[0].url : null

    const updatedConfig = {
      ...(existing.default_config || {}),
      images: { main: mainImages, gallery: galleryImages }
    }

    const result = await queryOne(
      `UPDATE products 
       SET default_config = $1::jsonb,
           images = $2::jsonb,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, images`,
      [
        JSON.stringify(updatedConfig),
        JSON.stringify(primaryImageUrl ? [primaryImageUrl] : []),
        id
      ]
    )


    return NextResponse.json({ 
      success: true, 
      message: 'Images saved successfully',
      debug: { id, mainCount: mainImages.length, galleryCount: galleryImages.length, updated: !!result }
    })
  } catch (error) {
    console.error('[images PUT] error:', error)
    return NextResponse.json({ success: false, error: { message: (error instanceof Error ? error.message : '') || '保存图片失败' } }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
