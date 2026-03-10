'use client'

import { use, useState, useEffect } from 'react'
import DraperyProduct from './components/DraperyProduct'
import SheerProduct from './components/SheerProduct'
import ShadeProduct from './components/ShadeProduct'
import HardwareProduct from './components/HardwareProduct'

export default function StoreProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [productType, setProductType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/store/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setProductType(data.data.product?.type || null)
          // Record browsing history
          try {
            const key = 'store_recently_viewed'
            const recent: string[] = JSON.parse(localStorage.getItem(key) || '[]')
            const updated = [id, ...recent.filter(x => x !== id)].slice(0, 20)
            localStorage.setItem(key, JSON.stringify(updated))
          } catch {}
        }
      })
      .catch(() => setProductType(null))
      .finally(() => setLoading(false))
  }, [id])

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

  if (productType === 'drapery') return <DraperyProduct productId={id} />
  if (productType === 'sheer')   return <SheerProduct productId={id} />
  if (productType === 'shade')   return <ShadeProduct productId={id} />
  if (productType === 'hardware') return <HardwareProduct productId={id} />

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-light mb-4">Unknown Product Type</h1>
        <p className="text-gray-600">Product type "{productType}" is not supported.</p>
      </div>
    </div>
  )
}
