import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { uploadToR2 } from '@/lib/r2'
import { compressImage } from '@/lib/image'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'video/mp4':  'mp4',
}

const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

export async function POST(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData  = await request.formData()
    const file      = formData.get('file') as File
    const productId = ((formData.get('productId') as string) || 'general').replace(/[^a-zA-Z0-9_-]/g, '')

    if (!file) {
      return NextResponse.json({ success: false, error: { message: '没有文件' } }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: { message: `File too large (max ${MAX_SIZE_BYTES / 1024 / 1024} MB)` } },
        { status: 400 }
      )
    }

    const safeExt = ALLOWED_TYPES[file.type]
    if (!safeExt) {
      return NextResponse.json(
        { success: false, error: { message: `File type not allowed: ${file.type}` } },
        { status: 400 }
      )
    }

    const bytes    = await file.arrayBuffer()
    const raw      = Buffer.from(bytes)

    // Shrink/re-encode images before upload (no-op for videos / GIFs). Since
    // the site serves R2 images directly (next/image unoptimized), this is
    // where optimisation happens — clamps to 2400px at quality 82.
    const compressed = await compressImage(raw, file.type)
    const filename   = `${Date.now()}-${Math.random().toString(36).slice(2)}.${compressed.extension}`
    const key        = `showcase/${productId}/${filename}`

    const url = await uploadToR2(key, compressed.buffer, compressed.contentType)

    if (compressed.finalBytes < compressed.originalBytes) {
      console.log(
        `[showcase upload] compressed ${file.name}: ${(compressed.originalBytes / 1024).toFixed(0)}KB → ${(compressed.finalBytes / 1024).toFixed(0)}KB`,
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
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: '上传失败: ' + (error instanceof Error ? error.message : String(error)) } }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
