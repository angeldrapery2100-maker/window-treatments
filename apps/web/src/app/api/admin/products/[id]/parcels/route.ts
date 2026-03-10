import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

async function ensureTable() {
  await query(`CREATE TABLE IF NOT EXISTS product_parcel_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL,
    rule_name varchar(128) DEFAULT '',
    min_width numeric(10,2) DEFAULT 0,
    max_width numeric(10,2) DEFAULT 999,
    min_height numeric(10,2) DEFAULT 0,
    max_height numeric(10,2) DEFAULT 999,
    parcel_length numeric(10,2) NOT NULL DEFAULT 20,
    parcel_width numeric(10,2) NOT NULL DEFAULT 15,
    parcel_height numeric(10,2) NOT NULL DEFAULT 5,
    parcel_weight numeric(10,2) NOT NULL DEFAULT 3,
    sort_order int DEFAULT 0,
    created_at timestamptz DEFAULT now()
  )`)
}

// GET: get parcel rules for a product
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    await ensureTable()
    const rules = await query(
      'SELECT * FROM product_parcel_rules WHERE product_id = $1 ORDER BY sort_order, min_width',
      [id]
    )
    return NextResponse.json({ success: true, data: rules })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

// PUT: replace all parcel rules for a product
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    await ensureTable()
    const { rules } = await request.json()

    // Delete existing rules
    await query('DELETE FROM product_parcel_rules WHERE product_id = $1', [id])

    // Insert new rules
    for (let i = 0; i < (rules || []).length; i++) {
      const r = rules[i]
      await query(
        `INSERT INTO product_parcel_rules (product_id, rule_name, min_width, max_width, min_height, max_height, parcel_length, parcel_width, parcel_height, parcel_weight, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [id, r.rule_name || '', r.min_width || 0, r.max_width || 999, r.min_height || 0, r.max_height || 999,
         r.parcel_length || 20, r.parcel_width || 15, r.parcel_height || 5, r.parcel_weight || 3, i]
      )
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
