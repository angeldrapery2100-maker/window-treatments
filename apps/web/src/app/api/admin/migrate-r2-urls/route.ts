/**
 * One-time admin endpoint that rewrites every legacy
 * `https://pub-9090ea94bda94d6daf755d6ce4b62812.r2.dev/<key>` URL in the
 * database to `/media/<key>` (served by the Next.js R2 proxy route).
 *
 * Runs server-side in Vercel so DATABASE_URL never leaves the platform.
 *
 * Auth: same `requireAdmin` guard the rest of /api/admin uses.
 *
 * Usage:
 *   GET  /api/admin/migrate-r2-urls?dryRun=1   → counts only, no writes
 *   POST /api/admin/migrate-r2-urls            → wraps everything in a
 *                                                 transaction and commits
 *
 * DELETE THIS FILE after the migration runs successfully.
 */

import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

const OLD_PREFIX = 'https://pub-9090ea94bda94d6daf755d6ce4b62812.r2.dev/'
const NEW_PREFIX = '/media/'

type TextTarget = { table: string; column: string }
type JsonbTarget = { table: string; column: string; jsonb: true }

const TEXT_TARGETS: TextTarget[] = [
  { table: 'site_content',              column: 'image_url' },
  { table: 'installation_images',       column: 'image_url' },
  { table: 'gallery_custom_videos',     column: 'video_url' },
  { table: 'gallery_custom_videos',     column: 'poster_url' },
  { table: 'showcase_products',         column: 'cover_image' },
  { table: 'showcase_product_images',   column: 'image_url' },
  { table: 'showcase_product_sections', column: 'image_url' },
]

const JSONB_TARGETS: JsonbTarget[] = [
  { table: 'products', column: 'default_config', jsonb: true },
  { table: 'products', column: 'images',         jsonb: true },
]

async function tableExists(client: any, name: string) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1`,
    [name],
  )
  return rows.length > 0
}

async function columnExists(client: any, table: string, column: string) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column],
  )
  return rows.length > 0
}

async function processText(
  client: any,
  t: TextTarget,
  dryRun: boolean,
): Promise<{ table: string; column: string; rows: number; skipped?: boolean }> {
  if (!(await tableExists(client, t.table)) || !(await columnExists(client, t.table, t.column))) {
    return { table: t.table, column: t.column, rows: 0, skipped: true }
  }

  const likeParam = `${OLD_PREFIX}%`

  if (dryRun) {
    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS n FROM ${t.table} WHERE ${t.column} LIKE $1`,
      [likeParam],
    )
    return { table: t.table, column: t.column, rows: rows[0].n }
  }

  const result = await client.query(
    `UPDATE ${t.table}
        SET ${t.column} = $2 || SUBSTRING(${t.column} FROM ${OLD_PREFIX.length + 1})
      WHERE ${t.column} LIKE $1`,
    [likeParam, NEW_PREFIX],
  )
  return { table: t.table, column: t.column, rows: result.rowCount || 0 }
}

async function processJsonb(
  client: any,
  t: JsonbTarget,
  dryRun: boolean,
): Promise<{ table: string; column: string; rows: number; skipped?: boolean }> {
  if (!(await tableExists(client, t.table)) || !(await columnExists(client, t.table, t.column))) {
    return { table: t.table, column: t.column, rows: 0, skipped: true }
  }

  const likeParam = `%${OLD_PREFIX}%`

  if (dryRun) {
    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS n FROM ${t.table} WHERE ${t.column}::text LIKE $1`,
      [likeParam],
    )
    return { table: t.table, column: t.column, rows: rows[0].n }
  }

  const result = await client.query(
    `UPDATE ${t.table}
        SET ${t.column} = REPLACE(${t.column}::text, $1, $2)::jsonb
      WHERE ${t.column}::text LIKE $3`,
    [OLD_PREFIX, NEW_PREFIX, likeParam],
  )
  return { table: t.table, column: t.column, rows: result.rowCount || 0 }
}

async function runMigration(dryRun: boolean) {
  const client = await pool.connect()
  const results: Array<{ table: string; column: string; rows: number; skipped?: boolean }> = []
  let total = 0

  try {
    if (!dryRun) await client.query('BEGIN')

    for (const t of TEXT_TARGETS) {
      const r = await processText(client, t, dryRun)
      results.push(r)
      if (!r.skipped) total += r.rows
    }
    for (const t of JSONB_TARGETS) {
      const r = await processJsonb(client, t, dryRun)
      results.push({ ...r, column: r.column + ' (jsonb)' })
      if (!r.skipped) total += r.rows
    }

    if (!dryRun) await client.query('COMMIT')
  } catch (err) {
    if (!dryRun) await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  return { dryRun, total, results }
}

export async function GET(request: Request) {
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dryRun') !== '0' // default ON for GET
    const out = await runMigration(dryRun)
    return NextResponse.json({ success: true, ...out })
  } catch (err: any) {
    console.error('[migrate-r2-urls] failed:', err)
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const out = await runMigration(false)
    return NextResponse.json({ success: true, ...out })
  } catch (err: any) {
    console.error('[migrate-r2-urls] failed:', err)
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
