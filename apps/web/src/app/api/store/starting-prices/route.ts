import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const products = await query(`
      SELECT p.id, p.base_price, p.default_config
      FROM products p
      WHERE p.is_active = true
    `)

    const prices: Record<string, number | null> = {}

    for (const p of products) {
      // Priority: saved starting_price > base_price
      const savedPrice = p.default_config?.starting_price
      if (savedPrice != null && typeof savedPrice === 'number' && savedPrice > 0) {
        prices[p.id] = savedPrice
      } else {
        prices[p.id] = p.base_price ? Number(p.base_price) : null
      }
    }

    return NextResponse.json(
      { success: true, data: prices },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (e) {
    console.error('GET starting-prices error:', e)
    return errorResponse('Could not load starting prices.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
