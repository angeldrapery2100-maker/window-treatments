import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { uploadToR2 } from '@/lib/r2'
import { compressImage } from '@/lib/image'

// Allowed MIME types → safe extensions (extension comes from this map, never from client filename)
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'video/mp4':  'mp4',
}

const MAX_SIZE_BYTES = 20 * 1024 * 1024  // 20 MB

// Only allow safe characters in productId to prevent path traversal
const SAFE_ID_RE = /^[a-zA-Z0-9_-]+$/

export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file      = formData.get('file') as File
    const productId = (formData.get('productId') as string || '').trim()

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // ── productId safety ─────────────────────────────────────────────────────
    if (!productId || !SAFE_ID_RE.test(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid productId — only alphanumeric characters, hyphens, and underscores are allowed' },
        { status: 400 }
      )
    }

    // ── File size check ──────────────────────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: `File too large (max ${MAX_SIZE_BYTES / 1024 / 1024} MB)` },
        { status: 400 }
      )
    }

    // ── MIME type whitelist — extension comes from map, never from client ────
    const safeExt = ALLOWED_TYPES[file.type]
    if (!safeExt) {
      return NextResponse.json(
        { success: false, error: `File type not allowed: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, MP4` },
        { status: 400 }
      )
    }

    const bytes  = await file.arrayBuffer()
    const raw    = Buffer.from(bytes)

    // Shrink/re-encode images before upload (no-op for videos / GIFs).
    // Phone-camera JPEGs can be 4000×3000 / 8MB; at display sizes 2400px
    // max and quality 82 is visually lossless and ~10× smaller.
    const compressed = await compressImage(raw, file.type)
    const filename   = `${Date.now()}-${Math.random().toString(36).slice(2)}.${compressed.extension}`
    const key        = `products/${productId}/${filename}`

    const url = await uploadToR2(key, compressed.buffer, compressed.contentType)

    if (compressed.finalBytes < compressed.originalBytes) {
      console.log(
        `[upload] compressed ${file.name}: ${(compressed.originalBytes / 1024).toFixed(0)}KB → ${(compressed.finalBytes / 1024).toFixed(0)}KB`,
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        url,
        filename,
        originalName: file.name,
        originalBytes: compressed.originalBytes,
        finalBytes: compressed.finalBytes,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
