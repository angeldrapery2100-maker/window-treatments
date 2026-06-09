// Re-validate a (localStorage) cart against current server prices/availability.
// The cart can be days old; products may have been re-priced or deactivated.
// Returns, per line, the authoritative current unit price and an availability
// flag so the cart page can update displayed prices and flag dead items BEFORE
// the customer reaches checkout (where the same server pricing is enforced).

import { NextResponse } from 'next/server'
import { computeServerUnitPrice } from '@/lib/productPricing'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as any
    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) return NextResponse.json({ success: true, data: { items: [] } })
    if (items.length > 50) return NextResponse.json({ success: false, error: 'Too many items' }, { status: 400 })

    const out = await Promise.all(items.map(async (it: any) => {
      const clientPrice = Number(it.unitPrice) || 0
      try {
        const server = await computeServerUnitPrice({
          productId: it.productId,
          width: it.width,
          height: it.height,
          widthFraction: it.widthFraction,
          heightFraction: it.heightFraction,
          options: it.options,
        })
        const unitPrice = server.unitPrice
        return {
          id: it.id ?? null,
          productId: it.productId,
          available: true,
          unitPrice,
          changed: clientPrice > 0 && Math.abs(unitPrice - clientPrice) > 0.5,
        }
      } catch {
        // Unknown/inactive product, or can no longer be priced → unavailable.
        return { id: it.id ?? null, productId: it.productId, available: false, unitPrice: 0, changed: true }
      }
    }))

    return NextResponse.json({ success: true, data: { items: out } })
  } catch (e) {
    console.error('[cart/validate] failed:', e)
    return NextResponse.json({ success: false, error: 'Could not validate cart.' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
