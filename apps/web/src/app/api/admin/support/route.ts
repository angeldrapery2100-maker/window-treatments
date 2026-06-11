// Admin support-ticket queue: list, filter, and update status / notes.

import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { recordAudit } from '@/lib/audit'
import { ensureSupportTable, TICKET_STATUSES, type TicketStatus } from '@/lib/supportTickets'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/html'

let _resend: Resend | null = null
const getResend = () => (_resend ??= new Resend(process.env.RESEND_API_KEY))
const FROM = () => process.env.EMAIL_FROM || 'Angel Drapery <onboarding@resend.dev>'

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed',
}

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
    const { id, status, admin_notes, reply_message } = body
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

    // Customer-facing reply: emailed to the customer and appended to the
    // internal notes for the record (the table stays intentionally simple —
    // no separate thread storage until volume warrants it).
    const reply = typeof reply_message === 'string' ? reply_message.trim().slice(0, 4000) : ''
    if (reply) {
      const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
      const appended = `${ticket.admin_notes ? ticket.admin_notes + '\n\n' : ''}[Replied ${stamp}] ${reply}`
      if (admin_notes === undefined) { sets.push(`admin_notes = $${i++}`); values.push(appended.slice(0, 8000)) }
    }
    if (sets.length === 0 && !reply) return NextResponse.json({ success: false, error: 'No fields' }, { status: 400 })

    sets.push('updated_at = NOW()')
    values.push(id)
    await query(`UPDATE support_tickets SET ${sets.join(', ')} WHERE id = $${i}`, values)

    // Email the customer when there's a reply, or when the status changed.
    // Fail-soft: email problems must not fail the ticket update.
    const statusChanged = status !== undefined && status !== ticket.status
    if ((reply || statusChanged) && process.env.RESEND_API_KEY && ticket.customer_email) {
      const finalStatus = STATUS_LABELS[status ?? ticket.status] || (status ?? ticket.status)
      const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#222;">Update on your support request</h2>
        <p style="font-size:14px;color:#555;">Order <strong>${escapeHtml(ticket.order_number)}</strong> · Status: <strong>${escapeHtml(finalStatus)}</strong></p>
        ${reply ? `<div style="background:#f7f7f7;border-radius:8px;padding:14px 18px;margin:12px 0;font-size:14px;color:#333;white-space:pre-wrap;">${escapeHtml(reply)}</div>` : ''}
        <p style="font-size:13px;color:#777;">Reply to this email or call us at 626-451-9841 if you have any questions.</p>
        <p style="font-size:12px;color:#aaa;margin-top:20px;">Angel Drapery, Inc · 8831 E Las Tunas Dr, Temple City, CA 91780</p>
      </div>`
      getResend().emails.send({
        from: FROM(),
        to: ticket.customer_email,
        subject: `Update on your support request — order ${ticket.order_number}`,
        html,
      }).catch((e: any) => console.error('[admin-support] customer email failed:', e?.message))
    }

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
