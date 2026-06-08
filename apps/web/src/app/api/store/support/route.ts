// Customer-facing after-sales ticket submission.
//
// Security mirrors guest order tracking: the customer must supply BOTH the
// order number AND the matching email, so a ticket can only be opened against
// an order the requester can prove they own. Rate-limited per IP.

import { NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { ensureSupportTable, TICKET_CATEGORIES, type TicketCategory } from '@/lib/supportTickets'
import { Resend } from 'resend'
import { escapeHtml, safeUrl } from '@/lib/html'

let _resend: Resend | null = null
const getResend = () => (_resend ??= new Resend(process.env.RESEND_API_KEY))
const ADMIN_TO  = () => process.env.ORDER_NOTIFY_EMAIL || 'admin@angel-drapery.com'
const FROM      = () => process.env.EMAIL_FROM || 'Angel Drapery <onboarding@resend.dev>'
const SITE_URL  = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://angel-drapery.com').replace(/\/$/, '')

const CATEGORY_LABELS: Record<string, string> = {
  wrong_size: 'Wrong size', damaged: 'Arrived damaged', defect: 'Defect / quality issue',
  missing_item: 'Missing item', wrong_item: 'Wrong item', late: 'Late / not received', other: 'Other',
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit('support-ticket', ip, { max: 8, windowSeconds: 3600 })
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({})) as any
    const orderNumber = String(body.orderNumber || '').trim().toUpperCase()
    const email       = String(body.email || '').trim().toLowerCase()
    const category    = String(body.category || 'other').trim() as TicketCategory
    const message     = String(body.message || '').trim()

    if (!/^AD[0-9]{6}-[A-Z0-9]{4}$/.test(orderNumber) || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid order number and email.' }, { status: 400 })
    }
    if (!TICKET_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, error: 'Please choose a valid issue type.' }, { status: 400 })
    }
    if (message.length < 5 || message.length > 4000) {
      return NextResponse.json({ success: false, error: 'Please describe the issue (5–4000 characters).' }, { status: 400 })
    }

    // Verify order ownership (order number + matching email).
    const order = await queryOne<any>(
      `SELECT id, order_number, customer_name FROM orders
       WHERE order_number = $1 AND LOWER(customer_email) = $2`,
      [orderNumber, email]
    ).catch(() => null)

    if (!order) {
      return NextResponse.json({ success: false, error: 'No order found for this order number and email.' }, { status: 404 })
    }

    await ensureSupportTable()
    const ticket = await queryOne<{ id: string }>(
      `INSERT INTO support_tickets (order_id, order_number, customer_name, customer_email, category, message)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [order.id, order.order_number, order.customer_name || '', email, category, message]
    )

    // Notify the merchant (best-effort).
    if (process.env.RESEND_API_KEY) {
      const adminUrl = safeUrl(`${SITE_URL()}/admin/support`)
      const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#222;">🛟 New support request — order ${escapeHtml(order.order_number)}</h2>
        <p style="font-size:14px;color:#555;margin:4px 0;"><strong>${escapeHtml(order.customer_name || email)}</strong> · ${escapeHtml(email)}</p>
        <p style="font-size:13px;color:#333;"><strong>Issue:</strong> ${escapeHtml(CATEGORY_LABELS[category] || category)}</p>
        <div style="background:#f7f7f7;border-radius:8px;padding:14px 18px;margin:12px 0;font-size:14px;color:#333;white-space:pre-wrap;">${escapeHtml(message)}</div>
        <p style="margin-top:16px;"><a href="${adminUrl}" style="display:inline-block;background:#3d3d3d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;letter-spacing:1px;">OPEN SUPPORT QUEUE</a></p>
      </div>`
      getResend().emails.send({
        from: FROM(), to: ADMIN_TO(),
        subject: `🛟 Support request — order ${order.order_number} (${CATEGORY_LABELS[category] || category})`,
        html,
      }).catch((e: any) => console.error('[support] merchant email failed:', e?.message))
    }

    return NextResponse.json({ success: true, data: { ticketId: ticket?.id } })
  } catch (e) {
    console.error('[support] submission failed:', e)
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
