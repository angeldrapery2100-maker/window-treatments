'use client'

// Website work order — the ACTUAL AAPP editable forms embedded via iframe:
//   • drapery/sheer lines → public/work-orders/drapery-order.html
//   • shade/Luma lines     → public/work-orders/luma-order.html
// Both look/behave 一模一样 as AAPP (point-to-edit, Add row, Print/PDF), are
// populated from the order's production snapshot + options, and autosave edits
// into work_orders.form_data. When an order has both, a tab switches between them.

import { use, useState, useEffect, useRef, useCallback } from 'react'
import { buildDraperyFormPayload, type DraperyFormEntry, type DraperyFormPayload } from '@/lib/draperyWorkOrderForm'
import { buildLumaFormPayload, type LumaFormEntry, type LumaFormPayload } from '@/lib/lumaWorkOrderForm'

interface OrderItem {
  productName: string
  productType: string
  productId?: string
  width?: number
  height?: number
  heightFraction?: string
  widthFraction?: string
  options: { name?: string; displayLabel: string; value?: string; valueLabel: string }[]
  quantity: number
  location?: string
  notes?: string
}
interface Order {
  id: string
  order_number: string
  customer_name: string
  created_at: string
  items: OrderItem[]
  poNumber?: string
}
interface SnapshotItem {
  productId: string
  productType: string
  engine?: string
  production?: Record<string, number | string> | null
}
interface ProductParams { fabric_width?: number; sheer_fabric_width?: number; [k: string]: any }

const DRAPERY_TYPES = new Set(['drapery', 'sheer'])
const LUMA_TYPES = new Set(['shade'])

type FormType = 'drapery' | 'luma'

export default function WorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [draperyPayload, setDraperyPayload] = useState<DraperyFormPayload | null>(null)
  const [lumaPayload, setLumaPayload] = useState<LumaFormPayload | null>(null)
  const [otherCount, setOtherCount] = useState(0)
  const [active, setActive] = useState<FormType>('drapery')
  const [saveState, setSaveState] = useState<Record<FormType, 'idle' | 'saving' | 'saved' | 'error'>>({ drapery: 'idle', luma: 'idle' })

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const payloadsRef = useRef<{ drapery: DraperyFormPayload | null; luma: LumaFormPayload | null }>({ drapery: null, luma: null })
  const orderRef = useRef<Order | null>(null)

  // ── Load order + snapshot + prior edits, then build both payloads ───────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const ordRes = await fetch(`/api/admin/orders?status=all`).then(r => r.json())
        const found: any = ordRes?.success ? ordRes.data?.find((o: any) => o.id === id) : null
        if (!found) { if (!cancelled) setLoading(false); return }

        const paramsMap: Record<string, ProductParams> = {}
        const pids = new Set<string>()
        for (const it of found.items || []) {
          const t = (it.productType || '').toLowerCase()
          if (DRAPERY_TYPES.has(t) && it.productId) pids.add(it.productId)
        }
        await Promise.all([...pids].map(async pid => {
          try {
            const pData = await fetch(`/api/admin/products/${pid}/params`).then(r => r.json())
            if (pData?.success && pData.data?.params) paramsMap[pid] = pData.data.params
          } catch {}
        }))

        let snapshot: SnapshotItem[] | null = null
        let savedDrapery: DraperyFormPayload | null = null
        let savedLuma: LumaFormPayload | null = null
        try {
          const woData = await fetch(`/api/admin/work-orders?orderId=${found.id}`).then(r => r.json())
          const wo = woData?.success ? woData.data?.workOrder : null
          if (wo) {
            if (Array.isArray(wo.items_snapshot) && wo.items_snapshot.length) snapshot = wo.items_snapshot
            if (wo.form_data?.drapery?.rows) savedDrapery = wo.form_data.drapery
            if (wo.form_data?.luma?.rows) savedLuma = wo.form_data.luma
          }
        } catch {}

        const snapByItem = new Map<OrderItem, SnapshotItem>()
        if (snapshot) {
          let si = 0
          for (const it of found.items as OrderItem[]) {
            if ((it as any).isSwatch || (it.productType || '').toLowerCase() === 'swatch') continue
            const s = snapshot[si++]
            if (s && s.productId === it.productId) snapByItem.set(it, s)
          }
        }

        const drapItems: OrderItem[] = []
        const lumaItems: OrderItem[] = []
        let others = 0
        for (const it of found.items as OrderItem[]) {
          const t = (it.productType || '').toLowerCase()
          if (t === 'swatch' || (it as any).isSwatch) continue
          if (DRAPERY_TYPES.has(t)) drapItems.push(it)
          else if (LUMA_TYPES.has(t)) lumaItems.push(it)
          else others++
        }

        const drapEntries: DraperyFormEntry[] = drapItems.map(it => {
          const pp = it.productId ? paramsMap[it.productId] : undefined
          return {
            item: it,
            production: snapByItem.get(it)?.production ?? null,
            mainFabricWidthIn: pp?.fabric_width != null ? Number(pp.fabric_width) : undefined,
            sheerFabricWidthIn: pp?.sheer_fabric_width != null ? Number(pp.sheer_fabric_width) : undefined,
          }
        })
        const lumaEntries: LumaFormEntry[] = lumaItems.map(it => ({ item: it, production: snapByItem.get(it)?.production ?? null }))

        const builtDrapery = buildDraperyFormPayload(found, drapEntries)
        const builtLuma = buildLumaFormPayload(found, lumaEntries)

        const finalDrapery: DraperyFormPayload | null = drapItems.length
          ? (savedDrapery
            ? { meta: { ...builtDrapery.meta, ...savedDrapery.meta, ops: builtDrapery.meta.ops, styles: builtDrapery.meta.styles }, rows: savedDrapery.rows?.length ? savedDrapery.rows : builtDrapery.rows }
            : builtDrapery)
          : null
        const finalLuma: LumaFormPayload | null = lumaItems.length
          ? (savedLuma ? { meta: { ...builtLuma.meta, ...savedLuma.meta }, rows: savedLuma.rows?.length ? savedLuma.rows : builtLuma.rows } : builtLuma)
          : null

        if (cancelled) return
        setOrder(found); orderRef.current = found
        setOtherCount(others)
        payloadsRef.current = { drapery: finalDrapery, luma: finalLuma }
        setDraperyPayload(finalDrapery)
        setLumaPayload(finalLuma)
        setActive(finalDrapery ? 'drapery' : finalLuma ? 'luma' : 'drapery')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  const postToForm = useCallback((type: FormType) => {
    const win = iframeRef.current?.contentWindow
    const p = payloadsRef.current[type]
    if (!win || !p) return
    const msgType = type === 'drapery' ? 'DRAPERY_LOAD' : 'LUMA_LOAD'
    try { win.postMessage({ type: msgType, payload: p }, '*') } catch {}
  }, [])

  // ── Bridge: form → host (READY / SAVE) ──────────────────────────────────────
  useEffect(() => {
    let saveTimer: ReturnType<typeof setTimeout> | null = null
    const onMsg = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      const d: any = e.data || {}
      if (d.type === 'DRAPERY_READY') { postToForm('drapery') }
      else if (d.type === 'LUMA_READY') { postToForm('luma') }
      else if (d.type === 'DRAPERY_SAVE' || d.type === 'LUMA_SAVE') {
        const type: FormType = d.type === 'DRAPERY_SAVE' ? 'drapery' : 'luma'
        if (d.data) payloadsRef.current[type] = { ...(payloadsRef.current[type] as any), ...d.data }
        if (saveTimer) clearTimeout(saveTimer)
        setSaveState(s => ({ ...s, [type]: 'saving' }))
        saveTimer = setTimeout(() => void autosave(type, d.data), 300)
      }
    }
    window.addEventListener('message', onMsg)
    return () => { window.removeEventListener('message', onMsg); if (saveTimer) clearTimeout(saveTimer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const autosave = async (formType: FormType, formData: any) => {
    const ord = orderRef.current
    if (!ord) return
    try {
      const res = await fetch('/api/admin/work-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: ord.id, formType, formData }),
      }).then(r => r.json())
      setSaveState(s => ({ ...s, [formType]: res?.success ? 'saved' : 'error' }))
    } catch {
      setSaveState(s => ({ ...s, [formType]: 'error' }))
    }
  }

  const onIframeLoad = () => { postToForm(active) }

  if (loading) return <div style={centered}>Loading…</div>
  if (!order) return <div style={centered}>Order not found</div>

  const hasDrapery = !!draperyPayload?.rows?.length
  const hasLuma = !!lumaPayload?.rows?.length
  const st = saveState[active]
  const saveLabel = st === 'saving' ? 'Saving…' : st === 'saved' ? '✅ Saved' : st === 'error' ? '⚠️ Save failed' : ''
  const src = active === 'drapery' ? '/work-orders/drapery-order.html' : '/work-orders/luma-order.html'
  const showForm = (active === 'drapery' && hasDrapery) || (active === 'luma' && hasLuma)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f7' }}>
      <div style={{ flexShrink: 0, background: '#111827', color: '#fff', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'system-ui' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { if (window.history.length > 1) window.history.back(); else window.close() }} style={{ fontSize: 13, color: '#d1d5db', cursor: 'pointer', background: 'none', border: 'none' }}>← Back</button>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{order.order_number}</span>
          {(hasDrapery && hasLuma) ? (
            <span style={{ display: 'inline-flex', gap: 4, marginLeft: 4 }}>
              <TabBtn label={`Drapery (${draperyPayload!.rows.length})`} on={active === 'drapery'} onClick={() => setActive('drapery')} />
              <TabBtn label={`Luma (${lumaPayload!.rows.length})`} on={active === 'luma'} onClick={() => setActive('luma')} />
            </span>
          ) : (
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{hasLuma ? 'Luma Work Order' : 'Drapery Work Order'}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {otherCount > 0 && <span style={{ fontSize: 11, color: '#fbbf24' }}>{otherCount} hardware/other item{otherCount === 1 ? '' : 's'} not shown</span>}
          {saveLabel && <span style={{ fontSize: 12, color: st === 'error' ? '#f87171' : '#34d399' }}>{saveLabel}</span>}
        </div>
      </div>

      {!showForm ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: 'system-ui', textAlign: 'center', padding: 24 }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No drapery, sheer, or shade items in this order.</p>
            {otherCount > 0 && <p style={{ fontSize: 13 }}>{otherCount} item{otherCount === 1 ? '' : 's'} (hardware / accessory) have no fabrication work order.</p>}
          </div>
        </div>
      ) : (
        <iframe
          key={active}
          ref={iframeRef}
          src={src}
          onLoad={onIframeLoad}
          title={active === 'drapery' ? 'Drapery Work Order' : 'Luma Work Order'}
          style={{ flex: 1, width: '100%', border: 'none', background: '#f5f5f7' }}
        />
      )}
    </div>
  )
}

function TabBtn({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 999, border: '1px solid ' + (on ? '#3b82f6' : '#374151'), background: on ? '#3b82f6' : 'transparent', color: on ? '#fff' : '#9ca3af', cursor: 'pointer' }}>{label}</button>
  )
}

const centered: React.CSSProperties = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontFamily: 'system-ui' }
