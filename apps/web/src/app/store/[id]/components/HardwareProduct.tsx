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
import StickyPriceBar from './shared/StickyPriceBar'
import TrustStrip from './shared/TrustStrip'
import { addToCart } from '@/lib/cart'

// Hardware template 「五金精品」 (store redesign P3 — docs/STORE-REDESIGN-
// BLUEPRINT.md §3.2③). Dark premium treatment for the CONFIGURATOR COLUMN only
// (the page shell stays the standard store chrome): metallic circular finish
// swatches (switching the gallery image when the value carries image_url), a
// horizontal finial image-card strip, and length preset chips.
// PRESENTATION ONLY — the price formula and cart payload are byte-identical to
// the previous <select>-based template.

// ── Finish swatch helpers ────────────────────────────────────────────────────

/** Metallic-look CSS gradient keyed by common finish names; neutral fallback. */
function finishGradient(value: string, label?: string): string {
  const s = `${value} ${label || ''}`.toLowerCase()
  if (/black|matte\s*noir|onyx/.test(s)) return 'linear-gradient(135deg,#4a4a4a 0%,#111 60%,#2e2e2e 100%)'
  if (/bronze|copper|rust/.test(s)) return 'linear-gradient(135deg,#c08a5a 0%,#5c3a21 60%,#8a5c33 100%)'
  if (/brass|gold/.test(s)) return 'linear-gradient(135deg,#f0d99a 0%,#a67c28 60%,#d4af5e 100%)'
  if (/nickel|silver|satin|pewter/.test(s)) return 'linear-gradient(135deg,#f2f2f2 0%,#9fa4ab 60%,#c9cdd3 100%)'
  if (/chrome|steel|stainless/.test(s)) return 'linear-gradient(135deg,#fbfbfb 0%,#8e959e 55%,#dfe3e8 100%)'
  if (/white|ivory|cream/.test(s)) return 'linear-gradient(135deg,#ffffff 0%,#d8d8d8 70%,#f0f0f0 100%)'
  return 'linear-gradient(135deg,#d6d6d6 0%,#8a8a8a 60%,#bdbdbd 100%)'
}

function valueImage(v: any): string | null {
  if (typeof v?.image_url === 'string' && v.image_url) return v.image_url
  if (v?.params && typeof v.params.image_url === 'string' && v.params.image_url) return v.params.image_url
  return null
}

function isFinishOption(name: string): boolean {
  const n = (name || '').toLowerCase()
  return n === 'color' || n === 'finish' || n.includes('finish')
}

const LENGTH_PRESETS = [48, 72, 96, 120, 144]

export default function HardwareProduct({ productId }: { productId: string }) {
  const router = useRouter()
  const { productName, mainImages, galleryImages, options, params, stockQty, loading } = useProductData(productId)
  const outOfStock = stockQty === 0
  const lowStock = stockQty !== null && stockQty > 0 && stockQty <= 5

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

  const handleAddToCart = () => {
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
  }

  // ── Option grouping (presentation only) ──────────────────────────────────
  const finishOptions = options.filter(o => isFinishOption(o.name))
  const finialOptions = options.filter(o => o.name === 'finial')
  const selectOptions = options.filter(o => !isFinishOption(o.name) && o.name !== 'finial')

  // Selected finish value with an image switches the main gallery image:
  // prepend it and remount the gallery (key) so it shows immediately.
  const selectedFinishImage = (() => {
    for (const opt of finishOptions) {
      const v = opt.values.find((x: any) => x.value === selectedOptions[opt.name])
      const img = v ? valueImage(v) : null
      if (img) return { url: img, name: v?.label || '' }
    }
    return null
  })()
  const displayImages = selectedFinishImage
    ? [{ id: '__finish', url: selectedFinishImage.url, name: selectedFinishImage.name, sort_order: -1 }, ...mainImages]
    : mainImages

  const darkLabel = 'block text-xs font-medium tracking-wider uppercase text-gray-400 mb-1.5'
  const darkSelect = 'w-full px-3 py-2.5 rounded text-sm bg-[#262b33] border border-white/15 text-white focus:border-white/40 focus:outline-none'

  return (
    <ProductLayout productName={productName || 'Curtain Rod'}>
      {/* pb-28 on mobile keeps in-flow content clear of the sticky price bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-16">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-12 mt-4">
              <div>
                <ImageGallery key={selectedFinishImage?.url || 'default'} mainImages={displayImages} galleryImages={[]} />
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

                {/* ── Dark premium configurator panel ── */}
                <div className="rounded-xl bg-[#1b1e24] p-5 text-white space-y-5">
                  {/* Finish — circular metallic swatches */}
                  {finishOptions.map(opt => {
                    const sel = selectedOptions[opt.name] || ''
                    const selObj = opt.values.find((v: any) => v.value === sel)
                    return (
                      <div key={opt.id}>
                        <label className={darkLabel}>
                          {opt.display_label || opt.label} *
                          {selObj && <span className="ml-2 normal-case tracking-normal text-gray-300">{selObj.label || selObj.value}</span>}
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {opt.values.map((v: any) => {
                            const isSel = sel === v.value
                            const img = valueImage(v)
                            return (
                              <button
                                key={v.value}
                                type="button"
                                onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: v.value }))}
                                aria-pressed={isSel}
                                title={v.label || v.value}
                                className={`h-10 w-10 rounded-full overflow-hidden transition-shadow ${
                                  isSel ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1b1e24]' : 'ring-1 ring-white/25 hover:ring-white/60'
                                }`}
                                style={img ? undefined : { background: finishGradient(v.value, v.label) }}
                              >
                                {img && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={img} alt={v.label || v.value} className="h-full w-full object-cover" loading="lazy" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {/* Finial — horizontal image-card strip */}
                  {finialOptions.map(opt => (
                    <div key={opt.id}>
                      <label className={darkLabel}>{opt.display_label || opt.label} *</label>
                      <div className="flex gap-2 overflow-x-auto pb-1 -mr-1">
                        {opt.values.map((v: any) => {
                          const isSel = (selectedOptions[opt.name] || '') === v.value
                          const img = valueImage(v)
                          return (
                            <button
                              key={v.value}
                              type="button"
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: v.value }))}
                              aria-pressed={isSel}
                              className={`shrink-0 w-24 rounded-lg border p-2 text-center transition-colors ${
                                isSel ? 'border-white bg-white/10 text-white' : 'border-white/15 text-gray-300 hover:border-white/45'
                              }`}
                            >
                              {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={img} alt={v.label || v.value} className="h-14 w-full object-cover rounded" loading="lazy" />
                              ) : (
                                <span className="flex h-14 w-full items-center justify-center rounded bg-white/5 text-white/30 text-xl">◆</span>
                              )}
                              <span className="mt-1.5 block text-[10px] leading-tight">{v.label || v.value}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Length + quick presets */}
                  <div>
                    <label className={darkLabel}>Width (inch) *</label>
                    <div className="flex gap-1.5">
                      <input type="text" inputMode="numeric" value={width || ''} onChange={e => handleWidthChange(e.target.value)} placeholder="20–192"
                        className={`flex-1 min-w-0 px-3 py-2.5 rounded text-sm bg-[#262b33] text-white placeholder-gray-500 border focus:outline-none ${widthError ? 'border-red-400' : 'border-white/15 focus:border-white/40'}`} />
                      <select value={widthFraction} onChange={e => setWidthFraction(e.target.value)} className="w-16 px-1 py-2.5 rounded text-sm text-center bg-[#262b33] border border-white/15 text-white focus:outline-none">
                        {fractions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                    {widthError && <p className="text-red-400 text-xs mt-1">{widthError}</p>}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {LENGTH_PRESETS.map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleWidthChange(String(n))}
                          className={`rounded-full px-3 py-1 text-[11px] transition-colors ${
                            width === n ? 'bg-white text-gray-900' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {n}&Prime;
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Remaining options (rod profile, …) keep <select>s */}
                  {selectOptions.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectOptions.map(opt => (
                        <div key={opt.id}>
                          <label className={darkLabel}>{opt.display_label || opt.label} *</label>
                          <select value={selectedOptions[opt.name] || ''} onChange={e => setSelectedOptions(prev => ({ ...prev, [opt.name]: e.target.value }))}
                            className={darkSelect}>
                            {opt.values.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className={darkLabel}>Qty *</label>
                    <select
                      value={quantity}
                      onChange={e => setQuantity(parseInt(e.target.value))}
                      className="w-24 px-3 py-2.5 rounded text-sm bg-[#262b33] border border-white/15 text-white focus:outline-none focus:border-white/40"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <p className="text-[11px] text-gray-400">Pairs with pinch pleat &amp; ripplefold drapery.</p>

                  {canSubmit() && (
                    <div className="rounded-lg bg-white/5 px-4 py-3 space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-gray-400">Unit Price</span><span className="font-medium">${Math.round(unitPrice)}</span></div>
                      <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-1 mt-1"><span>Total</span><span>${Math.round(unitPrice * quantity)}</span></div>
                    </div>
                  )}

                  {outOfStock && (
                    <p className="text-sm text-red-400">Out of stock</p>
                  )}
                  {lowStock && (
                    <p className="text-xs text-red-400">Only {stockQty} left in stock</p>
                  )}

                  <div className="pt-1">
                    <button disabled={!canSubmit() || unitPrice <= 0 || addedMsg || outOfStock}
                      onClick={handleAddToCart}
                      className={`w-full py-3 text-sm font-medium tracking-widest uppercase transition-colors ${addedMsg ? 'bg-green-600 text-white' : canSubmit() && unitPrice > 0 && !outOfStock ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}>{addedMsg ? '✓ Added to Cart' : outOfStock ? 'Out of Stock' : 'Add to Cart'}</button>
                    <TrustStrip />
                  </div>
                </div>

                {/* Light shell below the dark panel */}
                <CopyConfigLink productId={productId} config={{ width: typeof width === 'number' ? String(width) : '', widthFraction, quantity, options: selectedOptions }} />
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

            <StickyPriceBar
              priceText={canSubmit() && unitPrice > 0 ? `$${Math.round(unitPrice * quantity)}` : ''}
              placeholder={outOfStock ? 'Out of stock' : 'Enter width to see price'}
              disabled={!canSubmit() || unitPrice <= 0 || outOfStock}
              added={addedMsg}
              onAdd={handleAddToCart}
            />
          </>
        )}
      </div>
    </ProductLayout>
  )
}
