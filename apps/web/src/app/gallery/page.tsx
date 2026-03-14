import type { Metadata } from 'next'
import { getPageContent, getText } from '@/lib/content'
import GalleryClient from './GalleryClient'
import { DEFAULT_VIDEOS } from '@/lib/gallery-videos-data'
import pool from '@/lib/db'

export const metadata: Metadata = {
  title: 'Our Projects',
  description: 'Explore our portfolio of stunning custom window treatment projects across Los Angeles. Drapery, roman shades, blinds, and more.',
}

export const dynamic = 'force-dynamic'

async function getVideoMeta(): Promise<Record<number, { title?: string; location?: string; tag?: string; description?: string }>> {
  try {
    // Direct DB query — works reliably in both dev and Vercel production
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
    const { rows } = await pool.query('SELECT * FROM gallery_video_meta ORDER BY video_id')
    const map: Record<number, typeof rows[0]> = {}
    for (const row of rows) map[row.video_id] = row
    return map
  } catch {
    return {}
  }
}

export default async function GalleryPage() {
  const [data, globalData, videoMeta] = await Promise.all([
    getPageContent('gallery'),
    getPageContent('global'),
    getVideoMeta(),
  ])

  // Merge DB overrides on top of hardcoded defaults
  const videos = DEFAULT_VIDEOS.map(v => {
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

  const footer = {
    copyright: getText(globalData, 'footer', 'copyright', '©2025 by Angel Drapery'),
    youtube:   getText(globalData, 'footer', 'youtube_url',  '#'),
    etsy:      getText(globalData, 'footer', 'etsy_url',     '#'),
    tiktok:    getText(globalData, 'footer', 'tiktok_url',   '#'),
    linkedin:  getText(globalData, 'footer', 'linkedin_url', '#'),
    instagram: getText(globalData, 'footer', 'instagram_url', 'https://instagram.com/angeldrapery?igshid=MjEwN2IyYWYwYw=='),
  }

  return <GalleryClient footer={footer} videos={videos} />
}
