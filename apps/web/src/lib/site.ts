// Site-wide business constants. Single source of truth for trust/contact
// details that appear in multiple footers and sections.

/** ©1984–<current year> — emphasizes 40+ years of continuous operation. */
export const COPYRIGHT = `©1984–${new Date().getFullYear()} Angel Drapery, Inc.`

export const PRIMARY_PHONE = '626-451-9841'

export const INSTAGRAM_URL = 'https://www.instagram.com/angeldrapery'

export const BUSINESS_ADDRESS = '8831 E Las Tunas Dr, Temple City, CA 91780'

export const BUSINESS_HOURS = 'Mon–Fri 9:00 am – 5:00 pm · Sat 10:00 am – 3:00 pm'

/** Flat shipping rates for swatch-only orders (swatches themselves are free;
 *  charging shipping keeps orders serious). Shaped like Shippo rates so the
 *  checkout flow can reuse the same selectedRate plumbing. */
export const SWATCH_SHIPPING_RATES = [
  { rateId: 'swatch_standard', carrier: 'USPS', service: 'Standard (5-8 days)', price: 2.99, estimatedDays: '5-8' },
  { rateId: 'swatch_expedited', carrier: 'USPS', service: 'Expedited (2-3 days)', price: 9.99, estimatedDays: '2-3' },
] as const

/** Clean address-based Google Maps embed (the old pb= URLs carried fake placeholder
 *  tokens). hl=en pins the embed to English regardless of the visitor's locale. */
export const MAPS_EMBED_URL =
  'https://www.google.com/maps?q=8831%20E%20Las%20Tunas%20Dr%2C%20Temple%20City%2C%20CA%2091780&output=embed&hl=en'
