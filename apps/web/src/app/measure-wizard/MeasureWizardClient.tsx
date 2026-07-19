'use client'

// Interactive measurement wizard v2 (Eddie 2026-07-19):
// - Customers build a SHEET of windows (add / edit / delete cards), saved
//   server-side via /api/store/measure/windows (ad_anon cookie identity, same
//   as Home Project) so the AI assistant can read it (list_measured_windows).
// - Per-window flow: location → product/style → (shades & shutters) frame
//   DEPTH + trim question → mount options gated by depth rules → rough
//   measurements with SVG diagrams (A/B/C/D codes) → result → save.
// - Depth rules (Eddie): shades ≥1.5" → inside recommended (outside also OK),
//   <1.5" → outside only; shutters >2.5" → any inside frame, 2–2.5" → Z-frame
//   inside only, ≤2" → outside only. Below threshold + wood trim/casing →
//   measure the TRIM's outer width/height instead of the opening.
// - Width/height are deliberately allowed to be rough: the wizard produces
//   reference sizes/prices; the free in-home measure confirms everything.
//   Depth is the one number worth measuring carefully.
// - Drapery recommendations run client-side via the AAPP-parity engine;
//   shutter reference prices come from /api/store/measure/shutter.

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { recommendDraperySize } from '@window-treatments/shared/measure'

type Product = 'drapery' | 'shades' | 'shutters'
type Kind = 'window' | 'sliding_door'

const ACCENT = 'text-[#4DB6E8]'
const label = 'block text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2'
const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#12141C] outline-none transition-colors focus:border-[#12141C]'
const pillBtn = (active: boolean, disabled = false) =>
  `rounded-full border px-4 py-2 text-[13px] transition-all ${
    disabled
      ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
      : active
        ? 'border-[#12141C] bg-[#12141C] text-white'
        : 'border-gray-200 bg-white text-[#12141C] hover:border-gray-400'
  }`

const ROOM_PRESETS = ['Living Room', 'Primary Bedroom', 'Bedroom', 'Kitchen', 'Dining Room', 'Office', 'Bathroom']

interface Draft {
  id?: string
  label: string
  kind: Kind
  product: Product | ''
  // drapery
  rodType: 'motorized_ceiling_track' | 'ceiling_track' | 'wall_rod'
  operation: 'split' | 'single_left' | 'single_right'
  styleFamily: 'pleated' | 'ripple'
  // shades / shutters
  depth: string
  hasTrim: boolean | null
  mount: '' | 'inside' | 'inside_z' | 'outside'
  material: 'poly_vinyl' | 'hardwood' | 'paulownia' | 'basswood_paint' | 'basswood_stain'
  // dims (inches) — A=left, B=right, C=top, D=bottom
  w: string
  h: string
  A: string
  B: string
  C: string
  D: string
  wallH: string
}

const EMPTY_DRAFT: Draft = {
  label: '',
  kind: 'window',
  product: '',
  rodType: 'ceiling_track',
  operation: 'split',
  styleFamily: 'pleated',
  depth: '',
  hasTrim: null,
  mount: '',
  material: 'poly_vinyl',
  w: '',
  h: '',
  A: '',
  B: '',
  C: '',
  D: '',
  wallH: '',
}

interface SavedWindow {
  id: string
  label: string
  kind: string
  product: string
  config: any
  dims: any
  result: any
}

const num = (v: string): number | undefined => {
  const n = parseFloat(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

// ── Depth gating ─────────────────────────────────────────────────────────────
function mountOptionsFor(product: Product, depthIn: number | undefined): {
  options: { v: 'inside' | 'inside_z' | 'outside'; t: string; recommended?: boolean }[]
  note: string
} {
  if (product === 'shades') {
    if (depthIn === undefined) return { options: [], note: 'Enter the frame depth first.' }
    if (depthIn >= 1.5)
      return {
        options: [
          { v: 'inside', t: 'Inside mount', recommended: true },
          { v: 'outside', t: 'Outside mount' },
        ],
        note: 'Your frame is deep enough for a clean inside mount (recommended) — outside mount also works.',
      }
    return {
      options: [{ v: 'outside', t: 'Outside mount' }],
      note: 'Under 1.5″ of depth, shades must be outside-mounted.',
    }
  }
  // shutters
  if (depthIn === undefined) return { options: [], note: 'Enter the frame depth first.' }
  if (depthIn > 2.5)
    return {
      options: [
        { v: 'inside', t: 'Inside mount — any frame style', recommended: true },
        { v: 'outside', t: 'Outside mount' },
      ],
      note: 'Over 2.5″ of depth fits every inside-mount frame style.',
    }
  if (depthIn > 2)
    return {
      options: [
        { v: 'inside_z', t: 'Inside mount — Z-frame', recommended: true },
        { v: 'outside', t: 'Outside mount' },
      ],
      note: 'Between 2″ and 2.5″ of depth, inside mount works with a Z-frame.',
    }
  return {
    options: [{ v: 'outside', t: 'Outside mount' }],
    note: 'At 2″ of depth or less, shutters must be outside-mounted.',
  }
}

// Trim question applies below the product's depth threshold.
function trimQuestionApplies(product: Product, depthIn: number | undefined): boolean {
  if (depthIn === undefined) return false
  if (product === 'shades') return depthIn < 1.5
  if (product === 'shutters') return depthIn < 2
  return false
}

// ── SVG diagrams ─────────────────────────────────────────────────────────────
function Arrow({ x1, y1, x2, y2, labelText, lx, ly }: { x1: number; y1: number; x2: number; y2: number; labelText: string; lx: number; ly: number }) {
  return (
    <g stroke="#4DB6E8" strokeWidth="1.5" fill="#4DB6E8">
      <line x1={x1} y1={y1} x2={x2} y2={y2} markerStart="url(#ah)" markerEnd="url(#ah)" />
      <text x={lx} y={ly} fontSize="11" fontWeight="700" stroke="none">
        {labelText}
      </text>
    </g>
  )
}

function DiagramFrame({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F5F2] p-4">
      <svg viewBox="0 0 260 200" className="h-auto w-full" role="img" aria-label={caption}>
        <defs>
          <marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
            <path d="M0,0 L6,3 L0,6 z" fill="#4DB6E8" />
          </marker>
        </defs>
        {children}
      </svg>
      <p className="mt-2 text-[12px] leading-relaxed text-gray-500">{caption}</p>
    </div>
  )
}

function DraperyDiagram({ kind }: { kind: Kind }) {
  const isDoor = kind === 'sliding_door'
  const winY = isDoor ? 50 : 55
  const winH = isDoor ? 130 : 90
  return (
    <DiagramFrame
      caption={
        isDoor
          ? 'Sliding door: measure the door (W×H), the wall space beside it (A, B) and the gap to the ceiling (C). The door reaches the floor, so no D.'
          : 'Window: measure the window (W×H), wall space beside it (A, B), gap to the ceiling (C) and to the floor (D).'
      }
    >
      {/* ceiling & floor */}
      <line x1="10" y1="20" x2="250" y2="20" stroke="#12141C" strokeWidth="2" />
      <line x1="10" y1="180" x2="250" y2="180" stroke="#12141C" strokeWidth="2" />
      {/* window/door */}
      <rect x="85" y={winY} width="90" height={winH} fill="#fff" stroke="#12141C" strokeWidth="2" />
      {isDoor && <line x1="130" y1={winY} x2="130" y2={winY + winH} stroke="#12141C" strokeWidth="1.5" />}
      {/* W / H on the pane */}
      <Arrow x1={90} y1={winY + 12} x2={170} y2={winY + 12} labelText="W" lx={126} ly={winY + 9} />
      <Arrow x1={95} y1={winY + 22} x2={95} y2={winY + winH - 8} labelText="H" lx={100} ly={winY + winH / 2} />
      {/* A / B / C / D */}
      <Arrow x1={18} y1={winY + winH / 2} x2={83} y2={winY + winH / 2} labelText="A" lx={45} ly={winY + winH / 2 - 6} />
      <Arrow x1={177} y1={winY + winH / 2} x2={242} y2={winY + winH / 2} labelText="B" lx={205} ly={winY + winH / 2 - 6} />
      <Arrow x1={130} y1={22} x2={130} y2={winY - 2} labelText="C" lx={136} ly={(22 + winY) / 2 + 4} />
      {!isDoor && <Arrow x1={130} y1={winY + winH + 2} x2={130} y2={178} labelText="D" lx={136} ly={(winY + winH + 180) / 2 + 4} />}
    </DiagramFrame>
  )
}

function OpeningDiagram({ inside }: { inside: boolean }) {
  return (
    <DiagramFrame
      caption={
        inside
          ? 'Inside mount: measure the opening width at 3 heights and the height at 3 points — a rough middle measurement is fine for this estimate; we re-measure precisely at your free in-home visit.'
          : 'Outside mount: measure the area you want covered, edge to edge — rough is fine, we confirm exact coverage at the free in-home measure.'
      }
    >
      <rect x="55" y="30" width="150" height="140" fill="#fff" stroke="#12141C" strokeWidth="6" />
      <rect x="70" y="45" width="120" height="110" fill="#F7F5F2" stroke="#12141C" strokeWidth="1" />
      {inside ? (
        <>
          <Arrow x1={72} y1={65} x2={188} y2={65} labelText="W" lx={126} ly={61} />
          <Arrow x1={72} y1={100} x2={188} y2={100} labelText="W" lx={126} ly={96} />
          <Arrow x1={72} y1={135} x2={188} y2={135} labelText="W" lx={126} ly={131} />
          <Arrow x1={85} y1={47} x2={85} y2={153} labelText="H" lx={90} ly={104} />
          <Arrow x1={168} y1={47} x2={168} y2={153} labelText="H" lx={173} ly={104} />
        </>
      ) : (
        <>
          <Arrow x1={57} y1={20} x2={203} y2={20} labelText="W" lx={126} ly={16} />
          <Arrow x1={218} y1={32} x2={218} y2={168} labelText="H" lx={224} ly={104} />
        </>
      )}
    </DiagramFrame>
  )
}

function TrimDiagram() {
  return (
    <DiagramFrame caption="Shallow frame + wood trim: measure the TRIM's outer width and height — the treatment mounts on the trim, so the trim is what matters now, not the opening.">
      <rect x="45" y="22" width="170" height="156" fill="#e8e2d8" stroke="#12141C" strokeWidth="2" />
      <rect x="70" y="47" width="120" height="106" fill="#fff" stroke="#12141C" strokeWidth="2" />
      <rect x="82" y="59" width="96" height="82" fill="#F7F5F2" stroke="#12141C" strokeWidth="1" />
      <Arrow x1={47} y1={12} x2={213} y2={12} labelText="W (trim)" lx={105} ly={9} />
      <Arrow x1={228} y1={24} x2={228} y2={176} labelText="H" lx={234} ly={104} />
    </DiagramFrame>
  )
}

function DepthDiagram() {
  return (
    <DiagramFrame caption="Frame depth (side view): the flat depth from the front of the frame back to the glass. This is the ONE measurement worth doing carefully — it decides the mounting type.">
      <line x1="30" y1="30" x2="30" y2="170" stroke="#12141C" strokeWidth="6" />
      <line x1="30" y1="30" x2="140" y2="30" stroke="#12141C" strokeWidth="6" />
      <line x1="140" y1="30" x2="140" y2="80" stroke="#12141C" strokeWidth="3" />
      <rect x="136" y="80" width="8" height="90" fill="#cfe8f7" stroke="#12141C" strokeWidth="1" />
      <text x="152" y="130" fontSize="10" fill="#6b7280">
        glass
      </text>
      <Arrow x1={33} y1={45} x2={137} y2={45} labelText="depth" lx={68} ly={41} />
    </DiagramFrame>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
export default function MeasureWizardClient() {
  const [view, setView] = useState<'list' | 'edit'>('list')
  const [saved, setSaved] = useState<SavedWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/store/measure/windows')
      const json = await res.json().catch(() => null)
      if (json?.success) setSaved(json.data.windows || [])
    } catch {
      /* sheet just shows empty */
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void refresh()
  }, [refresh])

  const depthIn = num(draft.depth)
  const needsDepth = draft.product === 'shades' || draft.product === 'shutters'
  const mountInfo = needsDepth && draft.product ? mountOptionsFor(draft.product as Product, depthIn) : null
  const askTrim = needsDepth && draft.product ? trimQuestionApplies(draft.product as Product, depthIn) : false
  const useTrimSize = askTrim && draft.hasTrim === true
  const mountReady = !needsDepth || (draft.mount !== '' && (!askTrim || draft.hasTrim !== null))

  // Auto-clear an invalid mount when depth changes.
  useEffect(() => {
    if (!mountInfo) return
    if (draft.mount && !mountInfo.options.some((o) => o.v === draft.mount)) set('mount', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.depth, draft.product])

  // ── Live result ──
  const draperyRec = useMemo(() => {
    if (draft.product !== 'drapery') return null
    const w = num(draft.w)
    const h = num(draft.h)
    if (!w || !h) return null
    return recommendDraperySize({
      windowWidthIn: w,
      windowHeightIn: h,
      clearLeftIn: num(draft.A),
      clearRightIn: num(draft.B),
      clearTopIn: num(draft.C),
      clearBottomIn: draft.kind === 'sliding_door' ? undefined : num(draft.D),
      wallHeightsIn: num(draft.wallH) ? [num(draft.wallH)!] : undefined,
      rodType: draft.rodType,
      operation: draft.operation,
      styleFamily: draft.styleFamily,
    })
  }, [draft])

  const shadeResult = useMemo(() => {
    if (draft.product !== 'shades') return null
    const w = num(draft.w)
    const h = num(draft.h)
    if (!w || !h || !draft.mount) return null
    if (useTrimSize) return { mode: 'trim', w, h }
    if (draft.mount === 'inside') return { mode: 'inside', w, h }
    return { mode: 'outside', w: Math.round((w + 5) * 100) / 100, h: Math.round((h + 6) * 100) / 100 }
  }, [draft, useTrimSize])

  const [shutterPrice, setShutterPrice] = useState<{ price: number; install_fee: number; billed_width_in: number; billed_height_in: number } | null>(null)
  const [shutterLoading, setShutterLoading] = useState(false)
  useEffect(() => setShutterPrice(null), [draft.w, draft.h, draft.material, draft.mount])

  const quoteShutter = async () => {
    const w = num(draft.w)
    const h = num(draft.h)
    if (!w || !h) return
    setShutterLoading(true)
    try {
      const res = await fetch('/api/store/measure/shutter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material: draft.material.startsWith('basswood') ? 'basswood' : draft.material,
          color_type: draft.material === 'basswood_stain' ? 'stain' : 'paint',
          width_in: w,
          height_in: h,
          quantity: 1,
        }),
      })
      const json = await res.json().catch(() => null)
      if (json?.success) setShutterPrice(json.data)
    } finally {
      setShutterLoading(false)
    }
  }

  // ── Save ──
  const canSave =
    draft.label.trim() &&
    draft.product &&
    num(draft.w) &&
    num(draft.h) &&
    (draft.product === 'drapery' ? !!draperyRec : mountReady) &&
    (draft.product !== 'shutters' || !!shutterPrice)

  const saveDraft = async () => {
    if (!canSave) return
    setSaving(true)
    setSaveError('')
    const config: Record<string, unknown> =
      draft.product === 'drapery'
        ? { rodType: draft.rodType, operation: draft.operation, styleFamily: draft.styleFamily }
        : {
            depthIn: depthIn ?? null,
            hasTrim: askTrim ? draft.hasTrim : false,
            mount: draft.mount,
            ...(draft.product === 'shutters' ? { material: draft.material } : {}),
          }
    const dims: Record<string, unknown> = {
      widthIn: num(draft.w),
      heightIn: num(draft.h),
      A_leftIn: num(draft.A) ?? null,
      B_rightIn: num(draft.B) ?? null,
      C_topIn: num(draft.C) ?? null,
      D_bottomIn: draft.kind === 'sliding_door' ? null : (num(draft.D) ?? null),
      wallHeightIn: num(draft.wallH) ?? null,
      measured: useTrimSize ? 'trim' : 'opening',
    }
    const result: Record<string, unknown> =
      draft.product === 'drapery'
        ? { type: 'drapery_recommendation', recommendedWidthIn: draperyRec?.recommendedFinishedWidthIn, recommendedHeightIn: draperyRec?.recommendedFinishedHeightIn }
        : draft.product === 'shades'
          ? { type: 'shade_order_size', mode: shadeResult?.mode, orderWidthIn: shadeResult?.w, orderHeightIn: shadeResult?.h }
          : { type: 'shutter_reference_price', price: shutterPrice?.price, installFee: shutterPrice?.install_fee, billedWidthIn: shutterPrice?.billed_width_in, billedHeightIn: shutterPrice?.billed_height_in, material: draft.material }
    try {
      const res = await fetch('/api/store/measure/windows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draft.id, label: draft.label.trim(), kind: draft.kind, product: draft.product, config, dims, result }),
      })
      const json = await res.json().catch(() => null)
      if (json?.success) {
        await refresh()
        setDraft(EMPTY_DRAFT)
        setView('list')
      } else {
        setSaveError(typeof json?.error === 'string' ? json.error : 'Could not save — please try again.')
      }
    } catch {
      setSaveError('Connection problem — please try again.')
    } finally {
      setSaving(false)
    }
  }

  const editCard = (wdw: SavedWindow) => {
    const c = wdw.config || {}
    const d = wdw.dims || {}
    setDraft({
      id: wdw.id,
      label: wdw.label,
      kind: (wdw.kind as Kind) || 'window',
      product: (wdw.product as Product) || '',
      rodType: c.rodType || 'ceiling_track',
      operation: c.operation || 'split',
      styleFamily: c.styleFamily || 'pleated',
      depth: c.depthIn != null ? String(c.depthIn) : '',
      hasTrim: typeof c.hasTrim === 'boolean' ? c.hasTrim : null,
      mount: c.mount || '',
      material: c.material || 'poly_vinyl',
      w: d.widthIn != null ? String(d.widthIn) : '',
      h: d.heightIn != null ? String(d.heightIn) : '',
      A: d.A_leftIn != null ? String(d.A_leftIn) : '',
      B: d.B_rightIn != null ? String(d.B_rightIn) : '',
      C: d.C_topIn != null ? String(d.C_topIn) : '',
      D: d.D_bottomIn != null ? String(d.D_bottomIn) : '',
      wallH: d.wallHeightIn != null ? String(d.wallHeightIn) : '',
    })
    setShutterPrice(
      wdw.product === 'shutters' && wdw.result?.price
        ? { price: wdw.result.price, install_fee: wdw.result.installFee, billed_width_in: wdw.result.billedWidthIn, billed_height_in: wdw.result.billedHeightIn }
        : null
    )
    setView('edit')
  }

  const deleteCard = async (id: string) => {
    await fetch('/api/store/measure/windows', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
    await refresh()
  }

  const resultSummary = (wdw: SavedWindow): string => {
    const r = wdw.result || {}
    if (r.type === 'drapery_recommendation' && r.recommendedWidthIn) return `Recommended ${r.recommendedWidthIn}″ × ${r.recommendedHeightIn}″`
    if (r.type === 'shade_order_size' && r.orderWidthIn) return `Order size ${r.orderWidthIn}″ × ${r.orderHeightIn}″${r.mode === 'trim' ? ' (trim)' : ''}`
    if (r.type === 'shutter_reference_price' && r.price) return `Reference $${Number(r.price).toLocaleString()}`
    return ''
  }

  // ═════════════════════════ LIST VIEW ═════════════════════════
  if (view === 'list') {
    return (
      <div className="mx-auto max-w-[880px] px-6 lg:px-0">
        <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>Your measurement sheet</span>
        <h2 className="mb-3 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">
          Measure every window in your home.
        </h2>
        <p className="mb-8 max-w-xl text-sm leading-relaxed text-gray-400">
          Add each window as a card — it&apos;s saved automatically, and our AI design assistant can read your
          sheet when you chat. Rough measurements are fine: everything is confirmed at the free in-home
          measure before production.
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">Loading your sheet…</p>
        ) : (
          <div className="space-y-4">
            {saved.map((wdw) => (
              <div key={wdw.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6">
                <div>
                  <p className="text-base font-semibold tracking-tight text-[#12141C]">
                    {wdw.label}
                    <span className="ml-2 text-[12px] font-normal text-gray-400">
                      {wdw.kind === 'sliding_door' ? 'Sliding door' : 'Window'} ·{' '}
                      {wdw.product === 'drapery' ? 'Custom drapery' : wdw.product === 'shades' ? 'Shades' : 'Shutters'}
                    </span>
                  </p>
                  <p className="mt-1 text-[13px] text-gray-500">
                    {wdw.dims?.widthIn}″ × {wdw.dims?.heightIn}″
                    {wdw.config?.mount ? ` · ${wdw.config.mount === 'outside' ? 'outside mount' : wdw.config.mount === 'inside_z' ? 'inside (Z-frame)' : 'inside mount'}` : ''}
                    {resultSummary(wdw) ? ` · ${resultSummary(wdw)}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editCard(wdw)} className="rounded-full border border-gray-300 px-4 py-2 text-[13px] text-[#12141C] transition-colors hover:border-gray-500">
                    Edit
                  </button>
                  <button onClick={() => void deleteCard(wdw.id)} className="rounded-full border border-red-200 px-4 py-2 text-[13px] text-red-600 transition-colors hover:border-red-400">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setDraft(EMPTY_DRAFT)
                setShutterPrice(null)
                setSaveError('')
                setView('edit')
              }}
              className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-sm font-medium text-[#12141C] transition-colors hover:border-gray-500"
            >
              + Add a window
            </button>
          </div>
        )}

        {saved.length > 0 && (
          <div className="mt-10 rounded-3xl bg-[#F7F5F2] p-8 md:p-10">
            <h3 className="mb-2 text-xl font-semibold tracking-tight text-[#12141C]">Your sheet is ready to use.</h3>
            <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-500">
              Open the chat bubble and our AI assistant can read this sheet to recommend products and reference
              pricing for every window — or book the free in-home measure and our designer arrives already
              knowing your home.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/store/whole-home" className="rounded-full bg-[#12141C] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90">
                Book a free in-home measure
              </Link>
              <a href="tel:+16264519841" className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-[#12141C] transition-colors hover:border-gray-500">
                Call 626-451-9841
              </a>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ═════════════════════════ EDIT VIEW ═════════════════════════
  const isDoor = draft.kind === 'sliding_door'
  return (
    <div className="mx-auto max-w-[880px] px-6 lg:px-0">
      <button onClick={() => setView('list')} className="mb-8 text-sm text-gray-400 transition-colors hover:text-[#12141C]">
        ← Back to my sheet
      </button>

      {/* Step 1: location */}
      <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>Step 1 · Location</span>
      <h2 className="mb-5 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">Where is this window?</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {ROOM_PRESETS.map((r) => (
          <button key={r} className={pillBtn(draft.label === r)} onClick={() => set('label', r)}>
            {r}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={label}>Location name *</label>
          <input className={inputCls} value={draft.label} onChange={(e) => set('label', e.target.value)} placeholder="e.g. Living Room — left window" maxLength={80} />
        </div>
        <div>
          <span className={label}>Opening type</span>
          <div className="flex gap-2">
            <button className={pillBtn(draft.kind === 'window')} onClick={() => set('kind', 'window')}>
              Window
            </button>
            <button className={pillBtn(draft.kind === 'sliding_door')} onClick={() => set('kind', 'sliding_door')}>
              Sliding door
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: product */}
      <span className={`${ACCENT} mb-3 mt-12 block text-[11px] font-bold uppercase tracking-[0.3em]`}>Step 2 · Treatment</span>
      <h2 className="mb-5 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">What goes on it?</h2>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['drapery', 'Custom drapery'],
            ['shades', 'Roman · Roller · Zebra · Sheer'],
            ['shutters', 'Plantation shutters'],
          ] as const
        ).map(([v, t]) => (
          <button key={v} className={pillBtn(draft.product === v)} onClick={() => set('product', v)}>
            {t}
          </button>
        ))}
      </div>

      {/* Drapery style */}
      {draft.product === 'drapery' && (
        <div className="mt-8 space-y-5">
          <div>
            <span className={label}>Rod / track type</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['ceiling_track', 'Ceiling track'],
                  ['motorized_ceiling_track', 'Motorized ceiling track'],
                  ['wall_rod', 'Wall-mounted rod'],
                ] as const
              ).map(([v, t]) => (
                <button key={v} className={pillBtn(draft.rodType === v)} onClick={() => set('rodType', v)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={label}>Opening direction</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['split', 'Center split'],
                  ['single_left', 'One-way — stacks left'],
                  ['single_right', 'One-way — stacks right'],
                ] as const
              ).map(([v, t]) => (
                <button key={v} className={pillBtn(draft.operation === v)} onClick={() => set('operation', v)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={label}>Header style</span>
            <div className="flex flex-wrap gap-2">
              <button className={pillBtn(draft.styleFamily === 'pleated')} onClick={() => set('styleFamily', 'pleated')}>
                Pinch pleat
              </button>
              <button className={pillBtn(draft.styleFamily === 'ripple')} onClick={() => set('styleFamily', 'ripple')}>
                Ripplefold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shutter material */}
      {draft.product === 'shutters' && (
        <div className="mt-8 max-w-sm">
          <label className={label}>Material *</label>
          <select className={inputCls} value={draft.material} onChange={(e) => set('material', e.target.value as Draft['material'])}>
            <option value="poly_vinyl">Poly-Vinyl (aluminum reinforced)</option>
            <option value="hardwood">Hardwood</option>
            <option value="paulownia">Grained Paulownia</option>
            <option value="basswood_paint">Basswood — painted</option>
            <option value="basswood_stain">Basswood — stained</option>
          </select>
        </div>
      )}

      {/* Step 3: depth + mount (shades/shutters) */}
      {needsDepth && draft.product && (
        <>
          <span className={`${ACCENT} mb-3 mt-12 block text-[11px] font-bold uppercase tracking-[0.3em]`}>Step 3 · Frame depth</span>
          <h2 className="mb-2 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">How deep is the frame?</h2>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-400">
            This is the one measurement worth doing carefully — it decides which mounting types are possible.
          </p>
          <div className="grid items-start gap-6 md:grid-cols-2">
            <div>
              <label className={label}>Frame depth (inches) *</label>
              <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.depth} onChange={(e) => set('depth', e.target.value)} placeholder="inches" />
              {mountInfo && <p className="mt-2 text-[13px] leading-relaxed text-gray-500">{mountInfo.note}</p>}

              {askTrim && (
                <div className="mt-5">
                  <span className={label}>Is there wood trim / casing around the window?</span>
                  <div className="flex gap-2">
                    <button className={pillBtn(draft.hasTrim === true)} onClick={() => set('hasTrim', true)}>
                      Yes — it has trim
                    </button>
                    <button className={pillBtn(draft.hasTrim === false)} onClick={() => set('hasTrim', false)}>
                      No trim
                    </button>
                  </div>
                  {useTrimSize && (
                    <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                      Measure the TRIM&apos;s outer width and height below — with a shallow frame the treatment
                      mounts on the trim, so the trim size is what we work from now.
                    </p>
                  )}
                </div>
              )}

              {mountInfo && mountInfo.options.length > 0 && (
                <div className="mt-5">
                  <span className={label}>Mounting type</span>
                  <div className="flex flex-wrap gap-2">
                    {mountInfo.options.map((o) => (
                      <button key={o.v} className={pillBtn(draft.mount === o.v)} onClick={() => set('mount', o.v)}>
                        {o.t}
                        {o.recommended ? ' ★' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DepthDiagram />
          </div>
        </>
      )}

      {/* Step 4: measurements */}
      {draft.product && (draft.product === 'drapery' || mountReady) && (
        <>
          <span className={`${ACCENT} mb-3 mt-12 block text-[11px] font-bold uppercase tracking-[0.3em]`}>
            Step {needsDepth ? 4 : 3} · Measure
          </span>
          <h2 className="mb-2 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">
            {useTrimSize ? 'Measure the trim.' : isDoor && draft.product === 'drapery' ? 'Measure the door.' : 'Measure the window.'}
          </h2>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-400">
            Don&apos;t worry about being perfectly precise — these numbers give you reference sizes and prices.
            Our designer re-measures everything at the free in-home visit before production.
          </p>
          <div className="grid items-start gap-6 md:grid-cols-2">
            <div className="grid gap-5">
              <div>
                <label className={label}>{useTrimSize ? 'Trim outer width *' : 'Width (W) *'}</label>
                <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.w} onChange={(e) => set('w', e.target.value)} placeholder="inches" />
              </div>
              <div>
                <label className={label}>{useTrimSize ? 'Trim outer height *' : 'Height (H) *'}</label>
                <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.h} onChange={(e) => set('h', e.target.value)} placeholder="inches" />
              </div>
              {draft.product === 'drapery' && (
                <>
                  <div>
                    <label className={label}>A — wall space left</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.A} onChange={(e) => set('A', e.target.value)} placeholder="inches (optional)" />
                  </div>
                  <div>
                    <label className={label}>B — wall space right</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.B} onChange={(e) => set('B', e.target.value)} placeholder="inches (optional)" />
                  </div>
                  <div>
                    <label className={label}>C — top of {isDoor ? 'door' : 'window'} → ceiling</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.C} onChange={(e) => set('C', e.target.value)} placeholder="inches (optional)" />
                  </div>
                  {!isDoor && (
                    <div>
                      <label className={label}>D — bottom of window → floor</label>
                      <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.D} onChange={(e) => set('D', e.target.value)} placeholder="inches (optional)" />
                    </div>
                  )}
                  <div>
                    <label className={label}>Floor-to-ceiling height</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.wallH} onChange={(e) => set('wallH', e.target.value)} placeholder="inches (optional, smallest of 3 points)" />
                  </div>
                </>
              )}
            </div>
            {draft.product === 'drapery' ? (
              <DraperyDiagram kind={draft.kind} />
            ) : useTrimSize ? (
              <TrimDiagram />
            ) : (
              <OpeningDiagram inside={draft.mount === 'inside' || draft.mount === 'inside_z'} />
            )}
          </div>

          {/* Result */}
          <div className="mt-10 rounded-3xl bg-[#12141C] p-8 text-white md:p-10">
            <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>
              {draft.product === 'shutters' ? 'Reference price' : draft.product === 'shades' ? 'Your order size' : 'Our recommendation'}
            </span>
            {draft.product === 'drapery' &&
              (draperyRec?.recommendedFinishedWidthIn && draperyRec.recommendedFinishedHeightIn ? (
                <>
                  <p className="text-3xl font-light tracking-tight md:text-4xl">
                    {draperyRec.recommendedFinishedWidthIn}″ W × {draperyRec.recommendedFinishedHeightIn}″ H
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                    Recommended finished size, using the same rules our designers use — width includes stacking
                    room so the panels clear the glass when open.
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/50">Enter W and H to see the recommended size.</p>
              ))}
            {draft.product === 'shades' &&
              (shadeResult ? (
                <>
                  <p className="text-3xl font-light tracking-tight md:text-4xl">
                    {shadeResult.w}″ W × {shadeResult.h}″ H
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                    {shadeResult.mode === 'inside'
                      ? 'Inside mount: order your opening size as measured — our workshop makes the factory deductions.'
                      : shadeResult.mode === 'trim'
                        ? 'The shade covers the full trim, so we work from the trim size.'
                        : 'Outside mount adds about +5″ width / +6″ height beyond the opening for light coverage.'}{' '}
                    Single panels max out at 118″ wide.
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/50">Pick a mounting type and enter W and H.</p>
              ))}
            {draft.product === 'shutters' &&
              (shutterPrice ? (
                <>
                  <p className="text-3xl font-light tracking-tight md:text-4xl">${shutterPrice.price.toLocaleString()}</p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                    Based on {shutterPrice.billed_width_in}″ × {shutterPrice.billed_height_in}″ finished size,
                    standard style. Installation adds ${shutterPrice.install_fee.toLocaleString()}. Reference
                    price only — the final quote comes from the free in-home measurement.
                  </p>
                </>
              ) : (
                <button
                  onClick={() => void quoteShutter()}
                  disabled={shutterLoading || !num(draft.w) || !num(draft.h) || !mountReady}
                  className="rounded-full bg-white px-7 py-3 text-sm font-medium text-[#12141C] transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {shutterLoading ? 'Calculating…' : 'Get reference price'}
                </button>
              ))}
          </div>

          {/* Save */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => void saveDraft()}
              disabled={!canSave || saving}
              className="rounded-full bg-[#12141C] px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {saving ? 'Saving…' : draft.id ? 'Update this window' : 'Save to my sheet'}
            </button>
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          </div>
        </>
      )}
    </div>
  )
}
