#!/usr/bin/env node
/**
 * Push the fabric swatch derivatives to R2.
 *
 *   node apps/web/scripts/upload-fabric-images.mjs            # upload what's missing
 *   node apps/web/scripts/upload-fabric-images.mjs --dry-run  # just count
 *   node apps/web/scripts/upload-fabric-images.mjs --verify   # ask R2 rather than trusting the local manifest
 *   node apps/web/scripts/upload-fabric-images.mjs --force    # re-upload everything
 *
 * Source:  $FABRIC_WEBP_DIR (default ../outputs/fabric_webp), produced by
 *          outputs/fabric_webp/make_webp.py — thumb/ and large/ WebP pairs.
 * Target:  r2://$R2_BUCKET_NAME/fabric-swatches/{thumb,large}/<key>.webp, which is what
 *          fabricImageUrl() in draperyFabricLibrary.ts builds URLs for.
 *
 * Needs the same four variables as apps/web/src/lib/r2.ts:
 *   CLOUDFLARE_ACCOUNT_ID  R2_ACCESS_KEY_ID  R2_SECRET_ACCESS_KEY  R2_BUCKET_NAME
 * (`vercel env pull` writes them into apps/web/.env.production.local.)
 *
 * INCREMENTAL BY DESIGN. Successful keys are recorded in .uploaded.json beside
 * the images, so a re-run after adding fabrics only sends the new ones and an
 * interrupted run picks up where it stopped. There are ~21,000 objects; you do
 * not want to do this twice by accident.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '../../..')
const SRC = process.env.FABRIC_WEBP_DIR || path.resolve(REPO, '../outputs/fabric_webp')
const MANIFEST = path.join(SRC, '.uploaded.json')
const PREFIX = 'fabric-swatches'
const CONCURRENCY = Number(process.env.UPLOAD_CONCURRENCY || 24)

const argv = new Set(process.argv.slice(2))
const dryRun = argv.has('--dry-run')
const verify = argv.has('--verify')
const force = argv.has('--force')

for (const v of ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']) {
  if (!process.env[v] && !dryRun) {
    console.error(`Missing ${v}. Run \`vercel env pull\` in apps/web, then:\n  set -a && . apps/web/.env.production.local && set +a`)
    process.exit(1)
  }
}

const bucket = process.env.R2_BUCKET_NAME
const r2 = dryRun ? null : new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile() && entry.name.endsWith('.webp')) out.push(full)
  }
  return out
}

const readManifest = () => {
  if (force) return {}
  try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) } catch { return {} }
}

async function main() {
  for (const size of ['thumb', 'large']) {
    if (!fs.existsSync(path.join(SRC, size))) {
      console.error(`No ${size}/ under ${SRC} — run outputs/fabric_webp/make_webp.py first.`)
      process.exit(1)
    }
  }

  const files = ['thumb', 'large'].flatMap((size) =>
    walk(path.join(SRC, size)).map((file) => ({
      file,
      size: fs.statSync(file).size,
      key: `${PREFIX}/${path.relative(SRC, file).split(path.sep).join('/')}`,
    }))
  )

  const manifest = readManifest()
  const pending = files.filter((f) => manifest[f.key] !== f.size)
  const bytes = pending.reduce((n, f) => n + f.size, 0)

  console.log(`${files.length} objects on disk · ${pending.length} to upload · ${(bytes / 1e9).toFixed(2)} GB`)
  console.log(`target: r2://${bucket || '<unset>'}/${PREFIX}/…`)
  if (dryRun) return
  if (!pending.length) { console.log('Nothing to do.'); return }

  let done = 0, failed = 0, skipped = 0
  let cursor = 0
  const started = Date.now()

  const flush = () => fs.writeFileSync(MANIFEST, JSON.stringify(manifest))

  async function worker() {
    while (cursor < pending.length) {
      const item = pending[cursor++]
      try {
        if (verify) {
          // Trust R2 over the local manifest — useful after a manifest is lost.
          try {
            const head = await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: item.key }))
            if (head.ContentLength === item.size) {
              manifest[item.key] = item.size; skipped++; done++
              continue
            }
          } catch { /* not there — fall through and upload */ }
        }
        await r2.send(new PutObjectCommand({
          Bucket: bucket,
          Key: item.key,
          Body: fs.createReadStream(item.file),
          ContentLength: item.size,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        }))
        manifest[item.key] = item.size
        done++
      } catch (err) {
        failed++
        console.error(`  ✗ ${item.key}: ${String(err).slice(0, 120)}`)
      }
      if (done % 500 === 0) {
        flush()
        const rate = done / ((Date.now() - started) / 1000)
        const left = Math.round((pending.length - done) / Math.max(rate, 0.1) / 60)
        console.log(`  ${done}/${pending.length} · ${rate.toFixed(0)}/s · ~${left} min left`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  flush()
  console.log(`\nDone: ${done - failed - skipped} uploaded, ${skipped} already present, ${failed} failed.`)
  console.log(`Spot-check: ${process.env.NEXT_PUBLIC_CDN_URL || '<NEXT_PUBLIC_CDN_URL>'}/${pending[0].key}`)
  if (failed) process.exitCode = 1
}

main().catch((err) => { console.error(err); process.exit(1) })
