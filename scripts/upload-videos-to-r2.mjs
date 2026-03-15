#!/usr/bin/env node
/**
 * Upload all gallery project videos from public/videos/projects/ to R2.
 * Run from the monorepo root:
 *
 *   node scripts/upload-videos-to-r2.mjs
 *
 * Requires these env vars (already in your .env.local):
 *   CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET_NAME, R2_PUBLIC_URL
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load env from apps/web/.env.local
config({ path: join(process.cwd(), 'apps/web/.env.local') })

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
const bucket    = process.env.R2_BUCKET_NAME
const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')

if (!accountId || !bucket || !publicUrl) {
  console.error('Missing R2 env vars. Make sure apps/web/.env.local has:')
  console.error('  CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL')
  process.exit(1)
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const videosDir = join(process.cwd(), 'apps/web/public/videos/projects')
const files = readdirSync(videosDir).filter(f => f.endsWith('.mov') || f.endsWith('.mp4'))

console.log(`Found ${files.length} video files to upload.\n`)

for (const file of files) {
  const key = `videos/projects/${file}`

  // Check if already uploaded
  try {
    await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    console.log(`✓ Already exists: ${key}`)
    continue
  } catch {
    // Not found, proceed to upload
  }

  const filePath = join(videosDir, file)
  const body = readFileSync(filePath)
  const contentType = file.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'
  const sizeMB = (body.length / 1024 / 1024).toFixed(1)

  console.log(`⬆ Uploading ${file} (${sizeMB} MB)...`)

  try {
    await r2.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }))
    console.log(`  ✓ Done: ${publicUrl}/${key}`)
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`)
  }
}

console.log('\nAll done! Now update DEFAULT_VIDEOS paths or use the R2 public URL prefix.')
console.log(`R2 base: ${publicUrl}/videos/projects/`)
