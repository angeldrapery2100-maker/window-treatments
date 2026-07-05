import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

// Default content blocks for all pages
const SEED_DATA = [
  // ======================== HOME PAGE ========================
  // Hero
  { page: 'home', section: 'hero', field_key: 'video', field_type: 'video', content: '', image_url: '/videos/hero-background.mp4', sort_order: 0 },
  // Static first frame of the hero video — shown instantly while the mp4 loads (LCP fix).
  { page: 'home', section: 'hero', field_key: 'poster', field_type: 'image', content: 'Hero video poster (first frame)', image_url: '', sort_order: 0 },
  { page: 'home', section: 'hero', field_key: 'title_cn', field_type: 'text', content: '天使窗簾', sort_order: 1 },
  { page: 'home', section: 'hero', field_key: 'subtitle', field_type: 'text', content: '专业窗簾設計、訂造、安裝', sort_order: 2 },
  { page: 'home', section: 'hero', field_key: 'tagline', field_type: 'text', content: 'Since 1984 • 40 Years Experience', sort_order: 3 },

  // Luma Collection Showcase - 3 product cards
  { page: 'home', section: 'luma', field_key: 'card_1_name', field_type: 'text', content: 'Zebra Shade', sort_order: 0 },
  { page: 'home', section: 'luma', field_key: 'card_1_tag', field_type: 'text', content: 'Dual-Layer Light Control', sort_order: 1 },
  { page: 'home', section: 'luma', field_key: 'card_1_desc', field_type: 'richtext', content: 'Alternate sheer and solid bands glide effortlessly to dial in exactly the right light and privacy.', sort_order: 2 },
  { page: 'home', section: 'luma', field_key: 'card_1_image', field_type: 'image', content: 'Zebra Shade Lifestyle', image_url: '/luma-collection/lifestyle-dark-livingroom.png', sort_order: 3, image_width: 800, image_height: 1120, image_fit: 'cover' },
  { page: 'home', section: 'luma', field_key: 'card_2_name', field_type: 'text', content: 'Roller Shade', sort_order: 4 },
  { page: 'home', section: 'luma', field_key: 'card_2_tag', field_type: 'text', content: 'Clean · Minimal · Versatile', sort_order: 5 },
  { page: 'home', section: 'luma', field_key: 'card_2_desc', field_type: 'richtext', content: 'A single smooth fabric panel that rolls away completely, keeping your view unobstructed and your lines razor-clean.', sort_order: 6 },
  { page: 'home', section: 'luma', field_key: 'card_2_image', field_type: 'image', content: 'Roller Shade Lifestyle', image_url: '/roller-collection/lifestyle-minimalist.png', sort_order: 7, image_width: 800, image_height: 1120, image_fit: 'cover' },
  { page: 'home', section: 'luma', field_key: 'card_3_name', field_type: 'text', content: 'Sheer Shade', sort_order: 8 },
  { page: 'home', section: 'luma', field_key: 'card_3_tag', field_type: 'text', content: 'Soft Light · Warm Ambiance', sort_order: 9 },
  { page: 'home', section: 'luma', field_key: 'card_3_desc', field_type: 'richtext', content: 'Gossamer fabric diffuses sunlight into a gentle luminous glow — the effortless way to brighten any room without glare.', sort_order: 10 },
  { page: 'home', section: 'luma', field_key: 'card_3_image', field_type: 'image', content: 'Sheer Shade Lifestyle', image_url: '/sheer-collection/lifestyle-sheer-sunlit.png', sort_order: 11, image_width: 800, image_height: 1120, image_fit: 'cover' },

  // Gallery - 12 project images
  ...Array.from({ length: 12 }, (_, i) => ({
    page: 'home', section: 'gallery', field_key: `project_${i + 1}`, field_type: 'image',
    content: `Project ${i + 1}`, image_url: '', sort_order: i,
    image_width: 400, image_height: 533, image_fit: 'cover',
  })),

  // About
  { page: 'home', section: 'about', field_key: 'title', field_type: 'text', content: 'We Make Handcrafted Drapery', sort_order: 0 },
  { page: 'home', section: 'about', field_key: 'highlight', field_type: 'text', content: '40 years experience', sort_order: 1 },
  { page: 'home', section: 'about', field_key: 'subtitle', field_type: 'text', content: 'focus on handcrafted drapery', sort_order: 2 },
  { page: 'home', section: 'about', field_key: 'description', field_type: 'richtext', content: 'Designing, measuring, and installing custom window treatments has never been easier with our team of experienced professionals.', sort_order: 3 },
  { page: 'home', section: 'about', field_key: 'image', field_type: 'image', content: 'Workshop Image', image_url: '', sort_order: 4, image_width: 600, image_height: 750, image_fit: 'cover' },

  // Process - 3 steps
  { page: 'home', section: 'process', field_key: 'title', field_type: 'text', content: 'THE PROCESS', sort_order: 0 },
  { page: 'home', section: 'process', field_key: 'subtitle', field_type: 'text', content: 'Designing, measuring, and installing custom window treatments has never been easier with our team of experienced professionals.', sort_order: 1 },
  { page: 'home', section: 'process', field_key: 'step_1_title', field_type: 'text', content: 'DESIGN CONSULTATION', sort_order: 2 },
  { page: 'home', section: 'process', field_key: 'step_1_desc', field_type: 'richtext', content: 'Our design consultants work directly with you to select the perfect curtains, custom window coverings, that will suit your style and functional needs.', sort_order: 3 },
  { page: 'home', section: 'process', field_key: 'step_1_image', field_type: 'image', content: 'Design Consultation', image_url: '', sort_order: 4, image_width: 480, image_height: 270, image_fit: 'cover' },
  { page: 'home', section: 'process', field_key: 'step_2_title', field_type: 'text', content: 'IN-HOME MEASUREMENT', sort_order: 5 },
  { page: 'home', section: 'process', field_key: 'step_2_desc', field_type: 'richtext', content: 'After you have chosen the perfect window treatments for your home, we will schedule an in-home measurement appointment to ensure your drapes fit perfectly.', sort_order: 6 },
  { page: 'home', section: 'process', field_key: 'step_2_image', field_type: 'image', content: 'In-Home Measurement', image_url: '', sort_order: 7, image_width: 480, image_height: 270, image_fit: 'cover' },
  { page: 'home', section: 'process', field_key: 'step_3_title', field_type: 'text', content: 'PROFESSIONAL INSTALLATION', sort_order: 8 },
  { page: 'home', section: 'process', field_key: 'step_3_desc', field_type: 'richtext', content: 'Once you have placed your order, simply schedule a time that works for you, and our experts will come to your home or office and meticulously install your new shades.', sort_order: 9 },
  { page: 'home', section: 'process', field_key: 'step_3_image', field_type: 'image', content: 'Professional Installation', image_url: '', sort_order: 10, image_width: 480, image_height: 270, image_fit: 'cover' },

  // Contact
  { page: 'home', section: 'contact', field_key: 'title', field_type: 'text', content: 'Contact', sort_order: 0 },
  { page: 'home', section: 'contact', field_key: 'subtitle', field_type: 'text', content: 'Thank you for visiting our website. For more information and special requests, please contact us today.', sort_order: 1 },
  { page: 'home', section: 'contact', field_key: 'address', field_type: 'text', content: '8831 E Las Tunas Dr, Temple City, CA, 91780', sort_order: 2 },
  { page: 'home', section: 'contact', field_key: 'email', field_type: 'text', content: 'admin@angel-drapery.com', sort_order: 3 },
  { page: 'home', section: 'contact', field_key: 'phone_1', field_type: 'text', content: '626-451-9841', sort_order: 4 },
  { page: 'home', section: 'contact', field_key: 'phone_2', field_type: 'text', content: '626-451-9840', sort_order: 5 },
  { page: 'home', section: 'contact', field_key: 'phone_3', field_type: 'text', content: '626-703-2929', sort_order: 6 },
  { page: 'home', section: 'contact', field_key: 'qr_line', field_type: 'image', content: 'LINE QR Code', image_url: '', sort_order: 7, image_width: 128, image_height: 128, image_fit: 'contain' },
  { page: 'home', section: 'contact', field_key: 'qr_wechat', field_type: 'image', content: 'WeChat QR Code', image_url: '', sort_order: 8, image_width: 128, image_height: 128, image_fit: 'contain' },

  // ======================== ABOUT PAGE ========================
  { page: 'about', section: 'hero', field_key: 'title', field_type: 'text', content: 'About Us', sort_order: 0 },
  { page: 'about', section: 'hero', field_key: 'subtitle', field_type: 'text', content: '40 Years of Excellence in Custom Window Treatments', sort_order: 1 },
  { page: 'about', section: 'hero', field_key: 'bg_image', field_type: 'image', content: 'About Hero Background', image_url: '', sort_order: 2, image_width: 1920, image_height: 800, image_fit: 'cover' },

  { page: 'about', section: 'story', field_key: 'title', field_type: 'text', content: 'Our Story', sort_order: 0 },
  { page: 'about', section: 'story', field_key: 'paragraph_1', field_type: 'richtext', content: 'Founded in 1984, Angel Drapery has been serving the greater Los Angeles area for over 40 years. What started as a small family business has grown into one of the most trusted names in custom window treatments.', sort_order: 1 },
  { page: 'about', section: 'story', field_key: 'paragraph_2', field_type: 'richtext', content: 'Our commitment to quality craftsmanship and exceptional customer service has remained unchanged throughout the years. Every piece we create is handcrafted with meticulous attention to detail.', sort_order: 2 },
  { page: 'about', section: 'story', field_key: 'paragraph_3', field_type: 'richtext', content: 'Today, we continue to combine traditional techniques with modern technology, working with the finest brands in the industry to deliver stunning results for our clients.', sort_order: 3 },
  { page: 'about', section: 'story', field_key: 'image', field_type: 'image', content: 'Company History Image', image_url: '', sort_order: 4, image_width: 600, image_height: 800, image_fit: 'cover' },

  // Values - 4 items
  { page: 'about', section: 'values', field_key: 'title', field_type: 'text', content: 'Our Values', sort_order: 0 },
  { page: 'about', section: 'values', field_key: 'item_1_icon', field_type: 'text', content: '🎨', sort_order: 1 },
  { page: 'about', section: 'values', field_key: 'item_1_title', field_type: 'text', content: 'Quality Craftsmanship', sort_order: 2 },
  { page: 'about', section: 'values', field_key: 'item_1_desc', field_type: 'richtext', content: 'Every piece is handcrafted with meticulous attention to detail, ensuring the highest quality standards.', sort_order: 3 },
  { page: 'about', section: 'values', field_key: 'item_2_icon', field_type: 'text', content: '👥', sort_order: 4 },
  { page: 'about', section: 'values', field_key: 'item_2_title', field_type: 'text', content: 'Customer First', sort_order: 5 },
  { page: 'about', section: 'values', field_key: 'item_2_desc', field_type: 'richtext', content: 'Your satisfaction is our priority. We work closely with you from consultation to installation.', sort_order: 6 },
  { page: 'about', section: 'values', field_key: 'item_3_icon', field_type: 'text', content: '⭐', sort_order: 7 },
  { page: 'about', section: 'values', field_key: 'item_3_title', field_type: 'text', content: 'Expert Team', sort_order: 8 },
  { page: 'about', section: 'values', field_key: 'item_3_desc', field_type: 'richtext', content: '40 years of combined experience in custom window treatments and interior design.', sort_order: 9 },
  { page: 'about', section: 'values', field_key: 'item_4_icon', field_type: 'text', content: '💎', sort_order: 10 },
  { page: 'about', section: 'values', field_key: 'item_4_title', field_type: 'text', content: 'Premium Materials', sort_order: 11 },
  { page: 'about', section: 'values', field_key: 'item_4_desc', field_type: 'richtext', content: 'We use only the finest fabrics and hardware from trusted brands like Hunter Douglas and Somfy.', sort_order: 12 },

  // Services - 3 items
  { page: 'about', section: 'services', field_key: 'title', field_type: 'text', content: 'Our Services', sort_order: 0 },
  { page: 'about', section: 'services', field_key: 'item_1_title', field_type: 'text', content: 'Design Consultation', sort_order: 1 },
  { page: 'about', section: 'services', field_key: 'item_1_desc', field_type: 'richtext', content: 'Expert advice on fabrics, styles, and perfect solutions for your space', sort_order: 2 },
  { page: 'about', section: 'services', field_key: 'item_1_image', field_type: 'image', content: 'Design', image_url: '', sort_order: 3, image_width: 400, image_height: 400, image_fit: 'cover' },
  { page: 'about', section: 'services', field_key: 'item_2_title', field_type: 'text', content: 'In-Home Measurement', sort_order: 4 },
  { page: 'about', section: 'services', field_key: 'item_2_desc', field_type: 'richtext', content: 'Precise measurements to ensure perfect fit and function', sort_order: 5 },
  { page: 'about', section: 'services', field_key: 'item_2_image', field_type: 'image', content: 'Measurement', image_url: '', sort_order: 6, image_width: 400, image_height: 400, image_fit: 'cover' },
  { page: 'about', section: 'services', field_key: 'item_3_title', field_type: 'text', content: 'Professional Installation', sort_order: 7 },
  { page: 'about', section: 'services', field_key: 'item_3_desc', field_type: 'richtext', content: 'Expert installation by our trained professionals', sort_order: 8 },
  { page: 'about', section: 'services', field_key: 'item_3_image', field_type: 'image', content: 'Installation', image_url: '', sort_order: 9, image_width: 400, image_height: 400, image_fit: 'cover' },

  // Brand Partners - 4 items
  { page: 'about', section: 'brands', field_key: 'title', field_type: 'text', content: 'Our Brand Partners', sort_order: 0 },
  { page: 'about', section: 'brands', field_key: 'brand_1_name', field_type: 'text', content: 'Hunter Douglas', sort_order: 1 },
  { page: 'about', section: 'brands', field_key: 'brand_1_logo', field_type: 'image', content: 'Hunter Douglas', image_url: '', sort_order: 2, image_width: 200, image_height: 200, image_fit: 'contain' },
  { page: 'about', section: 'brands', field_key: 'brand_2_name', field_type: 'text', content: 'Somfy', sort_order: 3 },
  { page: 'about', section: 'brands', field_key: 'brand_2_logo', field_type: 'image', content: 'Somfy', image_url: '', sort_order: 4, image_width: 200, image_height: 200, image_fit: 'contain' },
  { page: 'about', section: 'brands', field_key: 'brand_3_name', field_type: 'text', content: 'Lutron', sort_order: 5 },
  { page: 'about', section: 'brands', field_key: 'brand_3_logo', field_type: 'image', content: 'Lutron', image_url: '', sort_order: 6, image_width: 200, image_height: 200, image_fit: 'contain' },
  { page: 'about', section: 'brands', field_key: 'brand_4_name', field_type: 'text', content: 'R-TEC', sort_order: 7 },
  { page: 'about', section: 'brands', field_key: 'brand_4_logo', field_type: 'image', content: 'R-TEC', image_url: '', sort_order: 8, image_width: 200, image_height: 200, image_fit: 'contain' },

  // ======================== GALLERY PAGE ========================
  { page: 'gallery', section: 'hero', field_key: 'title', field_type: 'text', content: 'Our Gallery', sort_order: 0 },
  { page: 'gallery', section: 'hero', field_key: 'subtitle', field_type: 'text', content: 'Explore Our Portfolio of Stunning Projects', sort_order: 1 },
  { page: 'gallery', section: 'hero', field_key: 'bg_image', field_type: 'image', content: 'Gallery Hero Background', image_url: '', sort_order: 2, image_width: 1920, image_height: 800, image_fit: 'cover' },

  // Gallery projects - 12 items
  ...Array.from({ length: 12 }, (_, i) => ([
    { page: 'gallery', section: 'projects', field_key: `project_${i + 1}_title`, field_type: 'text', content: ['Luxury Living Room', 'Modern Office Space', 'Elegant Bedroom', 'Hotel Lobby', 'Dining Room', 'Conference Room', 'Master Suite', 'Restaurant', 'Home Theater', 'Penthouse', 'Boutique Store', 'Living Room'][i], sort_order: i * 3 },
    { page: 'gallery', section: 'projects', field_key: `project_${i + 1}_location`, field_type: 'text', content: ['Beverly Hills, CA', 'Downtown LA', 'Pasadena, CA', 'Hollywood, CA', 'San Marino, CA', 'Century City', 'Arcadia, CA', 'Santa Monica', 'Temple City, CA', 'West Hollywood', 'Beverly Hills', 'Alhambra, CA'][i], sort_order: i * 3 + 1 },
    { page: 'gallery', section: 'projects', field_key: `project_${i + 1}_image`, field_type: 'image', content: `Project ${i + 1}`, image_url: '', sort_order: i * 3 + 2, image_width: 600, image_height: 450, image_fit: 'cover' },
  ])).flat(),

  // ======================== PRODUCTS PAGE ========================
  { page: 'products', section: 'hero', field_key: 'title', field_type: 'text', content: 'Our Products', sort_order: 0 },
  { page: 'products', section: 'hero', field_key: 'subtitle', field_type: 'text', content: 'Premium Window Treatments & Solutions', sort_order: 1 },
  { page: 'products', section: 'hero', field_key: 'bg_image', field_type: 'image', content: 'Products Hero Background', image_url: '', sort_order: 2, image_width: 1920, image_height: 800, image_fit: 'cover' },

  // Products - 9 items
  ...['Custom Drapery', 'Sheer Curtains', 'Roller Shades', 'Roman Shades', 'Cellular Shades', 'Valances & Cornices', 'Drapery Hardware', 'Motorization Systems', 'Vertical Blinds'].map((name, i) => ([
    { page: 'products', section: 'items', field_key: `product_${i + 1}_name`, field_type: 'text', content: name, sort_order: i * 2 },
    { page: 'products', section: 'items', field_key: `product_${i + 1}_image`, field_type: 'image', content: name, image_url: '', sort_order: i * 2 + 1, image_width: 400, image_height: 400, image_fit: 'cover' },
  ])).flat(),

  // Footer / Global
  { page: 'global', section: 'footer', field_key: 'copyright', field_type: 'text', content: '©2022 by Angel Drapery', sort_order: 0 },
  { page: 'global', section: 'footer', field_key: 'youtube_url', field_type: 'text', content: '#', sort_order: 1 },
  { page: 'global', section: 'footer', field_key: 'etsy_url', field_type: 'text', content: '#', sort_order: 2 },
  { page: 'global', section: 'footer', field_key: 'tiktok_url', field_type: 'text', content: '#', sort_order: 3 },
  { page: 'global', section: 'footer', field_key: 'linkedin_url', field_type: 'text', content: '#', sort_order: 4 },
]

export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // Ensure table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        page VARCHAR(64) NOT NULL,
        section VARCHAR(128) NOT NULL,
        field_key VARCHAR(128) NOT NULL,
        field_type VARCHAR(32) NOT NULL DEFAULT 'text',
        content TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        image_width INTEGER DEFAULT 0,
        image_height INTEGER DEFAULT 0,
        image_fit VARCHAR(32) DEFAULT 'cover',
        sort_order INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(page, section, field_key)
      )
    `)

    let inserted = 0
    let skipped = 0

    for (const item of SEED_DATA) {
      const { page, section, field_key, field_type = 'text', content = '', image_url = '', sort_order = 0 } = item as any
      const image_width = (item as any).image_width || 0
      const image_height = (item as any).image_height || 0
      const image_fit = (item as any).image_fit || 'cover'

      const result = await pool.query(`
        INSERT INTO site_content (page, section, field_key, field_type, content, image_url, image_width, image_height, image_fit, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (page, section, field_key) DO NOTHING
        RETURNING id
      `, [page, section, field_key, field_type, content, image_url, image_width, image_height, image_fit, sort_order])

      if (result.rows.length > 0) inserted++
      else skipped++
    }

    return NextResponse.json({
      success: true,
      message: `Seed complete: ${inserted} inserted, ${skipped} already existed`,
      total: SEED_DATA.length
    })
  } catch (e) {
    console.error('Seed error:', e)
    return NextResponse.json({ success: false, error: { message: 'Could not seed site content. Please try again.' } }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
