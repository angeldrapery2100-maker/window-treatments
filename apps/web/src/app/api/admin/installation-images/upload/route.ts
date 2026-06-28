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
}

const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

export async function POST(request: Request) {
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData    = await request.formData()
    const file        = formData.get('file') as File
    const productType = ((formData.get('productType') as string) || 'general').replace(/[^a-zA-Z0-9_-]/g, '')

    if (!file) {
      return NextResponse.json({ success: false, error: { message: '请选择文件' } }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: { message: `文件太大 (最大 ${MAX_SIZE_BYTES / 1024 / 1024} MB)` } },
        { status: 400 }
      )
    }

    const safeExt = ALLOWED_TYPES[file.type]
    if (!safeExt) {
      return NextResponse.json(
        { success: false, error: { message: `不支持的文件类型: ${file.type}` } },
        { status: 400 }
      )
    }

    const bytes    = await file.arrayBuffer()
    const raw      = Buffer.from(bytes)

    // Shrink/re-encode images before upload (no-op for GIFs). Phone-camera
    // JPEGs can be 4000×3000 / 8MB; clamped to 2400px at quality 82 they are
    // visually identical and ~10× smaller. Since the site serves R2 images
    // directly (next/image unoptimized), this is where optimisation happens.
    const compressed = await compressImage(raw, file.type)
    const filename   = `${Date.now()}-${Math.random().toString(36).slice(2)}.${compressed.extension}`
    const key        = `installations/${productType}/${filename}`

    const url = await uploadToR2(key, compressed.buffer, compressed.contentType)

    if (compressed.finalBytes < compressed.originalBytes) {
      console.log(
        `[installation-images upload] compressed ${file.name}: ${(compressed.originalBytes / 1024).toFixed(0)}KB → ${(compressed.finalBytes / 1024).toFixed(0)}KB`,
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
