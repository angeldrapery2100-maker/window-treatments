import { NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json() as any
    const code = (body.code || '').trim().toUpperCase()
    // Optional: order_total to enforce min_order at validation time
    const orderTotal = body.order_total != null ? Number(body.order_total) : null

    if (!code) {
      return NextResponse.json({ success: false, error: 'Please enter a discount code' }, { status: 400 })
    }

    // Ensure table exists
    await query(`CREATE TABLE IF NOT EXISTS discount_codes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code varchar(64) NOT NULL UNIQUE,
      description varchar(256) DEFAULT '',
      discount_type varchar(16) NOT NULL DEFAULT 'percent',
      discount_value numeric(10,2) NOT NULL DEFAULT 0,
      min_order numeric(10,2) DEFAULT 0,
      max_uses int DEFAULT NULL,
      used_count int DEFAULT 0,
      starts_at timestamptz DEFAULT now(),
      expires_at timestamptz DEFAULT NULL,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )`)

    const discount = await queryOne(
      `SELECT * FROM discount_codes WHERE UPPER(code) = $1 AND is_active = true`,
      [code]
    )

    if (!discount) {
      return NextResponse.json({ success: false, error: 'Invalid discount code' }, { status: 400 })
    }

    // Check dates
    const now = new Date()
    if (discount.starts_at && new Date(discount.starts_at) > now) {
      return NextResponse.json({ success: false, error: 'This code is not yet active' }, { status: 400 })
    }
    if (discount.expires_at && new Date(discount.expires_at) < now) {
      return NextResponse.json({ success: false, error: 'This code has expired' }, { status: 400 })
    }

    // Check max uses
    if (discount.max_uses != null && discount.used_count >= discount.max_uses) {
      return NextResponse.json({ success: false, error: 'This code has reached its usage limit' }, { status: 400 })
    }

    // Check minimum order amount (backend enforcement)
    const minOrder = Number(discount.min_order) || 0
    if (minOrder > 0 && orderTotal !== null && orderTotal < minOrder) {
      return NextResponse.json({
        success: false,
        error: `This code requires a minimum order of $${minOrder.toFixed(2)}`,
        min_order: minOrder,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        code: discount.code,
        discount_type: discount.discount_type,
        discount_value: Number(discount.discount_value),
        min_order: minOrder,
        description: discount.description,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
