import { cache } from 'react'
import type { Metadata } from 'next'
import { queryOne, query } from '@/lib/db'
import StoreProductClient from './StoreProductClient'

// Server wrapper for the store product page. Adds per-product metadata and
// Product JSON-LD (price + AggregateRating/Review from approved reviews) so
// Google can show rich results; all interactive UI stays in StoreProductClient.

export const revalidate = 300

const SITE = 'https://angel-drapery.com'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function absUrl(u?: string | null): string | undefined {
  if (!u) return undefined
  if (/^https?:\/\//i.test(u)) return u
  return `${SITE}${u.startsWith('/') ? '' : '/'}${u}`
}

const getProduct = cache(async (id: string) => {
  if (!UUID_RE.test(id)) return null
  try {
    const row = await queryOne<any>(
      `SELECT p.id, p.name, pt.slug AS type, p.base_price, p.default_config
       FROM products p
       JOIN product_types pt ON pt.id = p.product_type_id
       WHERE p.id = $1 AND p.is_active = true`,
      [id]
    )
    return row || null
  } catch {
    return null
  }
})

const getReviewData = cache(async (id: string) => {
  if (!UUID_RE.test(id)) return null
  try {
    const agg = await queryOne<{ avg: string; n: string }>(
      `SELECT COALESCE(AVG(rating),0) AS avg, COUNT(*) AS n
       FROM product_reviews WHERE product_id = $1 AND status = 'approved'`,
      [id]
    )
    const count = Number(agg?.n || 0)
    if (!count) return null
    const reviews = await query<any>(
      `SELECT customer_name, rating, title, body, created_at
       FROM product_reviews
       WHERE product_id = $1 AND status = 'approved'
       ORDER BY created_at DESC LIMIT 5`,
      [id]
    )
    return {
      average: Math.round(Number(agg?.avg || 0) * 10) / 10,
      count,
      reviews: reviews || [],
    }
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Online Store' }

  const cfg = product.default_config || {}
  const description = String(cfg.description || '')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
    || `Custom ${product.name} — configure size, fabric and options. Handcrafted by Angel Drapery since 1984.`
  const image = absUrl(cfg.images?.main?.[0])

  return {
    title: product.name,
    description,
    alternates: { canonical: `${SITE}/store/${product.id}` },
    openGraph: {
      title: `${product.name} — Angel Drapery`,
      description,
      url: `${SITE}/store/${product.id}`,
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
  }
}

export default async function StoreProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  const reviewData = product ? await getReviewData(id) : null

  let jsonLd: Record<string, any> | null = null
  if (product) {
    const cfg = product.default_config || {}
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      url: `${SITE}/store/${product.id}`,
      brand: { '@type': 'Brand', name: 'Angel Drapery' },
    }
    const desc = String(cfg.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    if (desc) jsonLd.description = desc.slice(0, 500)
    const image = absUrl(cfg.images?.main?.[0])
    if (image) jsonLd.image = image
    const price = Number(product.base_price)
    if (Number.isFinite(price) && price > 0) {
      jsonLd.offers = {
        '@type': 'Offer',
        price: price.toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${SITE}/store/${product.id}`,
      }
    }
    if (reviewData) {
      jsonLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: reviewData.average,
        reviewCount: reviewData.count,
        bestRating: 5,
        worstRating: 1,
      }
      jsonLd.review = reviewData.reviews.map((r: any) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.customer_name || 'Verified buyer' },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        ...(r.title ? { name: String(r.title).slice(0, 160) } : {}),
        ...(r.body ? { reviewBody: String(r.body).slice(0, 1000) } : {}),
        ...(r.created_at ? { datePublished: new Date(r.created_at).toISOString().slice(0, 10) } : {}),
      }))
    }
  }

  return (
    <>
      {/* "<" is escaped so customer review text can never break out of the script tag */}
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      )}
      <StoreProductClient id={id} initialType={product?.type ?? null} />
    </>
  )
}
