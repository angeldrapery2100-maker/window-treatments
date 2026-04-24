import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { uploadToR2 } from '@/lib/r2'
import { compressImage } from '@/lib/image'

// Allowed MIME types and their safe extensions
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg':      'jpg',
  'image/jpg':       'jpg',
  'image/png':       'png',
  'image/webp':      'webp',
  'image/gif':       'gif',
  'video/mp4':       'mp4',
  'video/quicktime': 'mov',
  'video/webm':      'webm',
}

const MAX_IMAGE_SIZE = 20 * 1024 * 1024   // 20 MB for images
const MAX_VIDEO_SIZE = 200 * 1024 * 1024  // 200 MB for videos

export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file    = formData.get('file') as File
    const page    = ((formData.get('page')    as string) || 'general').replace(/[^a-z0-9_-]/gi, '')
    const section = ((formData.get('section') as string) || 'misc').replace(/[^a-z0-9_-]/gi, '')

    if (!file) {
      return NextResponse.json({ success: false, error: { message: 'No file provided' } }, { status: 400 })
    }

    // Size check — videos get a higher limit
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: { message: `File too large (max ${Math.round(maxSize / 1024 / 1024)} MB)` } },
        { status: 400 }
      )
    }

    // Type whitelist — extension comes from the whitelist, NOT the original filename
    const safeExt = ALLOWED_TYPES[file.type]
    if (!safeExt) {
      return NextResponse.json(
        { success: false, error: { message: `File type not allowed: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, MP4, MOV, WebM` } },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const raw   = Buffer.from(bytes)

    // Re-encode / resize images before upload. Videos pass through untouched.
    const compressed = await compressImage(raw, file.type)
    const filename   = `${Date.now()}-${Math.random().toString(36).slice(2)}.${compressed.extension}`
    const key        = `site/${page}/${filename}`

    const url = await uploadToR2(key, compressed.buffer, compressed.contentType)

    if (compressed.finalBytes < compressed.originalBytes) {
      console.log(
        `[site-content upload] compressed ${file.name}: ${(compressed.originalBytes / 1024).toFixed(0)}KB → ${(compressed.finalBytes / 1024).toFixed(0)}KB`,
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
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Upload failed: ' + error.message } },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
