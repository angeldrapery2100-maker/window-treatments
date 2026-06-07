import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query } from '@/lib/db'

const SHIPPO_API = 'https://api.goshippo.com'
const SHIPPO_TOKEN = process.env.SHIPPO_API_KEY!

// POST: calculate shipping rates for cart items going to a specific address
export async function POST(request: Request) {
  try {
    const { items, address } = await request.json()
    // items: [{ productId, width, height, quantity }]
    // address: { street, city, state, zip }

    if (!address?.street || !address?.city || !address?.state || !address?.zip) {
      return NextResponse.json({ success: false, error: 'Complete address required' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'No items' }, { status: 400 })
    }

    // For each item, find matching parcel rule
    const parcels: any[] = []

    for (const item of items) {
      const rules = await query(
        `SELECT * FROM product_parcel_rules WHERE product_id = $1 ORDER BY sort_order, min_width`,
        [item.productId]
      ).catch(() => [])

      let matched = null
      for (const rule of rules) {
        const w = item.width || 0
        const h = item.height || 0
        if (w >= Number(rule.min_width) && w <= Number(rule.max_width) &&
            h >= Number(rule.min_height) && h <= Number(rule.max_height)) {
          matched = rule
          break
        }
      }

      // Fallback: use first rule or default
      if (!matched && rules.length > 0) matched = rules[rules.length - 1]

      const baseParcel = matched
        ? { length: Number(matched.parcel_length), width: Number(matched.parcel_width), height: Number(matched.parcel_height), weight: Number(matched.parcel_weight) }
        : { length: 24, width: 12, height: 6, weight: 5 }

      const qty = item.quantity || 1
      // Single parcel with combined weight for multiple quantities
      parcels.push({
        length: String(baseParcel.length),
        width: String(baseParcel.width),
        height: String(baseParcel.height),
        distance_unit: 'in',
        weight: String(baseParcel.weight * qty),
        mass_unit: 'lb',
      })
    }

    // Call Shippo to get rates
    const shippoPayload = {
      address_from: {
        name: 'Angel Drapery',
        company: 'Angel Drapery Inc',
        street1: '8827 Las Tunas Dr',
        city: 'Temple City',
        state: 'CA',
        zip: '91780',
        country: 'US',
        phone: '6267032929',
      },
      address_to: {
        name: 'Customer',
        street1: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: 'US',
      },
      parcels,
      async: false,
    }

    const res = await fetch(`${SHIPPO_API}/shipments/`, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shippoPayload),
    })
    const shipment = await res.json()


    if (!shipment.rates || (shipment.rates.length === 0 && shipment.status === 'ERROR')) {
      const errMsg = shipment.messages?.map((m: any) => m.text).join('; ') || 'Unable to calculate shipping rates'
      console.error('[shipping-rates] Shippo error:', errMsg)
      return NextResponse.json({
        success: false,
        error: errMsg
      }, { status: 400 })
    }

    const rates = shipment.rates
      .filter((r: any) => r.amount)
      .sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount))
      .map((r: any) => ({
        rateId: r.object_id,
        carrier: r.provider,
        service: r.servicelevel?.name || '',
        price: parseFloat(r.amount),
        currency: r.currency,
        estimatedDays: r.estimated_days || r.duration_terms || '',
      }))

    return NextResponse.json({ success: true, data: { rates } })
  } catch (e: any) {
    console.error('Shipping rates error:', e)
    return errorResponse('Could not fetch shipping rates. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
