// Carrier tracking-URL builder.
//
// Shippo-purchased labels come with a carrier tracking_url. MANUAL shipments
// (an operator types an existing tracking number, no label bought) have only a
// carrier name + number, so there's no clickable link in the shipped email or
// the branded tracking page. This derives the carrier's public tracking URL
// from the carrier + number so manual shipments get a working link too.
//
// Pure + isomorphic (used by the server email route and the client track page).

export function carrierTrackingUrl(carrier?: string | null, trackingNumber?: string | null): string {
  const n = String(trackingNumber || '').trim()
  if (!n) return ''
  const c = String(carrier || '').toLowerCase()
  const num = encodeURIComponent(n)
  if (/usps/.test(c)) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`
  if (/ups/.test(c)) return `https://www.ups.com/track?tracknum=${num}`
  if (/fedex/.test(c)) return `https://www.fedex.com/fedextrack/?trknbr=${num}`
  if (/dhl/.test(c)) return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${num}`
  if (/ontrac/.test(c)) return `https://www.ontrac.com/tracking/?number=${num}`
  if (/canada\s*post|canadapost/.test(c)) return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${num}`
  // Unknown carrier → no direct link; the branded tracking page still covers it.
  return ''
}

/** Best available tracking URL: the carrier's own (Shippo) if present, else derived. */
export function resolveTrackingUrl(trackingUrl?: string | null, carrier?: string | null, trackingNumber?: string | null): string {
  const direct = String(trackingUrl || '').trim()
  if (direct) return direct
  return carrierTrackingUrl(carrier, trackingNumber)
}
