// Validation for customer-attached chat photos (store assistant ② 图片上传).
//
// The client compresses photos in the browser (canvas, max side 1280px, JPEG)
// and sends them as data URLs on the LAST user message only — earlier turns
// never resend their images (the assistant's own previous text reply is the
// context), which keeps request bodies small and token costs flat. This module
// is the server-side gate: strict data-URL shape, an allowlist of raster media
// types the Anthropic API accepts, and hard size caps well under Vercel's
// ~4.5MB request-body limit.

export const MAX_IMAGES_PER_MESSAGE = 3
// Per-image / total base64 length caps (chars ≈ bytes × 4/3). A 1280px q0.8
// JPEG is typically 150-400KB binary → 200-550K chars, so these are generous.
export const MAX_IMAGE_B64_CHARS = 1_500_000
export const MAX_TOTAL_IMAGE_B64_CHARS = 3_000_000

const ALLOWED_MEDIA = ['jpeg', 'png', 'webp', 'gif'] as const
export type ChatImageMediaType = `image/${(typeof ALLOWED_MEDIA)[number]}`

export interface ParsedChatImage {
  mediaType: ChatImageMediaType
  /** Raw base64 payload (no data: prefix) — ready for the Anthropic image block. */
  data: string
}

const DATA_URL_RE = /^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/

export function parseChatImage(dataUrl: unknown): ParsedChatImage | null {
  if (typeof dataUrl !== 'string' || dataUrl.length > MAX_IMAGE_B64_CHARS) return null
  const m = dataUrl.match(DATA_URL_RE)
  if (!m) return null
  return { mediaType: `image/${m[1] as (typeof ALLOWED_MEDIA)[number]}`, data: m[2] }
}

export type ChatImagesResult = { images: ParsedChatImage[] } | { error: string }

// Validate the `images` field of an incoming chat message. Returns a
// user-presentable error string (the route passes it straight to bad()).
export function validateChatImages(v: unknown): ChatImagesResult {
  if (!Array.isArray(v)) return { error: 'images must be an array of data URLs.' }
  if (v.length === 0) return { images: [] }
  if (v.length > MAX_IMAGES_PER_MESSAGE) {
    return { error: `At most ${MAX_IMAGES_PER_MESSAGE} photos per message. 每条消息最多 ${MAX_IMAGES_PER_MESSAGE} 张照片。` }
  }
  const images: ParsedChatImage[] = []
  let total = 0
  for (const item of v) {
    if (typeof item === 'string' && item.length > MAX_IMAGE_B64_CHARS) {
      return { error: 'That photo is too large. Please try a smaller one. 照片太大，请换一张试试。' }
    }
    const parsed = parseChatImage(item)
    if (!parsed) return { error: 'Unsupported photo format — please use JPG or PNG. 图片格式不支持，请用 JPG 或 PNG。' }
    total += item.length
    if (total > MAX_TOTAL_IMAGE_B64_CHARS) {
      return { error: 'Photos are too large altogether. Please send fewer or smaller ones. 照片总体积太大，请少发几张或压缩后再试。' }
    }
    images.push(parsed)
  }
  return { images }
}
