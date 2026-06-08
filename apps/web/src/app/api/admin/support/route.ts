// Admin support-ticket queue: list, filter, and update status / notes.

import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { recordAudit } from '@/lib/audit'
import { ensureSupportTable, TICKET_STATUSES, type TicketStatus } from '@/lib/supportTickets'

export async function GET(request: Request) {
  try {
    requireAdmin(request)
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureSupportTable()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let sql = `SELECT * FROM support_tickets WHERE 1=1`
    const params: any[] = []
    if (status && status !== 'all' && TICKET_STATUSES.includes(status as TicketStatus)) {
      params.push(status)
      sql += ` AND status = $${params.length}`
    }
    // Open first, then newest.
    sql += ` ORDER BY CASE status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'resolved' THEN 2 ELSE 3 END, created_at DESC LIMIT 200`

    const tickets = await query(sql, params)
    const counts = await query<{ status: string; n: string }>(
      `SELECT status, COUNT(*) AS n FROM support_tickets GROUP BY status`
    ).catch(() => [])
    const openCount = Number((counts.find((c: any) => c.status === 'open') as any)?.n || 0)

    return NextResponse.json({ success: true, data: { tickets, openCount } })
  } catch (e) {
    return errorResponse('Could not load support tickets.', 500, e)
  }
}

export async function PATCH(request: Request) {
  let adminUser
  try {
    adminUser = requireAdmin(request)
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureSupportTable()
    const body = await request.json().catch(() => ({})) as any
    const { id, status, admin_notes } = body
    if (!id) return NextResponse.json({ success: false, error: 'Ticket id required' }, { status: 400 })

    const ticket = await queryOne<any>('SELECT * FROM support_tickets WHERE id = $1', [id])
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })

    const sets: string[] = []
    const values: any[] = []
    let i = 1
    if (status !== undefined) {
      if (!TICKET_STATUSES.includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
      }
      sets.push(`status = $${i++}`); values.push(status)
    }
    if (admin_notes !== undefined) { sets.push(`admin_notes = $${i++}`); values.push(String(admin_notes).slice(0, 4000)) }
    if (sets.length === 0) return NextResponse.json({ success: false, error: 'No fields' }, { status: 400 })

    sets.push('updated_at = NOW()')
    values.push(id)
    await query(`UPDATE support_tickets SET ${sets.join(', ')} WHERE id = $${i}`, values)

    await recordAudit({
      action: 'support.updated',
      actor_id: adminUser.id,
      actor_email: adminUser.email,
      target_type: 'support_ticket',
      target_id: id,
      before: { status: ticket.status },
      after: { status: status ?? ticket.status },
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (e) {
    return errorResponse('Could not update the ticket.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
