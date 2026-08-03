import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { recordAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const SHIPPO_API = 'https://api.goshippo.com'
const SHIPPO_TOKEN = process.env.SHIPPO_API_KEY || ''

const FROM = {
  name: 'Angel Drapery',
  company: 'Angel Drapery Inc',
  street1: '8827 Las Tunas Dr',
  city: 'Temple City',
  state: 'CA',
  zip: '91780',
  country: 'US',
  phone: '6267032929',
  email: 'admin@angel-drapery.com',
}

async function shippoFetch(endpoint: string, method = 'GET', body?: any) {
  const res = await fetch(`${SHIPPO_API}${endpoint}`, {
    method,
    headers: { Authorization: `ShippoToken ${SHIPPO_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

async function ensureCustomShipmentsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS admin_custom_shipments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      recipient_name varchar(256) NOT NULL,
      recipient_company varchar(256) DEFAULT '',
      street1 text NOT NULL,
      street2 text DEFAULT '',
      city varchar(128) NOT NULL,
      state varchar(64) NOT NULL,
      zip varchar(32) NOT NULL,
      country varchar(2) NOT NULL DEFAULT 'US',
      phone varchar(64) DEFAULT '',
      email varchar(256) DEFAULT '',
      parcel_length numeric,
      parcel_width numeric,
      parcel_height numeric,
      parcel_weight numeric,
      parcel_weight_unit varchar(8) DEFAULT 'lb',
      package_preset varchar(128) DEFAULT 'custom',
      carrier_template varchar(128) DEFAULT '',
      contents text DEFAULT '',
      tracking_number varchar(128),
      tracking_url text,
      label_url text,
      carrier varchar(64),
      service varchar(128),
      shippo_transaction_id varchar(256),
      label_cost numeric(10,2) DEFAULT NULL,
      status varchar(32) DEFAULT 'shipped',
      created_by uuid DEFAULT NULL,
      created_at timestamptz DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_admin_custom_shipments_created_at ON admin_custom_shipments(created_at DESC)`).catch(() => {})
  await query(`ALTER TABLE admin_custom_shipments ADD COLUMN IF NOT EXISTS package_preset varchar(128) DEFAULT 'custom'`).catch(() => {})
  await query(`ALTER TABLE admin_custom_shipments ADD COLUMN IF NOT EXISTS carrier_template varchar(128) DEFAULT ''`).catch(() => {})
  await query(`ALTER TABLE admin_custom_shipments ADD COLUMN IF NOT EXISTS contents text DEFAULT ''`).catch(() => {})
  await query(`ALTER TABLE admin_custom_shipments ADD COLUMN IF NOT EXISTS parcel_weight_unit varchar(8) DEFAULT 'lb'`).catch(() => {})
}

function cleanText(v: any, max = 256): string {
  return String(v ?? '').trim().slice(0, max)
}

function cleanParcel(input: any) {
  const template = cleanText(input?.template, 128)
  const weight = Number(input?.weight)
  const massUnit = cleanText(input?.massUnit || input?.weightUnit || 'lb', 8).toLowerCase()
  if (template) {
    if (!Number.isFinite(weight) || weight <= 0) return null
    if (!['lb', 'oz', 'kg', 'g'].includes(massUnit)) return null
    return { template, length: null, width: null, height: null, weight, massUnit }
  }
  const parcel = {
    template: '',
    length: Number(input?.length),
    width: Number(input?.width),
    height: Number(input?.height),
    weight,
    massUnit,
  }
  if (![parcel.length, parcel.width, parcel.height, parcel.weight].every(n => Number.isFinite(n) && n > 0)) {
    return null
  }
  if (!['lb', 'oz', 'kg', 'g'].includes(parcel.massUnit)) return null
  return parcel
}

function cleanAddress(input: any) {
  const address = {
    name: cleanText(input?.name),
    company: cleanText(input?.company),
    street1: cleanText(input?.street1, 500),
    street2: cleanText(input?.street2, 500),
    city: cleanText(input?.city, 128),
    state: cleanText(input?.state, 64).toUpperCase(),
    zip: cleanText(input?.zip, 32),
    country: (cleanText(input?.country, 2) || 'US').toUpperCase(),
    phone: cleanText(input?.phone, 64),
    email: cleanText(input?.email, 256),
  }
  if (!address.name || !address.street1 || !address.city || !address.state || !address.zip) return null
  return address
}

function rateResponse(rates: any[]) {
  return rates
    .filter((r: any) => r.amount)
    .sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount))
    .map((r: any) => ({
      rateId: r.object_id,
      carrier: r.provider,
      service: r.servicelevel?.name || r.servicelevel?.token || '',
      price: r.amount,
      currency: r.currency,
      estimatedDays: r.estimated_days || r.duration_terms || 'N/A',
      carrierImage: r.provider_image_75 || r.provider_image_200 || '',
    }))
}

function addressSuggestionKey(s: any): string {
  return [
    s.name, s.company, s.street1, s.street2, s.city, s.state, s.zip, s.country, s.phone, s.email,
  ].map(v => String(v || '').trim().toLowerCase()).join('|')
}

function normalizeSuggestion(input: any, source: 'order' | 'custom') {
  const addr = input.shipping_address || {}
  return {
    source,
    sourceLabel: source === 'order' ? (input.order_number || 'Order') : 'Custom label',
    lastUsedAt: input.created_at ? new Date(input.created_at).toISOString() : '',
    name: input.customer_name || input.recipient_name || '',
    company: input.recipient_company || '',
    street1: addr.street || input.street1 || '',
    street2: addr.street2 || input.street2 || '',
    city: addr.city || input.city || '',
    state: addr.state || input.state || '',
    zip: addr.zip || input.zip || '',
    country: addr.country || input.country || 'US',
    phone: input.customer_phone || input.phone || '',
    email: input.customer_email || input.email || '',
  }
}

export async function POST(request: Request) {
  let adminUser: any
  try { adminUser = requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const action = body?.action

    if (action === 'address_suggest') {
      const term = cleanText(body?.query, 128)
      if (term.length < 2) return NextResponse.json({ success: true, data: { suggestions: [] } })

      const like = `%${term}%`
      const orderRows = await query<any>(
        `SELECT order_number, customer_name, customer_email, customer_phone, shipping_address, created_at
         FROM orders
         WHERE customer_name ILIKE $1
            OR customer_email ILIKE $1
            OR customer_phone ILIKE $1
            OR shipping_address->>'street' ILIKE $1
            OR shipping_address->>'city' ILIKE $1
            OR shipping_address->>'zip' ILIKE $1
         ORDER BY created_at DESC
         LIMIT 12`,
        [like]
      ).catch((e: any) => {
        if (e instanceof Error && e.message.includes('does not exist')) return []
        throw e
      })

      const customRows = await query<any>(
        `SELECT recipient_name, recipient_company, street1, street2, city, state, zip, country, phone, email, created_at
         FROM admin_custom_shipments
         WHERE recipient_name ILIKE $1
            OR recipient_company ILIKE $1
            OR email ILIKE $1
            OR phone ILIKE $1
            OR street1 ILIKE $1
            OR city ILIKE $1
            OR zip ILIKE $1
         ORDER BY created_at DESC
         LIMIT 12`,
        [like]
      ).catch((e: any) => {
        if (e instanceof Error && e.message.includes('does not exist')) return []
        throw e
      })

      const seen = new Set<string>()
      const suggestions = [...orderRows.map((r: any) => normalizeSuggestion(r, 'order')), ...customRows.map((r: any) => normalizeSuggestion(r, 'custom'))]
        .filter((s: any) => s.name && s.street1 && s.city && s.state && s.zip)
        .filter((s: any) => {
          const key = addressSuggestionKey(s)
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .sort((a: any, b: any) => new Date(b.lastUsedAt || 0).getTime() - new Date(a.lastUsedAt || 0).getTime())
        .slice(0, 8)

      return NextResponse.json({ success: true, data: { suggestions } })
    }

    if (action === 'validate_address') {
      const address = cleanAddress(body?.address)
      if (!address) return NextResponse.json({ success: false, error: 'Recipient address is incomplete.' }, { status: 400 })

      const params = new URLSearchParams({
        name: address.name,
        organization: address.company,
        address_line_1: address.street1,
        address_line_2: address.street2,
        city_locality: address.city,
        state_province: address.state,
        postal_code: address.zip,
        country_code: address.country,
      })
      const validation = await shippoFetch(`/v2/addresses/validate?${params.toString()}`)
      if (validation?.detail || validation?.message || validation?.error) {
        return NextResponse.json({
          success: false,
          error: validation.detail || validation.message || validation.error || 'Could not validate address.',
        }, { status: 400 })
      }

      const recommended = validation?.recommended_address
      return NextResponse.json({
        success: true,
        data: {
          original: validation?.original_address || null,
          analysis: validation?.analysis || null,
          recommended: recommended ? {
            name: address.name,
            company: recommended.organization || address.company,
            street1: recommended.address_line_1 || address.street1,
            street2: recommended.address_line_2 || '',
            city: recommended.city_locality || address.city,
            state: recommended.state_province || address.state,
            zip: recommended.postal_code || address.zip,
            country: recommended.country_code || address.country,
            phone: address.phone,
            email: address.email,
          } : null,
        },
      })
    }

    if (action === 'get_rates') {
      const address = cleanAddress(body?.address)
      const parcel = cleanParcel(body?.parcel)

      if (!address) return NextResponse.json({ success: false, error: 'Recipient address is incomplete.' }, { status: 400 })
      if (!parcel) return NextResponse.json({ success: false, error: 'Package dimensions and weight are required.' }, { status: 400 })

      const shipment = await shippoFetch('/shipments/', 'POST', {
        address_from: FROM,
        address_to: {
          name: address.name,
          company: address.company || undefined,
          street1: address.street1,
          street2: address.street2 || undefined,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
          phone: address.phone || undefined,
          email: address.email || undefined,
        },
        parcels: [parcel.template ? {
          template: parcel.template,
          weight: String(parcel.weight),
          mass_unit: parcel.massUnit,
        } : {
          length: String(parcel.length),
          width: String(parcel.width),
          height: String(parcel.height),
          distance_unit: 'in',
          weight: String(parcel.weight),
          mass_unit: parcel.massUnit,
        }],
        async: false,
      })

      if (!shipment.rates || shipment.rates.length === 0) {
        return NextResponse.json({
          success: false,
          error: shipment.messages?.map((m: any) => m.text).join('; ') || 'Failed to get rates',
        }, { status: 400 })
      }

      return NextResponse.json({ success: true, data: { rates: rateResponse(shipment.rates) } })
    }

    if (action === 'purchase_label') {
      const address = cleanAddress(body?.address)
      const parcel = cleanParcel(body?.parcel)
      const rateId = cleanText(body?.rateId, 256)

      if (!address) return NextResponse.json({ success: false, error: 'Recipient address is incomplete.' }, { status: 400 })
      if (!parcel) return NextResponse.json({ success: false, error: 'Package dimensions and weight are required.' }, { status: 400 })
      if (!rateId) return NextResponse.json({ success: false, error: 'Please select a shipping service.' }, { status: 400 })

      const transaction = await shippoFetch('/transactions/', 'POST', {
        rate: rateId,
        label_file_type: 'PDF',
        async: false,
      })

      if (transaction.status !== 'SUCCESS') {
        return NextResponse.json({
          success: false,
          error: transaction.messages?.map((m: any) => m.text).join('; ') || 'Failed to purchase label',
        }, { status: 400 })
      }

      await ensureCustomShipmentsTable()
      const row = await query<any>(
        `INSERT INTO admin_custom_shipments (
          recipient_name, recipient_company, street1, street2, city, state, zip, country, phone, email,
          parcel_length, parcel_width, parcel_height, parcel_weight, parcel_weight_unit, package_preset, carrier_template, contents,
          tracking_number, tracking_url, label_url, carrier, service, shippo_transaction_id, label_cost, status, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23, $24, $25, 'shipped', $26
        ) RETURNING id`,
        [
          address.name, address.company, address.street1, address.street2, address.city, address.state, address.zip, address.country, address.phone, address.email,
          parcel.length, parcel.width, parcel.height, parcel.weight, parcel.massUnit, cleanText(body?.packagePreset, 128) || 'custom',
          parcel.template || '', cleanText(body?.contents, 1000),
          transaction.tracking_number, transaction.tracking_url_provider, transaction.label_url,
          transaction.rate?.provider || '', transaction.rate?.servicelevel?.name || '', transaction.object_id,
          Number(transaction.rate?.amount) || null, adminUser.id,
        ]
      )

      await recordAudit({
        action: 'shipping.custom_label_purchased',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'admin_custom_shipment',
        target_id: row[0]?.id,
        note: `tracking ${transaction.tracking_number || 'n/a'} · ${address.name}`,
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        data: {
          id: row[0]?.id,
          labelUrl: transaction.label_url,
          trackingNumber: transaction.tracking_number,
          trackingUrl: transaction.tracking_url_provider,
          carrier: transaction.rate?.provider || '',
        },
      })
    }

    if (action === 'void_label') {
      const shipmentId = cleanText(body?.shipmentId, 128)
      if (!shipmentId) return NextResponse.json({ success: false, error: 'shipmentId required' }, { status: 400 })
      await ensureCustomShipmentsTable()

      const shipment = await queryOne<any>(`SELECT * FROM admin_custom_shipments WHERE id = $1`, [shipmentId])
      if (!shipment) return NextResponse.json({ success: false, error: 'Shipment not found' }, { status: 404 })
      if (shipment.status === 'voided' || shipment.status === 'refunded') {
        return NextResponse.json({ success: true, data: { refundStatus: 'already_voided' } })
      }

      let refundStatus = 'manual'
      if (shipment.shippo_transaction_id) {
        const refund = await shippoFetch('/refunds/', 'POST', {
          transaction: shipment.shippo_transaction_id,
          async: false,
        })
        refundStatus = refund?.status || 'UNKNOWN'
        if (refundStatus === 'ERROR') {
          const msg = refund?.messages?.map((m: any) => m.text).join('; ')
            || 'Shippo rejected the refund request.'
          return NextResponse.json({ success: false, error: msg }, { status: 400 })
        }
      }

      await query(`UPDATE admin_custom_shipments SET status = 'voided' WHERE id = $1`, [shipmentId])
      await recordAudit({
        action: 'shipping.custom_label_voided',
        actor_id: adminUser.id,
        actor_email: adminUser.email,
        target_type: 'admin_custom_shipment',
        target_id: shipmentId,
        note: `tracking ${shipment.tracking_number || 'n/a'} · refund ${refundStatus}`,
      }).catch(() => {})

      return NextResponse.json({ success: true, data: { refundStatus } })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return errorResponse('Could not create the shipping label.', 500, e)
  }
}
