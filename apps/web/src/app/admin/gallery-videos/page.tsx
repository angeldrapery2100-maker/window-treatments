'use client'

import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_VIDEOS, type ProjectVideo } from '@/lib/gallery-videos-data'

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
  isDirty: boolean
  isSaving: boolean
}

type Override = { title?: string; location?: string; tag?: string; description?: string }

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function GalleryVideosPage() {
  const [rows, setRows] = useState<VideoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingAll, setSavingAll] = useState(false)
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(null)

  const showFlash = (text: string, ok = true) => {
    setFlash({ text, ok })
    setTimeout(() => setFlash(null), 2500)
  }

  // Load overrides from DB and merge with defaults
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gallery-videos')
      const data = await res.json()
      const overrides: Record<number, Override> = data.success ? data.data : {}

      setRows(
        DEFAULT_VIDEOS.map(v => {
          const o = overrides[v.id] ?? {}
          return {
            id:          v.id,
            orientation: v.orientation,
            poster:      v.poster,
            title:       o.title       ?? v.title,
            location:    o.location    ?? v.location,
            tag:         o.tag         ?? v.tag,
            description: o.description ?? v.description,
            isDirty:     false,
            isSaving:    false,
          }
        })
      )
    } catch (e) {
      showFlash('Failed to load video data', false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Update a field on a row locally
  const updateRow = (id: number, field: keyof Pick<VideoRow, 'title' | 'location' | 'tag' | 'description'>, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value, isDirty: true } : r))
  }

  // Save a single row
  const saveRow = async (row: VideoRow) => {
    setRows(prev => prev.map(r => r.id === row.id ? { ...r, isSaving: true } : r))
    try {
      const res = await fetch('/api/admin/gallery-videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id:    row.id,
          title:       row.title,
          location:    row.location,
          tag:         row.tag,
          description: row.description,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, isDirty: false, isSaving: false } : r))
        showFlash('Saved')
      } else {
        throw new Error(data.error)
      }
    } catch (e: any) {
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, isSaving: false } : r))
      showFlash('Save failed: ' + e.message, false)
    }
  }

  // Save all dirty rows
  const saveAll = async () => {
    const dirty = rows.filter(r => r.isDirty)
    if (!dirty.length) return
    setSavingAll(true)
    let ok = 0, fail = 0
    for (const row of dirty) {
      try {
        const res = await fetch('/api/admin/gallery-videos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_id: row.id, title: row.title, location: row.location, tag: row.tag, description: row.description }),
        })
        const d = await res.json()
        if (d.success) { ok++; setRows(prev => prev.map(r => r.id === row.id ? { ...r, isDirty: false } : r)) }
        else fail++
      } catch { fail++ }
    }
    setSavingAll(false)
    showFlash(fail ? `Saved ${ok}, failed ${fail}` : `Saved ${ok} video${ok > 1 ? 's' : ''}`, fail === 0)
  }

  // Reset a row to hardcoded defaults
  const resetRow = (id: number) => {
    const def = DEFAULT_VIDEOS.find(v => v.id === id)!
    setRows(prev => prev.map(r => r.id === id
      ? { ...r, title: def.title, location: def.location, tag: def.tag, description: def.description, isDirty: true }
      : r
    ))
  }

  const dirtyCount = rows.filter(r => r.isDirty).length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Gallery Videos</h1>
            <p className="text-sm text-gray-400 mt-0.5">Edit titles, locations, tags, and descriptions for each video</p>
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
              onClick={saveAll}
              disabled={dirtyCount === 0 || savingAll}
              className={`px-5 py-2 text-sm rounded-md font-medium transition-colors ${
                dirtyCount > 0
                  ? 'bg-[#3d3d3d] text-white hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {savingAll ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-24 text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="space-y-3">
            {rows.map(row => (
              <VideoCard
                key={row.id}
                row={row}
                defaultVideo={DEFAULT_VIDEOS.find(v => v.id === row.id)!}
                onUpdate={updateRow}
                onSave={saveRow}
                onReset={resetRow}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Card
// ─────────────────────────────────────────────────────────────────────────────
function VideoCard({
  row, defaultVideo, onUpdate, onSave, onReset,
}: {
  row: VideoRow
  defaultVideo: ProjectVideo
  onUpdate: (id: number, field: 'title' | 'location' | 'tag' | 'description', value: string) => void
  onSave: (row: VideoRow) => void
  onReset: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`bg-white rounded-md border transition-colors ${row.isDirty ? 'border-amber-300' : 'border-gray-200'} overflow-hidden`}>
      {/* Row Header */}
      <div
        className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Poster thumbnail */}
        <div
          className={`relative flex-shrink-0 overflow-hidden rounded bg-gray-100 ${row.orientation === 'landscape' ? 'w-20 h-12' : 'w-9 h-12'}`}
        >
          <img src={row.poster} alt={row.title} className="w-full h-full object-cover" />
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
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

        {/* Chevron */}
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Edit Area */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-4 bg-gray-50/60">

          {/* Title + Location (side by side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Title"
              value={row.title}
              placeholder={defaultVideo.title}
              onChange={v => onUpdate(row.id, 'title', v)}
            />
            <Field
              label="Location"
              value={row.location}
              placeholder={defaultVideo.location}
              onChange={v => onUpdate(row.id, 'location', v)}
            />
          </div>

          {/* Tag */}
          <Field
            label="Tag / Category"
            value={row.tag}
            placeholder={defaultVideo.tag}
            onChange={v => onUpdate(row.id, 'tag', v)}
          />

          {/* Description */}
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

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onSave(row)}
              disabled={row.isSaving || !row.isDirty}
              className={`px-5 py-2 text-sm rounded-md font-medium transition-colors ${
                row.isDirty
                  ? 'bg-[#3d3d3d] text-white hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {row.isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => onReset(row.id)}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-md hover:bg-white transition-colors"
              title="Restore default values"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
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
