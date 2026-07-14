'use client'

// Visual option pickers for the drapery / sheer templates.
//
// v4 redesign (2026-07-13, Eddie's spec): the ONLY visual picker left is the
// fabric-color swatch grid. Pleat style, lining and operation all render as
// full-width <select> dropdowns (one per row, equal width) in the page's
// select fallback. The selected pleat style's showcase image is displayed in
// the LEFT main gallery stage (ImageGallery's styleImage slot) — sourced from
// the style value's image_url / params.image_url, uploaded in the admin
// 计算参数 → 款式提供 card.
//
// PRESENTATION ONLY. Every picker derives purely from the product's options
// array and writes the exact same selectedOptions[name] = value strings the
// old <select>s did — pricing, cart payloads, and shared-config links are
// untouched.

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

export type DraperyPickerKind = 'fabric'

export function draperyPickerKind(name: string, _values?: OptionValue[]): DraperyPickerKind | null {
  const n = (name || '').toLowerCase()
  if (n === 'fabric_color' || n === 'fabric') return 'fabric'
  return null
}

/** Image attached to an option value: top-level image_url or params.image_url
 *  (OptionsManager stores free-form value params; the public product API
 *  passes values through verbatim). */
export function swatchImage(v: OptionValue | undefined | null): string | null {
  if (!v) return null
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

/** Dispatcher — fabric gets the swatch grid; everything else returns null so
 *  the caller renders its standard <select> row. */
export function DraperyOptionPicker({ name, values, selected, onSelect }: PickerProps & { name: string }) {
  const kind = draperyPickerKind(name, values)
  if (!kind || !values || values.length === 0) return null
  return <FabricSwatchGrid values={values} selected={selected} onSelect={onSelect} />
}
