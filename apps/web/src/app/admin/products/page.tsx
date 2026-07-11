'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  type: string
  status: string
  sort_order: number
  main_image_url?: string
  base_price?: number
  stock_qty?: number | null
  default_config?: any
  store_category_id?: string | null
  store_category_name?: string | null
  created_at: string
}

interface StoreCategory {
  id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
  product_count: number
}

const TYPE_LABELS: Record<string, string> = {
  drapery: 'Drapery', sheer: 'Sheer', shade: 'Shade', hardware: 'Hardware', accessory: 'Accessory',
}

const STATUS_FILTERS = [
  { id: 'all', name: 'All' },
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
]


// List price: products configure real prices in options; base_price is often 0.
// Prefer the configured starting price so the list doesn't show a misleading $0.00.
function displayPrice(p: any): string {
  const sp = Number(p?.default_config?.starting_price)
  if (Number.isFinite(sp) && sp > 0) return `From $${sp.toFixed(2)}`
  const bp = Number(p?.base_price)
  if (Number.isFinite(bp) && bp > 0) return `$${bp.toFixed(2)}`
  return '—'
}

export default function StoreProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)

  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([])
  const [showCatManager, setShowCatManager] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const dragCat = useRef<number | null>(null)
  const dragOverCat = useRef<number | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      const res = await fetch(`/api/admin/products?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        const sorted = (data.data.products || []).sort((a: Product, b: Product) => {
          const aOrder = a.default_config?.sort_order ?? a.sort_order ?? 0
          const bOrder = b.default_config?.sort_order ?? b.sort_order ?? 0
          return aOrder - bOrder
        })
        setProducts(sorted)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [searchTerm])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/store-categories')
      const data = await res.json()
      if (data.success) setStoreCategories(data.data || [])
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => { fetchProducts(); fetchCategories() }, [fetchProducts, fetchCategories])

  const filteredProducts = products.filter(p => {
    if (activeStatus !== 'all' && p.status !== activeStatus) return false
    if (activeCategory !== 'all') {
      if (activeCategory === 'uncategorized') return !p.store_category_id
      return p.store_category_id === activeCategory
    }
    return true
  })

  const handleStatusToggle = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.preventDefault(); e.stopPropagation()
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    await fetch(`/api/admin/products/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null); fetchProducts()
  }

  const [duplicating, setDuplicating] = useState<string | null>(null)
  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation()
    if (duplicating) return
    setDuplicating(id)
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: 'POST' })
      const data = await res.json()
      if (data.success) { setMessage('Product duplicated'); fetchProducts() }
      else setMessage('Duplication failed')
    } catch { setMessage('Duplication failed') }
    finally { setDuplicating(null); setTimeout(() => setMessage(''), 2000) }
  }

  const toggleFeatured = async (e: React.MouseEvent | React.ChangeEvent, productId: string, current: boolean) => {
    if ('preventDefault' in e) e.preventDefault()
    if ('stopPropagation' in e) (e as React.MouseEvent).stopPropagation()
    await fetch(`/api/admin/products/${productId}/featured`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: !current })
    })
    fetchProducts()
  }

  const assignCategory = async (productId: string, categoryId: string | null) => {
    await fetch('/api/admin/store-categories/assign', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, store_category_id: categoryId })
    })
    fetchProducts(); fetchCategories()
  }

  const addCategory = async () => {
    if (!newCatName.trim()) return
    await fetch('/api/admin/store-categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName.trim(), sort_order: storeCategories.length })
    })
    setNewCatName(''); fetchCategories()
  }
  const updateCategory = async (id: string, updates: Partial<StoreCategory>) => {
    await fetch('/api/admin/store-categories', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })
    fetchCategories()
  }
  const reorderCategories = async (fromIdx: number, toIdx: number) => {
    const reordered = [...storeCategories]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    setStoreCategories(reordered)
    for (let i = 0; i < reordered.length; i++) {
      await fetch('/api/admin/store-categories', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reordered[i].id, sort_order: i })
      })
    }
    fetchCategories()
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Products in it will become uncategorized.')) return
    await fetch('/api/admin/store-categories', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchCategories(); fetchProducts()
  }

  const handleDragStart = (index: number) => { dragItem.current = index; setDraggingIdx(index) }
  const handleDragEnter = (index: number) => { dragOverItem.current = index }
  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      setDraggingIdx(null); return
    }
    const reordered = [...filteredProducts]
    const [removed] = reordered.splice(dragItem.current, 1)
    reordered.splice(dragOverItem.current, 0, removed)
    const newProducts = [...products]
    reordered.forEach((p, i) => {
      const idx = newProducts.findIndex(np => np.id === p.id)
      if (idx !== -1) newProducts[idx] = { ...newProducts[idx], sort_order: i }
    })
    setProducts(newProducts); setDraggingIdx(null)
    dragItem.current = null; dragOverItem.current = null
    setMessage('Order updated'); setTimeout(() => setMessage(''), 2000)
  }

  const dragProps = (index: number) => ({
    draggable: true,
    onDragStart: () => handleDragStart(index),
    onDragEnter: () => handleDragEnter(index),
    onDragEnd: handleDragEnd,
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
  })

  const statusCounts: Record<string, number> = { all: products.length }
  products.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1 })
  const uncategorizedCount = products.filter(p => !p.store_category_id).length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Products</h1>
              <p className="text-sm text-gray-400 mt-0.5">{products.length} products · Drag to reorder</p>
            </div>
            <div className="flex gap-2 items-center">
              {message && <span className="text-sm px-3 py-1 rounded bg-green-50 text-green-700">{message}</span>}
              <button onClick={() => setShowCatManager(true)}
                className="px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50">
                <svg className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                Categories
              </button>
              <button onClick={() => router.push('/admin/products/create')}
                className="px-4 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 text-sm font-medium">
                <svg className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              {/* Category filter pills */}
              <button onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === 'all' ? 'bg-[#3d3d3d] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                All <span className="ml-1 opacity-60">{products.length}</span>
              </button>
              {storeCategories.filter(c => c.is_active).map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat.id ? 'bg-[#3d3d3d] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                  {cat.name} <span className="ml-1 opacity-60">{cat.product_count}</span>
                </button>
              ))}
              {uncategorizedCount > 0 && (
                <button onClick={() => setActiveCategory('uncategorized')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === 'uncategorized' ? 'bg-[#3d3d3d] text-white' : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-200'}`}>
                  Uncategorized <span className="ml-1 opacity-60">{uncategorizedCount}</span>
                </button>
              )}

              <div className="w-px h-5 bg-gray-200 mx-1" />

              <select value={activeStatus} onChange={e => setActiveStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white">
                {STATUS_FILTERS.map(sf => (
                  <option key={sf.id} value={sf.id}>{sf.name} ({statusCounts[sf.id] || 0})</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-md overflow-hidden">
                <button onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1.5 ${viewMode === 'list' ? 'bg-[#3d3d3d] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                </button>
                <button onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1.5 ${viewMode === 'grid' ? 'bg-[#3d3d3d] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                </button>
              </div>
              <div className="relative">
                <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></svg>
                <input type="text" placeholder="Search..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-sm w-52 focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 mb-4">{searchTerm ? `No results for "${searchTerm}"` : 'No products in this category'}</p>
            <button onClick={() => router.push('/admin/products/create')}
              className="px-4 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 text-sm">Add Product</button>
          </div>
        ) : viewMode === 'list' ? (
          /* ─── List View (Default) ─── */
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] text-gray-400 uppercase tracking-wider">
                  <th className="w-8 px-3 py-3"></th>
                  <th className="w-14 px-3 py-3"></th>
                  <th className="px-3 py-3 text-left font-medium">Product</th>
                  <th className="px-3 py-3 text-left font-medium w-36">Category</th>
                  <th className="px-3 py-3 text-left font-medium w-24">Price</th>
                  <th className="px-3 py-3 text-center font-medium w-20">Featured</th>
                  <th className="px-3 py-3 text-center font-medium w-20">Status</th>
                  <th className="px-3 py-3 text-right font-medium w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, index) => (
                  <tr key={p.id} {...dragProps(index)}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-grab active:cursor-grabbing ${draggingIdx === index ? 'opacity-30' : ''} ${p.status !== 'active' ? 'bg-gray-50/50' : ''}`}>
                    <td className="px-3 py-3">
                      <svg className="w-4 h-4 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" /></svg>
                    </td>
                    <td className="px-3 py-3">
                      <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {p.main_image_url ? <Image src={p.main_image_url} alt={p.name} fill sizes="40px" className="object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px]">No img</div>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {p.name}
                            {p.status !== 'active' && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium align-middle">草稿 Draft</span>
                            )}
                          </p>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">{TYPE_LABELS[p.type] || p.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <select value={p.store_category_id || ''} onChange={e => assignCategory(p.id, e.target.value || null)}
                        className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 focus:ring-1 focus:ring-gray-400 w-full bg-white">
                        <option value="">Uncategorized</option>
                        {storeCategories.filter(c => c.is_active).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 font-medium tabular-nums">
                      {displayPrice(p)}
                      {p.stock_qty != null && (
                        <p className={`text-[11px] font-normal mt-0.5 ${Number(p.stock_qty) === 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          Stock: {p.stock_qty}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input type="checkbox" checked={!!p.default_config?.is_featured}
                        onChange={(e) => toggleFeatured(e, p.id, !!p.default_config?.is_featured)}
                        className="w-3.5 h-3.5 accent-gray-900 border-gray-300 rounded focus:ring-gray-400 cursor-pointer" />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={(e) => handleStatusToggle(e, p.id, p.status)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.status === 'active' ? 'bg-[#3d3d3d]' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <a href={`/store/${p.id}`} target="_blank"
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="Preview">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </a>
                        <button onClick={() => router.push(`/admin/products/edit/${p.id}`)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="Edit">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487L19.5 7.125" /></svg>
                        </button>
                        <button onClick={(e) => handleDuplicate(e, p.id)} disabled={duplicating === p.id}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 disabled:opacity-30" title="Duplicate">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5" /></svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50" title="Delete">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ─── Grid View ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p, index) => (
              <div key={p.id} {...dragProps(index)}
                className={`group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing ${
                  draggingIdx === index ? 'opacity-30 scale-95' : ''} ${p.status !== 'active' ? 'opacity-60' : ''}`}>
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {p.main_image_url ? <Image src={p.main_image_url} alt={p.name} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">{p.name}</div>}
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                      <button onClick={() => router.push(`/admin/products/edit/${p.id}`)}
                        className="p-2 bg-white rounded-md text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                      </button>
                      <button onClick={(e) => handleDuplicate(e, p.id)} disabled={duplicating === p.id}
                        className="p-2 bg-white rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5" /></svg>
                      </button>
                      <a href={`/store/${p.id}`} target="_blank"
                        className="p-2 bg-white rounded-md text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </a>
                    </div>
                  </div>
                  {/* Status indicator */}
                  {p.status !== 'active' && (
                    <div className="absolute top-2 right-2 bg-gray-900/70 text-white text-[10px] px-2 py-0.5 rounded font-medium">Inactive</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{TYPE_LABELS[p.type] || p.type}{p.store_category_name ? ` · ${p.store_category_name}` : ''}</p>
                    </div>
                    {p.base_price != null && (
                      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{displayPrice(p)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={!!p.default_config?.is_featured}
                          onChange={(e) => toggleFeatured(e, p.id, !!p.default_config?.is_featured)}
                          className="w-3.5 h-3.5 text-gray-900 border-gray-300 rounded focus:ring-gray-400" />
                        <span className="text-[10px] text-gray-400">Featured</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => handleStatusToggle(e, p.id, p.status)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.status === 'active' ? 'bg-[#3d3d3d]' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone. Are you sure?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCatManager && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Categories</h3>
              <button onClick={() => setShowCatManager(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5">
              {/* Add */}
              <div className="flex gap-2 mb-5">
                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                  placeholder="New category name..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
                <button onClick={addCategory} disabled={!newCatName.trim()}
                  className="px-4 py-2 bg-[#3d3d3d] text-white rounded-md text-sm hover:bg-gray-700 disabled:opacity-40">Add</button>
              </div>

              {/* List */}
              <div className="space-y-1.5">
                {storeCategories.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No categories yet</p>}
                {storeCategories.map((cat, idx) => (
                  <div key={cat.id} draggable
                    onDragStart={() => { dragCat.current = idx }}
                    onDragEnter={() => { dragOverCat.current = idx }}
                    onDragEnd={() => {
                      if (dragCat.current !== null && dragOverCat.current !== null && dragCat.current !== dragOverCat.current) {
                        reorderCategories(dragCat.current, dragOverCat.current)
                      }
                      dragCat.current = null; dragOverCat.current = null
                    }}
                    onDragOver={e => e.preventDefault()}
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-md cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" /></svg>
                    {editingCat === cat.id ? (
                      <input type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { updateCategory(cat.id, { name: editCatName }); setEditingCat(null) } }}
                        onBlur={() => { updateCategory(cat.id, { name: editCatName }); setEditingCat(null) }}
                        autoFocus className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm" />
                    ) : (
                      <span className="flex-1 text-sm text-gray-800 cursor-pointer"
                        onClick={() => { setEditingCat(cat.id); setEditCatName(cat.name) }}>{cat.name}</span>
                    )}
                    <span className="text-[11px] text-gray-400 tabular-nums">{cat.product_count}</span>
                    <button onClick={() => updateCategory(cat.id, { is_active: !cat.is_active })}
                      className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors flex-shrink-0 ${cat.is_active ? 'bg-[#3d3d3d]' : 'bg-gray-300'}`}
                      style={{ height: 18, width: 32 }}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${cat.is_active ? 'translate-x-3.5' : 'translate-x-0.5'}`}
                        style={{ height: 14, width: 14, transform: cat.is_active ? 'translateX(14px)' : 'translateX(2px)' }} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100">
              <button onClick={() => setShowCatManager(false)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-50 transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
