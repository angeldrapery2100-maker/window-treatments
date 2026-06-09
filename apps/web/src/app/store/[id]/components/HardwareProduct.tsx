'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductLayout from './shared/ProductLayout'
import ImageGallery from './shared/ImageGallery'
import GalleryCards from './shared/GalleryCards'
import ProductContent from './shared/ProductContent'
import RelatedProducts from './shared/RelatedProducts'
import { useProductData } from './shared/useProductData'
import { parseConfigFromUrl } from './shared/configLink'
import CopyConfigLink from './shared/CopyConfigLink'
import { addToCart } from '@/lib/cart'

export default function HardwareProduct({ productId }: { productId: string }) {
  const router = useRouter()
  const { productName, mainImages, galleryImages, options, params, loading } = useProductData(productId)

  const [width, setWidth] = useState<number | ''>('')
  const [widthFraction, setWidthFraction] = useState('0')
  const [widthError, setWidthError] = useState('')
  const [quantity, setQuantity] = useState(1) // 1-10 select
  const [unitPrice, setUnitPrice] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [addedMsg, setAddedMsg] = useState(false)

  const fractions = [
    { value: '0', label: '0' }, { value: '1/4', label: '1/4' },
    { value: '1/2', label: '1/2' }, { value: '3/4', label: '3/4' },
  ]

  const parseFraction = (f: string) =>
    ({ '0': 0, '1/4': 0.25, '1/2': 0.5, '3/4': 0.75 }[f] ?? 0)

  useEffect(() => {
    const c = parseConfigFromUrl()
    if (c.width) setWidth(parseInt(c.width, 10) || '')
    if (c.widthFraction) setWidthFraction(c.widthFraction)
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

  const handleWidthChange = (v: string) => {
    if (v !== '' && !/^\d+$/.test(v)) return
    const num = parseInt(v) || 0
    setWidth(num)
    setWidthError(!v ? 'Required' : num < 20 || num > 192 ? 'Must be 20–192"' : '')
  }

  const totalWidth = (typeof width === 'number' ? width : 0) + parseFraction(widthFraction)
  const canSubmit = () => typeof width === 'number' && width >= 20 && totalWidth <= 192

  useEffect(() => {
    if (!canSubmit()) { setUnitPrice(0); return }

    // fixed_price 来自计算参数（全局）
    // price_per_foot 来自 rod 选项
    // finial_price 来自 finial 选项
    // 颜色选项不参与计算
    const rodOpt = options.find(o => o.name === 'rod')
    const rod = rodOpt?.values.find(v => v.value === selectedOptions['rod'])
    const finialOpt = options.find(o => o.name === 'finial')
    const finial = finialOpt?.values.find(v => v.value === selectedOptions['finial'])

    const fixedPrice = rod?.params?.fixed_price ?? 0
    const baseLength = params.base_length ?? 48
    const finialPrice = finial?.params?.finial_price ?? 0
    const pricePerFoot = rod?.params?.price_per_foot ?? 0

    // 超出基础长度的部分，不足一尺按一尺算
    const extraInches = Math.max(0, totalWidth - baseLength)
    const extraFeet = Math.ceil(extraInches / 12)

    setUnitPrice(fixedPrice + finialPrice + extraFeet * pricePerFoot)
  }, [width, widthFraction, selectedOptions, options, params])

  const finialOpt = options.find(o => o.name === 'finial')
  const currentFinial = finialOpt?.values.find(v => v.value === selectedOptions['finial'])
  const finialLength = currentFinial?.params?.finial_length ?? 0

  return (
    <ProductLayout productName={productName || 'Curtain Rod'}>
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
                  <span className="text-gray-600">{productName || 'Curtain Rod'}</span>
                </div>
                <h1 className="text-2xl font-light tracking-wide text-gray-900 mb-1">{productName || 'Curtain Rod'}</h1>
                <div className="w-12 h-px bg-gray-300 mb-4" />
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  Premium curtain rods with your choice of finial and finish. Custom cut to your exact width.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium tracking-wider uppercase text-gray-500 mb-1.5">Width (inch) *</label>
                    <div className="flex gap-1.5">
                      <input type="text" inputMode="numeric" value={width || ''} onChange={e => handleWidthChange(e.target.value)} placeholder="20–192"
                        className={`flex-1 min-w-0 px-3 py-2.5 border rounded text-sm focus:outline-none ${widthError ? 'border-red-400' : 'border-gray-300 focus:border-gray-800'}`} />
                      <select value={widthFraction} onChange={e => setWidthFraction(e.target.value)} className="w-16 px-1 py-2.5 border border-gray-300 rounded text-sm text-center">
                        {fractions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                    {widthError && <p className="text-red-500 text-xs mt-1">{widthError}</p>}
                  </div>

                  {options.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {options.map(opt => (
                        <div key={opt.id}>
                          <label className="block text-xs font-medium tracking-wider uppercase text-gray-500 mb-1.5">{opt.display_label || opt.label} *</label>
                          <select value={selectedOptions[opt.name] || ''} onChange={e => setSelectedOptions(prev => ({ ...prev, [opt.name]: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:border-gray-800 focus:outline-none">
                            {opt.values.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
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

                  {canSubmit() && (
                    <div className="bg-gray-50 rounded px-4 py-3 space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Unit Price</span><span className="font-medium">${Math.round(unitPrice)}</span></div>
                      <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-1 mt-1"><span>Total</span><span>${Math.round(unitPrice * quantity)}</span></div>
                    </div>
                  )}

                  <div className="pt-1">
                    <button disabled={!canSubmit() || unitPrice <= 0 || addedMsg}
                      onClick={() => {
                        const optionDetails = options.map(opt => {
                          const selVal = selectedOptions[opt.name]
                          const valObj = opt.values.find((v: any) => v.value === selVal)
                          return { name: opt.name, displayLabel: opt.display_label || opt.label, value: selVal || '', valueLabel: valObj?.label || selVal || '' }
                        })
                        addToCart({
                          productId, productName, productType: 'hardware',
                          mainImageUrl: mainImages[0]?.url || null,
                          width: typeof width === 'number' ? width : undefined, widthFraction,
                          options: optionDetails, quantity, unitPrice: Math.round(unitPrice),
                        })
                        setAddedMsg(true)
                        setTimeout(() => setAddedMsg(false), 2000)
                      }}
                      className={`w-full py-3 text-sm font-medium tracking-widest uppercase transition-colors ${addedMsg ? 'bg-green-600 text-white' : canSubmit() && unitPrice > 0 ? 'bg-[#3d3d3d] text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>{addedMsg ? '✓ Added to Cart' : 'Add to Cart'}</button>
                    <CopyConfigLink productId={productId} config={{ width: typeof width === 'number' ? String(width) : '', widthFraction, quantity, options: selectedOptions }} />
                  </div>
                </div>
              </div>
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-6">
                <GalleryCards galleryImages={galleryImages} />
              </div>
            )}

            <div className="mt-12 border-t border-gray-200 pt-8">
              <ProductContent productId={productId} productType="hardware" />
            </div>
            <RelatedProducts currentId={productId} />
          </>
        )}
      </div>
    </ProductLayout>
  )
}
