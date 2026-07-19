import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { getUserFromRequest } from '@/lib/auth'
import { getAnonIdFromRequest, logLeadEvent } from '@/lib/homeProjects'
import { getCampaignFromRequest } from '@/lib/campaigns'
import {
  priceCambridgeShutter,
  billingSizeFromWindow,
  CAMBRIDGE_SHUTTER_DEFAULT_RATES,
  type CambridgeShutterRatesTable,
} from '@window-treatments/shared/pricing/aapp'

// Shutter reference quote for the /measure-wizard page. Same engine and same
// rates chain as the AI assistant's quote_shutter_estimate tool: AAPP library
// sync snapshot wins (admin-customized rates), else AAPP-identical inline
// defaults. Always presented as a REFERENCE price — final quote comes from the
// free in-home measurement.

const MATERIALS = ['poly_vinyl', 'hardwood', 'paulownia', 'basswood'] as const

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limit = await rateLimit('measure', ip, { max: 30, windowSeconds: 600 })
    if (!limit.allowed) return bad('Too many requests — please wait a few minutes.', 429)

    let body: any
    try {
      body = await request.json()
    } catch {
      return bad('Invalid request body.')
    }

    const material = String(body?.material || '')
    if (!(MATERIALS as readonly string[]).includes(material)) return bad('Unknown material.')
    const colorType = body?.color_type === 'stain' ? 'stain' : 'paint'
    const rawW = Number(body?.width_in)
    const rawH = Number(body?.height_in)
    if (!Number.isFinite(rawW) || !Number.isFinite(rawH) || rawW < 6 || rawH < 6 || rawW > 240 || rawH > 240) {
      return bad('Width and height must be between 6 and 240 inches.')
    }
    const quantity = Math.min(Math.max(Math.trunc(Number(body?.quantity) || 1), 1), 20)

    // Rates: AAPP sync snapshot → inline defaults (same chain as AAPP itself).
    let rates: CambridgeShutterRatesTable = CAMBRIDGE_SHUTTER_DEFAULT_RATES
    try {
      const { getAappLibrary } = await import('@/lib/aappLibrary')
      const snap = await getAappLibrary()
      const lib = snap?.data?.cambridgeShutter?.pricingRates
      if (lib && typeof lib === 'object' && lib.rates && lib.options_psf && lib.options_ea) rates = lib
    } catch {
      /* snapshot unavailable → defaults */
    }

    // Page flow always takes WINDOW size; the standard frame allowance is
    // added here (AAPP window_size mode, +3"/+3").
    const { widthIn, heightIn } = billingSizeFromWindow(rawW, rawH)
    const r = priceCambridgeShutter(
      {
        materialId: material as any,
        colorType,
        widthIn,
        heightIn,
        styleId: 'standard',
        tiltControl: 'hidden_tilt_rod', // AAPP quote UI default
        quantity,
      },
      rates
    )
    if (!r) return bad('Could not compute a price for those measurements.')

    const userId = getUserFromRequest(request)?.id ?? null
    logLeadEvent({
      userId,
      anonId: getAnonIdFromRequest(request),
      type: 'shutter_estimate',
      value: r.subtotal,
      meta: { source: 'measure_wizard_page', material, colorType, w: widthIn, h: heightIn, qty: quantity },
      campaignId: getCampaignFromRequest(request),
    })

    return NextResponse.json({
      success: true,
      data: {
        price: r.subtotal,
        install_fee: r.installAmount,
        area_sqft: r.areaSqFt,
        billed_width_in: widthIn,
        billed_height_in: heightIn,
        quantity: r.qty,
      },
    })
  } catch (e) {
    console.error('[measure/shutter] error:', e)
    return bad('Something went wrong. Please try again.', 500)
  }
}

export const dynamic = 'force-dynamic'
