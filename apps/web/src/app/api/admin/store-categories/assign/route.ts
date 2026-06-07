import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// PATCH — assign store_category_id to a product
export async function PATCH(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    if (!body.product_id) return NextResponse.json({ success: false, error: 'product_id required' }, { status: 400 })

    await query(
      `UPDATE products SET store_category_id = $1, updated_at = now() WHERE id = $2`,
      [body.store_category_id || null, body.product_id]
    )
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
