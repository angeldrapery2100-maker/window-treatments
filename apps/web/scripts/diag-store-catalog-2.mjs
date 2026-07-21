#!/usr/bin/env node
// Follow-up to diag-store-catalog.mjs: the exact tool query returned 0 rows
// with no error — pin down WHY (empty table vs all-inactive vs orphaned
// product_type_id after a types re-seed).
//
//   DATABASE_URL="postgres://...(Neon prod)..." node apps/web/scripts/diag-store-catalog-2.mjs

import pg from 'pg'

const url = process.env.DATABASE_URL
if (!url) { console.error('Set DATABASE_URL first.'); process.exit(1) }
const isLocal = /localhost|127\.0\.0\.1/.test(url)
const client = new pg.Client({ connectionString: url, ssl: isLocal ? undefined : { rejectUnauthorized: false } })
await client.connect()
const q = (sql, p = []) => client.query(sql, p)
const banner = (s) => console.log(`\n=== ${s} ===`)

try {
  banner('A) products row counts')
  const a = await q(`SELECT count(*)::int AS total,
                            count(*) FILTER (WHERE is_active)::int AS active,
                            count(*) FILTER (WHERE NOT is_active)::int AS inactive
                       FROM products`)
  console.table(a.rows)

  banner('B) orphaned type links (products whose product_type_id matches NO product_types row)')
  const b = await q(`SELECT count(*)::int AS orphaned
                       FROM products p LEFT JOIN product_types pt ON pt.id = p.product_type_id
                      WHERE pt.id IS NULL`)
  console.table(b.rows)

  banner('C) sample products (up to 10, no join)')
  const c = await q(`SELECT id, name, is_active, product_type_id, created_at
                       FROM products ORDER BY created_at DESC LIMIT 10`)
  console.table(c.rows.map(r => ({
    id: String(r.id).slice(0, 8), name: String(r.name).slice(0, 30),
    active: r.is_active, type_id: String(r.product_type_id).slice(0, 8), created: r.created_at,
  })))

  banner('D) product_types ids (compare with type_id column above)')
  const d = await q(`SELECT id, slug, name FROM product_types ORDER BY slug`)
  console.table(d.rows.map(r => ({ id: String(r.id).slice(0, 8), slug: r.slug, name: r.name })))

  banner('E) which database/branch is this?')
  const e = await q(`SELECT current_database() AS db, inet_server_addr()::text AS host`)
  console.table(e.rows)

  console.log('\nReading the result:')
  console.log('- A total=0            → store catalog was never seeded / got wiped in this database.')
  console.log('- A active=0, total>0  → everything is deactivated (admin flag issue).')
  console.log('- B orphaned>0         → product_types was re-seeded; products point at dead type ids (fix = remap type ids).')
  console.log('- C/D id mismatch      → visual confirmation of the orphan case.')
} finally {
  await client.end()
}
