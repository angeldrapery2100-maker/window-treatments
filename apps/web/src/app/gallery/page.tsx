import type { Metadata } from 'next'
import { getPageContent, getText, getImage } from '@/lib/content'
import GalleryClient, { type GalleryPhoto } from './GalleryClient'
import { DEFAULT_VIDEOS, type ProjectVideo } from '@/lib/gallery-videos-data'
import pool from '@/lib/db'
import { COPYRIGHT } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'Four decades of handcrafted window treatments across Los Angeles. Browse real projects — custom drapery, roman shades, motorized blinds — designed, sewn and installed by our own team since 1984.',
  alternates: { canonical: '/gallery' },
}

// ISR: regenerate at most every 5 min instead of per-request (was force-dynamic).
export const revalidate = 300

async function getVideoData(): Promise<{ meta: Record<number, any>; customVideos: ProjectVideo[] }> {
  try {
    // Ensure tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_video_meta (
        id          SERIAL PRIMARY KEY,
        video_id    INTEGER NOT NULL UNIQUE,
        title       TEXT,
        location    TEXT,
        tag         TEXT,
        description TEXT,
        is_published BOOLEAN DEFAULT true,
        updated_at  TIMESTAMPTZ DEFAULT now()
      )
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_custom_videos (
        id          SERIAL PRIMARY KEY,
        title       TEXT NOT NULL DEFAULT '',
        location    TEXT NOT NULL DEFAULT '',
        tag         TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        orientation TEXT NOT NULL DEFAULT 'landscape',
        video_url   TEXT NOT NULL,
        poster_url  TEXT NOT NULL,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        created_at  TIMESTAMPTZ DEFAULT now(),
        updated_at  TIMESTAMPTZ DEFAULT now()
      )
    `)

    const [metaResult, customResult] = await Promise.all([
      pool.query('SELECT * FROM gallery_video_meta ORDER BY video_id'),
      pool.query('SELECT * FROM gallery_custom_videos WHERE is_published = true ORDER BY sort_order, id'),
    ])

    const meta: Record<number, any> = {}
    for (const row of metaResult.rows) meta[row.video_id] = row

    const customVideos: ProjectVideo[] = customResult.rows.map((c: any, i: number) => ({
      id:          9000 + i,  // High IDs to avoid conflicts with defaults
      title:       c.title || '',
      location:    c.location || '',
      tag:         c.tag || '',
      description: c.description || '',
      orientation: (c.orientation || 'landscape') as 'landscape' | 'portrait',
      video:       c.video_url,
      poster:      c.poster_url,
    }))

    return { meta, customVideos }
  } catch {
    return { meta: {}, customVideos: [] }
  }
}

/** 'handcrafted-roman-shade' → 'Roman Shade' — filter-chip label from product_type. */
function categoryLabel(productType: string): string {
  return productType
    .replace(/^handcrafted-/, '')
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Photo wall source 1: installation_images (all product types, published only). */
async function getInstallationPhotos(): Promise<GalleryPhoto[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, product_type, image_url, caption
         FROM installation_images
        WHERE is_published = true
        ORDER BY product_type, sort_order, id`
    )
    return rows
      .filter((r: any) => r.image_url)
      .map((r: any) => ({
        id:       `inst-${r.id}`,
        src:      r.image_url,
        caption:  r.caption || '',
        category: categoryLabel(r.product_type || 'projects'),
      }))
  } catch {
    // Table may not exist yet — the photo wall simply hides
    return []
  }
}

/** Photo wall source 2: homepage site-content gallery images (page 'home', section 'gallery'). */
function getHomeGalleryPhotos(homeData: Record<string, Record<string, any>>): GalleryPhoto[] {
  const photos: GalleryPhoto[] = []
  for (let i = 1; i <= 12; i++) {
    const img = getImage(homeData, 'gallery', `project_${i}`)
    if (!img || !img.url) continue
    photos.push({
      id:       `home-${i}`,
      src:      img.url,
      caption:  img.alt || '',
      category: 'Projects',
      width:    img.width || undefined,
      height:   img.height || undefined,
    })
  }
  return photos
}

export default async function GalleryPage() {
  const [globalData, homeData, videoData, installationPhotos] = await Promise.all([
    getPageContent('global'),
    getPageContent('home'),
    getVideoData(),
    getInstallationPhotos(),
  ])

  const { meta: videoMeta, customVideos } = videoData

  // Merge DB overrides on top of hardcoded defaults, filter out unpublished
  const defaultVideos = DEFAULT_VIDEOS
    .filter(v => {
      const override = videoMeta[v.id]
      // If override exists and is_published is explicitly false, hide it
      return !override || override.is_published !== false
    })
    .map(v => {
      const override = videoMeta[v.id]
      if (!override) return v
      return {
        ...v,
        title:       override.title       ?? v.title,
        location:    override.location    ?? v.location,
        tag:         override.tag         ?? v.tag,
        description: override.description ?? v.description,
      }
    })

  // Combine: defaults + custom videos
  const videos = [...defaultVideos, ...customVideos]

  // Photo wall: installation images + home gallery images, deduped by URL
  const homePhotos = getHomeGalleryPhotos(homeData)
  const seen = new Set<string>()
  const photos = [...installationPhotos, ...homePhotos].filter(p => {
    if (seen.has(p.src)) return false
    seen.add(p.src)
    return true
  })

  const footer = {
    copyright: COPYRIGHT,
    youtube:   getText(globalData, 'footer', 'youtube_url',  '#'),
    etsy:      getText(globalData, 'footer', 'etsy_url',     '#'),
    tiktok:    getText(globalData, 'footer', 'tiktok_url',   '#'),
    instagram: getText(globalData, 'footer', 'instagram_url', 'https://instagram.com/angeldrapery?igshid=MjEwN2IyYWYwYw=='),
  }

  return <GalleryClient footer={footer} videos={videos} photos={photos} />
}
