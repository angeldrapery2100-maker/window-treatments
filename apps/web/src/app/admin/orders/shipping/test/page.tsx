'use client'

import { useState, useEffect } from 'react'

// Mock data generator
function mockOrder() {
  return {
    id: 'test-order-id',
    order_number: 'TEST-20260224-001',
    status: 'in_production',
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '626-555-1234',
    shipping_address: { street: '123 Test St', city: 'Temple City', state: 'CA', zip: '91780' },
    total: 2580,
    items: [
      { productName: 'Elegant Sheer Curtain', productType: 'sheer', mainImageUrl: null, width: 72, height: 84, heightFraction: '1/2', options: [{ displayLabel: 'Fabric Code', valueLabel: 'White Linen' }, { displayLabel: 'Operation', valueLabel: 'Center Split' }], quantity: 3, unitPrice: 320 },
      { productName: 'Blackout Roller Shade', productType: 'shade', mainImageUrl: null, width: 36, height: 60, options: [{ displayLabel: 'Fabric Color', valueLabel: 'Ivory' }, { displayLabel: 'Mount', valueLabel: 'Inside Mount' }, { displayLabel: 'Operation', valueLabel: 'Cordless' }], quantity: 2, unitPrice: 450 },
      { productName: 'Double Curtain Rod 72"', productType: 'hardware', mainImageUrl: null, width: 72, options: [{ displayLabel: 'Color', valueLabel: 'Brushed Nickel' }], quantity: 1, unitPrice: 120 },
    ],
  }
}

interface Unit { itemIndex: number; unitIndex: number; productName: string; dims: string; options: string }
interface Parcel {
  id: string; length: string; width: string; height: string; weight: string
  unitIds: string[]; purchased: boolean
  trackingNumber?: string; trackingUrl?: string; labelUrl?: string; carrier?: string; service?: string; rateId?: string
}
interface MockShipment {
  id: string; item_indices: number[]; item_quantities: Record<string, number>
  tracking_number: string; tracking_url: string; label_url: string; carrier: string; service: string; status: string
}

let shipmentCounter = 0

export default function TestShippingPage() {
  const order = mockOrder()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [allUnits, setAllUnits] = useState<Unit[]>([])
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [ratesLoading, setRatesLoading] = useState<string | null>(null)
  const [ratesMap, setRatesMap] = useState<Record<string, any[]>>({})
  const [purchasingParcel, setPurchasingParcel] = useState<string | null>(null)
  const [dbShipments, setDbShipments] = useState<MockShipment[]>([])
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
    const units: Unit[] = []
    order.items.forEach((item, itemIdx) => {
      const dims = [item.width ? `W:${item.width}"` : '', item.height ? `H:${item.height}"` : ''].filter(Boolean).join(' × ')
      const opts = item.options?.map(o => `${o.displayLabel}: ${o.valueLabel}`).join(', ') || ''
      for (let u = 0; u < (item.quantity || 1); u++) {
        units.push({ itemIndex: itemIdx, unitIndex: u, productName: item.productName, dims, options: opts })
      }
    })
    setAllUnits(units)
  }, [])

  const uid = (u: Unit) => `${u.itemIndex}-${u.unitIndex}`
  const assignedUnitIds = new Set(parcels.flatMap(p => p.unitIds))

  const shippedUnitIds = new Set<string>()
  dbShipments.forEach(s => {
    const qtys = s.item_quantities || {}
    Object.entries(qtys).forEach(([idx, qty]) => {
      for (let u = 0; u < qty; u++) shippedUnitIds.add(`${idx}-${u}`)
    })
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
    if (!parcel || parcel.unitIds.length === 0) { setError('包裹中没有商品'); return }
    setRatesLoading(pid); setError('')
    await new Promise(r => setTimeout(r, 800))
    setRatesMap(prev => ({ ...prev, [pid]: [
      { rateId: `usps-${pid}`, carrier: 'USPS', service: 'Priority Mail', price: '12.50', estimatedDays: '2-3' },
      { rateId: `ups-${pid}`, carrier: 'UPS', service: 'Ground', price: '15.80', estimatedDays: '3-5' },
      { rateId: `fedex-${pid}`, carrier: 'FedEx', service: 'Home Delivery', price: '18.25', estimatedDays: '2-4' },
    ] }))
    setRatesLoading(null)
  }

  const purchaseParcelLabel = async (pid: string) => {
    const parcel = parcels.find(p => p.id === pid)
    if (!parcel?.rateId) { setError('请先选择快递服务'); return }
    setPurchasingParcel(pid); setError('')
    await new Promise(r => setTimeout(r, 1200))
    const rate = ratesMap[pid]?.find(r => r.rateId === parcel.rateId)
    const trackNum = `MOCK${++shipmentCounter}${Date.now().toString(36).toUpperCase()}`
    const qtys: Record<number, number> = {}
    parcel.unitIds.forEach(u => { const [i] = u.split('-').map(Number); qtys[i] = (qtys[i] || 0) + 1 })
    const itemIndices = [...new Set(parcel.unitIds.map(u => Number(u.split('-')[0])))]
    const newShipment: MockShipment = {
      id: `ship-${Date.now()}`, item_indices: itemIndices,
      item_quantities: Object.fromEntries(Object.entries(qtys).map(([k, v]) => [k, v])),
      tracking_number: trackNum, tracking_url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackNum}`,
      label_url: '', carrier: rate?.carrier || 'USPS', service: rate?.service || '', status: 'shipped',
    }
    setDbShipments(prev => [...prev, newShipment])
    setParcels(prev => prev.map(p => p.id !== pid ? p : { ...p, purchased: true, trackingNumber: trackNum, trackingUrl: newShipment.tracking_url, carrier: newShipment.carrier }))
    setMessage(`✅ [模拟] 运单已购买 - ${trackNum}`); setTimeout(() => setMessage(''), 4000)
    setPurchasingParcel(null)
  }

  const sendNotificationEmail = async () => {
    setSendingEmail(true)
    await new Promise(r => setTimeout(r, 800))
    setMessage('✅ [模拟] 发货通知邮件已发送'); setTimeout(() => setMessage(''), 5000)
    setSendingEmail(false)
  }

  const saveManualParcel = async () => {
    if (!manualTracking.trim()) { setError('请输入追踪号'); return }
    if (manualUnitIds.length === 0) { setError('请选择至少一个商品'); return }
    setSavingManual(true)
    await new Promise(r => setTimeout(r, 600))
    const qtys: Record<number, number> = {}
    manualUnitIds.forEach(u => { const [i] = u.split('-').map(Number); qtys[i] = (qtys[i] || 0) + 1 })
    const itemIndices = [...new Set(manualUnitIds.map(u => Number(u.split('-')[0])))]
    setDbShipments(prev => [...prev, {
      id: `ship-m-${Date.now()}`, item_indices: itemIndices,
      item_quantities: Object.fromEntries(Object.entries(qtys).map(([k, v]) => [k, v])),
      tracking_number: manualTracking.trim(), tracking_url: '', label_url: '',
      carrier: manualCarrier.trim() || 'Manual', service: '', status: 'shipped',
    }])
    setMessage('✅ [模拟] 已添加运单记录'); setTimeout(() => setMessage(''), 4000)
    setShowManualForm(false); setManualTracking(''); setManualCarrier(''); setManualUnitIds([])
    setSavingManual(false)
  }

  const toggleManualUnit = (id: string) => setManualUnitIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const deleteShipment = async (shipmentId: string) => {
    if (!confirm('确定要删除此运单记录吗？')) return
    setDeletingShipment(shipmentId)
    await new Promise(r => setTimeout(r, 500))
    // Remove from purchased parcels too
    const shipment = dbShipments.find(s => s.id === shipmentId)
    if (shipment) setParcels(prev => prev.filter(p => p.trackingNumber !== shipment.tracking_number))
    setDbShipments(prev => prev.filter(s => s.id !== shipmentId))
    setMessage('✅ [模拟] 运单已删除'); setTimeout(() => setMessage(''), 4000)
    setDeletingShipment(null)
  }

  const notifySingleShipment = async (shipmentId: string) => {
    setNotifyingShipment(shipmentId)
    await new Promise(r => setTimeout(r, 800))
    setMessage('✅ [模拟] 通知邮件已发送'); setTimeout(() => setMessage(''), 4000)
    setNotifiedShipments(prev => new Set(prev).add(shipmentId))
    setNotifyingShipment(null)
  }

  const totalUnits = allUnits.length
  const shippedCount = shippedUnitIds.size

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-amber-400 text-amber-900 text-center py-2 text-sm font-medium">🧪 测试模式 — 所有操作均为模拟，不调用真实 API</div>

      <div className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/admin/orders" className="text-gray-400 hover:text-gray-600 text-sm">← 返回订单</a>
              <div>
                <h1 className="text-lg font-bold text-gray-900">📦 打包发货</h1>
                <p className="text-xs text-gray-400"><span className="font-mono font-medium text-gray-600">{order.order_number}</span> · {order.customer_name} · {totalUnits} 件商品</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {message && <span className="text-sm px-3 py-1 rounded bg-green-50 text-green-700">{message}</span>}
              {error && <span className="text-sm px-3 py-1 rounded bg-red-50 text-red-600 cursor-pointer" onClick={() => setError('')}>{error} ✕</span>}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${totalUnits > 0 ? (shippedCount / totalUnits * 100) : 0}%` }} />
            </div>
            <span className="text-gray-500 whitespace-nowrap">
              {shippedCount > 0 && <span className="text-green-600 font-medium">{shippedCount} 已发货</span>}
              {assignedUnitIds.size > 0 && <span className="text-blue-600 font-medium ml-2">{assignedUnitIds.size} 已装箱</span>}
              {availableUnits.length > 0 && <span className="text-gray-400 ml-2">{availableUnits.length} 待装箱</span>}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 已发货包裹 */}
        {dbShipments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">已发货包裹</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dbShipments.map((s, i) => (
                <div key={s.id} className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-cyan-800">包裹 {i + 1}</span>
                    <span className="text-[11px] bg-cyan-100 px-2 py-0.5 rounded-full text-cyan-700">{s.carrier}</span>
                  </div>
                  <p className="text-xs font-mono text-gray-600 mb-2">追踪号: {s.tracking_number}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {s.item_indices.map((idx) => {
                      const item = order.items[idx]; const qty = s.item_quantities?.[String(idx)]
                      return item ? <span key={idx} className="text-[11px] bg-white px-2 py-0.5 rounded border border-cyan-200">{item.productName}{qty ? ` ×${qty}` : ''}</span> : null
                    })}
                  </div>
                  {s.tracking_url && <div className="flex gap-2 mb-3"><a href={s.tracking_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-700 underline">追踪 ↗</a></div>}
                  <div className="flex gap-2 pt-2 border-t border-cyan-200">
                    <button onClick={() => notifySingleShipment(s.id)}
                      disabled={notifiedShipments.has(s.id) || notifyingShipment === s.id}
                      className="flex-1 py-1.5 text-[11px] rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-blue-50 text-blue-600 hover:bg-blue-100">
                      {notifyingShipment === s.id ? '发送中...' : notifiedShipments.has(s.id) ? '✅ 已通知' : '📧 发送通知'}
                    </button>
                    <button onClick={() => deleteShipment(s.id)} disabled={deletingShipment === s.id}
                      className="py-1.5 px-3 text-[11px] rounded-lg font-medium text-red-500 hover:bg-red-50 disabled:opacity-40">
                      {deletingShipment === s.id ? '删除中...' : '删除'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧: 待装箱 */}
          <div>
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">待装箱商品 ({availableUnits.length})</h2>
            {availableUnits.length === 0 ? (
              <div className="bg-white rounded-lg border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">🎉 所有商品已装箱或已发货</div>
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
                            {unpurchasedParcels.map(p => (
                              <button key={p.id} onClick={() => assignUnit(id, p.id)}
                                className="text-[11px] px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 whitespace-nowrap">
                                → 包裹{parcels.indexOf(p) + 1}
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

          {/* 右侧: 包裹 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">包裹 ({parcels.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => { setShowManualForm(true); setManualTracking(''); setManualCarrier(''); setManualUnitIds([]) }}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50">📋 添加已有运单</button>
                <button onClick={addParcel} className="px-3 py-1.5 bg-[#3d3d3d] text-white text-xs rounded-lg hover:bg-gray-700">➕ 添加包裹</button>
              </div>
            </div>

            {parcels.length === 0 && !showManualForm ? (
              <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-400 mb-3">点击「添加包裹」开始打包，或添加已有运单</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={addParcel} className="px-4 py-2 bg-[#3d3d3d] text-white text-sm rounded-lg hover:bg-gray-700">➕ 添加第一个包裹</button>
                  <button onClick={() => { setShowManualForm(true); setManualTracking(''); setManualCarrier(''); setManualUnitIds([]) }}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">📋 添加已有运单</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 手动运单表单 */}
                {showManualForm && (
                  <div className="bg-white rounded-lg border-2 border-amber-300 overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between bg-amber-50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">📋 添加已有运单</span>
                        <span className="text-[11px] text-gray-400">手动录入已购买的运单</span>
                      </div>
                      <button onClick={() => { setShowManualForm(false); setManualUnitIds([]) }} className="text-xs text-red-400 hover:text-red-600">取消</button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-0.5">追踪号 *</label>
                          <input type="text" value={manualTracking} onChange={e => setManualTracking(e.target.value)} placeholder="输入追踪号"
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-0.5">快递公司</label>
                          <input type="text" value={manualCarrier} onChange={e => setManualCarrier(e.target.value)} placeholder="例: UPS, USPS, FedEx"
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500 font-medium">选择该运单包含的商品</p>
                          {unitsForManual.length > 0 && (
                            <button onClick={() => {
                              const allIds = unitsForManual.map(u => uid(u))
                              setManualUnitIds(allIds.every(id => manualUnitIds.includes(id)) ? [] : allIds)
                            }} className="text-[11px] text-blue-600 hover:text-blue-800">
                              {unitsForManual.every(u => manualUnitIds.includes(uid(u))) ? '取消全选' : '全选'}
                            </button>
                          )}
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {unitsForManual.map(u => {
                            const id = uid(u); const selected = manualUnitIds.includes(id)
                            return (
                              <label key={id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selected ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-transparent hover:border-gray-200'}`}>
                                <input type="checkbox" checked={selected} onChange={() => toggleManualUnit(id)} className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600" />
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
                        className="w-full py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium">
                        {savingManual ? '保存中...' : `📋 保存运单记录 (${manualUnitIds.length} 件商品)`}
                      </button>
                    </div>
                  </div>
                )}

                {/* 包裹列表 */}
                {parcels.map((parcel, pi) => {
                  const parcelRates = ratesMap[parcel.id] || []
                  return (
                    <div key={parcel.id} className={`bg-white rounded-lg border-2 overflow-hidden ${parcel.purchased ? 'border-green-300' : 'border-gray-200'}`}>
                      <div className={`px-4 py-3 flex items-center justify-between ${parcel.purchased ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900">包裹 {pi + 1}</span>
                          <span className="text-[11px] text-gray-400">{parcel.unitIds.length} 件</span>
                          {parcel.purchased && <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✅ 已购买</span>}
                        </div>
                        {!parcel.purchased && <button onClick={() => removeParcel(parcel.id)} className="text-xs text-red-400 hover:text-red-600">删除</button>}
                      </div>
                      <div className="p-4 space-y-4">
                        {parcel.purchased && (
                          <div className="bg-green-50 rounded-lg p-3 space-y-1">
                            <p className="text-xs"><span className="text-gray-400">快递:</span> <span className="font-medium">{parcel.carrier}</span></p>
                            <p className="text-xs"><span className="text-gray-400">追踪号:</span> <span className="font-mono font-medium">{parcel.trackingNumber}</span></p>
                            {parcel.trackingUrl && <a href={parcel.trackingUrl} target="_blank" className="text-[11px] text-green-700 underline">追踪 ↗</a>}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 font-medium">包裹内商品</p>
                            {!parcel.purchased && availableUnits.length > 0 && (
                              <button onClick={() => assignAllToParcel(parcel.id)} className="text-[11px] text-blue-600 hover:text-blue-800">全部放入 ↓</button>
                            )}
                          </div>
                          {parcel.unitIds.length === 0 ? (
                            <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">从左侧选择商品放入此包裹</div>
                          ) : (
                            <div className="space-y-1">
                              {parcel.unitIds.map(id => {
                                const info = getUnitInfo(id); if (!info) return null
                                return (
                                  <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-gray-800 truncate">{info.productName}</p>
                                      <p className="text-[10px] text-gray-400">{info.dims} · #{info.itemIndex + 1}-{info.unitIndex + 1}</p>
                                    </div>
                                    {!parcel.purchased && <button onClick={() => unassignUnit(id, parcel.id)} className="text-[11px] text-red-400 hover:text-red-600 ml-2">✕</button>}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        {!parcel.purchased && (
                          <>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-2">包裹尺寸</p>
                              <div className="grid grid-cols-4 gap-2">
                                {(['length', 'width', 'height', 'weight'] as const).map(f => (
                                  <div key={f}>
                                    <label className="block text-[10px] text-gray-400 mb-0.5">{{ length: '长(in)', width: '宽(in)', height: '高(in)', weight: '重量(lb)' }[f]}</label>
                                    <input type="number" value={(parcel as any)[f]} onChange={e => updateParcel(parcel.id, f, e.target.value)}
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button onClick={() => getParcelRates(parcel.id)} disabled={ratesLoading === parcel.id || parcel.unitIds.length === 0}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50">
                              {ratesLoading === parcel.id ? '获取中...' : '获取运费报价'}
                            </button>
                            {parcelRates.length > 0 && (
                              <div className="space-y-1.5">
                                {parcelRates.map(rate => (
                                  <label key={rate.rateId} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer ${parcel.rateId === rate.rateId ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-3">
                                      <input type="radio" name={`rate-${parcel.id}`} checked={parcel.rateId === rate.rateId} onChange={() => selectRate(parcel.id, rate.rateId)} className="w-4 h-4 text-blue-600" />
                                      <div><p className="text-sm font-medium">{rate.carrier} - {rate.service}</p><p className="text-[11px] text-gray-400">预计 {rate.estimatedDays} 天</p></div>
                                    </div>
                                    <span className="text-sm font-semibold">${rate.price}</span>
                                  </label>
                                ))}
                                <button onClick={() => purchaseParcelLabel(parcel.id)} disabled={!parcel.rateId || purchasingParcel === parcel.id}
                                  className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
                                  {purchasingParcel === parcel.id ? '购买中...' : '🏷️ 购买运单'}
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

        {(dbShipments.length > 0 || purchasedParcels.length > 0) && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              已购买 <span className="font-semibold text-green-700">{dbShipments.length}</span> 个运单
              {availableUnits.length > 0 && <span className="text-gray-400 ml-3">（还有 {availableUnits.length} 件待装箱）</span>}
            </div>
            <button onClick={sendNotificationEmail} disabled={sendingEmail}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {sendingEmail ? '发送中...' : '📧 发送发货通知邮件'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
