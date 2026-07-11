'use client'

// Mobile sticky price bar (store redesign P2 — docs/STORE-REDESIGN-BLUEPRINT.md
// §3.1). Fixed to the bottom of the viewport on < md screens only: total price
// on the left, an Add to Cart button mirroring the main in-flow button's
// disabled/added state on the right. Pages that render it should add bottom
// padding (pb-28 on mobile) so in-flow content never hides behind it.
//
// Collision note: the StoreAssistant launcher normally sits at bottom-5 on
// mobile store pages — StoreAssistant lifts itself to bottom-24 on product
// pages (same pattern it already uses on /store/checkout) so it stacks above
// this bar instead of covering the button.

interface StickyPriceBarProps {
  /** Formatted total, e.g. "$660". Empty string = not priced yet. */
  priceText: string
  /** Shown (gray) when priceText is empty. */
  placeholder?: string
  /** True while a server price calculation is in flight. */
  calculating?: boolean
  disabled: boolean
  added: boolean
  onAdd: () => void
  addLabel?: string
}

export default function StickyPriceBar({
  priceText,
  placeholder = 'Enter size to see price',
  calculating = false,
  disabled,
  added,
  onAdd,
  addLabel = 'Add to Cart',
}: StickyPriceBarProps) {
  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex-1 min-w-0">
          {calculating ? (
            <p className="text-sm text-gray-400">Calculating…</p>
          ) : priceText ? (
            <>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 leading-none mb-0.5">Total</p>
              <p className="text-lg font-semibold text-gray-900 leading-tight truncate">{priceText}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 leading-snug">{placeholder}</p>
          )}
        </div>
        <button
          type="button"
          disabled={disabled || added}
          onClick={onAdd}
          className={`shrink-0 px-6 py-3 text-xs font-medium tracking-widest uppercase transition-colors ${
            added
              ? 'bg-green-600 text-white'
              : !disabled
                ? 'bg-[#3d3d3d] text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {added ? '✓ Added' : addLabel}
        </button>
      </div>
    </div>
  )
}
