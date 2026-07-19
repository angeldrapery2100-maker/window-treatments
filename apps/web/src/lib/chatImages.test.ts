import { describe, it, expect } from 'vitest'
import {
  parseChatImage,
  validateChatImages,
  MAX_IMAGES_PER_MESSAGE,
  MAX_IMAGE_B64_CHARS,
  MAX_TOTAL_IMAGE_B64_CHARS,
} from './chatImages'

const jpeg = (payload = 'aGVsbG8=') => `data:image/jpeg;base64,${payload}`

describe('parseChatImage', () => {
  it('parses a valid jpeg data URL into media type + raw base64', () => {
    expect(parseChatImage(jpeg())).toEqual({ mediaType: 'image/jpeg', data: 'aGVsbG8=' })
  })

  it('accepts png/webp/gif', () => {
    for (const t of ['png', 'webp', 'gif']) {
      expect(parseChatImage(`data:image/${t};base64,aGVsbG8=`)).toEqual({
        mediaType: `image/${t}`,
        data: 'aGVsbG8=',
      })
    }
  })

  it('rejects non-strings, non-data-URLs, svg, and malformed base64', () => {
    expect(parseChatImage(42)).toBeNull()
    expect(parseChatImage('https://example.com/x.jpg')).toBeNull()
    expect(parseChatImage('data:image/svg+xml;base64,aGVsbG8=')).toBeNull()
    expect(parseChatImage('data:image/jpeg;base64,not!!valid@@')).toBeNull()
  })

  it('rejects oversize images', () => {
    expect(parseChatImage(jpeg('A'.repeat(MAX_IMAGE_B64_CHARS)))).toBeNull()
  })
})

describe('validateChatImages', () => {
  it('passes a small valid batch through', () => {
    const r = validateChatImages([jpeg(), jpeg('d29ybGQ=')])
    expect('images' in r && r.images.length).toBe(2)
  })

  it('empty array is fine (no images)', () => {
    expect(validateChatImages([])).toEqual({ images: [] })
  })

  it('rejects non-arrays', () => {
    expect('error' in validateChatImages('nope')).toBe(true)
  })

  it('rejects more than the per-message cap', () => {
    const r = validateChatImages(Array(MAX_IMAGES_PER_MESSAGE + 1).fill(jpeg()))
    expect('error' in r).toBe(true)
  })

  it('rejects a single oversize photo with a size-specific message', () => {
    const r = validateChatImages([jpeg('A'.repeat(MAX_IMAGE_B64_CHARS))])
    expect('error' in r && /too large|太大/.test((r as { error: string }).error)).toBe(true)
  })

  it('rejects when the batch total exceeds the aggregate cap', () => {
    const per = 'A'.repeat(MAX_IMAGE_B64_CHARS - 100)
    const r = validateChatImages([jpeg(per), jpeg(per), jpeg(per)])
    expect('error' in r).toBe(true)
    expect(MAX_TOTAL_IMAGE_B64_CHARS).toBeLessThan(3 * MAX_IMAGE_B64_CHARS)
  })

  it('rejects a batch containing one bad format', () => {
    const r = validateChatImages([jpeg(), 'data:image/tiff;base64,aGVsbG8='])
    expect('error' in r).toBe(true)
  })
})
