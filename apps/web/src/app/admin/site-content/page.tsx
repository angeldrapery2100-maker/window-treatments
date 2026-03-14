'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================================
// Types
// ============================================================
interface ContentItem {
  id: string
  page: string
  section: string
  field_key: string
  field_type: string // text | richtext | image | video
  content: string
  image_url: string
  image_width: number
  image_height: number
  image_fit: string
  sort_order: number
  metadata: any
  is_published?: boolean
}

// ============================================================
// Page / section labels
// ============================================================
const PAGE_LABELS: Record<string, string> = {
  home: 'Home',
  about: 'About',
  gallery: 'Gallery',
  products: 'Products',
  global: 'Global',
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  luma: 'Luma Collection Showcase',
  gallery: 'Project Gallery',
  about: 'About Us',
  process: 'Service Process',
  contact: 'Contact Info',
  story: 'Our Story',
  values: 'Core Values',
  services: 'Services',
  brands: 'Partner Brands',
  projects: 'Projects',
  items: 'Product List',
  footer: 'Footer',
}

const PAGES = ['home', 'about', 'gallery', 'products', 'global']

const FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
]

// ============================================================
// Main Component
// ============================================================
export default function SiteContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('home')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set())
  const [savingAll, setSavingAll] = useState(false)
  const hasDirty = dirtyIds.size > 0

  // Fetch content
  const fetchContent = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/site-content?page=${activePage}`)
      const data = await res.json() as any
      if (data.success) setItems(data.data)
    } catch (e) {
      console.error('Fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [activePage])

  useEffect(() => { fetchContent() }, [fetchContent])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyIds.size > 0) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirtyIds])

  const flash = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 2500)
  }

  // Seed default data
  const handleSeed = async () => {
    if (!confirm('Initialize default content blocks for all pages? Existing content will not be overwritten.')) return
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/site-content/seed', { method: 'POST' })
      const data = await res.json() as any
      flash(data.message || 'Done')
      fetchContent()
    } catch (e: any) {
      flash('Initialization failed: ' + e.message, 'error')
    } finally {
      setSeeding(false)
    }
  }

  // Save a single field
  const saveField = async (item: ContentItem) => {
    setSaving(item.id)
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      const data = await res.json() as any
      if (data.success) {
        setDirtyIds(prev => { const n = new Set(prev); n.delete(item.id); return n })
        flash('Saved')
      }
    } catch (e: any) {
      flash('Save failed: ' + e.message, 'error')
    } finally {
      setSaving(null)
    }
  }

  // Save all dirty items
  const saveAll = async () => {
    if (dirtyIds.size === 0) return
    setSavingAll(true)
    const dirtyItems = items.filter(i => dirtyIds.has(i.id))
    let ok = 0, fail = 0
    for (const item of dirtyItems) {
      try {
        const res = await fetch('/api/admin/site-content', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        const data = await res.json() as any
        if (data.success) ok++; else fail++
      } catch { fail++ }
    }
    setDirtyIds(new Set())
    setSavingAll(false)
    flash(fail > 0 ? `Saved: ${ok} succeeded, ${fail} failed` : `Saved ${ok} change${ok > 1 ? 's' : ''}`, fail > 0 ? 'error' : 'success')
  }

  // Delete a field
  const deleteField = async (id: string) => {
    if (!confirm('Delete this content block?')) return
    try {
      await fetch('/api/admin/site-content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      fetchContent()
    } catch (e) {
      console.error(e)
    }
  }

  // Toggle published state (immediate API call, no dirty tracking needed)
  const togglePublish = async (item: ContentItem) => {
    const newPublished = !(item.is_published ?? true)
    // Optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_published: newPublished } : i))
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, is_published: newPublished }),
      })
      const data = await res.json() as any
      if (!data.success) {
        // Revert on failure
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_published: !newPublished } : i))
        flash('Failed to update publish state', 'error')
      } else {
        flash(newPublished ? 'Published' : 'Set to draft')
      }
    } catch {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_published: !newPublished } : i))
      flash('Failed to update publish state', 'error')
    }
  }

  // Update item locally + mark dirty
  const updateItem = (id: string, updates: Partial<ContentItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
    setDirtyIds(prev => new Set(prev).add(id))
  }

  // Upload image
  const uploadImage = async (item: ContentItem, file: File) => {
    setSaving(item.id)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('page', item.page)
      formData.append('section', item.section)

      const res = await fetch('/api/admin/site-content/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json() as any
      if (data.success) {
        const updated = { ...item, image_url: data.data.url }
        updateItem(item.id, { image_url: data.data.url })
        await saveField(updated)
      }
    } catch (e: any) {
      flash('Upload failed: ' + e.message, 'error')
    } finally {
      setSaving(null)
    }
  }

  // Add a new project group
  const addProject = async () => {
    const projectNums = items
      .filter(i => i.section === 'projects' && i.field_key.startsWith('project_'))
      .map(i => {
        const match = i.field_key.match(/project_(\d+)/)
        return match ? parseInt(match[1]) : 0
      })
    const nextNum = projectNums.length > 0 ? Math.max(...projectNums) + 1 : 1
    const sortBase = nextNum * 10

    const fields = [
      { field_key: `project_${nextNum}_title`, field_type: 'text', content: `Project ${nextNum}`, sort_order: sortBase },
      { field_key: `project_${nextNum}_location`, field_type: 'text', content: '', sort_order: sortBase + 1 },
      { field_key: `project_${nextNum}_image`, field_type: 'image', content: `Project ${nextNum}`, image_width: 600, image_height: 450, sort_order: sortBase + 2 },
    ]

    for (const f of fields) {
      await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 'gallery', section: 'projects', ...f })
      })
    }
    flash(`Added Project ${nextNum}`)
    fetchContent()
  }

  // Delete an entire project group
  const deleteProject = async (projectNum: number) => {
    if (!confirm(`Delete all content for Project ${projectNum}?`)) return
    const prefix = `project_${projectNum}_`
    const toDelete = items.filter(i => i.section === 'projects' && i.field_key.startsWith(prefix))
    for (const item of toDelete) {
      await fetch('/api/admin/site-content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      })
    }
    flash(`Deleted Project ${projectNum}`)
    fetchContent()
  }

  // Group items by section
  const filteredItems = activePage === 'products' ? items.filter(item => item.section !== 'items') : items
  const sections = filteredItems.reduce<Record<string, ContentItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const expandAll = () => setExpandedSections(new Set(Object.keys(sections)))
  const collapseAll = () => setExpandedSections(new Set())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Site Content</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage images and text for each page</p>
            </div>
            <div className="flex gap-3 items-center">
              {message && (
                <span className={`text-sm px-3 py-1.5 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </span>
              )}
              {hasDirty && (
                <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                  {dirtyIds.size} unsaved
                </span>
              )}
              <button onClick={saveAll} disabled={!hasDirty || savingAll}
                className={`px-5 py-2 text-sm rounded-md font-medium transition-colors ${
                  hasDirty ? 'bg-[#3d3d3d] text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}>
                {savingAll ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            {PAGES.map(page => (
              <button
                key={page}
                onClick={() => {
                  if (hasDirty && !confirm('You have unsaved changes. Switching pages will discard them. Continue?')) return
                  setDirtyIds(new Set())
                  setActivePage(page); setExpandedSections(new Set())
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === page
                    ? 'bg-[#3d3d3d] text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {PAGE_LABELS[page] || page}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">No content blocks on this page yet</p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-5 py-2 bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 text-sm font-medium"
            >
              {seeding ? 'Initializing...' : 'Initialize Default Content'}
            </button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-4 text-sm">
              <button onClick={expandAll} className="text-gray-500 hover:text-gray-900">Expand All</button>
              <span className="text-gray-300">|</span>
              <button onClick={collapseAll} className="text-gray-500 hover:text-gray-900">Collapse All</button>
              <span className="text-gray-200 mx-2">|</span>
              <span className="text-gray-400">{filteredItems.length} blocks, {Object.keys(sections).length} sections</span>
            </div>

            {/* Showcase products link */}
            {activePage === 'products' && (
              <a href="/admin/showcase-products" className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-5 py-3.5 mb-4 hover:bg-gray-50 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-900">Product List Management</span>
                  <p className="text-xs text-gray-400 mt-0.5">Add, edit, and sort showcase products — managed separately</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </a>
            )}

            {/* Sections */}
            <div className="space-y-3">
              {Object.entries(sections).map(([sectionKey, sectionItems]) => (
                <SectionPanel
                  key={sectionKey}
                  sectionKey={sectionKey}
                  activePage={activePage}
                  items={sectionItems}
                  expanded={expandedSections.has(sectionKey)}
                  onToggle={() => toggleSection(sectionKey)}
                  onUpdateItem={updateItem}
                  onSaveItem={saveField}
                  onDeleteItem={deleteField}
                  onUploadImage={uploadImage}
                  onTogglePublish={togglePublish}
                  savingId={saving}
                  onAddProject={addProject}
                  onDeleteProject={deleteProject}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Section Panel
// ============================================================
function SectionPanel({
  sectionKey, activePage, items, expanded, onToggle, onUpdateItem, onSaveItem, onDeleteItem, onUploadImage, onTogglePublish, savingId, onAddProject, onDeleteProject,
}: {
  sectionKey: string
  activePage: string
  items: ContentItem[]
  expanded: boolean
  onToggle: () => void
  onUpdateItem: (id: string, updates: Partial<ContentItem>) => void
  onSaveItem: (item: ContentItem) => void
  onDeleteItem: (id: string) => void
  onUploadImage: (item: ContentItem, file: File) => void
  onTogglePublish: (item: ContentItem) => void
  savingId: string | null
  onAddProject: () => void
  onDeleteProject: (num: number) => void
}) {
  const imageCount = items.filter(i => i.field_type === 'image' || i.field_type === 'video').length
  const textCount = items.filter(i => i.field_type === 'text' || i.field_type === 'richtext').length
  const isProjectsSection = activePage === 'gallery' && sectionKey === 'projects'

  // Group items by project number
  const projectGroups: { num: number; items: ContentItem[] }[] = []
  if (isProjectsSection) {
    const grouped: Record<number, ContentItem[]> = {}
    items.forEach(item => {
      const match = item.field_key.match(/project_(\d+)/)
      if (match) {
        const num = parseInt(match[1])
        if (!grouped[num]) grouped[num] = []
        grouped[num].push(item)
      }
    })
    Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b)).forEach(k => {
      projectGroups.push({ num: parseInt(k), items: grouped[parseInt(k)] })
    })
  }

  return (
    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center">
        <button
          onClick={onToggle}
          className="flex-1 px-5 py-3.5 flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">
              {SECTION_LABELS[sectionKey] || sectionKey}
            </span>
            <span className="text-[11px] text-gray-400">
              {isProjectsSection
                ? `${projectGroups.length} project${projectGroups.length !== 1 ? 's' : ''}`
                : [textCount > 0 && `${textCount} text`, imageCount > 0 && `${imageCount} image${imageCount > 1 ? 's' : ''}`].filter(Boolean).join(', ')
              }
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isProjectsSection && expanded && (
          <button onClick={onAddProject} className="mr-4 px-3.5 py-1.5 text-xs bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 flex-shrink-0">
            + Add Project
          </button>
        )}
      </div>

      {/* Fields */}
      {expanded && (
        <div className="border-t border-gray-200">
          {isProjectsSection ? (
            <div className="divide-y divide-gray-100">
              {projectGroups.map(group => (
                <div key={group.num} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Project {group.num}</span>
                    <button onClick={() => onDeleteProject(group.num)} className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md">
                      Delete Project
                    </button>
                  </div>
                  <div className="space-y-2">
                    {group.items.map(item => (
                      <FieldEditor
                        key={item.id}
                        item={item}
                        onUpdate={onUpdateItem}
                        onSave={onSaveItem}
                        onDelete={onDeleteItem}
                        onUpload={onUploadImage}
                        onTogglePublish={onTogglePublish}
                        isSaving={savingId === item.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {projectGroups.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  No projects yet. Click &quot;+ Add Project&quot; above to get started.
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <FieldEditor
                  key={item.id}
                  item={item}
                  onUpdate={onUpdateItem}
                  onSave={onSaveItem}
                  onDelete={onDeleteItem}
                  onUpload={onUploadImage}
                  onTogglePublish={onTogglePublish}
                  isSaving={savingId === item.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Field Editor
// ============================================================
function FieldEditor({
  item, onUpdate, onSave, onDelete, onUpload, onTogglePublish, isSaving,
}: {
  item: ContentItem
  onUpdate: (id: string, updates: Partial<ContentItem>) => void
  onSave: (item: ContentItem) => void
  onDelete: (id: string) => void
  onUpload: (item: ContentItem, file: File) => void
  onTogglePublish: (item: ContentItem) => void
  isSaving: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const isImage = item.field_type === 'image' || item.field_type === 'video'

  const typeLabel = item.field_type === 'image' ? 'IMAGE' : item.field_type === 'video' ? 'VIDEO' : item.field_type === 'richtext' ? 'RICH TEXT' : 'TEXT'

  return (
    <div className="px-5 py-3.5 hover:bg-gray-50/50">
      <div className="flex items-start gap-4">
        {/* Label */}
        <div className="w-36 flex-shrink-0 pt-2">
          <div className="text-sm font-medium text-gray-700">{item.field_key.replace(/_/g, ' ')}</div>
          <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">{typeLabel}</div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-w-0">
          {isImage ? (
            <ImageEditor
              item={item}
              onUpdate={onUpdate}
              onUpload={onUpload}
              fileRef={fileRef}
            />
          ) : item.field_type === 'richtext' ? (
            <textarea
              value={item.content}
              onChange={(e) => onUpdate(item.id, { content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm resize-y outline-none"
              placeholder="Enter content..."
            />
          ) : (
            <input
              type="text"
              value={item.content}
              onChange={(e) => onUpdate(item.id, { content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm outline-none"
              placeholder="Enter content..."
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 flex-shrink-0 pt-1">
          <button
            onClick={() => onTogglePublish(item)}
            title={item.is_published === false ? 'Draft — click to publish' : 'Published — click to unpublish'}
            className={`p-1.5 rounded-md transition-colors ${
              item.is_published === false
                ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'
                : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {item.is_published === false ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onSave(item)}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs bg-[#3d3d3d] text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Image Editor
// ============================================================
function ImageEditor({
  item, onUpdate, onUpload, fileRef,
}: {
  item: ContentItem
  onUpdate: (id: string, updates: Partial<ContentItem>) => void
  onUpload: (item: ContentItem, file: File) => void
  fileRef: React.RefObject<HTMLInputElement | null>
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(item, file)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div
          className="border border-gray-200 border-dashed rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
          style={{
            width: Math.min(item.image_width || 160, 200),
            height: Math.min(item.image_height || 120, 150),
          }}
          onClick={() => fileRef.current?.click()}
        >
          {item.image_url ? (
            item.field_type === 'video' ? (
              <video
                src={item.image_url}
                muted
                className="w-full h-full"
                style={{ objectFit: item.image_fit as any || 'cover' }}
              />
            ) : (
              <img
                src={item.image_url}
                alt={item.content}
                className="w-full h-full"
                style={{ objectFit: item.image_fit as any || 'cover' }}
              />
            )
          ) : (
            <div className="text-center p-2">
              <svg className="w-6 h-6 mx-auto text-gray-300 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <div className="text-[10px] text-gray-400">Click to upload</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={item.content}
            onChange={(e) => onUpdate(item.id, { content: e.target.value })}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none"
            placeholder="Alt text / caption"
          />

          {item.image_url && (
            <div className="text-[10px] text-gray-400 truncate">{item.image_url}</div>
          )}

          {/* Size Controls */}
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-gray-400 uppercase">W:</label>
              <input
                type="number"
                value={item.image_width || ''}
                onChange={(e) => onUpdate(item.id, { image_width: parseInt(e.target.value) || 0 })}
                className="w-16 px-2 py-1 border border-gray-200 rounded-md text-xs outline-none"
                placeholder="px"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-gray-400 uppercase">H:</label>
              <input
                type="number"
                value={item.image_height || ''}
                onChange={(e) => onUpdate(item.id, { image_height: parseInt(e.target.value) || 0 })}
                className="w-16 px-2 py-1 border border-gray-200 rounded-md text-xs outline-none"
                placeholder="px"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-gray-400 uppercase">Fit:</label>
              <select
                value={item.image_fit || 'cover'}
                onChange={(e) => onUpdate(item.id, { image_fit: e.target.value })}
                className="px-2 py-1 border border-gray-200 rounded-md text-xs outline-none"
              >
                {FIT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Button */}
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
            >
              {item.image_url ? (item.field_type === 'video' ? 'Replace Video' : 'Replace Image') : (item.field_type === 'video' ? 'Upload Video' : 'Upload Image')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={item.field_type === 'video' ? 'video/mp4,video/quicktime,video/webm' : 'image/*'}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
