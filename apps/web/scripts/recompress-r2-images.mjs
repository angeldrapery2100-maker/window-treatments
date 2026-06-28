#!/usr/bin/env node
/**
 * recompress-r2-images.mjs — shrink oversized images already living in R2,
 * IN PLACE (same object key), so existing /media/<key> URLs keep working and
 * the database needs no changes.
 *
 * For each image object above the size threshold it:
 *   download → sharp resize (max long edge) + re-encode (same format/extension)
 *   → if the result is smaller, overwrite the same key in R2.
 *
 * Format is preserved so the file extension (and therefore the URL) never
 * changes: jpg→jpg, png→png, webp→webp. GIF / AVIF / video objects are skipped.
 *
 * SAFETY: runs in DRY-RUN by default — it only reports what it would do.
 * Pass --apply to actually overwrite objects.
 *
 * Credentials: read from the environment, or auto-loaded from
 * apps/web/.env.production.local if not set. Needs:
 *   CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 *
 * USAGE (from repo root):
 *   node apps/web/scripts/recompress-r2-images.mjs               # dry-run, all images >1MB
 *   node apps/web/scripts/recompress-r2-images.mjs --apply       # actually rewrite
 *   node apps/web/scripts/recompress-r2-images.mjs --prefix=uploads/   # only this folder
 *   node apps/web/scripts/recompress-r2-images.mjs --min-mb=2 --max-dim=2000 --quality=80
 *   node apps/web/scripts/recompress-r2-images.mjs --limit=20 --apply  # process at most 20
 *
 * Flags:
 *   --apply           Write changes (default is dry-run)
 *   --prefix=STR      Only keys starting with STR (e.g. "uploads/")
 *   --min-mb=N        Only images at least N MB (default 1)
 *   --max-dim=N       Clamp longest edge to N px (default 2400)
 *   --quality=N       JPEG/WebP quality (default 82)
 *   --limit=N         Process at most N objects (0 = no limit)
 *   --concurrency=N   Parallel workers (default 4)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Parse flags ────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const flag = (name, def) => {
  const hit = argv.find(a => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return def
  const eq = hit.indexOf('=')
  return eq === -1 ? true : hit.slice(eq + 1)
}
const APPLY       = !!flag('apply', false)
const PREFIX      = String(flag('prefix', '') || '')
const MIN_BYTES   = Math.round(parseFloat(flag('min-mb', '1')) * 1024 * 1024)
const MAX_DIM     = parseInt(flag('max-dim', '2400'), 10)
const QUALITY     = parseInt(flag('quality', '82'), 10)
const LIMIT       = parseInt(flag('limit', '0'), 10)
const CONCURRENCY = Math.max(1, parseInt(flag('concurrency', '4'), 10))

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
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const IMG_RE = /\.(jpe?g|png|webp)$/i   // only formats we can safely rewrite in place
const fmtForExt = (key) => {
  const ext = key.toLowerCase().split('.').pop()
  if (ext === 'png')  return { enc: 'png',  type: 'image/png' }
  if (ext === 'webp') return { enc: 'webp', type: 'image/webp' }
  return { enc: 'jpeg', type: 'image/jpeg' } // jpg / jpeg
}
const mb = (n) => (n / 1048576).toFixed(2)

async function listAll() {
  const out = []
  let token
  do {
    const r = await r2.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: PREFIX || undefined, ContinuationToken: token, MaxKeys: 1000 }))
    for (const o of (r.Contents || [])) out.push({ key: o.Key, size: o.Size })
    token = r.IsTruncated ? r.NextContinuationToken : undefined
  } while (token)
  return out
}

async function recompress(obj) {
  const got = await r2.send(new GetObjectCommand({ Bucket: bucket, Key: obj.key }))
  const input = Buffer.from(await got.Body.transformToByteArray())
  const { enc, type } = fmtForExt(obj.key)

  let pipeline = sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
  if (enc === 'png')       pipeline = pipeline.png({ compressionLevel: 9, palette: true })
  else if (enc === 'webp') pipeline = pipeline.webp({ quality: QUALITY })
  else                     pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true })

  const output = await pipeline.toBuffer()
  if (output.byteLength >= obj.size) return { skipped: true, before: obj.size, after: obj.size }

  if (APPLY) {
    await r2.send(new PutObjectCommand({
      Bucket: bucket, Key: obj.key, Body: output, ContentType: type,
      CacheControl: 'public, max-age=31536000, immutable',
    }))
  }
  return { skipped: false, before: obj.size, after: output.byteLength }
}

async function main() {
  console.log(`\nR2 bucket: ${bucket}  |  mode: ${APPLY ? 'APPLY (will overwrite)' : 'DRY-RUN (no writes)'}`)
  console.log(`filters: prefix="${PREFIX || '(all)'}"  min=${mb(MIN_BYTES)}MB  max-dim=${MAX_DIM}px  quality=${QUALITY}${LIMIT ? `  limit=${LIMIT}` : ''}\n`)

  const all = await listAll()
  let targets = all.filter(o => IMG_RE.test(o.key) && o.size >= MIN_BYTES).sort((a, b) => b.size - a.size)
  if (LIMIT > 0) targets = targets.slice(0, LIMIT)
  console.log(`candidates: ${targets.length} images (of ${all.length} objects)\n`)
  if (!targets.length) { console.log('Nothing to do.'); return }

  let done = 0, changed = 0, before = 0, after = 0, failed = 0
  const queue = targets.slice()
  async function worker() {
    while (queue.length) {
      const obj = queue.shift()
      try {
        const r = await recompress(obj)
        before += r.before; after += r.after
        if (!r.skipped) { changed++; if (++done % 25 === 0 || targets.length < 40) console.log(`  ${mb(r.before).padStart(7)}MB → ${mb(r.after).padStart(7)}MB  ${obj.key}`) }
      } catch (e) {
        failed++
        console.warn(`  ! failed: ${obj.key} — ${e.message?.slice(0, 80)}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const saved = before - after
  console.log(`\n──────────────────────────────────────────────`)
  console.log(`would shrink: ${changed} images${failed ? `  (failed: ${failed})` : ''}`)
  console.log(`before: ${mb(before)} MB   after: ${mb(after)} MB   saved: ${mb(saved)} MB (${before ? Math.round(saved / before * 100) : 0}%)`)
  console.log(APPLY ? '\n✓ Done — objects overwritten in place. URLs unchanged.' : '\n(DRY-RUN — re-run with --apply to write these changes.)')
}

main().catch(e => { console.error('\n✗', e.message, '\n'); process.exit(1) })
