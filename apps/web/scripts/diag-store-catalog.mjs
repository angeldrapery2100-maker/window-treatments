#!/usr/bin/env node
// Diagnose the assistant's store-catalog tool chain against the REAL db
// (T1/H6: "商品目录工具未成功读取"). Runs the exact queries the tools run and
// prints results or the real error — distinguishing "DB error" from "empty
// catalog" from "type-slug mismatch".
//
// Usage:
//   DATABASE_URL="postgres://...(Neon prod)..." node apps/web/scripts/diag-store-catalog.mjs

import pg from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Set DATABASE_URL first (Neon production string).')
  process.exit(1)
}
const isLocal = /localhost|127\.0\.0\.1/.test(url)
const client = new pg.Client({ connectionString: url, ssl: isLocal ? undefined : { rejectUnauthorized: false } })
await client.connect()
const q = (sql, p = []) => client.query(sql, p)
const banner = (s) => console.log(`\n=== ${s} ===`)

try {
  banner('0) tables & columns present?')
  const t = await q(`SELECT tablename FROM pg_tables WHERE tablename IN ('products','product_types','store_categories') ORDER BY 1`)
  console.log('tables:', t.rows.map(r => r.tablename).join(', ') || '(none!)')
  const c = await q(`SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='store_category_id'`)
  console.log('products.store_category_id exists:', c.rows.length > 0)

  banner('1) product_types slugs (what a `type` filter must match)')
  const pt = await q(`SELECT slug, name FROM product_types ORDER BY slug`).catch(e => ({ error: String(e) }))
  if (pt.error) console.log('ERROR:', pt.error)
  else console.table(pt.rows)

  banner('2) EXACT list_store_products query (no filter)')
  try {
    const r = await q(
      `SELECT p.id, p.name, pt.slug AS type, sc.name AS category
         FROM products p
         JOIN product_types pt ON pt.id = p.product_type_id
         LEFT JOIN store_categories sc ON sc.id = p.store_category_id
        WHERE p.is_active = true
        ORDER BY pt.slug, p.name
        LIMIT 100`)
    console.table(r.rows.map(x => ({ id: String(x.id).slice(0, 8), name: x.name, type: x.type, category: x.category })))
    console.log('row count:', r.rows.length, r.rows.length === 0 ? '← EMPTY: is_active flags or join broken?' : '')
  } catch (e) {
    console.log('QUERY ERROR (this is the tool failure):', String(e))
  }

  banner('3) same query WITH type filter examples')
  for (const f of ['roller', 'shades', 'luma', 'drapery', 'roman']) {
    try {
      const r = await q(
        `SELECT count(*)::int AS n FROM products p JOIN product_types pt ON pt.id = p.product_type_id
          WHERE p.is_active = true AND pt.slug = $1`, [f])
      console.log(`type='${f}':`, r.rows[0].n)
    } catch (e) {
      console.log(`type='${f}': ERROR`, String(e).slice(0, 120))
    }
  }

  banner('4) Luma roller candidates for quote_store_product (aapp engine wired?)')
  try {
    const r = await q(
      `SELECT p.id, p.name, pt.slug AS type,
              (p.default_config->'params'->>'aapp_engine') AS aapp_engine,
              p.base_price
         FROM products p JOIN product_types pt ON pt.id = p.product_type_id
        WHERE p.is_active = true AND (p.name ILIKE '%roller%' OR pt.slug ILIKE '%roller%')
        ORDER BY p.name LIMIT 20`)
    console.table(r.rows.map(x => ({ id: String(x.id).slice(0, 8), name: x.name, type: x.type, engine: x.aapp_engine, base: x.base_price })))
  } catch (e) {
    console.log('ERROR:', String(e).slice(0, 200))
  }

  console.log('\nInterpretation: section 2 error → real DB problem (send me the message). ' +
    'Section 2 fine here but tool fails in prod → check Vercel logs for "[assistant] list_store_products DB error" (runtime/env issue). ' +
    'Section 3 zeros for the slug the model uses → naming mismatch (now auto-falls back to full catalog).')
} finally {
  await client.end()
}
