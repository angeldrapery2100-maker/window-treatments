#!/usr/bin/env node
/**
 * optimize-local-and-upload.mjs — compress images from the LOCAL pristine
 * originals in apps/web/public/ and upload to R2, IN PLACE (same key/URL).
 *
 * Why this exists (vs recompress-r2-images.mjs):
 *   recompress-r2-images downloads what is already on R2 and re-encodes it,
 *   which can double-compress objects that were optimised before. This script
 *   always starts from the untouched local original, so every image is encoded
 *   exactly ONCE — no generational quality loss.
 *
 * For each local image it:
 *   compress (max long edge + quality, SAME format/extension as the original)
 *   → HEAD the matching R2 object to read its current size
 *   → upload ONLY IF the freshly-compressed result is smaller than what's on R2.
 *
 * Mapping: R2 key = path relative to apps/web/public/ (e.g.
 *   public/roller-collection/swatches/ME7-001.jpg → roller-collection/swatches/ME7-001.jpg).
 *
 * Objects that are not already on R2 are SKIPPED by default (so we never create
 * new keys that the DB/site doesn't reference) — pass --upload-missing to also
 * upload brand-new keys.
 *
 * SAFETY: DRY-RUN by default. Pass --apply to actually upload.
 *
 * Credentials: read from env, or auto-loaded from apps/web/.env.production.local.
 * Needs CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME.
 *
 * USAGE (from repo root):
 *   node apps/web/scripts/optimize-local-and-upload.mjs                 # dry-run, all images
 *   node apps/web/scripts/optimize-local-and-upload.mjs --apply         # upload smaller ones
 *   node apps/web/scripts/optimize-local-and-upload.mjs --prefix=roller-collection/
 *   node apps/web/scripts/optimize-local-and-upload.mjs --min-mb=0.3 --apply
 *   node apps/web/scripts/optimize-local-and-upload.mjs --limit=50 --apply
 *
 * Flags:
 *   --apply            Upload changes (default is dry-run)
 *   --prefix=STR       Only keys starting with STR (e.g. "uploads/")
 *   --min-mb=N         Only local files at least N MB (default 0 = all)
 *   --max-dim=N        Clamp longest edge to N px (default 2400)
 *   --quality=N        JPEG/WebP quality (default 82)
 *   --limit=N          Process at most N files (0 = no limit)
 *   --concurrency=N    Parallel workers (default 6)
 *   --upload-missing   Also upload images whose key is not yet on R2
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.resolve(__dirname, '..', 'public')

const argv = process.argv.slice(2)
const flag = (name, def) => {
  const hit = argv.find(a => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return def
  const eq = hit.indexOf('=')
  return eq === -1 ? true : hit.slice(eq + 1)
}
const APPLY          = !!flag('apply', false)
const PREFIX         = String(flag('prefix', '') || '')
const MIN_BYTES      = Math.round(parseFloat(flag('min-mb', '0')) * 1024 * 1024)
const MAX_DIM        = parseInt(flag('max-dim', '2400'), 10)
const QUALITY        = parseInt(flag('quality', '82'), 10)
const LIMIT          = parseInt(flag('limit', '0'), 10)
const CONCURRENCY    = Math.max(1, parseInt(flag('concurrency', '6'), 10))
const UPLOAD_MISSING = !!flag('upload-missing', false)

// ── Load env (process.env wins; else apps/web/.env.production.local) ─────────
function loadEnv() {
  const need = ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
  if (need.every(k => process.env[k])) return
  const envPath = path.resolve(__dirname, '..', '.env.production.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv()
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
const bucket    = process.env.R2_BUCKET_NAME
for (const k of ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']) {
  if (!process.env[k]) { console.error(`\n✗ Missing env var ${k}\n`); process.exit(1) }
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
})

const IMG_RE = /\.(jpe?g|png|webp)$/i  // formats we can rewrite keeping the extension
const encFor = (file) => {
  const ext = file.toLowerCase().split('.').pop()
  if (ext === 'png')  return { enc: 'png',  type: 'image/png' }
  if (ext === 'webp') return { enc: 'webp', type: 'image/webp' }
  return { enc: 'jpeg', type: 'image/jpeg' }
}
const mb = (n) => (n / 1048576).toFixed(2)

// Recursively list local images under PUBLIC.
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full, out)
    else if (IMG_RE.test(e.name)) out.push(full)
  }
  return out
}

function keyFor(fullPath) {
  return path.relative(PUBLIC, fullPath).split(path.sep).join('/')
}

async function headSize(key) {
  try {
    const r = await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return r.ContentLength ?? null
  } catch (e) {
    if (e?.$metadata?.httpStatusCode === 404 || e?.name === 'NotFound') return 404
    throw e
  }
}

async function processOne(fullPath) {
  const key = keyFor(fullPath)
  const localSize = fs.statSync(fullPath).size
  const { enc, type } = encFor(fullPath)

  const input = fs.readFileSync(fullPath)
  let pipeline = sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
  if (enc === 'png')       pipeline = pipeline.png({ compressionLevel: 9, palette: true })
  else if (enc === 'webp') pipeline = pipeline.webp({ quality: QUALITY })
  else                     pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true })
  const output = await pipeline.toBuffer()

  // If compressing the original doesn't beat the original, it's already optimal.
  if (output.byteLength >= localSize) return { action: 'skip-optimal', key, r2: null, before: 0, after: 0 }

  const r2size = await headSize(key)
  if (r2size === 404) {
    if (!UPLOAD_MISSING) return { action: 'skip-missing', key, r2: null, before: 0, after: 0 }
  } else if (typeof r2size === 'number' && output.byteLength >= r2size) {
    // R2 already has something equal or smaller — leave it alone (avoids re-touch).
    return { action: 'skip-r2-smaller', key, r2: r2size, before: r2size, after: r2size }
  }

  const beforeRef = typeof r2size === 'number' ? r2size : localSize
  if (APPLY) {
    await r2.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: output, ContentType: type,
      CacheControl: 'public, max-age=31536000, immutable',
    }))
  }
  return { action: 'upload', key, r2: r2size, before: beforeRef, after: output.byteLength }
}

async function main() {
  console.log(`\nR2 bucket: ${bucket}  |  mode: ${APPLY ? 'APPLY (will upload)' : 'DRY-RUN (no writes)'}`)
  console.log(`source: local apps/web/public/  |  prefix="${PREFIX || '(all)'}"  min=${mb(MIN_BYTES)}MB  max-dim=${MAX_DIM}px  quality=${QUALITY}${LIMIT ? `  limit=${LIMIT}` : ''}`)
  console.log(`missing keys: ${UPLOAD_MISSING ? 'WILL upload' : 'skip'}\n`)

  let files = walk(PUBLIC)
    .filter(f => { const k = keyFor(f); return (!PREFIX || k.startsWith(PREFIX)) && fs.statSync(f).size >= MIN_BYTES })
    .sort((a, b) => fs.statSync(b).size - fs.statSync(a).size)
  if (LIMIT > 0) files = files.slice(0, LIMIT)
  console.log(`scanning ${files.length} local images…\n`)
  if (!files.length) { console.log('Nothing to do.'); return }

  const tally = { upload: 0, 'skip-optimal': 0, 'skip-missing': 0, 'skip-r2-smaller': 0, failed: 0 }
  let before = 0, after = 0, shown = 0
  const queue = files.slice()
  async function worker() {
    while (queue.length) {
      const f = queue.shift()
      try {
        const r = await processOne(f)
        tally[r.action]++
        if (r.action === 'upload') {
          before += r.before; after += r.after
          if (shown++ < 40) console.log(`  ${mb(r.before).padStart(7)}MB → ${mb(r.after).padStart(7)}MB  ${r.key}`)
        }
      } catch (e) {
        tally.failed++
        console.warn(`  ! failed: ${keyFor(f)} — ${e.message?.slice(0, 90)}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const saved = before - after
  console.log(`\n──────────────────────────────────────────────`)
  console.log(`would upload: ${tally.upload}   |   skipped — already optimal: ${tally['skip-optimal']}, R2 already smaller: ${tally['skip-r2-smaller']}, not on R2: ${tally['skip-missing']}${tally.failed ? `, failed: ${tally.failed}` : ''}`)
  console.log(`R2 before: ${mb(before)} MB → after: ${mb(after)} MB   saved: ${mb(saved)} MB${before ? ` (${Math.round(saved / before * 100)}%)` : ''}`)
  console.log(APPLY ? '\n✓ Done — uploaded from local originals. URLs unchanged.' : '\n(DRY-RUN — re-run with --apply to upload.)')
}

main().catch(e => { console.error('\n✗', e.message, '\n'); process.exit(1) })
