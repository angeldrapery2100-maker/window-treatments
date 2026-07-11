'use client'

// Visual option pickers for the Luma shade template (store redesign P3 —
// 「智能简洁」, docs/STORE-REDESIGN-BLUEPRINT.md §3.2④).
//
// PRESENTATION ONLY. Every picker derives purely from the product's options
// array and writes the exact same selectedOptions[name] = value strings the
// old <select>s did — pricing payloads, cart payloads and shared-config links
// are untouched. Value keys drive the icon choice; unrecognized values (legacy
// hand-typed shade products) fall back to plain text cards so old products
// keep working.

import { FabricSwatchGrid } from './DraperyOptionPickers'

interface OptionValue {
  value: string
  label: string
  [key: string]: any
}

interface PickerProps {
  values: OptionValue[]
  selected: string
  onSelect: (value: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Option-name routing — which options get a visual picker
// ─────────────────────────────────────────────────────────────────────────────

export type LumaPickerKind = 'fabric' | 'cassette' | 'control'

/** Motor-system sub-options revealed only while control = motorized. */
export const LUMA_MOTOR_SUB_OPTIONS = ['motor', 'remote', 'hub'] as const

export function lumaPickerKind(name: string): LumaPickerKind | null {
  const n = (name || '').toLowerCase()
  if (n === 'fabric_code' || n === 'fabric_color' || n === 'fabric' ||
      n === 'front_fabric_code' || n === 'back_fabric_code') return 'fabric'
  if (n === 'cassette') return 'cassette'
  // AAPP products use 'control'; legacy shade products use 'operation'
  // (chain / cordless / motorized free text).
  if (n === 'control' || n === 'operation') return 'control'
  return null
}

export function isLumaMotorSubOption(name: string): boolean {
  return (LUMA_MOTOR_SUB_OPTIONS as readonly string[]).includes((name || '').toLowerCase())
}

/** True when a control-option value means "motorized". */
export function isMotorizedValue(value: string, label?: string): boolean {
  return /motor/i.test(`${value} ${label || ''}`)
}

export { FabricSwatchGrid }

// ─────────────────────────────────────────────────────────────────────────────
// ① Cassette — icon cards with tiny cross-section diagrams
// ─────────────────────────────────────────────────────────────────────────────

type CassetteKind = 'open' | 'round' | 'square'

export function cassetteKind(value: string, label?: string): CassetteKind | null {
  const v = (value || '').trim().toLowerCase()
  if (v === 'open_roll') return 'open'
  if (v === 'round_fabric' || v === 'round') return 'round'
  if (v === 'square_fabric' || v === 'square' || v === '5inch_square') return 'square'
  const s = `${v} ${(label || '').toLowerCase()}`
  if (/open/.test(s)) return 'open'
  if (/round/.test(s)) return 'round'
  if (/square/.test(s)) return 'square'
  return null
}

const svgProps = {
  viewBox: '0 0 48 40',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

/** Open roll: bare fabric roll (circle) with the fabric dropping straight down. */
function OpenRollSvg() {
  return (
    <svg {...svgProps} className="w-10 h-9 mx-auto">
      <circle cx="24" cy="10" r="7" />
      <circle cx="24" cy="10" r="2" />
      <line x1="31" y1="12" x2="31" y2="36" />
      <line x1="27" y1="36" x2="35" y2="36" />
    </svg>
  )
}

/** Round cassette: rounded housing enclosing the roll, fabric exits below. */
function RoundCassetteSvg() {
  return (
    <svg {...svgProps} className="w-10 h-9 mx-auto">
      <path d="M13 16 v-3 a11 11 0 0 1 22 0 v3 z" />
      <circle cx="24" cy="11" r="4.5" strokeDasharray="2 2.5" />
      <line x1="30" y1="16" x2="30" y2="36" />
      <line x1="26" y1="36" x2="34" y2="36" />
    </svg>
  )
}

/** Square cassette: square housing enclosing the roll, fabric exits below. */
function SquareCassetteSvg() {
  return (
    <svg {...svgProps} className="w-10 h-9 mx-auto">
      <rect x="12" y="3" width="24" height="13" rx="1.5" />
      <circle cx="24" cy="9.5" r="4.5" strokeDasharray="2 2.5" />
      <line x1="30" y1="16" x2="30" y2="36" />
      <line x1="26" y1="36" x2="34" y2="36" />
    </svg>
  )
}

export function CassetteCardPicker({ values, selected, onSelect }: PickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {values.map(v => {
        const isSel = selected === v.value
        const kind = cassetteKind(v.value, v.label)
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onSelect(v.value)}
            aria-pressed={isSel}
            className={`rounded-lg border px-2 py-3 text-center transition-colors ${
              isSel
                ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50 text-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {kind === 'open' && <OpenRollSvg />}
            {kind === 'round' && <RoundCassetteSvg />}
            {kind === 'square' && <SquareCassetteSvg />}
            {!kind && <span className="flex h-9 items-center justify-center text-gray-300 text-lg">—</span>}
            <span className="mt-1.5 block text-[11px] leading-tight">{v.label || v.value}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ② Control — icon cards (chain / stainless chain / cordless / motorized)
// ─────────────────────────────────────────────────────────────────────────────

type ControlKind = 'chain' | 'stainless' | 'cordless' | 'motorized'

export function controlKind(value: string, label?: string): ControlKind | null {
  const v = (value || '').trim().toLowerCase()
  if (v === 'plastic_chain') return 'chain'
  if (v === 'stainless_chain') return 'stainless'
  if (v === 'cordless') return 'cordless'
  if (v === 'motorized') return 'motorized'
  const s = `${v} ${(label || '').toLowerCase()}`
  if (/motor/.test(s)) return 'motorized'
  if (/cordless|cord.?free/.test(s)) return 'cordless'
  if (/stainless|steel|metal/.test(s)) return 'stainless'
  if (/chain|bead/.test(s)) return 'chain'
  return null
}

/** Bead chain: a vertical loop of beads. */
function ChainSvg({ filled }: { filled: boolean }) {
  const beads = [6, 12, 18, 24, 30]
  return (
    <svg {...svgProps} viewBox="0 0 32 40" className="w-8 h-9 mx-auto">
      <line x1="4" y1="2" x2="28" y2="2" />
      {beads.map(y => (
        <circle key={y} cx="20" cy={y + 4} r="2.2" fill={filled ? 'currentColor' : 'none'} fillOpacity={filled ? 0.35 : 0} />
      ))}
      <path d="M20 36.5 a4 4 0 0 0 0.01 0" />
    </svg>
  )
}

/** Cordless: shade bottom bar lifted by hand — an up/down arrow, no cord. */
function CordlessSvg() {
  return (
    <svg {...svgProps} viewBox="0 0 32 40" className="w-8 h-9 mx-auto">
      <line x1="4" y1="2" x2="28" y2="2" />
      <line x1="6" y1="14" x2="26" y2="14" />
      <line x1="16" y1="20" x2="16" y2="34" />
      <path d="M12 24 l4 -4 l4 4" />
      <path d="M12 30 l4 4 l4 -4" />
    </svg>
  )
}

/** Motorized: motor tube + radio waves. */
function MotorizedSvg() {
  return (
    <svg {...svgProps} viewBox="0 0 32 40" className="w-8 h-9 mx-auto">
      <line x1="4" y1="2" x2="28" y2="2" />
      <rect x="8" y="8" width="16" height="8" rx="2" />
      <circle cx="12.5" cy="12" r="1.5" />
      <path d="M20 24 a6 6 0 0 1 0 8" />
      <path d="M23.5 21 a11 11 0 0 1 0 14" />
      <path d="M16.5 27 a2.5 2.5 0 0 1 0 2" />
    </svg>
  )
}

export function ControlCardPicker({ values, selected, onSelect }: PickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {values.map(v => {
        const isSel = selected === v.value
        const kind = controlKind(v.value, v.label)
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onSelect(v.value)}
            aria-pressed={isSel}
            className={`relative rounded-lg border px-2 py-3 text-center transition-colors ${
              isSel
                ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50 text-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {(kind === 'chain' || kind === 'stainless') && <ChainSvg filled={kind === 'stainless'} />}
            {kind === 'cordless' && <CordlessSvg />}
            {kind === 'motorized' && <MotorizedSvg />}
            {!kind && <span className="flex h-9 items-center justify-center text-gray-300 text-lg">—</span>}
            <span className="mt-1.5 block text-[11px] leading-tight">{v.label || v.value}</span>
            {kind === 'cordless' && (
              <span className="mt-1 inline-block rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                Child-safe
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ Motorized sub-options — motor / remote / hub cards in an indented panel
// ─────────────────────────────────────────────────────────────────────────────

interface MotorSubOption {
  id: string
  name: string
  label: string
  display_label?: string
  values: OptionValue[]
}

export function MotorSubPanel({ options, selected, onSelect }: {
  options: MotorSubOption[]
  selected: Record<string, string>
  onSelect: (name: string, value: string) => void
}) {
  if (options.length === 0) return null
  return (
    <div className="ml-3 border-l-2 border-gray-200 pl-4 space-y-3">
      {options.map(opt => (
        <div key={opt.id}>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">
            {opt.display_label || opt.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {opt.values.map(v => {
              const isSel = (selected[opt.name] || '') === v.value
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => onSelect(opt.name, v.value)}
                  aria-pressed={isSel}
                  className={`rounded-lg border px-3 py-2 text-xs leading-tight transition-colors ${
                    isSel
                      ? 'border-gray-900 ring-1 ring-gray-900 bg-white text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {v.label || v.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
