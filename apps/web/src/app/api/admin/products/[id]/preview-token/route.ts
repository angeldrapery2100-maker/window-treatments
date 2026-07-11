import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { createPreviewToken } from '@/lib/previewToken'

// Mint a short-lived draft-preview token for a product (store redesign P4).
// The token lets the bearer view THIS product's storefront page/API while it
// is inactive — see lib/previewToken.ts for the security design.

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
    const product = await queryOne<{ id: string; is_active: boolean }>(
      'SELECT id, is_active FROM products WHERE id = $1',
      [id]
    )
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    const token = createPreviewToken(id)
    return NextResponse.json({
      success: true,
      data: {
        token,
        url: `/store/${id}?preview=${token}`,
        // Practical lifetime: verification accepts current + previous hour.
        expires_in_hint: 'valid for 1–2 hours',
        is_active: product.is_active,
      },
    })
  } catch (e) {
    console.error('POST preview-token error:', e)
    return errorResponse('Could not create preview link. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
