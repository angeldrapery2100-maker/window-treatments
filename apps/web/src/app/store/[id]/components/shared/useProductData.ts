'use client'

import { useState, useEffect } from 'react'

// Draft preview passthrough (store redesign P4): when the page URL carries a
// valid ?preview=<token>, the public product API accepts it for THIS product
// even while inactive. Appending it here (and in ProductContent) is a no-op
// for normal traffic — the param is simply absent.
export function withPreviewParam(url: string): string {
  try {
    const t = new URLSearchParams(window.location.search).get('preview')
    if (t) return `${url}${url.includes('?') ? '&' : '?'}preview=${encodeURIComponent(t)}`
  } catch { /* SSR / malformed URL — ignore */ }
  return url
}

export interface MainImage { id: string; url: string; name: string; sort_order: number }
export interface GalleryImage { id: string; url: string; title: string; description: string; sort_order: number }
export interface ProductOption {
  id: string
  name: string
  label: string
  display_label: string
  type: 'select' | 'radio'
  values: { value: string; label: string; [key: string]: any }[]
}

export function useProductData(productId: string) {
  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState('')
  const [description, setDescription] = useState('')
  const [mainImages, setMainImages] = useState<MainImage[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [options, setOptions] = useState<ProductOption[]>([])
  const [params, setParams] = useState<Record<string, any>>({})
  const [detailCanvas, setDetailCanvas] = useState<any>(null)
  const [stockQty, setStockQty] = useState<number | null>(null) // null = untracked/unlimited
  const [basePrice, setBasePrice] = useState(0) // fixed-price products (accessory)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return
    // Single public endpoint — no admin auth needed, returns all sub-data at once
    fetch(withPreviewParam(`/api/store/products/${productId}`))
      .then(r => r.json())
      .then((data) => {
        if (data.success) {
          setProductName(data.data.product?.name || '')
          setProductType(data.data.product?.type || '')
          setDescription(data.data.product?.description || '')
          setMainImages(data.data.images?.main || [])
          setGalleryImages(data.data.images?.gallery || [])
          setOptions(data.data.options || [])
          setParams(data.data.params || {})
          setDetailCanvas(data.data.detail_canvas || null)
          setStockQty(data.data.product?.stock_qty ?? null)
          setBasePrice(Number(data.data.product?.base_price) || 0)
        }
      }).catch(console.error)
      .finally(() => setLoading(false))
  }, [productId])

  // 从 options 里提取 optionValues
  // 选项值的数值参数存在 v.params 里，需要展平到顶层
  const buildOptionValues = () => {
    const optionValues: Record<string, Record<string, Record<string, number>>> = {}
    options.forEach(opt => {
      const valMap: Record<string, Record<string, number>> = {}
      opt.values.forEach((v: any) => {
        const numericFields: Record<string, number> = {}
        // 从 v.params 里提取数值字段（后台保存的价格参数）
        if (v.params && typeof v.params === 'object') {
          Object.entries(v.params).forEach(([k, val]) => {
            if (typeof val === 'number') numericFields[k] = val
          })
        }
        // 兼容：顶层也提取一遍
        Object.entries(v).forEach(([k, val]) => {
          if (!['value', 'label', 'id', 'params', 'sort_order'].includes(k) && typeof val === 'number') {
            numericFields[k] = val as number
          }
        })
        // 每个 value 都放进去，即使没有数值参数（避免 engine 报 Missing optionValues）
        valMap[v.value] = numericFields
      })
      if (Object.keys(valMap).length > 0) {
        optionValues[opt.name] = valMap
      }
    })
    return optionValues
  }

  return { productName, productType, description, mainImages, galleryImages, options, params, detailCanvas, stockQty, basePrice, buildOptionValues, loading }
}
