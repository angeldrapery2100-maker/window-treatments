import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
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

  try {
    const body = await request.json()
    const startingPrice = body.starting_price

    if (startingPrice == null || typeof startingPrice !== 'number') {
      return NextResponse.json({ success: false, error: 'starting_price is required' }, { status: 400 })
    }

    // Save to default_config.starting_price
    const existing = await queryOne(
      'SELECT default_config FROM products WHERE id = $1',
      [id]
    )
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    const updatedConfig = {
      ...(existing.default_config || {}),
      starting_price: startingPrice,
    }

    await query(
      `UPDATE products SET default_config = $1::jsonb, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(updatedConfig), id]
    )

    return NextResponse.json({ success: true, data: { starting_price: startingPrice } })
  } catch (e: any) {
    console.error(`PATCH starting-price error:`, e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
