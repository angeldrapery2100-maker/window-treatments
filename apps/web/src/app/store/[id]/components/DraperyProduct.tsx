'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductLayout from './shared/ProductLayout'
import ImageGallery from './shared/ImageGallery'
import GalleryCards from './shared/GalleryCards'
import ProductContent from './shared/ProductContent'
import RelatedProducts from './shared/RelatedProducts'
import { useProductData } from './shared/useProductData'
import { parseConfigFromUrl } from './shared/configLink'
import CopyConfigLink from './shared/CopyConfigLink'
import SwatchCard from './shared/SwatchCard'
import { addToCart } from '@/lib/cart'

export default function DraperyProduct({ productId }: { productId: string }) {
  const router = useRouter()
  const { productName, description, mainImages, galleryImages, options, params, buildOptionValues, loading } = useProductData(productId)

  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [heightFraction, setHeightFraction] = useState('0')
  const [widthError, setWidthError] = useState('')
  const [heightError, setHeightError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calcError, setCalcError] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [addedMsg, setAddedMsg] = useState(false)

  const widthNum = parseInt(width) || 0
  const heightNum = parseInt(height) || 0
  const qtyNum = quantity

  const fractions = [
    { value: '0', label: '0' }, { value: '1/4', label: '1/4' },
    { value: '1/2', label: '1/2' }, { value: '3/4', label: '3/4' },
  ]

  // Restore dimensions/qty from a shared link (once, on mount).
  useEffect(() => {
    const c = parseConfigFromUrl()
    if (c.width) setWidth(c.width)
    if (c.height) setHeight(c.height)
    if (c.heightFraction) setHeightFraction(c.heightFraction)
    if (c.quantity) setQuantity(c.quantity)
  }, [])

  useEffect(() => {
    if (options.length > 0) {
      const defaults: Record<string, string> = {}
      options.forEach(opt => { if (opt.values?.[0]) defaults[opt.name] = opt.values[0].value })
      // Merge validated options from a shared link over the defaults.
      const urlOpts = parseConfigFromUrl().options
      options.forEach(opt => {
        const v = urlOpts[opt.name]
        if (v && opt.values?.some((o: any) => o.value === v)) defaults[opt.name] = v
      })
      setSelectedOptions(defaults)
    }
  }, [options])

  const handleWidthChange = (v: string) => {
    if (v !== '' && !/^\d+$/.test(v)) return
    setWidth(v)
    const num = parseInt(v) || 0
    setWidthError(!v ? '' : num < 12 || num > 360 ? 'Must be 12–360"' : '')
  }

  const handleHeightChange = (v: string) => {
    if (v !== '' && !/^\d+$/.test(v)) return
    setHeight(v)
    const num = parseInt(v) || 0
    setHeightError(!v ? '' : num < 12 || num > 240 ? 'Must be 12–240"' : '')
  }

  const canSubmit = widthNum >= 12 && widthNum <= 360 && heightNum >= 12 && heightNum <= 240

  useEffect(() => {
    if (!canSubmit || !width || !height || loading) { setUnitPrice(0); setCalcError(''); return }
    const optionValues = buildOptionValues()
    setIsCalculating(true)
    setCalcError('')
    fetch('/api/store/pricing/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'drapery',
        input: { width: widthNum, height: heightNum },
        baseParams: params,
        options: selectedOptions,
        optionValues,
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.result?.total != null) { setUnitPrice(d.result.total); setCalcError('') }
        else { setUnitPrice(0); setCalcError(d.error || '') }
      })
      .catch(e => { setUnitPrice(0); setCalcError(e.message) })
      .finally(() => setIsCalculating(false))
  }, [width, height, heightFraction, selectedOptions, params, loading])

  return (
    <ProductLayout productName={productName || 'Drapery'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-12 mt-4">
              <div>
                <ImageGallery mainImages={mainImages} galleryImages={[]} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 tracking-wide uppercase mb-4">
                  <a href="/store" className="hover:text-gray-700 transition-colors">Store</a>
                  <span>›</span>
                  <span className="text-gray-600">{productName || 'Drapery'}</span>
                </div>
                <h1 className="text-2xl font-light tracking-wide text-gray-900 mb-1">{productName || 'Drapery'}</h1>
                <div className="w-12 h-px bg-gray-300 mb-4" />
                {description && <p className="text-sm text-gray-500 leading-relaxed mb-6">{description}</p>}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium tracking-wider uppercase text-gray-500 mb-1.5">Width (inch) *</label>
                      <input
                        type="text" inputMode="numeric" value={width}
                        onChange={e => handleWidthChange(e.target.value)}
                        placeholder="e.g. 96"
                        className={`w-full px-3 py-2.5 border rounded text-sm focus:outline-none ${widthError ? 'border-red-400' : 'border-gray-300 focus:border-gray-800'}`}
                      />
                      {widthError && <p className="text-red-500 text-xs mt-1">{widthError}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium tracking-wider uppercase text-gray-500 mb-1.5">Height (inch) *</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text" inputMode="numeric" value={height}
                          onChange={e => handleHeightChange(e.target.value)}
                          placeholder="e.g. 100"
                          className={`flex-1 min-w-0 px-3 py-2.5 border rounded text-sm focus:outline-none ${heightError ? 'border-red-400' : 'border-gray-300 focus:border-gray-800'}`}
                        />
                        <select value={heightFraction} onChange={e => setHeightFraction(e.target.value)} className="w-16 px-1 py-2.5 border border-gray-300 rounded text-sm text-center">
                          {fractions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </div>
                      {heightError && <p className="text-red-500 text-xs mt-1">{heightError}</p>}
                    </div>
                  </div>

                  {options.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {options.map(opt => (
                        <div key={opt.id}>
                          <label className="block text-xs font-medium tracking-wider uppercase text-gray-500 mb-1.5">{opt.display_label || opt.label} *</label>
                          <select
                            value={selectedOptions[opt.name] || ''}
                            onChange={e => setSelectedOptions(prev => ({ ...prev, [opt.name]: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:border-gray-800 focus:outline-none"
                          >
                            {opt.values.map((v: any) => <option key={v.value} value={v.value}>{v.label}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium tracking-wider uppercase text-gray-500 mb-1.5">Qty *</label>
                    <select
                      value={quantity}
                      onChange={e => setQuantity(parseInt(e.target.value))}
                      className="w-24 px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-800"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="py-2 space-y-1 min-h-[48px]">
                    {isCalculating ? (
                      <p className="text-sm text-gray-400">Calculating...</p>
                    ) : calcError ? (
                      <p className="text-xs text-red-400">{calcError}</p>
                    ) : unitPrice > 0 ? (
                      <>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Unit Price</span><span className="font-medium">${Math.round(unitPrice)}</span></div>
                        <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-1 mt-1"><span>Total</span><span>${Math.round(unitPrice * qtyNum)}</span></div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Enter dimensions to see price</p>
                    )}
                  </div>

                  <div className="pt-1">
                    <button disabled={!canSubmit || unitPrice <= 0 || addedMsg}
                      onClick={() => {
                        const optionDetails = options.map(opt => {
                          const selVal = selectedOptions[opt.name]
                          const valObj = opt.values.find((v: any) => v.value === selVal)
                          return { name: opt.name, displayLabel: opt.display_label || opt.label, value: selVal || '', valueLabel: valObj?.label || selVal || '' }
                        })
                        addToCart({
                          productId, productName, productType: 'drapery',
                          mainImageUrl: mainImages[0]?.url || null,
                          width: widthNum, height: heightNum, heightFraction,
                          options: optionDetails, quantity, unitPrice: Math.round(unitPrice),
                        })
                        setAddedMsg(true)
                        setTimeout(() => setAddedMsg(false), 2000)
                      }}
                      className={`w-full py-3 text-sm font-medium tracking-widest uppercase transition-colors ${addedMsg ? 'bg-green-600 text-white' : canSubmit && unitPrice > 0 ? 'bg-[#3d3d3d] text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                      {addedMsg ? '✓ Added to Cart' : 'Add to Cart'}
                    </button>
                    <CopyConfigLink productId={productId} config={{ width, height, heightFraction, quantity, options: selectedOptions }} />
                    <SwatchCard productId={productId} productName={productName} mainImageUrl={mainImages[0]?.url || null} options={options} selectedOptions={selectedOptions} />
                    <p className="mt-3 text-center text-xs text-gray-500">
                      Doing a whole home or multiple rooms?{' '}
                      <Link href="/store/whole-home" className="text-gray-800 font-medium underline underline-offset-2 hover:text-gray-600">Talk to a designer →</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-6">
                <GalleryCards galleryImages={galleryImages} />
              </div>
            )}

            <div className="mt-12">
              <ProductContent productId={productId} productType="drapery" />
            </div>
            <RelatedProducts currentId={productId} />
          </>
        )}
      </div>
    </ProductLayout>
  )
}
