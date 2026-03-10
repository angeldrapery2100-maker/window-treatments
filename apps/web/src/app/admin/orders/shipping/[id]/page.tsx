'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'

interface OrderItem {
  productName: string; productType: string; mainImageUrl: string | null
  width?: number; height?: number; heightFraction?: string
  options: { displayLabel: string; valueLabel: string }[]
  quantity: number; unitPrice: number
}
interface Order {
  id: string; order_number: string; status: string
  customer_name: string; customer_email: string; customer_phone: string
  shipping_address: { street?: string; city?: string; state?: string; zip?: string }
  items: OrderItem[]; total: number
}
interface Unit { itemIndex: number; unitIndex: number; productName: string; dims: string; options: string }
interface Parcel {
  id: string; length: string; width: string; height: string; weight: string
  unitIds: string[]; purchased: boolean
  trackingNumber?: string; trackingUrl?: string; labelUrl?: string; carrier?: string; service?: string; rateId?: string
}
interface ShippingRate { rateId: string; carrier: string; service: string; price: string; estimatedDays: string; carrierImage: string }
interface DbShipment {
  id: string; item_indices: number[]; item_quantities: Record<string, number>
  tracking_number: string; tracking_url: string; label_url: string; carrier: string; service: string; status: string
}

export default function ShippingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [allUnits, setAllUnits] = useState<Unit[]>([])
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [ratesMap, setRatesMap] = useState<Record<string, ShippingRate[]>>({})
  const [ratesLoading, setRatesLoading] = useState<string | null>(null)
  const [purchasingParcel, setPurchasingParcel] = useState<string | null>(null)
  const [dbShipments, setDbShipments] = useState<DbShipment[]>([])
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualTracking, setManualTracking] = useState('')
  const [manualCarrier, setManualCarrier] = useState('')
  const [manualUnitIds, setManualUnitIds] = useState<string[]>([])
  const [savingManual, setSavingManual] = useState(false)
  const [deletingShipment, setDeletingShipment] = useState<string | null>(null)
  const [notifiedShipments, setNotifiedShipments] = useState<Set<string>>(new Set())
  const [notifyingShipment, setNotifyingShipment] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/orders?status=all`).then(r => r.json()).then(d => {
      if (d.success) {
        const found = d.data?.find((o: any) => o.id === orderId)
        if (found) {
          setOrder(found)
          const units: Unit[] = []
          found.items.forEach((item: OrderItem, itemIdx: number) => {
            const dims = [item.width ? `W:${item.width}"` : '', item.height ? `H:${item.height}"` : ''].filter(Boolean).join(' x ')
            const opts = item.options?.map((o: any) => `${o.displayLabel}: ${o.valueLabel}`).join(', ') || ''
            for (let u = 0; u < (item.quantity || 1); u++) {
              units.push({ itemIndex: itemIdx, unitIndex: u, productName: item.productName, dims, options: opts })
            }
          })
          setAllUnits(units)
        }
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [orderId])

  const loadShipments = () => {
    fetch('/api/admin/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_shipments', orderId })
    }).then(r => r.json()).then(d => { if (d.success) setDbShipments(d.data.shipments || []) }).catch(() => {})
  }
  useEffect(() => { loadShipments() }, [orderId])

  const uid = (u: Unit) => `${u.itemIndex}-${u.unitIndex}`
  const assignedUnitIds = new Set(parcels.flatMap(p => p.unitIds))

  const shippedUnitIds = new Set<string>()
  dbShipments.forEach(s => {
    const qtys: Record<string, number> = s.item_quantities || {}
    if (Object.keys(qtys).length > 0) {
      Object.entries(qtys).forEach(([idx, qty]) => {
        for (let u = 0; u < qty; u++) shippedUnitIds.add(`${idx}-${u}`)
      })
    } else if (s.item_indices?.length) {
      s.item_indices.forEach(idx => {
        const item = order?.items[idx]
        if (item) for (let u = 0; u < item.quantity; u++) shippedUnitIds.add(`${idx}-${u}`)
      })
    }
  })

  const availableUnits = allUnits.filter(u => !assignedUnitIds.has(uid(u)) && !shippedUnitIds.has(uid(u)) && !manualUnitIds.includes(uid(u)))
  const unpurchasedParcels = parcels.filter(p => !p.purchased)
  const purchasedParcels = parcels.filter(p => p.purchased)
  const unitsForManual = allUnits.filter(u => !assignedUnitIds.has(uid(u)) && !shippedUnitIds.has(uid(u)))

  const addParcel = () => setParcels(prev => [...prev, { id: `p-${Date.now()}`, length: '20', width: '15', height: '5', weight: '3', unitIds: [], purchased: false }])
  const removeParcel = (pid: string) => { setParcels(prev => prev.filter(p => p.id !== pid)); setRatesMap(prev => { const n = { ...prev }; delete n[pid]; return n }) }
  const assignUnit = (unitId: string, pid: string) => setParcels(prev => prev.map(p => p.id === pid ? { ...p, unitIds: [...p.unitIds, unitId] } : p))
  const unassignUnit = (unitId: string, pid: string) => setParcels(prev => prev.map(p => p.id === pid ? { ...p, unitIds: p.unitIds.filter(id => id !== unitId) } : p))
  const assignAllToParcel = (pid: string) => { const ids = availableUnits.map(u => uid(u)); setParcels(prev => prev.map(p => p.id === pid ? { ...p, unitIds: [...new Set([...p.unitIds, ...ids])] } : p)) }
  const updateParcel = (pid: string, field: string, val: string) => setParcels(prev => prev.map(p => p.id === pid ? { ...p, [field]: val } : p))
  const selectRate = (pid: string, rateId: string) => setParcels(prev => prev.map(p => p.id === pid ? { ...p, rateId } : p))
  const getUnitInfo = (id: string) => allUnits.find(u => uid(u) === id)

  const getParcelRates = async (pid: string) => {
    const parcel = parcels.find(p => p.id === pid)
    if (!parcel || parcel.unitIds.length === 0) { setError('Parcel has no items'); return }
    setRatesLoading(pid); setError('')
    try {
      const res = await fetch('/api/admin/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_rates', orderId, parcel: { length: parcel.length, width: parcel.width, height: parcel.height, distance_unit: 'in', weight: parcel.weight, mass_unit: 'lb' } })
      })
      const data = await res.json()
      if (data.success) setRatesMap(prev => ({ ...prev, [pid]: data.data.rates }))
      else setError(data.error || 'Failed')
    } catch (e: any) { setError(e.message) }
    finally { setRatesLoading(null) }
  }

  const purchaseParcelLabel = async (pid: string) => {
    const parcel = parcels.find(p => p.id === pid)
    if (!parcel?.rateId) { setError('Please select a shipping service'); return }
    setPurchasingParcel(pid); setError('')
    try {
      const qtys: Record<number, number> = {}
      parcel.unitIds.forEach(u => { const [i] = u.split('-').map(Number); qtys[i] = (qtys[i] || 0) + 1 })
      const itemIndices = [...new Set(parcel.unitIds.map(u => Number(u.split('-')[0])))]
      const res = await fetch('/api/admin/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purchase_label', orderId, rateId: parcel.rateId, itemIndices, itemQuantities: qtys, skipEmail: true })
      })
      const data = await res.json()
      if (data.success) {
        setParcels(prev => prev.map(p => p.id !== pid ? p : { ...p, purchased: true, trackingNumber: data.data.trackingNumber, trackingUrl: data.data.trackingUrl, labelUrl: data.data.labelUrl, carrier: data.data.carrier }))
        setMessage(`Label purchased — ${data.data.trackingNumber}`)
        setTimeout(() => setMessage(''), 4000)
        loadShipments()
      } else setError(data.error || 'Purchase failed')
    } catch (e: any) { setError(e.message) }
    finally { setPurchasingParcel(null) }
  }

  const sendNotificationEmail = async () => {
    setSendingEmail(true); setError('')
    try {
      const res = await fetch('/api/admin/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_notification', orderId })
      })
      const data = await res.json()
      if (data.success) { setMessage('Notification email sent'); setTimeout(() => setMessage(''), 5000) }
      else setError(data.error || 'Failed')
    } catch (e: any) { setError(e.message) }
    finally { setSendingEmail(false) }
  }

  const saveManualParcel = async () => {
    if (!manualTracking.trim()) { setError('Please enter a tracking number'); return }
    if (manualUnitIds.length === 0) { setError('Please select at least one item'); return }
    setSavingManual(true); setError('')
    try {
      const qtys: Record<number, number> = {}
      manualUnitIds.forEach(u => { const [i] = u.split('-').map(Number); qtys[i] = (qtys[i] || 0) + 1 })
      const itemIndices = [...new Set(manualUnitIds.map(u => Number(u.split('-')[0])))]
      const res = await fetch('/api/admin/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_manual_shipment', orderId, trackingNumber: manualTracking.trim(), carrier: manualCarrier.trim(), itemIndices, itemQuantities: qtys })
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Shipment record added')
        setTimeout(() => setMessage(''), 4000)
        setShowManualForm(false); setManualTracking(''); setManualCarrier(''); setManualUnitIds([])
        loadShipments()
      } else setError(data.error || 'Failed')
    } catch (e: any) { setError(e.message) }
    finally { setSavingManual(false) }
  }

  const toggleManualUnit = (id: string) => setManualUnitIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const deleteShipment = async (shipmentId: string) => {
    if (!confirm('Delete this shipment record?')) return
    setDeletingShipment(shipmentId); setError('')
    try {
      const res = await fetch('/api/admin/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_shipment', orderId, shipmentId })
      })
      const data = await res.json()
      if (data.success) { setMessage('Shipment deleted'); setTimeout(() => setMessage(''), 4000); loadShipments() }
      else setError(data.error || 'Failed')
    } catch (e: any) { setError(e.message) }
    finally { setDeletingShipment(null) }
  }

  const notifySingleShipment = async (shipmentId: string) => {
    setNotifyingShipment(shipmentId); setError('')
    try {
      const res = await fetch('/api/admin/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_notification', orderId, shipmentId })
      })
      const data = await res.json()
      if (data.success) { setMessage('Notification sent'); setTimeout(() => setMessage(''), 4000); setNotifiedShipments(prev => new Set(prev).add(shipmentId)) }
      else setError(data.error || 'Failed')
    } catch (e: any) { setError(e.message) }
    finally { setNotifyingShipment(null) }
  }

  const totalUnits = allUnits.length
  const shippedCount = shippedUnitIds.size

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">Order not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </Link>
              <div>
                <h1 className="text-base font-semibold text-gray-900">Pack & Ship</h1>
                <p className="text-xs text-gray-400"><span className="font-mono font-medium text-gray-600">{order.order_number}</span> · {order.customer_name} · {totalUnits} items</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {message && <span className="text-sm px-3 py-1 rounded bg-green-50 text-green-700">{message}</span>}
              {error && <span className="text-sm px-3 py-1 rounded bg-red-50 text-red-600 cursor-pointer" onClick={() => setError('')}>{error} ✕</span>}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className="bg-[#3d3d3d] h-1.5 rounded-full transition-all" style={{ width: `${totalUnits > 0 ? (shippedCount / totalUnits * 100) : 0}%` }} />
            </div>
            <span className="text-gray-500 whitespace-nowrap">
              {shippedCount > 0 && <span className="text-green-600 font-medium">{shippedCount} shipped</span>}
              {assignedUnitIds.size > 0 && <span className="text-blue-600 font-medium ml-2">{assignedUnitIds.size} packed</span>}
              {availableUnits.length > 0 && <span className="text-gray-400 ml-2">{availableUnits.length} unpacked</span>}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Shipped Parcels */}
        {dbShipments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Shipped Parcels</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dbShipments.map((s, i) => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">Parcel {i + 1}</span>
                    <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{s.carrier}</span>
                  </div>
                  <p className="text-xs font-mono text-gray-500 mb-2">{s.tracking_number}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(s.item_indices || []).map((idx: number) => {
                      const item = order.items[idx]; const qty = s.item_quantities?.[String(idx)]
                      return item ? <span key={idx} className="text-[11px] bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{item.productName}{qty ? ` x${qty}` : ''}</span> : null
                    })}
                  </div>
                  <div className="flex gap-3 mb-3">
                    {s.tracking_url && <a href={s.tracking_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-600 underline hover:text-gray-900">Track</a>}
                    {s.label_url && <a href={s.label_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-600 underline hover:text-gray-900">Print Label</a>}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button onClick={() => notifySingleShipment(s.id)}
                      disabled={notifiedShipments.has(s.id) || notifyingShipment === s.id}
                      className="flex-1 py-1.5 text-[11px] rounded-md font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200">
                      {notifyingShipment === s.id ? 'Sending...' : notifiedShipments.has(s.id) ? 'Notified' : 'Send Notification'}
                    </button>
                    <button onClick={() => deleteShipment(s.id)} disabled={deletingShipment === s.id}
                      className="py-1.5 px-3 text-[11px] rounded-md font-medium text-red-500 hover:bg-red-50 disabled:opacity-40">
                      {deletingShipment === s.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Unpacked Items */}
          <div>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Unpacked Items ({availableUnits.length})</h2>
            {availableUnits.length === 0 ? (
              <div className="bg-white rounded-lg border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">All items packed or shipped</div>
            ) : (
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                {availableUnits.map(u => {
                  const id = uid(u)
                  return (
                    <div key={id} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.productName}</p>
                          <p className="text-[11px] text-gray-400">{u.dims}</p>
                          {u.options && <p className="text-[11px] text-gray-400 truncate">{u.options}</p>}
                          <p className="text-[10px] text-gray-300 mt-0.5">#{u.itemIndex + 1}-{u.unitIndex + 1}</p>
                        </div>
                        {unpurchasedParcels.length > 0 && (
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            {unpurchasedParcels.map((p) => (
                              <button key={p.id} onClick={() => assignUnit(id, p.id)}
                                className="text-[11px] px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 border border-gray-200 whitespace-nowrap">
                                Parcel {parcels.indexOf(p) + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Parcels */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Parcels ({parcels.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => { setShowManualForm(true); setManualTracking(''); setManualCarrier(''); setManualUnitIds([]) }}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-50">Add Manual Shipment</button>
                <button onClick={addParcel} className="px-3 py-1.5 bg-[#3d3d3d] text-white text-xs rounded-md hover:bg-gray-700">Add Parcel</button>
              </div>
            </div>

            {parcels.length === 0 && !showManualForm ? (
              <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-400 mb-3 text-sm">Add a parcel to start packing, or add an existing shipment</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={addParcel} className="px-4 py-2 bg-[#3d3d3d] text-white text-sm rounded-md hover:bg-gray-700">Add First Parcel</button>
                  <button onClick={() => { setShowManualForm(true); setManualTracking(''); setManualCarrier(''); setManualUnitIds([]) }}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-50">Add Manual Shipment</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Manual Form */}
                {showManualForm && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Manual Shipment Entry</span>
                        <span className="text-[11px] text-gray-400 ml-2">Add an existing tracking number</span>
                      </div>
                      <button onClick={() => { setShowManualForm(false); setManualUnitIds([]) }} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Tracking Number *</label>
                          <input type="text" value={manualTracking} onChange={e => setManualTracking(e.target.value)} placeholder="Enter tracking number"
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Carrier</label>
                          <input type="text" value={manualCarrier} onChange={e => setManualCarrier(e.target.value)} placeholder="e.g. UPS, USPS, FedEx"
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500 font-medium">Select items in this shipment</p>
                          {unitsForManual.length > 0 && (
                            <button onClick={() => {
                              const allIds = unitsForManual.map(u => uid(u))
                              setManualUnitIds(allIds.every(id => manualUnitIds.includes(id)) ? [] : allIds)
                            }} className="text-[11px] text-gray-600 hover:text-gray-900">
                              {unitsForManual.every(u => manualUnitIds.includes(uid(u))) ? 'Deselect All' : 'Select All'}
                            </button>
                          )}
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {unitsForManual.map(u => {
                            const id = uid(u); const selected = manualUnitIds.includes(id)
                            return (
                              <label key={id} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${selected ? 'bg-gray-100 border border-gray-300' : 'bg-gray-50 border border-transparent hover:border-gray-200'}`}>
                                <input type="checkbox" checked={selected} onChange={() => toggleManualUnit(id)} className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-gray-800 truncate">{u.productName}</p>
                                  <p className="text-[10px] text-gray-400">{u.dims} · #{u.itemIndex + 1}-{u.unitIndex + 1}</p>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                      <button onClick={saveManualParcel} disabled={savingManual || !manualTracking.trim() || manualUnitIds.length === 0}
                        className="w-full py-2 bg-[#3d3d3d] text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium">
                        {savingManual ? 'Saving...' : `Save Shipment (${manualUnitIds.length} items)`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Parcel Cards */}
                {parcels.map((parcel, pi) => {
                  const parcelRates = ratesMap[parcel.id] || []
                  return (
                    <div key={parcel.id} className={`bg-white rounded-lg border overflow-hidden ${parcel.purchased ? 'border-green-300' : 'border-gray-200'}`}>
                      <div className={`px-4 py-3 flex items-center justify-between ${parcel.purchased ? 'bg-green-50 border-b border-green-200' : 'bg-gray-50 border-b border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">Parcel {pi + 1}</span>
                          <span className="text-[11px] text-gray-400">{parcel.unitIds.length} items</span>
                          {parcel.purchased && <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Purchased</span>}
                        </div>
                        {!parcel.purchased && <button onClick={() => removeParcel(parcel.id)} className="text-xs text-gray-400 hover:text-red-500">Remove</button>}
                      </div>
                      <div className="p-4 space-y-4">
                        {parcel.purchased && (
                          <div className="bg-green-50 rounded-md p-3 space-y-1">
                            <p className="text-xs"><span className="text-gray-400">Carrier:</span> <span className="font-medium">{parcel.carrier}</span></p>
                            <p className="text-xs"><span className="text-gray-400">Tracking:</span> <span className="font-mono font-medium">{parcel.trackingNumber}</span></p>
                            <div className="flex gap-3 mt-1">
                              {parcel.trackingUrl && <a href={parcel.trackingUrl} target="_blank" className="text-[11px] text-green-700 underline">Track</a>}
                              {parcel.labelUrl && <a href={parcel.labelUrl} target="_blank" className="text-[11px] text-green-700 underline">Print Label</a>}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 font-medium">Items</p>
                            {!parcel.purchased && availableUnits.length > 0 && (
                              <button onClick={() => assignAllToParcel(parcel.id)} className="text-[11px] text-gray-600 hover:text-gray-900">Add All</button>
                            )}
                          </div>
                          {parcel.unitIds.length === 0 ? (
                            <div className="border border-dashed border-gray-200 rounded-md p-4 text-center text-xs text-gray-400">Select items from the left panel</div>
                          ) : (
                            <div className="space-y-1">
                              {parcel.unitIds.map(id => {
                                const info = getUnitInfo(id); if (!info) return null
                                return (
                                  <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-gray-800 truncate">{info.productName}</p>
                                      <p className="text-[10px] text-gray-400">{info.dims} · #{info.itemIndex + 1}-{info.unitIndex + 1}</p>
                                    </div>
                                    {!parcel.purchased && <button onClick={() => unassignUnit(id, parcel.id)} className="text-[11px] text-gray-400 hover:text-red-500 ml-2">✕</button>}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        {!parcel.purchased && (
                          <>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-2">Dimensions</p>
                              <div className="grid grid-cols-4 gap-2">
                                {(['length', 'width', 'height', 'weight'] as const).map(f => (
                                  <div key={f}>
                                    <label className="block text-[10px] text-gray-400 mb-0.5">{{ length: 'L (in)', width: 'W (in)', height: 'H (in)', weight: 'Wt (lb)' }[f]}</label>
                                    <input type="number" value={(parcel as any)[f]} onChange={e => updateParcel(parcel.id, f, e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button onClick={() => getParcelRates(parcel.id)} disabled={ratesLoading === parcel.id || parcel.unitIds.length === 0}
                              className="px-3 py-1.5 bg-[#3d3d3d] text-white text-xs rounded-md hover:bg-gray-700 disabled:opacity-50">
                              {ratesLoading === parcel.id ? 'Loading...' : 'Get Shipping Rates'}
                            </button>
                            {parcelRates.length > 0 && (
                              <div className="space-y-1.5">
                                {parcelRates.map(rate => (
                                  <label key={rate.rateId} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${parcel.rateId === rate.rateId ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-3">
                                      <input type="radio" name={`rate-${parcel.id}`} checked={parcel.rateId === rate.rateId} onChange={() => selectRate(parcel.id, rate.rateId)} className="w-4 h-4 text-gray-900" />
                                      <div><p className="text-sm font-medium">{rate.carrier} — {rate.service}</p><p className="text-[11px] text-gray-400">Est. {rate.estimatedDays} days</p></div>
                                    </div>
                                    <span className="text-sm font-semibold">${rate.price}</span>
                                  </label>
                                ))}
                                <button onClick={() => purchaseParcelLabel(parcel.id)} disabled={!parcel.rateId || purchasingParcel === parcel.id}
                                  className="w-full py-2 bg-[#3d3d3d] text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium">
                                  {purchasingParcel === parcel.id ? 'Purchasing...' : 'Purchase Label'}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        {(dbShipments.length > 0 || purchasedParcels.length > 0) && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{dbShipments.length + purchasedParcels.length}</span> labels purchased
              {availableUnits.length > 0 && <span className="text-gray-400 ml-3">({availableUnits.length} items remaining)</span>}
            </div>
            <button onClick={sendNotificationEmail} disabled={sendingEmail}
              className="px-5 py-2.5 bg-[#3d3d3d] text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium">
              {sendingEmail ? 'Sending...' : 'Send Notification Email'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
