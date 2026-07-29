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
type Kind = 'window' | 'sliding_door' | 'french_door'

// Bilingual label for the opening kind, used in the sheet list + PDF export.
function kindLabelFor(kind: string, language: WizardLanguage): string {
  if (kind === 'sliding_door') return tr(language, 'Sliding door', '推拉门')
  if (kind === 'french_door') return tr(language, 'French door', '法式门 French')
  return tr(language, 'Window', '窗户')
}
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
  // v3 (Eddie 2026-07-29): which real-world window this looks like — drives
  // the tailored measuring diagram (sill / trim / arch variants).
  scene: Scene
  // french door options (kind === 'french_door')
  doorPanels: 'double' | 'single'
  doorGlass: 'glass' | 'solid'
  glassW: string // glass size PER DOOR (french door with glass)
  glassH: string
  trimW: string // casing width, default 2.5″
  frameW: string // window-frame band width, default 1.5″
  sillLen: string // stool length (optional)
  sillDepth: string // stool projection from the wall (optional)
  // with trim: OUTER (trim outer edge) measurements, optional second pair
  oW: string
  oH: string
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
  scene: '',
  doorPanels: 'double',
  doorGlass: 'glass',
  glassW: '',
  glassH: '',
  trimW: '2.5',
  frameW: '1.5',
  sillLen: '',
  sillDepth: '',
  oW: '',
  oH: '',
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

// Present when the wizard was opened from a salesperson's AAPP 'measure'
// link (?t=<token>) — carries the prefilled contact info + the name card.
interface AappLinkInfo {
  token: string
  submitted: boolean
  prefill: { name?: string; phone?: string; email?: string; address?: string }
  salesperson: { name: string; phone: string; avatar: string; languages: string[] } | null
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
  const isDoor = kind !== 'window'
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

// ── v3: window scenes (Eddie 2026-07-29, drawing style approved 方案A·v3) ───
// After picking inside/outside mount the customer picks which drawing looks
// like THEIR window; the measuring diagram redraws AT TRUE PROPORTION from
// the numbers they type (opening W×H, trim width, frame width, sill length).
type Scene = '' | 'plain' | 'sill' | 'trim' | 'trim_sill' | 'arch' | 'arch_trim' | 'arch_trim_sill'

const SCENE_KEYS = ['plain', 'sill', 'trim', 'trim_sill', 'arch', 'arch_trim', 'arch_trim_sill'] as const

const SCENES: { v: Exclude<Scene, ''>; en: string; zh: string }[] = [
  { v: 'plain', en: 'Flat wall window', zh: '平墙窗' },
  { v: 'sill', en: 'Has a window sill', zh: '有窗台' },
  { v: 'trim', en: 'Wood trim / casing', zh: '有窗套' },
  { v: 'trim_sill', en: 'Trim + sill', zh: '窗套 + 窗台' },
  { v: 'arch', en: 'Arched top', zh: '拱形窗' },
  { v: 'arch_trim', en: 'Arch + trim', zh: '拱形 + 窗套' },
  { v: 'arch_trim_sill', en: 'Arch + trim + sill', zh: '拱形 + 窗套 + 窗台' },
]

// Doors only choose casing / no casing (sill & arch don't apply).
const DOOR_SCENES: { v: Exclude<Scene, ''>; en: string; zh: string }[] = [
  { v: 'plain', en: 'No casing', zh: '无门套' },
  { v: 'trim', en: 'Door casing', zh: '有门套' },
]

const sceneHasTrim = (s: string) => s === 'trim' || s === 'trim_sill' || s === 'arch_trim' || s === 'arch_trim_sill'
const sceneHasSill = (s: string) => s === 'sill' || s === 'trim_sill' || s === 'arch_trim_sill'
const sceneIsArch = (s: string) => s === 'arch' || s === 'arch_trim' || s === 'arch_trim_sill'

export function sceneLabel(scene: string, language: WizardLanguage): string {
  const s = SCENES.find((x) => x.v === scene)
  return s ? (language === 'zh' ? s.zh : s.en) : ''
}

// Shared palette (approved): casing warm off-white, frame pure white,
// glass cool grey — three clearly separated layers.
const C_CASE = '#f2efe8'
const C_FRAME = '#ffffff'
const C_GLASS = '#eef1f4'
const LN = '#12141C'

// ── SVG markup generator (string-based; injected via dangerouslySetInnerHTML
// so the drawing code matches the approved static drafts line for line) ─────
interface SceneGeom {
  scene: Exclude<Scene, ''>
  kind?: string // 'window' (default) | 'sliding_door' | 'french_door'
  doorPanels?: 'double' | 'single'
  doorGlass?: 'glass' | 'solid'
  glassWIn?: number | null // glass size per door (french + glass)
  glassHIn?: number | null
  openWIn: number // opening (inner-frame) width, inches
  openHIn: number
  trimIn: number // casing board width
  frameIn: number // window-frame band width (opening edge → glass)
  sillLenIn: number | null // stool length; null → auto (casing + 1″ each side)
  showInner: boolean // draw inner W1/H1 arrows
  showOuter: boolean // draw outer W2/H2 arrows (trim outer)
  singlePair: boolean // one W/H pair only (labels W/H, no 1/2 suffix)
}

// ── Door elevations (Eddie 2026-07-29): sliding door + French door ──────────
// Same visual language as the windows: off-white casing (3-sided, ends at the
// floor), pure-white frame/slabs, grey-blue glass, floor line under the door.
function buildDoorMarkup(g: SceneGeom): string {
  const VBW = 300
  const VBH = 330
  const sliding = g.kind === 'sliding_door'
  const single = !sliding && g.doorPanels === 'single'
  const glass = sliding || g.doorGlass !== 'solid'
  const trim = sceneHasTrim(g.scene)
  const T0 = trim ? Math.min(Math.max(g.trimIn || 2.5, 1), 8) : 0
  const oW = Math.min(Math.max(g.openWIn || (sliding ? 72 : single ? 32 : 60), 18), 400)
  const oH = Math.min(Math.max(g.openHIn || 80, 40), 400)
  const totalWIn = oW + 2 * T0 + 8
  const totalHIn = oH + T0 + 6
  const S = Math.min(206 / totalWIn, 244 / totalHIn)
  const T = trim ? Math.max(T0 * S, 6) : 0
  const OW = oW * S
  const OH = oH * S
  const F = Math.min(Math.max(g.frameIn || 1.5, 0.5), 6) * S
  const x1 = (VBW - OW) / 2
  const yBot = VBH - 34 // floor
  const y1 = yBot - OH
  const parts: string[] = []
  let firstGlass: { gx: number; gy: number; gw: number; gh: number } | null = null

  // frame (head + jambs; the floor is the bottom)
  parts.push(`<path d="M${x1 - F} ${yBot} V${y1 - F} H${x1 + OW + F} V${yBot} H${x1 + OW} V${y1} H${x1} V${yBot} Z" fill="${C_FRAME}" stroke="${LN}" stroke-width="1.8"/>`)

  if (sliding) {
    // two sliding panels; the RIGHT one runs in the front track
    const pw = OW / 2 - F * 0.2
    const stile = Math.max(3.5 * S, 7)
    const drawPanel = (px: number, front: boolean) => {
      parts.push(`<rect x="${px}" y="${y1 + (front ? 0 : F * 0.5)}" width="${pw}" height="${OH - (front ? 0 : F * 0.5)}" fill="${C_FRAME}" stroke="${LN}" stroke-width="${front ? 2 : 1.5}"/>`)
      parts.push(`<rect x="${px + stile}" y="${y1 + stile + (front ? 0 : F * 0.5)}" width="${pw - 2 * stile}" height="${OH - 2 * stile - (front ? 0 : F * 0.5)}" fill="${C_GLASS}" stroke="${LN}" stroke-width="1.4"/>`)
    }
    drawPanel(x1, false)
    drawPanel(x1 + OW - pw, true)
    // handle on the front panel's leading stile
    parts.push(`<rect x="${x1 + OW - pw + stile * 0.25}" y="${y1 + OH * 0.44}" width="3.5" height="${OH * 0.12}" rx="1.5" fill="${LN}"/>`)
    // track
    parts.push(`<line x1="${x1}" y1="${yBot - 2.5}" x2="${x1 + OW}" y2="${yBot - 2.5}" stroke="${LN}" stroke-width="1.2"/>`)
  } else {
    // french door slab(s)
    const slabs = single ? 1 : 2
    const gap = single ? 0 : 1.5
    const sw = (OW - gap) / slabs
    const stile = Math.max(4 * S, 9)
    for (let i = 0; i < slabs; i += 1) {
      const px = x1 + i * (sw + gap)
      parts.push(`<rect x="${px}" y="${y1}" width="${sw}" height="${OH}" fill="${C_FRAME}" stroke="${LN}" stroke-width="2"/>`)
      let gx = px + stile
      let gy = y1 + stile
      let gw = sw - 2 * stile
      let gh = OH - 2 * stile
      // typed glass size (per door) → glass drawn at true proportion,
      // centred in the slab
      if (glass && g.glassWIn && g.glassHIn) {
        const tw = Math.min(Math.max(g.glassWIn * S, 10), sw - 8)
        const th = Math.min(Math.max(g.glassHIn * S, 10), OH - 8)
        gx = px + (sw - tw) / 2
        gy = y1 + (OH - th) / 2
        gw = tw
        gh = th
      }
      if (glass) {
        if (i === 0) firstGlass = { gx, gy, gw, gh }
        parts.push(`<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${C_GLASS}" stroke="${LN}" stroke-width="1.4"/>`)
        // lites: 2 cols × 4 rows
        parts.push(`<line x1="${gx + gw / 2}" y1="${gy}" x2="${gx + gw / 2}" y2="${gy + gh}" stroke="${LN}" stroke-width="1"/>`)
        for (let r = 1; r < 4; r += 1) {
          parts.push(`<line x1="${gx}" y1="${gy + (gh * r) / 4}" x2="${gx + gw}" y2="${gy + (gh * r) / 4}" stroke="${LN}" stroke-width="1"/>`)
        }
      } else {
        // solid door: two recessed panels
        const ph1 = gh * 0.52
        const ph2 = gh * 0.34
        parts.push(`<rect x="${gx}" y="${gy}" width="${gw}" height="${ph1}" fill="${C_FRAME}" stroke="${LN}" stroke-width="1.3"/>`)
        parts.push(`<rect x="${gx + 3}" y="${gy + 3}" width="${gw - 6}" height="${ph1 - 6}" fill="${C_CASE}" stroke="${LN}" stroke-width="0.9"/>`)
        parts.push(`<rect x="${gx}" y="${gy + gh - ph2}" width="${gw}" height="${ph2}" fill="${C_FRAME}" stroke="${LN}" stroke-width="1.3"/>`)
        parts.push(`<rect x="${gx + 3}" y="${gy + gh - ph2 + 3}" width="${gw - 6}" height="${ph2 - 6}" fill="${C_CASE}" stroke="${LN}" stroke-width="0.9"/>`)
      }
      // knob at the meeting stile (double) / latch side (single)
      const kx = single ? px + sw - stile / 2 : i === 0 ? px + sw - stile / 2 : px + stile / 2
      parts.push(`<circle cx="${kx}" cy="${y1 + OH * 0.52}" r="3" fill="${LN}"/>`)
    }
  }

  // casing: 3-sided (head + legs), mitred head corners, ends at the floor
  if (trim) {
    const x0 = x1 - F - T
    const y0 = y1 - F - T
    const W = OW + 2 * F + 2 * T
    const p = T / 3
    const casing: string[] = []
    casing.push(`<path d="M${x0} ${yBot} V${y0} H${x0 + W} V${yBot} H${x1 + OW + F} V${y1 - F} H${x1 - F} V${yBot} Z" fill="${C_CASE}" stroke="${LN}" stroke-width="2.2"/>`)
    casing.push(`<path d="M${x0 + p} ${yBot} V${y0 + p} H${x0 + W - p} V${yBot}" fill="none" stroke="${LN}" stroke-width="1"/>`)
    casing.push(`<line x1="${x0}" y1="${y0}" x2="${x1 - F}" y2="${y1 - F}" stroke="${LN}" stroke-width="1.1"/>`)
    casing.push(`<line x1="${x0 + W}" y1="${y0}" x2="${x1 + OW + F}" y2="${y1 - F}" stroke="${LN}" stroke-width="1.1"/>`)
    parts.unshift(...casing)
  }

  // floor line
  const fx0 = x1 - F - T - 14
  const fx1 = x1 + OW + F + T + 14
  parts.push(`<line x1="${fx0}" y1="${yBot}" x2="${fx1}" y2="${yBot}" stroke="${LN}" stroke-width="2.4"/>`)

  // measuring arrows
  const AR = (x1a: number, y1a: number, x2a: number, y2a: number, lb: string, lx: number, ly: number) =>
    `<g stroke="#4DB6E8" stroke-width="1.6" fill="#4DB6E8"><line x1="${x1a}" y1="${y1a}" x2="${x2a}" y2="${y2a}" marker-start="url(#ahd)" marker-end="url(#ahd)"/><text x="${lx}" y="${ly}" font-size="12" font-weight="700" stroke="none">${lb}</text></g>`
  const innerLb = g.singlePair ? ['W', 'H'] : ['W1', 'H1']
  const outerLb = g.singlePair ? ['W', 'H'] : ['W2', 'H2']
  if (g.showInner) {
    const iy = y1 + OH * 0.24
    parts.push(AR(x1 + 2, iy, x1 + OW - 2, iy, innerLb[0], x1 + OW / 2 - 8, iy - 5))
    const ix = x1 + OW * 0.24
    parts.push(AR(ix, y1 + 2, ix, yBot - 2, innerLb[1], ix + 5, y1 + OH * 0.62))
  }
  if (g.showOuter) {
    const xo = x1 - F - T
    const yo = y1 - F - T
    parts.push(AR(xo, yo - 12, x1 + OW + F + T, yo - 12, outerLb[0], x1 + OW / 2 - 8, yo - 17))
    const xr = x1 + OW + F + T + 12
    parts.push(AR(xr, yo, xr, yBot, outerLb[1], xr + 5, (yo + yBot) / 2))
  }
  // french door with glass: GW/GH arrows on the first door's glass pane
  if (firstGlass) {
    const fg = firstGlass
    const gyA = fg.gy + fg.gh * 0.82
    parts.push(AR(fg.gx + 1, gyA, fg.gx + fg.gw - 1, gyA, 'GW', fg.gx + fg.gw / 2 - 10, gyA - 4))
    const gxA = fg.gx + fg.gw * 0.72
    parts.push(AR(gxA, fg.gy + 1, gxA, fg.gy + fg.gh - 1, 'GH', gxA + 4, fg.gy + fg.gh * 0.3))
  }

  return `<defs><marker id="ahd" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 z" fill="#4DB6E8"/></marker></defs>${parts.join('')}`
}

function buildSceneMarkup(g: SceneGeom): string {
  if (g.kind === 'sliding_door' || g.kind === 'french_door') return buildDoorMarkup(g)
  const VBW = 300
  const VBH = 330
  const trim = sceneHasTrim(g.scene)
  const sill = sceneHasSill(g.scene)
  const arch = sceneIsArch(g.scene)
  const T0 = trim ? Math.min(Math.max(g.trimIn || 2.5, 1), 8) : 0
  const oW = Math.min(Math.max(g.openWIn || 36, 12), 400)
  const oH = Math.min(Math.max(g.openHIn || 54, 12), 400)
  const sillLen = sill ? Math.max(g.sillLenIn || oW + 2 * T0 + 2, oW + 2 * T0) : 0
  // fit: leave room for arrows on all sides
  const totalWIn = Math.max(oW + 2 * T0, sillLen)
  const totalHIn = oH + T0 + (sill ? 4 : T0)
  const S = Math.min(196 / totalWIn, 236 / totalHIn)
  // true proportion, but never let the casing band collapse below visibility
  const T = trim ? Math.max(T0 * S, 6) : 0
  const OW = oW * S
  const OH = oH * S
  const F = Math.min(Math.max(g.frameIn || 1.5, 0.5), 6) * S
  const x1 = (VBW - OW) / 2
  const y1 = (VBH - 36 - (OH + T + (sill ? 26 : T))) / 2 + T + 26
  const R = OW / 2 // arch radius (half-round top)
  const cy = y1 + R // springline for arch
  const yBot = y1 + OH
  const parts: string[] = []

  // — window frame + glass —
  if (arch) {
    parts.push(`<path d="M${x1} ${yBot} V${cy} A${R} ${R} 0 0 1 ${x1 + OW} ${cy} V${yBot} Z" fill="${C_FRAME}" stroke="${LN}" stroke-width="1.8"/>`)
    const r = R - F
    parts.push(`<path d="M${x1 + F} ${yBot - F} V${cy} A${r} ${r} 0 0 1 ${x1 + OW - F} ${cy} V${yBot - F} Z" fill="${C_GLASS}" stroke="${LN}" stroke-width="1.6"/>`)
    parts.push(`<line x1="${x1 + F}" y1="${cy}" x2="${x1 + OW - F}" y2="${cy}" stroke="${LN}" stroke-width="1.6"/>`)
    for (const a of [-45, 0, 45]) {
      const rad = (a * Math.PI) / 180
      parts.push(`<line x1="${x1 + R}" y1="${cy}" x2="${x1 + R + r * Math.sin(rad)}" y2="${cy - r * Math.cos(rad)}" stroke="${LN}" stroke-width="1"/>`)
    }
    parts.push(`<line x1="${x1 + R}" y1="${cy}" x2="${x1 + R}" y2="${yBot - F}" stroke="${LN}" stroke-width="1.1"/>`)
  } else {
    parts.push(`<rect x="${x1}" y="${y1}" width="${OW}" height="${OH}" fill="${C_FRAME}" stroke="${LN}" stroke-width="1.8"/>`)
    const sx = x1 + F
    const sy = y1 + F
    const sw = OW - 2 * F
    const sh = OH - 2 * F
    const mid = sy + sh / 2
    parts.push(`<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="${C_GLASS}" stroke="${LN}" stroke-width="1.8"/>`)
    parts.push(`<rect x="${sx}" y="${mid - 3}" width="${sw}" height="6" fill="${C_FRAME}" stroke="${LN}" stroke-width="1.3"/>`)
    parts.push(`<line x1="${sx + sw / 2}" y1="${sy}" x2="${sx + sw / 2}" y2="${mid - 3}" stroke="${LN}" stroke-width="1.1"/>`)
    parts.push(`<line x1="${sx + sw / 2}" y1="${mid + 3}" x2="${sx + sw / 2}" y2="${sy + sh}" stroke="${LN}" stroke-width="1.1"/>`)
  }

  // — casing (drawn behind: prepend) —
  if (trim) {
    const x0 = x1 - T
    const p = T / 3
    const casing: string[] = []
    if (arch) {
      const Ro = R + T
      const outer =
        `M${x0} ${yBot + (sill ? 0 : 0)} V${cy} A${Ro} ${Ro} 0 0 1 ${x1 + OW + T} ${cy} V${yBot}` +
        ` H${x1 + OW} V${cy} A${R} ${R} 0 0 0 ${x1} ${cy} V${yBot} Z`
      casing.push(`<path d="${outer}" fill="${C_CASE}" stroke="${LN}" stroke-width="2.2"/>`)
      if (!sill) {
        casing.push(`<rect x="${x0}" y="${yBot}" width="${OW + 2 * T}" height="${T}" fill="${C_CASE}" stroke="${LN}" stroke-width="2"/>`)
        casing.push(`<line x1="${x0}" y1="${yBot + T}" x2="${x1}" y2="${yBot}" stroke="${LN}" stroke-width="1.1"/>`)
        casing.push(`<line x1="${x1 + OW + T}" y1="${yBot + T}" x2="${x1 + OW}" y2="${yBot}" stroke="${LN}" stroke-width="1.1"/>`)
      }
      casing.push(`<line x1="${x0}" y1="${cy}" x2="${x1}" y2="${cy}" stroke="${LN}" stroke-width="1.1"/>`)
      casing.push(`<line x1="${x1 + OW}" y1="${cy}" x2="${x1 + OW + T}" y2="${cy}" stroke="${LN}" stroke-width="1.1"/>`)
      const Rp = R + T - p
      casing.push(`<path d="M${x0 + p} ${yBot} V${cy} A${Rp} ${Rp} 0 0 1 ${x1 + OW + T - p} ${cy} V${yBot}" fill="none" stroke="${LN}" stroke-width="1"/>`)
    } else {
      const y0 = y1 - T
      const W = OW + 2 * T
      if (!sill) {
        const H = OH + 2 * T
        casing.push(`<rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="${C_CASE}" stroke="${LN}" stroke-width="2.2"/>`)
        casing.push(`<rect x="${x0 + p}" y="${y0 + p}" width="${W - 2 * p}" height="${H - 2 * p}" fill="none" stroke="${LN}" stroke-width="1"/>`)
        casing.push(`<line x1="${x0}" y1="${y0 + H}" x2="${x1}" y2="${yBot}" stroke="${LN}" stroke-width="1.1"/>`)
        casing.push(`<line x1="${x0 + W}" y1="${y0 + H}" x2="${x1 + OW}" y2="${yBot}" stroke="${LN}" stroke-width="1.1"/>`)
      } else {
        casing.push(`<path d="M${x0} ${yBot} V${y0} H${x0 + W} V${yBot} H${x1 + OW} V${y1} H${x1} V${yBot} Z" fill="${C_CASE}" stroke="${LN}" stroke-width="2.2"/>`)
        casing.push(`<path d="M${x0 + p} ${yBot} V${y0 + p} H${x0 + W - p} V${yBot}" fill="none" stroke="${LN}" stroke-width="1"/>`)
      }
      casing.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${LN}" stroke-width="1.1"/>`)
      casing.push(`<line x1="${x0 + W}" y1="${y0}" x2="${x1 + OW}" y2="${y1}" stroke="${LN}" stroke-width="1.1"/>`)
    }
    parts.unshift(...casing)
  }

  // — sill (stool + apron) —
  if (sill) {
    const stoolW = sillLen * S
    const sx = x1 + OW / 2 - stoolW / 2
    parts.push(`<rect x="${sx}" y="${yBot}" width="${stoolW}" height="6" fill="${C_CASE}" stroke="${LN}" stroke-width="2"/>`)
    const apW = OW + T * 0.8
    parts.push(`<rect x="${x1 - T * 0.4}" y="${yBot + 6}" width="${apW}" height="10" fill="${C_CASE}" stroke="${LN}" stroke-width="1.6"/>`)
  }

  // — measuring arrows —
  const AR = (x1a: number, y1a: number, x2a: number, y2a: number, lb: string, lx: number, ly: number) =>
    `<g stroke="#4DB6E8" stroke-width="1.6" fill="#4DB6E8"><line x1="${x1a}" y1="${y1a}" x2="${x2a}" y2="${y2a}" marker-start="url(#ahd)" marker-end="url(#ahd)"/><text x="${lx}" y="${ly}" font-size="12" font-weight="700" stroke="none">${lb}</text></g>`
  const innerLb = g.singlePair ? ['W', 'H'] : ['W1', 'H1']
  const outerLb = g.singlePair ? ['W', 'H'] : ['W2', 'H2']
  if (g.showInner) {
    // W arrow rides the upper sash (clear of the meeting rail); H arrow sits
    // off-center so it doesn't overlap the centre muntin.
    const iy = arch ? cy + (yBot - cy) * 0.45 : y1 + OH * 0.3
    parts.push(AR(x1 + 2, iy, x1 + OW - 2, iy, innerLb[0], x1 + OW / 2 - 8, iy - 5))
    const ix = arch ? x1 + R : x1 + OW * 0.3
    parts.push(AR(ix, arch ? y1 - 2 : y1 + 2, ix, yBot - 2, innerLb[1], ix + 5, arch ? y1 + 26 : y1 + OH * 0.62))
  }
  if (g.showOuter) {
    const xo = x1 - T
    const yoTop = arch ? y1 - T : y1 - T
    parts.push(AR(xo, yoTop - 12, x1 + OW + T, yoTop - 12, outerLb[0], x1 + OW / 2 - 8, yoTop - 17))
    const xr = x1 + OW + T + 12
    const yb2 = sill ? yBot : yBot + T
    parts.push(AR(xr, yoTop, xr, yb2, outerLb[1], xr + 5, (yoTop + yb2) / 2))
  }

  return `<defs><marker id="ahd" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 z" fill="#4DB6E8"/></marker></defs>${parts.join('')}`
}

// Small thumbnails for the scene picker (same visual language, simplified).
function SceneThumb({ scene }: { scene: Exclude<Scene, ''> }) {
  const trim = sceneHasTrim(scene)
  const sill = sceneHasSill(scene)
  const arch = sceneIsArch(scene)
  const parts: string[] = []
  if (trim) {
    if (arch) {
      parts.push(`<path d="M12 52 V28 A20 20 0 0 1 52 28 V52 H46 V28 A14 14 0 0 0 18 28 V52 Z" fill="${C_CASE}" stroke="${LN}" stroke-width="1.4"/>`)
      if (!sill) parts.push(`<rect x="12" y="52" width="40" height="6" fill="${C_CASE}" stroke="${LN}" stroke-width="1.2"/>`)
    } else {
      parts.push(`<rect x="10" y="6" width="44" height="${sill ? 46 : 52}" fill="${C_CASE}" stroke="${LN}" stroke-width="1.6"/>`)
    }
  }
  if (arch) {
    parts.push(`<path d="M18 52 V28 A14 14 0 0 1 46 28 V52 Z" fill="${C_FRAME}" stroke="${LN}" stroke-width="1.6"/>`)
    parts.push(`<path d="M21 49 V28 A11 11 0 0 1 43 28 V49 Z" fill="${C_GLASS}" stroke="${LN}" stroke-width="1"/>`)
    parts.push(`<line x1="21" y1="28" x2="43" y2="28" stroke="${LN}" stroke-width="1"/>`)
    parts.push(`<line x1="32" y1="28" x2="32" y2="49" stroke="${LN}" stroke-width="0.8"/>`)
  } else {
    const y0 = trim ? 12 : 8
    const h = (sill ? 46 : 52) - (trim ? 10 : 4)
    parts.push(`<rect x="17" y="${y0}" width="30" height="${h}" fill="${C_FRAME}" stroke="${LN}" stroke-width="1.6"/>`)
    parts.push(`<rect x="21" y="${y0 + 4}" width="22" height="${h - 8}" fill="${C_GLASS}" stroke="${LN}" stroke-width="1"/>`)
    parts.push(`<line x1="21" y1="${y0 + h / 2}" x2="43" y2="${y0 + h / 2}" stroke="${LN}" stroke-width="1"/>`)
    parts.push(`<line x1="32" y1="${y0 + 4}" x2="32" y2="${y0 + h - 4}" stroke="${LN}" stroke-width="0.8"/>`)
    if (trim && !sill) {
      parts.push(`<line x1="10" y1="6" x2="17" y2="12" stroke="${LN}" stroke-width="0.9"/>`)
      parts.push(`<line x1="54" y1="6" x2="47" y2="12" stroke="${LN}" stroke-width="0.9"/>`)
      parts.push(`<line x1="10" y1="58" x2="17" y2="50" stroke="${LN}" stroke-width="0.9"/>`)
      parts.push(`<line x1="54" y1="58" x2="47" y2="50" stroke="${LN}" stroke-width="0.9"/>`)
    }
  }
  if (sill) {
    parts.push(`<rect x="8" y="52" width="48" height="5" fill="${C_CASE}" stroke="${LN}" stroke-width="1.2"/>`)
    parts.push(`<rect x="16" y="57" width="32" height="4" fill="${C_CASE}" stroke="${LN}" stroke-width="1"/>`)
  }
  return <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden dangerouslySetInnerHTML={{ __html: parts.join('') }} />
}

// Door thumbnails for the door-casing picker (sliding vs french handled by kind).
function DoorThumb({ scene, kind }: { scene: Exclude<Scene, ''>; kind: Kind }) {
  const trim = sceneHasTrim(scene)
  const parts: string[] = []
  if (trim) parts.push(`<path d="M10 58 V8 H54 V58 H48 V14 H16 V58 Z" fill="${C_CASE}" stroke="${LN}" stroke-width="1.4"/>`)
  const x0 = trim ? 16 : 12
  const w = trim ? 32 : 40
  parts.push(`<rect x="${x0}" y="${trim ? 14 : 10}" width="${w}" height="${58 - (trim ? 14 : 10)}" fill="${C_FRAME}" stroke="${LN}" stroke-width="1.6"/>`)
  const y0 = trim ? 14 : 10
  const h = 58 - y0
  if (kind === 'sliding_door') {
    parts.push(`<rect x="${x0 + 3}" y="${y0 + 3}" width="${w / 2 - 4}" height="${h - 6}" fill="${C_GLASS}" stroke="${LN}" stroke-width="1"/>`)
    parts.push(`<rect x="${x0 + w / 2 + 1}" y="${y0 + 3}" width="${w / 2 - 4}" height="${h - 6}" fill="${C_GLASS}" stroke="${LN}" stroke-width="1.2"/>`)
    parts.push(`<rect x="${x0 + w / 2 + 2.5}" y="${y0 + h * 0.45}" width="2" height="${h * 0.14}" fill="${LN}"/>`)
  } else {
    const sw = w / 2
    for (let i = 0; i < 2; i += 1) {
      const px = x0 + i * sw
      parts.push(`<rect x="${px + 2}" y="${y0 + 3}" width="${sw - 4}" height="${h - 6}" fill="${C_GLASS}" stroke="${LN}" stroke-width="1"/>`)
      parts.push(`<line x1="${px + 2}" y1="${y0 + h / 2}" x2="${px + sw - 2}" y2="${y0 + h / 2}" stroke="${LN}" stroke-width="0.8"/>`)
    }
    parts.push(`<circle cx="${x0 + sw - 2}" cy="${y0 + h * 0.5}" r="1.6" fill="${LN}"/>`)
    parts.push(`<circle cx="${x0 + sw + 2}" cy="${y0 + h * 0.5}" r="1.6" fill="${LN}"/>`)
  }
  parts.push(`<line x1="6" y1="58" x2="58" y2="58" stroke="${LN}" stroke-width="2"/>`)
  return <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden dangerouslySetInnerHTML={{ __html: parts.join('') }} />
}

// The tailored measuring diagram, drawn at TRUE proportion from the typed
// numbers. `trimSize` = the shallow-frame + trim rule (measure trim outer).
function GuidanceDiagram({
  mount,
  scene,
  trimSize,
  language,
  dims,
  kind = 'window',
  doorPanels = 'double',
  doorGlass = 'glass',
}: {
  mount: '' | 'inside' | 'inside_z' | 'outside'
  scene: Scene
  trimSize: boolean
  language: WizardLanguage
  dims: { w: string; h: string; trimW: string; frameW: string; sillLen: string; glassW?: string; glassH?: string }
  kind?: Kind
  doorPanels?: 'double' | 'single'
  doorGlass?: 'glass' | 'solid'
}) {
  const inside = mount === 'inside' || mount === 'inside_z'
  const sc: Exclude<Scene, ''> = (scene || 'plain') as Exclude<Scene, ''>
  const trim = sceneHasTrim(sc)
  const arch = sceneIsArch(sc)
  const dualPairs = trim && !trimSize
  const isDoor = kind !== 'window'

  let caption: string
  if (isDoor) {
    const doorName = kind === 'sliding_door' ? tr(language, 'sliding door', '推拉门') : tr(language, 'French door', '法式门')
    if (trimSize || (trim && !dualPairs)) {
      caption = tr(language, `Measure the casing's outer width and height — the treatment mounts on the door casing.`, '测量门套的外宽和外高——窗饰将安装在门套上。')
    } else if (dualPairs) {
      caption = tr(language,
        `With door casing, measure BOTH: W1×H1 = the door opening, W2×H2 = the outer edge of the casing (height down to the floor).`,
        '有门套时两组都量：W1×H1 = 门洞（内框），W2×H2 = 门套外沿（高度量到地面）。图按您填的数字等比例重绘。')
    } else if (inside) {
      caption = tr(language, `Inside mount on a ${doorName}: measure the opening width and height inside the frame. Rough is fine — we re-measure at the free in-home visit.`, `内嵌安装 · ${doorName}：量门洞内的宽和高。大致尺寸即可，上门时我们会精确复尺。`)
    } else {
      caption = tr(language, `Outside mount on a ${doorName}: width edge to edge of the area to cover; height from where the treatment starts down to the floor.`, `外挂安装 · ${doorName}：宽度量需要遮盖的范围；高度从安装位置量到地面。`)
    }
    if (kind === 'french_door' && doorGlass === 'glass') {
      caption += ' ' + tr(language, 'GW×GH = the GLASS on one door — door treatments are usually sized to the glass, so please measure it too.', 'GW×GH = 每扇门上玻璃的宽高——门上的窗饰通常按玻璃尺寸配，请顺手量一下。')
    }
  } else if (trimSize) {
    caption = tr(language,
      "Shallow frame + wood trim: measure the TRIM's outer width and height — the treatment mounts on the trim, so the trim size is what we work from, not the opening.",
      '浅窗框 + 木线条：测量窗套的外宽和外高。窗饰将安装在窗套上，要量的是窗套外沿尺寸，不是窗洞。')
  } else if (dualPairs) {
    caption = tr(language,
      'With trim, measure BOTH: W1×H1 = the opening (inner frame), W2×H2 = the outer edge of the trim. The diagram redraws to your numbers.',
      '有窗套时两组都量：W1×H1 = 窗洞（内框），W2×H2 = 窗套外沿。图会按您填的数字等比例重绘。')
  } else if (inside) {
    caption = arch
      ? tr(language, 'Inside mount, arched window: width at the WIDEST point, height at the TALLEST point (to the top of the arch). Rough is fine — we re-measure at the free in-home visit.', '内嵌安装 · 拱形窗：宽度量最宽处，高度量到拱顶最高点。大致尺寸即可，上门时我们会精确复尺。')
      : tr(language, 'Inside mount: measure the opening width and height once, roughly in the middle — rough is fine for this estimate; we re-measure precisely at your free in-home visit.', '内嵌安装：在窗框中间大致测量一次内宽和内高即可。此处用于参考估算，上门时我们会精确复尺。')
  } else if (sceneHasSill(sc)) {
    caption = tr(language, 'Outside mount with a sill: width edge to edge of the area to cover; height from where the treatment starts down to the TOP of the sill (or below — tell us in the location name).', '外挂安装 · 有窗台：宽度量需要遮盖的范围；高度从安装位置量到窗台上沿（想盖过窗台可量到窗台下方，请在位置名称里注明）。')
  } else {
    caption = tr(language, 'Outside mount: measure the area you want covered, edge to edge — rough is fine, we confirm exact coverage at the free in-home measure.', '外挂安装：测量您希望遮盖的整个区域宽高。大致尺寸即可，上门时我们会确认精确覆盖范围。')
  }

  const num0 = (v: string): number => {
    const n = parseFloat(v)
    return Number.isFinite(n) && n > 0 ? n : 0
  }
  const markup = buildSceneMarkup({
    scene: sc,
    kind,
    doorPanels,
    doorGlass,
    openWIn: num0(dims.w) || (kind === 'sliding_door' ? 72 : kind === 'french_door' ? (doorPanels === 'single' ? 32 : 60) : 36),
    openHIn: num0(dims.h) || (isDoor ? 80 : 54),
    trimIn: num0(dims.trimW) || 2.5,
    frameIn: num0(dims.frameW) || 1.5,
    sillLenIn: num0(dims.sillLen) || null,
    glassWIn: kind === 'french_door' && doorGlass === 'glass' ? num0(dims.glassW || '') || null : null,
    glassHIn: kind === 'french_door' && doorGlass === 'glass' ? num0(dims.glassH || '') || null : null,
    showInner: trimSize ? false : dualPairs ? true : true,
    showOuter: trimSize ? true : dualPairs ? true : false,
    singlePair: !dualPairs,
  })
  return (
    <div className="rounded-2xl bg-[#F7F5F2] p-4">
      <svg viewBox="0 0 300 330" className="h-auto w-full" role="img" aria-label={caption} dangerouslySetInnerHTML={{ __html: markup }} />
      <p className="mt-2 text-[12px] leading-relaxed text-gray-500">{caption}</p>
    </div>
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

  // ── v3: salesperson 'measure' link (AAPP) ─────────────────────────────────
  const [aapp, setAapp] = useState<AappLinkInfo | null>(null)
  const [contact, setContact] = useState({ name: '', phone: '', email: '', address: '' })
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [submitError, setSubmitError] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    let cancelled = false
    let token = ''
    try {
      token = new URLSearchParams(window.location.search).get('t') || ''
    } catch {
      /* no URL access */
    }
    if (!token) return
    fetch('/api/store/measure/link?t=' + encodeURIComponent(token))
      .then((r) => r.json())
      .then((json) => {
        if (cancelled || !json?.success) return
        const d = json.data || {}
        setAapp({ token, submitted: d.submitted === true, prefill: d.prefill || {}, salesperson: d.salesperson || null })
        setHasSubmitted(d.submitted === true)
        setContact({
          name: String(d.prefill?.name || ''),
          phone: String(d.prefill?.phone || ''),
          email: String(d.prefill?.email || ''),
          address: String(d.prefill?.address || ''),
        })
      })
      .catch(() => {
        /* bad/expired token → plain anonymous wizard */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const submitToRep = async () => {
    if (!aapp || !saved.length || submitState === 'sending') return
    setSubmitState('sending')
    setSubmitError('')
    try {
      const res = await fetch('/api/store/measure/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: aapp.token, contact, language }),
      })
      const json = await res.json().catch(() => null)
      if (json?.success) {
        setSubmitState('done')
        setHasSubmitted(true)
      } else {
        setSubmitState('idle')
        setSubmitError(zh ? '提交失败，请重试。' : typeof json?.error === 'string' ? json.error : 'Could not submit — please try again.')
      }
    } catch {
      setSubmitState('idle')
      setSubmitError(tr(language, 'Connection problem — please try again.', '网络连接出现问题，请重试。'))
    }
  }

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
  // v3: trim scene → measure BOTH the opening (W1/H1) and the trim outer
  // edge (W2/H2); scene extras = the trim/frame/sill dimension inputs.
  const dualPairs = needsDepth && sceneHasTrim(draft.scene) && !useTrimSize
  const sceneExtras = needsDepth && draft.scene !== ''
  const isDoorKind = draft.kind !== 'window'
  const mountReady = !needsDepth || (draft.mount !== '' && (!askTrim || draft.hasTrim !== null))

  // Auto-clear an invalid mount when the depth choice changes.
  useEffect(() => {
    if (!mountInfo) return
    if (draft.mount && !mountInfo.options.some((o) => o.v === draft.mount)) set('mount', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.depthChoice, draft.product])

  // Doors only support plain / trim scenes — drop sill/arch picks on switch.
  useEffect(() => {
    if (draft.kind !== 'window' && draft.scene && draft.scene !== 'plain' && draft.scene !== 'trim') set('scene', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.kind])

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
      clearBottomIn: draft.kind !== 'window' ? undefined : num(draft.D),
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
            scene: draft.scene,
            doorPanels: draft.kind === 'french_door' ? draft.doorPanels : null,
            doorGlass: draft.kind === 'french_door' ? draft.doorGlass : null,
            trimWidthIn: sceneHasTrim(draft.scene) ? (num(draft.trimW) ?? 2.5) : null,
            frameWidthIn: draft.scene ? (num(draft.frameW) ?? null) : null,
            sillLengthIn: sceneHasSill(draft.scene) ? (num(draft.sillLen) ?? null) : null,
            sillDepthIn: sceneHasSill(draft.scene) ? (num(draft.sillDepth) ?? null) : null,
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
      D_bottomIn: draft.kind !== 'window' ? null : (num(draft.D) ?? null),
      wallHeightIn: num(draft.wallH) ?? null,
      // with trim: optional second pair measured at the trim's OUTER edge
      outerWidthIn: sceneHasTrim(draft.scene) && !useTrimSize ? (num(draft.oW) ?? null) : null,
      outerHeightIn: sceneHasTrim(draft.scene) && !useTrimSize ? (num(draft.oH) ?? null) : null,
      // french door with glass: glass size per door
      glassWidthIn: draft.kind === 'french_door' && draft.doorGlass === 'glass' ? (num(draft.glassW) ?? null) : null,
      glassHeightIn: draft.kind === 'french_door' && draft.doorGlass === 'glass' ? (num(draft.glassH) ?? null) : null,
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
      scene: (SCENE_KEYS as readonly string[]).includes(c.scene) ? c.scene : '',
      doorPanels: c.doorPanels === 'single' ? 'single' : 'double',
      doorGlass: c.doorGlass === 'solid' ? 'solid' : 'glass',
      glassW: d.glassWidthIn != null ? String(d.glassWidthIn) : '',
      glassH: d.glassHeightIn != null ? String(d.glassHeightIn) : '',
      trimW: c.trimWidthIn != null ? String(c.trimWidthIn) : '2.5',
      frameW: c.frameWidthIn != null ? String(c.frameWidthIn) : '1.5',
      sillLen: c.sillLengthIn != null ? String(c.sillLengthIn) : '',
      sillDepth: c.sillDepthIn != null ? String(c.sillDepthIn) : '',
      oW: d.outerWidthIn != null ? String(d.outerWidthIn) : '',
      oH: d.outerHeightIn != null ? String(d.outerHeightIn) : '',
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
      const parts = [`${d?.widthIn ?? '?'}″ × ${d?.heightIn ?? '?'}″${d?.measured === 'trim' ? tr(language, ' (trim)', '（窗套外沿）') : ''}`]
      if (d?.outerWidthIn && d?.outerHeightIn) parts.push(`${tr(language, 'trim outer', '窗套外沿')} ${d.outerWidthIn}″ × ${d.outerHeightIn}″`)
      if (d?.glassWidthIn && d?.glassHeightIn) parts.push(`${tr(language, 'glass', '玻璃')} ${d.glassWidthIn}″ × ${d.glassHeightIn}″`)
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
          <td>${kindLabelFor(x.kind, language)}</td>
          <td>${x.product === 'drapery' ? tr(language, 'Custom drapery', '定制布帘') : x.product === 'shades' ? tr(language, 'Shades', '窗帘') : tr(language, 'Shutters', '百叶窗')}</td>
          <td>${[x.config?.depthChoice ? `${tr(language, 'Depth', '深度')} ${depthLabelFor(x.product as Product, x.config.depthChoice, language)}` : '', mountLabel(x.config), sceneLabel(x.config?.scene || '', language), x.config?.hasTrim ? tr(language, 'has trim', '有木线条') : ''].filter(Boolean).join(' · ')}</td>
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
        {aapp?.salesperson?.name && (
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-gray-200 bg-[#F7F5F2] p-5">
            {aapp.salesperson.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={aapp.salesperson.avatar} alt="" className="h-14 w-14 flex-none rounded-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[#12141C] text-lg font-semibold text-white">
                {(aapp.salesperson.name || 'A').slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                {tr(language, 'Your consultant · Angel Drapery', '您的专属顾问 · 洛杉矶天使窗帘')}
              </p>
              <p className="truncate text-base font-semibold text-[#12141C]">{aapp.salesperson.name}</p>
              {aapp.salesperson.phone && (
                <p className="text-[13px] text-gray-500">
                  <a href={`tel:${aapp.salesperson.phone}`} className="underline underline-offset-2 hover:text-[#12141C]">{aapp.salesperson.phone}</a>
                  <a href={`sms:${aapp.salesperson.phone}`} className="ml-3 underline underline-offset-2 hover:text-[#12141C]">{tr(language, 'Text me', '发短信')}</a>
                </p>
              )}
            </div>
          </div>
        )}
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
                      {kindLabelFor(wdw.kind, language)} ·{' '}
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

        {/* v3: send the sheet to the salesperson who sent this link */}
        {aapp && saved.length > 0 && (
          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-8 md:p-10">
            <h3 className="mb-2 text-xl font-semibold tracking-tight text-[#12141C]">
              {aapp.salesperson?.name
                ? tr(language, `Send your sheet to ${aapp.salesperson.name}`, `把测量表发给 ${aapp.salesperson.name}`)
                : tr(language, 'Send your sheet to us', '把测量表发给我们')}
            </h3>
            <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-500">
              {tr(language,
                'Check your contact info below and submit — your consultant gets the sheet instantly and will prepare a plan. Rough sizes are fine; everything is re-measured at the free in-home visit before production.',
                '确认下方联系方式后提交，您的顾问会立刻收到这份测量表并为您准备方案。尺寸大致即可，生产前我们会免费上门精确复尺。')}
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={label}>{tr(language, 'Name *', '姓名 *')}</label>
                <input className={inputCls} value={contact.name} maxLength={120} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} />
              </div>
              <div>
                <label className={label}>{tr(language, 'Phone *', '电话 *')}</label>
                <input className={inputCls} type="tel" value={contact.phone} maxLength={40} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
              </div>
              <div>
                <label className={label}>{tr(language, 'Email', '邮箱')}</label>
                <input className={inputCls} type="email" value={contact.email} maxLength={120} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
              </div>
              <div>
                <label className={label}>{tr(language, 'Address', '地址')}</label>
                <input className={inputCls} value={contact.address} maxLength={240} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} />
              </div>
            </div>
            {submitState === 'done' ? (
              <div className="mt-6 rounded-2xl bg-[#ecfdf5] p-5 text-sm leading-relaxed text-[#065f46]">
                {tr(language,
                  '✅ Sent! Your consultant received your measurement sheet and will follow up shortly. You can keep editing windows and submit again anytime.',
                  '✅ 已提交！您的顾问已收到测量表，会尽快与您联系。之后修改了窗户也可以随时再次提交更新。')}
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => void submitToRep()}
                  disabled={submitState === 'sending' || !contact.name.trim() || !contact.phone.trim()}
                  className="rounded-full bg-[#12141C] px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {submitState === 'sending'
                    ? tr(language, 'Sending…', '正在提交…')
                    : hasSubmitted
                      ? tr(language, 'Submit updated sheet', '提交更新后的测量表')
                      : tr(language, 'Submit my sheet →', '提交测量表 →')}
                </button>
                {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              </div>
            )}
            <p className="mt-4 text-[12px] leading-relaxed text-gray-400">
              {tr(language,
                'Your sheet is saved as “customer self-measured” — reference only, never sent to production without our precise in-home re-measure.',
                '这份表会以「客户自测」名义保存，仅供参考——未经我们上门精确复尺，绝不会直接用于生产。')}
            </p>
          </div>
        )}
      </div>
    )
  }

  // ═════════════════════════ EDIT VIEW ═════════════════════════
  const isDoor = draft.kind !== 'window'
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
            <button className={pillBtn(draft.kind === 'french_door')} onClick={() => set('kind', 'french_door')}>
              {tr(language, 'French door', '法式门 French')}
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
        <div className="mt-8 max-w-md space-y-4">
          {/* diagram ABOVE its controls (Eddie 2026-07-29) */}
          <OperationDiagram op={draft.operation} language={language} />
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
          <span className={`${ACCENT} mb-3 mt-12 block text-[11px] font-bold uppercase tracking-[0.3em]`}>{tr(language, 'Step 3 · Frame depth', isDoorKind ? '第 3 步 · 门框深度' : '第 3 步 · 窗框深度')}</span>
          <h2 className="mb-2 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">{tr(language, 'How deep is the frame?', isDoorKind ? '门框有多深？' : '窗框有多深？')}</h2>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-400">
            {tr(language, 'Hold a tape at the glass and check the flat depth — this decides which mounting types are possible.', '将卷尺顶在玻璃上，测量到窗框前端的平整深度。这会决定可用的安装方式。')}
          </p>
          <div className="max-w-md space-y-5">
            {/* diagram ABOVE its controls (Eddie 2026-07-29) */}
            <DepthDiagram language={language} />
            <div>
              <span className={label}>{tr(language, 'Frame depth *', isDoorKind ? '门框深度 *' : '窗框深度 *')}</span>
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

              {/* v3: pick the drawing that looks like this window/door → the
                  measuring diagram in the next step adapts. */}
              {draft.mount !== '' && draft.kind === 'window' && (
                <div className="mt-5">
                  <span className={label}>{tr(language, 'Which looks like your window?', '哪张图最像您的窗户？')}</span>
                  <div className="flex flex-wrap gap-2">
                    {SCENES.map((s) => (
                      <button
                        key={s.v}
                        type="button"
                        className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-2 text-[12px] transition-all ${
                          draft.scene === s.v ? 'border-[#12141C] bg-[#F7F5F2] text-[#12141C]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                        }`}
                        onClick={() => set('scene', s.v)}
                        aria-pressed={draft.scene === s.v}
                      >
                        <SceneThumb scene={s.v} />
                        <span>{zh ? s.zh : s.en}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                    {tr(language, 'The measuring diagram in the next step adapts to your choice.', '下一步的测量指导图会按您的选择变化。')}
                  </p>
                </div>
              )}
              {draft.mount !== '' && draft.kind !== 'window' && (
                <>
                  {draft.kind === 'french_door' && (
                    <div className="mt-5 grid gap-4">
                      <div>
                        <span className={label}>{tr(language, 'Door style', '开门方式')}</span>
                        <div className="flex flex-wrap gap-2">
                          <button className={pillBtn(draft.doorPanels === 'double')} onClick={() => set('doorPanels', 'double')}>
                            {tr(language, 'Double — two doors', '对开 — 两扇')}
                          </button>
                          <button className={pillBtn(draft.doorPanels === 'single')} onClick={() => set('doorPanels', 'single')}>
                            {tr(language, 'Single door', '单开 — 一扇')}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className={label}>{tr(language, 'Glass in the door?', '门上有玻璃吗？')}</span>
                        <div className="flex flex-wrap gap-2">
                          <button className={pillBtn(draft.doorGlass === 'glass')} onClick={() => set('doorGlass', 'glass')}>
                            {tr(language, 'Yes — glass panes', '有玻璃')}
                          </button>
                          <button className={pillBtn(draft.doorGlass === 'solid')} onClick={() => set('doorGlass', 'solid')}>
                            {tr(language, 'No — solid door', '无玻璃（实心门）')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-5">
                    <span className={label}>{tr(language, 'Casing around the door?', '门四周有门套吗？')}</span>
                    <div className="flex flex-wrap gap-2">
                      {DOOR_SCENES.map((s) => (
                        <button
                          key={s.v}
                          type="button"
                          className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-2 text-[12px] transition-all ${
                            draft.scene === s.v ? 'border-[#12141C] bg-[#F7F5F2] text-[#12141C]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                          }`}
                          onClick={() => set('scene', s.v)}
                          aria-pressed={draft.scene === s.v}
                        >
                          <DoorThumb scene={s.v} kind={draft.kind} />
                          <span>{zh ? s.zh : s.en}</span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                      {tr(language, 'The measuring diagram in the next step adapts to your choice.', '下一步的测量指导图会按您的选择变化。')}
                    </p>
                  </div>
                </>
              )}
            </div>
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
          <div className="max-w-md space-y-5">
            {/* diagram ABOVE the inputs it explains (Eddie 2026-07-29) */}
            {draft.product === 'drapery' ? (
              <DraperyDiagram kind={draft.kind} language={language} />
            ) : (
              <GuidanceDiagram
                mount={draft.mount}
                scene={draft.scene}
                trimSize={useTrimSize}
                language={language}
                kind={draft.kind}
                doorPanels={draft.doorPanels}
                doorGlass={draft.doorGlass}
                dims={{ w: draft.w, h: draft.h, trimW: draft.trimW, frameW: draft.frameW, sillLen: draft.sillLen, glassW: draft.glassW, glassH: draft.glassH }}
              />
            )}
            <div className="grid gap-5">
              <div>
                <label className={label}>
                  {useTrimSize
                    ? tr(language, 'Trim outer width *', '窗套外宽 *')
                    : dualPairs
                      ? tr(language, 'W1 — opening (inner frame) width *', 'W1 — 窗洞（内框）宽 *')
                      : tr(language, 'Width (W) *', '宽度（W）*')}
                </label>
                <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.w} onChange={(e) => set('w', e.target.value)} placeholder={tr(language, 'inches', '英寸')} />
              </div>
              <div>
                <label className={label}>
                  {useTrimSize
                    ? tr(language, 'Trim outer height *', '窗套外高 *')
                    : dualPairs
                      ? tr(language, 'H1 — opening (inner frame) height *', 'H1 — 窗洞（内框）高 *')
                      : tr(language, 'Height (H) *', '高度（H）*')}
                </label>
                <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.h} onChange={(e) => set('h', e.target.value)} placeholder={tr(language, 'inches', '英寸')} />
              </div>
              {draft.kind === 'french_door' && draft.doorGlass === 'glass' && (
                <>
                  <div>
                    <label className={label}>{tr(language, 'GW — glass width (per door)', 'GW — 玻璃宽度（每扇）')}</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.glassW} onChange={(e) => set('glassW', e.target.value)} placeholder={tr(language, 'inches', '英寸')} />
                  </div>
                  <div>
                    <label className={label}>{tr(language, 'GH — glass height (per door)', 'GH — 玻璃高度（每扇）')}</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.glassH} onChange={(e) => set('glassH', e.target.value)} placeholder={tr(language, 'inches', '英寸')} />
                  </div>
                </>
              )}
              {dualPairs && (
                <>
                  <div>
                    <label className={label}>{tr(language, 'W2 — trim outer width', 'W2 — 窗套外沿宽')}</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.oW} onChange={(e) => set('oW', e.target.value)} placeholder={tr(language, 'inches (optional)', '英寸（选填）')} />
                  </div>
                  <div>
                    <label className={label}>{tr(language, 'H2 — trim outer height', 'H2 — 窗套外沿高')}</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.125} value={draft.oH} onChange={(e) => set('oH', e.target.value)} placeholder={tr(language, 'inches (optional)', '英寸（选填）')} />
                  </div>
                </>
              )}
              {sceneExtras && (
                <div className="grid grid-cols-2 gap-4">
                  {sceneHasTrim(draft.scene) && (
                    <div>
                      <label className={label}>{isDoorKind ? tr(language, 'Casing width', '门套宽度') : tr(language, 'Trim width', '窗套宽度')}</label>
                      <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.25} value={draft.trimW} onChange={(e) => set('trimW', e.target.value)} placeholder="2.5" />
                    </div>
                  )}
                  <div>
                    <label className={label}>{isDoorKind ? tr(language, 'Door-frame width', '门框宽度') : tr(language, 'Frame width', '窗框宽度')}</label>
                    <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.25} value={draft.frameW} onChange={(e) => set('frameW', e.target.value)} placeholder="1.5" />
                  </div>
                  {sceneHasSill(draft.scene) && (
                    <>
                      <div>
                        <label className={label}>{tr(language, 'Sill length', '窗台长度')}</label>
                        <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.25} value={draft.sillLen} onChange={(e) => set('sillLen', e.target.value)} placeholder={tr(language, 'inches (optional)', '英寸（选填）')} />
                      </div>
                      <div>
                        <label className={label}>{tr(language, 'Sill projection', '窗台凸出墙面厚度')}</label>
                        <input className={inputCls} type="number" inputMode="decimal" min={0} step={0.25} value={draft.sillDepth} onChange={(e) => set('sillDepth', e.target.value)} placeholder={tr(language, 'inches (optional)', '英寸（选填）')} />
                      </div>
                    </>
                  )}
                </div>
              )}
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
