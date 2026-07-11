'use client'

import { useState, useEffect } from 'react'
import DraperyProduct from './components/DraperyProduct'
import SheerProduct from './components/SheerProduct'
import ShadeProduct from './components/ShadeProduct'
import HardwareProduct from './components/HardwareProduct'
import AccessoryProduct from './components/AccessoryProduct'

// Interactive part of the store product page. The server wrapper (page.tsx)
// provides metadata + JSON-LD and passes the product type / template key it
// already fetched, so we skip the extra round-trip unless they're unknown.
//
// Template dispatch (store redesign P1): products.template_key picks the
// storefront template FIRST; products without one (all pre-P1 products) fall
// back to the legacy type-based mapping — zero behavior change for them.
const TEMPLATE_COMPONENTS: Record<string, (props: { productId: string }) => React.JSX.Element> = {
  drapery:   DraperyProduct,
  sheer:     SheerProduct,
  luma:      ShadeProduct,
  hardware:  HardwareProduct,
  accessory: AccessoryProduct,
}

const TYPE_COMPONENTS: Record<string, (props: { productId: string }) => React.JSX.Element> = {
  drapery:   DraperyProduct,
  sheer:     SheerProduct,
  shade:     ShadeProduct,
  hardware:  HardwareProduct,
  accessory: AccessoryProduct,
}

export default function StoreProductClient({ id, initialType, initialTemplateKey }: {
  id: string
  initialType: string | null
  initialTemplateKey?: string | null
}) {
  const [productType, setProductType] = useState<string | null>(initialType)
  const [templateKey, setTemplateKey] = useState<string | null>(initialTemplateKey ?? null)
  const [loading, setLoading] = useState(initialType === null)

  // Record browsing history
  useEffect(() => {
    try {
      const key = 'store_recently_viewed'
      const recent: string[] = JSON.parse(localStorage.getItem(key) || '[]')
      const updated = [id, ...recent.filter(x => x !== id)].slice(0, 20)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch {}
  }, [id])

  // Fallback: if the server couldn't resolve the type (e.g. DB hiccup), try client-side.
  useEffect(() => {
    if (initialType !== null) return
    fetch(`/api/store/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setProductType(data.data.product?.type || null)
          setTemplateKey(data.data.product?.template_key || null)
        }
      })
      .catch(() => setProductType(null))
      .finally(() => setLoading(false))
  }, [id, initialType])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    )
  }

  if (!productType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  // 1) template_key dispatch (unknown keys fall through to the type mapping
  //    so a typo'd template can never blank an active product page)
  const ByTemplate = templateKey ? TEMPLATE_COMPONENTS[templateKey] : undefined
  if (ByTemplate) return <ByTemplate productId={id} />

  // 2) legacy type-based mapping (all products created before template_key)
  const ByType = TYPE_COMPONENTS[productType]
  if (ByType) return <ByType productId={id} />

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-light mb-4">Unknown Product Type</h1>
        <p className="text-gray-600">Product type "{productType}" is not supported.</p>
      </div>
    </div>
  )
}
