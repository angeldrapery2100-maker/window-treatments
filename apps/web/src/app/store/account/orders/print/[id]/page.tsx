'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface OrderItem {
  productName: string
  productType: string
  mainImageUrl: string | null
  width?: number
  height?: number
  options: { displayLabel: string; valueLabel: string }[]
  quantity: number
  unitPrice: number
}

interface Shipment {
  id: string
  tracking_number: string | null
  tracking_url: string | null
  carrier: string | null
  service: string | null
  status: string
  item_indices: number[]
  item_quantities: Record<string, number>
  created_at: string
}

interface OrderData {
  id: string
  order_number: string
  status: string
  payment_status: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  items: OrderItem[]
  subtotal: number
  discount_code: string | null
  discount_amount: number
  shipping_cost: number
  tax_amount: number
  total: number
  tracking_number: string | null
  tracking_url: string | null
  shipping_carrier: string | null
  shipping_address: any
  shipments: Shipment[]
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  partially_shipped: 'Partially Shipped',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const PAYMENT_LABELS: Record<string, string> = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
  partially_refunded: 'Partially Refunded',
  failed: 'Failed',
}

export default function CustomerOrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/store/my-orders/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setOrder(data.data)
        } else {
          setError(data.error || 'Order not found')
        }
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading order…
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Order not found'}</p>
          <button onClick={() => router.back()} className="text-sm text-gray-600 underline">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const addr = order.shipping_address || {}
  const shipments = order.shipments || []
  const hasShipments = shipments.length > 0
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Print styles — A4 standard */}
      <style>{`
        @media print {
          .no-print { display: none !important; }

          /* A4: 210mm × 297mm, 15mm margins = 180mm × 267mm printable area */
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }

          /* Reset browser chrome */
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* The document wrapper fills the A4 page exactly */
          .print-doc {
            width: 180mm !important;
            max-width: 180mm !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 9pt !important;
            line-height: 1.4 !important;
            color: #111 !important;
          }

          /* Keep sections together where possible */
          .print-section {
            break-inside: avoid;
          }

          /* ── Table cross-page fix ──
             1. Use collapsed borders on cells so there's no outer container border to break.
             2. Repeat the header on every new page.
             3. Prevent individual rows from splitting in the middle.
          */
          .items-table {
            width: 100% !important;
            border-collapse: collapse !important;
            border-spacing: 0 !important;
          }
          .items-table thead {
            display: table-header-group; /* repeat header on each page */
          }
          .items-table tbody tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .items-table th,
          .items-table td {
            border-bottom: 0.5pt solid #e5e7eb !important;
          }
          .items-table thead tr th {
            border-top: 1pt solid #d1d5db !important;
            border-bottom: 1pt solid #d1d5db !important;
          }

          .print-doc img { max-height: 30pt !important; }
        }

        /* On screen: simulate A4 page look */
        @media screen {
          body { background: #e5e7eb; }
          .print-doc {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            background: white;
            box-shadow: 0 4px 32px rgba(0,0,0,0.12);
          }
        }
      `}</style>

      {/* Toolbar (hidden when printing) */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <div className="flex-1" />
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#3d3d3d] text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Print
        </button>
      </div>

      {/* Order document — A4 page */}
      <div className="print-doc px-10 py-6 bg-white">

        {/* ── Header: company + title in one compact row ── */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-gray-800">
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight uppercase">Order Receipt</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">Order #{order.order_number}</p>
          </div>
          <p className="text-base font-bold text-gray-900">Window Treatments</p>
        </div>

        {/* ── Info strip: order details + ship-to side by side, compact ── */}
        <div className="print-section grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">

          {/* Left: order meta as a tight 2-col label/value grid */}
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Order Info</p>
            <table className="text-xs w-full">
              <tbody>
                <tr>
                  <td className="text-gray-400 pr-3 py-0.5 whitespace-nowrap">Order No.</td>
                  <td className="text-gray-900 font-mono font-medium">{order.order_number}</td>
                </tr>
                <tr>
                  <td className="text-gray-400 pr-3 py-0.5">Date</td>
                  <td className="text-gray-900">{orderDate}</td>
                </tr>
                <tr>
                  <td className="text-gray-400 pr-3 py-0.5">Status</td>
                  <td className="text-gray-900">{STATUS_LABELS[order.status] || order.status}</td>
                </tr>
                {order.payment_status && (
                  <tr>
                    <td className="text-gray-400 pr-3 py-0.5">Payment</td>
                    <td className="text-gray-900">{PAYMENT_LABELS[order.payment_status] || order.payment_status}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Right: ship-to info */}
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ship To</p>
            <div className="text-xs text-gray-700 space-y-0.5">
              {order.customer_name && <p className="font-semibold text-gray-900">{order.customer_name}</p>}
              {order.customer_phone && <p className="text-gray-500">{order.customer_phone}</p>}
              {order.customer_email && <p className="text-gray-500">{order.customer_email}</p>}
              {(addr.street1 || addr.street) && <p className="mt-0.5">{addr.street1 || addr.street}</p>}
              {addr.street2 && <p>{addr.street2}</p>}
              {(addr.city || addr.state || addr.zip) && (
                <p>{[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</p>
              )}
              {addr.country && addr.country !== 'US' && <p>{addr.country}</p>}
              {!order.customer_name && !order.customer_email && !addr.street1 && !addr.street && (
                <p className="text-gray-400 italic">No address on file</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Items table — immediately follows info strip ── */}
        <div className="mb-4">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Items Ordered</p>
          {/* No outer border div — borders are on cells so they survive page breaks */}
          <table className="items-table w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-[9px] font-bold text-gray-500 uppercase tracking-wide" colSpan={2}>Item</th>
                <th className="text-center px-3 py-2 text-[9px] font-bold text-gray-500 uppercase tracking-wide">Qty</th>
                <th className="text-right px-3 py-2 text-[9px] font-bold text-gray-500 uppercase tracking-wide">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  {/* Product thumbnail */}
                  <td className="pl-3 pr-2 py-2 w-12">
                    <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-100 border border-gray-200">
                      {item.mainImageUrl ? (
                        <img src={item.mainImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[8px] text-center leading-tight">No<br/>img</div>
                      )}
                    </div>
                  </td>
                  {/* Product info */}
                  <td className="px-2 py-2">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.productType?.toUpperCase()}
                      {item.width ? ` · W: ${item.width}"` : ''}
                      {item.height ? ` · H: ${item.height}"` : ''}
                    </p>
                    {item.options?.length > 0 && (
                      <p className="text-[11px] text-gray-400">
                        {item.options.map(o => `${o.displayLabel}: ${o.valueLabel}`).join(' · ')}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-700">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tracking / Shipments */}
        {(hasShipments || order.tracking_number) && (
          <div className="print-section mb-4">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Shipping & Tracking</p>
            <div className="space-y-2">
              {hasShipments ? shipments.map((s, sIdx) => (
                <div key={s.id} className="border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {shipments.length > 1 ? `Parcel ${sIdx + 1}` : 'Shipment'}
                        {s.carrier && <span className="ml-2 text-xs text-gray-400 font-normal uppercase">{s.carrier}</span>}
                      </p>
                      {s.tracking_number && (
                        <p className="font-mono text-xs text-gray-600 mt-0.5">{s.tracking_number}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {s.tracking_url && (
                      <a href={s.tracking_url} target="_blank" rel="noopener noreferrer"
                        className="no-print text-xs text-blue-600 underline flex-shrink-0">
                        Track Package
                      </a>
                    )}
                  </div>
                </div>
              )) : order.tracking_number ? (
                <div className="border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    Shipment
                    {order.shipping_carrier && <span className="ml-2 text-xs text-gray-400 font-normal uppercase">{order.shipping_carrier}</span>}
                  </p>
                  <p className="font-mono text-xs text-gray-600 mt-0.5">{order.tracking_number}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Price breakdown */}
        <div className="print-section border-t border-gray-200 pt-3">
          <div className="max-w-xs ml-auto space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">${Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Discount{order.discount_code ? ` (${order.discount_code})` : ''}</span>
                <span>-${Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            {Number(order.shipping_cost) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">${Number(order.shipping_cost).toFixed(2)}</span>
              </div>
            )}
            {Number(order.tax_amount) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">${Number(order.tax_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Print footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">
            Questions? Contact us — we're happy to help.
          </p>
        </div>

      </div>
    </div>
  )
}
