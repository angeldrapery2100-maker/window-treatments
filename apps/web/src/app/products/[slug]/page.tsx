import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import UniversalDetailClient from './UniversalDetailClient'
import GenericProductClient from './GenericProductClient'
import ProductDetailClient from './ProductDetailClient'
import { loadLayout } from './layoutFactory'
import { getPageContent, getText } from '@/lib/content'
import { CDN_BASE } from '@/lib/cdn'
import { buildProductJsonLd, buildBreadcrumbJsonLd } from '@/lib/productJsonLd'
import pool from '@/lib/db'
import { COPYRIGHT } from '@/lib/site'
import PartnerFacts from '@/components/PartnerFacts'
import { getPartnerLine } from '@/lib/partnerLines'

// Renders one or more JSON-LD <script> blocks (server component).
function JsonLd({ blocks }: { blocks: any[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
      ))}
    </>
  )
}

// Turn a stored cover image (path or absolute URL) into an absolute URL.
function toAbsoluteImage(src?: string): string | undefined {
  if (!src) return undefined
  if (/^https?:\/\//.test(src)) return src
  return `${CDN_BASE}${src.startsWith('/') ? '' : '/'}${src}`
}

// ISR: regenerate at most every 5 min instead of per-request (was force-dynamic).
export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const canonical = `/products/${slug}`
  const product = await getProductBySlug(slug)
  if (product) {
    return {
      title: product.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      description: product.tagline || `Explore ${product.name} window treatments by Hunter Douglas at Angel Drapery.`,
      alternates: { canonical },
    }
  }
  // Non-numeric slug: try the DB catalog (covers Partner Lines + any other
  // slug-addressable showcase product).
  if (!/^\d+$/.test(slug)) {
    const dbProduct = await getDbProductBySlug(slug)
    if (dbProduct) {
      return {
        title: dbProduct.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        description: dbProduct.description || dbProduct.tagline || `Explore ${dbProduct.name} window treatments at Angel Drapery.`,
        alternates: { canonical },
      }
    }
  }
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  return {
    title: name,
    description: `Explore ${name} window treatments at Angel Drapery.`,
    alternates: { canonical },
  }
}

/* ─── Hunter Douglas: slug-based JSON lookup ─── */

// Data hygiene for fabric_swatches. The PDF extraction that produced these
// JSONs sometimes assigned one page's spec codes to EVERY color on that page,
// so several colors in a collection share identical spec lists (682 groups
// across 14 products). Specs are order SKUs — showing the wrong code is worse
// than showing none — so we blank out specs that aren't uniquely attributable.
// Also drops "Color 3"-style placeholder names left by the extractor.
// Applied once here so all detail-client variants render clean data.
function sanitizeSwatches(product: any) {
  const swatchMap = product?.fabric_swatches
  if (!swatchMap || typeof swatchMap !== 'object') return product
  for (const colors of Object.values(swatchMap) as any[]) {
    if (!Array.isArray(colors)) continue
    // Track which DISTINCT color names share each exact spec list. Two entries
    // with the SAME name sharing specs is legitimate (e.g. aria has two photos
    // per color); different names sharing specs means mis-attributed SKUs.
    const namesBySpec = new Map<string, Set<string>>()
    for (const c of colors) {
      const k = (c?.specs || []).join('|')
      if (!k) continue
      if (!namesBySpec.has(k)) namesBySpec.set(k, new Set())
      namesBySpec.get(k)!.add((c?.color_name || '').trim().toLowerCase())
    }
    for (const c of colors) {
      const k = (c?.specs || []).join('|')
      if (k && (namesBySpec.get(k)?.size || 0) > 1) c.specs = []
      if (typeof c?.color_name === 'string' && /^color \d+$/i.test(c.color_name.trim())) c.color_name = ''
    }
  }
  return product
}

async function getProductBySlug(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'hunter-douglas', 'products', `${slug}.json`)
    const raw = await fs.readFile(filePath, 'utf-8')
    return sanitizeSwatches(JSON.parse(raw))
  } catch (e) {
    return null
  }
}

async function getProductIndex() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'hunter-douglas', 'products-index.json')
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

/* ─── DB-based: numeric ID lookup (legacy showcase products) ─── */
async function getDbProduct(id: string) {
  try {
    const product = (await pool.query('SELECT * FROM showcase_products WHERE id = $1', [id])).rows[0]
    if (!product) return null
    const images = (await pool.query(
      'SELECT * FROM showcase_product_images WHERE product_id = $1 ORDER BY sort_order', [id]
    )).rows
    const sections = (await pool.query(
      'SELECT * FROM showcase_product_sections WHERE product_id = $1 ORDER BY sort_order', [id]
    )).rows
    return { ...product, features: product.features || [], images, sections }
  } catch (e) {
    return null
  }
}

async function getRelatedDbProducts(currentId: string) {
  try {
    const result = await pool.query(
      "SELECT id, name, cover_image, cover_fit FROM showcase_products WHERE status = 'active' AND id != $1 ORDER BY sort_order LIMIT 4",
      [currentId]
    )
    return result.rows
  } catch (e) { return [] }
}

// Non-numeric slug lookup (Partner Lines and any other slug-addressable
// showcase product). Same shape/error-handling as getDbProduct.
async function getDbProductBySlug(slug: string) {
  try {
    const product = (await pool.query(
      "SELECT * FROM showcase_products WHERE slug = $1 AND status = 'active'", [slug]
    )).rows[0]
    if (!product) return null
    const images = (await pool.query(
      'SELECT * FROM showcase_product_images WHERE product_id = $1 ORDER BY sort_order', [product.id]
    )).rows
    const sections = (await pool.query(
      'SELECT * FROM showcase_product_sections WHERE product_id = $1 ORDER BY sort_order', [product.id]
    )).rows
    return { ...product, features: product.features || [], images, sections }
  } catch (e) {
    return null
  }
}

/* ─── Shared footer helper ─── */
async function getFooter() {
  const globalData = await getPageContent('global')
  return {
    copyright: COPYRIGHT,
    youtube: getText(globalData, 'footer', 'youtube_url', '#'),
    etsy: getText(globalData, 'footer', 'etsy_url', '#'),
    tiktok: getText(globalData, 'footer', 'tiktok_url', '#'),
    instagram: getText(globalData, 'footer', 'instagram_url', 'https://instagram.com/angeldrapery?igshid=MjEwN2IyYWYwYw=='),
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const footer = await getFooter()

  /* 1) Try Hunter Douglas slug-based product */
  const product = await getProductBySlug(slug)
  if (product) {
    const productIndex = await getProductIndex()
    const related = productIndex.filter((p: any) => p.slug !== slug).slice(0, 4)
    const layout = loadLayout(slug, product)
    const jsonLd = [
      buildProductJsonLd({
        name: product.name,
        description: product.description,
        image: toAbsoluteImage(product.cover_image ? `/hunter-douglas/${slug}/${product.cover_image}` : undefined),
        slug,
        brand: 'Hunter Douglas',
      }),
      buildBreadcrumbJsonLd(product.name, slug),
    ]
    return (
      <>
        <JsonLd blocks={jsonLd} />
        {layout
          ? <UniversalDetailClient layout={layout} product={product} related={related} footer={footer} />
          : <GenericProductClient product={product} related={related} footer={footer} />}
      </>
    )
  }

  /* 2) Fallback: try DB-based numeric ID lookup */
  if (/^\d+$/.test(slug)) {
    const dbProduct = await getDbProduct(slug)
    if (dbProduct) {
      const related = await getRelatedDbProducts(slug)
      const jsonLd = [
        buildProductJsonLd({
          name: dbProduct.name,
          description: dbProduct.description || dbProduct.tagline,
          image: toAbsoluteImage(dbProduct.cover_image),
          slug,
          brand: 'Angel Drapery',
        }),
        buildBreadcrumbJsonLd(dbProduct.name, slug),
      ]
      return (
        <>
          <JsonLd blocks={jsonLd} />
          <ProductDetailClient product={dbProduct} related={related} footer={footer} />
        </>
      )
    }
  }

  /* 3) Non-numeric slug: DB catalog lookup by slug (Partner Lines, etc.) */
  if (!/^\d+$/.test(slug)) {
    const dbProduct = await getDbProductBySlug(slug)
    if (dbProduct) {
      const related = await getRelatedDbProducts(String(dbProduct.id))
      const partnerLine = getPartnerLine(slug)
      const jsonLd = [
        buildProductJsonLd({
          name: dbProduct.name,
          description: dbProduct.description || dbProduct.tagline,
          image: toAbsoluteImage(dbProduct.cover_image),
          slug,
          // Partner Lines carry their own manufacturer's brand in JSON-LD —
          // they are not an Angel Drapery-made product.
          brand: partnerLine ? partnerLine.brand : 'Angel Drapery',
        }),
        buildBreadcrumbJsonLd(dbProduct.name, slug),
      ]
      return (
        <>
          <JsonLd blocks={jsonLd} />
          <ProductDetailClient product={dbProduct} related={related} footer={footer} />
          {partnerLine && <PartnerFacts line={partnerLine} />}
        </>
      )
    }
  }

  notFound()
}
