// Transactional order emails — customer confirmation + merchant notification.
//
// Called from createOrderForPaymentIntent (lib/createOrder.ts) so BOTH order
// creation paths (browser POST /api/store/orders AND the Stripe webhook
// fallback) send the same emails. Failures are logged but NEVER fail the
// order — the order is already paid and persisted by the time we get here.

import { Resend } from 'resend'
import { escapeHtml, safeUrl } from '@/lib/html'

let _resend: Resend | null = null
function getResend() { return _resend ??= new Resend(process.env.RESEND_API_KEY) }

const FROM       = () => process.env.EMAIL_FROM || 'Angel Drapery <onboarding@resend.dev>'
const ADMIN_TO   = () => process.env.ORDER_NOTIFY_EMAIL || 'admin@angel-drapery.com'
const SITE_URL   = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://angel-drapery.com').replace(/\/$/, '')

export interface OrderEmailData {
  orderNumber: string
  customer: { name: string; email: string; phone?: string; address?: any }
  items: any[]
  subtotal: number
  discountAmount: number
  shippingCost: number
  taxAmount: number
  total: number
  shippingMethod?: string | null
  notes?: string
}

// ── Shared item rows (defensive: webhook-path items may be lean) ─────────────
function itemRowsHtml(items: any[]): string {
  return (items || []).map((item) => {
    const name = escapeHtml(item.productName || 'Custom Item')
    const qty  = Math.max(1, Number(item.quantity) || 1)
    const unit = Number(item.unitPrice ?? item.price) || 0
    const dims: string[] = []
    if (item.width)  dims.push(`W:${escapeHtml(item.width)}"`)
    if (item.height) dims.push(`H:${escapeHtml(item.height)}${item.heightFraction && item.heightFraction !== '0' ? ' ' + escapeHtml(item.heightFraction) : ''}"`)
    const opts = Array.isArray(item.options)
      ? item.options.map((o: any) => `${escapeHtml(o.displayLabel || o.name)}: ${escapeHtml(o.valueLabel || o.value)}`).join(' · ')
      : ''
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:600;color:#222;">${name}</div>
          ${dims.length ? `<div style="font-size:12px;color:#888;">${dims.join(' × ')}</div>` : ''}
          ${opts ? `<div style="font-size:12px;color:#888;">${opts}</div>` : ''}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;color:#555;">×${qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;color:#222;">$${(unit * qty).toFixed(2)}</td>
      </tr>`
  }).join('')
}

function totalsHtml(d: OrderEmailData): string {
  const row = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding:4px 0;color:${bold ? '#222' : '#777'};font-size:${bold ? '15px' : '13px'};${bold ? 'font-weight:700;border-top:1px solid #ddd;padding-top:10px;' : ''}">${label}</td>
      <td style="padding:4px 0;text-align:right;color:${bold ? '#222' : '#777'};font-size:${bold ? '15px' : '13px'};${bold ? 'font-weight:700;border-top:1px solid #ddd;padding-top:10px;' : ''}">${value}</td>
    </tr>`
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      ${row('Subtotal', `$${d.subtotal.toFixed(2)}`)}
      ${d.discountAmount > 0 ? row('Discount', `-$${d.discountAmount.toFixed(2)}`) : ''}
      ${row(`Shipping${d.shippingMethod ? ` (${escapeHtml(d.shippingMethod)})` : ''}`, d.shippingCost > 0 ? `$${d.shippingCost.toFixed(2)}` : 'Free')}
      ${row('Tax', `$${d.taxAmount.toFixed(2)}`)}
      ${row('Total', `$${d.total.toFixed(2)}`, true)}
    </table>`
}

function addressHtml(a: any): string {
  if (!a) return ''
  const parts = [a.street, a.city, a.state, a.zip].filter(Boolean).map(escapeHtml)
  return parts.length ? `<p style="font-size:13px;color:#555;margin:4px 0 0;">${parts.join(', ')}</p>` : ''
}

const FOOTER = `
  <p style="color:#999;font-size:12px;margin-top:28px;">
    Questions? Contact us at admin@angel-drapery.com or call (626) 703-2929.<br/>
    Angel Drapery, Inc · Custom Window Treatments Since 1984
  </p>`

// ── Customer: order confirmation ─────────────────────────────────────────────
async function sendCustomerConfirmation(d: OrderEmailData): Promise<void> {
  const esNo = escapeHtml(d.orderNumber)
  const trackUrl = safeUrl(`${SITE_URL()}/store/track?order=${encodeURIComponent(d.orderNumber)}`)
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="font-weight:300;letter-spacing:1px;color:#222;">Thank you for your order!</h2>
    <p style="color:#555;font-size:14px;">Hi ${escapeHtml(d.customer.name)}, we've received your order and payment. We'll review the specifications and begin production shortly.</p>
    <div style="background:#f7f7f7;border-radius:8px;padding:14px 18px;margin:18px 0;">
      <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:700;font-family:monospace;color:#222;">${esNo}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;">${itemRowsHtml(d.items)}</table>
    ${totalsHtml(d)}
    ${d.customer.address ? `<h3 style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:24px;">Shipping To</h3>${addressHtml(d.customer.address)}` : ''}
    <p style="margin-top:24px;">
      <a href="${trackUrl}" style="display:inline-block;background:#3d3d3d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;letter-spacing:1px;">TRACK YOUR ORDER</a>
    </p>
    <p style="color:#888;font-size:12px;">You can check your order status anytime at ${escapeHtml(SITE_URL())}/store/track using your order number and email address.</p>
    ${FOOTER}
  </div>`

  const { error } = await getResend().emails.send({
    from: FROM(),
    to: d.customer.email,
    subject: `Order ${esNo} confirmed — Angel Drapery`,
    html,
  })
  if (error) throw new Error(`${(error as any).name || 'ResendError'}: ${(error as any).message || JSON.stringify(error)}`)
}

// ── Merchant: new order notification ─────────────────────────────────────────
async function sendAdminNotification(d: OrderEmailData): Promise<void> {
  const esNo = escapeHtml(d.orderNumber)
  const adminUrl = safeUrl(`${SITE_URL()}/admin/orders`)
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="color:#222;">🛒 New order ${esNo} — $${d.total.toFixed(2)}</h2>
    <p style="font-size:14px;color:#555;margin:4px 0;">
      <strong>${escapeHtml(d.customer.name)}</strong> · ${escapeHtml(d.customer.email)}${d.customer.phone ? ` · ${escapeHtml(d.customer.phone)}` : ''}
    </p>
    ${addressHtml(d.customer.address)}
    ${d.notes ? `<p style="font-size:13px;color:#a16207;background:#fefce8;border-radius:6px;padding:10px 14px;">Customer note: ${escapeHtml(d.notes)}</p>` : ''}
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">${itemRowsHtml(d.items)}</table>
    ${totalsHtml(d)}
    <p style="margin-top:24px;">
      <a href="${adminUrl}" style="display:inline-block;background:#3d3d3d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;letter-spacing:1px;">OPEN ADMIN ORDERS</a>
    </p>
  </div>`

  const { error } = await getResend().emails.send({
    from: FROM(),
    to: ADMIN_TO(),
    subject: `🛒 New order ${esNo} — $${d.total.toFixed(2)} (${escapeHtml(d.customer.name)})`,
    html,
  })
  if (error) throw new Error(`${(error as any).name || 'ResendError'}: ${(error as any).message || JSON.stringify(error)}`)
}

// ── Customer: order status change ────────────────────────────────────────────
// Sent on meaningful transitions. 'shipped' is intentionally NOT handled here —
// the shipping route sends a richer email with tracking numbers when a label is
// purchased, and we don't want to double-send.
type StatusEmailKind = 'in_production' | 'completed' | 'cancelled'

const STATUS_COPY: Record<StatusEmailKind, { subject: (n: string) => string; heading: string; body: string }> = {
  in_production: {
    subject: (n) => `Your order ${n} is now in production`,
    heading: 'Your order is in production',
    body: 'Good news — we\'ve started making your custom window treatments. We\'ll let you know as soon as your order ships.',
  },
  completed: {
    subject: (n) => `Your order ${n} is complete`,
    heading: 'Your order is complete',
    body: 'Your order has been completed. Thank you for choosing Angel Drapery — we hope you love your new window treatments! If you have a moment, we\'d love to hear what you think.',
  },
  cancelled: {
    subject: (n) => `Your order ${n} has been cancelled`,
    heading: 'Your order has been cancelled',
    body: 'Your order has been cancelled. If a payment was made, a full refund has been issued and will appear on your statement within 5–10 business days. Questions? Just reply to this email.',
  },
}

export async function sendOrderStatusEmail(args: {
  kind: StatusEmailKind
  orderNumber: string
  customerName: string
  customerEmail: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const copy = STATUS_COPY[args.kind]
  if (!copy) return
  const esNo = escapeHtml(args.orderNumber)
  const trackUrl  = safeUrl(`${SITE_URL()}/store/track?order=${encodeURIComponent(args.orderNumber)}`)
  const reviewUrl = safeUrl(`${SITE_URL()}/store/review?order=${encodeURIComponent(args.orderNumber)}`)
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="font-weight:300;letter-spacing:1px;color:#222;">${escapeHtml(copy.heading)}</h2>
    <p style="color:#555;font-size:14px;">Hi ${escapeHtml(args.customerName || 'there')}, ${escapeHtml(copy.body)}</p>
    <div style="background:#f7f7f7;border-radius:8px;padding:14px 18px;margin:18px 0;">
      <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:700;font-family:monospace;color:#222;">${esNo}</p>
    </div>
    ${args.kind === 'completed'
      ? `<p style="margin-top:8px;"><a href="${reviewUrl}" style="display:inline-block;background:#3d3d3d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;letter-spacing:1px;">LEAVE A REVIEW</a></p>`
      : args.kind !== 'cancelled'
        ? `<p style="margin-top:8px;"><a href="${trackUrl}" style="display:inline-block;background:#3d3d3d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;letter-spacing:1px;">TRACK YOUR ORDER</a></p>`
        : ''}
    ${FOOTER}
  </div>`
  try {
    const { error } = await getResend().emails.send({
      from: FROM(),
      to: args.customerEmail,
      subject: copy.subject(esNo),
      html,
    })
    if (error) throw new Error((error as any).message || JSON.stringify(error))
  } catch (e: any) {
    console.error(`[orderEmails] status '${args.kind}' email FAILED for ${args.orderNumber}:`, e?.message || e)
  }
}

// ── Merchant: shipping/delivery exception alert ──────────────────────────────
export async function sendShippingAlertEmail(args: {
  orderNumber: string
  trackingNumber: string
  carrier?: string
  status: string
  detail?: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const esNo = escapeHtml(args.orderNumber)
  const adminUrl = safeUrl(`${SITE_URL()}/admin/orders`)
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="color:#b91c1c;">⚠️ Shipment issue — order ${esNo}</h2>
    <p style="font-size:14px;color:#555;">A tracked shipment reported a problem status and may need attention.</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#333;margin-top:8px;">
      <tr><td style="padding:4px 0;color:#888;">Order</td><td style="padding:4px 0;text-align:right;font-family:monospace;">${esNo}</td></tr>
      <tr><td style="padding:4px 0;color:#888;">Carrier</td><td style="padding:4px 0;text-align:right;">${escapeHtml(args.carrier || '—')}</td></tr>
      <tr><td style="padding:4px 0;color:#888;">Tracking</td><td style="padding:4px 0;text-align:right;font-family:monospace;">${escapeHtml(args.trackingNumber)}</td></tr>
      <tr><td style="padding:4px 0;color:#888;">Status</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#b91c1c;">${escapeHtml(args.status)}</td></tr>
      ${args.detail ? `<tr><td style="padding:4px 0;color:#888;">Detail</td><td style="padding:4px 0;text-align:right;">${escapeHtml(args.detail)}</td></tr>` : ''}
    </table>
    <p style="margin-top:20px;"><a href="${adminUrl}" style="display:inline-block;background:#3d3d3d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;letter-spacing:1px;">OPEN ADMIN ORDERS</a></p>
  </div>`
  try {
    const { error } = await getResend().emails.send({
      from: FROM(),
      to: ADMIN_TO(),
      subject: `⚠️ Shipment issue — order ${esNo} (${escapeHtml(args.status)})`,
      html,
    })
    if (error) throw new Error((error as any).message || JSON.stringify(error))
  } catch (e: any) {
    console.error(`[orderEmails] shipping alert FAILED for ${args.orderNumber}:`, e?.message || e)
  }
}

/**
 * Send both order emails. Best-effort: each failure is logged with the order
 * number for manual follow-up, and never throws.
 */
export async function sendOrderEmails(d: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[orderEmails] RESEND_API_KEY not set — skipping emails for ${d.orderNumber}`)
    return
  }
  const results = await Promise.allSettled([
    sendCustomerConfirmation(d),
    sendAdminNotification(d),
  ])
  const labels = ['customer confirmation', 'admin notification']
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[orderEmails] ${labels[i]} FAILED for ${d.orderNumber}:`, r.reason?.message || r.reason)
    }
  })
}
