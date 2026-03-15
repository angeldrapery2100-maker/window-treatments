import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { r2 } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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

/**
 * Generate a presigned PUT URL for direct client → R2 upload.
 * This bypasses Vercel's 4.5 MB serverless body limit entirely.
 *
 * Body: { fileType: 'video'|'poster', contentType: string, fileSize: number }
 * Returns: { url: presigned PUT URL, publicUrl: final public URL }
 */
export async function POST(request: Request) {
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { fileType = 'video', contentType, fileSize } = await request.json()

    const isVideo = fileType === 'video'
    const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE

    if (!contentType || !allowedTypes[contentType]) {
      return NextResponse.json(
        { success: false, error: `不支持的文件类型: ${contentType}` },
        { status: 400 }
      )
    }

    if (fileSize > maxSize) {
      return NextResponse.json(
        { success: false, error: `文件太大 (最大 ${Math.round(maxSize / 1024 / 1024)} MB)` },
        { status: 400 }
      )
    }

    const ext = allowedTypes[contentType]
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const folder = isVideo ? 'gallery-videos' : 'gallery-posters'
    const key = `${folder}/${filename}`

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    })

    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 600 }) // 10 min

    const publicBase = process.env.R2_PUBLIC_URL!.replace(/\/$/, '')
    const publicUrl = `${publicBase}/${key}`

    return NextResponse.json({
      success: true,
      data: { presignedUrl, publicUrl, key, filename },
    })
  } catch (error: any) {
    console.error('Presign error:', error)
    return NextResponse.json(
      { success: false, error: '生成上传链接失败: ' + error.message },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
