/**
 * seed-product-catalog.mjs
 * 把前台 20 个 Hunter Douglas 硬编码产品 + 7 个特殊页面导入 showcase_products 表
 * 运行方式：cd apps/web && node seed-product-catalog.mjs
 *
 * 幂等：重复运行不会重复插入 (ON CONFLICT slug DO UPDATE)
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── 1. 数据库连接 ──────────────────────────────────────────────────────────────
// 自动读取 .env.local（Next.js 本地开发的数据库连接）
try {
  const envPath = new URL('.env.local', import.meta.url).pathname
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch { /* .env.local 不存在时忽略 */ }

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://haitongcao@localhost:5432/window_treatments',
})

// ── 2. Hunter Douglas slug → 类别映射 ────────────────────────────────────────
const CATEGORY_MAP = {
  'duette':               'shades',
  'applause':             'shades',
  'sonnette':             'shades',
  'vignette':             'shades',
  'roller-skyline':       'shades',
  'screen-skyline':       'shades',
  'us-banded':            'shades',
  'provenance':           'shades',
  'alustra-architectural':'sheers',
  'alustra-woven-textures':'sheers',
  'silhouette':           'sheers',
  'pirouette':            'sheers',
  'luminette':            'sheers',
  'aria':                 'sheers',
  'nantucket':            'sheers',
  'everwood-parkland':    'blinds',
  'modern-precious-metals':'blinds',
  'verticals':            'blinds',
  'palm-beach':           'shutters',
  'heritance-newstyle':   'shutters',
}

// ── 3. 7 个特殊硬编码页面 ─────────────────────────────────────────────────────
const SPECIAL_PAGES = [
  {
    slug:        'luma-collection',
    name:        'Luma Collection — Zebra Shades',
    description: 'Premium zebra shades with dual-layer light control. Available in cordless, motorized, and smart home options. 46 fabric patterns, 220+ colors.',
    cover_image: '/luma-collection/lifestyle-dark-livingroom.png',
    category:    'shades',
    href:        '/products/luma-collection',
    sort_order:  100,
  },
  {
    slug:        'roller-collection',
    name:        'Luma Roller Shades',
    description: 'Precision-crafted roller shades in blackout, light-filtering, and solar screen fabrics. 82 patterns, 354+ colors, smart home ready.',
    cover_image: '/roller-collection/detail-square-cassette.png',
    category:    'shades',
    href:        '/products/roller-collection',
    sort_order:  101,
  },
  {
    slug:        'sheer-collection',
    name:        'Sheer Collection',
    description: 'Elegant sheer shades with soft diffused light. Multiple mounting options and motorization available.',
    cover_image: '/sheer-collection/lifestyle-sheer-living-room.png',
    category:    'sheers',
    href:        '/products/sheer-collection',
    sort_order:  102,
  },
  {
    slug:        'handcrafted-drapery',
    name:        'Handcrafted Drapery',
    description: 'Premium made-to-measure drapery with refined hand-finished construction, rich fabric options, and experienced design guidance.',
    cover_image: '/drapery/handcrafted-drapery/IMG_0547.JPG',
    category:    'custom',
    href:        '/products/handcrafted-drapery',
    sort_order:  103,
  },
  {
    slug:        'handcrafted-roman-shade',
    name:        'Handcrafted Roman Shades',
    description: 'Custom-crafted roman shades with clean fold lines, premium fabrics, and optional lining. Made to your exact window dimensions.',
    cover_image: '/drapery/handcrafted-drapery/IMG_0993.jpg',
    category:    'custom',
    href:        '/products/handcrafted-roman-shade',
    sort_order:  104,
  },
  {
    slug:        'handcrafted-top-treatment',
    name:        'Handcrafted Top Treatments',
    description: 'Valances, cornices, and swags crafted to complement your window treatments and interior design.',
    cover_image: '/drapery/handcrafted-drapery/IMG_1304.jpg',
    category:    'custom',
    href:        '/products/handcrafted-top-treatment',
    sort_order:  105,
  },
  {
    slug:        'lutron-palladiom',
    name:        'Lutron Palladiom Shading',
    description: 'Premium motorized shading system with precision engineering, whisper-quiet operation, and full smart home integration.',
    cover_image: '/lutron/palladiom/p4-living-room.jpg',
    category:    'motorized',
    href:        '/products/lutron-palladiom',
    sort_order:  106,
  },
]

// ── 4. 主函数 ─────────────────────────────────────────────────────────────────
async function main() {
  const client = await pool.connect()
  try {
    // 4a. 扩展 showcase_products 表（添加 source / href / category 列）
    console.log('Ensuring showcase_products columns exist...')
    await client.query(`
      ALTER TABLE showcase_products
        ADD COLUMN IF NOT EXISTS source   VARCHAR(32) DEFAULT 'cms',
        ADD COLUMN IF NOT EXISTS href     TEXT        DEFAULT '',
        ADD COLUMN IF NOT EXISTS category VARCHAR(64) DEFAULT ''
    `)
    console.log('  ✓ Columns ready')

    // 4b. 读取 Hunter Douglas products-index.json
    const indexPath = path.join(__dirname, 'public', 'hunter-douglas', 'products-index.json')
    const hdProducts = JSON.parse(readFileSync(indexPath, 'utf-8'))
    console.log(`\nSeeding ${hdProducts.length} Hunter Douglas products...`)

    let i = 0
    for (const p of hdProducts) {
      const coverImage = p.cover_image
        ? `/hunter-douglas/${p.slug}/${p.cover_image}`
        : null
      const category = CATEGORY_MAP[p.slug] || 'other'
      const href = `/products/${p.slug}`

      await client.query(`
        INSERT INTO showcase_products
          (name, slug, description, cover_image, status, sort_order, source, href, category)
        VALUES ($1, $2, $3, $4, 'active', $5, 'hardcoded', $6, $7)
        ON CONFLICT (slug) DO UPDATE SET
          name        = EXCLUDED.name,
          description = EXCLUDED.description,
          cover_image = CASE WHEN showcase_products.cover_image = '' OR showcase_products.cover_image IS NULL
                             THEN EXCLUDED.cover_image
                             ELSE showcase_products.cover_image END,
          href        = EXCLUDED.href,
          category    = EXCLUDED.category,
          source      = EXCLUDED.source,
          updated_at  = now()
      `, [p.name, p.slug, p.description || '', coverImage, i++, href, category])
      console.log(`  ✓ ${p.name} (${p.slug})`)
    }

    // 4c. 插入 7 个特殊页面
    console.log('\nSeeding 7 special product pages...')
    for (const p of SPECIAL_PAGES) {
      await client.query(`
        INSERT INTO showcase_products
          (name, slug, description, cover_image, status, sort_order, source, href, category)
        VALUES ($1, $2, $3, $4, 'active', $5, 'hardcoded', $6, $7)
        ON CONFLICT (slug) DO UPDATE SET
          name        = EXCLUDED.name,
          description = EXCLUDED.description,
          cover_image = CASE WHEN showcase_products.cover_image = '' OR showcase_products.cover_image IS NULL
                             THEN EXCLUDED.cover_image
                             ELSE showcase_products.cover_image END,
          href        = EXCLUDED.href,
          category    = EXCLUDED.category,
          source      = EXCLUDED.source,
          sort_order  = EXCLUDED.sort_order,
          updated_at  = now()
      `, [p.name, p.slug, p.description, p.cover_image, p.sort_order, p.href, p.category])
      console.log(`  ✓ ${p.name} (${p.slug})`)
    }

    // 4d. 验证
    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM showcase_products WHERE source = 'hardcoded'`
    )
    console.log(`\n✅ Done! ${rows[0].cnt} hardcoded products in showcase_products`)
    console.log('   Run "node create-admin.mjs" if you also need the admin account.')

  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(err => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
