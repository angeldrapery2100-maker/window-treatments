'use client'

import { use, useEffect, useState } from 'react'

interface OrderItem {
  productName: string
  productType: string
  mainImageUrl: string | null
  width?: number
  height?: number
  heightFraction?: string
  widthFraction?: string
  options: { displayLabel: string; valueLabel: string }[]
  quantity: number
  unitPrice: number
}

interface Shipment {
  id: string
  tracking_number: string
  tracking_url: string
  label_url: string
  carrier: string
  service: string
  status: string
  item_indices: number[]
  item_quantities?: Record<string, number>
  created_at: string
}

interface Order {
  id: string
  order_number: string
  status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: { street?: string; city?: string; state?: string; zip?: string }
  items: OrderItem[]
  subtotal: number
  discount_code: string | null
  discount_type: string | null
  discount_value: number
  discount_amount: number
  shipping_cost: number
  shipping_method: string | null
  tax_rate: number
  tax_amount: number
  tax_source: string | null
  total: number
  payment_status: string
  payment_intent_id: string | null
  tracking_number: string | null
  shipping_carrier: string | null
  notes: string
  admin_notes: string
  created_at: string
  updated_at: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_production: 'In Production',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const PAYMENT_LABELS: Record<string, string> = {
  paid: '✓ Paid',
  unpaid: 'Unpaid',
  refunded: 'Refunded',
  refund_failed: 'Refund Failed',
}

export default function OrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setOrder(data.data.order)
          setShipments(data.data.shipments || [])
        } else {
          setError(data.error || 'Order not found')
        }
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false))
  }, [id])

  const formatDate = (d: string) => new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const formatAddr = (a: Order['shipping_address']) => {
    if (!a) return '—'
    return [a.street, a.city, a.state, a.zip].filter(Boolean).join(', ')
  }

  const formatDimensions = (item: OrderItem) => {
    const parts: string[] = []
    if (item.width) parts.push(`W: ${item.width}"`)
    if (item.height) {
      let h = `H: ${item.height}`
      if (item.heightFraction && item.heightFraction !== '0') h += ` ${item.heightFraction}`
      parts.push(h + '"')
    }
    return parts.join('  ×  ')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading order...
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error || 'Order not found'}</p>
          <button onClick={() => window.close()} className="mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    )
  }

  const taxPct = order.tax_rate ? ` (${(Number(order.tax_rate) * 100).toFixed(2)}%)` : ''
  const taxLabel = order.tax_source === 'stripe' ? `Tax — Stripe${taxPct}` : `Tax (est.)${taxPct}`

  return (
    <>
      {/* ── Print-only global styles ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 15mm 12mm; }
        }
        @media screen {
          body { background: #f3f4f6; }
        }
      `}</style>

      {/* ── Toolbar (hidden when printing) ── */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
          >
            ← Back
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-mono font-semibold text-gray-700">{order.order_number}</span>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2 bg-[#3d3d3d] text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Order
        </button>
      </div>

      {/* ── Printable content ── */}
      <div className="max-w-3xl mx-auto my-8 bg-white shadow-sm rounded-xl overflow-hidden print:shadow-none print:rounded-none print:my-0 print:max-w-none">

        {/* Company Header */}
        <div className="bg-[#3d3d3d] text-white px-8 py-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-wide">ANGEL DRAPERY, INC.</h1>
            <p className="text-white/60 text-xs mt-1">8827 Las Tunas Dr · Temple City, CA 91780 · (626) 703-2929</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Order Receipt</p>
            <p className="text-lg font-mono font-bold">{order.order_number}</p>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* ── Row 1: Order Meta + Status ── */}
          <div className="flex flex-wrap gap-6 pb-5 border-b border-gray-100">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Order Date</p>
              <p className="text-sm text-gray-800">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Order Status</p>
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                order.status === 'completed'    ? 'bg-green-100 text-green-700' :
                order.status === 'shipped'      ? 'bg-cyan-100 text-cyan-700' :
                order.status === 'in_production'? 'bg-purple-100 text-purple-700' :
                order.status === 'cancelled'    ? 'bg-red-100 text-red-600' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Payment</p>
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                order.payment_status === 'paid'          ? 'bg-green-100 text-green-700' :
                order.payment_status === 'refunded'      ? 'bg-gray-100 text-gray-600' :
                order.payment_status === 'refund_failed' ? 'bg-orange-100 text-orange-600' :
                'bg-red-50 text-red-500'
              }`}>
                {PAYMENT_LABELS[order.payment_status] || order.payment_status}
              </span>
            </div>
            {order.payment_intent_id && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Payment ID</p>
                <p className="text-xs font-mono text-gray-500">{order.payment_intent_id}</p>
              </div>
            )}
          </div>

          {/* ── Row 2: Customer + Shipping Address ── */}
          <div className="grid grid-cols-2 gap-6 pb-5 border-b border-gray-100">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Customer</p>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-gray-900">{order.customer_name}</p>
                <p className="text-gray-600">{order.customer_email}</p>
                {order.customer_phone && <p className="text-gray-600">{order.customer_phone}</p>}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Ship To</p>
              <div className="space-y-0.5 text-sm">
                <p className="font-semibold text-gray-900">{order.customer_name}</p>
                {order.shipping_address?.street && <p className="text-gray-600">{order.shipping_address.street}</p>}
                {(order.shipping_address?.city || order.shipping_address?.state || order.shipping_address?.zip) && (
                  <p className="text-gray-600">
                    {[order.shipping_address.city, order.shipping_address.state, order.shipping_address.zip]
                      .filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Row 3: Order Items ── */}
          <div className="pb-5 border-b border-gray-100">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Order Items</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-2 text-xs font-medium text-gray-500 w-8">#</th>
                  <th className="text-left pb-2 text-xs font-medium text-gray-500">Product</th>
                  <th className="text-center pb-2 text-xs font-medium text-gray-500 w-12">Qty</th>
                  <th className="text-right pb-2 text-xs font-medium text-gray-500 w-24">Unit Price</th>
                  <th className="text-right pb-2 text-xs font-medium text-gray-500 w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{item.productName || 'Custom Item'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.productType?.toUpperCase()}
                        {formatDimensions(item) ? `  ·  ${formatDimensions(item)}` : ''}
                      </p>
                      {item.options?.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item.options.map((opt: any, i: number) => (
                            <p key={i} className="text-xs text-gray-500">
                              <span className="text-gray-400">{opt.displayLabel || opt.name}:</span> {opt.valueLabel || opt.value}
                            </p>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-700">${(Number(item.unitPrice ?? (item as any).price) || 0).toFixed(2)}</td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      ${((Number(item.unitPrice ?? (item as any).price) || 0) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Row 4: Price Breakdown ── */}
          <div className="flex justify-end pb-5 border-b border-gray-100">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              {order.discount_code && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount
                    <span className="text-xs ml-1 font-mono">
                      ({order.discount_code}
                      {order.discount_type === 'percent' ? ` −${order.discount_value}%` : ''})
                    </span>
                  </span>
                  <span>−${Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>
                  Shipping
                  {order.shipping_method && <span className="text-xs ml-1 text-gray-400">({order.shipping_method})</span>}
                </span>
                <span>
                  {Number(order.shipping_cost) > 0 ? `$${Number(order.shipping_cost).toFixed(2)}` : 'Free'}
                </span>
              </div>
              {Number(order.tax_amount) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>{taxLabel}</span>
                  <span>${Number(order.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── Row 5: Shipping / Tracking ── */}
          {shipments.length > 0 && (
            <div className="pb-5 border-b border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Shipments</p>
              <div className="space-y-2">
                {shipments.map((s, si) => (
                  <div key={s.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-500 min-w-[60px]">Parcel {si + 1}</div>
                    <div className="flex-1 text-xs space-y-0.5">
                      <p className="font-medium text-gray-700">{s.carrier} · {s.service}</p>
                      <p className="font-mono text-gray-500">{s.tracking_number}</p>
                      {s.tracking_url && (
                        <p className="text-blue-500 no-print">
                          <a href={s.tracking_url} target="_blank" rel="noopener noreferrer">Track →</a>
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {s.status === 'delivered' ? 'Delivered' : 'In Transit'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Row 6: Notes ── */}
          {(order.notes || order.admin_notes) && (
            <div className="pb-2">
              {order.notes && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Customer Notes</p>
                  <p className="text-sm text-gray-700 bg-yellow-50 rounded-lg p-3">{order.notes}</p>
                </div>
              )}
              {order.admin_notes && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Internal Notes</p>
                  <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{order.admin_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
            Angel Drapery, Inc. · 8827 Las Tunas Dr, Temple City CA 91780 · (626) 703-2929
            <br />
            Thank you for your business.
          </div>
        </div>
      </div>
    </>
  )
}
