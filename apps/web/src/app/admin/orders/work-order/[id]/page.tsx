'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'

interface OrderItem {
  productName: string
  productType: string
  productId?: string
  mainImageUrl: string | null
  width?: number
  height?: number
  heightFraction?: string
  widthFraction?: string
  options: { name?: string; displayLabel: string; value?: string; valueLabel: string }[]
  quantity: number
  unitPrice: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: { street?: string; city?: string; state?: string; zip?: string }
  items: OrderItem[]
  created_at: string
  notes: string
  admin_notes: string
}

interface ProductParams {
  fabric_width?: number
  sheer_fabric_width?: number
  [key: string]: any
}

const ITEMS_PER_PAGE = 8
const CATEGORIES = ['drapery', 'sheer', 'shade', 'hardware'] as const
const CATEGORY_LABELS: Record<string, string> = { drapery: 'DRAPERY', sheer: 'SHEER', shade: 'SHADE', hardware: 'HARDWARE' }

function getOption(item: OrderItem, key: string): string {
  const opt = item.options?.find(o => o.displayLabel?.toLowerCase().includes(key.toLowerCase()))
  return opt?.valueLabel || ''
}

// ─── Calculations ───
function calcDrapery(item: OrderItem, fabricWidth: number) {
  const w = item.width || 0, h = item.height || 0, multiplier = 2.5
  const operation = getOption(item, 'operation') || getOption(item, 'split') || ''
  const isCenterSplit = operation.toLowerCase().includes('center')
  const totalFabricWidth = w * multiplier
  const panelCount = isCenterSplit ? 2 : 1
  const panelWidth = isCenterSplit ? Math.round((w / 2) * 100) / 100 : w
  const panelFabricWidth = isCenterSplit ? totalFabricWidth / 2 : totalFabricWidth
  const widthsPerPanel = Math.ceil((panelFabricWidth / fabricWidth) * 2) / 2
  const totalFabricYards = Math.round((widthsPerPanel * panelCount * h / 36) * 100) / 100
  return { panelCount, panelWidth, panelHeight: h, isCenterSplit, widthsPerPanel, totalFabricYards }
}

function roundTwoSheThreeJin(value: number): number {
  const integer = Math.floor(value)
  return (value - integer) < 0.3 ? integer : integer + 1
}

function calcSheer(item: OrderItem, sheerFabricWidth: number) {
  const w = item.width || 0, h = item.height || 0, multiplier = 3.5
  const operation = getOption(item, 'operation') || getOption(item, 'split') || ''
  const isCenterSplit = operation.toLowerCase().includes('center')
  const panelCount = isCenterSplit ? 2 : 1
  const panelWidth = isCenterSplit ? Math.round((w / 2) * 100) / 100 : w
  let method = '', sheerYard = 0, sheerPanelRaw = 0, sheerPanel = 0, cutLength = 0
  if (sheerFabricWidth >= 110) {
    if (h < sheerFabricWidth - 16) {
      method = 'horizontal'; cutLength = Math.round((w * multiplier) * 100) / 100; sheerYard = Math.ceil(cutLength / 36)
    } else {
      method = 'vertical'; sheerPanelRaw = Math.round(((w * multiplier) / sheerFabricWidth) * 100) / 100
      sheerPanel = roundTwoSheThreeJin(sheerPanelRaw); sheerYard = Math.ceil((sheerPanel * (h + 20)) / 36)
    }
  } else {
    method = 'normal'; sheerPanelRaw = Math.round(((w * multiplier) / sheerFabricWidth) * 100) / 100
    sheerPanel = Math.ceil(sheerPanelRaw); sheerYard = Math.ceil((sheerPanel * (h + 20)) / 36)
  }
  return { panelCount, panelWidth, panelHeight: h, isCenterSplit, method, sheerPanelRaw, sheerPanel, sheerYard, cutLength, sheerFabricWidth }
}

const ls: React.CSSProperties = { color: '#9ca3af', fontSize: 9 }
const vs: React.CSSProperties = { fontWeight: 600, fontSize: 9 }

// ─── Item Renderers ───
function DraperyItem({ item, index, fabricWidth }: { item: OrderItem; index: number; fabricWidth: number }) {
  const c = calcDrapery(item, fabricWidth)
  const hf = item.heightFraction && item.heightFraction !== '0' ? ` ${item.heightFraction}` : ''
  return (
    <div style={{ borderBottom: '1px solid #d1d5db', paddingBottom: 14, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', width: 75, height: 75, flexShrink: 0, border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
          {item.mainImageUrl ? <Image src={item.mainImageUrl} alt="" fill sizes="75px" style={{ objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#9ca3af' }}>No Img</div>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 12 }}>{index}. {item.productName}</p>
          <p style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>Size: {item.width}" × {item.height}"{hf} · Qty: {item.quantity}</p>
          <div style={{ marginTop: 4, fontSize: 9, color: '#4b5563', lineHeight: 1.6 }}>
            {item.options?.map((o, i) => <span key={i} style={{ marginRight: 10 }}><span style={ls}>{o.displayLabel}:</span> <span style={vs}>{o.valueLabel}</span></span>)}
          </div>
          <div style={{ marginTop: 4, fontSize: 9, color: '#4b5563', lineHeight: 1.7 }}>
            <span style={{ marginRight: 12 }}><span style={ls}>Panel:</span> <span style={vs}>{c.panelCount}</span> <span style={{ color: '#6b7280' }}>({c.isCenterSplit ? 'Center Split' : 'One Way'})</span></span>
            <span style={{ marginRight: 12 }}><span style={ls}>Panel Size:</span> <span style={vs}>{c.panelWidth}" × {c.panelHeight}"</span></span>
            <span style={{ marginRight: 12 }}><span style={ls}>Widths/Panel:</span> <span style={vs}>{c.widthsPerPanel}</span></span>
            <span><span style={ls}>Total Fabric:</span> <span style={vs}>{c.totalFabricYards} yd</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SheerItem({ item, index, fabricWidth }: { item: OrderItem; index: number; fabricWidth: number }) {
  const c = calcSheer(item, fabricWidth)
  const hf = item.heightFraction && item.heightFraction !== '0' ? ` ${item.heightFraction}` : ''
  const ml = c.method === 'horizontal' ? 'Horizontal Cut' : c.method === 'vertical' ? 'Vertical Seam' : 'Normal'
  return (
    <div style={{ borderBottom: '1px solid #d1d5db', paddingBottom: 14, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', width: 75, height: 75, flexShrink: 0, border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
          {item.mainImageUrl ? <Image src={item.mainImageUrl} alt="" fill sizes="75px" style={{ objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#9ca3af' }}>No Img</div>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 12 }}>{index}. {item.productName}</p>
          <p style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>Size: {item.width}" × {item.height}"{hf} · Qty: {item.quantity}</p>
          <div style={{ marginTop: 4, fontSize: 9, color: '#4b5563', lineHeight: 1.6 }}>
            {item.options?.map((o, i) => <span key={i} style={{ marginRight: 10 }}><span style={ls}>{o.displayLabel}:</span> <span style={vs}>{o.valueLabel}</span></span>)}
          </div>
          <div style={{ marginTop: 4, fontSize: 9, color: '#4b5563', lineHeight: 1.7 }}>
            <span style={{ marginRight: 12 }}><span style={ls}>Panel:</span> <span style={vs}>{c.panelCount}</span> <span style={{ color: '#6b7280' }}>({c.isCenterSplit ? 'Center Split' : 'One Way'})</span></span>
            <span style={{ marginRight: 12 }}><span style={ls}>Panel Size:</span> <span style={vs}>{c.panelWidth}" × {c.panelHeight}"</span></span>
            <span style={{ marginRight: 12 }}><span style={ls}>Method:</span> <span style={vs}>{ml}</span></span>
            {c.method === 'horizontal' ? <span style={{ marginRight: 12 }}><span style={ls}>Cut:</span> <span style={vs}>{c.cutLength}"</span></span>
              : <span style={{ marginRight: 12 }}><span style={ls}>Widths:</span> <span style={vs}>{c.sheerPanel} × {c.sheerFabricWidth}"</span></span>}
            <span><span style={ls}>Total Fabric:</span> <span style={vs}>{c.sheerYard} yd</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShadeItem({ item, index }: { item: OrderItem; index: number }) {
  const hf = item.heightFraction && item.heightFraction !== '0' ? ` ${item.heightFraction}` : ''
  const fcOpt = item.options?.find(o => o.name === 'fabric_color' || o.displayLabel?.toLowerCase().includes('fabric'))
  return (
    <div style={{ borderBottom: '1px solid #d1d5db', paddingBottom: 14, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', width: 75, height: 75, flexShrink: 0, border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
          {item.mainImageUrl ? <Image src={item.mainImageUrl} alt="" fill sizes="75px" style={{ objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#9ca3af' }}>No Img</div>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 12 }}>{index}. {item.productName}</p>
          <p style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>Size: {item.width}" × {item.height}"{hf} · Qty: {item.quantity}</p>
          <div style={{ marginTop: 4, fontSize: 9, color: '#4b5563', lineHeight: 1.6 }}>
            {item.options?.map((o, i) => {
              // For fabric_color: show Fabric Code (value) and Fabric (label) separately
              if (o.name === 'fabric_color' || o.displayLabel?.toLowerCase().includes('fabric')) return null
              return <span key={i} style={{ marginRight: 10 }}><span style={ls}>{o.displayLabel}:</span> <span style={vs}>{o.valueLabel}</span></span>
            })}
          </div>
          {fcOpt && (
            <div style={{ marginTop: 4, fontSize: 9, color: '#4b5563', lineHeight: 1.7 }}>
              <span style={{ marginRight: 12 }}><span style={ls}>Fabric Code:</span> <span style={vs}>{fcOpt.value || fcOpt.valueLabel}</span></span>
              <span><span style={ls}>Fabric:</span> <span style={vs}>{fcOpt.valueLabel}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HardwareItem({ item, index }: { item: OrderItem; index: number }) {
  return (
    <div style={{ borderBottom: '1px solid #d1d5db', paddingBottom: 14, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', width: 75, height: 75, flexShrink: 0, border: '1px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
          {item.mainImageUrl ? <Image src={item.mainImageUrl} alt="" fill sizes="75px" style={{ objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#9ca3af' }}>No Img</div>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 12 }}>{index}. {item.productName}</p>
          <p style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>Size: {item.width ? `W: ${item.width}"` : ''}{item.height ? ` H: ${item.height}"` : ''} · Qty: {item.quantity}</p>
          <div style={{ marginTop: 4, fontSize: 9, color: '#4b5563', lineHeight: 1.6 }}>
            {item.options?.map((o, i) => <span key={i} style={{ marginRight: 10 }}><span style={ls}>{o.displayLabel}:</span> <span style={vs}>{o.valueLabel}</span></span>)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page structure ───
interface PageData {
  cat: string
  items: OrderItem[]
  globalStartIndex: number   // 1-based index of first item on this page within category
  catTotalItems: number
  catPageIndex: number       // 0-based page index within this category
  catTotalPages: number
}

export default function WorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [productParams, setProductParams] = useState<Record<string, ProductParams>>({})
  const [saved, setSaved] = useState(false)
  const [savedVersion, setSavedVersion] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    fetch(`/api/admin/orders?status=all`)
      .then(r => r.json())
      .then(async d => {
        if (d.success) {
          const found = d.data?.find((o: any) => o.id === id)
          if (found) {
            setOrder(found)
            const paramsMap: Record<string, ProductParams> = {}
            const productIds = new Set<string>()
            for (const item of found.items) {
              const t = item.productType?.toLowerCase()
              if ((t === 'drapery' || t === 'sheer') && item.productId) productIds.add(item.productId)
            }
            await Promise.all([...productIds].map(async pid => {
              try {
                const res = await fetch(`/api/admin/products/${pid}/params`)
                const pData = await res.json()
                if (pData.success && pData.data?.params) paramsMap[pid] = pData.data.params
              } catch {}
            }))
            setProductParams(paramsMap)

            // Check if work order already exists
            try {
              const woRes = await fetch(`/api/admin/work-orders?orderId=${found.id}`)
              const woData = await woRes.json()
              if (woData.success && woData.data?.workOrder) {
                setSaved(true)
                setSavedVersion(woData.data.workOrder.version)
              }
            } catch {}
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!order || saving) return
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/admin/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, notes: order.admin_notes || '' })
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setSavedVersion(data.data.workOrder.version)

        // Notify opener (orders page) to refresh
        try {
          const bc = new BroadcastChannel('orders_refresh')
          bc.postMessage({ type: 'work_order_saved', orderId: order.id })
          bc.close()
        } catch {}

        // Brief success message then navigate back
        const statusNote = data.data.statusUpdated ? '，订单已更新为“生产中”' : ''
        setSaveMsg(`✅ 工单已保存 (v${data.data.workOrder.version})${statusNote}，正在返回...`)
        setTimeout(() => {
          // Try to close tab (works if opened via window.open), otherwise go back
          if (window.opener) {
            window.close()
          } else {
            window.history.back()
          }
        }, 1200)
      } else {
        setSaveMsg(`❌ ${data.error || '保存失败'}`)
        setTimeout(() => setSaveMsg(''), 4000)
      }
    } catch (e: any) {
      setSaveMsg(`❌ 保存失败: ${e.message}`)
      setTimeout(() => setSaveMsg(''), 4000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Loading...</div>
  if (!order) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>Order not found</div>

  // Group items by category
  const grouped: Record<string, OrderItem[]> = {}
  for (const item of order.items) {
    const t = item.productType?.toLowerCase() || 'other'
    if (!grouped[t]) grouped[t] = []
    grouped[t].push(item)
  }
  const activeCategories = CATEGORIES.filter(c => grouped[c]?.length > 0)

  // Build pages: each category splits into chunks of ITEMS_PER_PAGE
  const pages: PageData[] = []
  for (const cat of activeCategories) {
    const items = grouped[cat]!
    const catTotalPages = Math.ceil(items.length / ITEMS_PER_PAGE)
    for (let p = 0; p < catTotalPages; p++) {
      pages.push({
        cat,
        items: items.slice(p * ITEMS_PER_PAGE, (p + 1) * ITEMS_PER_PAGE),
        globalStartIndex: p * ITEMS_PER_PAGE + 1,
        catTotalItems: items.length,
        catPageIndex: p,
        catTotalPages,
      })
    }
  }
  const totalPages = pages.length

  const formatAddr = (a: Order['shipping_address']) => a ? [a.street, a.city, a.state, a.zip].filter(Boolean).join(', ') : ''
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })

  const getDraperyFabricWidth = (item: OrderItem) => {
    const p = item.productId ? productParams[item.productId] : null
    return Number(p?.fabric_width) || 54
  }
  const getSheerFabricWidth = (item: OrderItem) => {
    const p = item.productId ? productParams[item.productId] : null
    return Number(p?.sheer_fabric_width) || 55
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
        @media print {
          html, body { background: white; }
          .no-print { display: none !important; }
          .a4-page { box-shadow: none !important; margin: 0 !important; page-break-after: always; }
          .a4-page:last-child { page-break-after: auto; }
          @page { size: A4; margin: 10mm; }
        }
        .a4-page {
          width: 210mm; height: 297mm; padding: 12mm 14mm;
          margin: 0 auto 20px; background: white;
          box-shadow: 0 1px 6px rgba(0,0,0,0.08);
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .a4-page:first-of-type { margin-top: 0; }
        .page-body { flex: 1; }
        .page-foot { margin-top: auto; flex-shrink: 0; padding-top: 10px; }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ background: '#e5e7eb', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { if (window.history.length > 1) window.history.back(); else window.close() }} style={{ fontSize: 13, color: '#6b7280', cursor: 'pointer', background: 'none', border: 'none' }}>← Back</button>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: '#374151' }}>{order.order_number}</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Work Order · {totalPages} pages</span>
          {saved && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✅ 已保存 (v{savedVersion})</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saveMsg && <span style={{ fontSize: 12, color: saveMsg.includes('✅') ? '#16a34a' : '#dc2626' }}>{saveMsg}</span>}
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: saved ? '#4b5563' : '#ea580c', color: 'white', fontSize: 13, borderRadius: 6, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? '保存中...' : saved ? '🔄 重新保存工单' : '💾 保存工单'}
          </button>
          <button onClick={() => window.print()} style={{ padding: '8px 16px', background: '#111827', color: 'white', fontSize: 13, borderRadius: 6, border: 'none', cursor: 'pointer' }}>🖨️ Print / Export PDF</button>
        </div>
      </div>
      <div className="no-print" style={{ height: 16, background: '#f3f4f6' }} />

      {/* Pages */}
      {pages.map((page, pageIdx) => {
        const catLabel = CATEGORY_LABELS[page.cat] || page.cat.toUpperCase()
        const isFirstPageOfCat = page.catPageIndex === 0
        const rangeEnd = page.globalStartIndex + page.items.length - 1

        return (
          <div key={pageIdx} className="a4-page">
            {/* ── Page Header ── */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111827', paddingBottom: 8, marginBottom: 10 }}>
                <div>
                  <h1 style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1 }}>ANGEL DRAPERY</h1>
                  <p style={{ fontSize: 7.5, color: '#9ca3af', marginTop: 1 }}>8827 Las Tunas Dr, Temple City, CA 91780 · (626) 703-2929</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{order.order_number}</p>
                  <p style={{ fontSize: 7.5, color: '#9ca3af' }}>{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: '#4b5563', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #e5e7eb' }}>
                <div>
                  <span style={{ color: '#9ca3af' }}>Customer:</span> <span style={{ fontWeight: 600, color: '#111827' }}>{order.customer_name}</span>
                  {order.customer_phone && <span style={{ marginLeft: 10 }}><span style={{ color: '#9ca3af' }}>Phone:</span> {order.customer_phone}</span>}
                </div>
                <div><span style={{ color: '#9ca3af' }}>Address:</span> {formatAddr(order.shipping_address)}</div>
              </div>
              <div style={{ background: '#111827', color: 'white', padding: '5px 10px', borderRadius: 3, marginBottom: 10 }}>
                <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>
                  {catLabel} — {page.catTotalItems} {page.catTotalItems === 1 ? 'item' : 'items'}
                  {page.catTotalPages > 1 && <span style={{ fontWeight: 400, fontSize: 9, marginLeft: 8, opacity: 0.7 }}>({page.globalStartIndex}–{rangeEnd} of {page.catTotalItems})</span>}
                </h2>
              </div>
            </div>

            {/* ── Page Body (Items) ── */}
            <div className="page-body">
              {page.items.map((item, idx) => {
                const globalIdx = page.globalStartIndex + idx
                if (page.cat === 'drapery') return <DraperyItem key={idx} item={item} index={globalIdx} fabricWidth={getDraperyFabricWidth(item)} />
                if (page.cat === 'sheer') return <SheerItem key={idx} item={item} index={globalIdx} fabricWidth={getSheerFabricWidth(item)} />
                if (page.cat === 'shade') return <ShadeItem key={idx} item={item} index={globalIdx} />
                return <HardwareItem key={idx} item={item} index={globalIdx} />
              })}

              {/* Customer notes only on first page of each category */}
              {isFirstPageOfCat && order.notes && (
                <div style={{ marginTop: 8, padding: '6px 10px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 3, fontSize: 8.5 }}>
                  <span style={{ fontWeight: 700, color: '#a16207' }}>Customer Notes:</span> {order.notes}
                </div>
              )}
            </div>

            {/* ── Page Footer ── */}
            <div className="page-foot">
              <div style={{ padding: '8px 10px', border: '2px solid #111827', borderRadius: 3, fontSize: 8.5, minHeight: 65 }}>
                <div style={{ fontWeight: 700, color: '#111827', marginBottom: 3 }}>Admin Notes</div>
                <div style={{ color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{order.admin_notes || '—'}</div>
              </div>
              <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #e5e7eb', fontSize: 7.5, color: '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Angel Drapery Work Order · {catLabel} · {order.order_number} · {new Date().toLocaleDateString('en-US')}</span>
                <span style={{ fontWeight: 600 }}>Page {pageIdx + 1} / {totalPages}</span>
              </div>
            </div>
          </div>
        )
      })}

      <div className="no-print" style={{ height: 32, background: '#f3f4f6' }} />
    </>
  )
}
