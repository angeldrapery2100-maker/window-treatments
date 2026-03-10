import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// 一次性修复：把所有产品的 default_config.images.main[0].url 同步到顶层 images 字段
export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await query(`
      UPDATE products
      SET images = jsonb_build_array(default_config->'images'->'main'->0->>'url'),
          updated_at = NOW()
      WHERE 
        (images IS NULL OR jsonb_array_length(images) = 0)
        AND default_config->'images'->'main'->0->>'url' IS NOT NULL
      RETURNING id, name, images
    `)

    return NextResponse.json({
      success: true,
      message: '已修复 ' + result.length + ' 个产品的主图',
      data: result.map((r: any) => ({ id: r.id, name: r.name, images: r.images }))
    })
  } catch (e: any) {
    console.error('Fix images error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
