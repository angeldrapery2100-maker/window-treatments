import pool from './db'

export interface SiteContent {
  id: string
  page: string
  section: string
  field_key: string
  field_type: string
  content: string
  image_url: string
  image_width: number
  image_height: number
  image_fit: string
  sort_order: number
  metadata: any
}

/**
 * Fetch all content for a page, grouped by section.
 * Returns a map: { section: { field_key: SiteContent } }
 */
export async function getPageContent(page: string): Promise<Record<string, Record<string, SiteContent>>> {
  try {
    const result = await pool.query(
      'SELECT * FROM site_content WHERE page = $1 ORDER BY section, sort_order, field_key',
      [page]
    )

    const grouped: Record<string, Record<string, SiteContent>> = {}
    for (const row of result.rows) {
      if (!grouped[row.section]) grouped[row.section] = {}
      grouped[row.section][row.field_key] = row
    }
    return grouped
  } catch (e) {
    // Table might not exist yet — return empty
    console.warn('getPageContent error (table may not exist):', (e as any).message)
    return {}
  }
}

/**
 * Helper to get text content with fallback
 */
export function getText(
  data: Record<string, Record<string, SiteContent>> | undefined,
  section: string,
  key: string,
  fallback = ''
): string {
  const value = data?.[section]?.[key]?.content
  if (typeof value !== 'string') return fallback

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

/**
 * Helper to get image data with fallback
 */
export function getImage(
  data: Record<string, Record<string, SiteContent>> | undefined,
  section: string,
  key: string,
): { url: string; alt: string; width: number; height: number; fit: string } | null {
  const item = data?.[section]?.[key]
  if (!item) return null
  return {
    url: item.image_url || '',
    alt: item.content || '',
    width: item.image_width || 0,
    height: item.image_height || 0,
    fit: item.image_fit || 'cover',
  }
}
