// Server-side cart persistence for logged-in users (cross-device sync).
//
// One row per user in `carts`, storing the CartItem[] JSON plus the applied
// discount. localStorage remains the instant local cache on the client; this
// table is the source of truth that lets a signed-in customer see the same
// cart on another browser / device. See lib/cart.ts for the client sync logic.
//
// Prices are NOT trusted from here — orderPricing re-computes every line at
// checkout — so we store the cart JSON as-is (with light size guards).

import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { errorResponse } from '@/lib/apiError'

const MAX_ITEMS = 200
const MAX_JSON_BYTES = 256 * 1024 // 256 KB — a cart this big is already abuse

let ready = false
async function ensureCartsTable(): Promise<void> {
  if (ready) return
  await query(`CREATE TABLE IF NOT EXISTS carts (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    items jsonb NOT NULL DEFAULT '[]',
    discount_code varchar(64) DEFAULT NULL,
    discount_type varchar(16) DEFAULT NULL,
    discount_value numeric(10,2) DEFAULT 0,
    updated_at timestamptz DEFAULT now()
  )`)
  ready = true
}

// Row → client Cart shape (matches lib/cart.ts `Cart`).
function rowToCart(row: any) {
  return {
    items: Array.isArray(row?.items) ? row.items : [],
    discountCode: row?.discount_code ?? undefined,
    discountType: (row?.discount_type as 'percent' | 'fixed' | null) ?? undefined,
    // Cart.discountPercent historically stores the discount_value (see cart.ts).
    discountPercent: row?.discount_value != null ? Number(row.discount_value) : undefined,
  }
}

export async function GET(request: Request) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  try {
    await ensureCartsTable()
    const row = await queryOne<any>('SELECT * FROM carts WHERE user_id = $1', [user.id])
    return NextResponse.json({ success: true, data: { cart: row ? rowToCart(row) : { items: [] } } })
  } catch (e) {
    return errorResponse('Could not load your cart.', 500, e)
  }
}

export async function PUT(request: Request) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  try {
    const body = await request.json().catch(() => null) as any
    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json({ success: false, error: 'Invalid cart payload' }, { status: 400 })
    }
    // Size guards — never trust an unbounded client payload.
    const items = body.items.slice(0, MAX_ITEMS)
    const itemsJson = JSON.stringify(items)
    if (Buffer.byteLength(itemsJson, 'utf8') > MAX_JSON_BYTES) {
      return NextResponse.json({ success: false, error: 'Cart too large' }, { status: 413 })
    }

    const discountCode  = body.discountCode ? String(body.discountCode).slice(0, 64) : null
    const discountType  = body.discountType === 'percent' || body.discountType === 'fixed' ? body.discountType : null
    const discountValue = Number.isFinite(Number(body.discountPercent)) ? Number(body.discountPercent) : 0

    await ensureCartsTable()
    await query(
      `INSERT INTO carts (user_id, items, discount_code, discount_type, discount_value, updated_at)
       VALUES ($1, $2::jsonb, $3, $4, $5, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET items = EXCLUDED.items,
             discount_code = EXCLUDED.discount_code,
             discount_type = EXCLUDED.discount_type,
             discount_value = EXCLUDED.discount_value,
             updated_at = NOW()`,
      [user.id, itemsJson, discountCode, discountType, discountValue]
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return errorResponse('Could not save your cart.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
