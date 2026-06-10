'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import ImageCropper from './ImageCropper'

interface MainImage {
  id: string; url: string; name: string; sort_order: number
}
interface GalleryImage {
  id: string; url: string; title: string; description: string; sort_order: number
}
interface ImageManagerProps {
  productId: string
  onChange: (images: { main: MainImage[], gallery: GalleryImage[] }) => void
}

// 裁剪队列任务
interface CropTask {
  file: File
  previewUrl: string
  aspectRatio: number
  type: 'main' | 'gallery'
}

export default function ImageManager({ productId, onChange }: ImageManagerProps) {
  const [mainImages, setMainImages] = useState<MainImage[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMsg, setSaveMsg] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)

  // 裁剪队列
  const [cropQueue, setCropQueue] = useState<CropTask[]>([])
  const [currentCrop, setCurrentCrop] = useState<CropTask | null>(null)

  const mainRef = useRef<MainImage[]>([])
  const galleryRef = useRef<GalleryImage[]>([])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { fetchImages() }, [productId])

  // 处理裁剪队列
  useEffect(() => {
    if (!currentCrop && cropQueue.length > 0) {
      const [next, ...rest] = cropQueue
      setCurrentCrop(next)
      setCropQueue(rest)
    }
  }, [currentCrop, cropQueue])

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`)
      const data = await res.json()
      if (data.success) {
        const main = data.data.main || []
        const gallery = data.data.gallery || []
        setMainImages(main); setGalleryImages(gallery)
        mainRef.current = main; galleryRef.current = gallery
        onChange({ main, gallery })
      }
    } catch (e) { console.error('Failed to fetch images:', e) }
  }

  const persistImages = async (main: MainImage[], gallery: GalleryImage[], immediate = false) => {
    mainRef.current = main; galleryRef.current = gallery
    onChange({ main, gallery })

    const doSave = async () => {
      setSaveStatus('saving')
      try {
        const res = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ main: mainRef.current, gallery: galleryRef.current }),
        })
        const data = await res.json()
        if (data.success) {
          setSaveStatus('saved')
          setSaveMsg(`✓ 已保存 (${data.debug?.mainCount ?? mainRef.current.length}张主图)`)
          setTimeout(() => setSaveStatus('idle'), 3000)
        } else {
          setSaveStatus('error')
          setSaveMsg(`✗ 失败: ${data.error?.message || '未知错误'}`)
        }
      } catch (e: any) {
        setSaveStatus('error')
        setSaveMsg(`✗ 网络错误: ${e.message}`)
      }
    }

    if (immediate) {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      await doSave()
    } else {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(doSave, 600)
    }
  }

  const uploadBlob = async (blob: Blob, originalName: string): Promise<string | null> => {
    const file = new File([blob], originalName, { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      return data.success ? data.data.url : null
    } catch { return null }
  }

  // 选择主图文件 → 加入裁剪队列
  const handleMainFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (mainRef.current.length + files.length > 40) { setInlineError('主图册最多 40 张'); setTimeout(() => setInlineError(null), 4000); return }
    const tasks: CropTask[] = Array.from(files).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      aspectRatio: 1,   // 主图 1:1
      type: 'main' as const
    }))
    setCropQueue(prev => [...prev, ...tasks])
    e.target.value = ''
  }

  // 选择 Gallery 文件 → 加入裁剪队列
  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (galleryRef.current.length + files.length > 6) { setInlineError('Gallery 最多 6 张'); setTimeout(() => setInlineError(null), 4000); return }
    const tasks: CropTask[] = Array.from(files).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      aspectRatio: 16 / 9,
      type: 'gallery' as const
    }))
    setCropQueue(prev => [...prev, ...tasks])
    e.target.value = ''
  }

  // 裁剪确认 → 上传 → 保存
  const handleCropConfirm = async (blob: Blob) => {
    if (!currentCrop) return
    const task = currentCrop
    setCurrentCrop(null)
    URL.revokeObjectURL(task.previewUrl)

    setUploading(true)
    const url = await uploadBlob(blob, task.file.name.replace(/\.[^/.]+$/, '.jpg'))
    setUploading(false)

    if (!url) { setInlineError('上传失败，请重试'); setTimeout(() => setInlineError(null), 4000); return }

    if (task.type === 'main') {
      const updated = [...mainRef.current, {
        id: `main-${Date.now()}`,
        url,
        name: task.file.name.replace(/\.[^/.]+$/, ''),
        sort_order: mainRef.current.length
      }]
      setMainImages(updated)
      await persistImages(updated, galleryRef.current, true)
    } else {
      const updated = [...galleryRef.current, {
        id: `gallery-${Date.now()}`,
        url, title: '', description: '',
        sort_order: galleryRef.current.length
      }]
      setGalleryImages(updated)
      await persistImages(mainRef.current, updated, true)
    }
  }

  const handleCropCancel = () => {
    if (currentCrop) URL.revokeObjectURL(currentCrop.previewUrl)
    setCurrentCrop(null)
  }

  const deleteMain = (id: string) => {
    const updated = mainRef.current.filter(img => img.id !== id).map((img, i) => ({ ...img, sort_order: i }))
    setMainImages(updated)
    persistImages(updated, galleryRef.current, true)
  }

  const deleteGallery = (id: string) => {
    const updated = galleryRef.current.filter(img => img.id !== id).map((img, i) => ({ ...img, sort_order: i }))
    setGalleryImages(updated)
    persistImages(mainRef.current, updated, true)
  }

  const updateMainName = (id: string, name: string) => {
    const updated = mainRef.current.map(img => img.id === id ? { ...img, name } : img)
    setMainImages(updated)
    persistImages(updated, galleryRef.current)
  }

  const updateGallery = (id: string, field: 'title' | 'description', value: string) => {
    const updated = galleryRef.current.map(img => img.id === id ? { ...img, [field]: value } : img)
    setGalleryImages(updated)
    persistImages(mainRef.current, updated)
  }

  const moveGallery = (id: string, dir: 'up' | 'down') => {
    const list = [...galleryRef.current]
    const idx = list.findIndex(img => img.id === id)
    if (idx === -1) return
    const target = dir === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= list.length) return
    ;[list[idx], list[target]] = [list[target], list[idx]]
    const updated = list.map((img, i) => ({ ...img, sort_order: i }))
    setGalleryImages(updated)
    persistImages(mainRef.current, updated, true)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return
    const list = [...mainRef.current]
    const fromIdx = list.findIndex(img => img.id === draggedId)
    const toIdx = list.findIndex(img => img.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return
    const [moved] = list.splice(fromIdx, 1)
    list.splice(toIdx, 0, moved)
    const updated = list.map((img, i) => ({ ...img, sort_order: i }))
    setMainImages(updated)
    setDraggedId(null)
    persistImages(updated, galleryRef.current, true)
  }

  const statusColor = saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'error' ? 'text-red-600' : 'text-blue-500'
  const statusText = saveStatus === 'saving' ? '保存中...' : saveMsg

  const cropTitle = currentCrop
    ? currentCrop.type === 'main'
      ? `裁剪主图（正方形 1:1）· 剩余 ${cropQueue.length} 张`
      : `裁剪 Gallery 图片（16:9）· 剩余 ${cropQueue.length} 张`
    : ''

  return (
    <div className="space-y-8">
      {/* 行内错误提示 */}
      {inlineError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 animate-in">
          <span>{inlineError}</span>
          <button onClick={() => setInlineError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* 裁剪弹窗 */}
      {currentCrop && (
        <ImageCropper
          imageSrc={currentCrop.previewUrl}
          aspectRatio={currentCrop.aspectRatio}
          title={cropTitle}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* 上传中遮罩 */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-8 py-6 text-center shadow-xl">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-gray-700 font-medium">上传中，请稍候...</p>
          </div>
        </div>
      )}

      {/* 主图册 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">主图册</h3>
            <p className="text-sm text-gray-500">
              最多 40 张 · 当前 {mainImages.length} / 40 · 拖拽调整顺序
              {statusText && <span className={`ml-3 ${statusColor}`}>{statusText}</span>}
            </p>
          </div>
          <label className={`px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black cursor-pointer transition-colors ${mainImages.length >= 40 ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input type="file" multiple accept="image/*" onChange={handleMainFileSelect} className="hidden" disabled={mainImages.length >= 40} />
            + 添加图片
          </label>
        </div>

        {mainImages.length > 0 && (
          <div className="flex items-center gap-2 mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⭐ 第一张为主图，显示在产品列表。拖拽可调整顺序。
          </div>
        )}

        {mainImages.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-gray-400 text-4xl mb-3">📷</div>
            <p className="text-gray-500">点击「添加图片」上传主图册</p>
            <p className="text-xs text-gray-400 mt-1">上传后可裁剪为正方形</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mainImages.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, image.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, image.id)}
                onDragEnd={() => setDraggedId(null)}
                className={`rounded-lg p-3 bg-white transition-all select-none cursor-grab active:cursor-grabbing
                  ${draggedId === image.id ? 'opacity-40 scale-95' : ''}
                  ${index === 0 ? 'border-2 border-yellow-400 shadow-md' : 'border-2 border-gray-200 hover:border-blue-300'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  {index === 0
                    ? <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">⭐ 主图</span>
                    : <span className="text-xs text-gray-400">#{index + 1}</span>}
                  <span className="text-gray-300 text-sm">⠿⠿</span>
                </div>
                <div className="relative aspect-square bg-gray-100 rounded mb-2 overflow-hidden pointer-events-none">
                  <Image src={image.url} alt={image.name} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover" />
                </div>
                <input
                  type="text"
                  value={image.name}
                  onChange={(e) => updateMainName(image.id, e.target.value)}
                  placeholder="图片名称"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                  onMouseDown={(e) => e.stopPropagation()}
                />
                <button onClick={() => deleteMain(image.id)} className="w-full px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded">删除</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Gallery 展示图片</h3>
            <p className="text-sm text-gray-500">最多 6 张 · 当前 {galleryImages.length} / 6</p>
          </div>
          <label className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors ${galleryImages.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input type="file" multiple accept="image/*" onChange={handleGalleryFileSelect} className="hidden" disabled={galleryImages.length >= 6} />
            + 添加 Gallery 图片
          </label>
        </div>

        {galleryImages.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-gray-400 text-4xl mb-3">🖼️</div>
            <p className="text-gray-500">点击「添加 Gallery 图片」上传</p>
            <p className="text-xs text-gray-400 mt-1">上传后可裁剪选择展示位置</p>
          </div>
        ) : (
          <div className="space-y-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="border border-gray-300 rounded-lg p-4 bg-white flex gap-4">
                <div className="relative w-32 h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <Image src={image.url} alt={image.title} fill sizes="128px" className="object-cover" />
                </div>
                <div className="flex-1 space-y-3">
                  <input type="text" value={image.title} onChange={(e) => updateGallery(image.id, 'title', e.target.value)} placeholder="标题（可选）" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <textarea value={image.description} onChange={(e) => updateGallery(image.id, 'description', e.target.value)} placeholder="描述（可选）" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <div className="flex gap-2">
                    <button onClick={() => moveGallery(image.id, 'up')} disabled={image.sort_order === 0} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-40">↑ 上移</button>
                    <button onClick={() => moveGallery(image.id, 'down')} disabled={image.sort_order === galleryImages.length - 1} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-40">↓ 下移</button>
                    <button onClick={() => deleteGallery(image.id)} className="px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded ml-auto">删除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
