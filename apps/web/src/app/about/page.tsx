import { CDN_BASE } from '@/lib/cdn'
import type { Metadata } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { getPageContent, getText, getImage } from '@/lib/content'
import AboutClient from './AboutClient'
import { COPYRIGHT } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Us',
  description: '40 years of excellence in custom window treatments. Angel Drapery has been serving the greater Los Angeles area since 1984 with premium drapery, blinds, and shades.',
  alternates: { canonical: '/about', languages: { en: '/about', 'zh-Hant': '/zh/about' } },
}

// ISR: regenerate at most every 5 min instead of per-request (was force-dynamic).
export const revalidate = 300

async function getFeaturedProducts() {
  const all: { name: string; image: string | null; href: string; desc: string }[] = []

  // 1. Hunter Douglas products from JSON
  try {
    const filePath = path.join(process.cwd(), 'public', 'hunter-douglas', 'products-index.json')
    const raw = await fs.readFile(filePath, 'utf-8')
    const hdProducts: { id: string; name: string; slug: string; description: string; cover_image: string }[] = JSON.parse(raw)
    for (const p of hdProducts) {
      all.push({
        name: p.name,
        desc: p.description,
        image: p.cover_image ? `${CDN_BASE}/hunter-douglas/${p.slug}/${p.cover_image}` : null,
        href: `/products/${p.slug}`,
      })
    }
  } catch (e) {
    console.warn('HD products load failed:', e)
  }

  // Only show products from the Products page (Hunter Douglas).
  // Online Store items are intentionally excluded.

  // Shuffle and pick 10
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, 10)
}

export default async function AboutPage() {
  const [data, globalData, featuredProducts] = await Promise.all([
    getPageContent('about'),
    getPageContent('global'),
    getFeaturedProducts(),
  ])

  const hero = {
    title: getText(data, 'hero', 'title', 'About Us'),
    subtitle: getText(data, 'hero', 'subtitle', '40 Years of Excellence in Custom Window Treatments'),
    bgImage: getImage(data, 'hero', 'bg_image'),
  }

  // "老店传承 + 新人焕新" narrative — heritage workroom, renewed in 2022.
  const story = {
    title: getText(data, 'story', 'title', 'Our Story'),
    paragraphs: [
      getText(data, 'story', 'paragraph_1', 'Angel Drapery opened its doors in 1984 in the San Gabriel Valley. For four decades, our workroom has hand-sewn custom drapery for thousands of homes across greater Los Angeles — through every style era, one window at a time.'),
      getText(data, 'story', 'paragraph_2', 'In 2022, the business passed to a new generation with a simple promise: keep everything that made Angel Drapery trusted for forty years — the in-house workroom, the meticulous craftsmanship, the personal service — and bring it into the modern home. Since then, we\'ve opened a new showroom, built a smart-shade ecosystem that works with Apple HomeKit, Google Home, and Matter, and made the design-to-installation process faster and more transparent.'),
      getText(data, 'story', 'paragraph_3', 'Some things haven\'t changed: we still measure every window ourselves, sew in our own workroom, and stand behind every installation.'),
    ],
    image: getImage(data, 'story', 'image'),
    // Second image slot: new owner / team photo (CMS key story.image_2).
    image2: getImage(data, 'story', 'image_2'),
  }

  const values = {
    title: getText(data, 'values', 'title', 'Our Values'),
    // icon: legacy CMS field may hold an emoji — AboutClient ignores emoji
    // values and renders a line icon instead (no emoji on brand pages).
    items: [1, 2, 3, 4].map(i => ({
      icon: getText(data, 'values', `item_${i}_icon`, ''),
      title: getText(data, 'values', `item_${i}_title`, ['Quality Craftsmanship', 'Customer First', 'Serving LA Since 1984', 'Premium Materials'][i - 1]),
      desc: getText(data, 'values', `item_${i}_desc`, ''),
    })),
  }

  const serviceDefaults = [
    {
      title: 'Design Consultation',
      desc: 'We work closely with you to understand your style, needs, and budget — then craft a custom window treatment plan that elevates every room.',
      image: { url: '/uploads/site/home/1772836079902-izuxmm0jp8.png', alt: 'Design Consultation', width: 1200, height: 800, fit: 'cover' },
    },
    {
      title: 'In-Home Measurement',
      desc: 'Our experts visit your home to take precise measurements and assess your windows, ensuring every treatment fits perfectly from day one.',
      image: { url: '/uploads/site/home/1772836172408-hj08c8evgqw.png', alt: 'In-Home Measurement', width: 1200, height: 800, fit: 'cover' },
    },
    {
      title: 'Professional Installation',
      desc: 'From hardware to hemline, our trained installers handle every detail with care — leaving you with flawless results and zero hassle.',
      image: { url: '/uploads/site/home/1772836244007-1v30yxhk699.png', alt: 'Professional Installation', width: 1200, height: 800, fit: 'cover' },
    },
  ]

  const services = {
    title: getText(data, 'services', 'title', 'Our Services'),
    items: [1, 2, 3].map(i => {
      const def = serviceDefaults[i - 1]
      const cmsImg = getImage(data, 'services', `item_${i}_image`)
      return {
        title: getText(data, 'services', `item_${i}_title`, def.title),
        desc: getText(data, 'services', `item_${i}_desc`, def.desc),
        image: cmsImg?.url ? cmsImg : def.image,
      }
    }),
  }

  const brands = {
    title: getText(data, 'brands', 'title', 'Our Brand Partners'),
    items: [1, 2, 3, 4].map(i => ({
      name: getText(data, 'brands', `brand_${i}_name`, ['Hunter Douglas', 'Somfy', 'Lutron', 'R-TEC'][i - 1]),
      logo: getImage(data, 'brands', `brand_${i}_logo`),
    })),
  }

  const footer = {
    copyright: COPYRIGHT,
    youtube: getText(globalData, 'footer', 'youtube_url', '#'),
    etsy: getText(globalData, 'footer', 'etsy_url', '#'),
    tiktok: getText(globalData, 'footer', 'tiktok_url', '#'),
    instagram: getText(globalData, 'footer', 'instagram_url', 'https://instagram.com/angeldrapery?igshid=MjEwN2IyYWYwYw=='),
  }

  return (
    <AboutClient
      hero={hero}
      story={story}
      values={values}
      services={services}
      brands={brands}
      footer={footer}
      featuredProducts={featuredProducts}
    />
  )
}
