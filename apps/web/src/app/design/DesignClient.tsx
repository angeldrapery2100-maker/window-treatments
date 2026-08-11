'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  HARDWARE_TYPES, HEADING_STYLES, PLEATED_HEADINGS, RIPPLE_HEADINGS,
  combinationProblem, hardwareFor, headingLabel, mountsFor,
  type Composition, type DesignParams, type FabricRef,
  type HardwareType, type HeadingStyle, type MountType,
} from '@window-treatments/shared/design'
import { readFavorites, subscribeFavorites } from '@/lib/fabricFavorites'
import { colorsFor, designProfiles, finialsFor, resolveHardwareSelection } from '@/lib/designHardware'
import { ESTIMATE_DISCLAIMER_SHORT } from '@/lib/estimateCopy'

/* The 3D viewport ships from the other line (《OPUS 任务书 — 3D 设计器》).
   Everything it needs is already assembled as DesignParams below and the
   element it mounts into is already on the page — see #scene-root. */
const PLACEHOLDER = '/drapery/handcrafted-drapery/03_fa469c_76c9f3f34ab14a39adde503c7cdd222ef002.jpg'

const SIZE = { minW: 20, maxW: 300, minH: 20, maxH: 144 }
const COMPOSITIONS: Array<{ key: Composition; label: string; hint: string }> = [
  { key: 'fabric_only', label: 'Drapery only', hint: 'One layer of fabric' },
  { key: 'fabric_plus_sheer', label: 'Drapery + sheer', hint: 'A sheer behind, on a double rod' },
  { key: 'sheer_only', label: 'Sheer only', hint: 'A single soft layer' },
]

const LININGS: Array<{ key: string; label: string; hint: string }> = [
  { key: 'NO', label: 'Unlined', hint: 'Softest drape, most light' },
  { key: 'LF', label: 'Light-filtering', hint: 'Our usual choice' },
  { key: 'BO', label: 'Blackout', hint: 'Bedrooms and media rooms' },
]

interface FabricCard {
  id: string; name: string; color: string; brand: string
  thumbUrl: string | null; sheer: boolean; priceStatus: 'ready' | 'ask_in_store'
}

interface DetailResponse extends FabricCard {
  widthIn: number | null; repeatVIn: number | null; repeatHIn: number | null; largeUrl: string | null
}

/** A window the visitor already measured in /measure-wizard. Only drapery
 *  windows with a recommendation are useful here — a shutter card has no
 *  finished drapery size to offer. */
interface MeasuredWindow {
  id: string
  label: string
  product: string
  result?: { type?: string; recommendedWidthIn?: number; recommendedHeightIn?: number }
}

interface EstimateLine { ok: boolean; price?: number; rangeLow?: number; rangeHigh?: number; unavailable?: string; pricedAt?: string }
interface EstimateResult {
  fabric: { id: string; name: string; color: string; brand: string; priceStatus: string }
  drapery: EstimateLine
  hardware: EstimateLine
  total: { low: number; high: number } | null
  assumed: Record<string, string>
  notes: string[]
}

export interface State {
  composition: Composition
  fabricId: string
  /** The layer behind, only used when composition is fabric_plus_sheer. */
  sheerFabricId: string
  width: string
  height: string
  heading: HeadingStyle
  split: boolean
  lining: string
  hardware: HardwareType
  mount: MountType
  /** The measured window this design is for, when it came from one. */
  windowId: string
  label: string
  /** The exact rod or track AAPP prices, plus its finish and ends. */
  profileKey: string
  colorKey: string
  finialKey: string
}

const DEFAULTS: State = {
  composition: 'fabric_only', fabricId: '', sheerFabricId: '',
  width: '', height: '', heading: '3fold_pinch', split: true,
  lining: 'LF', hardware: 'wood_pole', mount: 'wall',
  windowId: '', label: '', profileKey: '', colorKey: '', finialKey: '',
}

export function stateFromSearch(search: string, fallbackFabric: string): State {
  const p = new URLSearchParams(search)
  const heading = HEADING_STYLES.find((h) => h.key === p.get('heading'))?.key || DEFAULTS.heading
  const split = p.get('split') !== '0'
  const width = Number(p.get('w')) || undefined
  let hardware = HARDWARE_TYPES.find((h) => h.key === p.get('hw'))?.key || DEFAULTS.hardware
  // A link can carry a pairing the picker would never have allowed — someone
  // edited the URL, or the rules changed since they saved it. Repair rather
  // than show an error page.
  if (combinationProblem(heading, hardware, { split, finishedWidthIn: width })) {
    hardware = hardwareFor(heading, { split, finishedWidthIn: width })[0] || hardwareFor(heading)[0]
  }
  const mount = mountsFor(hardware).includes(p.get('mount') as MountType) ? (p.get('mount') as MountType) : mountsFor(hardware)[0]
  const composition = COMPOSITIONS.some((c) => c.key === p.get('comp'))
    ? (p.get('comp') as Composition) : 'fabric_only'
  const picked = resolveHardwareSelection(hardware, mount, {
    profileKey: p.get('prof'), colorKey: p.get('col'), finialKey: p.get('fin'), composition,
  })
  return {
    composition,
    sheerFabricId: composition === 'fabric_plus_sheer' ? (p.get('sheer') || '') : '',
    fabricId: p.get('fabric') || fallbackFabric,
    width: p.get('w') || '',
    height: p.get('h') || '',
    heading,
    split,
    lining: LININGS.some((l) => l.key === p.get('lining')) ? p.get('lining')! : DEFAULTS.lining,
    hardware,
    mount,
    windowId: p.get('win') || '',
    label: p.get('label') || '',
    profileKey: picked?.profile.key || '',
    colorKey: picked?.colorKey || '',
    finialKey: picked?.finialKey || '',
  }
}

export function searchFromState(s: State): string {
  const p = new URLSearchParams()
  if (s.composition !== 'fabric_only') p.set('comp', s.composition)
  if (s.fabricId) p.set('fabric', s.fabricId)
  if (s.composition === 'fabric_plus_sheer' && s.sheerFabricId) p.set('sheer', s.sheerFabricId)
  if (s.width) p.set('w', s.width)
  if (s.height) p.set('h', s.height)
  p.set('heading', s.heading)
  if (!s.split) p.set('split', '0')
  p.set('lining', s.lining)
  p.set('hw', s.hardware)
  p.set('mount', s.mount)
  if (s.windowId) p.set('win', s.windowId)
  if (s.label) p.set('label', s.label)
  if (s.profileKey) p.set('prof', s.profileKey)
  if (s.colorKey) p.set('col', s.colorKey)
  if (s.finialKey) p.set('fin', s.finialKey)
  return `?${p.toString()}`
}

export default function DesignClient() {
  // The seeded defaults come from the same cached endpoint the Handcrafted
  // Drapery teaser uses, rather than as props — which keeps the 6 MB fabric
  // library out of this route's server bundle entirely.
  const [defaultFabrics, setDefaultFabrics] = useState<FabricCard[]>([])
  const [defaultSheers, setDefaultSheers] = useState<FabricCard[]>([])
  const [state, setState] = useState<State>(DEFAULTS)
  const [ready, setReady] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [savedCards, setSavedCards] = useState<FabricCard[]>([])
  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [sheerDetail, setSheerDetail] = useState<DetailResponse | null>(null)
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const [windows, setWindows] = useState<MeasuredWindow[]>([])
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [savedId, setSavedId] = useState<string | null>(null)

  /* Whole page state lives in the query string, so a half-finished design
     survives a refresh and can be sent to someone else. */
  useEffect(() => {
    setState(stateFromSearch(window.location.search, ''))
    setReady(true)
    const onPop = () => setState(stateFromSearch(window.location.search, ''))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Once the defaults land, adopt one — but only if the link didn't already
  // name a fabric, which it does whenever someone arrives from the library.
  useEffect(() => {
    setState((cur) => {
      if (cur.fabricId) return cur
      const pool = cur.composition === 'sheer_only' ? defaultSheers : defaultFabrics
      return pool.length ? { ...cur, fabricId: pool[0].id } : cur
    })
  }, [defaultFabrics, defaultSheers])

  useEffect(() => {
    if (!ready) return
    window.history.replaceState(null, '', window.location.pathname + searchFromState(state))
  }, [state, ready])

  useEffect(() => {
    setFavorites(readFavorites())
    return subscribeFavorites(setFavorites)
  }, [])

  useEffect(() => {
    let alive = true
    fetch('/api/fabrics/featured')
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j?.success) return
        setDefaultFabrics((j.data as FabricCard[]) || [])
        setDefaultSheers((j.sheers as FabricCard[]) || [])
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // The measurement sheet the visitor filled in on /measure-wizard. Same
  // identity (ad_anon cookie), so it is simply there.
  useEffect(() => {
    let alive = true
    fetch('/api/store/measure/windows')
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j?.success) return
        setWindows((j.data.windows as MeasuredWindow[]).filter(
          (w) => w.product === 'drapery' && Number(w.result?.recommendedWidthIn) > 0
        ))
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // The shortlist, resolved to real fabrics in one request.
  useEffect(() => {
    if (!favorites.length) { setSavedCards([]); return }
    let alive = true
    fetch(`/api/fabrics/lookup?ids=${favorites.slice(0, 24).map(encodeURIComponent).join(',')}`)
      .then((r) => r.json())
      .then((j) => { if (alive && j?.success) setSavedCards(j.data as FabricCard[]) })
      .catch(() => {})
    return () => { alive = false }
  }, [favorites])

  // Full detail for each slot — the 3D contract needs width and repeat per
  // layer, and the estimate needs each fabric's own $/yard.
  useEffect(() => {
    if (!state.fabricId) { setDetail(null); return }
    let alive = true
    fetch(`/api/fabrics/${encodeURIComponent(state.fabricId)}`)
      .then((r) => r.json())
      .then((j) => { if (alive) setDetail(j?.success ? (j.data as DetailResponse) : null) })
      .catch(() => { if (alive) setDetail(null) })
    return () => { alive = false }
  }, [state.fabricId])

  useEffect(() => {
    if (!state.sheerFabricId) { setSheerDetail(null); return }
    let alive = true
    fetch(`/api/fabrics/${encodeURIComponent(state.sheerFabricId)}`)
      .then((r) => r.json())
      .then((j) => { if (alive) setSheerDetail(j?.success ? (j.data as DetailResponse) : null) })
      .catch(() => { if (alive) setSheerDetail(null) })
    return () => { alive = false }
  }, [state.sheerFabricId])

  const set = useCallback(<K extends keyof State>(key: K, value: State[K]) => {
    setState((cur) => {
      const next = { ...cur, [key]: value }
      // An illegal pairing must be impossible to reach, not merely rejected
      // later: switching to a ripplefold, or to a one-way draw on a wide
      // window, drags the hardware (and its mount) along with it.
      //
      // Width is deliberately NOT repaired this way — yanking the hardware out
      // from under someone mid-keystroke, while "9" is on its way to "96", is
      // worse than greying the option and saying why.
      if (key === 'heading' || key === 'split') {
        const w = Number(next.width) || undefined
        if (combinationProblem(next.heading, next.hardware, { split: next.split, finishedWidthIn: w })) {
          next.hardware = hardwareFor(next.heading, { split: next.split, finishedWidthIn: w })[0]
            || hardwareFor(next.heading)[0]
        }
      }
      if (!mountsFor(next.hardware).includes(next.mount)) next.mount = mountsFor(next.hardware)[0]
      // A profile belongs to one family and mount, so changing either one
      // invalidates the rod, its finish and its ends together.
      // Leaving the two-layer design drops the sheer with it, so a stale id
      // can never ride along into a quote for a single layer.
      if (key === 'composition' && next.composition !== 'fabric_plus_sheer') next.sheerFabricId = ''
      if (key === 'heading' || key === 'split' || key === 'hardware' || key === 'mount' || key === 'composition') {
        const re = resolveHardwareSelection(next.hardware, next.mount, {
          profileKey: next.profileKey, colorKey: next.colorKey, finialKey: next.finialKey,
          composition: next.composition,
        })
        next.profileKey = re?.profile.key || ''
        next.colorKey = re?.colorKey || ''
        next.finialKey = re?.finialKey || ''
      }
      return next
    })
    setEstimate(null)
    setEstimateError(null)
    setSaveState('idle')
  }, [])

  const widthNum = Number(state.width), heightNum = Number(state.height)
  const sizeOk =
    widthNum >= SIZE.minW && widthNum <= SIZE.maxW && heightNum >= SIZE.minH && heightNum <= SIZE.maxH
  const sizeOutOfRange =
    (state.width !== '' && (widthNum < SIZE.minW || widthNum > SIZE.maxW)) ||
    (state.height !== '' && (heightNum < SIZE.minH || heightNum > SIZE.maxH))

  /* The hand-off object for the 3D module. Assembled here and kept in state
     exactly as §5 specifies, so the viewport swap is a one-line change. */
  const designParams: DesignParams | null = useMemo(() => {
    if (!detail || !sizeOk) return null
    const ref = (d: DetailResponse): FabricRef => ({
      id: d.id,
      textureUrl: d.largeUrl || '',
      fabricWidthIn: d.widthIn || 54,
      ...(d.repeatVIn ? { repeatVIn: d.repeatVIn } : {}),
      ...(d.repeatHIn ? { repeatHIn: d.repeatHIn } : {}),
      sheer: d.sheer,
    })
    return {
      composition: state.composition,
      fabric: ref(detail),
      ...(state.composition === 'fabric_plus_sheer' && sheerDetail ? { sheer: ref(sheerDetail) } : {}),
      window: { finishedWidthIn: widthNum, finishedHeightIn: heightNum },
      style: { heading: state.heading, split: state.split },
      hardware: { type: state.hardware, mount: state.mount },
    }
  }, [detail, sheerDetail, sizeOk, widthNum, heightNum, state.composition, state.heading, state.split, state.hardware, state.mount])

  const runEstimate = useCallback(async () => {
    if (!sizeOk || !state.fabricId) return
    setEstimating(true); setEstimateError(null)
    try {
      const res = await fetch('/api/store/design/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          composition: state.composition,
          fabricId: state.fabricId,
          sheerFabricId: state.sheerFabricId,
          finishedWidthIn: widthNum,
          finishedHeightIn: heightNum,
          heading: state.heading,
          split: state.split,
          lining: state.lining,
          hardware: state.hardware,
          mount: state.mount,
          profileKey: state.profileKey,
          colorKey: state.colorKey,
          finialKey: state.finialKey,
        }),
      })
      const j = await res.json()
      if (j?.success) setEstimate(j.data as EstimateResult)
      else setEstimateError(j?.error || 'We could not work out an estimate just now.')
    } catch {
      setEstimateError('We could not reach our pricing service. Please try again.')
    } finally {
      setEstimating(false)
    }
  }, [sizeOk, state, widthNum, heightNum])

  // Two shortlists, never mixed: a sheer cannot go in the drapery slot and a
  // drapery fabric cannot go behind one. Favourites win over the seeded
  // defaults, per slot — someone who has favourited drapery but no sheer still
  // gets sheers to choose from.
  const asCard = (d: DetailResponse | null): FabricCard | null => d && {
    id: d.id, name: d.name, color: d.color, brand: d.brand,
    thumbUrl: d.thumbUrl, sheer: d.sheer, priceStatus: d.priceStatus,
  }
  const savedDrapery = savedCards.filter((f) => !f.sheer)
  const savedSheers = savedCards.filter((f) => f.sheer)
  const draperyList = savedDrapery.length ? savedDrapery : defaultFabrics
  const sheerList = savedSheers.length ? savedSheers : defaultSheers
  // For `sheer_only` the one slot IS the sheer.
  const mainList = state.composition === 'sheer_only' ? sheerList : draperyList
  const selectedCard = mainList.find((f) => f.id === state.fabricId) || asCard(detail)
  const selectedSheerCard = sheerList.find((f) => f.id === state.sheerFabricId) || asCard(sheerDetail)

  const consultationHref = useMemo(() => {
    const bits = [
      `Layers: ${COMPOSITIONS.find((c) => c.key === state.composition)?.label}`,
      selectedCard ? `${state.composition === 'sheer_only' ? 'Sheer' : 'Fabric'}: ${selectedCard.name} — ${selectedCard.color} (${selectedCard.brand})` : null,
      selectedSheerCard && state.composition === 'fabric_plus_sheer'
        ? `Sheer: ${selectedSheerCard.name} — ${selectedSheerCard.color} (${selectedSheerCard.brand})` : null,
      sizeOk ? `Finished size: ${widthNum}" wide x ${heightNum}" high` : null,
      `Heading: ${headingLabel(state.heading)}`,
      `Panels: ${state.split ? 'centre-open pair' : 'one-way draw'}`,
      `Lining: ${LININGS.find((l) => l.key === state.lining)?.label}`,
      `Hardware: ${selectedProfile?.label || HARDWARE_TYPES.find((h) => h.key === state.hardware)?.label} (${state.mount} mount${state.colorKey ? `, ${state.colorKey}` : ''}${state.finialKey ? `, ${finialsFor(selectedProfile).find((f) => f.key === state.finialKey)?.label || state.finialKey}` : ''})`,
      estimate?.total ? `Reference estimate seen on the site: $${estimate.total.low}–$${estimate.total.high}` : null,
    ].filter(Boolean)
    const msg = `I designed this on your site and would like a quote.\n\n${bits.join('\n')}\n\nDesign link: ${typeof window !== 'undefined' ? window.location.href : ''}`
    return `/contact?message=${encodeURIComponent(msg)}`
  }, [selectedCard, sizeOk, widthNum, heightNum, state, estimate])

  // Why the CURRENT pairing is unavailable, if it is — the width can turn a
  // legal choice illegal after the fact, and we would rather say so than
  // silently swap the customer's hardware while they type.
  const pickWindow = useCallback((w: MeasuredWindow) => {
    const width = w.result?.recommendedWidthIn, height = w.result?.recommendedHeightIn
    setState((cur) => ({
      ...cur,
      windowId: w.id,
      label: w.label,
      ...(width ? { width: String(Math.round(width * 4) / 4) } : {}),
      ...(height ? { height: String(Math.round(height * 4) / 4) } : {}),
    }))
    setEstimate(null); setEstimateError(null); setSaveState('idle')
  }, [])

  const fabricsChosen = !!state.fabricId
    && (state.composition !== 'fabric_plus_sheer' || !!state.sheerFabricId)

  const profileChoices = designProfiles(state.hardware, state.mount, state.composition)
  const selectedProfile = profileChoices.find((p) => p.key === state.profileKey) || profileChoices[0] || null
  const colorChoices = colorsFor(selectedProfile)
  const finialChoices = finialsFor(selectedProfile)

  const saveDesign = useCallback(async () => {
    setSaveState('saving')
    try {
      const res = await fetch('/api/store/design/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: savedId,
          label: state.label || selectedCard?.name || 'Untitled window',
          windowId: state.windowId || null,
          config: state,
          // Names, not ids — a consultant reading this months later should not
          // have to look anything up.
          summary: {
            composition: COMPOSITIONS.find((c) => c.key === state.composition)?.label,
            fabric: selectedCard ? `${selectedCard.name} — ${selectedCard.color} (${selectedCard.brand})` : null,
            sheer: selectedSheerCard ? `${selectedSheerCard.name} — ${selectedSheerCard.color} (${selectedSheerCard.brand})` : null,
            size: sizeOk ? `${widthNum}" x ${heightNum}"` : null,
            heading: headingLabel(state.heading),
            panels: state.split ? 'Centre-open pair' : 'One-way draw',
            lining: LININGS.find((l) => l.key === state.lining)?.label,
            hardware: selectedProfile?.label || null,
            finish: state.colorKey || null,
            finial: finialChoices.find((f) => f.key === state.finialKey)?.label || null,
            mount: state.mount,
            link: typeof window !== 'undefined' ? window.location.href : null,
          },
          estimate,
        }),
      })
      const j = await res.json()
      if (j?.success) { setSavedId(j.data.design.id); setSaveState('saved') }
      else setSaveState('error')
    } catch {
      setSaveState('error')
    }
  }, [savedId, state, selectedCard, selectedSheerCard, sizeOk, widthNum, heightNum, estimate, selectedProfile, finialChoices])

  const hardwareProblem = combinationProblem(state.heading, state.hardware, {
    split: state.split,
    finishedWidthIn: widthNum || undefined,
  })

  return (
    <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10 md:py-14">
      {/* 1:1. The viewport carries the fabric choice underneath it, which is
          what keeps the two columns close to the same height (Eddie). */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── viewport + fabric ────────────────────────────────────────── */}
        <div>
          <div id="scene-root" className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#12141C]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PLACEHOLDER} alt="Handcrafted drapery in a living room" className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur">
                Interactive 3D preview coming soon
              </span>
            </div>
          </div>

          <DesignSummary state={state} card={selectedCard} sheerCard={selectedSheerCard} sizeOk={sizeOk} width={widthNum} height={heightNum} />

          {/* Layers first: it decides which shortlists are even relevant. */}
          <div className="mt-6">
            <Block title="Layers">
              <Choice
                options={COMPOSITIONS.map((c) => ({ key: c.key, label: c.label, hint: c.hint }))}
                value={state.composition}
                onChange={(v) => set('composition', v as Composition)}
              />
            </Block>
          </div>

          <div className="mt-6 space-y-6">
            <FabricSlot
              title={state.composition === 'sheer_only' ? 'Sheer' : 'Drapery fabric'}
              fabrics={mainList}
              usingFavorites={state.composition === 'sheer_only' ? savedSheers.length > 0 : savedDrapery.length > 0}
              selectedId={state.fabricId}
              selected={selectedCard}
              onSelect={(id) => set('fabricId', id)}
              browseHref={state.composition === 'sheer_only' ? '/fabrics?type=sheer' : '/fabrics?type=drapery'}
            />
            {state.composition === 'fabric_plus_sheer' && (
              <FabricSlot
                title="Sheer behind"
                fabrics={sheerList}
                usingFavorites={savedSheers.length > 0}
                selectedId={state.sheerFabricId}
                selected={selectedSheerCard}
                onSelect={(id) => set('sheerFabricId', id)}
                browseHref="/fabrics?type=sheer"
              />
            )}
          </div>

          {designParams && (
            <p className="mt-4 text-[11px] text-gray-400">
              Fabric width {designParams.fabric.fabricWidthIn}&quot;
              {designParams.fabric.repeatVIn ? ` · ${designParams.fabric.repeatVIn}" vertical repeat` : ''}
              {designParams.sheer ? ` · sheer ${designParams.sheer.fabricWidthIn}" wide` : ''}
            </p>
          )}
        </div>

        {/* ── parameter panel ──────────────────────────────────────────── */}
        <div className="space-y-8">

          {/* Step 1 — Size. Eddie's order: size, then style, then how it
              draws, then lining, then hardware. Each answer narrows the next. */}
          <Block
            title="1 · Finished size"
            aside={<Link href="/measure-wizard" className="text-xs underline underline-offset-4 text-gray-500 hover:text-black">Measuring guide</Link>}
          >
            {windows.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Your measured windows</p>
                <div className="flex flex-wrap gap-2">
                  {windows.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => pickWindow(w)}
                      aria-pressed={state.windowId === w.id}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        state.windowId === w.id ? 'bg-[#12141C] text-white border-[#12141C]' : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {w.label}
                      <span className={`ml-1.5 text-[11px] ${state.windowId === w.id ? 'text-white/60' : 'text-gray-400'}`}>
                        {Math.round(w.result!.recommendedWidthIn!)}&quot;×{Math.round(Number(w.result?.recommendedHeightIn) || 0)}&quot;
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Picking one fills in the finished size we worked out for it — you can still change it.
                </p>
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="design-label" className="block text-xs text-gray-500">Which window is this? (for your saved designs)</label>
              <input
                id="design-label"
                type="text"
                value={state.label}
                onChange={(e) => set('label', e.target.value.slice(0, 60))}
                placeholder="Living room"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Width (in)" value={state.width} onChange={(v) => set('width', v)} min={SIZE.minW} max={SIZE.maxW} />
              <NumberField label="Height (in)" value={state.height} onChange={(v) => set('height', v)} min={SIZE.minH} max={SIZE.maxH} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              The finished drapery size, not the window. Not sure?{' '}
              <Link href="/measure-wizard" className="underline underline-offset-4">Use the measuring guide</Link>.
            </p>
            {sizeOutOfRange && (
              <p className="mt-2 text-xs text-[#B3451F]">
                We quote {SIZE.minW}–{SIZE.maxW}&quot; wide and {SIZE.minH}–{SIZE.maxH}&quot; high online.
                Outside that range,{' '}
                <Link href="/contact" className="underline underline-offset-4">talk to a consultant</Link> — we still make it.
              </p>
            )}
          </Block>

          {/* Step 2 — Heading. Ten styles, grouped the way the workroom
              thinks about them. */}
          <Block title="2 · Heading style">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Pleated</p>
            <Choice
              options={PLEATED_HEADINGS.map((h) => ({ key: h.key, label: h.label, hint: h.hint }))}
              value={state.heading}
              onChange={(v) => set('heading', v as HeadingStyle)}
            />
            <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Ripplefold</p>
            <Choice
              options={RIPPLE_HEADINGS.map((h) => ({ key: h.key, label: h.label, hint: h.hint }))}
              value={state.heading}
              onChange={(v) => set('heading', v as HeadingStyle)}
            />
          </Block>

          {/* Step 3 — How it draws. This changes how wide a wood pole can go,
              so it has to be answered before the hardware. */}
          <Block title="3 · How it opens">
            <Choice
              options={[
                { key: 'split', label: 'Centre-open pair', hint: 'Two panels, meeting in the middle' },
                { key: 'one_way', label: 'One-way draw', hint: 'A single panel stacking to one side' },
              ]}
              value={state.split ? 'split' : 'one_way'}
              onChange={(v) => set('split', v === 'split')}
            />
          </Block>

          {/* Step 4 — Lining. */}
          <Block title="4 · Lining">
            <Choice
              options={LININGS.map((l) => ({ key: l.key, label: l.label, hint: l.hint }))}
              value={state.lining}
              onChange={(v) => set('lining', v)}
            />
          </Block>

          {/* Step 5 — Hardware. What's left after the heading, the draw and
              the width have had their say. */}
          <Block title="5 · Hardware">
            <Choice
              options={HARDWARE_TYPES.map((h) => {
                const why = combinationProblem(state.heading, h.key, { split: state.split, finishedWidthIn: widthNum || undefined })
                return { key: h.key, label: h.label, disabled: !!why, hint: why || undefined }
              })}
              value={state.hardware}
              onChange={(v) => set('hardware', v as HardwareType)}
            />
            {hardwareProblem && <p className="mt-2 text-xs text-[#B3451F]">{hardwareProblem}</p>}
            {mountsFor(state.hardware).length > 1 ? (
              <div className="mt-3 flex gap-2">
                {mountsFor(state.hardware).map((m) => (
                  <button
                    key={m}
                    onClick={() => set('mount', m)}
                    aria-pressed={state.mount === m}
                    className={`rounded-full border px-3 py-1.5 text-sm capitalize ${
                      state.mount === m ? 'bg-[#12141C] text-white border-[#12141C]' : 'border-gray-300 text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {m} mount
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-500">
                {HARDWARE_TYPES.find((h) => h.key === state.hardware)?.label} mounts to the wall.
              </p>
            )}

            {/* The exact rod. A 2" wood pole and a 1 3/8" one are different
                prices, so this is a real question, not a detail. */}
            {profileChoices.length > 1 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Profile</p>
                <Choice
                  options={profileChoices.map((p) => ({ key: p.key, label: p.label }))}
                  value={selectedProfile?.key || ''}
                  onChange={(v) => set('profileKey', v)}
                />
              </div>
            )}

            {colorChoices.length > 1 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Finish</p>
                <div className="flex flex-wrap gap-2">
                  {colorChoices.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => set('colorKey', c.key)}
                      aria-pressed={state.colorKey === c.key}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        state.colorKey === c.key ? 'bg-[#12141C] text-white border-[#12141C]' : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {finialChoices.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Finial</p>
                <div className="flex flex-wrap gap-2">
                  {finialChoices.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => set('finialKey', state.finialKey === f.key ? '' : f.key)}
                      aria-pressed={state.finialKey === f.key}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        state.finialKey === f.key ? 'bg-[#12141C] text-white border-[#12141C]' : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {!state.finialKey && (
                  <p className="mt-2 text-xs text-gray-500">
                    Pick an end and the estimate includes it — otherwise your consultant prices the ends with you.
                  </p>
                )}
              </div>
            )}
          </Block>


          {/* 5. Estimate */}
          <Block title="Reference estimate">
            <button
              onClick={runEstimate}
              disabled={!sizeOk || !state.fabricId || !fabricsChosen || !!hardwareProblem || estimating}
              className="w-full rounded-full bg-[#12141C] py-3 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {estimating ? 'Working it out…' : 'See a reference estimate'}
            </button>
            {!sizeOk && <p className="mt-2 text-xs text-gray-500">Enter a finished width and height first.</p>}
            {sizeOk && !fabricsChosen && <p className="mt-2 text-xs text-gray-500">Pick a sheer for the second layer, above the viewport.</p>}
            {sizeOk && hardwareProblem && <p className="mt-2 text-xs text-gray-500">Pick hardware that suits this design first.</p>}
            {estimateError && <p className="mt-3 text-sm text-[#B3451F]">{estimateError}</p>}
            {estimate && <EstimatePanel result={estimate} />}

            {estimate && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={saveDesign}
                  disabled={saveState === 'saving'}
                  className="rounded-full border border-[#12141C] px-5 py-2.5 text-sm font-medium text-[#12141C] hover:bg-[#12141C] hover:text-white transition-colors disabled:opacity-50"
                >
                  {saveState === 'saving' ? 'Saving…' : savedId ? 'Update saved design' : 'Save this design'}
                </button>
                {saveState === 'saved' && (
                  <Link href="/design/saved" className="text-sm underline underline-offset-4 text-gray-600 hover:text-black">
                    Saved — see all your windows →
                  </Link>
                )}
                {saveState === 'error' && (
                  <span className="text-sm text-[#B3451F]">We couldn&apos;t save that — please try again.</span>
                )}
              </div>
            )}
          </Block>

          <Link
            href={consultationHref}
            className="block w-full rounded-full border border-[#12141C] py-3 text-center text-sm font-medium text-[#12141C] hover:bg-[#12141C] hover:text-white transition-colors"
          >
            Request a consultation
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── small pieces ─────────────────────────────────────────────────────── */
function Block({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

function NumberField({ label, value, onChange, min, max }: {
  label: string; value: string; onChange: (v: string) => void; min: number; max: number
}) {
  const id = `f-${label.replace(/\W+/g, '')}`
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-500">{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
      />
    </div>
  )
}

function Choice({ options, value, onChange }: {
  options: Array<{ key: string; label: string; hint?: string; disabled?: boolean }>
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => !o.disabled && onChange(o.key)}
          disabled={o.disabled}
          aria-pressed={value === o.key}
          title={o.disabled ? o.hint : undefined}
          className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
            o.disabled
              ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
              : value === o.key
                ? 'border-[#12141C] bg-[#12141C] text-white'
                : 'border-gray-300 text-gray-800 hover:border-gray-500'
          }`}
        >
          <span className="block text-sm font-medium">{o.label}</span>
          {o.hint && <span className={`block text-[11px] ${value === o.key ? 'text-white/70' : 'text-gray-500'}`}>{o.hint}</span>}
        </button>
      ))}
    </div>
  )
}

function DesignSummary({ state, card, sheerCard, sizeOk, width, height }: {
  state: State; card: FabricCard | null; sheerCard: FabricCard | null
  sizeOk: boolean; width: number; height: number
}) {
  const heading = headingLabel(state.heading)
  const hardware = HARDWARE_TYPES.find((h) => h.key === state.hardware)?.label
  return (
    <p className="mt-4 text-sm text-gray-600">
      {card ? `${card.name} · ${card.color}` : 'Pick a fabric'}
      {state.composition === 'fabric_plus_sheer' && sheerCard ? ` + ${sheerCard.name} · ${sheerCard.color}` : ''}
      {sizeOk ? ` · ${width}" × ${height}"` : ''}
      {` · ${heading} · ${hardware}, ${state.mount} mount`}
    </p>
  )
}

/**
 * One shortlist of swatches for one layer. Kept as its own component because
 * a drape-plus-sheer design has two of them and they must never share state —
 * putting a sheer in the drapery slot would quote a curtain nobody ordered.
 */
function FabricSlot({ title, fabrics, usingFavorites, selectedId, selected, onSelect, browseHref }: {
  title: string
  fabrics: FabricCard[]
  usingFavorites: boolean
  selectedId: string
  selected: FabricCard | null
  onSelect: (id: string) => void
  browseHref: string
}) {
  return (
    <Block
      title={title}
      aside={
        <Link href={browseHref} className="text-xs underline underline-offset-4 text-gray-500 hover:text-black">
          {usingFavorites ? `My Fabrics (${fabrics.length})` : 'Browse the library'}
        </Link>
      }
    >
      {!usingFavorites && (
        <p className="mb-3 text-xs text-gray-500">
          A few of ours to start with — or{' '}
          <Link href={browseHref} className="underline underline-offset-4">pick your own</Link>.
        </p>
      )}
      {fabrics.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nothing saved yet.{' '}
          <Link href={browseHref} className="underline underline-offset-4">Choose one from the library →</Link>
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {fabrics.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              aria-pressed={f.id === selectedId}
              className={`shrink-0 w-[84px] text-left ${f.id === selectedId ? '' : 'opacity-70 hover:opacity-100'}`}
            >
              <span
                className={`block aspect-square w-full overflow-hidden rounded-lg bg-gray-100 ring-2 ${
                  f.id === selectedId ? 'ring-[#12141C]' : 'ring-transparent'
                }`}
              >
                {f.thumbUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={f.thumbUrl} alt={`${f.name} in ${f.color}`} loading="lazy" className="h-full w-full object-cover" />
                )}
              </span>
              <span className="mt-1 block truncate text-[11px] text-gray-600">{f.name}</span>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <p className="mt-2 text-sm text-gray-700">
          <span className="font-medium">{selected.name}</span> · {selected.color} · {selected.brand}
          {selected.priceStatus === 'ask_in_store' && (
            <span className="ml-2 rounded-full bg-[#F7F6F3] px-2 py-0.5 text-[11px] text-gray-500">Price on consultation</span>
          )}
        </p>
      )}
    </Block>
  )
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`

function Line({ label, line }: { label: string; line: EstimateLine }) {
  let value: string
  if (line.ok && typeof line.price === 'number') value = money(line.price)
  else if (line.ok && line.rangeLow != null && line.rangeHigh != null) value = `${money(line.rangeLow)}–${money(line.rangeHigh)}`
  else value = 'On consultation'
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-gray-600">{label}</span>
      <span className={line.ok ? 'font-medium text-gray-900 tabular-nums' : 'text-gray-500'}>{value}</span>
    </div>
  )
}

function EstimatePanel({ result }: { result: EstimateResult }) {
  const assumed = Object.values(result.assumed || {})
  return (
    <div className="mt-4 rounded-xl bg-[#F7F6F3] p-4 text-sm">
      <Line label="Drapery, made to size" line={result.drapery} />
      <Line label="Hardware" line={result.hardware} />
      <div className="mt-2 border-t border-gray-300 pt-2">
        {result.total ? (
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-medium text-gray-900">Reference estimate</span>
            <span className="text-lg font-medium text-gray-900 tabular-nums">
              {result.total.low === result.total.high
                ? money(result.total.low)
                : `${money(result.total.low)}–${money(result.total.high)}`}
            </span>
          </div>
        ) : (
          <p className="text-gray-600">
            We&apos;ll price this one for you —{' '}
            <Link href="/contact" className="underline underline-offset-4">request a consultation</Link>.
          </p>
        )}
      </div>

      {result.notes.map((n) => (
        <p key={n} className="mt-2 text-xs text-gray-600">{n}</p>
      ))}
      {assumed.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">Assumed: {assumed.join('; ')}.</p>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-gray-400">{ESTIMATE_DISCLAIMER_SHORT}</p>
    </div>
  )
}
