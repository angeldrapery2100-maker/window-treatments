// Site-wide business constants. Single source of truth for trust/contact
// details that appear in multiple footers and sections.

/** ©1984–<current year> — emphasizes 40+ years of continuous operation. */
export const COPYRIGHT = `©1984–${new Date().getFullYear()} Angel Drapery, Inc.`

export const PRIMARY_PHONE = '626-451-9841'

/** CA contractor license — placeholder until the owner provides the number. */
export const CA_LICENSE = '[待补充: License 号]'

export const INSTAGRAM_URL = 'https://www.instagram.com/angeldrapery'

export const BUSINESS_ADDRESS = '8831 E Las Tunas Dr, Temple City, CA 91780'

/** Clean address-based Google Maps embed (the old pb= URLs carried fake placeholder tokens). */
export const MAPS_EMBED_URL =
  'https://www.google.com/maps?q=8831%20E%20Las%20Tunas%20Dr%2C%20Temple%20City%2C%20CA%2091780&output=embed'
