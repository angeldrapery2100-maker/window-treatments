import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import UniversalDetailClient from './UniversalDetailClient'
import GenericProductClient from './GenericProductClient'
import ProductDetailClient from './ProductDetailClient'
import { loadLayout } from './layoutFactory'
import { getPageContent, getText } from '@/lib/content'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (product) {
    return {
      title: product.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      description: product.tagline || `Explore ${product.name} window treatments by Hunter Douglas at Angel Drapery.`,
    }
  }
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  return { title: name, description: `Explore ${name} window treatments at Angel Drapery.` }
}

/* ─── Hunter Douglas: slug-based JSON lookup ─── */
async function getProductBySlug(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'hunter-douglas', 'products', `${slug}.json`)
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw)
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

/* ─── Shared footer helper ─── */
async function getFooter() {
  const globalData = await getPageContent('global')
  return {
    copyright: getText(globalData, 'footer', 'copyright', '©2025 by Angel Drapery'),
    youtube: getText(globalData, 'footer', 'youtube_url', '#'),
    etsy: getText(globalData, 'footer', 'etsy_url', '#'),
    tiktok: getText(globalData, 'footer', 'tiktok_url', '#'),
    linkedin: getText(globalData, 'footer', 'linkedin_url', '#'),
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
    if (layout) {
      return <UniversalDetailClient layout={layout} product={product} related={related} footer={footer} />
    }
    return <GenericProductClient product={product} related={related} footer={footer} />
  }

  /* 2) Fallback: try DB-based numeric ID lookup */
  if (/^\d+$/.test(slug)) {
    const dbProduct = await getDbProduct(slug)
    if (dbProduct) {
      const related = await getRelatedDbProducts(slug)
      return <ProductDetailClient product={dbProduct} related={related} footer={footer} />
    }
  }

  notFound()
}
