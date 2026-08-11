import { NextResponse } from 'next/server'
import {
  HEADING_STYLES, combinationProblem, headingLabel, mountsFor,
  type HardwareType, type HeadingStyle,
} from '@window-treatments/shared/design'
import { draperyEstimate } from '@/lib/draperyPricing'
import { hardwareEstimate } from '@/lib/hardwarePricing'
import { getFabric } from '@/lib/draperyFabricLibrary'
import { errorResponse } from '@/lib/apiError'

/**
 * Reference estimate for one drapery design from /design.
 *
 * PRICING IS NOT COMPUTED HERE. This route validates the request, looks the
 * fabric's $/yard up server-side, and hands the numbers to the two existing
 * AAPP-backed chains — `draperyEstimate` (catalog_price_estimate) and
 * `hardwareEstimate` (drapery_hardware). No maths, no fallbacks, no invented
 * figures: if AAPP can't price something, we say so and point at a consultant.
 *
 * The fabric price is resolved from the id rather than accepted from the
 * client, so a visitor can't post their own $/yard and mint an estimate.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The heading keys ARE AAPP's style keys (the website spelling of them), so
 * there is no translation table to drift: whatever the customer picks is what
 * the pricing engine is asked about.
 */
const HEADING_KEYS = new Set<string>(HEADING_STYLES.map((h) => h.key))

const HARDWARE_FAMILY: Record<HardwareType, { kind: 'pole' | 'track'; family: string }> = {
  wood_pole: { kind: 'pole', family: 'wood_pole' },
  alu_track: { kind: 'track', family: 'aluminum_track' },
  h_rail: { kind: 'track', family: 'h_rail' },
}

const LININGS = ['NO', 'LF', 'BO']
const SIZE = { minW: 20, maxW: 300, minH: 20, maxH: 144 }

// One estimate is two AAPP round-trips; this keeps a loose tab open from
// turning into a stampede. Per-lambda and in-memory on purpose — it is a
// speed bump, not a security control.
const hits = new Map<string, number[]>()
const LIMIT = 30, WINDOW_MS = 60_000
function throttled(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > LIMIT
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
    if (throttled(ip)) return errorResponse('Too many estimates — please wait a moment.', 429)

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') return errorResponse('Invalid request.', 400)

    const heading = String(body.heading || '') as HeadingStyle
    const hardware = String(body.hardware || '') as HardwareType
    if (!HEADING_KEYS.has(heading)) return errorResponse('Unknown heading style.', 400)
    if (!(hardware in HARDWARE_FAMILY)) return errorResponse('Unknown hardware type.', 400)

    const mount = mountsFor(hardware).includes(body.mount) ? body.mount : mountsFor(hardware)[0]
    const lining = LININGS.includes(String(body.lining)) ? String(body.lining) : 'LF'
    const split = body.split !== false

    const widthIn = Number(body.finishedWidthIn)
    const heightIn = Number(body.finishedHeightIn)
    if (!(widthIn >= SIZE.minW && widthIn <= SIZE.maxW) || !(heightIn >= SIZE.minH && heightIn <= SIZE.maxH)) {
      return errorResponse(
        `Finished size must be ${SIZE.minW}–${SIZE.maxW}" wide and ${SIZE.minH}–${SIZE.maxH}" high. Anything outside that we quote by consultation.`,
        400
      )
    }

    // The width and the draw direction are part of what makes a pairing legal
    // — a wood pole that is fine at 90" is not fine at 200" — so this check
    // has to happen after the size is known, not before it.
    const problem = combinationProblem(heading, hardware, { split, finishedWidthIn: widthIn })
    if (problem) return errorResponse(problem, 400)

    const fabric = getFabric(String(body.fabricId || ''))
    if (!fabric) return errorResponse('Fabric not found.', 404)

    const notes: string[] = []
    const assumed: Record<string, string> = {}

    // ── drapery ────────────────────────────────────────────────────────────
    let drapery: Record<string, unknown>
    if (fabric.pricePerYard == null) {
      drapery = { ok: false, unavailable: 'fabric_price_on_consultation' }
      notes.push('We have not published a yardage price for this fabric yet, so the make-up is quoted by a consultant.')
    } else {
      const est = await draperyEstimate({
        finishedWidthIn: widthIn,
        finishedHeightIn: heightIn,
        styleKey: heading,
        lining,
        fabricPricePerYard: fabric.pricePerYard,
        composition: 'fabric_only',
        operation: split ? 'split' : 'single_left',
      })
      drapery = est.ok
        ? { ok: true, price: est.price, rangeLow: est.rangeLow, rangeHigh: est.rangeHigh, pricedAt: est.pricedAt }
        : { ok: false, unavailable: est.error || 'estimate_failed' }
      Object.assign(assumed, est.assumed || {})
    }

    // ── hardware ───────────────────────────────────────────────────────────
    const hw = HARDWARE_FAMILY[hardware]
    const hwEst = await hardwareEstimate({
      lengthIn: widthIn,
      kind: hw.kind,
      family: hw.family,
      layer: 'single',
      mount,
      motorized: false,
    })
    const hardwareOut = hwEst.ok
      ? { ok: true, price: hwEst.price, rangeLow: hwEst.rangeLow, rangeHigh: hwEst.rangeHigh }
      : { ok: false, unavailable: hwEst.error || (hwEst.ask ? 'needs_choice' : 'estimate_failed') }
    if (!hwEst.ok) notes.push('Hardware for this combination is quoted by a consultant.')
    assumed.hardwareLayer = 'single rod or track (no separate sheer layer)'

    // ── total ──────────────────────────────────────────────────────────────
    const span = (o: Record<string, unknown>): [number, number] | null => {
      if (!o.ok) return null
      if (typeof o.price === 'number') return [o.price, o.price]
      if (typeof o.rangeLow === 'number' && typeof o.rangeHigh === 'number') return [o.rangeLow, o.rangeHigh]
      return null
    }
    const d = span(drapery), h = span(hardwareOut)
    const total = d && h ? { low: Math.round(d[0] + h[0]), high: Math.round(d[1] + h[1]) } : null

    return NextResponse.json({
      success: true,
      data: {
        heading: { key: heading, label: headingLabel(heading) },
        fabric: {
          id: fabric.id,
          name: fabric.name,
          color: fabric.color,
          brand: fabric.brand,
          priceStatus: fabric.priceStatus,
        },
        drapery,
        hardware: hardwareOut,
        total,
        assumed,
        notes,
      },
    })
  } catch (err) {
    return errorResponse('We could not work out an estimate just now.', 500, err)
  }
}
