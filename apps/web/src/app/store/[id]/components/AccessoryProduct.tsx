'use client'

// AccessoryProduct — storefront template for fixed-price SKUs (remotes, hubs,
// tiebacks, hooks). Store redesign P1, template_key = 'accessory'.
//
// Pricing: unitPrice = products.base_price, full stop. NO pricing engine and
// no /pricing/calculate round-trip — the server re-verifies at checkout via
// calcServerTotals' existing base_price>0 path (min-floor + 5× cap).
// Optional params.compare_at_price renders as a struck-through promo price.
// Optional params.related_product_ids drives the "Works with" cross-sell row.

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ProductLayout from './shared/ProductLayout'
import ImageGallery from './shared/ImageGallery'
import GalleryCards from './shared/GalleryCards'
import ProductContent from './shared/ProductContent'
import RelatedProducts from './shared/RelatedProducts'
import { useProductData } from './shared/useProductData'
import { parseConfigFromUrl } from './shared/configLink'
import CopyConfigLink from './shared/CopyConfigLink'
import { addToCart } from '@/lib/cart'

interface WorksWithProduct {
  id: string
  name: string
  type: string
  main_image_url: string | null
}

function WorksWith({ ids, currentId }: { ids: string[]; currentId: string }) {
  const [products, setProducts] = useState<WorksWithProduct[]>([])

  useEffect(() => {
    if (!ids.length) { setProducts([]); return }
    fetch('/api/store/products')
      .then(r => r.json())
      .then(d => {
        if (!d.success) return
        const byId = new Map<string, WorksWithProduct>(
          (d.data.products || []).map((p: any) => [p.id, {
            id: p.id, name: p.name, type: p.type, main_image_url: p.main_image_url || null,
          }])
        )
        // Preserve the admin's chosen order; drop inactive/unknown ids.
        setProducts(ids.map(id => byId.get(id)).filter((p): p is WorksWithProduct => !!p && p.id !== currentId))
      })
      .catch(() => setProducts([]))
  }, [JSON.stringify(ids), currentId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (products.length === 0) return null

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-light tracking-widest uppercase text-gray-800 mb-6">Works With</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <a key={p.id} href={`/store/${p.id}`} className="group block">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
              {p.main_image_url ? (
                <Image src={p.main_image_url} alt={p.name} fill sizes="(max-width: 768px) 50vw, 220px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📷</div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-800 group-hover:text-gray-600 transition-colors truncate">{p.name}</p>
            <p className="text-xs text-gray-400 capitalize">{p.type}</p>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function AccessoryProduct({ productId }: { productId: string }) {
  const { productName, description, mainImages, galleryImages, options, params, stockQty, basePrice, loading } = useProductData(productId)
  const outOfStock = stockQty === 0
  const lowStock = stockQty !== null && stockQty > 0 && stockQty <= 5

  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [addedMsg, setAddedMsg] = useState(false)

  const unitPrice = Math.round(basePrice)
  const compareAt = Number(params?.compare_at_price) || 0
  const showCompareAt = compareAt > unitPrice && unitPrice > 0
  const relatedIds: string[] = Array.isArray(params?.related_product_ids)
    ? params.related_product_ids.filter((x: any) => typeof x === 'string')
    : []

  // Default every option to its first value; honor shared-config links.
  useEffect(() => {
    if (options.length === 0) return
    const defaults: Record<string, string> = {}
    options.forEach(opt => { if (opt.values?.[0]) defaults[opt.name] = opt.values[0].value })
    const urlOpts = parseConfigFromUrl().options
    options.forEach(opt => {
      const v = urlOpts[opt.name]
      if (v && opt.values?.some((o: any) => o.value === v)) defaults[opt.name] = v
    })
    setSelectedOptions(defaults)
  }, [options])

  useEffect(() => {
    const c = parseConfigFromUrl()
    if (c.quantity) setQuantity(c.quantity)
  }, [])

  const canSubmit = unitPrice > 0 && !outOfStock

  const handleAddToCart = () => {
    const optionDetails = options
      .filter(opt => opt.values?.length > 0)
      .map(opt => {
        const selVal = selectedOptions[opt.name]
        const valObj = opt.values.find((v: any) => v.value === selVal)
        return { name: opt.name, displayLabel: opt.display_label || opt.label, value: selVal || '', valueLabel: valObj?.label || selVal || '' }
      })
    addToCart({
      productId, productName, productType: 'accessory',
      mainImageUrl: mainImages[0]?.url || null,
      options: optionDetails, quantity, unitPrice,
    })
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 2000)
  }

  return (
    <ProductLayout productName={productName || 'Accessory'}>
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
                  <span className="text-gray-600">{productName || 'Accessory'}</span>
                </div>
                <h1 className="text-2xl font-light tracking-wide text-gray-900 mb-1">{productName || 'Accessory'}</h1>
                <div className="w-12 h-px bg-gray-300 mb-4" />

                {/* Price — fixed, always visible (no configuration needed) */}
                <div className="flex items-baseline gap-2.5 mb-4">
                  <span className="text-2xl font-medium text-gray-900">${unitPrice}</span>
                  {showCompareAt && (
                    <span className="text-base text-gray-400 line-through">${Math.round(compareAt)}</span>
                  )}
                  {showCompareAt && (
                    <span className="text-xs font-medium tracking-wider uppercase text-red-600">Sale</span>
                  )}
                </div>

                {description && <p className="text-sm text-gray-500 leading-relaxed mb-6">{description}</p>}

                <div className="space-y-4">
                  {/* Variant pills (value = label single values) */}
                  {options.filter(opt => opt.values?.length > 0).map(opt => (
                    <div key={opt.id}>
                      <label className="block text-xs font-medium tracking-wider uppercase text-gray-500 mb-1.5">
                        {opt.display_label || opt.label}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((v: any) => {
                          const selected = selectedOptions[opt.name] === v.value
                          return (
                            <button key={v.value} type="button"
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: v.value }))}
                              className={`px-3.5 py-2 border rounded text-sm transition-colors ${
                                selected
                                  ? 'border-gray-800 bg-[#3d3d3d] text-white'
                                  : 'border-gray-300 text-gray-700 hover:border-gray-500'
                              }`}>
                              {v.label || v.value}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-medium tracking-wider uppercase text-gray-500 mb-1.5">Qty</label>
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

                  {quantity > 1 && unitPrice > 0 && (
                    <div className="bg-gray-50 rounded px-4 py-3 space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Unit Price</span><span className="font-medium">${unitPrice}</span></div>
                      <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-1 mt-1"><span>Total</span><span>${unitPrice * quantity}</span></div>
                    </div>
                  )}

                  {outOfStock && <p className="text-sm text-red-600">Out of stock</p>}
                  {lowStock && <p className="text-xs text-red-600">Only {stockQty} left in stock</p>}

                  <div className="pt-1">
                    <button disabled={!canSubmit || addedMsg}
                      onClick={handleAddToCart}
                      className={`w-full py-3 text-sm font-medium tracking-widest uppercase transition-colors ${
                        addedMsg ? 'bg-green-600 text-white'
                        : canSubmit ? 'bg-[#3d3d3d] text-white hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}>
                      {addedMsg ? '✓ Added to Cart' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <CopyConfigLink productId={productId} config={{ quantity, options: selectedOptions }} />
                  </div>
                </div>
              </div>
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-6">
                <GalleryCards galleryImages={galleryImages} />
              </div>
            )}

            <WorksWith ids={relatedIds} currentId={productId} />

            <div className="mt-12 border-t border-gray-200 pt-8">
              <ProductContent productId={productId} productType="accessory" />
            </div>
            <RelatedProducts currentId={productId} />
          </>
        )}
      </div>
    </ProductLayout>
  )
}
