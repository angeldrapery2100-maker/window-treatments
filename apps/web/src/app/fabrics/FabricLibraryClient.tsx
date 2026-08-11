'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { readFavorites, subscribeFavorites, toggleFavorite } from '@/lib/fabricFavorites'
import { ESTIMATE_DISCLAIMER_LONG } from '@/lib/estimateCopy'

/* ── the compact payload from /api/fabrics ────────────────────────────────
   Row layout is defined once, in draperyFabricLibrary.ts (FABRIC_INDEX_FIELDS).
   Both ends must move together.                                            */
const R_ID = 0, R_NAME = 1, R_COLOR = 2, R_BRAND = 3, R_IMG = 4, R_COLORS = 5,
      R_PATTERN = 6, R_MATERIAL = 7, R_STYLE = 8, R_FLAGS = 9, R_BAND = 10,
      R_PRICE = 11, R_SWATCH = 12
const FLAG_SHEER = 1, FLAG_PRICED = 2

type Row = [string, string, string, number, string | null, number[], number, number, number, number, number, number, string | null]

interface Index {
  generatedAt: string
  count: number
  showPrices: boolean
  dict: { brand: string[]; color: string[]; pattern: string[]; material: string[]; style: string[]; band: string[] }
  rows: Row[]
}

interface Detail {
  id: string; brand: string; sku: string; name: string; color: string; book: string; origin: string
  material: string; materialClass: string; colorFamily: string | null; patternType: string
  style: string | null; sheer: boolean; widthIn: number | null
  repeatVIn: number | null; repeatHIn: number | null
  pricePerYard: number | null; priceStatus: 'ready' | 'ask_in_store'; priceBand: string | null
  thumbUrl: string | null; largeUrl: string | null
}

/* ── filter model ─────────────────────────────────────────────────────────
   Six dimensions, each multi-select, all reflected in the query string so a
   filtered view is a link someone can send to their designer.              */
type DictKey = 'color' | 'pattern' | 'material' | 'style' | 'band'
const FACETS: Array<{ param: string; label: string; dict: DictKey; col: number; multi: true }> = [
  { param: 'c', label: 'Color',    dict: 'color',    col: R_COLORS,   multi: true },
  { param: 'p', label: 'Pattern',  dict: 'pattern',  col: R_PATTERN,  multi: true },
  { param: 'm', label: 'Material', dict: 'material', col: R_MATERIAL, multi: true },
  { param: 's', label: 'Style',    dict: 'style',    col: R_STYLE,    multi: true },
  { param: 'b', label: 'Price',    dict: 'band',     col: R_BAND,     multi: true },
]

export interface Filters {
  q: string
  type: '' | 'drapery' | 'sheer'
  fav: boolean
  sel: Record<string, string[]>
}

export const EMPTY_FILTERS: Filters = { q: '', type: '', fav: false, sel: {} }

export function filtersFromSearch(search: string): Filters {
  const p = new URLSearchParams(search)
  const type = p.get('type')
  const sel: Record<string, string[]> = {}
  for (const f of FACETS) {
    const raw = p.get(f.param)
    if (raw) sel[f.param] = raw.split(',').filter(Boolean)
  }
  return {
    q: p.get('q') || '',
    type: type === 'drapery' || type === 'sheer' ? type : '',
    fav: p.get('fav') === '1',
    sel,
  }
}

export function searchFromFilters(f: Filters): string {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.type) p.set('type', f.type)
  if (f.fav) p.set('fav', '1')
  for (const facet of FACETS) {
    const v = f.sel[facet.param]
    if (v && v.length) p.set(facet.param, v.join(','))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

const countActive = (f: Filters) =>
  (f.type ? 1 : 0) + (f.fav ? 1 : 0) + FACETS.reduce((n, x) => n + (f.sel[x.param]?.length || 0), 0)

const PAGE = 48

export default function FabricLibraryClient({ initialId }: { initialId?: string }) {
  const [index, setIndex] = useState<Index | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [favorites, setFavorites] = useState<string[]>([])
  const [visible, setVisible] = useState(PAGE)
  const [openId, setOpenId] = useState<string | null>(initialId || null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  /* Filters come from the URL on first paint and go back to it on every
     change, so back/forward and a pasted link all restore the same grid. */
  useEffect(() => {
    setFilters(filtersFromSearch(window.location.search))
    const onPop = () => setFilters(filtersFromSearch(window.location.search))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    setFavorites(readFavorites())
    return subscribeFavorites(setFavorites)
  }, [])

  useEffect(() => {
    let alive = true
    fetch('/api/fabrics')
      .then((r) => r.json())
      .then((j) => { if (alive && j?.success) setIndex(j.data as Index); else if (alive) setLoadError(true) })
      .catch(() => { if (alive) setLoadError(true) })
    return () => { alive = false }
  }, [])

  const update = useCallback((next: Filters) => {
    setFilters(next)
    setVisible(PAGE)
    const url = window.location.pathname + searchFromFilters(next)
    window.history.replaceState(null, '', url)
  }, [])

  const toggleValue = useCallback((param: string, value: string) => {
    setFilters((cur) => {
      const have = cur.sel[param] || []
      const nextVals = have.includes(value) ? have.filter((v) => v !== value) : [...have, value]
      const sel = { ...cur.sel }
      if (nextVals.length) sel[param] = nextVals; else delete sel[param]
      const next = { ...cur, sel }
      setVisible(PAGE)
      window.history.replaceState(null, '', window.location.pathname + searchFromFilters(next))
      return next
    })
  }, [])

  /* ── filtering ──────────────────────────────────────────────────────── */
  const favSet = useMemo(() => new Set(favorites), [favorites])

  const matchers = useMemo(() => {
    if (!index) return null
    const idx = (dict: DictKey, values: string[]) =>
      new Set(values.map((v) => index.dict[dict].indexOf(v)).filter((i) => i >= 0))
    const q = filters.q.trim().toLowerCase()
    return {
      q,
      type: filters.type,
      fav: filters.fav,
      sets: FACETS.map((f) => ({ facet: f, set: idx(f.dict, filters.sel[f.param] || []) })),
    }
  }, [index, filters])

  const passes = useCallback((row: Row, skipParam?: string) => {
    if (!matchers || !index) return true
    if (matchers.type === 'sheer' && !(row[R_FLAGS] & FLAG_SHEER)) return false
    if (matchers.type === 'drapery' && (row[R_FLAGS] & FLAG_SHEER)) return false
    if (matchers.fav && !favSet.has(row[R_ID])) return false
    if (matchers.q) {
      const hay = `${row[R_NAME]} ${row[R_COLOR]} ${index.dict.brand[row[R_BRAND]]}`.toLowerCase()
      if (!hay.includes(matchers.q)) return false
    }
    for (const { facet, set } of matchers.sets) {
      if (!set.size || facet.param === skipParam) continue
      if (facet.col === R_COLORS) {
        if (!(row[R_COLORS] as number[]).some((i) => set.has(i))) return false
      } else if (!set.has(row[facet.col] as number)) return false
    }
    return true
  }, [matchers, index, favSet])

  const results = useMemo(() => (index ? index.rows.filter((r) => passes(r)) : []), [index, passes])

  /* Counts are computed with the facet's own selection lifted, so ticking a
     second colour shows what it would ADD rather than always reading zero. */
  const facetCounts = useMemo(() => {
    if (!index) return {}
    const out: Record<string, Record<string, number>> = {}
    for (const f of FACETS) {
      const pool = index.rows.filter((r) => passes(r, f.param))
      const counts: Record<string, number> = {}
      for (const row of pool) {
        if (f.col === R_COLORS) {
          for (const i of row[R_COLORS] as number[]) {
            const name = index.dict[f.dict][i]
            if (name) counts[name] = (counts[name] || 0) + 1
          }
        } else {
          const name = index.dict[f.dict][row[f.col] as number]
          if (name) counts[name] = (counts[name] || 0) + 1
        }
      }
      out[f.param] = counts
    }
    return out
  }, [index, passes])

  /* ── infinite scroll ────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((v) => Math.min(v + PAGE, results.length))
    }, { rootMargin: '900px' })
    io.observe(el)
    return () => io.disconnect()
  }, [results.length])

  const openDetail = useCallback((id: string) => {
    setOpenId(id)
    setDrawerOpen(true)
  }, [])

  const activeCount = countActive(filters)

  return (
    <>
      {/* ── filter rail ───────────────────────────────────────────────── */}
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        <FilterRail
          index={index}
          filters={filters}
          counts={facetCounts}
          activeCount={activeCount}
          favoriteCount={favorites.length}
          onToggle={toggleValue}
          onSetType={(t) => update({ ...filters, type: t })}
          onSetFav={(v) => update({ ...filters, fav: v })}
          onSetQuery={(q) => update({ ...filters, q })}
          onClear={() => update(EMPTY_FILTERS)}
        />

        <div>
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <p className="text-sm text-gray-500">
              {index
                ? `${results.length.toLocaleString()} of ${index.count.toLocaleString()} fabrics`
                : loadError ? 'Fabric library unavailable' : 'Loading fabrics…'}
            </p>
            {activeCount > 0 && (
              <button onClick={() => update(EMPTY_FILTERS)} className="text-sm underline underline-offset-4 text-gray-600 hover:text-black">
                Clear filters
              </button>
            )}
          </div>

          {loadError && (
            <p className="text-sm text-gray-600">
              We couldn&apos;t load the fabric library just now. Please refresh, or{' '}
              <Link href="/contact" className="underline underline-offset-4">ask us for samples</Link>.
            </p>
          )}

          {index && results.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-600">No fabrics match those filters.</p>
              <button onClick={() => update(EMPTY_FILTERS)} className="mt-3 text-sm underline underline-offset-4">
                Start over
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {results.slice(0, visible).map((row) => (
              <FabricCard
                key={row[R_ID]}
                row={row}
                brand={index!.dict.brand[row[R_BRAND]]}
                showPrice={!!index?.showPrices}
                favorite={favSet.has(row[R_ID])}
                onOpen={openDetail}
              />
            ))}
          </div>

          <div ref={sentinel} className="h-10" />
          {index && visible < results.length && (
            <p className="text-center text-sm text-gray-400 py-4">Loading more…</p>
          )}
        </div>
      </div>

      {drawerOpen && openId && (
        <FabricDrawer
          id={openId}
          favorite={favSet.has(openId)}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  )
}

/* ── filter rail ──────────────────────────────────────────────────────── */
function FilterRail(props: {
  index: Index | null
  filters: Filters
  counts: Record<string, Record<string, number>>
  activeCount: number
  favoriteCount: number
  onToggle: (param: string, value: string) => void
  onSetType: (t: '' | 'drapery' | 'sheer') => void
  onSetFav: (v: boolean) => void
  onSetQuery: (q: string) => void
  onClear: () => void
}) {
  const { index, filters, counts } = props
  const [open, setOpen] = useState(false)

  const body = (
    <div className="space-y-7">
      <div>
        <label htmlFor="fabric-search" className="sr-only">Search fabrics</label>
        <input
          id="fabric-search"
          type="search"
          defaultValue={filters.q}
          onChange={(e) => props.onSetQuery(e.target.value)}
          placeholder="Search by name or colour"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
      </div>

      <fieldset>
        <legend className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-3">Fabric type</legend>
        <div className="flex gap-2">
          {([['', 'All'], ['drapery', 'Drapery'], ['sheer', 'Sheer']] as const).map(([v, label]) => (
            <button
              key={label}
              onClick={() => props.onSetType(v)}
              aria-pressed={filters.type === v}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                filters.type === v ? 'bg-[#12141C] text-white border-[#12141C]' : 'border-gray-300 text-gray-700 hover:border-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={filters.fav} onChange={(e) => props.onSetFav(e.target.checked)} className="h-4 w-4 accent-[#12141C]" />
        My Fabrics ({props.favoriteCount})
      </label>

      {FACETS.map((facet) => {
        const c = counts[facet.param] || {}
        const values = index ? index.dict[facet.dict].filter((v) => c[v] || (filters.sel[facet.param] || []).includes(v)) : []
        if (!values.length) return null
        const order = facet.dict === 'band'
          ? ['$', '$$', '$$$', '$$$$'].filter((v) => values.includes(v))
          : values.slice().sort((a, b) => (c[b] || 0) - (c[a] || 0))
        return (
          <fieldset key={facet.param}>
            <legend className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-3">{facet.label}</legend>
            <div className="space-y-1.5">
              {order.map((v) => {
                const checked = (filters.sel[facet.param] || []).includes(v)
                return (
                  <label key={v} className="flex items-center justify-between gap-2 text-sm cursor-pointer group">
                    <span className="flex items-center gap-2 text-gray-700 group-hover:text-black">
                      <input type="checkbox" checked={checked} onChange={() => props.onToggle(facet.param, v)} className="h-4 w-4 accent-[#12141C]" />
                      {v}
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums">{c[v] || 0}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )
      })}

      <p className="text-[11px] leading-relaxed text-gray-400 border-t border-gray-200 pt-4">
        {ESTIMATE_DISCLAIMER_LONG}
      </p>
    </div>
  )

  return (
    <>
      {/* Mobile: a button that opens the same rail as a sheet. */}
      <div className="lg:hidden sticky top-0 z-20 -mx-6 px-6 py-3 bg-white/95 backdrop-blur border-b border-gray-200">
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800"
        >
          Filters{props.activeCount ? ` (${props.activeCount})` : ''}
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          <div className="w-[85%] max-w-sm bg-white h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-medium">Filters</span>
              <button onClick={() => setOpen(false)} aria-label="Close filters" className="text-2xl leading-none text-gray-500">&times;</button>
            </div>
            {body}
            <button onClick={() => setOpen(false)} className="mt-8 w-full rounded-full bg-[#12141C] text-white py-3 text-sm font-medium">
              Show results
            </button>
          </div>
        </div>
      )}
      <aside className="hidden lg:block">
        <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2">{body}</div>
      </aside>
    </>
  )
}

/* ── card ─────────────────────────────────────────────────────────────── */
const CDN = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, '') || ''
export const thumbUrl = (img: string | null) => (img ? `${CDN}/fabric-swatches/thumb/${img}.webp` : null)

function FabricCard({ row, brand, showPrice, favorite, onOpen }: {
  row: Row; brand: string; showPrice: boolean; favorite: boolean; onOpen: (id: string) => void
}) {
  const id = row[R_ID]
  const src = thumbUrl(row[R_IMG])
  return (
    <div className="group">
      <button
        onClick={() => onOpen(id)}
        className="relative block w-full aspect-square overflow-hidden rounded-lg bg-gray-100 text-left"
        style={row[R_SWATCH] ? { backgroundColor: row[R_SWATCH] as string } : undefined}
        aria-label={`${row[R_NAME]} ${row[R_COLOR]} — view details`}
      >
        {src && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={`${row[R_NAME]} in ${row[R_COLOR]}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        {(row[R_FLAGS] & FLAG_SHEER) !== 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-700">
            Sheer
          </span>
        )}
      </button>

      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{row[R_NAME]}</p>
          <p className="truncate text-xs text-gray-500">{row[R_COLOR]} · {brand}</p>
          {showPrice && (row[R_PRICE] as number) > 0 && (
            <p className="mt-0.5 text-xs text-gray-500">${row[R_PRICE]}/yd</p>
          )}
          {(row[R_FLAGS] & FLAG_PRICED) === 0 && (
            <p className="mt-0.5 text-xs text-gray-400">Price on consultation</p>
          )}
        </div>
        <button
          onClick={() => toggleFavorite(id)}
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${row[R_NAME]} from My Fabrics` : `Save ${row[R_NAME]} to My Fabrics`}
          className="shrink-0 p-1 -m-1 text-gray-300 hover:text-[#ef8200] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill={favorite ? '#ef8200' : 'none'} stroke={favorite ? '#ef8200' : 'currentColor'} strokeWidth="1.6">
            <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 7.5 2.9c0 5-7.5 9.6-7.5 9.6z" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ── detail drawer ────────────────────────────────────────────────────── */
function FabricDrawer({ id, favorite, onClose }: { id: string; favorite: boolean; onClose: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    setDetail(null); setMissing(false)
    let alive = true
    fetch(`/api/fabrics/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((j) => { if (!alive) return; if (j?.success) setDetail(j.data as Detail); else setMissing(true) })
      .catch(() => { if (alive) setMissing(true) })
    return () => { alive = false }
  }, [id])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Fabric details" className="w-full max-w-md bg-white h-full overflow-y-auto">
        <div className="sticky top-0 flex justify-end bg-white/90 backdrop-blur p-3">
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none text-gray-500 hover:text-black">&times;</button>
        </div>

        {missing && <p className="px-6 pb-8 text-sm text-gray-600">That fabric is no longer in our library.</p>}

        {detail && (
          <div className="px-6 pb-10">
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              {detail.largeUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={detail.largeUrl} alt={`${detail.name} in ${detail.color}`} className="h-full w-full object-cover" />
              )}
            </div>

            <div className="mt-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-medium text-gray-900">{detail.name}</h2>
                <p className="text-sm text-gray-500">{detail.color} · {detail.brand}</p>
              </div>
              <button
                onClick={() => toggleFavorite(detail.id)}
                aria-pressed={favorite}
                className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-500"
              >
                {favorite ? 'Saved' : 'Save'}
              </button>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Spec label="Fibre content" value={detail.material} span />
              <Spec label="Width" value={detail.widthIn ? `${detail.widthIn}"` : null} />
              <Spec label="Type" value={detail.sheer ? 'Sheer' : 'Drapery fabric'} />
              <Spec
                label="Pattern repeat"
                value={
                  detail.repeatVIn || detail.repeatHIn
                    ? [detail.repeatVIn ? `${detail.repeatVIn}" vertical` : null, detail.repeatHIn ? `${detail.repeatHIn}" horizontal` : null].filter(Boolean).join(' · ')
                    : 'No repeat'
                }
                span
              />
              <Spec label="Pattern" value={detail.patternType} />
              <Spec label="Style" value={detail.style} />
              <Spec label="Collection" value={detail.book} span />
              <Spec label="Made in" value={detail.origin} />
              {detail.pricePerYard != null && <Spec label="Fabric price" value={`$${detail.pricePerYard}/yd`} />}
            </dl>

            {detail.priceStatus === 'ask_in_store' && (
              <p className="mt-5 rounded-lg bg-[#F7F6F3] px-4 py-3 text-sm text-gray-600">
                Price on consultation — we haven&apos;t published a yardage price for this colourway yet.
                You can still save it and{' '}
                <Link href="/contact" className="underline underline-offset-4">ask us for a quote</Link>.
              </p>
            )}

            <Link
              href={`/design?fabric=${encodeURIComponent(detail.id)}`}
              className="mt-6 block w-full rounded-full bg-[#12141C] py-3 text-center text-sm font-medium text-white hover:bg-black"
            >
              Design with this fabric
            </Link>
            <Link
              href={`/fabrics/${encodeURIComponent(detail.id)}`}
              className="mt-3 block text-center text-sm text-gray-600 underline underline-offset-4"
            >
              Open full page
            </Link>

            <p className="mt-6 text-[11px] leading-relaxed text-gray-400">{ESTIMATE_DISCLAIMER_LONG}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Spec({ label, value, span }: { label: string; value: string | null; span?: boolean }) {
  if (!value) return null
  return (
    <div className={span ? 'col-span-2' : ''}>
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-gray-800">{value}</dd>
    </div>
  )
}
