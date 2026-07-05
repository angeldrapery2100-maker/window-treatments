'use client'

import { useState } from 'react'
import { addSwatchToCart, MAX_SWATCHES_PER_ORDER, type CartItemOption } from '@/lib/cart'

// "Order a free fabric swatch" card shown on fabric-based configurators
// (drapery / sheer / shade). Adds a $0 swatch line for the currently selected
// fabric to the cart — max MAX_SWATCHES_PER_ORDER per order, deduped per
// product+fabric. Server re-verifies both rules (lib/orderPricing.ts).
interface Props {
  productId: string
  productName: string
  mainImageUrl: string | null
  /** Product options config (from useProductData). */
  options: any[]
  /** Currently selected option values keyed by option name. */
  selectedOptions: Record<string, string>
}

export default function SwatchCard({ productId, productName, mainImageUrl, options, selectedOptions }: Props) {
  const [status, setStatus] = useState<'idle' | 'added' | 'duplicate' | 'limit'>('idle')

  // The swatch follows the fabric-ish option if the product has one.
  const fabricOpt = options.find(o => typeof o?.name === 'string' && o.name.toLowerCase().includes('fabric'))
  const selValue = fabricOpt ? selectedOptions[fabricOpt.name] || fabricOpt.values?.[0]?.value || '' : ''
  const selLabel = fabricOpt ? (fabricOpt.values?.find((v: any) => v.value === selValue)?.label || selValue) : ''

  const handleAdd = () => {
    const fabricOption: CartItemOption | null = fabricOpt
      ? { name: fabricOpt.name, displayLabel: fabricOpt.display_label || fabricOpt.label || 'Fabric', value: selValue, valueLabel: selLabel }
      : null
    const result = addSwatchToCart({ productId, productName, mainImageUrl, fabricOption })
    setStatus(result)
    if (result === 'added') setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <div className="mt-4 border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Free Fabric Swatch
            {selLabel ? <span className="text-gray-500 font-normal"> — {selLabel}</span> : null}
          </p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            See and feel the real fabric before you order. Swatches are free — just pay shipping
            (from $2.99, or 2-3 day expedited). Up to {MAX_SWATCHES_PER_ORDER} per order.
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={status === 'added'}
          className={`shrink-0 px-4 py-2 text-xs font-medium tracking-wider uppercase rounded transition-colors ${
            status === 'added'
              ? 'bg-green-600 text-white'
              : 'border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {status === 'added' ? '✓ Added' : 'Add Swatch'}
        </button>
      </div>
      {status === 'duplicate' && (
        <p className="text-xs text-amber-600 mt-2">This swatch is already in your cart.</p>
      )}
      {status === 'limit' && (
        <p className="text-xs text-amber-600 mt-2">Swatch limit reached ({MAX_SWATCHES_PER_ORDER} per order).</p>
      )}
    </div>
  )
}
