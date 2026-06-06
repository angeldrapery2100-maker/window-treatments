import type { Metadata } from 'next'
import { getPageContent, getText } from '@/lib/content'
import GalleryClient from './GalleryClient'
import { DEFAULT_VIDEOS, type ProjectVideo } from '@/lib/gallery-videos-data'
import pool from '@/lib/db'

export const metadata: Metadata = {
  title: 'Our Projects',
  description: 'Explore our portfolio of stunning custom window treatment projects across Los Angeles. Drapery, roman shades, blinds, and more.',
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

export default async function GalleryPage() {
  const [data, globalData, videoData] = await Promise.all([
    getPageContent('gallery'),
    getPageContent('global'),
    getVideoData(),
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

  const footer = {
    copyright: getText(globalData, 'footer', 'copyright', '©2025 by Angel Drapery'),
    youtube:   getText(globalData, 'footer', 'youtube_url',  '#'),
    etsy:      getText(globalData, 'footer', 'etsy_url',     '#'),
    tiktok:    getText(globalData, 'footer', 'tiktok_url',   '#'),
    instagram: getText(globalData, 'footer', 'instagram_url', 'https://instagram.com/angeldrapery?igshid=MjEwN2IyYWYwYw=='),
  }

  return <GalleryClient footer={footer} videos={videos} />
}
