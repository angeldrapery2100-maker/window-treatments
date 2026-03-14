import type { Metadata } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import HunterDouglasClient from './HunterDouglasClient'
import { getPageContent, getText, getImage } from '@/lib/content'
import pool from '@/lib/db'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our complete collection of premium window treatments — Hunter Douglas blinds, shades, shutters, handcrafted drapery, and custom roman shades.',
}

export const dynamic = 'force-dynamic'

// ── Fallback: read HD products from JSON (used if DB catalog is empty) ────────
async function getHunterDouglasProductsFromJson() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'hunter-douglas', 'products-index.json')
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load Hunter Douglas data:', e)
    return []
  }
}

// ── Primary: read all catalog products from showcase_products ─────────────────
// After running seed-product-catalog.mjs, this will contain all 27 products.
// Falls back to JSON if table is empty or missing.
async function getCatalogProducts() {
  try {
    // Ensure new columns exist before querying them (safe: IF NOT EXISTS)
    await pool.query(`
      ALTER TABLE showcase_products
        ADD COLUMN IF NOT EXISTS source   VARCHAR(32) DEFAULT 'cms',
        ADD COLUMN IF NOT EXISTS href     TEXT        DEFAULT '',
        ADD COLUMN IF NOT EXISTS category VARCHAR(64) DEFAULT ''
    `).catch(() => { /* columns already exist */ })

    const result = await pool.query(`
      SELECT id, name, slug, description, cover_image, cover_fit,
             status, sort_order, source, href, category
      FROM showcase_products
      WHERE status = 'active'
      ORDER BY sort_order, id
    `)
    return result.rows
  } catch (e) {
    console.warn('showcase_products query failed, will use JSON fallback:', (e as any).message)
    return []
  }
}

export default async function ProductsPage() {
  const pageData = await getPageContent('products')
  const globalData = await getPageContent('global')

  const hero = {
    title: getText(pageData, 'hero', 'title', 'Our Products'),
    subtitle: getText(pageData, 'hero', 'subtitle', 'Premium Window Treatments'),
    bgImage: getImage(pageData, 'hero', 'bg_image'),
  }

  const footer = {
    copyright: getText(globalData, 'footer', 'copyright', '©2025 by Angel Drapery'),
    youtube:   getText(globalData, 'footer', 'youtube_url', '#'),
    etsy:      getText(globalData, 'footer', 'etsy_url', '#'),
    tiktok:    getText(globalData, 'footer', 'tiktok_url', '#'),
    instagram: getText(globalData, 'footer', 'instagram_url', 'https://instagram.com/angeldrapery?igshid=MjEwN2IyYWYwYw=='),
  }

  const dbCatalog = await getCatalogProducts()

  // ── DB catalog is seeded: use it as the primary product list ────────────────
  if (dbCatalog.length > 0) {
    // Map DB rows to the format HunterDouglasClient expects for its `products` prop.
    // We convert each row so the client can do slug-based filtering and linking.
    const catalogProducts = dbCatalog.map((p: any) => ({
      id:          p.id.toString(),
      name:        p.name,
      slug:        p.slug || '',
      description: p.description || '',
      cover_image: p.cover_image || null,
      // href overrides the default /products/{slug} if set in DB
      href:        (p.href && p.href !== '') ? p.href : `/products/${p.slug}`,
      category:    p.category || '',
      source:      p.source || 'cms',
    }))
    return (
      <HunterDouglasClient
        products={catalogProducts}
        showcaseProducts={[]}   // unified: all products are in products prop now
        useDbCatalog={true}     // tells the client to use href instead of /products/{slug}
        hero={hero}
        footer={footer}
      />
    )
  }

  // ── Fallback: DB not seeded yet, use JSON (original behaviour) ───────────────
  const hdProducts = await getHunterDouglasProductsFromJson()
  return (
    <HunterDouglasClient
      products={hdProducts}
      showcaseProducts={[]}
      useDbCatalog={false}
      hero={hero}
      footer={footer}
    />
  )
}
