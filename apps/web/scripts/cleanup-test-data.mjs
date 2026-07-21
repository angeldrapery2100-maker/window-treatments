#!/usr/bin/env node
// Cleanup of 7/20–7/21 AI-CS test artifacts (P0-5 follow-up, 2026-07-21).
// See docs/CLEANUP-TEST-DATA-2026-07-21.md for the full rationale.
//
// SAFE BY DEFAULT: with no flags this is a DRY RUN — it only prints what
// would be deleted. Add --apply to actually delete.
//
// Usage (run from repo root on YOUR machine, against the PRODUCTION db):
//   DATABASE_URL="postgres://..." node apps/web/scripts/cleanup-test-data.mjs
//   DATABASE_URL="postgres://..." node apps/web/scripts/cleanup-test-data.mjs --apply
//
// Get the production DATABASE_URL from Vercel → Project → Settings →
// Environment Variables (or `npx vercel env pull`). NEVER commit it.

import pg from 'pg'

const APPLY = process.argv.includes('--apply')
// Test window: 2026-07-20 00:00 PT onward.
const SINCE = '2026-07-20 07:00:00+00'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Set DATABASE_URL to the PRODUCTION connection string first.')
  process.exit(1)
}
const isLocal = /localhost|127\.0\.0\.1/.test(url)
const client = new pg.Client({ connectionString: url, ssl: isLocal ? undefined : { rejectUnauthorized: false } })
await client.connect()

const q = (sql, params = []) => client.query(sql, params)
const banner = (s) => console.log(`\n=== ${s} ===`)

try {
  console.log(APPLY ? '*** APPLY MODE — rows WILL be deleted ***' : '*** DRY RUN — nothing will be deleted (add --apply) ***')
  console.log('Test window since:', SINCE)

  // 1) Guest chat history (guest read/write removed in 991fbf9 — stored rows
  //    are pure leak surface now; signed-in rows u:% are kept).
  banner('1) assistant_chat guest rows (a:%)')
  const r1 = await q(`SELECT count(*)::int AS n FROM assistant_chat WHERE owner_key LIKE 'a:%'`)
  console.log('rows:', r1.rows[0].n)
  if (APPLY && r1.rows[0].n > 0) {
    await q(`DELETE FROM assistant_chat WHERE owner_key LIKE 'a:%'`)
    console.log('deleted.')
  }

  // 2) lead_events in the test window
  banner('2) lead_events since window')
  const r2 = await q(`SELECT type, count(*)::int AS n FROM lead_events WHERE created_at >= $1 GROUP BY type ORDER BY n DESC`, [SINCE])
  console.table(r2.rows)
  if (APPLY) {
    const d = await q(`DELETE FROM lead_events WHERE created_at >= $1`, [SINCE])
    console.log('deleted:', d.rowCount)
  }

  // 3) measured_windows in the test window
  banner('3) measured_windows since window')
  const r3 = await q(`SELECT id, label, created_at FROM measured_windows WHERE created_at >= $1 ORDER BY created_at`, [SINCE])
  console.table(r3.rows.map(r => ({ id: String(r.id).slice(0, 8), label: r.label, created_at: r.created_at })))
  if (APPLY) {
    const d = await q(`DELETE FROM measured_windows WHERE created_at >= $1`, [SINCE])
    console.log('deleted:', d.rowCount)
  }

  // 4) home_projects (+items) in the test window — project notes were the F6
  //    leak source (they held test names/phones).
  banner('4) home_projects since window')
  const r4 = await q(
    `SELECT p.id, p.name, p.created_at, count(i.id)::int AS items
       FROM home_projects p LEFT JOIN project_items i ON i.project_id = p.id
      WHERE p.created_at >= $1 GROUP BY p.id ORDER BY p.created_at`, [SINCE])
  console.table(r4.rows.map(r => ({ id: String(r.id).slice(0, 8), name: r.name, items: r.items, created_at: r.created_at })))
  if (APPLY) {
    await q(`DELETE FROM project_items WHERE project_id IN (SELECT id FROM home_projects WHERE created_at >= $1)`, [SINCE])
    const d = await q(`DELETE FROM home_projects WHERE created_at >= $1`, [SINCE])
    console.log('deleted projects:', d.rowCount)
  }

  // 5) support_tickets in the window — LIST ONLY, delete by hand after review
  //    (a real customer ticket could fall in the window).
  banner('5) support_tickets since window (review manually — NOT auto-deleted)')
  const r5 = await q(`SELECT id, ticket_type, created_at, left(message, 60) AS preview FROM support_tickets WHERE created_at >= $1 ORDER BY created_at`, [SINCE])
  console.table(r5.rows)

  // 6) Legacy PII scan in persisted free-text (writes are scrubbed since W6;
  //    this finds anything older) — LIST ONLY.
  banner('6) legacy PII in project_items.notes / measured_windows labels (review manually)')
  const r6 = await q(
    `SELECT 'project_item' AS src, id::text, notes AS text FROM project_items
      WHERE notes ~ '\\d{3}[-. )]?\\d{3}[-. ]?\\d{4}' OR notes LIKE '%@%'
     UNION ALL
     SELECT 'measured_window', id::text, label FROM measured_windows
      WHERE label ~ '\\d{3}[-. )]?\\d{3}[-. ]?\\d{4}' OR label LIKE '%@%'`)
  console.table(r6.rows.map(r => ({ src: r.src, id: r.id.slice(0, 8), text: String(r.text).slice(0, 70) })))

  console.log(APPLY ? '\nDone — cleanup applied.' : '\nDry run complete. Re-run with --apply to delete sections 1–4.')
} finally {
  await client.end()
}
