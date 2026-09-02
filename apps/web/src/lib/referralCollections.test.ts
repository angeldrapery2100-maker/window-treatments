import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  parseCollection,
  collectionCards,
  referralLandingPath,
  slugsNeedingCover,
  HANDCRAFTED_CARDS,
  VALUE_CARDS,
  DESIGNER_CARDS,
} from './referralCollections'
import { PARTNER_LINES } from './partnerLines'

const PUBLIC_DIR = join(__dirname, '..', '..', 'public')

const PARTNER_SLUGS = [
  'jc-cambridge-shutter',
  'jc-woven-wood-shade',
  'sundance-roller-shade',
  'sundance-wood-blind',
]
const LUMA_SLUGS = ['luma-collection', 'roller-collection', 'sheer-collection']
const HD_SLUGS = ['silhouette', 'duette', 'pirouette', 'luminette']
const LUTRON_SLUGS = ['lutron-palladiom', 'triathlon-roller-shades']

describe('parseCollection', () => {
  it('falls back to value for undefined, empty, unknown, and an array whose only value is designer becomes designer', () => {
    expect(parseCollection(undefined)).toBe('value')
    expect(parseCollection('')).toBe('value')
    expect(parseCollection('x')).toBe('value')
    expect(parseCollection(['designer'])).toBe('designer')
  })
})

describe('collectionCards', () => {
  it('returns the exact same HANDCRAFTED_CARDS array reference for both collections', () => {
    const valueTop = collectionCards('value').top
    const designerTop = collectionCards('designer').top
    expect(valueTop).toBe(designerTop)
    expect(valueTop).toBe(HANDCRAFTED_CARDS)
  })

  it('locks the handcrafted card order: drapery, roman-shade, top-treatment', () => {
    const slugs = collectionCards('value').top.map((c) => c.slug)
    expect(slugs).toEqual(['handcrafted-drapery', 'handcrafted-roman-shade', 'handcrafted-top-treatment'])
  })
})

describe('VALUE_CARDS / DESIGNER_CARDS composition', () => {
  it('VALUE_CARDS is exactly Luma three + partner four, no duplicates, 7 total', () => {
    const slugs = VALUE_CARDS.map((c) => c.slug)
    expect(slugs).toHaveLength(7)
    expect(new Set(slugs).size).toBe(7)
    expect(new Set(slugs)).toEqual(new Set([...LUMA_SLUGS, ...PARTNER_SLUGS]))
  })

  it('DESIGNER_CARDS is exactly HD four + Lutron two, no duplicates, 6 total', () => {
    const slugs = DESIGNER_CARDS.map((c) => c.slug)
    expect(slugs).toHaveLength(6)
    expect(new Set(slugs).size).toBe(6)
    expect(new Set(slugs)).toEqual(new Set([...HD_SLUGS, ...LUTRON_SLUGS]))
  })
})

describe('partner-line warranty tags', () => {
  it('each partner card tag names its real lead time and "limited lifetime", never a specific year count', () => {
    for (const slug of PARTNER_SLUGS) {
      const card = VALUE_CARDS.find((c) => c.slug === slug)!
      const leadTime = PARTNER_LINES[slug].leadTime
      expect(card.tagEn).toContain(leadTime)
      expect(card.tagEn.toLowerCase()).toContain('limited lifetime')
      // warrantyPoints 里的具体年限(如 "10 years")绝不能被搬上卡片——那些
      // 年限只适用于特定部件,写在卡片上等于对整件产品做了错误的保修承诺。
      expect(card.tagEn).not.toMatch(/\d+\s*years?/i)
    }
  })
})

describe('card hrefs and image assets', () => {
  const allCards = [...HANDCRAFTED_CARDS, ...VALUE_CARDS, ...DESIGNER_CARDS]

  it('every card href starts with /products/', () => {
    for (const card of allCards) {
      expect(card.href.startsWith('/products/')).toBe(true)
    }
  })

  it('every static image path exists under apps/web/public, and every external image is https', () => {
    for (const card of allCards) {
      if (card.image === null) continue
      if (/^https?:\/\//.test(card.image)) {
        expect(card.image.startsWith('https://')).toBe(true)
      } else {
        expect(existsSync(join(PUBLIC_DIR, card.image))).toBe(true)
      }
    }
  })
})

describe('referralLandingPath', () => {
  it('generic has no query string; value/designer append ?c=', () => {
    expect(referralLandingPath('T', 'generic')).toBe('/r/T')
    expect(referralLandingPath('T', 'value')).toBe('/r/T?c=value')
    expect(referralLandingPath('T', 'designer')).toBe('/r/T?c=designer')
  })
})

describe('slugsNeedingCover', () => {
  it('value needs covers for exactly the partner four', () => {
    expect(new Set(slugsNeedingCover('value'))).toEqual(new Set(PARTNER_SLUGS))
  })
  it('designer needs covers for exactly the HD four', () => {
    expect(new Set(slugsNeedingCover('designer'))).toEqual(new Set(HD_SLUGS))
  })
})
