import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Fixed shop sender (matches the address_from used when buying labels in
// /api/admin/shipping). Hardcoded — not persisted per shipment.
const FROM = {
  name: 'Angel Drapery',
  company: 'Angel Drapery, Inc',
  street: '8831 E Las Tunas Dr',
  city: 'Temple City',
  state: 'CA',
  zip: '91780',
  country: 'US',
}

// DB shipment status → page status.
function mapStatus(s: string): 'completed' | 'voided' | 'in_transit' | 'delivered' {
  switch ((s || '').toLowerCase()) {
    case 'delivered': return 'delivered'
    case 'transit':
    case 'pre_transit': return 'in_transit'
    case 'voided':
    case 'refunded':
    case 'returned':
    case 'failure': return 'voided'
    case 'shipped':
    default: return 'completed'
  }
}

export async function GET(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher.
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await query<any>(
      `SELECT s.*, o.order_number, o.customer_name, o.customer_email, o.customer_phone,
              o.shipping_address, o.items
       FROM order_shipments s
       JOIN orders o ON o.id = s.order_id
       ORDER BY s.created_at DESC`
    ).catch((e: any) => {
      // Table may not exist yet on a fresh DB — treat as empty.
      if (e instanceof Error && e.message.includes('does not exist')) return []
      throw e
    })

    const shipments = rows.map((r: any) => {
      const addr = r.shipping_address || {}
      const orderItems: any[] = Array.isArray(r.items) ? r.items : []
      const indices: number[] = Array.isArray(r.item_indices) ? r.item_indices : []
      const qtys: Record<string, number> = r.item_quantities || {}

      const items = indices.map((idx: number) => {
        const item = orderItems[idx]
        if (!item) return null
        const qty = qtys[String(idx)] ?? item.quantity ?? 1
        const options = Array.isArray(item.options)
          ? item.options.map((o: any) => `${o.displayLabel}: ${o.valueLabel}`).join(', ')
          : (typeof item.options === 'string' ? item.options : '')
        return {
          name: item.productName || 'Custom Item',
          qty: Number(qty) || 1,
          width: item.width != null ? Number(item.width) : undefined,
          height: item.height != null ? Number(item.height) : undefined,
          options: options || undefined,
        }
      }).filter(Boolean)

      const totalCost = r.label_cost != null ? Number(r.label_cost) : 0

      return {
        id: r.id,
        orderId: r.order_id,
        orderNumber: r.order_number || '',
        status: mapStatus(r.status),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : '',
        carrier: r.carrier || '',
        service: r.service || '',
        trackingNumber: r.tracking_number || '',
        trackingUrl: r.tracking_url || '',
        labelUrl: r.label_url || '',
        fromName: FROM.name,
        fromCompany: FROM.company,
        fromStreet: FROM.street,
        fromCity: FROM.city,
        fromState: FROM.state,
        fromZip: FROM.zip,
        fromCountry: FROM.country,
        toName: r.customer_name || '',
        toStreet: addr.street || '',
        toCity: addr.city || '',
        toState: addr.state || '',
        toZip: addr.zip || '',
        toCountry: addr.country || 'US',
        toPhone: r.customer_phone || '',
        toEmail: r.customer_email || '',
        // Parcel dims may be null on manual/legacy shipments — default 0.
        parcelLength: r.parcel_length != null ? Number(r.parcel_length) : 0,
        parcelWidth: r.parcel_width != null ? Number(r.parcel_width) : 0,
        parcelHeight: r.parcel_height != null ? Number(r.parcel_height) : 0,
        parcelWeight: r.parcel_weight != null ? Number(r.parcel_weight) : 0,
        // Only the total label cost is persisted; retail/service breakdown isn't.
        retailRate: 0,
        shippingRate: totalCost,
        serviceRate: 0,
        totalCost,
        items,
      }
    })

    const total = shipments
      .filter((s: any) => s.status !== 'voided')
      .reduce((sum: number, s: any) => sum + (s.totalCost || 0), 0)

    return NextResponse.json({ success: true, data: { shipments, total } })
  } catch (e) {
    return errorResponse('Could not load shipments.', 500, e)
  }
}
