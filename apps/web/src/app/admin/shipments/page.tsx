'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// ─── Mock Data ───
interface ShipmentItem { name: string; qty: number; width?: number; height?: number; options?: string }
interface Shipment {
  id: string; source?: 'order' | 'custom'; orderId: string | null; orderNumber: string; status: 'completed' | 'voided' | 'in_transit' | 'delivered'
  createdAt: string; carrier: string; service: string
  trackingNumber: string; trackingUrl: string; labelUrl: string
  fromName: string; fromCompany: string; fromStreet: string; fromCity: string; fromState: string; fromZip: string; fromCountry: string
  toName: string; toStreet: string; toCity: string; toState: string; toZip: string; toCountry: string; toPhone: string; toEmail: string
  parcelLength: number; parcelWidth: number; parcelHeight: number; parcelWeight: number; parcelWeightUnit?: string
  retailRate: number; shippingRate: number; serviceRate: number; totalCost: number
  items: ShipmentItem[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50' },
  in_transit: { label: 'In Transit', color: 'text-blue-700', bg: 'bg-blue-50' },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50' },
  voided: { label: 'Voided', color: 'text-red-600', bg: 'bg-red-50' },
}

const CARRIER_BADGE = 'bg-gray-100 text-gray-700 border border-gray-200'

function formatDate(d: string) { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }
function formatCurrency(n: number) { return `$${n.toFixed(2)}` }

// ─── Packing Slip Component ───
function PackingSlip({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b no-print">
          <h3 className="font-bold text-gray-900">Packing Slip</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-black">Print</button>
            <button onClick={onClose} className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs">Close</button>
          </div>
        </div>
        <div id="packing-slip-content" className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-xl font-bold">ANGEL DRAPERY</h1>
              <p className="text-xs text-gray-500 mt-1">8827 Las Tunas Dr, Temple City, CA 91780</p>
              <p className="text-xs text-gray-500">(626) 703-2929</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold font-mono">{shipment.orderNumber}</p>
              <p className="text-xs text-gray-500">{formatDate(shipment.createdAt)}</p>
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600">PACKING SLIP</h2>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">Ship From</p>
              <p className="text-sm font-medium">{shipment.fromCompany}</p>
              <p className="text-xs text-gray-600">{shipment.fromStreet}</p>
              <p className="text-xs text-gray-600">{shipment.fromCity}, {shipment.fromState} {shipment.fromZip}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">Ship To</p>
              <p className="text-sm font-medium">{shipment.toName}</p>
              <p className="text-xs text-gray-600">{shipment.toStreet}</p>
              <p className="text-xs text-gray-600">{shipment.toCity}, {shipment.toState} {shipment.toZip}</p>
              {shipment.toPhone && <p className="text-xs text-gray-500 mt-1">{shipment.toPhone}</p>}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex gap-6 text-xs text-gray-500 mb-4">
              <span>Carrier: <strong className="text-gray-900">{shipment.carrier}</strong></span>
              <span>Service: <strong className="text-gray-900">{shipment.service}</strong></span>
              <span>Tracking: <strong className="text-gray-900 font-mono">{shipment.trackingNumber}</strong></span>
            </div>
          </div>
          <table className="w-full text-sm mb-8">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-2 font-medium text-gray-600">#</th>
                <th className="text-left py-2 font-medium text-gray-600">Item</th>
                <th className="text-left py-2 font-medium text-gray-600">Details</th>
                <th className="text-center py-2 font-medium text-gray-600">Qty</th>
              </tr>
            </thead>
            <tbody>
              {shipment.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3 text-gray-400">{i + 1}</td>
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3 text-gray-500 text-xs">
                    {item.width && item.height ? `${item.width}" × ${item.height}" · ` : ''}
                    {item.options || ''}
                  </td>
                  <td className="py-3 text-center font-semibold">{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-end">
            <div className="text-xs text-gray-400">
              <p>Parcel: {shipment.parcelLength ? `${shipment.parcelLength}" × ${shipment.parcelWidth}" × ${shipment.parcelHeight}" · ` : ''}{shipment.parcelWeight} {shipment.parcelWeightUnit || 'lb'}</p>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>Angel Drapery · {shipment.orderNumber}</p>
              <p>{new Date().toLocaleDateString('en-US')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Label Preview Component ───
function LabelPreview({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-gray-900">Shipping Label</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-black">Print</button>
            <button onClick={onClose} className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs">Close</button>
          </div>
        </div>
        <div className="p-6">
          <div className="border-2 border-gray-900 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className={`text-xs font-bold px-3 py-1 rounded ${CARRIER_BADGE}`}>{shipment.carrier}</div>
              <p className="text-[10px] text-gray-400">{shipment.service}</p>
            </div>
            <div className="border-t border-b border-gray-300 py-3">
              <p className="text-[10px] uppercase text-gray-400 mb-1">FROM</p>
              <p className="text-xs font-medium">{shipment.fromCompany}</p>
              <p className="text-[11px] text-gray-600">{shipment.fromStreet}</p>
              <p className="text-[11px] text-gray-600">{shipment.fromCity}, {shipment.fromState} {shipment.fromZip}</p>
            </div>
            <div className="py-2">
              <p className="text-[10px] uppercase text-gray-400 mb-1">TO</p>
              <p className="text-lg font-bold">{shipment.toName}</p>
              <p className="text-sm">{shipment.toStreet}</p>
              <p className="text-sm font-semibold">{shipment.toCity}, {shipment.toState} {shipment.toZip}</p>
            </div>
            <div className="border-t border-gray-300 pt-3">
              <p className="text-[10px] uppercase text-gray-400 mb-1">TRACKING NUMBER</p>
              <p className="text-sm font-mono font-bold tracking-wider">{shipment.trackingNumber}</p>
            </div>
            <div className="bg-gray-100 rounded p-3 text-center">
              <div className="flex justify-center gap-[2px] h-12">
                {shipment.trackingNumber.split('').map((c, i) => (
                  <div key={i} className="bg-[#3d3d3d]" style={{ width: (parseInt(c, 36) % 3) + 1, height: '100%' }} />
                ))}
              </div>
              <p className="text-[10px] font-mono mt-1 text-gray-500">{shipment.trackingNumber}</p>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Weight: {shipment.parcelWeight} {shipment.parcelWeightUnit || 'lb'}</span>
              <span>{shipment.parcelLength ? `${shipment.parcelLength}" × ${shipment.parcelWidth}" × ${shipment.parcelHeight}"` : 'Carrier package'}</span>
            </div>
          </div>
          {shipment.status === 'voided' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-red-600 font-bold text-lg">VOID</p>
              <p className="text-red-500 text-xs">This label has been voided</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Shipment Detail Drawer ───
function ShipmentDetail({ shipment, onClose, onVoid, onPrintLabel, onPrintSlip }: {
  shipment: Shipment; onClose: () => void
  onVoid: () => void; onPrintLabel: () => void; onPrintSlip: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-xl shadow-xl overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-gray-900">Shipment Details</h2>
            <p className="text-xs text-gray-400 font-mono">{shipment.trackingNumber}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded ${CARRIER_BADGE}`}>{shipment.carrier}</span>
            <span className="text-sm text-gray-600">{shipment.service}</span>
            {(() => { const s = STATUS_CONFIG[shipment.status]; return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.color}`}>{s.label}</span> })()}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-[10px] uppercase text-gray-400 font-medium mb-2">Sender</p>
              <p className="text-sm font-medium">{shipment.fromCompany}</p>
              <p className="text-xs text-gray-600">{shipment.fromName}</p>
              <p className="text-xs text-gray-600">{shipment.fromStreet}</p>
              <p className="text-xs text-gray-600">{shipment.fromCity}, {shipment.fromState} {shipment.fromZip}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-[10px] uppercase text-gray-400 font-medium mb-2">Recipient</p>
              <p className="text-sm font-medium">{shipment.toName}</p>
              <p className="text-xs text-gray-600">{shipment.toStreet}</p>
              <p className="text-xs text-gray-600">{shipment.toCity}, {shipment.toState} {shipment.toZip}</p>
              <p className="text-xs text-gray-500 mt-1">{shipment.toPhone}</p>
              <p className="text-xs text-gray-500">{shipment.toEmail}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase text-gray-400 font-medium mb-2">Rate Breakdown</p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Retail Rate</span><span>{formatCurrency(shipment.retailRate)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping Rate</span><span className="text-gray-900 font-medium">{formatCurrency(shipment.shippingRate)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Service Fee</span><span>{formatCurrency(shipment.serviceRate)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold"><span>Total</span><span className="text-gray-900">{formatCurrency(shipment.totalCost)}</span></div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase text-gray-400 font-medium mb-2">Parcel</p>
            <div className="bg-gray-50 rounded-lg p-4 flex gap-6 text-sm">
              <span className="text-gray-500">Dimensions: <strong className="text-gray-900">{shipment.parcelLength ? `${shipment.parcelLength}" × ${shipment.parcelWidth}" × ${shipment.parcelHeight}"` : 'Carrier package'}</strong></span>
              <span className="text-gray-500">Weight: <strong className="text-gray-900">{shipment.parcelWeight} {shipment.parcelWeightUnit || 'lb'}</strong></span>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase text-gray-400 font-medium mb-2">Contents ({shipment.items.reduce((s, i) => s + i.qty, 0)} items)</p>
            <div className="space-y-2">
              {shipment.items.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.width && item.height ? `${item.width}" × ${item.height}" · ` : ''}{item.options || ''}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">×{item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase text-gray-400 font-medium mb-2">Order</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">
                <span className="text-gray-500">{shipment.source === 'custom' ? 'Source:' : 'Order #:'}</span>{' '}
                <span className="font-mono font-medium">{shipment.source === 'custom' ? 'Custom Label' : shipment.orderNumber}</span>
              </p>
              <p className="text-sm mt-1"><span className="text-gray-500">Created:</span> {formatDate(shipment.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <button onClick={onPrintLabel} className="py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-black font-medium">Print Label</button>
            <button onClick={onPrintSlip} className="py-2.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 font-medium">Packing Slip</button>
            {shipment.trackingUrl && (
              <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer"
                className="py-2.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 font-medium text-center">Track Package</a>
            )}
            {shipment.status !== 'voided' ? (
              <button onClick={onVoid} className="py-2.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 font-medium">Void Label</button>
            ) : (
              <div className="py-2.5 bg-red-50 text-red-400 text-sm rounded-lg text-center font-medium cursor-not-allowed">Voided</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Actions Dropdown ───
function ActionsDropdown({ shipment, onAction }: { shipment: Shipment; onAction: (action: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const actions = [
    { key: 'info', label: 'View details' },
    { key: 'print_label', label: 'Print label' },
    { key: 'print_slip', label: 'Print packing slip' },
    { key: 'print_both', label: 'Print label + slip' },
    { key: 'divider', label: '' },
    { key: 'export_label', label: 'Export label' },
    { key: 'export_slip', label: 'Export packing slip' },
    { key: 'divider2', label: '' },
    ...(shipment.trackingUrl ? [{ key: 'track', label: 'Track package' }] : []),
    ...(shipment.status !== 'voided' ? [{ key: 'void', label: 'Void label' }] : []),
  ]

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-black font-medium">
        Actions ▾
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] z-30">
          {actions.map((a, i) =>
            a.key.startsWith('divider') ? (
              <div key={i} className="border-t border-gray-100 my-1" />
            ) : (
              <button key={a.key} onClick={() => { onAction(a.key); setOpen(false) }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${a.key === 'void' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}`}>
                {a.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───
export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [showLabel, setShowLabel] = useState<Shipment | null>(null)
  const [showSlip, setShowSlip] = useState<Shipment | null>(null)
  const [message, setMessage] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/admin/shipments')
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        if (json?.success && json.data?.shipments) setShipments(json.data.shipments)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = shipments.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return s.trackingNumber.toLowerCase().includes(q) || s.orderNumber.toLowerCase().includes(q) || s.toName.toLowerCase().includes(q)
    }
    return true
  })

  const handleAction = async (shipment: Shipment, action: string) => {
    switch (action) {
      case 'info': setSelectedShipment(shipment); break
      case 'print_label': setShowLabel(shipment); break
      case 'print_slip': setShowSlip(shipment); break
      case 'print_both': setShowLabel(shipment); setTimeout(() => setShowSlip(shipment), 100); break
      case 'export_label':
        // The Shippo label PDF itself — open in a new tab for download/print.
        if (shipment.labelUrl && shipment.labelUrl !== '#') window.open(shipment.labelUrl, '_blank')
        else { setMessage('No label file for this shipment'); setTimeout(() => setMessage(''), 3000) }
        break
      case 'export_slip': setShowSlip(shipment); break
      case 'track': if (shipment.trackingUrl) window.open(shipment.trackingUrl, '_blank'); break
      case 'void':
        if (confirm(`Void label ${shipment.trackingNumber}?\nThis cancels the label and requests a carrier refund (USPS refunds can take up to ~14 days to approve).`)) {
          try {
            const endpoint = shipment.source === 'custom' ? '/api/admin/custom-shipping' : '/api/admin/shipping'
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'void_label', shipmentId: shipment.id }),
            })
            const data = await res.json()
            if (data.success) {
              setShipments(prev => prev.map(s => s.id === shipment.id ? { ...s, status: 'voided' as const } : s))
              setMessage('Label voided — refund requested with the carrier')
            } else {
              setMessage(data.error || 'Could not void the label')
            }
          } catch {
            setMessage('Could not void the label — network error')
          }
          setTimeout(() => setMessage(''), 6000)
        }
        break
    }
  }

  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(s => s.id)))

  const stats = {
    total: shipments.length,
    completed: shipments.filter(s => s.status === 'completed').length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    voided: shipments.filter(s => s.status === 'voided').length,
    totalCost: shipments.filter(s => s.status !== 'voided').reduce((s, i) => s + i.totalCost, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* Header */}
      <div className="bg-white shadow no-print">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
              <p className="text-sm text-gray-500 mt-1">Purchased order labels and custom labels.</p>
            </div>
            <div className="flex gap-3 items-center">
              {message && <span className="text-sm px-3 py-1 rounded bg-gray-100 text-gray-700">{message}</span>}
              <Link href="/admin/shipments/create" className="px-4 py-2 text-sm bg-[#3d3d3d] text-white rounded-lg hover:bg-gray-700">Create Custom Label</Link>
              <Link href="/admin/packing" className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Packing</Link>
              <Link href="/admin" className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">← Back to Admin</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 no-print">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'All', value: stats.total },
            { label: 'Completed', value: stats.completed },
            { label: 'In Transit', value: stats.inTransit },
            { label: 'Delivered', value: stats.delivered },
            { label: 'Voided', value: stats.voided },
            { label: 'Total label cost', value: formatCurrency(stats.totalCost) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-[11px] text-gray-500 uppercase">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5">
            {[{ key: 'all', label: 'All' }, { key: 'completed', label: 'Completed' }, { key: 'in_transit', label: 'In Transit' }, { key: 'delivered', label: 'Delivered' }, { key: 'voided', label: 'Voided' }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tracking #, order #, recipient..."
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          {selectedIds.size > 0 && (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500">{selectedIds.size} selected</span>
              <button onClick={() => { setMessage('[Simulated] Labels exported'); setTimeout(() => setMessage(''), 3000) }}
                className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-black">Export selected</button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                <th className="py-3 px-3 w-8"><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 rounded" /></th>
                <th className="py-3 px-3 text-left font-medium">Tracking</th>
                <th className="py-3 px-3 text-left font-medium">Recipient</th>
                <th className="py-3 px-3 text-left font-medium">Items</th>
                <th className="py-3 px-3 text-center font-medium">Rate</th>
                <th className="py-3 px-3 text-center font-medium">Status</th>
                <th className="py-3 px-3 text-center font-medium">Cost</th>
                <th className="py-3 px-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center text-gray-400">Loading shipments…</td></tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <p className="text-gray-400">No shipments yet — order labels and custom labels will appear here.</p>
                    <Link href="/admin/shipments/create" className="inline-flex mt-4 px-4 py-2 text-sm bg-[#3d3d3d] text-white rounded-lg hover:bg-gray-700">
                      Create Custom Label
                    </Link>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center text-gray-400">No matching shipments</td></tr>
              ) : filtered.map(s => {
                const statusCfg = STATUS_CONFIG[s.status]
                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} className="w-3.5 h-3.5 rounded" /></td>
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${CARRIER_BADGE}`}>{s.carrier}</span>
                        <div>
                          <p className="text-xs text-gray-500">{s.service}</p>
                          <button onClick={() => setSelectedShipment(s)} className="text-xs font-mono text-gray-900 underline underline-offset-2 hover:text-black mt-0.5">{s.trackingNumber}</button>
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(s.createdAt)}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{s.source === 'custom' ? 'Custom Label' : s.orderNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-sm font-medium text-gray-900">{s.toName}</p>
                      <p className="text-xs text-gray-500">{s.toStreet}</p>
                      <p className="text-xs text-gray-500">{s.toCity}, {s.toState} {s.toZip}</p>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        {s.items.map((item, i) => (
                          <p key={i} className="text-xs text-gray-600">{item.name} ×{item.qty}</p>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="space-y-0.5">
                        <p className="text-xs"><span className="text-gray-400">rate</span> <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full text-[11px] font-medium">{formatCurrency(s.shippingRate)}</span></p>
                        <p className="text-xs"><span className="text-gray-400">service</span> <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full text-[11px] font-medium">{formatCurrency(s.serviceRate)}</span></p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(s.totalCost)}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <ActionsDropdown shipment={s} onAction={(action) => handleAction(s, action)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-400 text-center">
          Showing {filtered.length} of {shipments.length} shipments
        </div>
      </div>

      {/* Modals */}
      {selectedShipment && (
        <ShipmentDetail shipment={selectedShipment} onClose={() => setSelectedShipment(null)}
          onVoid={() => { handleAction(selectedShipment, 'void'); setSelectedShipment(null) }}
          onPrintLabel={() => { setShowLabel(selectedShipment); setSelectedShipment(null) }}
          onPrintSlip={() => { setShowSlip(selectedShipment); setSelectedShipment(null) }}
        />
      )}
      {showLabel && <LabelPreview shipment={showLabel} onClose={() => setShowLabel(null)} />}
      {showSlip && <PackingSlip shipment={showSlip} onClose={() => setShowSlip(null)} />}
    </div>
  )
}
