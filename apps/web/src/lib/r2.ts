/**
 * Cloudflare R2 upload utility
 * R2 is S3-compatible, so we use @aws-sdk/client-s3.
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID   – found in Cloudflare dashboard > R2
 *   R2_ACCESS_KEY_ID        – R2 API token (Access Key ID)
 *   R2_SECRET_ACCESS_KEY    – R2 API token (Secret Access Key)
 *   R2_BUCKET_NAME          – name of your R2 bucket
 *
 * Note on public URLs:
 *   We no longer serve assets from pub-xxx.r2.dev — that subdomain is
 *   rate-limited and returns 503 under production load. Instead, upload
 *   helpers return a relative /media/<key> path that is served by the
 *   Next.js route at src/app/media/[...path]/route.ts (proxied through
 *   the R2 S3 API + cached at Vercel Edge).
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
const bucket    = process.env.R2_BUCKET_NAME!

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

/**
 * Upload a buffer to R2.
 * @param key  The storage path, e.g. "products/abc123/image.webp"
 * @param body The file buffer
 * @param contentType MIME type, e.g. "image/webp"
 * @returns A site-relative URL under /media/ that the proxy route will serve.
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key:    key,
    Body:   body,
    ContentType: contentType,
  }))

  // Served by /media/[...path]/route.ts → R2 S3 GetObject, edge-cached.
  return `/media/${key}`
}

/**
 * Delete a file from R2 by its /media/ URL, legacy pub-xxx.r2.dev URL,
 * or bare storage key.
 */
export async function deleteFromR2(keyOrUrl: string): Promise<void> {
  let key = keyOrUrl

  if (key.startsWith('/media/')) {
    key = key.slice('/media/'.length)
  } else if (key.startsWith('http://') || key.startsWith('https://')) {
    // Legacy pub-xxx.r2.dev or custom-domain URLs — strip scheme+host.
    try {
      const u = new URL(key)
      key = u.pathname.replace(/^\/+/, '')
    } catch {
      // Fall through with the original string if it somehow isn't a URL.
    }
  }

  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
