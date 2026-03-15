'use client'

import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_VIDEOS, type ProjectVideo } from '@/lib/gallery-videos-data'
import { uploadGalleryFile } from './actions'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface VideoRow {
  id: number
  title: string
  location: string
  tag: string
  description: string
  orientation: 'landscape' | 'portrait'
  poster: string
  video: string
  isPublished: boolean
  isDirty: boolean
  isSaving: boolean
}

interface CustomVideoRow {
  dbId: number
  title: string
  location: string
  tag: string
  description: string
  orientation: 'landscape' | 'portrait'
  poster: string
  video: string
}

type Override = { title?: string; location?: string; tag?: string; description?: string; is_published?: boolean }

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function GalleryVideosPage() {
  const [defaultRows, setDefaultRows] = useState<VideoRow[]>([])
  const [customRows, setCustomRows] = useState<CustomVideoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingAll, setSavingAll] = useState(false)
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const showFlash = (text: string, ok = true) => {
    setFlash({ text, ok })
    setTimeout(() => setFlash(null), 2500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gallery-videos')
      const data = await res.json()
      const overrides: Record<number, Override> = data.success ? data.data : {}
      const customs: any[] = data.customVideos || []

      setDefaultRows(
        DEFAULT_VIDEOS.map(v => {
          const o = overrides[v.id] ?? {}
          return {
            id:          v.id,
            orientation: v.orientation,
            poster:      v.poster,
            video:       v.video,
            title:       o.title       ?? v.title,
            location:    o.location    ?? v.location,
            tag:         o.tag         ?? v.tag,
            description: o.description ?? v.description,
            isPublished: o.is_published !== undefined ? o.is_published : true,
            isDirty:     false,
            isSaving:    false,
          }
        })
      )

      setCustomRows(
        customs.map((c: any) => ({
          dbId:        c.id,
          title:       c.title || '',
          location:    c.location || '',
          tag:         c.tag || '',
          description: c.description || '',
          orientation: c.orientation || 'landscape',
          poster:      c.poster_url,
          video:       c.video_url,
        }))
      )
    } catch {
      showFlash('Failed to load video data', false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Default video actions ──

  const updateDefaultRow = (id: number, field: 'title' | 'location' | 'tag' | 'description', value: string) => {
    setDefaultRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value, isDirty: true } : r))
  }

  const saveDefaultRow = async (row: VideoRow) => {
    setDefaultRows(prev => prev.map(r => r.id === row.id ? { ...r, isSaving: true } : r))
    try {
      const res = await fetch('/api/admin/gallery-videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: row.id, title: row.title, location: row.location,
          tag: row.tag, description: row.description, is_published: row.isPublished,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDefaultRows(prev => prev.map(r => r.id === row.id ? { ...r, isDirty: false, isSaving: false } : r))
        showFlash('已保存')
      } else throw new Error(data.error)
    } catch (e: any) {
      setDefaultRows(prev => prev.map(r => r.id === row.id ? { ...r, isSaving: false } : r))
      showFlash('保存失败: ' + e.message, false)
    }
  }

  // Delete a default video = hide it (set is_published=false) and auto-save
  const deleteDefaultVideo = async (row: VideoRow) => {
    if (!confirm(`确定删除「${row.title}」？删除后可在底部「已删除」中恢复。`)) return
    try {
      const res = await fetch('/api/admin/gallery-videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: row.id, title: row.title, location: row.location,
          tag: row.tag, description: row.description, is_published: false,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDefaultRows(prev => prev.map(r => r.id === row.id ? { ...r, isPublished: false, isDirty: false } : r))
        showFlash('已删除')
      } else throw new Error(data.error)
    } catch (e: any) {
      showFlash('删除失败: ' + e.message, false)
    }
  }

  // Restore a deleted default video
  const restoreDefaultVideo = async (row: VideoRow) => {
    try {
      const res = await fetch('/api/admin/gallery-videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: row.id, title: row.title, location: row.location,
          tag: row.tag, description: row.description, is_published: true,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDefaultRows(prev => prev.map(r => r.id === row.id ? { ...r, isPublished: true, isDirty: false } : r))
        showFlash('已恢复')
      } else throw new Error(data.error)
    } catch (e: any) {
      showFlash('恢复失败: ' + e.message, false)
    }
  }

  const resetRow = (id: number) => {
    const def = DEFAULT_VIDEOS.find(v => v.id === id)!
    setDefaultRows(prev => prev.map(r => r.id === id
      ? { ...r, title: def.title, location: def.location, tag: def.tag, description: def.description, isDirty: true }
      : r
    ))
  }

  const saveAll = async () => {
    const dirty = defaultRows.filter(r => r.isDirty)
    if (!dirty.length) return
    setSavingAll(true)
    let ok = 0, fail = 0
    for (const row of dirty) {
      try {
        const res = await fetch('/api/admin/gallery-videos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video_id: row.id, title: row.title, location: row.location,
            tag: row.tag, description: row.description, is_published: row.isPublished,
          }),
        })
        const d = await res.json()
        if (d.success) { ok++; setDefaultRows(prev => prev.map(r => r.id === row.id ? { ...r, isDirty: false } : r)) }
        else fail++
      } catch { fail++ }
    }
    setSavingAll(false)
    showFlash(fail ? `保存 ${ok} 个，失败 ${fail} 个` : `已保存 ${ok} 个视频`, fail === 0)
  }

  // ── Custom video actions ──

  const deleteCustomVideo = async (dbId: number) => {
    if (!confirm('确定删除这个自定义视频？此操作不可恢复。')) return
    try {
      const res = await fetch(`/api/admin/gallery-videos?id=${dbId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setCustomRows(prev => prev.filter(r => r.dbId !== dbId))
      showFlash('已删除')
    } catch (e: any) {
      showFlash('删除失败: ' + e.message, false)
    }
  }

  // ── Computed ──
  const activeDefaults = defaultRows.filter(r => r.isPublished)
  const deletedDefaults = defaultRows.filter(r => !r.isPublished)
  const dirtyCount = defaultRows.filter(r => r.isDirty).length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Gallery Videos</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              共 {activeDefaults.length + customRows.length} 个视频
              {deletedDefaults.length > 0 && <span className="text-red-400 ml-1">· {deletedDefaults.length} 个已删除</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {flash && (
              <span className={`text-sm px-3 py-1.5 rounded-md ${flash.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {flash.text}
              </span>
            )}
            {dirtyCount > 0 && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                {dirtyCount} unsaved
              </span>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 text-sm rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              添加视频
            </button>
            {dirtyCount > 0 && (
              <button
                onClick={saveAll}
                disabled={savingAll}
                className="px-5 py-2 text-sm rounded-md font-medium bg-[#3d3d3d] text-white hover:bg-gray-700 transition-colors"
              >
                {savingAll ? '保存中...' : '保存全部'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Video Modal */}
      {showAddForm && (
        <AddVideoModal
          onClose={() => setShowAddForm(false)}
          onAdded={() => { setShowAddForm(false); load(); showFlash('视频已添加') }}
        />
      )}

      {/* Content */}
      <div className="px-8 py-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-24 text-gray-400 text-sm">Loading...</div>
        ) : (
          <>
            {/* Custom videos */}
            {customRows.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">自定义视频 ({customRows.length})</h2>
                <div className="space-y-3">
                  {customRows.map(row => (
                    <CustomVideoCard key={row.dbId} row={row} onDelete={deleteCustomVideo} />
                  ))}
                </div>
              </div>
            )}

            {/* Active default videos */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                默认视频 ({activeDefaults.length})
              </h2>
              {activeDefaults.length === 0 ? (
                <div className="text-center py-12 text-gray-300 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                  所有默认视频已删除
                </div>
              ) : (
                <div className="space-y-3">
                  {activeDefaults.map(row => (
                    <DefaultVideoCard
                      key={row.id}
                      row={row}
                      defaultVideo={DEFAULT_VIDEOS.find(v => v.id === row.id)!}
                      onUpdate={updateDefaultRow}
                      onSave={saveDefaultRow}
                      onReset={resetRow}
                      onDelete={deleteDefaultVideo}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Deleted default videos */}
            {deletedDefaults.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => setShowDeleted(s => !s)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-3"
                >
                  <svg className={`w-4 h-4 transition-transform ${showDeleted ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  已删除 ({deletedDefaults.length})
                </button>
                {showDeleted && (
                  <div className="space-y-2">
                    {deletedDefaults.map(row => (
                      <div key={row.id} className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-md px-5 py-3 opacity-60">
                        <div className={`flex-shrink-0 overflow-hidden rounded bg-gray-100 ${row.orientation === 'landscape' ? 'w-16 h-10' : 'w-7 h-10'}`}>
                          <img src={row.poster} alt={row.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-500 truncate">{row.title}</p>
                          <p className="text-[10px] text-gray-400">{row.location} · {row.tag}</p>
                        </div>
                        <button
                          onClick={() => restoreDefaultVideo(row)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          恢复
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Video Card
// ─────────────────────────────────────────────────────────────────────────────
function DefaultVideoCard({
  row, defaultVideo, onUpdate, onSave, onReset, onDelete,
}: {
  row: VideoRow
  defaultVideo: ProjectVideo
  onUpdate: (id: number, field: 'title' | 'location' | 'tag' | 'description', value: string) => void
  onSave: (row: VideoRow) => void
  onReset: (id: number) => void
  onDelete: (row: VideoRow) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`bg-white rounded-md border transition-colors overflow-hidden ${
      row.isDirty ? 'border-amber-300' : 'border-gray-200'
    }`}>
      {/* Row Header */}
      <div className="flex items-center gap-4 px-5 py-3.5">
        {/* Poster thumbnail */}
        <div
          className={`relative flex-shrink-0 overflow-hidden rounded bg-gray-100 cursor-pointer ${row.orientation === 'landscape' ? 'w-20 h-12' : 'w-9 h-12'}`}
          onClick={() => setExpanded(e => !e)}
        >
          <img src={row.poster} alt={row.title} className="w-full h-full object-cover" />
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(e => !e)}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400">No.{String(row.id).padStart(2, '0')}</span>
            {row.isDirty && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide">Unsaved</span>}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide ${row.orientation === 'landscape' ? 'bg-sky-50 text-sky-600' : 'bg-purple-50 text-purple-600'}`}>
              {row.orientation}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{row.title}</p>
          <p className="text-[11px] text-gray-400 truncate">{row.location} · {row.tag}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Delete */}
          <button
            onClick={() => onDelete(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
            title="删除视频"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>

          {/* Chevron */}
          <button onClick={() => setExpanded(e => !e)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Edit Area */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-4 bg-gray-50/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title" value={row.title} placeholder={defaultVideo.title} onChange={v => onUpdate(row.id, 'title', v)} />
            <Field label="Location" value={row.location} placeholder={defaultVideo.location} onChange={v => onUpdate(row.id, 'location', v)} />
          </div>
          <Field label="Tag / Category" value={row.tag} placeholder={defaultVideo.tag} onChange={v => onUpdate(row.id, 'tag', v)} />
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <textarea
              value={row.description}
              onChange={e => onUpdate(row.id, 'description', e.target.value)}
              rows={3}
              placeholder={defaultVideo.description}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-y outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onSave(row)}
              disabled={row.isSaving || !row.isDirty}
              className={`px-5 py-2 text-sm rounded-md font-medium transition-colors ${
                row.isDirty ? 'bg-[#3d3d3d] text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {row.isSaving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={() => onReset(row.id)}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-md hover:bg-white transition-colors"
            >
              恢复默认值
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Video Card
// ─────────────────────────────────────────────────────────────────────────────
function CustomVideoCard({ row, onDelete }: { row: CustomVideoRow; onDelete: (dbId: number) => void }) {
  return (
    <div className="bg-white rounded-md border border-blue-200 overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-3.5">
        <div className={`relative flex-shrink-0 overflow-hidden rounded bg-gray-100 ${row.orientation === 'landscape' ? 'w-20 h-12' : 'w-9 h-12'}`}>
          <img src={row.poster} alt={row.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide">自定义</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide ${row.orientation === 'landscape' ? 'bg-sky-50 text-sky-600' : 'bg-purple-50 text-purple-600'}`}>
              {row.orientation}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{row.title || '(未命名)'}</p>
          <p className="text-[11px] text-gray-400 truncate">{row.location || '–'} · {row.tag || '–'}</p>
        </div>
        <button
          onClick={() => onDelete(row.dbId)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
          title="删除视频"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Video Modal
// ─────────────────────────────────────────────────────────────────────────────
function AddVideoModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [tag, setTag] = useState('')
  const [description, setDescription] = useState('')
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')

  const handleSubmit = async () => {
    if (!videoFile || !posterFile) {
      alert('请选择视频文件和封面图片')
      return
    }
    setUploading(true)
    try {
      // Upload video via Server Action (bypasses Vercel 4.5MB API route limit)
      setProgress('上传视频中...')
      const videoForm = new FormData()
      videoForm.append('file', videoFile)
      videoForm.append('fileType', 'video')
      const videoResult = await uploadGalleryFile(videoForm)
      if (!videoResult.success) throw new Error(videoResult.error || '视频上传失败')

      // Upload poster via Server Action
      setProgress('上传封面中...')
      const posterForm = new FormData()
      posterForm.append('file', posterFile)
      posterForm.append('fileType', 'poster')
      const posterResult = await uploadGalleryFile(posterForm)
      if (!posterResult.success) throw new Error(posterResult.error || '封面上传失败')

      // Save metadata via API route (small JSON payload, no size issue)
      setProgress('保存中...')
      const saveRes = await fetch('/api/admin/gallery-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, location, tag, description, orientation,
          video_url: videoResult.data!.url,
          poster_url: posterResult.data!.url,
        }),
      })
      const saveJson = await saveRes.json()
      if (!saveJson.success) throw new Error(saveJson.error || '保存失败')

      onAdded()
    } catch (e: any) {
      alert('添加失败: ' + e.message)
    } finally {
      setUploading(false)
      setProgress('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">添加新视频</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Video file */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">视频文件 *</label>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={e => setVideoFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-200 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
            {videoFile && <p className="text-[10px] text-gray-400 mt-1">{videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
          </div>

          {/* Poster file */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">封面图片 *</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={e => setPosterFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-200 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">方向</label>
            <div className="flex gap-3">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors ${orientation === 'landscape' ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-500'}`}>
                <input type="radio" name="orientation" value="landscape" checked={orientation === 'landscape'} onChange={() => setOrientation('landscape')} className="hidden" />
                <svg className="w-5 h-3" viewBox="0 0 20 12" fill="currentColor"><rect width="20" height="12" rx="1" /></svg>
                横屏
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors ${orientation === 'portrait' ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500'}`}>
                <input type="radio" name="orientation" value="portrait" checked={orientation === 'portrait'} onChange={() => setOrientation('portrait')} className="hidden" />
                <svg className="w-3 h-5" viewBox="0 0 12 20" fill="currentColor"><rect width="12" height="20" rx="1" /></svg>
                竖屏
              </label>
            </div>
          </div>

          {/* Text fields */}
          <Field label="标题" value={title} placeholder="e.g. Custom Drapery" onChange={setTitle} />
          <Field label="地点" value={location} placeholder="e.g. Pasadena, CA" onChange={setLocation} />
          <Field label="标签" value={tag} placeholder="e.g. Handcrafted" onChange={setTag} />
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Video description..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-y outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          {progress && <span className="text-sm text-gray-500 animate-pulse mr-auto">{progress}</span>}
          <button onClick={onClose} disabled={uploading} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !videoFile || !posterFile}
            className={`px-5 py-2 text-sm rounded-md font-medium transition-colors ${
              uploading || !videoFile || !posterFile
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? '上传中...' : '添加视频'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Field Input
// ─────────────────────────────────────────────────────────────────────────────
function Field({
  label, value, placeholder, onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
      />
    </div>
  )
}
