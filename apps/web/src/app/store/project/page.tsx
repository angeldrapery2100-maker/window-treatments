'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'

// My Project (/store/project) — the room-by-room plan a visitor builds with
// the AI design assistant. Read-mostly: review items and exact server-computed
// prices, adjust quantities, remove items, and push priced items into the
// cart (checkout re-verifies every price server-side regardless).

interface DisplayOption {
  name: string
  displayLabel: string
  value: string
  valueLabel: string
}

interface ProjectItem {
  id: string
  room_name: string
  product_id: string | null
  product_name: string
  product_type: string
  main_image_url: string | null
  width: string | number | null
  height: string | number | null
  width_fraction: string | null
  height_fraction: string | null
  options_display: DisplayOption[]
  quantity: number
  quoted_price: string | number | null
  quote_error: string | null
  notes: string | null
}

interface Summary {
  itemCount: number
  pricedSubtotal: number
  unpricedCount: number
  rooms: string[]
}

const EMPTY_SUMMARY: Summary = { itemCount: 0, pricedSubtotal: 0, unpricedCount: 0, rooms: [] }

const price = (v: string | number | null): number => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}

const sizeLabel = (it: ProjectItem): string => {
  const parts: string[] = []
  if (it.width != null) parts.push(`${Number(it.width)}${it.width_fraction ? ` ${it.width_fraction}` : ''}″ W`)
  if (it.height != null) parts.push(`${Number(it.height)}${it.height_fraction ? ` ${it.height_fraction}` : ''}″ H`)
  return parts.join(' × ')
}

export default function ProjectPage() {
  const [projectName, setProjectName] = useState('My Home Project')
  const [hasProject, setHasProject] = useState(false)
  const [items, setItems] = useState<ProjectItem[]>([])
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/store/project')
      const json = await res.json()
      if (json?.success) {
        setHasProject(!!json.data.project)
        if (json.data.project?.name) setProjectName(json.data.project.name)
        setItems(json.data.items || [])
        setSummary(json.data.summary || EMPTY_SUMMARY)
      }
    } catch {
      /* shown as empty state */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const saveName = async () => {
    const name = nameInput.trim()
    setEditingName(false)
    if (!name || name === projectName) return
    setProjectName(name)
    try {
      await fetch('/api/store/project', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
    } catch { /* best-effort */ }
  }

  const changeQuantity = async (item: ProjectItem, quantity: number) => {
    const q = Math.max(1, Math.min(99, quantity))
    if (q === item.quantity) return
    setBusyId(item.id)
    try {
      const res = await fetch('/api/store/project/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id, quantity: q }),
      })
      const json = await res.json()
      if (json?.success) {
        setItems(prev => prev.map(i => (i.id === item.id ? { ...i, quantity: q } : i)))
        if (json.data?.summary) setSummary(json.data.summary)
      }
    } catch { /* leave as-is */ } finally {
      setBusyId(null)
    }
  }

  const remove = async (item: ProjectItem) => {
    setBusyId(item.id)
    try {
      const res = await fetch('/api/store/project/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id }),
      })
      const json = await res.json()
      if (json?.success) {
        setItems(prev => prev.filter(i => i.id !== item.id))
        if (json.data?.summary) setSummary(json.data.summary)
      }
    } catch { /* leave as-is */ } finally {
      setBusyId(null)
    }
  }

  const addItemToCart = (item: ProjectItem): boolean => {
    const unitPrice = price(item.quoted_price)
    if (unitPrice <= 0 || !item.product_id) return false
    addToCart({
      productId: item.product_id,
      productName: item.product_name,
      productType: item.product_type,
      mainImageUrl: item.main_image_url,
      width: item.width != null ? Number(item.width) : undefined,
      height: item.height != null ? Number(item.height) : undefined,
      widthFraction: item.width_fraction || undefined,
      heightFraction: item.height_fraction || undefined,
      options: item.options_display || [],
      quantity: item.quantity,
      unitPrice,
    })
    return true
  }

  // Behavioral signal for lead scoring — best-effort, identity comes from
  // cookies server-side (nothing sensitive in the body).
  const reportCartAdd = () => {
    fetch('/api/store/lead-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'project_added_to_cart' }),
    }).catch(() => {})
  }

  const handleAddOne = (item: ProjectItem) => {
    if (addItemToCart(item)) {
      setAddedIds(prev => new Set(prev).add(item.id))
      setNotice('Added to cart.')
      reportCartAdd()
    }
  }

  const handleAddAll = () => {
    let added = 0
    const ids = new Set(addedIds)
    for (const it of items) {
      if (ids.has(it.id)) continue
      if (addItemToCart(it)) { ids.add(it.id); added++ }
    }
    setAddedIds(ids)
    if (added > 0) {
      setNotice(`${added} item${added > 1 ? 's' : ''} added to cart.`)
      reportCartAdd()
    } else {
      setNotice('No priceable items left to add.')
    }
  }

  // Group items by room, preserving server order.
  const rooms: { name: string; items: ProjectItem[] }[] = []
  for (const it of items) {
    const key = it.room_name || 'Other'
    const room = rooms.find(r => r.name === key)
    if (room) room.items.push(it)
    else rooms.push({ name: key, items: [it] })
  }

  const addableCount = items.filter(i => price(i.quoted_price) > 0 && !addedIds.has(i.id)).length

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">My Project · 整屋方案</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {editingName ? (
            <form
              onSubmit={(e) => { e.preventDefault(); void saveName() }}
              className="flex items-center gap-2"
            >
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => void saveName()}
                maxLength={200}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xl font-light focus:border-gray-800 focus:outline-none"
              />
            </form>
          ) : (
            <>
              <h1 className="text-2xl font-light text-gray-900 sm:text-3xl">{projectName}</h1>
              {hasProject && (
                <button
                  onClick={() => { setNameInput(projectName); setEditingName(true) }}
                  className="text-[12px] text-gray-400 underline underline-offset-2 hover:text-gray-700"
                >
                  Rename
                </button>
              )}
            </>
          )}
        </div>

        {loading ? (
          <p className="mt-12 text-sm text-gray-500">Loading your project…</p>
        ) : items.length === 0 ? (
          /* Empty state */
          <div className="mt-12 rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
            <p className="text-base text-gray-800">Your project is empty.</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
              Chat with our design assistant (the bubble at the corner of any page) — tell it about your
              rooms and windows and it will build your plan here, with exact prices, room by room.
              也可以直接用中文告诉 AI 设计助手您每个房间的窗户尺寸，它会帮您把方案存到这里。
            </p>
            <Link
              href="/store"
              className="mt-6 inline-block rounded-full bg-[#3d3d3d] px-6 py-2.5 text-[13px] tracking-wide text-white transition-colors hover:bg-gray-700"
            >
              Browse the store
            </Link>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
              <div className="text-sm text-gray-600">
                {summary.itemCount} item{summary.itemCount !== 1 ? 's' : ''} · {rooms.length} room{rooms.length !== 1 ? 's' : ''}
                {summary.unpricedCount > 0 && (
                  <span className="ml-2 text-amber-600">({summary.unpricedCount} awaiting a price from our team)</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Estimated total</p>
                  <p className="text-xl font-medium text-gray-900">${summary.pricedSubtotal.toLocaleString()}</p>
                </div>
                <button
                  onClick={handleAddAll}
                  disabled={addableCount === 0}
                  className="rounded-full bg-[#3d3d3d] px-5 py-2.5 text-[13px] tracking-wide text-white transition-colors hover:bg-gray-700 disabled:opacity-40"
                >
                  Add all to cart
                </button>
              </div>
            </div>

            {notice && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-green-50 px-4 py-2.5 text-[13px] text-green-800">
                <span>{notice}</span>
                <Link href="/store/cart" className="font-medium underline underline-offset-2">View cart →</Link>
              </div>
            )}

            {/* Rooms */}
            {rooms.map(room => (
              <section key={room.name} className="mt-8">
                <h2 className="text-[13px] font-medium uppercase tracking-[0.15em] text-gray-500">{room.name}</h2>
                <div className="mt-3 space-y-3">
                  {room.items.map(item => {
                    const unit = price(item.quoted_price)
                    const added = addedIds.has(item.id)
                    return (
                      <div
                        key={item.id}
                        className={`flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-opacity ${busyId === item.id ? 'opacity-60' : ''}`}
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.main_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.main_image_url} alt={item.product_name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-400">No image</div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[15px] text-gray-900">{item.product_name}</p>
                              <p className="mt-0.5 text-[12px] text-gray-500">
                                {[sizeLabel(item), (item.options_display || []).map(o => o.valueLabel).join(' · ')]
                                  .filter(Boolean).join('  ·  ')}
                              </p>
                              {item.notes && <p className="mt-1 text-[12px] italic text-gray-400">{item.notes}</p>}
                              {unit <= 0 && (
                                <p className="mt-1 text-[12px] text-amber-600">
                                  Price pending — our team will confirm this item.
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              {unit > 0 ? (
                                <>
                                  <p className="text-[15px] font-medium text-gray-900">${(unit * item.quantity).toLocaleString()}</p>
                                  {item.quantity > 1 && <p className="text-[11px] text-gray-400">${unit.toLocaleString()} each</p>}
                                </>
                              ) : (
                                <p className="text-[13px] text-gray-400">—</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center rounded-full border border-gray-200">
                              <button
                                onClick={() => void changeQuantity(item, item.quantity - 1)}
                                disabled={busyId === item.id || item.quantity <= 1}
                                className="px-3 py-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                                aria-label="Decrease quantity"
                              >−</button>
                              <span className="min-w-[2rem] text-center text-[13px] text-gray-800">{item.quantity}</span>
                              <button
                                onClick={() => void changeQuantity(item, item.quantity + 1)}
                                disabled={busyId === item.id || item.quantity >= 99}
                                className="px-3 py-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                                aria-label="Increase quantity"
                              >+</button>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => void remove(item)}
                                disabled={busyId === item.id}
                                className="text-[12px] text-gray-400 underline underline-offset-2 hover:text-red-600"
                              >
                                Remove
                              </button>
                              {unit > 0 && (
                                <button
                                  onClick={() => handleAddOne(item)}
                                  disabled={added}
                                  className={`rounded-full px-4 py-1.5 text-[12px] tracking-wide transition-colors ${
                                    added
                                      ? 'bg-gray-100 text-gray-400'
                                      : 'bg-[#3d3d3d] text-white hover:bg-gray-700'
                                  }`}
                                >
                                  {added ? 'In cart ✓' : 'Add to cart'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}

            <p className="mt-10 text-center text-[12px] leading-relaxed text-gray-400">
              Prices are computed by the same engine as checkout and re-verified when you order.
              Keep chatting with the design assistant to add more rooms, or call us at 626-451-9841.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
