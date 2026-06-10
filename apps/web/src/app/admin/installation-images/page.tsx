'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

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

/** A display-only row that hasn't been saved to DB yet */
interface DefaultDisplayImage {
  _isDefault: true
  image_url: string
  sort_order: number
}

type DisplayImage = InstallationImage | DefaultDisplayImage

function isDbImage(img: DisplayImage): img is InstallationImage {
  return !('_isDefault' in img)
}

const PRODUCT_TYPES = [
  { key: 'handcrafted-drapery',       label: 'Handcrafted Drapery' },
  { key: 'handcrafted-roman-shade',   label: 'Roman Shade' },
  { key: 'handcrafted-top-treatment', label: 'Top Treatment' },
] as const

type ProductTypeKey = typeof PRODUCT_TYPES[number]['key']

// Default hardcoded images per product type
const DEFAULT_IMAGES: Record<string, string[]> = {
  'handcrafted-drapery': [
    '/drapery/handcrafted-drapery/IMG_2531.PNG',
    '/drapery/handcrafted-drapery/IMG_0547.JPG',
    '/drapery/handcrafted-drapery/IMG_9864.JPG',
    '/drapery/handcrafted-drapery/IMG_3146.jpg',
    '/drapery/handcrafted-drapery/IMG_6600.jpg',
    '/drapery/handcrafted-drapery/IMG_9865.JPG',
    '/drapery/handcrafted-drapery/FullSizeRender.JPG',
  ],
  'handcrafted-roman-shade': [
    '/roman-shade/IMG_0077.JPG',
    '/roman-shade/IMG_0078.JPG',
    '/roman-shade/IMG_4114.JPG',
    '/roman-shade/微信图片_20190609163607_Original.JPG',
    '/roman-shade/IMG_0298_Original.JPG',
  ],
  'handcrafted-top-treatment': [
    '/top-treatments/swags/photo_001.jpg',
    '/top-treatments/swags/photo_002.jpg',
    '/top-treatments/swags/photo_003.jpg',
    '/top-treatments/swags/photo_004.jpg',
    '/top-treatments/swags/photo_005.jpg',
    '/top-treatments/swags/photo_006.jpg',
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function InstallationImagesPage() {
  const [activeTab, setActiveTab] = useState<ProductTypeKey>(PRODUCT_TYPES[0].key)
  const [dbImages, setDbImages] = useState<InstallationImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)        // for auto-seed operations
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showFlash = (text: string, ok = true) => {
    setFlash({ text, ok })
    setTimeout(() => setFlash(null), 3000)
  }

  // ── Computed display list: DB images if any, otherwise defaults ──
  const usingDefaults = dbImages.length === 0
  const displayImages: DisplayImage[] = usingDefaults
    ? (DEFAULT_IMAGES[activeTab] || []).map((url, i) => ({
        _isDefault: true as const,
        image_url: url,
        sort_order: i,
      }))
    : dbImages

  // ── Load images for current tab ──
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/installation-images?productType=${activeTab}`)
      const json = await res.json()
      if (json.success) setDbImages(json.data)
      else throw new Error(json.error)
    } catch (e: any) {
      showFlash('加载失败: ' + e.message, false)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { load() }, [load])

  // ── Seed defaults to DB (returns the newly created DB images) ──
  const ensureDbImages = async (excludeUrl?: string): Promise<void> => {
    if (!usingDefaults) return   // already in DB
    setBusy(true)
    try {
      const defaults = DEFAULT_IMAGES[activeTab] || []
      const toSeed = excludeUrl ? defaults.filter(u => u !== excludeUrl) : defaults
      for (const url of toSeed) {
        await fetch('/api/admin/installation-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_type: activeTab, image_url: url }),
        })
      }
      await load()
    } finally {
      setBusy(false)
    }
  }

  // ── Upload file ──
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      // If still on defaults, seed them first so new upload goes into DB alongside them
      if (usingDefaults) await ensureDbImages()

      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        form.append('productType', activeTab)
        const upRes = await fetch('/api/admin/installation-images/upload', { method: 'POST', body: form })
        const upJson = await upRes.json()
        if (!upJson.success) throw new Error(upJson.error?.message || '上传失败')

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
  const togglePublish = async (img: DisplayImage) => {
    if (!isDbImage(img)) return
    try {
      const res = await fetch('/api/admin/installation-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: img.id, is_published: !img.is_published }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDbImages(prev => prev.map(i => i.id === img.id ? { ...i, is_published: !i.is_published } : i))
    } catch (e: any) {
      showFlash('更新失败: ' + e.message, false)
    }
  }

  // ── Update caption ──
  const updateCaption = async (img: DisplayImage, caption: string) => {
    if (!isDbImage(img)) return
    try {
      const res = await fetch('/api/admin/installation-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: img.id, caption }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDbImages(prev => prev.map(i => i.id === img.id ? { ...i, caption } : i))
    } catch (e: any) {
      showFlash('更新失败: ' + e.message, false)
    }
  }

  // ── Move sort order ──
  const moveImage = async (img: DisplayImage, direction: 'up' | 'down') => {
    if (!isDbImage(img)) {
      // For defaults, seed to DB first then reload (order preserved)
      await ensureDbImages()
      return
    }
    const idx = dbImages.findIndex(i => i.id === img.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= dbImages.length) return

    const other = dbImages[swapIdx]
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
  const deleteImage = async (img: DisplayImage) => {
    if (!confirm('确定删除这张图片？')) return
    try {
      if (!isDbImage(img)) {
        // Default image: seed all OTHER defaults to DB (excluding this one)
        await ensureDbImages(img.image_url)
        showFlash('已删除')
        return
      }
      const res = await fetch(`/api/admin/installation-images?id=${img.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDbImages(prev => prev.filter(i => i.id !== img.id))
      showFlash('已删除')
    } catch (e: any) {
      showFlash('删除失败: ' + e.message, false)
    }
  }

  // ── Replace image (upload new file for an existing slot) ──
  const replaceImage = async (img: DisplayImage) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp,image/gif'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setBusy(true)
      try {
        // Upload file
        const form = new FormData()
        form.append('file', file)
        form.append('productType', activeTab)
        const upRes = await fetch('/api/admin/installation-images/upload', { method: 'POST', body: form })
        const upJson = await upRes.json()
        if (!upJson.success) throw new Error(upJson.error?.message || '上传失败')
        const newUrl = upJson.data.url

        if (isDbImage(img)) {
          // Update existing DB record with new URL
          const res = await fetch('/api/admin/installation-images', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: img.id, image_url: newUrl }),
          })
          const json = await res.json()
          if (!json.success) throw new Error(json.error)
          setDbImages(prev => prev.map(i => i.id === img.id ? { ...i, image_url: newUrl } : i))
        } else {
          // Default: seed all defaults to DB, then update the matching one
          const defaults = DEFAULT_IMAGES[activeTab] || []
          for (const url of defaults) {
            await fetch('/api/admin/installation-images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ product_type: activeTab, image_url: url === img.image_url ? newUrl : url }),
            })
          }
          await load()
        }
        showFlash('已替换图片')
      } catch (e: any) {
        showFlash('替换失败: ' + e.message, false)
      } finally {
        setBusy(false)
      }
    }
    input.click()
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
          <p className="text-sm text-gray-500 mt-1">管理产品页面 Our Installations 板块的图片</p>
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

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-6">
        {/* Upload */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={e => handleUpload(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
          uploading ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black'
        }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {uploading ? '上传中...' : '上传图片'}
        </label>

        {/* Defaults indicator */}
        {usingDefaults && !loading && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            当前显示默认图片 · 修改后将自动保存到数据库
          </span>
        )}
      </div>

      {/* Busy overlay */}
      {busy && (
        <div className="text-center py-4 text-sm text-gray-500 animate-pulse">
          正在保存到数据库...
        </div>
      )}

      {/* Image list */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : displayImages.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 text-sm">暂无图片</p>
          <p className="text-gray-300 text-xs mt-1">点击「上传图片」添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayImages.map((img, idx) => {
            const isDefault = !isDbImage(img)
            const isUnpublished = isDbImage(img) && !img.is_published
            return (
              <div
                key={isDbImage(img) ? img.id : `default-${idx}`}
                className={`flex items-center gap-4 bg-white border rounded-xl p-3 transition-all ${
                  isUnpublished ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
                }`}
              >
                {/* Sort number */}
                <div className="w-8 text-center text-sm font-bold text-gray-300 flex-shrink-0">
                  {idx + 1}
                </div>

                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  <Image src={img.image_url} alt="" fill sizes="80px" className="object-cover" />
                  {isDefault && (
                    <div className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      默认
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {isDbImage(img) ? (
                    <>
                      <input
                        type="text"
                        placeholder="添加备注..."
                        value={img.caption || ''}
                        onChange={e => setDbImages(prev => prev.map(i => i.id === img.id ? { ...i, caption: e.target.value } : i))}
                        onBlur={e => updateCaption(img, e.target.value)}
                        className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-100 focus:border-gray-400 outline-none pb-1 placeholder-gray-300"
                      />
                      <p className="text-[10px] text-gray-300 mt-1 truncate">{img.image_url}</p>
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400 truncate">{img.image_url}</p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Move up */}
                  <button
                    onClick={() => moveImage(img, 'up')}
                    disabled={idx === 0 || busy}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      idx === 0 ? 'text-gray-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    title="上移"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                  </button>

                  {/* Move down */}
                  <button
                    onClick={() => moveImage(img, 'down')}
                    disabled={idx === displayImages.length - 1 || busy}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      idx === displayImages.length - 1 ? 'text-gray-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    title="下移"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-200 mx-1" />

                  {/* Replace */}
                  <button
                    onClick={() => replaceImage(img)}
                    disabled={busy}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    title="替换图片"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>

                  {/* Toggle publish (DB images only) */}
                  {isDbImage(img) && (
                    <button
                      onClick={() => togglePublish(img)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        img.is_published
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-orange-500 hover:bg-orange-50'
                      }`}
                      title={img.is_published ? '点击隐藏' : '点击显示'}
                    >
                      {img.is_published ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                      )}
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteImage(img)}
                    disabled={busy}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Count */}
      {!loading && displayImages.length > 0 && (
        <div className="text-center mt-6 text-xs text-gray-400">
          共 {displayImages.length} 张图片
          {!usingDefaults && ` · ${dbImages.filter(i => i.is_published).length} 张已发布`}
        </div>
      )}
    </div>
  )
}
