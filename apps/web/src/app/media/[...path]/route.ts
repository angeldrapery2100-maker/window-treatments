/**
 * /media/[...path] — R2 proxy route.
 *
 * Why this exists:
 *   Cloudflare's *.r2.dev public subdomain is a development-only endpoint
 *   with aggressive rate limits. Under real site traffic it returns 503 for
 *   every static asset. Moving DNS to Cloudflare to bind a custom domain
 *   isn't possible right now (angel-drapery.com NS is on Vercel).
 *
 *   Instead we fetch objects via R2's S3 API (no rate limit) through this
 *   Next.js route, and rely on Vercel's Edge Network to cache the bytes
 *   for a year. Cold request does ~1 extra hop; warm requests hit the edge.
 *
 * Usage:
 *   <img src="/media/site/home/1770000000-abcd.webp" />
 *   <video src="/media/site/home/1770000000-abcd.mp4" />
 *
 * Response:
 *   200 with the object body, correct Content-Type, and a long immutable
 *   Cache-Control. 404 if the key isn't in the bucket. 500 on any other
 *   R2 error.
 */

import { NextResponse } from 'next/server'
import { r2 } from '@/lib/r2'
import { GetObjectCommand, NoSuchKey } from '@aws-sdk/client-s3'

// Vercel: keep this on the Node runtime so the AWS SDK works cleanly.
// We rely on the Cache-Control headers below (not Next.js's static cache) so
// Vercel's Edge caches warm responses without us having to list every key up
// front.
export const runtime = 'nodejs'

// Defense-in-depth: only allow proxying objects under known top-level prefixes,
// so this route can never be used to enumerate/exfiltrate other objects if a
// non-public key ever lands in the bucket. Override via MEDIA_ALLOWED_PREFIXES
// (comma-separated) if new collections are added.
const DEFAULT_PREFIXES = [
  'site', 'products', 'uploads',
  'gallery-videos', 'gallery-posters',
  'roller', 'sheer', 'luma', 'lutron', 'zebra', 'shangrila', 'roman', 'hunter-douglas',
]
const ALLOWED_PREFIXES = new Set(
  (process.env.MEDIA_ALLOWED_PREFIXES
    ? process.env.MEDIA_ALLOWED_PREFIXES.split(',').map((p) => p.trim()).filter(Boolean)
    : DEFAULT_PREFIXES)
)

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(_request: Request, ctx: Ctx) {
  const { path } = await ctx.params

  if (!path || path.length === 0) {
    return NextResponse.json({ error: 'Missing object key' }, { status: 400 })
  }

  // Reject traversal / empty segments. R2 keys don't use ".." and we
  // don't want surprises from URL-decoding.
  for (const seg of path) {
    if (!seg || seg === '..' || seg.includes('\0')) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
    }
  }

  // Enforce the top-level prefix allowlist.
  if (!ALLOWED_PREFIXES.has(path[0])) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const key = path.join('/')
  const bucket = process.env.R2_BUCKET_NAME

  if (!bucket) {
    console.error('[media proxy] R2_BUCKET_NAME is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: bucket, Key: key }))

    if (!obj.Body) {
      return NextResponse.json({ error: 'Empty body from R2' }, { status: 502 })
    }

    const contentType = obj.ContentType || 'application/octet-stream'
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      // Cache at Vercel Edge + browsers for a year. Our upload keys are
      // timestamp-based so they're effectively immutable — updates get a
      // new key anyway.
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    }

    if (obj.ContentLength != null) headers['Content-Length'] = String(obj.ContentLength)
    if (obj.ETag) headers['ETag'] = obj.ETag
    if (obj.LastModified) headers['Last-Modified'] = obj.LastModified.toUTCString()
    // Let the browser do range requests for <video> scrubbing etc.
    headers['Accept-Ranges'] = 'bytes'

    // obj.Body is a Readable stream in Node. NextResponse accepts a
    // ReadableStream<Uint8Array>; cast through `any` since the SDK types
    // aren't precise about which stream flavor it hands back.
    return new NextResponse(obj.Body as any, { status: 200, headers })
  } catch (err: any) {
    if (err instanceof NoSuchKey || err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('[media proxy] R2 error for key', key, err)
    return NextResponse.json({ error: 'R2 fetch failed' }, { status: 500 })
  }
}
