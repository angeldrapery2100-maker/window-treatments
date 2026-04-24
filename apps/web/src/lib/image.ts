import sharp from 'sharp'

/**
 * Compress and resize an uploaded image buffer before it hits R2.
 *
 * Why: admin uploads often come straight off a phone camera (4032×3024,
 * ~8 MB JPEGs). Serving those to every homepage visitor is why LCP was
 * measured >6 s on mobile. This clamps images to sensible max dimensions
 * and re-encodes at quality 82, which typically yields 90%+ size reduction
 * with no visible quality loss at display sizes.
 *
 * Behaviour:
 *   - Images ≤ `maxDim` on both sides are only re-encoded (EXIF stripped,
 *     mozjpeg/WebP quality 82). No upscaling.
 *   - Non-image content-types (video/*, gif, webp animation) are returned
 *     untouched — sharp can't losslessly re-encode animated formats.
 *   - GIFs are passed through unchanged so animations keep working.
 *   - Any sharp failure (corrupt file, unsupported format) returns the
 *     original buffer so we never block an upload on compression errors.
 */
export interface CompressResult {
  buffer: Buffer
  contentType: string
  extension: string
  originalBytes: number
  finalBytes: number
}

export async function compressImage(
  input: Buffer,
  contentType: string,
  opts: { maxDim?: number; quality?: number } = {},
): Promise<CompressResult> {
  const maxDim = opts.maxDim ?? 2400
  const quality = opts.quality ?? 82
  const originalBytes = input.byteLength

  // Videos and GIFs pass through unchanged.
  if (!contentType.startsWith('image/') || contentType === 'image/gif') {
    return {
      buffer: input,
      contentType,
      extension: contentTypeToExt(contentType) ?? 'bin',
      originalBytes,
      finalBytes: originalBytes,
    }
  }

  try {
    const pipeline = sharp(input, { failOn: 'none' })
      .rotate() // honour EXIF orientation before stripping metadata
      .resize({
        width: maxDim,
        height: maxDim,
        fit: 'inside',
        withoutEnlargement: true,
      })

    // Preserve PNG for images with transparency; otherwise prefer JPEG
    // (smaller, universally supported). Client-side next/image will still
    // negotiate AVIF/WebP at serve time.
    let output: Buffer
    let outType: string
    let outExt: string
    if (contentType === 'image/png') {
      output = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
      outType = 'image/png'
      outExt = 'png'
    } else if (contentType === 'image/webp') {
      output = await pipeline.webp({ quality }).toBuffer()
      outType = 'image/webp'
      outExt = 'webp'
    } else {
      // Default → JPEG with mozjpeg encoder
      output = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
      outType = 'image/jpeg'
      outExt = 'jpg'
    }

    // If for some reason recompression made the file larger (rare; small
    // already-optimised images), keep the original.
    if (output.byteLength >= originalBytes) {
      return {
        buffer: input,
        contentType,
        extension: contentTypeToExt(contentType) ?? outExt,
        originalBytes,
        finalBytes: originalBytes,
      }
    }

    return {
      buffer: output,
      contentType: outType,
      extension: outExt,
      originalBytes,
      finalBytes: output.byteLength,
    }
  } catch (e) {
    // Never fail the upload on a compression error — serve the original.
    console.warn('[compressImage] sharp failed, using original:', (e as any)?.message)
    return {
      buffer: input,
      contentType,
      extension: contentTypeToExt(contentType) ?? 'bin',
      originalBytes,
      finalBytes: originalBytes,
    }
  }
}

function contentTypeToExt(ct: string): string | null {
  switch (ct) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'video/mp4':
      return 'mp4'
    case 'video/quicktime':
      return 'mov'
    case 'video/webm':
      return 'webm'
    default:
      return null
  }
}
