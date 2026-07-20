'use client'

// 打包发货台 / Packing station — the operator's fulfillment work-list.
// Bridges work orders and shipping: after production, an order shows up here
// under "To Pack"; the operator opens its work order (to make/verify the pieces)
// and its Pack & Ship page (to box items, buy the label = tracking number, and
// ship). Stages: To Pack → Packed (装箱完成/待发货) → Shipped (awaiting delivery).
//
// Read-only aggregation from /api/admin/packing; the only mutation here is the
// optional "Mark Packed" shortcut (in_production → packed). Actual packing +
// label buying happen on the existing per-order Pack & Ship page.

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Stage = 'to_pack' | 'packed' | 'shipped'
interface PackingOrder {
  id: string
  orderNumber: string
  customerName: string
  createdAt: string
  status: string
  itemCount: number
  totalUnits: number
  shippedUnits: number
  hasWorkOrder: boolean
  workOrderVersion: number | null
  stage: Stage
}
interface PackingData {
  stages: Record<Stage, PackingOrder[]>
  counts: { to_pack: number; packed: number; shipped: number; delivered: number }
}

const STAGE_META: Record<Stage, { title: string; sub: string; accent: string; dot: string }> = {
  to_pack: { title: '待装箱 · To Pack', sub: 'In production — box the pieces, then pack & ship', accent: 'border-amber-200', dot: 'bg-amber-400' },
  packed: { title: '装箱完成 · Packed', sub: 'Boxed / partly shipped — buy the remaining labels', accent: 'border-blue-200', dot: 'bg-blue-400' },
  shipped: { title: '已发货待送达 · Shipped', sub: 'All units labeled — awaiting delivery', accent: 'border-green-200', dot: 'bg-green-400' },
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) } catch { return '' }
}

function Progress({ shipped, total }: { shipped: number; total: number }) {
  const pct = total > 0 ? Math.round((shipped / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 w-28">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className="bg-[#3d3d3d] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-gray-400 whitespace-nowrap tabular-nums">{shipped}/{total}</span>
    </div>
  )
}

function OrderRow({ o, onMarkPacked, busy }: { o: PackingOrder; onMarkPacked: (id: string) => void; busy: boolean }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-semibold text-gray-800">{o.orderNumber}</span>
          {o.hasWorkOrder
            ? <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">WO v{o.workOrderVersion}</span>
            : <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">No work order</span>}
        </div>
        <p className="text-xs text-gray-500 truncate">{o.customerName} · {o.itemCount} item{o.itemCount === 1 ? '' : 's'} · {fmtDate(o.createdAt)}</p>
      </div>
      <Progress shipped={o.shippedUnits} total={o.totalUnits} />
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={`/admin/orders/work-order/${o.id}`}
          className="text-[12px] px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">Work Order</Link>
        {o.stage === 'to_pack' && (
          <button onClick={() => onMarkPacked(o.id)} disabled={busy}
            className="text-[12px] px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap">Mark Packed</button>
        )}
        <Link href={`/admin/orders/shipping/${o.id}`}
          className="text-[12px] px-3 py-1.5 rounded-md bg-[#3d3d3d] text-white hover:bg-gray-700 whitespace-nowrap">Pack &amp; Ship</Link>
      </div>
    </div>
  )
}

function StageColumn({ stage, orders, onMarkPacked, busyId }: { stage: Stage; orders: PackingOrder[]; onMarkPacked: (id: string) => void; busyId: string | null }) {
  const m = STAGE_META[stage]
  return (
    <section className={`bg-gray-50/60 rounded-xl border ${m.accent} p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${m.dot}`} />
        <h2 className="text-sm font-semibold text-gray-800">{m.title}</h2>
        <span className="text-xs text-gray-400">({orders.length})</span>
      </div>
      <p className="text-[11px] text-gray-400 mb-3">{m.sub}</p>
      {orders.length === 0 ? (
        <div className="text-center text-xs text-gray-300 py-8 border border-dashed border-gray-200 rounded-lg">Nothing here</div>
      ) : (
        <div className="space-y-2">{orders.map(o => <OrderRow key={o.id} o={o} onMarkPacked={onMarkPacked} busy={busyId === o.id} />)}</div>
      )}
    </section>
  )
}

export default function PackingPage() {
  const [data, setData] = useState<PackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/packing')
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setError('') } else setError(d.error || 'Failed to load') })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const markPacked = async (id: string) => {
    setBusyId(id); setError('')
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'packed' }),
      }).then(r => r.json())
      if (res?.success) load()
      else setError(res?.error || 'Could not mark packed')
    } catch (e: any) { setError(e.message) }
    finally { setBusyId(null) }
  }

  const totalActive = data ? data.counts.to_pack + data.counts.packed + data.counts.shipped : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg font-semibold text-gray-900">打包发货台 · Packing</h1>
        <button onClick={load} disabled={loading}
          className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Production → 装箱 → 建运单号 → 发货. Orders land here after their work order puts them in production.
        {data && <span className="ml-2">{data.counts.delivered} delivered.</span>}
      </p>

      {error && <div className="mb-4 text-sm px-3 py-2 rounded bg-red-50 text-red-600 cursor-pointer" onClick={() => setError('')}>{error} ✕</div>}

      {loading && !data ? (
        <div className="text-center text-gray-400 py-16 text-sm">Loading…</div>
      ) : data && totalActive === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-sm font-medium">Nothing to pack right now.</p>
          <p className="text-xs mt-1">Paid orders appear here once their work order moves them into production.</p>
        </div>
      ) : data ? (
        <div className="space-y-5">
          <StageColumn stage="to_pack" orders={data.stages.to_pack} onMarkPacked={markPacked} busyId={busyId} />
          <StageColumn stage="packed" orders={data.stages.packed} onMarkPacked={markPacked} busyId={busyId} />
          <StageColumn stage="shipped" orders={data.stages.shipped} onMarkPacked={markPacked} busyId={busyId} />
        </div>
      ) : null}
    </div>
  )
}
