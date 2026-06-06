#!/usr/bin/env node
/**
 * optimize-media.mjs — one-shot media optimizer for apps/web/public.
 *
 * WHY: public/ ships ~5.6 GB of un-optimized originals (994 images > 1 MB,
 * 16 QuickTime .mov clips of 43–536 MB). This script produces web-optimized
 * copies WITHOUT touching the originals, so you can review, then swap them in
 * / re-upload to R2.
 *
 * WHAT IT DOES (non-destructive — writes to apps/web/public-optimized/):
 *   Images (.png/.jpg/.jpeg above a size threshold):
 *     → .avif (q50) and .webp (q75), capped at 2048px on the long edge.
 *   Videos (.mov/.mp4/.webm):
 *     → H.264 .mp4 (crf 23, ≤1080p, faststart) + VP9 .webm + a poster .jpg.
 *
 * REQUIREMENTS:
 *   - ffmpeg + ffprobe on PATH        (brew install ffmpeg)
 *   - sharp (already a dependency of apps/web)
 *
 * USAGE (from repo root):
 *   node scripts/optimize-media.mjs            # images + videos
 *   node scripts/optimize-media.mjs --images   # images only
 *   node scripts/optimize-media.mjs --videos   # videos only
 *   node scripts/optimize-media.mjs --dry-run  # list what would be done
 *
 * After reviewing public-optimized/, either copy the files over the originals
 * (keep a backup!) or re-run your R2 upload pointed at the optimized tree.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')
const SRC = path.join(REPO, 'apps/web/public')
const OUT = path.join(REPO, 'apps/web/public-optimized')

const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry-run')
const ONLY_IMAGES = args.has('--images')
const ONLY_VIDEOS = args.has('--videos')
const doImages = !ONLY_VIDEOS
const doVideos = !ONLY_IMAGES

// Only re-encode images larger than this (bytes). Small icons are left alone.
const IMAGE_MIN_BYTES = 150 * 1024
const MAX_EDGE = 2048

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg'])
const VIDEO_EXT = new Set(['.mov', '.mp4', '.webm', '.m4v'])

let sharp
async function loadSharp() {
  if (sharp) return sharp
  try {
    // Resolve sharp from the web app where it's already installed.
    const mod = await import(path.join(REPO, 'apps/web/node_modules/sharp/lib/index.js'))
    sharp = mod.default || mod
  } catch {
    sharp = (await import('sharp')).default
  }
  return sharp
}

function run(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, cmdArgs, { stdio: ['ignore', 'ignore', 'pipe'] })
    let err = ''
    p.stderr.on('data', (d) => (err += d))
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}: ${err.slice(-400)}`))))
    p.on('error', reject)
  })
}

async function* walk(dir) {
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (full.startsWith(OUT)) continue // never recurse into our own output
      yield* walk(full)
    } else {
      yield full
    }
  }
}

function fmtMB(n) { return (n / 1024 / 1024).toFixed(1) + ' MB' }

async function ensureDir(file) { await fs.mkdir(path.dirname(file), { recursive: true }) }

let savedBytes = 0
let imgCount = 0
let vidCount = 0

async function optimizeImage(file) {
  const stat = await fs.stat(file)
  if (stat.size < IMAGE_MIN_BYTES) return
  const rel = path.relative(SRC, file)
  const base = rel.replace(/\.(png|jpe?g)$/i, '')
  const avifOut = path.join(OUT, base + '.avif')
  const webpOut = path.join(OUT, base + '.webp')

  if (DRY) { console.log(`[img] ${rel} (${fmtMB(stat.size)}) → .avif + .webp`); imgCount++; return }

  const s = await loadSharp()
  await ensureDir(avifOut)
  const pipeline = s(file).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
  await pipeline.clone().avif({ quality: 50 }).toFile(avifOut)
  await pipeline.clone().webp({ quality: 75 }).toFile(webpOut)

  const after = (await fs.stat(avifOut)).size
  savedBytes += Math.max(0, stat.size - after)
  imgCount++
  console.log(`[img] ${rel}  ${fmtMB(stat.size)} → ${fmtMB(after)} (avif)`)
}

async function optimizeVideo(file) {
  const stat = await fs.stat(file)
  const rel = path.relative(SRC, file)
  const base = rel.replace(/\.(mov|mp4|webm|m4v)$/i, '')
  const mp4Out = path.join(OUT, base + '.mp4')
  const webmOut = path.join(OUT, base + '.webm')
  const posterOut = path.join(OUT, base + '-poster.jpg')

  if (DRY) { console.log(`[vid] ${rel} (${fmtMB(stat.size)}) → .mp4 + .webm + poster`); vidCount++; return }

  await ensureDir(mp4Out)
  // Fit within a 1920x1920 box, keep aspect, only downscale, even dimensions.
  // NOTE: passed without a shell, so the filter must contain NO commas/quotes
  // (commas would be read as filtergraph separators) — this box form avoids that.
  const scaleFilter = 'scale=1920:1920:force_original_aspect_ratio=decrease:force_divisible_by=2'
  // H.264 MP4, faststart for instant playback.
  await run('ffmpeg', ['-y', '-i', file,
    '-vf', scaleFilter,
    '-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-an', mp4Out])
  // VP9 WebM (smaller, modern browsers).
  await run('ffmpeg', ['-y', '-i', file,
    '-vf', scaleFilter,
    '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-an', webmOut])
  // Poster frame at 0.5s.
  await run('ffmpeg', ['-y', '-ss', '0.5', '-i', file, '-frames:v', '1', '-q:v', '4', posterOut])

  const after = (await fs.stat(mp4Out)).size
  savedBytes += Math.max(0, stat.size - after)
  vidCount++
  console.log(`[vid] ${rel}  ${fmtMB(stat.size)} → ${fmtMB(after)} (mp4)`)
}

async function main() {
  console.log(`Source : ${SRC}`)
  console.log(`Output : ${OUT}${DRY ? '  (DRY RUN)' : ''}\n`)
  for await (const file of walk(SRC)) {
    const ext = path.extname(file).toLowerCase()
    try {
      if (doImages && IMAGE_EXT.has(ext)) await optimizeImage(file)
      else if (doVideos && VIDEO_EXT.has(ext)) await optimizeVideo(file)
    } catch (e) {
      console.error(`  ✗ ${path.relative(SRC, file)}: ${e.message}`)
    }
  }
  console.log(`\nDone. images=${imgCount} videos=${vidCount} est. saved≈${fmtMB(savedBytes)}`)
  if (!DRY) console.log(`Review ${path.relative(REPO, OUT)}/ then swap in or re-upload to R2.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
