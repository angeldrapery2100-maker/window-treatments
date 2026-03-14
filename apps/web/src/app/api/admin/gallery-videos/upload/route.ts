import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { uploadToR2 } from '@/lib/r2'

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  'video/mp4':       'mp4',
  'video/quicktime': 'mov',
  'video/webm':      'webm',
  'video/x-msvideo': 'avi',
}

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
}

const MAX_VIDEO_SIZE = 200 * 1024 * 1024  // 200 MB
const MAX_IMAGE_SIZE = 20 * 1024 * 1024   // 20 MB

export async function POST(request: Request) {
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = (formData.get('fileType') as string) || 'video' // 'video' or 'poster'

    if (!file) {
      return NextResponse.json({ success: false, error: { message: '请选择文件' } }, { status: 400 })
    }

    const isVideo = fileType === 'video'
    const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE

    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: { message: `文件太大 (最大 ${Math.round(maxSize / 1024 / 1024)} MB)` } },
        { status: 400 }
      )
    }

    const safeExt = allowedTypes[file.type]
    if (!safeExt) {
      return NextResponse.json(
        { success: false, error: { message: `不支持的文件类型: ${file.type}` } },
        { status: 400 }
      )
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`
    const folder = isVideo ? 'gallery-videos' : 'gallery-posters'
    const key = `${folder}/${filename}`

    const url = await uploadToR2(key, buffer, file.type)

    return NextResponse.json({
      success: true,
      data: { url, filename, originalName: file.name }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: '上传失败: ' + error.message } }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
