import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { recordAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth'

async function ensureTable() {
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
  // Usage records table
  await query(`CREATE TABLE IF NOT EXISTS discount_code_uses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_code_id uuid NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
    order_id uuid,
    order_number varchar(32),
    customer_email varchar(256),
    discount_amount numeric(10,2) DEFAULT 0,
    order_total numeric(10,2) DEFAULT 0,
    used_at timestamptz DEFAULT now()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_dc_uses_code_id ON discount_code_uses(discount_code_id, used_at DESC)`)
}

// GET: list all discount codes (or CSV export, or usage records)
export async function GET(request: Request) {
  try {
    await ensureTable()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const exportCsv = searchParams.get('export') === 'csv'
    const usageFor = searchParams.get('usage_for') // returns usage records for a code

    // Usage records for a specific code
    if (usageFor) {
      const uses = await query(
        `SELECT * FROM discount_code_uses WHERE discount_code_id = $1 ORDER BY used_at DESC`,
        [usageFor]
      )
      return NextResponse.json({ success: true, data: uses })
    }

    // CSV export
    if (exportCsv) {
      const codes = await query(`
        SELECT dc.*, 
          (SELECT COUNT(*) FROM discount_code_uses dcu WHERE dcu.discount_code_id = dc.id) AS total_uses
        FROM discount_codes dc ORDER BY created_at DESC
      `)
      const header = ['Code', 'Description', 'Type', 'Value', 'Min Order', 'Max Uses', 'Used Count', 'Active', 'Expires', 'Created']
      const lines = [
        header.join(','),
        ...codes.map((c: any) => [
          c.code, `"${c.description}"`, c.discount_type, c.discount_value,
          c.min_order, c.max_uses ?? '', c.used_count, c.is_active,
          c.expires_at ?? '', c.created_at
        ].join(','))
      ]
      return new Response(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="discount-codes-${Date.now()}.csv"`,
        }
      })
    }

    const codes = await query(`
      SELECT dc.*,
        (SELECT COUNT(*) FROM discount_code_uses dcu WHERE dcu.discount_code_id = dc.id) AS total_uses,
        (SELECT COALESCE(SUM(discount_amount), 0) FROM discount_code_uses dcu WHERE dcu.discount_code_id = dc.id) AS total_saved
      FROM discount_codes dc ORDER BY created_at DESC
    `)
    return NextResponse.json({ success: true, data: codes })
  } catch (e: any) {
    return errorResponse('Could not load discount codes.', 500, e)
  }
}

// POST: create new discount code
export async function POST(request: Request) {
  try {
    await ensureTable()
    const adminUser = requireAdmin(request)
    const body = await request.json() as any
    const { code, description, discount_type, discount_value, min_order, max_uses, starts_at, expires_at } = body

    if (!code || !discount_value) {
      return NextResponse.json({ success: false, error: 'Code and discount value are required' }, { status: 400 })
    }
    if (parseFloat(discount_value) <= 0) {
      return NextResponse.json({ success: false, error: 'Discount value must be greater than 0' }, { status: 400 })
    }
    if (discount_type === 'percent' && parseFloat(discount_value) > 100) {
      return NextResponse.json({ success: false, error: 'Percent discount cannot exceed 100%' }, { status: 400 })
    }

    const existing = await queryOne('SELECT id FROM discount_codes WHERE UPPER(code) = UPPER($1)', [code])
    if (existing) {
      return NextResponse.json({ success: false, error: 'Code already exists' }, { status: 400 })
    }

    const row = await queryOne(
      `INSERT INTO discount_codes (code, description, discount_type, discount_value, min_order, max_uses, starts_at, expires_at)
       VALUES (UPPER($1), $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [code.trim(), description || '', discount_type || 'percent', discount_value,
       min_order || 0, max_uses || null, starts_at || new Date().toISOString(), expires_at || null]
    )

    await recordAudit({
      action: 'discount.created',
      actor_id: adminUser.id,
      actor_email: adminUser.email,
      target_type: 'discount_code',
      target_id: (row as any).id,
      after: { code: (row as any).code, discount_type, discount_value, min_order },
    })

    return NextResponse.json({ success: true, data: row })
  } catch (e: any) {
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

// PATCH: update OR bulk-deactivate discount codes
export async function PATCH(request: Request) {
  try {
    const adminUser = requireAdmin(request)
    const body = await request.json() as any

    // Bulk deactivate: { bulk_deactivate: true, ids: [...] }
    if (body.bulk_deactivate) {
      const ids: string[] = body.ids ?? []
      if (!ids.length) return NextResponse.json({ success: false, error: 'ids required' }, { status: 400 })
      await query(
        `UPDATE discount_codes SET is_active = false, updated_at = NOW() WHERE id = ANY($1::uuid[])`,
        [ids]
      )
      await recordAudit({
        action: 'discount.bulk_deactivated',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        note: `${ids.length} codes deactivated`,
      })
      return NextResponse.json({ success: true, affected: ids.length })
    }

    const { id, ...updates } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const fields: string[] = []
    const values: any[] = []
    let idx = 1

    const allowedFields = ['code', 'description', 'discount_type', 'discount_value', 'min_order', 'max_uses', 'starts_at', 'expires_at', 'is_active']
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        fields.push(key === 'code' ? `${key} = UPPER($${idx++})` : `${key} = $${idx++}`)
        values.push(updates[key])
      }
    }

    if (fields.length === 0) return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })

    fields.push(`updated_at = NOW()`)
    values.push(id)

    await query(`UPDATE discount_codes SET ${fields.join(', ')} WHERE id = $${idx}`, values)

    await recordAudit({
      action: 'discount.updated',
      actor_id: adminUser.id,
      actor_email: adminUser.email,
      target_type: 'discount_code',
      target_id: id,
      after: updates,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return errorResponse('Could not save changes. Please try again.', 500, e)
  }
}

// DELETE: delete discount code
export async function DELETE(request: Request) {
  try {
    const adminUser = requireAdmin(request)
    const body = await request.json() as any
    if (!body.id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await query('DELETE FROM discount_codes WHERE id = $1', [body.id])

    await recordAudit({
      action: 'discount.deleted',
      actor_id: adminUser.id,
      actor_email: adminUser.email,
      target_type: 'discount_code',
      target_id: body.id,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return errorResponse('Could not delete the discount code. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
