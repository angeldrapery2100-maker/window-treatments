'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface OrderItem {
  // Display fields are OPTIONAL: orders created by the Stripe webhook fallback
  // carry the leaner create-payment-intent item shape ({productId, price, ...}).
  productName?: string
  productType?: string
  mainImageUrl?: string | null
  width?: number
  height?: number
  heightFraction?: string
  widthFraction?: string
  // Browser path: {name, displayLabel, value, valueLabel}; webhook path may
  // only have {name, value}.
  options?: { name?: string; displayLabel?: string; value?: string; valueLabel?: string }[]
  quantity: number
  unitPrice?: number
  price?: number   // webhook-path alias for unitPrice
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
  total: number
  notes: string
  admin_notes: string
  payment_status: string
  payment_intent_id: string | null
  tracking_number: string | null
  tracking_url: string | null
  shipping_label_url: string | null
  shipping_carrier: string | null
  shipping_cost: number
  shipping_method: string | null
  created_at: string
  updated_at: string
}

interface Shipment {
  id: string; order_id: string; item_indices: number[]; item_quantities?: Record<string, number>; tracking_number: string; tracking_url: string;
  label_url: string; carrier: string; service: string; status: string; created_at: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'in_production', label: 'In Production', color: 'bg-purple-100 text-purple-700' },
  { value: 'shipped', label: 'Shipped', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-600' },
]

// Human-readable label for an order_history entry.
function historyLabel(action: string, from?: string | null, to?: string | null): string {
  const S: Record<string, string> = {
    pending: 'Pending', in_production: 'In Production', shipped: 'Shipped',
    completed: 'Completed', cancelled: 'Cancelled',
  }
  switch (action) {
    case 'status_changed':            return `Status → ${S[to || ''] || to || '—'}`
    case 'notes_updated':             return 'Notes updated'
    case 'cancelled':                 return 'Order cancelled'
    case 'cancelled_with_refund':     return 'Cancelled & refunded'
    case 'refunded_partial':          return 'Partial refund issued'
    case 'refunded_full':             return 'Refund issued'
    case 'shipment_tracking_update':  return 'Tracking update'
    default:                          return action.replace(/_/g, ' ')
  }
}

// Helper: calculate shipment coverage
function getShipmentCoverage(order: Order, shipments: Shipment[]) {
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0)
  const shippedQty = shipments.reduce((s, sh) => {
    const qtys: Record<string, number> = sh.item_quantities || {}
    const indices: number[] = sh.item_indices || []
    return s + indices.reduce((acc, idx) => acc + (qtys[String(idx)] || order.items[idx]?.quantity || 0), 0)
  }, 0)
  const allShipped = shipments.length > 0 && shippedQty >= totalQty && shipments.every(s => !!s.tracking_number)
  const allDelivered = allShipped && shipments.every(s => s.status === 'delivered')
  return { totalQty, shippedQty, allShipped, allDelivered }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  const [orderShipments, setOrderShipments] = useState<Record<string, Shipment[]>>({})
  const [orderWorkOrders, setOrderWorkOrders] = useState<Record<string, { version: number; created_at: string } | null>>({})
  const [orderHistory, setOrderHistory] = useState<Record<string, Array<{ id: string; action: string; from_status: string | null; to_status: string | null; actor_email: string | null; note: string | null; created_at: string }>>>({})
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)  // in-page confirm (replaces window.confirm)
  const [refundOpenId, setRefundOpenId] = useState<string | null>(null)         // which order's partial-refund panel is open
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundingId, setRefundingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ status: filter, page: String(currentPage), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json() as any
      if (data.success) {
        setOrders(data.data || [])
        setTotalPages(data.pagination?.pages ?? 1)
        setTotalOrders(data.pagination?.total ?? 0)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filter, search, currentPage])

  useEffect(() => { setCurrentPage(1) }, [filter, search])
  useEffect(() => { setLoading(true); fetchOrders() }, [fetchOrders])

  // Listen for work order save events from other tabs
  useEffect(() => {
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('orders_refresh')
      bc.onmessage = (e) => {
        if (e.data?.type === 'work_order_saved') {
          fetchOrders()
          // Also refresh the work order state for the specific order
          if (e.data.orderId) {
            loadWorkOrder(e.data.orderId)
            loadShipments(e.data.orderId)
          }
        }
      }
    } catch {}
    return () => { try { bc?.close() } catch {} }
  }, [fetchOrders]) // eslint-disable-line react-hooks/exhaustive-deps

  // Also refresh when tab regains focus (fallback for cases where BroadcastChannel doesn't work)
  useEffect(() => {
    const onFocus = () => {
      fetchOrders()
      if (expandedId) {
        loadWorkOrder(expandedId)
        loadShipments(expandedId)
        loadHistory(expandedId)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchOrders, expandedId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/orders', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    setMessage('Status updated')
    setTimeout(() => setMessage(''), 2000)
    fetchOrders()
  }

  const saveNotes = async (id: string) => {
    const order = orders.find(o => o.id === id)
    const notesValue = editNotes[id] ?? order?.admin_notes ?? ''
    await fetch('/api/admin/orders', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, admin_notes: notesValue })
    })
    setMessage('Notes saved')
    setTimeout(() => setMessage(''), 2000)
    // Clear local edit state so textarea reflects the saved DB value
    setEditNotes(prev => { const n = { ...prev }; delete n[id]; return n })
    fetchOrders()
  }

  // Confirmation is handled by an in-page panel (setConfirmCancelId), not the
  // native window.confirm() — native dialogs can be permanently suppressed by
  // the browser ("prevent this page from creating more dialogs"), which would
  // silently disable cancellation. This runs once the admin confirms in-page.
  const cancelOrder = async (id: string) => {
    const order = orders.find(o => o.id === id)
    if (!order) return
    setConfirmCancelId(null)

    setCancellingId(id)
    try {
      const res = await fetch('/api/admin/orders?id=' + id, { method: 'DELETE' })
      const data = await res.json() as any
      if (data.success) {
        const refundInfo = data.data.refund
        if (refundInfo?.refunded) {
          setMessage(`Order cancelled, refunded ${(refundInfo.amount / 100).toFixed(2)}`)
        } else if (refundInfo?.error) {
          setMessage(`Order cancelled, but refund failed: ${refundInfo.error}`)
        } else {
          setMessage('Order cancelled')
        }
        setTimeout(() => setMessage(''), 5000)
        fetchOrders()
      } else {
        setMessage(`Error: ${data.error || 'Cancel failed'}`)
        setTimeout(() => setMessage(''), 4000)
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
      setTimeout(() => setMessage(''), 4000)
    } finally {
      setCancellingId(null)
    }
  }

  // Partial (or remaining-full) refund WITHOUT cancelling the order.
  const partialRefund = async (id: string) => {
    setRefundingId(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: refundAmount.trim() === '' ? undefined : Number(refundAmount),
          reason: refundReason.trim() || undefined,
        }),
      })
      const data = await res.json() as any
      if (data.success) {
        setMessage(`Refunded $${Number(data.data.refunded).toFixed(2)} (total refunded $${Number(data.data.totalRefunded).toFixed(2)})`)
        setRefundOpenId(null); setRefundAmount(''); setRefundReason('')
        setTimeout(() => setMessage(''), 5000)
        fetchOrders()
      } else {
        setMessage(`Error: ${data.error || 'Refund failed'}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
      setTimeout(() => setMessage(''), 4000)
    } finally {
      setRefundingId(null)
    }
  }

  const loadShipments = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_shipments', orderId })
      })
      const data = await res.json() as any
      if (data.success) {
        const shipments: Shipment[] = data.data.shipments || []
        setOrderShipments(prev => ({ ...prev, [orderId]: shipments }))

        // Auto-set status based on shipment coverage
        const order = orders.find(o => o.id === orderId)
        if (order) {
          const { allShipped, allDelivered } = getShipmentCoverage(order, shipments)
          if (allDelivered && order.status !== 'completed') {
            updateStatus(orderId, 'completed')
          } else if (allShipped && order.status !== 'shipped' && order.status !== 'completed') {
            updateStatus(orderId, 'shipped')
          }
        }

        // Check delivery status from Shippo for shipped orders
        if (shipments.some(s => s.tracking_number && s.status !== 'delivered')) {
          checkDeliveryStatus(orderId)
        }
      }
    } catch {}
  }

  const loadWorkOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/work-orders?orderId=${orderId}`)
      const data = await res.json() as any
      if (data.success) {
        setOrderWorkOrders(prev => ({ ...prev, [orderId]: data.data.workOrder || null }))
      }
    } catch {}
  }

  const loadHistory = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/history?order_id=${orderId}`)
      const data = await res.json() as any
      if (data.success) setOrderHistory(prev => ({ ...prev, [orderId]: data.data || [] }))
    } catch {}
  }

  const checkDeliveryStatus = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_delivery_status', orderId })
      })
      const data = await res.json() as any
      if (data.success && data.data.anyUpdated) {
        // Reload shipments and orders to reflect updated status
        setOrderShipments(prev => ({ ...prev, [orderId]: data.data.shipments }))
        fetchOrders()
      }
    } catch {}
  }

  const getStatusInfo = (s: string) => STATUS_OPTIONS.find(o => o.value === s) || { value: s, label: s, color: 'bg-gray-100 text-gray-600' }

  const formatDate = (d: string) => new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const formatAddr = (a: Order['shipping_address']) => {
    if (!a) return '—'
    return [a.street, a.city, a.state, a.zip].filter(Boolean).join(', ')
  }

  const formatDimensions = (item: OrderItem) => {
    const parts: string[] = []
    if (item.width) parts.push(`W:${item.width}"`)
    if (item.height) {
      let h = `H:${item.height}`
      if (item.heightFraction && item.heightFraction !== '0') h += ` ${item.heightFraction}`
      parts.push(h + '"')
    }
    return parts.join(' × ')
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setCurrentPage(1)
  }

  const exportCsv = () => {
    const params = new URLSearchParams({ status: filter, export: 'csv' })
    if (search) params.set('search', search)
    window.open(`/api/admin/orders?${params}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
              <p className="text-sm text-gray-400 mt-0.5">{totalOrders} orders{pendingCount > 0 ? `, ${pendingCount} pending` : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              {message && <span className="text-sm px-3 py-1 rounded bg-green-50 text-green-700">{message}</span>}
              <button onClick={exportCsv} className="px-3 py-1.5 text-xs border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#3d3d3d] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            All
          </button>
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => setFilter(s.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === s.value ? 'bg-[#3d3d3d] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by order #, customer name, or email…"
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white"
          />
          <button type="submit" className="px-4 py-2 text-sm bg-[#3d3d3d] text-white rounded-lg hover:bg-gray-700 transition-colors">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput('') }} className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-6xl mb-4 opacity-20">—</p>
            <p className="text-gray-500 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const expanded = expandedId === order.id
              const statusInfo = getStatusInfo(order.status)
              const hasTracking = !!order.tracking_number
              const shipments = orderShipments[order.id] || []
              const { allShipped, allDelivered, totalQty, shippedQty } = getShipmentCoverage(order, shipments)
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  {/* Order Header Row */}
                  <div className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      const newId = expanded ? null : order.id
                      setExpandedId(newId)
                      if (newId) {
                        loadShipments(newId)
                        loadWorkOrder(newId)
                        loadHistory(newId)
                      }
                    }}>
                    <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-gray-900 text-sm">{order.order_number}</span>
                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                        {hasTracking && (
                          <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-cyan-50 text-cyan-700">📦 {order.shipping_carrier}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(order.created_at)}
                        {hasTracking && <span className="ml-2 text-cyan-600">Tracking: {order.tracking_number}</span>}
                      </p>
                    </div>
                    <div className="hidden sm:block text-sm text-gray-600 min-w-[160px]">
                      <p className="font-medium truncate">{order.customer_name}</p>
                      <p className="text-xs text-gray-400 truncate">{order.customer_email}</p>
                    </div>
                    <div className="text-xs text-gray-400 min-w-[60px] text-center">{order.items.length} items</div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-semibold text-gray-900">${Number(order.total).toLocaleString()}</p>
                      <p className={`text-[11px] ${
                        order.payment_status === 'paid' ? 'text-green-600' :
                        order.payment_status === 'refunded' ? 'text-red-500' :
                        order.payment_status === 'refund_failed' ? 'text-orange-500' :
                        'text-orange-500'
                      }`}>
                        {order.payment_status === 'paid' ? '✓ Paid' :
                         order.payment_status === 'refunded' ? '↩ Refunded' :
                         order.payment_status === 'refund_failed' ? '⚠ Refund Failed' :
                         '⏳ Unpaid'}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expanded && (
                    <div className="border-t border-gray-100 px-6 py-5">
                      <div className="grid lg:grid-cols-3 gap-6">
                        {/* Column 1: Items */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Order Items</h3>
                            {(() => {
                              const wo = orderWorkOrders[order.id]
                              return (
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Print / View Order button */}
                                  <button
                                    onClick={() => window.open(`/admin/orders/print/${order.id}`, '_blank')}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 flex items-center gap-1 border border-gray-200"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    View / Print
                                  </button>
                                  {wo ? (
                                    <>
                                      <button onClick={() => window.open(`/admin/orders/work-order/${order.id}`, '_blank')}
                                        className="px-3 py-1.5 bg-[#3d3d3d] text-white text-xs rounded-lg hover:bg-gray-700 flex items-center gap-1">
                                        Re-export Work Order
                                      </button>
                                      <button onClick={() => window.open(`/admin/orders/work-order/${order.id}`, '_blank')}
                                        className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 flex items-center gap-1">
                                        View Work Order
                                      </button>
                                      <span className="text-[10px] text-gray-400">v{wo.version}</span>
                                    </>
                                  ) : (
                                    <button onClick={() => window.open(`/admin/orders/work-order/${order.id}`, '_blank')}
                                      className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 flex items-center gap-1">
                                        Export Work Order
                                    </button>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                  {item.mainImageUrl ? (
                                    <Image src={item.mainImageUrl} alt={item.productName || 'Product'} fill sizes="64px" className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No Img</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{item.productName || 'Custom Item'}</p>
                                  <p className="text-xs text-gray-400">
                                    {(item.productType || 'item').toUpperCase()}
                                    {formatDimensions(item) && ` · ${formatDimensions(item)}`}
                                    {` · Qty: ${item.quantity}`}
                                  </p>
                                  {(item.options?.length ?? 0) > 0 && (
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                      {item.options!.map((opt, i) => (
                                        <span key={i} className="text-xs text-gray-500">
                                          <span className="text-gray-400">{opt.displayLabel || opt.name}:</span> {opt.valueLabel || opt.value}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm font-medium text-gray-900 flex-shrink-0">
                                  ${((Number(item.unitPrice ?? item.price) || 0) * item.quantity).toLocaleString()}
                                  {item.quantity > 1 && <p className="text-[11px] text-gray-400 text-right">${Number(item.unitPrice ?? item.price) || 0}/ea</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Category summary */}
                          {(() => {
                            const TYPE_LABELS: Record<string, string> = { drapery: 'Drapery', sheer: 'Sheer', shade: 'Shade', hardware: 'Hardware' }
                            const catMap: Record<string, number> = {}
                            let tQty = 0
                            order.items.forEach(item => {
                              const t = item.productType || 'other'
                              catMap[t] = (catMap[t] || 0) + item.quantity
                              tQty += item.quantity
                            })
                            return (
                              <div className="mt-4 pt-3 border-t border-gray-200 mb-1">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                  {Object.entries(catMap).map(([type, qty]) => (
                                    <span key={type} className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                      {TYPE_LABELS[type] || type} <strong>{qty}</strong>
                                    </span>
                                  ))}
                                  <span className="text-gray-400">|</span>
                                  <span className="text-gray-700 font-medium">{tQty} items total</span>
                                </div>
                              </div>
                            )
                          })()}
                          <div className="pt-2 space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${Number(order.subtotal).toLocaleString()}</span></div>
                            {order.discount_code && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount ({order.discount_code} {order.discount_type === 'percent' ? `${order.discount_value}%` : `${order.discount_value}`})</span>
                                <span>-${Number(order.discount_amount).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between"><span className="text-gray-500">Shipping{order.shipping_method ? ` (${order.shipping_method})` : ''}</span><span>{Number(order.shipping_cost) > 0 ? `${Number(order.shipping_cost).toFixed(2)}` : 'Free'}</span></div>
                            <div className="flex justify-between font-semibold text-base border-t border-gray-200 pt-1"><span>Total</span><span>${Number(order.total).toLocaleString()}</span></div>
                          </div>


                        </div>

                        {/* Column 2: Customer + Actions */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
                            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1.5">
                              <p className="font-medium text-gray-900">{order.customer_name}</p>
                              <p className="text-gray-600">{order.customer_email}</p>
                              {order.customer_phone && <p className="text-gray-600">{order.customer_phone}</p>}
                              <p className="text-gray-500 text-xs mt-2">{formatAddr(order.shipping_address)}</p>
                            </div>
                          </div>
                          {order.notes && (
                            <div>
                              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer Notes</h3>
                              <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3">{order.notes}</p>
                            </div>
                          )}

                          {/* ─── Shipping / Packing Section ─── */}
                          <div>
                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Shipping</h3>
                            {!allShipped ? (
                              <>
                                <button onClick={() => window.open(`/admin/orders/shipping/${order.id}`, '_blank')}
                                  className="w-full px-4 py-2.5 bg-[#3d3d3d] text-white text-sm rounded-lg hover:bg-gray-700 font-medium">
                                  Pack & Ship
                                </button>
                                {shipments.length > 0 && (
                                  <p className="text-[11px] text-orange-600 mt-1.5">Shipped {shippedQty}/{totalQty} items, {totalQty - shippedQty} remaining</p>
                                )}
                                {/* Show partial shipments below button */}
                                {shipments.length > 0 && (
                                  <div className="space-y-2 mt-3">
                                    {shipments.map((s, si) => (
                                      <div key={s.id} className="bg-cyan-50 border border-cyan-200 rounded-lg p-2.5">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-semibold text-cyan-800">Parcel {si + 1}</span>
                                            <span className="text-[10px] bg-cyan-100 px-1.5 py-0.5 rounded-full text-cyan-700">{s.carrier}</span>
                                          </div>
                                          <div className="flex gap-1.5">
                                            {s.tracking_url && <a href={s.tracking_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-700 underline">Track</a>}
                                            {s.label_url && <a href={s.label_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-700 underline">Label</a>}
                                          </div>
                                        </div>
                                        <p className="text-[11px] text-gray-600 font-mono">{s.tracking_number}</p>
                                        <div className="mt-1 text-[10px] text-gray-500">
                                          {s.item_indices.map(idx => {
                                            const item = order.items[idx]
                                            if (!item) return null
                                            const qty = (s.item_quantities || {})[String(idx)] || item.quantity
                                            const pname = item.productName || 'Custom Item'
                                            return <span key={idx} className="mr-2">{pname.length > 15 ? pname.slice(0, 15) + '..' : pname} ×{qty}</span>
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-sm text-green-700 font-medium mb-2">
                                  All items shipped ({shipments.length} parcels)
                                </div>
                                {/* Shipment details with tracking & delivery status */}
                                <div className="space-y-2 mb-3">
                                  {shipments.map((s, si) => (
                                    <div key={s.id} className={`border rounded-lg p-2.5 ${s.status === 'delivered' ? 'bg-green-50 border-green-200' : 'bg-cyan-50 border-cyan-200'}`}>
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[11px] font-semibold text-cyan-800">Parcel {si + 1}</span>
                                          <span className="text-[10px] bg-cyan-100 px-1.5 py-0.5 rounded-full text-cyan-700">{s.carrier}</span>
                                          {s.status === 'delivered'
                                            ? <span className="text-[10px] bg-green-100 px-1.5 py-0.5 rounded-full text-green-700 font-medium">Delivered</span>
                                            : <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded-full text-blue-700">In Transit</span>
                                          }
                                        </div>
                                        <div className="flex gap-1.5">
                                          {s.tracking_url && <a href={s.tracking_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-700 underline">Track</a>}
                                          {s.label_url && <a href={s.label_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-700 underline">Label</a>}
                                        </div>
                                      </div>
                                      <p className="text-[11px] text-gray-600 font-mono">{s.tracking_number}</p>
                                      <div className="mt-1 text-[10px] text-gray-500">
                                        {s.item_indices.map(idx => {
                                          const item = order.items[idx]
                                          if (!item) return null
                                          const qty = (s.item_quantities || {})[String(idx)] || item.quantity
                                          const pname = item.productName || 'Custom Item'
                                          return <span key={idx} className="mr-2">{pname.length > 15 ? pname.slice(0, 15) + '..' : pname} ×{qty}</span>
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {/* Modify button */}
                                <button onClick={() => window.open(`/admin/orders/shipping/${order.id}`, '_blank')}
                                  className="w-full px-3 py-2 bg-white text-gray-700 text-xs rounded-lg hover:bg-gray-50 font-medium border border-gray-300 flex items-center justify-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  Edit Shipping
                                </button>
                              </>
                            )}
                          </div>

                          {/* ─── Order Status (fully auto-managed) ─── */}
                          <div>
                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Order Status</h3>
                            <div className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-lg ${statusInfo.color}`}>
                              {statusInfo.label}
                            </div>
                            {/* Status flow hints */}
                            <div className="mt-3 space-y-1.5">
                              {order.status === 'pending' && (
                                <p className="text-[11px] text-gray-400">Auto-transitions to "In Production" after saving work order</p>
                              )}
                              {order.status === 'in_production' && (
                                <p className="text-[11px] text-gray-400">Auto-transitions to "Shipped" when all items are shipped</p>
                              )}
                              {order.status === 'shipped' && !allDelivered && (
                                <p className="text-[11px] text-gray-400">Auto-transitions to "Completed" when all parcels are delivered</p>
                              )}
                              {order.status === 'completed' && (
                                <p className="text-[11px] text-green-600">Order completed</p>
                              )}
                            </div>
                            {/* Status flow visualization */}
                            <div className="mt-3 flex items-center gap-1 text-[10px]">
                              {[
                                { key: 'pending', label: 'Pending' },
                                { key: 'in_production', label: 'Production' },
                                { key: 'shipped', label: 'Shipped' },
                                { key: 'completed', label: 'Completed' },
                              ].map((step, i) => {
                                const isCurrent = order.status === step.key
                                const isPast = STATUS_OPTIONS.findIndex(s => s.value === order.status) > STATUS_OPTIONS.findIndex(s => s.value === step.key)
                                return (
                                  <span key={step.key} className="flex items-center gap-1">
                                    {i > 0 && <span className={`${isPast || isCurrent ? 'text-green-400' : 'text-gray-300'}`}>→</span>}
                                    <span className={`px-1.5 py-0.5 rounded ${
                                      isCurrent ? 'bg-[#3d3d3d] text-white font-semibold' :
                                      isPast ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                    }`}>{step.label}</span>
                                  </span>
                                )
                              })}
                            </div>
                            {order.status === 'cancelled' && (
                              <div className="mt-2">
                                <span className="inline-flex px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-600">Cancelled</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Admin Notes</h3>
                            <textarea value={editNotes[order.id] ?? order.admin_notes ?? ''}
                              onChange={e => setEditNotes(n => ({ ...n, [order.id]: e.target.value }))}
                              rows={3} placeholder="Internal notes..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                            <button onClick={() => saveNotes(order.id)}
                              className="mt-2 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">Save Notes</button>
                          </div>

                          {/* ─── Order Timeline (history) ─── */}
                          {(orderHistory[order.id]?.length ?? 0) > 0 && (
                            <div className="pt-3 mt-1 border-t border-gray-200">
                              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Timeline</h3>
                              <ol className="relative border-l border-gray-200 ml-1.5 space-y-3">
                                {orderHistory[order.id].map((h) => (
                                  <li key={h.id} className="ml-4">
                                    <span className="absolute -left-[5px] mt-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
                                    <p className="text-xs text-gray-700">
                                      {historyLabel(h.action, h.from_status, h.to_status)}
                                      {h.note ? <span className="text-gray-400"> — {h.note}</span> : null}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                      {new Date(h.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                      {h.actor_email && h.actor_email !== 'system@shippo' ? ` · ${h.actor_email}` : h.actor_email === 'system@shippo' ? ' · auto' : ''}
                                    </p>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* ─── Partial Refund (order stays open) ─── */}
                          {order.status !== 'cancelled' && (order.payment_status === 'paid' || order.payment_status === 'partially_refunded') && order.payment_intent_id && (
                            <div className="pt-3 mt-1 border-t border-gray-200">
                              {refundOpenId === order.id ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                                  <p className="text-xs font-medium text-gray-700">Issue a refund</p>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400 text-sm">$</span>
                                    <input
                                      type="number" min="0" step="0.01"
                                      value={refundAmount}
                                      onChange={e => setRefundAmount(e.target.value)}
                                      placeholder={`Amount (max ${(Number(order.total) - (Number((order as any).refunded_amount) || 0)).toFixed(2)})`}
                                      className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    value={refundReason}
                                    onChange={e => setRefundReason(e.target.value)}
                                    placeholder="Reason (optional)"
                                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
                                  />
                                  <p className="text-[10px] text-gray-400">Leave amount blank to refund the full remaining balance. The order stays open.</p>
                                  <div className="flex gap-2">
                                    <button onClick={() => partialRefund(order.id)} disabled={refundingId === order.id}
                                      className="flex-1 px-3 py-1.5 text-xs rounded font-medium bg-[#3d3d3d] text-white hover:bg-gray-700 disabled:opacity-50">
                                      {refundingId === order.id ? 'Refunding…' : 'Issue Refund'}
                                    </button>
                                    <button onClick={() => { setRefundOpenId(null); setRefundAmount(''); setRefundReason('') }}
                                      className="px-3 py-1.5 text-xs rounded font-medium border border-gray-200 text-gray-500 hover:bg-gray-100">
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => { setRefundOpenId(order.id); setRefundAmount(''); setRefundReason('') }}
                                  className="w-full px-3 py-2 text-xs rounded-lg font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
                                  Issue Refund (Partial / Full)
                                </button>
                              )}
                              {order.payment_status === 'partially_refunded' && (
                                <p className="text-[10px] text-amber-600 mt-1.5 text-center">
                                  Partially refunded: ${(Number((order as any).refunded_amount) || 0).toFixed(2)} of ${Number(order.total).toFixed(2)}
                                </p>
                              )}
                            </div>
                          )}

                          {/* ─── Cancel Order ─── */}
                          {order.status !== 'cancelled' && order.status !== 'completed' && (
                            <div className="pt-3 mt-1 border-t border-gray-200">
                              {confirmCancelId === order.id ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                                  <p className="text-xs text-red-700">
                                    Cancel order <span className="font-mono font-semibold">{order.order_number}</span>
                                    {order.payment_status === 'paid' ? ` and refund $${Number(order.total).toFixed(2)} via Stripe?` : '?'}
                                    {' '}This cannot be undone.
                                  </p>
                                  <div className="flex gap-2">
                                    <button onClick={() => cancelOrder(order.id)} disabled={cancellingId === order.id}
                                      className="flex-1 px-3 py-1.5 text-xs rounded font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                                      {cancellingId === order.id ? 'Cancelling…' : 'Yes, Cancel Order'}
                                    </button>
                                    <button onClick={() => setConfirmCancelId(null)}
                                      className="px-3 py-1.5 text-xs rounded font-medium border border-red-200 text-red-600 hover:bg-red-100">
                                      Keep Order
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setConfirmCancelId(order.id)}
                                    disabled={cancellingId === order.id}
                                    className="w-full px-3 py-2 text-xs rounded-lg font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Cancel Order{order.payment_status === 'paid' ? ' & Refund' : ''}
                                  </button>
                                  {order.payment_status === 'paid' && (
                                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">Full refund will be issued via Stripe</p>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                          {order.status === 'cancelled' && (order.payment_status === 'refunded' || order.payment_status === 'duplicate') && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-600">
                              {order.payment_status === 'duplicate' ? 'Duplicate order — auto-cancelled' : 'Order cancelled and refunded'}
                            </div>
                          )}
                          {order.status === 'cancelled' && order.payment_status === 'refund_failed' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 text-xs text-orange-600">
                              Order cancelled, but refund failed — please process manually
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-1">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} ({totalOrders} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, currentPage - 2)
                const p = start + i
                if (p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                      p === currentPage
                        ? 'bg-[#3d3d3d] text-white border-[#3d3d3d]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
