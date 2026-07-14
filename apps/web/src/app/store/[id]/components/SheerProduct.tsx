'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductLayout from './shared/ProductLayout'
import ImageGallery from './shared/ImageGallery'
import GalleryCards from './shared/GalleryCards'
import DetailCanvas from './shared/DetailCanvas'
import ProductContent from './shared/ProductContent'
import RelatedProducts from './shared/RelatedProducts'
import { useProductData } from './shared/useProductData'
import { parseConfigFromUrl } from './shared/configLink'
import CopyConfigLink from './shared/CopyConfigLink'
import SwatchCard from './shared/SwatchCard'
import DraperyCrossSell from './shared/DraperyCrossSell'
import { FabricSwatchGrid, DraperyOptionPicker, draperyPickerKind } from './shared/DraperyOptionPickers'
import StickyPriceBar from './shared/StickyPriceBar'
import TrustStrip from './shared/TrustStrip'
import { addToCart } from '@/lib/cart'

// SheerTemplate —「光」 (store redesign P4, docs/STORE-REDESIGN-BLUEPRINT.md
// §3.2②). The lightest visual treatment of the five templates: generous
// whitespace, font-light everywhere, hairline dividers, and a Day / Evening
// paired gallery when the product carries two or more main images.
//
// PRESENTATION ONLY — the pricing request, option state, and cart payload are
// byte-identical to the previous SheerProduct (incl. the legacy 3.5x mapping
// and the P3 aapp_engine pass-through). Do not change any of that here.

export default function SheerProduct({ productId }: { productId: string }) {
  const router = useRouter()
  const { productName, description, mainImages, galleryImages, detailCanvas, options, params, buildOptionValues, loading } = useProductData(productId)

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

  const fractions = [
    { value: '0', label: '0' }, { value: '1/4', label: '1/4' },
    { value: '1/2', label: '1/2' }, { value: '3/4', label: '3/4' },
  ]

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
      const urlOpts = parseConfigFromUrl().options
      options.forEach(opt => {
        const v = urlOpts[opt.name]
        if (v && opt.values?.some((o: any) => o.value === v)) defaults[opt.name] = v
      })
      setSelectedOptions(defaults)
    }
  }, [options])

  const widthNum = parseInt(width) || 0
  const heightNum = parseInt(height) || 0
  const qtyNum = quantity

  const handleWidthChange = (v: string) => {
    if (v !== '' && !/^\d+$/.test(v)) return
    setWidth(v)
    const num = parseInt(v) || 0
    setWidthError(!v ? '' : num < 12 || num > 360 ? 'Must be 12–360"' : '')
  }

  const maxHeight = params.max_height || 240

  const handleHeightChange = (v: string) => {
    if (v !== '' && !/^\d+$/.test(v)) return
    setHeight(v)
    const num = parseInt(v) || 0
    setHeightError(!v ? '' : num < 12 ? 'Must be at least 12"' : num > maxHeight ? `Max finished height is ${maxHeight}"` : '')
  }

  const canSubmit = widthNum >= 12 && widthNum <= 360 && heightNum >= 12 && heightNum <= maxHeight

  useEffect(() => {
    if (!canSubmit || !width || !height || loading) { setUnitPrice(0); setCalcError(''); return }

    const optionValues = buildOptionValues()

    // sheer engine 从 baseParams 读 sheer_unit_price / labor_per_panel
    // 后台 params 里可能存的是 fabric_price（fabric_color 的参数），需要映射
    // 同时把 fabric_color 选项对应的 fabric_price 注入到 baseParams
    // fabric_color 选项的 fabric_price 映射为 engine 需要的 sheer_unit_price
    const selectedFabricColor = selectedOptions['fabric_color']
    const fabricColorOpt = options.find((o: any) => o.name === 'fabric_color')
    const selectedFabricVal = (fabricColorOpt?.values as any[])?.find((v: any) => v.value === selectedFabricColor)
    const fabricPrice = selectedFabricVal?.params?.fabric_price ?? 0

    // AAPP migration (P3): products with params.aapp_engine pass params through
    // untouched — the calculate route's AAPP branch triggers on
    // baseParams.aapp_engine regardless of productType, and the sheer price
    // rides aapp_sheer_price_per_yard / per-color sheer_price_per_yard (in
    // optionValues), NOT the legacy sheer_unit_price mapping below.
    const baseParams = params.aapp_engine
      ? params
      : {
          ...params,
          // engine 需要 sheer_unit_price，后台按颜色存的是 fabric_price
          sheer_unit_price: params.sheer_unit_price ?? fabricPrice,
          // labor_per_panel 直接来自 params（后台计算参数里配置）
        }

    setIsCalculating(true)
    setCalcError('')
    fetch('/api/store/pricing/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'sheer',
        input: { width: widthNum, height: heightNum },
        baseParams,
        options: selectedOptions,
        optionValues,
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.result?.total != null) {
          setUnitPrice(d.result.total)
          setCalcError('')
        } else {
          setUnitPrice(0)
          setCalcError(d.error || d.details || '')
        }
      })
      .catch(e => { setUnitPrice(0); setCalcError(e.message) })
      .finally(() => setIsCalculating(false))
  }, [width, height, heightFraction, selectedOptions, params, loading])

  // Cart payload — identical to the pre-P4 inline onClick body.
  const handleAddToCart = () => {
    const optionDetails = options.map(opt => {
      const selVal = selectedOptions[opt.name]
      const valObj = opt.values.find((v: any) => v.value === selVal)
      return { name: opt.name, displayLabel: opt.display_label || opt.label, value: selVal || '', valueLabel: valObj?.label || selVal || '' }
    })
    addToCart({
      productId, productName, productType: 'sheer',
      mainImageUrl: mainImages[0]?.url || null,
      width: widthNum, height: heightNum, heightFraction,
      options: optionDetails, quantity, unitPrice: Math.round(unitPrice),
    })
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 2000)
  }

  // 「光」option routing: fabric_color → swatch grid, style / operation →
  // the shared visual pickers; anything unrecognized keeps a plain <select>.
  const visualOptions = options.filter(opt => draperyPickerKind(opt.name, opt.values))
  const selectOptions = options.filter(opt => !draperyPickerKind(opt.name, opt.values))

  // Day / Evening paired hero — only when the gallery carries ≥ 2 images.
  const dayEvening = mainImages.length >= 2

  const lightLabel = 'block text-[11px] font-light tracking-[0.18em] uppercase text-gray-400 mb-2'
  const lightInput = 'w-full px-3 py-2.5 border rounded-none text-sm font-light focus:outline-none bg-transparent'

  return (
    <ProductLayout productName={productName || 'Sheer Curtain'}>
      {/* pb-28 on mobile keeps in-flow content clear of the sticky price bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-20">
        {loading ? (
          <div className="py-24 text-center font-light text-gray-300">Loading...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mt-6">
              <div>
                {dayEvening ? (
                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1].map(i => (
                        <figure key={mainImages[i].id || i}>
                          <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={mainImages[i].url}
                              alt={`${productName || 'Sheer curtain'} — ${i === 0 ? 'day' : 'evening'}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <figcaption className="mt-2.5 text-center text-[10px] font-light uppercase tracking-[0.3em] text-gray-400">
                            {i === 0 ? 'Day' : 'Evening'}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                    {mainImages.length > 2 && (
                      <div className="mt-6">
                        <ImageGallery mainImages={mainImages.slice(2)} galleryImages={[]} />
                      </div>
                    )}
                  </div>
                ) : (
                  <ImageGallery mainImages={mainImages} galleryImages={[]} />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-[11px] font-light text-gray-300 tracking-[0.18em] uppercase mb-6">
                  <a href="/store" className="hover:text-gray-600 transition-colors">Store</a>
                  <span>›</span>
                  <span className="text-gray-500">{productName || 'Sheer Curtain'}</span>
                </div>
                <h1 className="text-3xl font-extralight tracking-wide text-gray-900 mb-3">{productName || 'Sheer Curtain'}</h1>
                <div className="w-10 h-px bg-gray-200 mb-5" />
                {description ? (
                  <p className="text-sm font-light text-gray-500 leading-relaxed mb-8">{description}</p>
                ) : (
                  <p className="text-sm font-light italic text-gray-400 tracking-wide mb-8">Soft daylight. Gentle privacy.</p>
                )}

                <div className="space-y-7">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={lightLabel}>Width (inch) *</label>
                      <input
                        type="text" inputMode="numeric" value={width}
                        onChange={e => handleWidthChange(e.target.value)}
                        placeholder="e.g. 96"
                        className={`${lightInput} ${widthError ? 'border-red-300' : 'border-gray-200 focus:border-gray-500'}`}
                      />
                      {widthError && <p className="text-red-400 text-xs font-light mt-1">{widthError}</p>}
                    </div>
                    <div>
                      <label className={lightLabel}>Height (inch) *</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text" inputMode="numeric" value={height}
                          onChange={e => handleHeightChange(e.target.value)}
                          placeholder={`e.g. 100 (max ${maxHeight}")`}
                          className={`flex-1 min-w-0 ${lightInput} ${heightError ? 'border-red-300' : 'border-gray-200 focus:border-gray-500'}`}
                        />
                        <select value={heightFraction} onChange={e => setHeightFraction(e.target.value)} className="w-16 px-1 py-2.5 border border-gray-200 rounded-none text-sm font-light text-center bg-transparent focus:outline-none focus:border-gray-500">
                          {fractions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </div>
                      {heightError && <p className="text-red-400 text-xs font-light mt-1">{heightError}</p>}
                    </div>
                  </div>

                  {visualOptions.map(opt => (
                    <div key={opt.id} className="border-t border-gray-100 pt-6">
                      <label className={lightLabel}>{opt.display_label || opt.label} *</label>
                      {draperyPickerKind(opt.name) === 'fabric' ? (
                        <FabricSwatchGrid
                          values={opt.values}
                          selected={selectedOptions[opt.name] || ''}
                          onSelect={v => setSelectedOptions(prev => ({ ...prev, [opt.name]: v }))}
                        />
                      ) : (
                        <DraperyOptionPicker
                          name={opt.name}
                          values={opt.values}
                          selected={selectedOptions[opt.name] || ''}
                          onSelect={v => setSelectedOptions(prev => ({ ...prev, [opt.name]: v }))}
                        />
                      )}
                    </div>
                  ))}

                  {selectOptions.length > 0 && (
                    <div className="grid grid-cols-2 gap-5 border-t border-gray-100 pt-6">
                      {selectOptions.map(opt => (
                        <div key={opt.id}>
                          <label className={lightLabel}>{opt.display_label || opt.label} *</label>
                          <select
                            value={selectedOptions[opt.name] || ''}
                            onChange={e => setSelectedOptions(prev => ({ ...prev, [opt.name]: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-none text-sm font-light bg-transparent focus:border-gray-500 focus:outline-none"
                          >
                            {opt.values.map((v: any) => <option key={v.value} value={v.value}>{v.label}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-6">
                    <label className={lightLabel}>Qty *</label>
                    <select
                      value={quantity}
                      onChange={e => setQuantity(parseInt(e.target.value))}
                      className="w-24 px-3 py-2.5 border border-gray-200 rounded-none text-sm font-light bg-transparent focus:outline-none focus:border-gray-500"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="py-2 space-y-1.5 min-h-[48px] border-t border-gray-100 pt-5">
                    {isCalculating ? (
                      <p className="text-sm font-light text-gray-400">Calculating...</p>
                    ) : calcError ? (
                      <p className="text-xs font-light text-red-400">{calcError}</p>
                    ) : unitPrice > 0 ? (
                      <>
                        <div className="flex justify-between text-sm font-light"><span className="text-gray-400">Unit Price</span><span className="text-gray-900">${Math.round(unitPrice)}</span></div>
                        <div className="flex justify-between text-sm border-t border-gray-100 pt-1.5 mt-1.5"><span className="font-light text-gray-500">Total</span><span className="font-medium text-gray-900">${Math.round(unitPrice * qtyNum)}</span></div>
                      </>
                    ) : (
                      <p className="text-sm font-light text-gray-400">Enter dimensions to see price</p>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      disabled={!canSubmit || unitPrice <= 0 || addedMsg}
                      onClick={handleAddToCart}
                      className={`w-full py-3.5 text-xs font-light tracking-[0.3em] uppercase transition-colors ${addedMsg ? 'bg-green-600 text-white' : canSubmit && unitPrice > 0 ? 'bg-[#3d3d3d] text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      {addedMsg ? '✓ Added to Cart' : 'Add to Cart'}
                    </button>
                    <TrustStrip />
                    <CopyConfigLink productId={productId} config={{ width, height, heightFraction, quantity, options: selectedOptions }} />
                    <SwatchCard productId={productId} productName={productName} mainImageUrl={mainImages[0]?.url || null} options={options} selectedOptions={selectedOptions} />
                    <DraperyCrossSell currentId={productId} />
                  </div>
                </div>
              </div>
            </div>

            {detailCanvas?.blocks?.length ? (
              <div className="mt-10">
                <DetailCanvas canvas={detailCanvas} />
              </div>
            ) : galleryImages.length > 0 ? (
              <div className="mt-10">
                <GalleryCards galleryImages={galleryImages} />
              </div>
            ) : null}

            <div className="mt-16">
              <ProductContent productId={productId} productType="sheer" />
            </div>
            <RelatedProducts currentId={productId} />

            <StickyPriceBar
              priceText={unitPrice > 0 ? `$${Math.round(unitPrice * qtyNum)}` : ''}
              placeholder={calcError ? 'Check your configuration' : 'Enter size to see price'}
              calculating={isCalculating}
              disabled={!canSubmit || unitPrice <= 0}
              added={addedMsg}
              onAdd={handleAddToCart}
            />
          </>
        )}
      </div>
    </ProductLayout>
  )
}
