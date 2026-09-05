import type { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import pool from '@/lib/db'

const BASE = 'https://angel-drapery.com'

// Regenerate the sitemap hourly so newly published products get indexed.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // 1) Static / hand-built routes (high priority marketing + collection pages).
  const staticPaths = [
    '', 'about', 'gallery', 'contact', 'products', 'store',
    'privacy', 'terms',
    'products/handcrafted-drapery',
    'products/handcrafted-roman-shade',
    'products/handcrafted-top-treatment',
    'products/luma-collection',
    'products/lutron-palladiom',
    'products/roller-collection',
    'products/sheer-collection',
    'smart-shades',
    'how-to-measure',
    'faq',
    'warranty',
    'service-areas',
    'service-areas/temple-city',
    'service-areas/arcadia',
    'service-areas/san-marino',
    'service-areas/pasadena',
    'service-areas/san-gabriel',
    'service-areas/alhambra',
  ]
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: p === '' ? `${BASE}/` : `${BASE}/${p}`,
    lastModified: now,
    changeFrequency: p === '' ? 'weekly' : 'monthly',
    priority: p === '' ? 1.0 : 0.8,
  }))

  // 2) Hunter Douglas product detail pages — one JSON file per slug.
  try {
    const dir = path.join(process.cwd(), 'public', 'hunter-douglas', 'products')
    const slugs = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.json') && f !== 'products-index.json')
      .map((f) => f.replace(/\.json$/, ''))
    for (const slug of slugs) {
      entries.push({
        url: `${BASE}/products/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch (e) {
    console.error('[sitemap] could not read Hunter Douglas products dir:', e)
  }

  // 3) DB-driven showcase products (routed by numeric id).
  try {
    const { rows } = await pool.query(
      `SELECT id FROM showcase_products WHERE status = 'active' ORDER BY sort_order`
    )
    for (const row of rows) {
      entries.push({
        url: `${BASE}/products/${row.id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch (e) {
    console.error('[sitemap] could not query showcase_products:', e)
  }

  // 4) DB-driven showcase products with a slug (SEO-friendly URL) — covers
  // Partner Lines (Sundance/JC) and any other slug-addressable product.
  // General on purpose: whatever gets a slug in the DB is picked up here,
  // not hardcoded to today's four Partner Lines slugs.
  try {
    const { rows } = await pool.query(
      `SELECT slug FROM showcase_products WHERE status = 'active' AND slug IS NOT NULL AND slug != '' ORDER BY sort_order`
    )
    for (const row of rows) {
      entries.push({
        url: `${BASE}/products/${row.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch (e) {
    console.error('[sitemap] could not query showcase_products by slug:', e)
  }

  return entries
}
