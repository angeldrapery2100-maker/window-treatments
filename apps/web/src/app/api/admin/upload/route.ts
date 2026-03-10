import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { uploadToR2 } from '@/lib/r2'

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

    const bytes    = await file.arrayBuffer()
    const buffer   = Buffer.from(bytes)
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`
    const key      = `products/${productId}/${filename}`

    const url = await uploadToR2(key, buffer, file.type)

    return NextResponse.json({ success: true, data: { url, filename, originalName: file.name } })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed: ' + error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
