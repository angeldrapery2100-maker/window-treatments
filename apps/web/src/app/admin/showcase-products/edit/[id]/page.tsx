'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ImageCropper from '@/app/admin/products/edit/[id]/components/ImageCropper'

interface ProductImage {
  id: number; image_url: string; caption: string; image_type: string; sort_order: number
}
interface ProductSection {
  id?: number; product_id?: number; title: string; description: string
  image_url: string; image_width: number; image_height: number; image_fit: string; sort_order: number
}
interface ProductData {
  id?: number; name: string; description: string; long_description: string
  features: string[]; cover_image: string; cover_width: number; cover_height: number
  cover_fit: string; status: string; sort_order: number
  images: ProductImage[]; sections: ProductSection[]
}

const EMPTY: ProductData = {
  name: '', description: '', long_description: '',
  features: [], cover_image: '', cover_width: 400, cover_height: 400,
  cover_fit: 'cover', status: 'active', sort_order: 0,
  images: [], sections: []
}

const FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
]

export default function EditShowcaseProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = use(params)
  const isNew = paramId === 'new'
  const router = useRouter()
  const [product, setProduct] = useState<ProductData>(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [newFeature, setNewFeature] = useState('')
  const coverRef = useRef<HTMLInputElement>(null)
  const thumbRef = useRef<HTMLInputElement>(null)
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)
  const [cropperType, setCropperType] = useState<'cover' | 'thumb' | { section: number }>('cover')

  const flash = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/showcase-products?id=${paramId}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setProduct({
              ...d.data,
              features: d.data.features || [],
              images: d.data.images || [],
              sections: d.data.sections || [],
            })
          }
        })
        .finally(() => setLoading(false))
    }
  }, [paramId, isNew])

  const uploadFile = async (file: File, productId: string | number): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', String(productId))
    const res = await fetch('/api/admin/showcase-products/upload', { method: 'POST', body: formData })
    const data = await res.json()
    return data.success ? data.data.url : ''
  }

  const handleSave = async () => {
    if (!product.name.trim()) { flash('Please enter a product name', 'error'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/showcase-products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(product.id ? { id: product.id } : {}),
          name: product.name, description: product.description,
          long_description: product.long_description, features: product.features,
          cover_image: product.cover_image, cover_width: product.cover_width,
          cover_height: product.cover_height, cover_fit: product.cover_fit,
          status: product.status, sort_order: product.sort_order
        })
      })
      const data = await res.json()
      if (data.success) {
        const savedId = data.data.id
        for (const section of product.sections) {
          await fetch('/api/admin/showcase-products/sections', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...section, product_id: savedId })
          })
        }
        flash('Saved')
        if (isNew) router.push(`/admin/showcase-products/edit/${savedId}`)
        else {
          const r2 = await fetch(`/api/admin/showcase-products?id=${savedId}`)
          const d2 = await r2.json()
          if (d2.success) setProduct({ ...d2.data, features: d2.data.features || [], images: d2.data.images || [], sections: d2.data.sections || [] })
        }
      } else {
        flash(data.error?.message || 'Save failed', 'error')
      }
    } catch (e: any) { flash(e.message, 'error') }
    finally { setSaving(false) }
  }

  const openCropper = (file: File, type: 'cover' | 'thumb' | { section: number }) => {
    setCropperType(type)
    setCropperSrc(URL.createObjectURL(file))
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    openCropper(file, 'cover')
  }

  const handleThumbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    openCropper(file, 'thumb')
  }

  const handleCropConfirm = async (blob: Blob) => {
    const type = cropperType
    setCropperSrc(null)
    setSaving(true)
    const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' })
    const url = await uploadFile(file, product.id || 'new')
    if (!url) { setSaving(false); return }

    if (type === 'cover') {
      setProduct(prev => ({ ...prev, cover_image: url }))
    } else if (type === 'thumb') {
      if (product.id) {
        await fetch('/api/admin/showcase-products/images', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, image_url: url, image_type: 'thumb', sort_order: product.images.length })
        })
        const r = await fetch(`/api/admin/showcase-products?id=${product.id}`)
        const d = await r.json()
        if (d.success) setProduct(prev => ({ ...prev, images: d.data.images || [] }))
      }
    } else if (typeof type === 'object' && 'section' in type) {
      setProduct(prev => {
        const sections = [...prev.sections]
        sections[type.section] = { ...sections[type.section], image_url: url }
        return { ...prev, sections }
      })
    }
    setSaving(false)
  }

  const handleCropCancel = () => { setCropperSrc(null) }

  const handleDeleteImage = async (imgId: number) => {
    await fetch('/api/admin/showcase-products/images', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: imgId })
    })
    setProduct(prev => ({ ...prev, images: prev.images.filter(i => i.id !== imgId) }))
  }

  const handleSectionImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    openCropper(file, { section: index })
  }

  const addFeature = () => {
    if (!newFeature.trim()) return
    setProduct(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }))
    setNewFeature('')
  }
  const removeFeature = (i: number) => {
    setProduct(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }))
  }

  const addSection = () => {
    setProduct(prev => ({
      ...prev, sections: [...prev.sections, {
        title: '', description: '', image_url: '', image_width: 0, image_height: 0,
        image_fit: 'cover', sort_order: prev.sections.length
      }]
    }))
  }
  const removeSection = async (index: number) => {
    const section = product.sections[index]
    if (section.id) {
      await fetch('/api/admin/showcase-products/sections', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: section.id })
      })
    }
    setProduct(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }))
  }
  const updateSection = (index: number, updates: Partial<ProductSection>) => {
    setProduct(prev => {
      const sections = [...prev.sections]
      sections[index] = { ...sections[index], ...updates }
      return { ...prev, sections }
    })
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin/showcase-products')} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{isNew ? 'Add New Product' : product.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              {message && (
                <span className={`text-sm px-3 py-1.5 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </span>
              )}
              {product.id && (
                <a href={`/products/${product.id}`} target="_blank" className="px-4 py-2 text-xs border border-gray-200 rounded-md hover:bg-gray-50">
                  Preview
                </a>
              )}
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium text-sm">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Product Name *</label>
                <input type="text" value={product.name} onChange={e => setProduct(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm outline-none" placeholder="Custom Drapery" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Status</label>
                  <select value={product.status} onChange={e => setProduct(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Sort Order</label>
                  <input type="number" value={product.sort_order} onChange={e => setProduct(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Short Description</label>
              <textarea value={product.description} onChange={e => setProduct(p => ({ ...p, description: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-y outline-none" placeholder="Handcrafted drapery with premium fabrics..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Full Description</label>
              <textarea value={product.long_description} onChange={e => setProduct(p => ({ ...p, long_description: e.target.value }))}
                rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-y outline-none" placeholder="Our custom drapery service offers..." />
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Cover Image</h2>
          <p className="text-xs text-gray-400 mb-3">Displayed on the Products listing page</p>
          <div className="flex items-start gap-5">
            <div className="relative w-36 h-36 border border-gray-200 border-dashed rounded-md overflow-hidden flex-shrink-0 cursor-pointer hover:border-gray-400 flex items-center justify-center bg-gray-50 transition-colors"
              onClick={() => coverRef.current?.click()}>
              {product.cover_image ? (
                <Image src={product.cover_image} alt="" fill sizes="144px" className="object-cover" />
              ) : (
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-gray-300 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <div className="text-[10px] text-gray-400">Click to upload</div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <button onClick={() => coverRef.current?.click()} className="text-xs px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                {product.cover_image ? 'Replace Image' : 'Upload Image'}
              </button>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              {product.cover_image && <div className="text-[10px] text-gray-400 break-all max-w-xs">{product.cover_image}</div>}
            </div>
          </div>
        </div>

        {/* Detail Images */}
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Detail Images</h2>
          <p className="text-xs text-gray-400 mb-3">Carousel images on the detail page</p>
          {!product.id ? (
            <p className="text-gray-400 text-xs">Save the product first before uploading detail images.</p>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {product.images.map(img => (
                  <div key={img.id} className="relative group">
                    <div className="relative aspect-square border border-gray-200 rounded-md overflow-hidden">
                      <Image src={img.image_url} alt="" fill sizes="(max-width: 768px) 20vw, 120px" className="object-cover" />
                    </div>
                    <button onClick={() => handleDeleteImage(img.id)}
                      className="absolute -top-1.5 -right-1.5 bg-[#3d3d3d] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      &times;
                    </button>
                  </div>
                ))}
                <div className="aspect-square border border-gray-200 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-gray-400 bg-gray-50 transition-colors"
                  onClick={() => thumbRef.current?.click()}>
                  <div className="text-center">
                    <svg className="w-5 h-5 mx-auto text-gray-300 mb-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    <div className="text-[10px] text-gray-400">Add</div>
                  </div>
                </div>
              </div>
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
            </>
          )}
        </div>

        {/* Features */}
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Features</h2>
          <div className="space-y-2 mb-3">
            {product.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
                <span className="flex-1 text-sm">{f}</span>
                <button onClick={() => removeFeature(i)} className="text-gray-400 hover:text-red-600 text-xs transition-colors">Remove</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFeature()}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-gray-400" placeholder="Type a feature, press Enter to add" />
            <button onClick={addFeature} className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 text-sm transition-colors">Add</button>
          </div>
        </div>

        {/* Gallery Sections */}
        <div className="bg-white rounded-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Gallery Sections</h2>
              <p className="text-xs text-gray-400 mt-0.5">Wide image + text overlay blocks for the detail page</p>
            </div>
            <button onClick={addSection} className="px-3.5 py-1.5 text-xs bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700">+ Add Section</button>
          </div>
          <div className="space-y-4">
            {product.sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Section {index + 1}</span>
                  <button onClick={() => removeSection(index)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Title</label>
                      <input type="text" value={section.title} onChange={e => updateSection(index, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" placeholder="Design Options" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <textarea value={section.description} onChange={e => updateSection(index, { description: e.target.value })}
                        rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-y outline-none" placeholder="Choose from hundreds of fabric patterns..." />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs text-gray-500 mb-1">Background Image</label>
                    <div className="relative border border-gray-200 border-dashed rounded-md overflow-hidden cursor-pointer hover:border-gray-400 bg-gray-50 flex items-center justify-center transition-colors"
                      style={{ aspectRatio: section.image_width && section.image_height ? `${section.image_width}/${section.image_height}` : '16/9' }}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'; input.accept = 'image/*'
                        input.onchange = (ev) => handleSectionImageUpload(index, ev as any)
                        input.click()
                      }}>
                      {section.image_url ? (
                        <Image src={section.image_url} alt="" fill sizes="(max-width: 768px) 50vw, 400px" className="object-cover" />
                      ) : (
                        <div className="text-center py-6">
                          <svg className="w-5 h-5 mx-auto text-gray-300 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                          <div className="text-[10px] text-gray-400">Click to upload</div>
                        </div>
                      )}
                    </div>
                    {/* Size + fit controls */}
                    <div className="flex gap-3 items-center flex-wrap">
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-gray-400 uppercase">W:</label>
                        <input type="number" value={section.image_width || ''}
                          onChange={e => updateSection(index, { image_width: parseInt(e.target.value) || 0 })}
                          className="w-16 px-2 py-1 border border-gray-200 rounded-md text-xs outline-none" placeholder="px" />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-gray-400 uppercase">H:</label>
                        <input type="number" value={section.image_height || ''}
                          onChange={e => updateSection(index, { image_height: parseInt(e.target.value) || 0 })}
                          className="w-16 px-2 py-1 border border-gray-200 rounded-md text-xs outline-none" placeholder="px" />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-gray-400 uppercase">Fit:</label>
                        <select value={section.image_fit || 'cover'}
                          onChange={e => updateSection(index, { image_fit: e.target.value })}
                          className="px-2 py-1 border border-gray-200 rounded-md text-xs outline-none">
                          {FIT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {product.sections.length === 0 && (
              <p className="text-gray-400 text-xs text-center py-4">No gallery sections. Click &quot;+ Add Section&quot; to create one.</p>
            )}
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {cropperSrc && (
        <ImageCropper
          imageSrc={cropperSrc}
          aspectRatio={cropperType === 'cover' ? 1 : cropperType === 'thumb' ? 1 : 16 / 9}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          title={cropperType === 'cover' ? 'Crop Cover Image (1:1 Square)' : cropperType === 'thumb' ? 'Crop Carousel Image (1:1 Square)' : 'Crop Image (16:9 Widescreen)'}
        />
      )}
    </div>
  )
}
