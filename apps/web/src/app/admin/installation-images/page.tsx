'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface InstallationImage {
  id: number
  product_type: string
  image_url: string
  caption: string | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

const PRODUCT_TYPES = [
  { key: 'handcrafted-drapery',       label: 'Handcrafted Drapery' },
  { key: 'handcrafted-roman-shade',   label: 'Roman Shade' },
  { key: 'handcrafted-top-treatment', label: 'Top Treatment' },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function InstallationImagesPage() {
  const [activeTab, setActiveTab] = useState(PRODUCT_TYPES[0].key)
  const [images, setImages] = useState<InstallationImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showFlash = (text: string, ok = true) => {
    setFlash({ text, ok })
    setTimeout(() => setFlash(null), 3000)
  }

  // ── Load images for current tab ──
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/installation-images?productType=${activeTab}`)
      const json = await res.json()
      if (json.success) setImages(json.data)
      else throw new Error(json.error)
    } catch (e: any) {
      showFlash('加载失败: ' + e.message, false)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { load() }, [load])

  // ── Upload file ──
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        // 1. Upload to R2
        const form = new FormData()
        form.append('file', file)
        form.append('productType', activeTab)
        const upRes = await fetch('/api/admin/installation-images/upload', { method: 'POST', body: form })
        const upJson = await upRes.json()
        if (!upJson.success) throw new Error(upJson.error?.message || '上传失败')

        // 2. Save record to DB
        const saveRes = await fetch('/api/admin/installation-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_type: activeTab, image_url: upJson.data.url }),
        })
        const saveJson = await saveRes.json()
        if (!saveJson.success) throw new Error(saveJson.error || '保存失败')
      }
      showFlash(`已上传 ${files.length} 张图片`)
      load()
    } catch (e: any) {
      showFlash('上传失败: ' + e.message, false)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // ── Toggle publish ──
  const togglePublish = async (img: InstallationImage) => {
    try {
      const res = await fetch('/api/admin/installation-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: img.id, is_published: !img.is_published }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, is_published: !i.is_published } : i))
    } catch (e: any) {
      showFlash('更新失败: ' + e.message, false)
    }
  }

  // ── Update caption ──
  const updateCaption = async (img: InstallationImage, caption: string) => {
    try {
      const res = await fetch('/api/admin/installation-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: img.id, caption }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, caption } : i))
    } catch (e: any) {
      showFlash('更新失败: ' + e.message, false)
    }
  }

  // ── Move sort order ──
  const moveImage = async (img: InstallationImage, direction: 'up' | 'down') => {
    const idx = images.findIndex(i => i.id === img.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= images.length) return

    const other = images[swapIdx]
    try {
      await Promise.all([
        fetch('/api/admin/installation-images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: img.id, sort_order: other.sort_order }),
        }),
        fetch('/api/admin/installation-images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: other.id, sort_order: img.sort_order }),
        }),
      ])
      load()
    } catch (e: any) {
      showFlash('排序失败: ' + e.message, false)
    }
  }

  // ── Delete ──
  const deleteImage = async (img: InstallationImage) => {
    if (!confirm('确定删除这张图片？')) return
    try {
      const res = await fetch(`/api/admin/installation-images?id=${img.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setImages(prev => prev.filter(i => i.id !== img.id))
      showFlash('已删除')
    } catch (e: any) {
      showFlash('删除失败: ' + e.message, false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Flash */}
      {flash && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-lg ${
          flash.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {flash.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Installation Images</h1>
          <p className="text-sm text-gray-500 mt-1">管理三个手工产品页面的 Our Installations 板块图片</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {PRODUCT_TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key
                ? 'bg-gray-900 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload area */}
      <div className="mb-8 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={e => handleUpload(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {uploading ? (
            <p className="text-gray-500 text-sm">上传中...</p>
          ) : (
            <>
              <p className="text-gray-600 text-sm font-medium">点击上传图片</p>
              <p className="text-gray-400 text-xs mt-1">支持 JPG、PNG、WebP、GIF，最大 20MB，可多选</p>
            </>
          )}
        </label>
      </div>

      {/* Image grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">暂无图片</p>
          <p className="text-gray-300 text-xs mt-1">上传图片后将显示在产品页面的 Our Installations 板块</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`group relative bg-white border rounded-xl overflow-hidden transition-all ${
                img.is_published ? 'border-gray-200' : 'border-orange-300 opacity-60'
              }`}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover" loading="lazy" />
              </div>

              {/* Controls overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Move up */}
                {idx > 0 && (
                  <button
                    onClick={() => moveImage(img, 'up')}
                    className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:bg-white shadow-sm"
                    title="上移"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                  </button>
                )}
                {/* Move down */}
                {idx < images.length - 1 && (
                  <button
                    onClick={() => moveImage(img, 'down')}
                    className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:bg-white shadow-sm"
                    title="下移"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                )}
                {/* Toggle publish */}
                <button
                  onClick={() => togglePublish(img)}
                  className={`w-7 h-7 backdrop-blur rounded-full flex items-center justify-center shadow-sm ${
                    img.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                  title={img.is_published ? '点击隐藏' : '点击显示'}
                >
                  {img.is_published ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                  )}
                </button>
                {/* Delete */}
                <button
                  onClick={() => deleteImage(img)}
                  className="w-7 h-7 bg-red-100 backdrop-blur rounded-full flex items-center justify-center text-red-600 hover:bg-red-200 shadow-sm"
                  title="删除"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              {/* Sort order badge */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 backdrop-blur text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {idx + 1}
              </div>

              {/* Unpublished badge */}
              {!img.is_published && (
                <div className="absolute bottom-12 left-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  隐藏
                </div>
              )}

              {/* Caption input */}
              <div className="p-3">
                <input
                  type="text"
                  placeholder="添加备注..."
                  value={img.caption || ''}
                  onChange={e => setImages(prev => prev.map(i => i.id === img.id ? { ...i, caption: e.target.value } : i))}
                  onBlur={e => updateCaption(img, e.target.value)}
                  className="w-full text-xs text-gray-600 bg-transparent border-b border-transparent focus:border-gray-300 outline-none pb-1 placeholder-gray-300"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      {!loading && images.length > 0 && (
        <div className="text-center mt-6 text-xs text-gray-400">
          共 {images.length} 张图片 · {images.filter(i => i.is_published).length} 张已发布
        </div>
      )}
    </div>
  )
}
