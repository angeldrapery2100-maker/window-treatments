/**
 * Cloudflare R2 upload utility
 * R2 is S3-compatible, so we use @aws-sdk/client-s3.
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID   – found in Cloudflare dashboard > R2
 *   R2_ACCESS_KEY_ID        – R2 API token (Access Key ID)
 *   R2_SECRET_ACCESS_KEY    – R2 API token (Secret Access Key)
 *   R2_BUCKET_NAME          – name of your R2 bucket
 *   R2_PUBLIC_URL           – public URL for the bucket, e.g. https://pub-xxx.r2.dev
 *                             (or your custom domain if you set one)
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
 * @returns The public URL of the uploaded file
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

  const publicBase = process.env.R2_PUBLIC_URL!.replace(/\/$/, '')
  return `${publicBase}/${key}`
}

/**
 * Delete a file from R2 by its public URL or storage key.
 */
export async function deleteFromR2(keyOrUrl: string): Promise<void> {
  // Strip the public base URL if a full URL was passed
  const publicBase = process.env.R2_PUBLIC_URL!.replace(/\/$/, '')
  const key = keyOrUrl.startsWith(publicBase)
    ? keyOrUrl.slice(publicBase.length + 1)
    : keyOrUrl

  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
