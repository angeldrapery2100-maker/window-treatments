#!/usr/bin/env node
/**
 * One-shot migration: rewrite every R2 public URL in the database
 * from `https://pub-9090ea94bda94d6daf755d6ce4b62812.r2.dev/<key>`
 * to `/media/<key>`.
 *
 * Why:
 *   The .r2.dev subdomain is rate-limited → 503s under production load.
 *   We now serve objects through the Next.js /media/[...path] proxy
 *   route, which pulls from R2 via the S3 API (no rate limit) and is
 *   cached at Vercel Edge.
 *
 * What this touches:
 *   site_content.image_url                        (TEXT)
 *   installation_images.image_url                 (TEXT)
 *   gallery_custom_videos.video_url               (TEXT)
 *   gallery_custom_videos.poster_url              (TEXT)
 *   showcase_products.cover_image                 (TEXT)
 *   showcase_product_images.image_url             (TEXT)
 *   showcase_product_sections.image_url           (TEXT)
 *   products.default_config                       (JSONB, rewritten as text)
 *   products.images                               (JSONB, rewritten as text)
 *
 * Idempotent: already-migrated rows (URLs already starting with /media/)
 * are skipped by the WHERE clause on each statement.
 *
 * Usage:
 *   cd apps/web
 *   DATABASE_URL="postgresql://…" node scripts/migrate-r2-urls-to-media.mjs
 *
 *   Add --dry-run to print what would change without writing anything.
 */

import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'

const OLD_PREFIX = 'https://pub-9090ea94bda94d6daf755d6ce4b62812.r2.dev/'
const NEW_PREFIX = '/media/'

const DRY_RUN = process.argv.includes('--dry-run')

/**
 * Load DATABASE_URL from .env.production.local (or another file passed via
 * --env-file=...) ourselves. Doing it here avoids three landmines:
 *   1. shell `source` reinterpreting `$` etc. inside the connection string,
 *   2. older Node versions that don't support `--env-file`,
 *   3. CRLF line endings from the Vercel CLI on macOS.
 *
 * If DATABASE_URL is already set in the environment, we use that directly.
 */
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  const raw = fs.readFileSync(file, 'utf8')
  const out = {}
  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    // Strip a single matched pair of surrounding quotes, if present.
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const envFileArg = process.argv.find((a) => a.startsWith('--env-file='))
const envFile = envFileArg
  ? envFileArg.slice('--env-file='.length)
  : path.resolve(process.cwd(), '.env.production.local')

if (!process.env.DATABASE_URL) {
  const fileEnv = loadEnvFile(envFile)
  if (fileEnv.DATABASE_URL) process.env.DATABASE_URL = fileEnv.DATABASE_URL
}

if (!process.env.DATABASE_URL) {
  console.error(`DATABASE_URL is not set (also tried ${envFile})`)
  process.exit(1)
}

const { Client } = pg
const db = new Client({ connectionString: process.env.DATABASE_URL })

/** @typedef {{ table: string, column: string, jsonb?: boolean }} Target */

/** @type {Target[]} */
const TEXT_TARGETS = [
  { table: 'site_content',                column: 'image_url' },
  { table: 'installation_images',         column: 'image_url' },
  { table: 'gallery_custom_videos',       column: 'video_url' },
  { table: 'gallery_custom_videos',       column: 'poster_url' },
  { table: 'showcase_products',           column: 'cover_image' },
  { table: 'showcase_product_images',     column: 'image_url' },
  { table: 'showcase_product_sections',   column: 'image_url' },
]

/** @type {Target[]} */
const JSONB_TARGETS = [
  { table: 'products', column: 'default_config', jsonb: true },
  { table: 'products', column: 'images',         jsonb: true },
]

async function tableExists(name) {
  const { rows } = await db.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [name]
  )
  return rows.length > 0
}

async function columnExists(table, column) {
  const { rows } = await db.query(
    `SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  )
  return rows.length > 0
}

async function migrateTextColumn(t) {
  if (!(await tableExists(t.table)) || !(await columnExists(t.table, t.column))) {
    console.log(`  skip ${t.table}.${t.column} (missing)`)
    return 0
  }

  const likeParam = `${OLD_PREFIX}%`

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS n FROM ${t.table} WHERE ${t.column} LIKE $1`,
    [likeParam]
  )
  const count = countRows[0].n

  if (count === 0) {
    console.log(`  ${t.table}.${t.column}: 0 rows to migrate`)
    return 0
  }

  if (DRY_RUN) {
    console.log(`  [dry-run] ${t.table}.${t.column}: would rewrite ${count} rows`)
    return count
  }

  const { rowCount } = await db.query(
    `UPDATE ${t.table}
        SET ${t.column} = $2 || SUBSTRING(${t.column} FROM ${OLD_PREFIX.length + 1})
      WHERE ${t.column} LIKE $1`,
    [likeParam, NEW_PREFIX]
  )
  console.log(`  ${t.table}.${t.column}: rewrote ${rowCount} rows`)
  return rowCount || 0
}

async function migrateJsonbColumn(t) {
  if (!(await tableExists(t.table)) || !(await columnExists(t.table, t.column))) {
    console.log(`  skip ${t.table}.${t.column} (missing)`)
    return 0
  }

  // Count rows whose JSONB-as-text contains the old prefix.
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS n FROM ${t.table} WHERE ${t.column}::text LIKE $1`,
    [`%${OLD_PREFIX}%`]
  )
  const count = countRows[0].n

  if (count === 0) {
    console.log(`  ${t.table}.${t.column} (jsonb): 0 rows to migrate`)
    return 0
  }

  if (DRY_RUN) {
    console.log(`  [dry-run] ${t.table}.${t.column} (jsonb): would rewrite ${count} rows`)
    return count
  }

  // REPLACE on the stringified JSONB, then cast back. This is safe because
  // the prefix doesn't contain any JSON metacharacters that would need
  // escaping inside a JSON string literal.
  const { rowCount } = await db.query(
    `UPDATE ${t.table}
        SET ${t.column} = REPLACE(${t.column}::text, $1, $2)::jsonb
      WHERE ${t.column}::text LIKE $3`,
    [OLD_PREFIX, NEW_PREFIX, `%${OLD_PREFIX}%`]
  )
  console.log(`  ${t.table}.${t.column} (jsonb): rewrote ${rowCount} rows`)
  return rowCount || 0
}

async function main() {
  console.log(`R2 → /media URL migration ${DRY_RUN ? '(DRY RUN)' : ''}`)
  console.log(`  from: ${OLD_PREFIX}*`)
  console.log(`  to:   ${NEW_PREFIX}*`)
  console.log('')

  await db.connect()

  if (!DRY_RUN) await db.query('BEGIN')

  let total = 0

  try {
    console.log('TEXT columns:')
    for (const t of TEXT_TARGETS) total += await migrateTextColumn(t)

    console.log('\nJSONB columns:')
    for (const t of JSONB_TARGETS) total += await migrateJsonbColumn(t)

    if (!DRY_RUN) await db.query('COMMIT')
  } catch (err) {
    if (!DRY_RUN) await db.query('ROLLBACK')
    throw err
  } finally {
    await db.end()
  }

  console.log(`\nDone. Total rows ${DRY_RUN ? 'would be ' : ''}updated: ${total}`)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
