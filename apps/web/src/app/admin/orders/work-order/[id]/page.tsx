'use client'

// Website work order — now the ACTUAL AAPP editable drapery form embedded via
// iframe (public/work-orders/drapery-order.html), populated from the order's
// production snapshot. This makes the website work order look/behave 一模一样
// as AAPP's: point-to-edit every field, Add window, Print / PDF, autosave.
//
// Flow:
//   1. fetch order + product params (fabric widths) + existing work order
//      (items_snapshot = production truth; form_data.drapery = prior hand-edits)
//   2. build the DRAPERY_LOAD payload (saved edits win over a fresh autofill)
//   3. embed the form, wait for DRAPERY_READY, postMessage DRAPERY_LOAD
//   4. on DRAPERY_SAVE (the form debounces 400ms) → PATCH autosave form_data

import { use, useState, useEffect, useRef, useCallback } from 'react'
import {
  buildDraperyFormPayload,
  type DraperyFormEntry,
  type DraperyFormPayload,
} from '@/lib/draperyWorkOrderForm'

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

interface ProductParams {
  fabric_width?: number
  sheer_fabric_width?: number
  [key: string]: any
}

const DRAPERY_TYPES = new Set(['drapery', 'sheer'])

export default function WorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [payload, setPayload] = useState<DraperyFormPayload | null>(null)
  const [otherCount, setOtherCount] = useState(0)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const payloadRef = useRef<DraperyFormPayload | null>(null)
  const readyRef = useRef(false)

  // ── Load everything, then build the payload ────────────────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const ordRes = await fetch(`/api/admin/orders?status=all`).then(r => r.json())
        const found: any = ordRes?.success ? ordRes.data?.find((o: any) => o.id === id) : null
        if (!found) { if (!cancelled) setLoading(false); return }

        // Product params (fabric bolt widths) for the drapery/sheer lines.
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

        // Existing work order: production snapshot + any prior hand-edits.
        let snapshot: SnapshotItem[] | null = null
        let savedForm: DraperyFormPayload | null = null
        try {
          const woData = await fetch(`/api/admin/work-orders?orderId=${found.id}`).then(r => r.json())
          const wo = woData?.success ? woData.data?.workOrder : null
          if (wo) {
            if (Array.isArray(wo.items_snapshot) && wo.items_snapshot.length) snapshot = wo.items_snapshot
            if (wo.form_data?.drapery?.rows) savedForm = wo.form_data.drapery
          }
        } catch {}

        // Match snapshot entries to non-swatch items in lockstep (same rule as
        // lib/workOrders.ts buildWorkOrderSnapshot).
        const snapByItem = new Map<OrderItem, SnapshotItem>()
        if (snapshot) {
          let si = 0
          for (const it of found.items as OrderItem[]) {
            if ((it as any).isSwatch || (it.productType || '').toLowerCase() === 'swatch') continue
            const s = snapshot[si++]
            if (s && s.productId === it.productId) snapByItem.set(it, s)
          }
        }

        // Drapery + sheer lines → form entries; everything else is counted so we
        // can tell the user those go to their own (Luma / other) work orders.
        const drapItems: OrderItem[] = []
        let others = 0
        for (const it of found.items as OrderItem[]) {
          const t = (it.productType || '').toLowerCase()
          if (t === 'swatch' || (it as any).isSwatch) continue
          if (DRAPERY_TYPES.has(t)) drapItems.push(it)
          else others++
        }

        const entries: DraperyFormEntry[] = drapItems.map(it => {
          const pp = it.productId ? paramsMap[it.productId] : undefined
          return {
            item: it,
            production: snapByItem.get(it)?.production ?? null,
            mainFabricWidthIn: pp?.fabric_width != null ? Number(pp.fabric_width) : undefined,
            sheerFabricWidthIn: pp?.sheer_fabric_width != null ? Number(pp.sheer_fabric_width) : undefined,
          }
        })

        const built = buildDraperyFormPayload(found, entries)
        // Prior hand-edits win, but always refresh company/ops/styles + keep the
        // freshly-built rows if the saved copy predates a re-priced order.
        const finalPayload: DraperyFormPayload = savedForm
          ? { meta: { ...built.meta, ...savedForm.meta, ops: built.meta.ops, styles: built.meta.styles }, rows: savedForm.rows?.length ? savedForm.rows : built.rows }
          : built

        if (cancelled) return
        setOrder(found)
        setOtherCount(others)
        payloadRef.current = finalPayload
        setPayload(finalPayload)
        if (readyRef.current) postToForm(finalPayload)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  const postToForm = useCallback((p: DraperyFormPayload) => {
    const win = iframeRef.current?.contentWindow
    if (win) { try { win.postMessage({ type: 'DRAPERY_LOAD', payload: p }, '*') } catch {} }
  }, [])

  // ── Bridge: form → host (READY / SAVE) ─────────────────────────────────────
  useEffect(() => {
    let saveTimer: ReturnType<typeof setTimeout> | null = null
    const onMsg = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      const d: any = e.data || {}
      if (d.type === 'DRAPERY_READY') {
        readyRef.current = true
        if (payloadRef.current) postToForm(payloadRef.current)
      } else if (d.type === 'DRAPERY_SAVE') {
        // Keep the latest edited form so a reload restores hand-edits.
        if (d.data) payloadRef.current = { ...(payloadRef.current as DraperyFormPayload), ...d.data }
        if (saveTimer) clearTimeout(saveTimer)
        setSaveState('saving')
        saveTimer = setTimeout(() => void autosave(d.data), 300)
      }
    }
    window.addEventListener('message', onMsg)
    return () => { window.removeEventListener('message', onMsg); if (saveTimer) clearTimeout(saveTimer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const autosave = async (formData: any) => {
    if (!order) return
    try {
      const res = await fetch('/api/admin/work-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, formType: 'drapery', formData }),
      }).then(r => r.json())
      setSaveState(res?.success ? 'saved' : 'error')
    } catch {
      setSaveState('error')
    }
  }

  const onIframeLoad = () => {
    // Fallback in case READY fired before the listener attached.
    if (payloadRef.current) { readyRef.current = true; postToForm(payloadRef.current) }
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontFamily: 'system-ui' }}>Loading…</div>
  }
  if (!order) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: 'system-ui' }}>Order not found</div>
  }

  const saveLabel = saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? '✅ Saved' : saveState === 'error' ? '⚠️ Save failed' : ''
  const hasRows = !!payload?.rows?.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f7' }}>
      {/* Host toolbar — thin bar above the real AAPP form */}
      <div style={{ flexShrink: 0, background: '#111827', color: '#fff', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'system-ui' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { if (window.history.length > 1) window.history.back(); else window.close() }} style={{ fontSize: 13, color: '#d1d5db', cursor: 'pointer', background: 'none', border: 'none' }}>← Back</button>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{order.order_number}</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Drapery Work Order</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {otherCount > 0 && <span style={{ fontSize: 11, color: '#fbbf24' }}>{otherCount} non-drapery item{otherCount === 1 ? '' : 's'} → separate work order</span>}
          {saveLabel && <span style={{ fontSize: 12, color: saveState === 'error' ? '#f87171' : '#34d399' }}>{saveLabel}</span>}
        </div>
      </div>

      {!hasRows ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: 'system-ui', textAlign: 'center', padding: 24 }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No drapery or sheer items in this order.</p>
            {otherCount > 0 && <p style={{ fontSize: 13 }}>{otherCount} other item{otherCount === 1 ? '' : 's'} (Luma / shade / hardware) belong to a separate work order.</p>}
          </div>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src="/work-orders/drapery-order.html"
          onLoad={onIframeLoad}
          title="Drapery Work Order"
          style={{ flex: 1, width: '100%', border: 'none', background: '#f5f5f7' }}
        />
      )}
    </div>
  )
}
