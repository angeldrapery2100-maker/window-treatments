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
import { recommendDraperySize } from '@window-treatments/shared/measure'

type Product = 'drapery' | 'shades' | 'shutters'
type Kind = 'window' | 'sliding_door'
export type WizardLanguage = 'en' | 'zh'

const tr = (language: WizardLanguage, english: string, chinese: string) =>
  language === 'zh' ? chinese : english

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

const ROOM_PRESETS = [
  ['Living Room', '客厅'],
  ['Primary Bedroom', '主卧'],
  ['Bedroom', '卧室'],
  ['Kitchen', '厨房'],
  ['Dining Room', '餐厅'],
  ['Office', '办公室'],
  ['Bathroom', '浴室'],
] as const

interface Draft {
  id?: string
  label: string
  kind: Kind
  product: Product | ''
  // drapery
  rodType: 'motorized_ceiling_track' | 'ceiling_track' | 'wall_rod'
  operation: 'split' | 'single_left' | 'single_right'
  styleFamily: 'pleated' | 'ripple'
  // shades / shutters — depth is a CHOICE, not a measurement (Eddie 2026-07-19):
  // shades: 'deep' = more than 1.5", 'shallow' = less than 1.5"
  // shutters: 'deep' = more than 2.5", 'mid' = 2–2.5", 'shallow' = less than 2"
  depthChoice: '' | 'deep' | 'mid' | 'shallow'
  hasTrim: boolean | null
  mount: '' | 'inside' | 'inside_z' | 'outside'
  material: 'poly_vinyl' | 'hardwood' | 'paulownia' | 'basswood_paint' | 'basswood_stain'
  shStyle: string
  shQty: string
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
  depthChoice: '',
  hasTrim: null,
  mount: '',
  material: 'poly_vinyl',
  shStyle: 'standard',
  shQty: '1',
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

// ── Depth gating (choice-based) ─────────────────────────────────────────────
function depthChoicesFor(product: Product, language: WizardLanguage = 'en'): { v: 'deep' | 'mid' | 'shallow'; t: string }[] {
  if (product === 'shades')
    return [
      { v: 'deep', t: tr(language, 'More than 1.5″', '大于 1.5 英寸') },
      { v: 'shallow', t: tr(language, 'Less than 1.5″', '小于 1.5 英寸') },
    ]
  return [
    { v: 'deep', t: tr(language, 'More than 2.5″', '大于 2.5 英寸') },
    { v: 'mid', t: tr(language, 'Between 2″ and 2.5″', '2 至 2.5 英寸') },
    { v: 'shallow', t: tr(language, 'Less than 2″', '小于 2 英寸') },
  ]
}

function depthLabelFor(product: Product, choice: string, language: WizardLanguage = 'en'): string {
  const found = depthChoicesFor(product, language).find((c) => c.v === choice)
  return found ? found.t : ''
}

function mountOptionsFor(product: Product, choice: string, language: WizardLanguage = 'en'): {
  options: { v: 'inside' | 'inside_z' | 'outside'; t: string; recommended?: boolean }[]
  note: string
} {
  if (!choice) return { options: [], note: tr(language, 'Pick the frame depth first.', '请先选择窗框深度。') }
  if (product === 'shades') {
    if (choice === 'deep')
      return {
        options: [
          { v: 'inside', t: tr(language, 'Inside mount', '内嵌安装'), recommended: true },
          { v: 'outside', t: tr(language, 'Outside mount', '外挂安装') },
        ],
        note: tr(language, 'Deep enough for a clean inside mount (recommended) — outside mount also works.', '深度足够，建议内嵌安装；也可以选择外挂。'),
      }
    return {
      options: [{ v: 'outside', t: tr(language, 'Outside mount', '外挂安装') }],
      note: tr(language, 'Under 1.5″ of depth, shades must be outside-mounted.', '深度小于 1.5 英寸时，窗饰必须外挂安装。'),
    }
  }
  if (choice === 'deep')
    return {
      options: [
        { v: 'inside', t: tr(language, 'Inside mount — any frame style', '内嵌安装 — 适用任何边框'), recommended: true },
        { v: 'outside', t: tr(language, 'Outside mount', '外挂安装') },
      ],
      note: tr(language, 'Over 2.5″ of depth fits every inside-mount frame style.', '深度大于 2.5 英寸，可使用任何内嵌式边框。'),
    }
  if (choice === 'mid')
    return {
      options: [
        { v: 'inside_z', t: tr(language, 'Inside mount — Z-frame', '内嵌安装 — Z 型边框'), recommended: true },
        { v: 'outside', t: tr(language, 'Outside mount', '外挂安装') },
      ],
      note: tr(language, 'Between 2″ and 2.5″ of depth, inside mount works with a Z-frame.', '深度在 2 至 2.5 英寸之间时，可用 Z 型边框内嵌安装。'),
    }
  return {
    options: [{ v: 'outside', t: tr(language, 'Outside mount', '外挂安装') }],
    note: tr(language, 'Under 2″ of depth, shutters must be outside-mounted.', '深度小于 2 英寸时，百叶窗必须外挂安装。'),
  }
}

// Trim question applies at the shallowest choice.
function trimQuestionApplies(_product: Product, choice: string): boolean {
  return choice === 'shallow'
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

function DraperyDiagram({ kind, language }: { kind: Kind; language: WizardLanguage }) {
  const isDoor = kind === 'sliding_door'
  const winY = isDoor ? 50 : 55
  const winH = isDoor ? 130 : 90
  return (
    <DiagramFrame
      caption={
        isDoor
          ? tr(language, 'Sliding door: measure the door (W×H), the wall space beside it (A, B) and the gap to the ceiling (C). The door reaches the floor, so no D.', '推拉门：测量门的宽高（W×H）、两侧墙面空间（A、B）和顶部到天花板的距离（C）。门直通地面，无需测量 D。')
          : tr(language, 'Window: measure the window (W×H), wall space beside it (A, B), gap to the ceiling (C) and to the floor (D).', '窗户：测量窗户宽高（W×H）、两侧墙面空间（A、B）、窗顶到天花板（C）和窗底到地面（D）的距离。')
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

function OperationDiagram({ op, language }: { op: 'split' | 'single_left' | 'single_right'; language: WizardLanguage }) {
  const caption =
    op === 'split'
      ? tr(language, 'Center split: two panels meet in the middle and open outward to stack on both sides.', '对开：两片窗帘在中间合拢，打开时分别收到两侧。')
      : op === 'single_left'
        ? tr(language, 'One-way: a single panel that slides open and stacks on the LEFT side.', '单开：一片窗帘打开后收到左侧。')
        : tr(language, 'One-way: a single panel that slides open and stacks on the RIGHT side.', '单开：一片窗帘打开后收到右侧。')
  return (
    <DiagramFrame caption={caption}>
      {/* rod */}
      <line x1="20" y1="35" x2="240" y2="35" stroke="#12141C" strokeWidth="4" strokeLinecap="round" />
      <circle cx="20" cy="35" r="5" fill="#12141C" />
      <circle cx="240" cy="35" r="5" fill="#12141C" />
      {op === 'split' ? (
        <>
          <rect x="40" y="42" width="88" height="130" rx="4" fill="#cfe8f7" stroke="#12141C" strokeWidth="1.5" />
          <rect x="132" y="42" width="88" height="130" rx="4" fill="#cfe8f7" stroke="#12141C" strokeWidth="1.5" />
          <line x1="70" y1="42" x2="70" y2="172" stroke="#12141C" strokeWidth="0.75" />
          <line x1="100" y1="42" x2="100" y2="172" stroke="#12141C" strokeWidth="0.75" />
          <line x1="160" y1="42" x2="160" y2="172" stroke="#12141C" strokeWidth="0.75" />
          <line x1="190" y1="42" x2="190" y2="172" stroke="#12141C" strokeWidth="0.75" />
          <Arrow x1={122} y1={105} x2={52} y2={105} labelText="" lx={0} ly={0} />
          <Arrow x1={138} y1={105} x2={208} y2={105} labelText="" lx={0} ly={0} />
        </>
      ) : op === 'single_left' ? (
        <>
          <rect x="40" y="42" width="180" height="130" rx="4" fill="#cfe8f7" stroke="#12141C" strokeWidth="1.5" />
          {[70, 100, 130, 160, 190].map((x) => (
            <line key={x} x1={x} y1="42" x2={x} y2="172" stroke="#12141C" strokeWidth="0.75" />
          ))}
          <Arrow x1={200} y1={105} x2={60} y2={105} labelText="" lx={0} ly={0} />
        </>
      ) : (
        <>
          <rect x="40" y="42" width="180" height="130" rx="4" fill="#cfe8f7" stroke="#12141C" strokeWidth="1.5" />
          {[70, 100, 130, 160, 190].map((x) => (
            <line key={x} x1={x} y1="42" x2={x} y2="172" stroke="#12141C" strokeWidth="0.75" />
          ))}
          <Arrow x1={60} y1={105} x2={200} y2={105} labelText="" lx={0} ly={0} />
        </>
      )}
    </DiagramFrame>
  )
}

function OpeningDiagram({ inside, language }: { inside: boolean; language: WizardLanguage }) {
  return (
    <DiagramFrame
      caption={
        inside
          ? tr(language, 'Inside mount: measure the opening width and height once, roughly in the middle — rough is fine for this estimate; we re-measure precisely at your free in-home visit.', '内嵌安装：在窗框中间大致测量一次内宽和内高即可。此处用于参考估算，上门时我们会精确复尺。')
          : tr(language, 'Outside mount: measure the area you want covered, edge to edge — rough is fine, we confirm exact coverage at the free in-home measure.', '外挂安装：测量您希望遮盖的整个区域宽高。大致尺寸即可，上门时我们会确认精确覆盖范围。')
      }
    >
      <rect x="55" y="30" width="150" height="140" fill="#fff" stroke="#12141C" strokeWidth="6" />
      <rect x="70" y="45" width="120" height="110" fill="#F7F5F2" stroke="#12141C" strokeWidth="1" />
      {inside ? (
        <>
          <Arrow x1={72} y1={100} x2={188} y2={100} labelText="W" lx={126} ly={96} />
          <Arrow x1={130} y1={47} x2={130} y2={153} labelText="H" lx={136} ly={80} />
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

function TrimDiagram({ language }: { language: WizardLanguage }) {
  return (
    <DiagramFrame caption={tr(language, "Shallow frame + wood trim: measure the TRIM's outer width and height — the treatment mounts on the trim, so the trim is what matters now, not the opening.", '浅窗框 + 木线条：测量木线条的外宽和外高。窗饰将安装在木线条上，因此此时要测量的是线条外尺寸，不是窗洞尺寸。')}>
      <rect x="45" y="22" width="170" height="156" fill="#e8e2d8" stroke="#12141C" strokeWidth="2" />
      <rect x="70" y="47" width="120" height="106" fill="#fff" stroke="#12141C" strokeWidth="2" />
      <rect x="82" y="59" width="96" height="82" fill="#F7F5F2" stroke="#12141C" strokeWidth="1" />
      <Arrow x1={47} y1={12} x2={213} y2={12} labelText="W (trim)" lx={105} ly={9} />
      <Arrow x1={228} y1={24} x2={228} y2={176} labelText="H" lx={234} ly={104} />
    </DiagramFrame>
  )
}

function DepthDiagram({ language }: { language: WizardLanguage }) {
  return (
    <DiagramFrame caption={tr(language, 'Frame depth (side view): the flat depth from the front of the frame back to the glass. This is the ONE measurement worth doing carefully — it decides the mounting type.', '窗框深度（侧视图）：从窗框最前端到玻璃的平整深度。这个尺寸请仔细测量，它决定可用的安装方式。')}>
      <line x1="30" y1="30" x2="30" y2="170" stroke="#12141C" strokeWidth="6" />
      <line x1="30" y1="30" x2="140" y2="30" stroke="#12141C" strokeWidth="6" />
      <line x1="140" y1="30" x2="140" y2="80" stroke="#12141C" strokeWidth="3" />
      <rect x="136" y="80" width="8" height="90" fill="#cfe8f7" stroke="#12141C" strokeWidth="1" />
      <text x="152" y="130" fontSize="10" fill="#6b7280">
        {tr(language, 'glass', '玻璃')}
      </text>
      <Arrow x1={33} y1={45} x2={137} y2={45} labelText={tr(language, 'depth', '深度')} lx={68} ly={41} />
    </DiagramFrame>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
export default function MeasureWizardClient({
  language,
  onLanguageChange,
}: {
  language: WizardLanguage
  onLanguageChange: (language: WizardLanguage) => void
}) {
  const zh = language === 'zh'
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

  const needsDepth = draft.product === 'shades' || draft.product === 'shutters'
  const mountInfo = needsDepth && draft.product ? mountOptionsFor(draft.product as Product, draft.depthChoice, language) : null
  const askTrim = needsDepth && draft.product ? trimQuestionApplies(draft.product as Product, draft.depthChoice) : false
  const useTrimSize = askTrim && draft.hasTrim === true
  const mountReady = !needsDepth || (draft.mount !== '' && (!askTrim || draft.hasTrim !== null))

  // Auto-clear an invalid mount when the depth choice changes.
  useEffect(() => {
    if (!mountInfo) return
    if (draft.mount && !mountInfo.options.some((o) => o.v === draft.mount)) set('mount', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.depthChoice, draft.product])

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

  const [shutterPrice, setShutterPrice] = useState<{ price: number; install_fee: number; billed_width_in: number; billed_height_in: number; quantity: number } | null>(null)
  const [shutterLoading, setShutterLoading] = useState(false)
  useEffect(() => setShutterPrice(null), [
    draft.w, draft.h, draft.material, draft.mount,
    draft.shStyle, draft.shQty,
  ])

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
          style: draft.shStyle,
          quantity: Math.min(Math.max(parseInt(draft.shQty) || 1, 1), 20),
          width_in: w,
          height_in: h,
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
            depthChoice: draft.depthChoice,
            depthLabel: depthLabelFor(draft.product as Product, draft.depthChoice),
            hasTrim: askTrim ? draft.hasTrim : false,
            mount: draft.mount,
            ...(draft.product === 'shutters'
              ? {
                  material: draft.material,
                  shStyle: draft.shStyle,
                  shQty: Math.min(Math.max(parseInt(draft.shQty) || 1, 1), 20),
                }
              : {}),
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
          : { type: 'shutter_reference_price', price: shutterPrice?.price, installFee: shutterPrice?.install_fee, billedWidthIn: shutterPrice?.billed_width_in, billedHeightIn: shutterPrice?.billed_height_in, quantity: shutterPrice?.quantity ?? 1, material: draft.material, style: draft.shStyle }
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
        setSaveError(zh ? '无法保存，请重试。' : (typeof json?.error === 'string' ? json.error : 'Could not save — please try again.'))
      }
    } catch {
      setSaveError(tr(language, 'Connection problem — please try again.', '网络连接出现问题，请重试。'))
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
      depthChoice: ['deep', 'mid', 'shallow'].includes(c.depthChoice) ? c.depthChoice : '',
      hasTrim: typeof c.hasTrim === 'boolean' ? c.hasTrim : null,
      mount: c.mount || '',
      material: c.material || 'poly_vinyl',
      shStyle: c.shStyle || 'standard',
      shQty: c.shQty != null ? String(c.shQty) : '1',
      w: d.widthIn != null ? String(d.widthIn) : '',
      h: d.heightIn != null ? String(d.heightIn) : '',
      A: d.A_leftIn != null ? String(d.A_leftIn) : '',
      B: d.B_rightIn != null ? String(d.B_rightIn) : '',
      C: d.C_topIn != null ? String(d.C_topIn) : '',
      D: d.D_bottomIn != null ? String(d.D_bottomIn) : '',
      wallH: d.wallHeightIn != null ? String(d.wallHeightIn) : '',
    })
    setShutterPrice(
      wdw.product === 'shutters' && wdw.result?.price && !c.shDivider && !c.shKnob && !c.shLock && !c.shCustomFinish
        ? { price: wdw.result.price, install_fee: wdw.result.installFee, billed_width_in: wdw.result.billedWidthIn, billed_height_in: wdw.result.billedHeightIn, quantity: wdw.result.quantity ?? 1 }
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

  // Export the sheet as a printable page → user saves it as PDF from the
  // system print dialog. No PDF library needed; works on every device.
  const exportPdf = () => {
    const mountLabel = (c: any) =>
      c?.mount === 'outside'
        ? tr(language, 'Outside mount', '外挂安装')
        : c?.mount === 'inside_z'
          ? tr(language, 'Inside (Z-frame)', '内嵌（Z 型边框）')
          : c?.mount === 'inside'
            ? tr(language, 'Inside mount', '内嵌安装')
            : ''
    const dimsText = (d: any) => {
      const parts = [`${d?.widthIn ?? '?'}″ × ${d?.heightIn ?? '?'}″${d?.measured === 'trim' ? tr(language, ' (trim)', '（线条外尺寸）') : ''}`]
      if (d?.A_leftIn) parts.push(`A ${d.A_leftIn}″`)
      if (d?.B_rightIn) parts.push(`B ${d.B_rightIn}″`)
      if (d?.C_topIn) parts.push(`C ${d.C_topIn}″`)
      if (d?.D_bottomIn) parts.push(`D ${d.D_bottomIn}″`)
      if (d?.wallHeightIn) parts.push(`${tr(language, 'ceiling', '层高')} ${d.wallHeightIn}″`)
      return parts.join(' · ')
    }
    const rows = saved
      .map(
        (x) => `<tr>
          <td>${x.label}</td>
          <td>${x.kind === 'sliding_door' ? tr(language, 'Sliding door', '推拉门') : tr(language, 'Window', '窗户')}</td>
          <td>${x.product === 'drapery' ? tr(language, 'Custom drapery', '定制布帘') : x.product === 'shades' ? tr(language, 'Shades', '窗帘') : tr(language, 'Shutters', '百叶窗')}</td>
          <td>${[x.config?.depthChoice ? `${tr(language, 'Depth', '深度')} ${depthLabelFor(x.product as Product, x.config.depthChoice, language)}` : '', mountLabel(x.config), x.config?.hasTrim ? tr(language, 'has trim', '有木线条') : ''].filter(Boolean).join(' · ')}</td>
          <td>${dimsText(x.dims)}</td>
          <td>${resultSummary(x)}</td>
        </tr>`
      )
      .join('')
    const html = `<!DOCTYPE html><html lang="${language === 'zh' ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><title>Angel Drapery — ${tr(language, 'Measurement Sheet', '窗户测量表')}</title>
      <style>body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#12141C;padding:32px}
      h1{font-size:22px;font-weight:600;margin-bottom:2px}
      .sub{color:#6b7280;font-size:12px;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{text-align:left;text-transform:uppercase;letter-spacing:.08em;font-size:10px;color:#6b7280;border-bottom:2px solid #12141C;padding:6px 8px}
      td{border-bottom:1px solid #e5e7eb;padding:8px;vertical-align:top}
      .foot{margin-top:24px;color:#6b7280;font-size:11px;line-height:1.6}</style></head><body>
      <h1>Angel Drapery — ${tr(language, 'Measurement Sheet', '窗户测量表')}</h1>
      <div class="sub">angel-drapery.com · 626-451-9841 · ${tr(language, 'exported', '导出日期')} ${new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}</div>
      <table><thead><tr><th>${tr(language, 'Location', '位置')}</th><th>${tr(language, 'Opening', '窗口')}</th><th>${tr(language, 'Treatment', '窗饰')}</th><th>${tr(language, 'Depth / Mount', '深度 / 安装')}</th><th>${tr(language, 'Measurements', '测量尺寸')}</th><th>${tr(language, 'Reference result', '参考结果')}</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="foot">${tr(language, 'A = wall space left · B = wall space right · C = top of opening → ceiling · D = bottom → floor. All sizes in inches.', 'A = 左侧墙面空间 · B = 右侧墙面空间 · C = 窗口顶部 → 天花板 · D = 窗口底部 → 地面。所有尺寸均为英寸。')}<br>
      ${tr(language, 'Reference sizes and prices only — final measurements and quote are confirmed at your free in-home measurement.', '以上仅为参考尺寸和价格，最终尺寸与报价以上门复尺后的正式确认为准。')}</div>
      </body></html>`
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 350)
  }

  const resultSummary = (wdw: SavedWindow): string => {
    const r = wdw.result || {}
    if (r.type === 'drapery_recommendation' && r.recommendedWidthIn) return `${tr(language, 'Recommended', '建议成品尺寸')} ${r.recommendedWidthIn}″ × ${r.recommendedHeightIn}″`
    if (r.type === 'shade_order_size' && r.orderWidthIn) return `${tr(language, 'Order size', '下单尺寸')} ${r.orderWidthIn}″ × ${r.orderHeightIn}″${r.mode === 'trim' ? tr(language, ' (trim)', '（线条外尺寸）') : ''}`
    if (r.type === 'shutter_reference_price' && r.price) return `${tr(language, 'Reference', '参考价')} $${Number(r.price).toLocaleString()}`
    return ''
  }

  const changeLanguage = (next: WizardLanguage) => {
    const preset = ROOM_PRESETS.find(([en, cn]) => draft.label === en || draft.label === cn)
    if (preset) set('label', next === 'zh' ? preset[1] : preset[0])
    onLanguageChange(next)
  }

  const languageToggle = (
    <div className="flex w-fit rounded-full border border-gray-200 bg-gray-50 p-1 text-xs" aria-label="Language / 语言">
      <button type="button" onClick={() => changeLanguage('en')} aria-pressed={!zh} className={`rounded-full px-3 py-1.5 ${!zh ? 'bg-[#12141C] text-white' : 'text-gray-500'}`}>English</button>
      <button type="button" onClick={() => changeLanguage('zh')} aria-pressed={zh} className={`rounded-full px-3 py-1.5 ${zh ? 'bg-[#12141C] text-white' : 'text-gray-500'}`}>中文</button>
    </div>
  )

  // ═════════════════════════ LIST VIEW ═════════════════════════
  if (view === 'list') {
    return (
      <div className="mx-auto max-w-[880px] px-6 lg:px-0">
        <div className="mb-6 flex justify-end">{languageToggle}</div>
        <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>{tr(language, 'Your measurement sheet', '您的窗户测量表')}</span>
        <h2 className="mb-3 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">
          {tr(language, 'Measure every window in your home.', '逐一测量家中的每扇窗户。')}
        </h2>
        <p className="mb-8 max-w-xl text-sm leading-relaxed text-gray-400">
          {tr(language,
            'Add each window as a card — it is saved automatically, and our AI design assistant can read your sheet when you chat. Rough measurements are fine: everything is confirmed at the in-home measure before production.',
            '每扇窗户都会作为一张卡片自动保存，与 AI 设计助手聊天时，它可以读取您的测量表。此处填写大致尺寸即可，生产前会上门确认所有精确尺寸。')}
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">{tr(language, 'Loading your sheet…', '正在加载测量表…')}</p>
        ) : (
          <div className="space-y-4">
            {saved.map((wdw) => (
              <div key={wdw.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6">
                <div>
                  <p className="text-base font-semibold tracking-tight text-[#12141C]">
                    {wdw.label}
                    <span className="ml-2 text-[12px] font-normal text-gray-400">
                      {wdw.kind === 'sliding_door' ? tr(language, 'Sliding door', '推拉门') : tr(language, 'Window', '窗户')} ·{' '}
                      {wdw.product === 'drapery' ? tr(language, 'Custom drapery', '定制布帘') : wdw.product === 'shades' ? tr(language, 'Shades', '窗帘') : tr(language, 'Shutters', '百叶窗')}
                    </span>
                  </p>
                  <p className="mt-1 text-[13px] text-gray-500">
                    {wdw.dims?.widthIn}″ × {wdw.dims?.heightIn}″
                    {wdw.config?.mount ? ` · ${wdw.config.mount === 'outside' ? tr(language, 'outside mount', '外挂安装') : wdw.config.mount === 'inside_z' ? tr(language, 'inside (Z-frame)', '内嵌（Z 型边框）') : tr(language, 'inside mount', '内嵌安装')}` : ''}
                    {resultSummary(wdw) ? ` · ${resultSummary(wdw)}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editCard(wdw)} className="rounded-full border border-gray-300 px-4 py-2 text-[13px] text-[#12141C] transition-colors hover:border-gray-500">
                    {tr(language, 'Edit', '编辑')}
                  </button>
                  <button onClick={() => void deleteCard(wdw.id)} className="rounded-full border border-red-200 px-4 py-2 text-[13px] text-red-600 transition-colors hover:border-red-400">
                    {tr(language, 'Delete', '删除')}
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
              {tr(language, '+ Add a window', '+ 添加窗户')}
            </button>
          </div>
        )}

        {saved.length > 0 && (
          <div className="mt-10 rounded-3xl bg-[#F7F5F2] p-8 md:p-10">
            <h3 className="mb-2 text-xl font-semibold tracking-tight text-[#12141C]">{tr(language, 'Your sheet is saved.', '您的测量表已保存。')}</h3>
            <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-500">
              {tr(language,
                'Every window you added is stored automatically. Continue in the chat — our AI assistant reads your sheet and can recommend products and reference pricing for each window — or export a PDF copy for yourself.',
                '您添加的每扇窗户都会自动保存。继续与 AI 助手聊天，它可以读取测量表，并为每扇窗户推荐产品和参考价格；您也可以导出 PDF 副本。')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.dispatchEvent(new Event('ad:open-assistant'))}
                className="rounded-full bg-[#12141C] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {tr(language, 'Continue with our AI assistant →', '继续咨询 AI 助手 →')}
              </button>
              <button
                onClick={exportPdf}
                className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-[#12141C] transition-colors hover:border-gray-500"
              >
                {tr(language, 'Export my sheet (PDF)', '导出测量表（PDF）')}
              </button>
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => setView('list')} className="text-sm text-gray-400 transition-colors hover:text-[#12141C]">
          {tr(language, '← Back to my sheet', '← 返回测量表')}
        </button>
        {languageToggle}
      </div>

      {/* Step 1: location */}
      <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>{tr(language, 'Step 1 · Location', '第 1 步 · 位置')}</span>
      <h2 className="mb-5 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">{tr(language, 'Where is this window?', '这扇窗户在哪里？')}</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {ROOM_PRESETS.map(([en, cn]) => {
          const room = zh ? cn : en
          return (
          <button key={en} className={pillBtn(draft.label === en || draft.label === cn)} onClick={() => set('label', room)}>
            {room}
          </button>
        )})}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={label}>{tr(language, 'Location name *', '位置名称 *')}</label>
          <input className={inputCls} value={draft.label} onChange={(e) => set('label', e.target.value)} placeholder={tr(language, 'e.g. Living Room — left window', '例如：客厅 — 左侧窗户')} maxLength={80} />
        </div>
        <div>
          <span className={label}>{tr(language, 'Opening type', '窗口类型')}</span>
          <div className="flex gap-2">
            <button className={pillBtn(draft.kind === 'window')} onClick={() => set('kind', 'window')}>
              {tr(language, 'Window', '窗户')}
            </button>
            <button className={pillBtn(draft.kind === 'sliding_door')} onClick={() => set('kind', 'sliding_door')}>
              {tr(language, 'Sliding door', '推拉门')}
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: product */}
      <span className={`${ACCENT} mb-3 mt-12 block text-[11px] font-bold uppercase tracking-[0.3em]`}>{tr(language, 'Step 2 · Treatment', '第 2 步 · 窗饰类型')}</span>
      <h2 className="mb-5 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">{tr(language, 'What goes on it?', '您想安装哪种窗饰？')}</h2>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['drapery', tr(language, 'Custom drapery', '定制布帘')],
            ['shades', tr(language, 'Roman · Roller · Zebra · Sheer', '罗马帘 · 卷帘 · 斑马帘 · 柔纱帘')],
            ['shutters', tr(language, 'Plantation shutters', '实木百叶窗')],
          ] as const
        ).map(([v, t]) => (
          <button key={v} className={pillBtn(draft.product === v)} onClick={() => set('product', v)}>
            {t}
          </button>
        ))}
      </div>

      {/* Drapery: opening direction only (rod type & header style are collected
          by the designer later — the wizard keeps sensible defaults) */}
      {draft.product === 'drapery' && (
        <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
          <div>
            <span className={label}>{tr(language, 'Opening direction', '开合方向')}</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['split', tr(language, 'Center split', '中间对开')],
                  ['single_left', tr(language, 'One-way — stacks left', '单开 — 收向左侧')],
                  ['single_right', tr(language, 'One-way — stacks right', '单开 — 收向右侧')],
                ] as const
              ).map(([v, t]) => (
                <button key={v} className={pillBtn(draft.operation === v)} onClick={() => set('operation', v)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <OperationDiagram op={draft.operation} language={language} />
        </div>
      )}

      {/* Shutter essentials only. Fine-grained add-ons are finalized during
          the in-home measure and intentionally stay out of this wizard. */}
      {draft.product === 'shutters' && (
        <div className="mt-8 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={label}>{tr(language, 'Material *', '材质 *')}</label>
              <select className={inputCls} value={draft.material} onChange={(e) => set('material', e.target.value as Draft['material'])}>
                <option value="poly_vinyl">{tr(language, 'Poly-Vinyl (aluminum reinforced)', '聚乙烯（铝材加固）')}</option>
                <option value="hardwood">{tr(language, 'Hardwood', '硬木')}</option>
                <option value="paulownia">{tr(language, 'Grained Paulownia', '木纹泡桐木')}</option>
                <option value="basswood_paint">{tr(language, 'Basswood — painted', '椴木 — 喷漆')}</option>
                <option value="basswood_stain">{tr(language, 'Basswood — stained', '椴木 — 染色')}</option>
              </select>
            </div>
            <div>
              <label className={label}>{tr(language, 'Window style', '窗型')}</label>
              <select className={inputCls} value={draft.shStyle} onChange={(e) => set('shStyle', e.target.value)}>
                <option value="standard">{tr(language, 'Standard', '标准窗')}</option>
                <option value="bay_window">{tr(language, 'Bay window', '飘窗')}</option>
                <option value="corner_window">{tr(language, 'Corner window', '转角窗')}</option>
                <option value="double_hung">{tr(language, 'Double hung', '双悬窗')}</option>
                <option value="bi_fold">{tr(language, 'Bi-fold', '折叠式')}</option>
                <option value="by_pass_closed">{tr(language, 'By-pass', '推拉式')}</option>
                <option value="skylight">{tr(language, 'Skylight', '天窗')}</option>
                <option value="specialty_shape">{tr(language, 'Specialty shape', '异形窗')}</option>
              </select>
            </div>
            <div>
              <label className={label}>{tr(language, 'How many (same size)', '数量（同尺寸）')}</label>
              <input className={inputCls} type="number" inputMode="numeric" min={1} max={20} value={draft.shQty} onChange={(e) => set('shQty', e.target.value)} />
            </div>
          </div>
          <p className="text-[12px] leading-relaxed text-gray-400">
            {tr(language,
              'Divider rails, tilt style, colors and other construction details are finalized with the designer during the in-home measure. The price shown here is a reference.',
              '分隔横梁、开合方式、颜色及其他结构细节，将由设计师在上门复尺时确认。此处显示的价格仅供参考。')}
          </p>
        </div>
      )}

      {/* Step 3: depth + mount (shades/shutters) */}
      {needsDepth && draft.product && (
        <>
          <span className={`${ACCENT} mb-3 mt-12 block text-[11px] font-bold uppercase tracking-[0.3em]`}>{tr(language, 'Step 3 · Frame depth', '第 3 步 · 窗框深度')}</span>
          <h2 className="mb-2 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">{tr(language, 'How deep is the frame?', '窗框有多深？')}</h2>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-400">
            {tr(language, 'Hold a tape at the glass and check the flat depth — this decides which mounting types are possible.', '将卷尺顶在玻璃上，测量到窗框前端的平整深度。这会决定可用的安装方式。')}
          </p>
          <div className="grid items-start gap-6 md:grid-cols-2">
            <div>
              <span className={label}>{tr(language, 'Frame depth *', '窗框深度 *')}</span>
              <div className="flex flex-wrap gap-2">
                {depthChoicesFor(draft.product as Product, language).map((c) => (
                  <button key={c.v} className={pillBtn(draft.depthChoice === c.v)} onClick={() => set('depthChoice', c.v)}>
                    {c.t}
                  </button>
                ))}
              </div>
              {mountInfo && draft.depthChoice && <p className="mt-2 text-[13px] leading-relaxed text-gray-500">{mountInfo.note}</p>}

              {askTrim && (
                <div className="mt-5">
                  <span className={label}>{tr(language, 'Is there wood trim / casing around the window?', '窗户四周有木线条或窗套吗？')}</span>
                  <div className="flex gap-2">
                    <button className={pillBtn(draft.hasTrim === true)} onClick={() => set('hasTrim', true)}>
                      {tr(language, 'Yes — it has trim', '有 — 周围有木线条')}
                    </button>
                    <button className={pillBtn(draft.hasTrim === false)} onClick={() => set('hasTrim', false)}>
                      {tr(language, 'No trim', '没有木线条')}
                    </button>
                  </div>
                  {useTrimSize && (
                    <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                      {tr(language, "Measure the TRIM's outer width and height below — with a shallow frame the treatment mounts on the trim, so the trim size is what we work from now.", '请在下方测量木线条的外宽和外高。窗框较浅时，窗饰会安装在木线条上，因此后续以线条外尺寸为准。')}
                    </p>
                  )}
                </div>
              )}

              {mountInfo && mountInfo.options.length > 0 && (
                <div className="mt-5">
                  <span className={label}>{tr(language, 'Mounting type', '安装方式')}</span>
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
            <DepthDiagram language={language} />
          </div>
        </>
      )}

      {/* Step 4: measurements */}
      {draft.product && (draft.product === 'drapery' || mountReady) && (
        <>
          <span className={`${ACCENT} mb-3 mt-12 block text-[11px] font-bold uppercase tracking-[0.3em]`}>
            {tr(language, `Step ${needsDepth ? 4 : 3} · Measure`, `第 ${needsDepth ? 4 : 3} 步 · 测量`)}
          </span>
          <h2 className="mb-2 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">
            {useTrimSize ? tr(language, 'Measure the trim.', '测量木线条外尺寸。') : isDoor && draft.product === 'drapery' ? tr(language, 'Measure the door.', '测量推拉门。') : tr(language, 'Measure the window.', '测量窗户。')}
          </h2>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-400">
            {tr(language, "Don't worry about being perfectly precise — these numbers give you reference sizes and prices. Our designer re-measures everything at the in-home visit before production.", '不必担心此处的尺寸不够精确，这些数字用于提供参考尺寸和价格。生产前，设计师会上门重新精确测量。')}
          </p>
          <div className="grid items-start gap-6 md:grid-cols-2">
            <div className="grid gap-5">
              <div>
                <label className={label}>{useTrimSize ? tr(language, 'Trim outer width *', '木线条外宽 *') : tr(language, 'Width (W) *', '宽度（W）*')}</label>
                <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.w} onChange={(e) => set('w', e.target.value)} placeholder={tr(language, 'inches', '英寸')} />
              </div>
              <div>
                <label className={label}>{useTrimSize ? tr(language, 'Trim outer height *', '木线条外高 *') : tr(language, 'Height (H) *', '高度（H）*')}</label>
                <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.h} onChange={(e) => set('h', e.target.value)} placeholder={tr(language, 'inches', '英寸')} />
              </div>
              {draft.product === 'drapery' && (
                <>
                  <div>
                    <label className={label}>{tr(language, 'A — wall space left', 'A — 左侧墙面空间')}</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.A} onChange={(e) => set('A', e.target.value)} placeholder={tr(language, 'inches (optional)', '英寸（选填）')} />
                  </div>
                  <div>
                    <label className={label}>{tr(language, 'B — wall space right', 'B — 右侧墙面空间')}</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.B} onChange={(e) => set('B', e.target.value)} placeholder={tr(language, 'inches (optional)', '英寸（选填）')} />
                  </div>
                  <div>
                    <label className={label}>C — {tr(language, `top of ${isDoor ? 'door' : 'window'} → ceiling`, `${isDoor ? '门' : '窗户'}顶部 → 天花板`)}</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.C} onChange={(e) => set('C', e.target.value)} placeholder={tr(language, 'inches (optional)', '英寸（选填）')} />
                  </div>
                  {!isDoor && (
                    <div>
                      <label className={label}>{tr(language, 'D — bottom of window → floor', 'D — 窗户底部 → 地面')}</label>
                      <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.D} onChange={(e) => set('D', e.target.value)} placeholder={tr(language, 'inches (optional)', '英寸（选填）')} />
                    </div>
                  )}
                  <div>
                    <label className={label}>{tr(language, 'Floor-to-ceiling height', '地面到天花板的高度')}</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.wallH} onChange={(e) => set('wallH', e.target.value)} placeholder={tr(language, 'inches (optional)', '英寸（选填）')} />
                  </div>
                </>
              )}
            </div>
            {draft.product === 'drapery' ? (
              <DraperyDiagram kind={draft.kind} language={language} />
            ) : useTrimSize ? (
              <TrimDiagram language={language} />
            ) : (
              <OpeningDiagram inside={draft.mount === 'inside' || draft.mount === 'inside_z'} language={language} />
            )}
          </div>

          {/* Result */}
          <div className="mt-10 rounded-3xl bg-[#12141C] p-8 text-white md:p-10">
            <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>
              {draft.product === 'shutters' ? tr(language, 'Reference price', '参考价格') : draft.product === 'shades' ? tr(language, 'Your order size', '您的下单尺寸') : tr(language, 'Our recommendation', '我们的建议')}
            </span>
            {draft.product === 'drapery' &&
              (draperyRec?.recommendedFinishedWidthIn && draperyRec.recommendedFinishedHeightIn ? (
                <>
                  <p className="text-3xl font-light tracking-tight md:text-4xl">
                    {draperyRec.recommendedFinishedWidthIn}″ W × {draperyRec.recommendedFinishedHeightIn}″ H
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                    {tr(language, 'Recommended finished size, using the same rules our designers use — width includes stacking room so the panels clear the glass when open.', '建议成品尺寸使用与设计师相同的计算规则。宽度已包含窗帘打开后的收帘空间，避免遮挡玻璃。')}
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/50">{tr(language, 'Enter W and H to see the recommended size.', '输入 W 和 H 即可查看建议尺寸。')}</p>
              ))}
            {draft.product === 'shades' &&
              (shadeResult ? (
                <>
                  <p className="text-3xl font-light tracking-tight md:text-4xl">
                    {shadeResult.w}″ W × {shadeResult.h}″ H
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                    {shadeResult.mode === 'inside'
                      ? tr(language, 'Inside mount: order your opening size as measured — our workshop makes the factory deductions.', '内嵌安装：按您测量的窗洞尺寸下单，工厂会自动扣减必要的安装余量。')
                      : shadeResult.mode === 'trim'
                        ? tr(language, 'The shade covers the full trim, so we work from the trim size.', '窗帘将覆盖整个木线条，因此以线条外尺寸为准。')
                        : tr(language, 'Outside mount adds about +5″ width / +6″ height beyond the opening for light coverage.', '外挂安装会在窗洞尺寸上约增加 5 英寸宽度和 6 英寸高度，以改善遮光覆盖。')}{' '}
                    {tr(language, 'Single panels max out at 118″ wide.', '单幅最大宽度为 118 英寸。')}
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/50">{tr(language, 'Pick a mounting type and enter W and H.', '请选择安装方式，并输入 W 和 H。')}</p>
              ))}
            {draft.product === 'shutters' &&
              (shutterPrice ? (
                <>
                  <p className="text-3xl font-light tracking-tight md:text-4xl">
                    ${shutterPrice.price.toLocaleString()}
                    {shutterPrice.quantity > 1 && (
                      <span className="ml-2 text-base text-white/50">{tr(language, `for ${shutterPrice.quantity} shutters`, `共 ${shutterPrice.quantity} 扇`)}</span>
                    )}
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                    {tr(language, `Based on ${shutterPrice.billed_width_in}″ × ${shutterPrice.billed_height_in}″ finished size${draft.shStyle !== 'standard' ? ` (${draft.shStyle.replace(/_/g, ' ')})` : ''}. Installation adds $${shutterPrice.install_fee.toLocaleString()}. Reference price only — the final quote comes from the in-home measurement.`, `按 ${shutterPrice.billed_width_in}″ × ${shutterPrice.billed_height_in}″ 成品尺寸计算。安装费另加 $${shutterPrice.install_fee.toLocaleString()}。此价格仅供参考，最终报价以上门复尺后的正式确认为准。`)}
                  </p>
                </>
              ) : (
                <button
                  onClick={() => void quoteShutter()}
                  disabled={shutterLoading || !num(draft.w) || !num(draft.h) || !mountReady}
                  className="rounded-full bg-white px-7 py-3 text-sm font-medium text-[#12141C] transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {shutterLoading ? tr(language, 'Calculating…', '正在计算…') : tr(language, 'Get reference price', '查看参考价格')}
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
              {saving ? tr(language, 'Saving…', '正在保存…') : draft.id ? tr(language, 'Update this window', '更新这扇窗户') : tr(language, 'Save to my sheet', '保存到测量表')}
            </button>
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          </div>
        </>
      )}
    </div>
  )
}
