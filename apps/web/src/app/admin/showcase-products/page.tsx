'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

interface Product {
  id: number; name: string; slug: string; description: string; cover_image: string
  cover_fit: string; status: string; sort_order: number; created_at: string
  source?: string;   // 'hardcoded' | 'cms' | undefined
  href?: string;     // target URL for the product card
  category?: string
}

const SOURCE_BADGE: Record<string, { label: string; color: string }> = {
  hardcoded: { label: '硬编码', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  cms:       { label: 'CMS',    color: 'bg-blue-100  text-blue-700  border-blue-200'  },
  store:     { label: '商城',   color: 'bg-green-100 text-green-700 border-green-200' },
}

const CATEGORY_LABEL: Record<string, string> = {
  shades:    '遮阳帘',
  blinds:    '百叶帘',
  shutters:  '百叶窗',
  sheers:    '纱帘',
  custom:    '定制',
  motorized: '电动',
  other:     '其他',
}

export default function ShowcaseProductsListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hardcoded' | 'cms'>('all')
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/showcase-products')
      const data = await res.json()
      if (data.success) setProducts(data.data.sort((a: Product, b: Product) => a.sort_order - b.sort_order))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this product? (Hardcoded products will reappear on next seed run.)')) return
    await fetch('/api/admin/showcase-products', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchProducts()
  }

  const handleToggleStatus = async (e: React.MouseEvent, p: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const newStatus = p.status === 'active' ? 'inactive' : 'active'
    await fetch('/api/admin/showcase-products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, status: newStatus })
    })
    fetchProducts()
  }

  // Drag & drop reorder
  const handleDragStart = (index: number) => { dragItem.current = index; setDraggingIdx(index) }
  const handleDragEnter = (index: number) => { dragOverItem.current = index }

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      setDraggingIdx(null); return
    }
    const reordered = [...products]
    const [removed] = reordered.splice(dragItem.current, 1)
    reordered.splice(dragOverItem.current, 0, removed)
    const updated = reordered.map((p, i) => ({ ...p, sort_order: i }))
    setProducts(updated); setDraggingIdx(null)
    dragItem.current = null; dragOverItem.current = null
    for (const p of updated) {
      await fetch('/api/admin/showcase-products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, name: p.name, description: p.description,
          cover_image: p.cover_image, cover_fit: p.cover_fit, status: p.status, sort_order: p.sort_order })
      })
    }
  }

  const displayed = filter === 'all' ? products : products.filter(p => (p.source || 'cms') === filter)

  const hardcodedCount = products.filter(p => p.source === 'hardcoded').length
  const cmsCount       = products.filter(p => !p.source || p.source === 'cms').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">产品目录管理</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                管理前台 /products 页展示的产品目录。拖拽排序；硬编码产品只可调整显示/隐藏与排序。
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/showcase-products/edit/new"
                className="px-5 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 font-medium text-sm">
                + 新增产品
              </Link>
            </div>
          </div>

          {/* Filter tabs + stats */}
          <div className="flex gap-4 mt-4">
            {[
              { key: 'all',        label: `全部 (${products.length})` },
              { key: 'hardcoded',  label: `硬编码 (${hardcodedCount})` },
              { key: 'cms',        label: `CMS (${cmsCount})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key as any)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  filter === tab.key
                    ? 'bg-[#3d3d3d] text-white border-[#3d3d3d]'
                    : 'text-gray-500 border-gray-200 hover:border-gray-400'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Seed hint */}
      {hardcodedCount === 0 && !loading && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-md">
            💡 尚未 seed 硬编码产品。请在服务器运行：<code className="font-mono bg-amber-100 px-1 rounded">cd apps/web && node seed-product-catalog.mjs</code>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">加载中...</div>
        ) : displayed.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm mb-4">暂无产品</p>
            <Link href="/admin/showcase-products/edit/new"
              className="px-5 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 text-sm font-medium">
              新增第一个产品
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((p, index) => {
              const srcBadge = SOURCE_BADGE[p.source || 'cms'] || SOURCE_BADGE.cms
              const previewHref = (p.href && p.href !== '') ? p.href : `/products/${p.slug || p.id}`
              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`group relative bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing ${
                    draggingIdx === index ? 'opacity-40 scale-95' : ''
                  } ${p.status === 'inactive' ? 'opacity-60' : ''}`}
                >
                  {/* Status badge */}
                  {p.status === 'inactive' && (
                    <div className="absolute top-3 left-3 z-10 bg-[#3d3d3d] text-white text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md">隐藏</div>
                  )}

                  {/* Source + category badges */}
                  <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                    {p.category && CATEGORY_LABEL[p.category] && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md">
                        {CATEGORY_LABEL[p.category]}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${srcBadge.color}`}>
                      {srcBadge.label}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="aspect-square rounded-t-md overflow-hidden relative">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-300 text-sm text-center px-4">{p.name}</span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Link href={`/admin/showcase-products/edit/${p.id}`}
                          className="px-4 py-2 bg-white text-gray-900 rounded-md text-xs font-medium hover:bg-gray-100">
                          编辑
                        </Link>
                        <a href={previewHref} target="_blank"
                          className="px-4 py-2 bg-white text-gray-900 rounded-md text-xs font-medium hover:bg-gray-100">
                          预览
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Info bar */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-center mb-1">{p.name}</h3>
                    {p.href && (
                      <p className="text-[11px] text-gray-400 text-center truncate mb-3">{p.href}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <button onClick={(e) => handleToggleStatus(e, p)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.status === 'active' ? 'bg-[#3d3d3d]' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.status === 'active' ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                      </button>
                      <button onClick={(e) => handleDelete(e, p.id)}
                        className="text-xs text-gray-400 hover:text-red-600 transition-colors">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
