'use client'

// Visual option pickers for the drapery template (store redesign P2 —
// 「面料剧场」, docs/STORE-REDESIGN-BLUEPRINT.md §3.2①).
//
// PRESENTATION ONLY. Every picker derives purely from the product's options
// array and writes the exact same selectedOptions[name] = value strings the
// old <select>s did — pricing, cart payloads, and shared-config links are
// untouched. Value keys drive the SVG/icon choice; unrecognized values (old
// hand-typed products) fall back to plain text cards so legacy drapery
// products keep working.
//
// Swatch image sourcing: an option value may carry `image_url` at the top
// level or inside `params.image_url` (OptionsManager stores free-form value
// params; the public product API passes values through verbatim). No image →
// neutral fabric tile with the color name.

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

export type DraperyPickerKind = 'fabric' | 'style' | 'lining' | 'operation'

export function draperyPickerKind(name: string): DraperyPickerKind | null {
  const n = (name || '').toLowerCase()
  if (n === 'fabric_color' || n === 'fabric') return 'fabric'
  if (n === 'style' || n === 'pleat_style') return 'style'
  if (n === 'lining') return 'lining'
  if (n === 'operation') return 'operation'
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// ① Fabric color — swatch grid
// ─────────────────────────────────────────────────────────────────────────────

function swatchImage(v: OptionValue): string | null {
  if (typeof v.image_url === 'string' && v.image_url) return v.image_url
  if (v.params && typeof v.params.image_url === 'string' && v.params.image_url) return v.params.image_url
  return null
}

export function FabricSwatchGrid({ values, selected, onSelect }: PickerProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-2 gap-y-3">
      {values.map(v => {
        const isSel = selected === v.value
        const img = swatchImage(v)
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onSelect(v.value)}
            aria-pressed={isSel}
            title={v.label || v.value}
            className="group text-center focus:outline-none"
          >
            <span
              className={`block aspect-square w-full rounded overflow-hidden transition-shadow ${
                isSel ? 'ring-2 ring-gray-900 ring-offset-1' : 'ring-1 ring-gray-200 group-hover:ring-gray-400'
              }`}
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={v.label || v.value} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="flex w-full h-full items-center justify-center bg-[#f4f1ec] px-1">
                  <span className="text-[10px] leading-tight text-gray-500 break-words">{v.label || v.value}</span>
                </span>
              )}
            </span>
            <span className={`mt-1 block text-[11px] leading-tight truncate ${isSel ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {v.label || v.value}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ② Style — clean text cards (the line-art pleat diagrams were removed
//    2026-07-13 at Eddie's request: hand-drawn SVGs couldn't represent the
//    real pleat construction faithfully. Photography belongs in the product
//    gallery/description; the picker just needs clear labels.)
// ─────────────────────────────────────────────────────────────────────────────

const svgProps = {
  viewBox: '0 0 72 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

export function StyleCardPicker({ values, selected, onSelect }: PickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {values.map(v => {
        const isSel = selected === v.value
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onSelect(v.value)}
            aria-pressed={isSel}
            className={`rounded border px-2.5 py-3.5 text-center transition-colors ${
              isSel
                ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50 text-gray-900 font-medium'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            <span className="block text-xs leading-snug">{v.label || v.value}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ Lining — three icon cards (sun / half sun / moon)
// ─────────────────────────────────────────────────────────────────────────────

type LiningKind = 'NO' | 'LF' | 'BO'

export function liningKind(value: string, label?: string): LiningKind | null {
  const v = (value || '').trim().toUpperCase()
  if (v === 'NO' || v === 'LF' || v === 'BO') return v as LiningKind
  const s = `${value} ${label || ''}`.toLowerCase()
  if (/black\s*out|room.?darken|full.?block/.test(s)) return 'BO'
  if (/light\s*filter|privacy|soft/.test(s)) return 'LF'
  if (/\bno\b|none|unlined|without/.test(s)) return 'NO'
  return null
}

const LINING_BENEFIT: Record<LiningKind, string> = {
  NO: 'Light & airy',
  LF: 'Softens light',
  BO: 'Room-darkening',
}

function SunIcon() {
  return (
    <svg {...svgProps} viewBox="0 0 32 32" className="w-8 h-8 mx-auto">
      <circle cx="16" cy="16" r="6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const r = (a * Math.PI) / 180
        return (
          <line
            key={a}
            x1={16 + Math.cos(r) * 9} y1={16 + Math.sin(r) * 9}
            x2={16 + Math.cos(r) * 12.5} y2={16 + Math.sin(r) * 12.5}
          />
        )
      })}
    </svg>
  )
}

function HalfSunIcon() {
  return (
    <svg {...svgProps} viewBox="0 0 32 32" className="w-8 h-8 mx-auto">
      <line x1="4" y1="21" x2="28" y2="21" />
      <path d="M10 21 a6 6 0 0 1 12 0" />
      {[210, 250, 290, 330].map(a => {
        const r = ((a - 90) * Math.PI) / 180
        return (
          <line
            key={a}
            x1={16 + Math.cos(r) * 9} y1={21 + Math.sin(r) * 9}
            x2={16 + Math.cos(r) * 12.5} y2={21 + Math.sin(r) * 12.5}
          />
        )
      })}
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg {...svgProps} viewBox="0 0 32 32" className="w-8 h-8 mx-auto">
      <path d="M21 6 a11 11 0 1 0 5 15 a9 9 0 0 1 -5 -15 z" />
    </svg>
  )
}

export function LiningCardPicker({ values, selected, onSelect }: PickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {values.map(v => {
        const isSel = selected === v.value
        const kind = liningKind(v.value, v.label)
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onSelect(v.value)}
            aria-pressed={isSel}
            className={`rounded border px-2 py-3 text-center transition-colors ${
              isSel
                ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50 text-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {kind === 'NO' && <SunIcon />}
            {kind === 'LF' && <HalfSunIcon />}
            {kind === 'BO' && <MoonIcon />}
            <span className="mt-1.5 block text-[11px] font-medium leading-tight">{v.label || v.value}</span>
            {kind && <span className="mt-0.5 block text-[10px] text-gray-400 leading-tight">{LINING_BENEFIT[kind]}</span>}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ Operation — segmented control with tiny panel diagrams
// ─────────────────────────────────────────────────────────────────────────────

type OperationKind = 'split' | 'left' | 'right'

export function operationKind(value: string, label?: string): OperationKind | null {
  const v = (value || '').trim().toLowerCase()
  if (v === 'split') return 'split'
  if (v === 'single_left') return 'left'
  if (v === 'single_right') return 'right'
  const s = `${v} ${(label || '').toLowerCase()}`
  if (/split|center|pair|both/.test(s)) return 'split'
  if (/left/.test(s)) return 'left'
  if (/right/.test(s)) return 'right'
  return null
}

function PanelIcon({ kind }: { kind: OperationKind }) {
  return (
    <svg {...svgProps} viewBox="0 0 28 20" strokeWidth={1.3} className="w-7 h-5 mx-auto">
      <rect x="1.5" y="1.5" width="25" height="17" rx="1" />
      {kind === 'split' && (
        <>
          <rect x="3.5" y="3.5" width="6" height="13" fill="currentColor" fillOpacity="0.25" stroke="none" />
          <rect x="18.5" y="3.5" width="6" height="13" fill="currentColor" fillOpacity="0.25" stroke="none" />
          <line x1="3.5" y1="3.5" x2="3.5" y2="16.5" /><line x1="6.5" y1="3.5" x2="6.5" y2="16.5" /><line x1="9.5" y1="3.5" x2="9.5" y2="16.5" />
          <line x1="18.5" y1="3.5" x2="18.5" y2="16.5" /><line x1="21.5" y1="3.5" x2="21.5" y2="16.5" /><line x1="24.5" y1="3.5" x2="24.5" y2="16.5" />
        </>
      )}
      {kind === 'left' && (
        <>
          <rect x="3.5" y="3.5" width="8" height="13" fill="currentColor" fillOpacity="0.25" stroke="none" />
          <line x1="3.5" y1="3.5" x2="3.5" y2="16.5" /><line x1="6.5" y1="3.5" x2="6.5" y2="16.5" /><line x1="9.5" y1="3.5" x2="9.5" y2="16.5" />
        </>
      )}
      {kind === 'right' && (
        <>
          <rect x="16.5" y="3.5" width="8" height="13" fill="currentColor" fillOpacity="0.25" stroke="none" />
          <line x1="18.5" y1="3.5" x2="18.5" y2="16.5" /><line x1="21.5" y1="3.5" x2="21.5" y2="16.5" /><line x1="24.5" y1="3.5" x2="24.5" y2="16.5" />
        </>
      )}
    </svg>
  )
}

export function OperationSegment({ values, selected, onSelect }: PickerProps) {
  return (
    <div className="flex rounded border border-gray-300 overflow-hidden divide-x divide-gray-300">
      {values.map(v => {
        const isSel = selected === v.value
        const kind = operationKind(v.value, v.label)
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onSelect(v.value)}
            aria-pressed={isSel}
            className={`flex-1 px-1 py-2 text-center transition-colors ${
              isSel ? 'bg-[#3d3d3d] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {kind && <PanelIcon kind={kind} />}
            <span className="mt-0.5 block text-[10px] leading-tight">{v.label || v.value}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Dispatcher — returns the visual picker for an option, or null (caller
// renders its existing <select> fallback).
// ─────────────────────────────────────────────────────────────────────────────

export function DraperyOptionPicker({ name, values, selected, onSelect }: PickerProps & { name: string }) {
  const kind = draperyPickerKind(name)
  if (!kind || !values || values.length === 0) return null
  if (kind === 'fabric') return <FabricSwatchGrid values={values} selected={selected} onSelect={onSelect} />
  if (kind === 'style') return <StyleCardPicker values={values} selected={selected} onSelect={onSelect} />
  if (kind === 'lining') return <LiningCardPicker values={values} selected={selected} onSelect={onSelect} />
  return <OperationSegment values={values} selected={selected} onSelect={onSelect} />
}
