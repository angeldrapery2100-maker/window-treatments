// Partner Lines — Sundance Window Coverings + JC Window Fashions.
//
// Legal-fact layer, deliberately hardcoded (not admin-editable). Origin,
// lead time and manufacturer warranty wording here are verbatim from the
// source documents (Sundance Limited Warranty; JCWF Limited Lifetime
// Warranty PDF p.6) as transcribed in
// SONNET任务书PartnerLinesJCSundance20260829.md §2 — do not paraphrase,
// expand, or shorten. If wording needs to change, that's a business
// decision, not an engineering one.
//
// Content layer (name, photos, marketing copy) lives in the DB
// (showcase_products) and is edited from /admin/showcase-products —
// this file only supplies the facts that must never drift from the
// manufacturer's actual terms.

export type PartnerBrand = 'Sundance Window Coverings' | 'JC Window Fashions'

export interface PartnerLine {
  slug: string
  brand: PartnerBrand
  /** 产地标注，逐字来自任务书 §2.1 */
  origin: string
  /** 生产交期，逐字来自任务书 §2.1 */
  leadTime: string
  /** 厂家保修小标题 */
  warrantyHeadline: string
  /** 厂家保修要点，逐条渲染 */
  warrantyPoints: string[]
  /** 厂家不保范围，一段 */
  warrantyExclusions: string
  /** 厂家保修出处署名 */
  warrantySource: string
}

export const PARTNER_LINES: Record<string, PartnerLine> = {
  'sundance-roller-shade': {
    slug: 'sundance-roller-shade',
    brand: 'Sundance Window Coverings',
    origin: 'Made in Arcadia, California',
    leadTime: '3–4 weeks',
    warrantyHeadline: 'Limited lifetime coverage on manufacturing defects',
    warrantyPoints: [
      'Sundance warrants this shade to you, the original purchaser, against manufacturing defects for the reasonable lifetime of the installation.',
      'The manual clutch is warranted for 10 years — and that one explicitly includes normal wear and tear.',
      'Motorization, components and accessories are warranted for 5 years.',
    ],
    warrantyExclusions:
      'Not covered by the manufacturer: normal wear, fading from extended sun exposure, damage from the elements, and anything caused by improper measuring, installation, cleaning or maintenance. Sundance also excludes shipping charges and the labor cost of measuring and installation.',
    warrantySource:
      'Sundance Window Coverings Limited Warranty. Service: 5507 N. Peck Rd., Arcadia, CA 91006 · (626) 618-7000.',
  },
  'sundance-wood-blind': {
    slug: 'sundance-wood-blind',
    brand: 'Sundance Window Coverings',
    origin: 'Made in Arcadia, California',
    leadTime: '3–4 weeks',
    warrantyHeadline: 'Limited lifetime coverage on manufacturing defects',
    warrantyPoints: [
      'Sundance warrants this blind to you, the original purchaser, against manufacturing defects for the reasonable lifetime of the installation.',
      'Motorization, components and accessories are warranted for 5 years.',
      'Lift cords, where present, are warranted for 7 years.',
    ],
    warrantyExclusions:
      'Not covered by the manufacturer: normal wear, fading from extended sun exposure, damage from the elements, and anything caused by improper measuring, installation, cleaning or maintenance. Sundance also excludes shipping charges and the labor cost of measuring and installation.',
    warrantySource:
      'Sundance Window Coverings Limited Warranty. Service: 5507 N. Peck Rd., Arcadia, CA 91006 · (626) 618-7000.',
  },
  'jc-woven-wood-shade': {
    slug: 'jc-woven-wood-shade',
    brand: 'JC Window Fashions',
    origin: 'Imported · stocked and serviced locally',
    leadTime: '5–8 weeks',
    warrantyHeadline: 'Limited lifetime coverage on manufacturing defects — administered by us',
    warrantyPoints: [
      'JC Window Fashions warrants this shade against defects in materials, mechanisms and workmanship for as long as the original purchaser owns it.',
      "That warranty runs to us as the retailer, not directly to you — so the claim comes to Angel Drapery and we handle it with the manufacturer on your behalf. One number to call.",
      "Replacement parts are matched as closely as possible; an exact color match to an older piece can't be guaranteed.",
    ],
    warrantyExclusions:
      'Not covered by the manufacturer: normal wear, exposure to water, moisture, sun or wind, exposure to chemicals or pollutants, gradual discoloration or fading, and anything caused by improper measuring, installation, cleaning or maintenance. The manufacturer also excludes shipping charges, trip charges, the cost of removal and reinstallation, the cost of measuring, commercial use, and use outside the U.S.',
    warrantySource: 'JC Window Fashions Limited Lifetime Warranty.',
  },
  'jc-cambridge-shutter': {
    slug: 'jc-cambridge-shutter',
    brand: 'JC Window Fashions',
    origin: 'Imported · stocked and serviced locally',
    leadTime: '5–8 weeks',
    warrantyHeadline: 'Limited lifetime coverage on manufacturing defects — administered by us',
    warrantyPoints: [
      'JC Window Fashions warrants these shutters against defects in materials, mechanisms and workmanship for as long as the original purchaser owns them.',
      "That warranty runs to us as the retailer, not directly to you — so the claim comes to Angel Drapery and we handle it with the manufacturer on your behalf. One number to call.",
      'Paint colorfastness is warranted for 8 years, and the integrated tilt for 10 years from the date of purchase.',
      "Replacement parts are matched as closely as possible; an exact color match to an older shutter can't be guaranteed.",
    ],
    warrantyExclusions:
      'Not covered by the manufacturer: normal wear, exposure to water, moisture, sun or wind, exposure to chemicals or pollutants, gradual discoloration or fading, and anything caused by improper measuring, installation, cleaning or maintenance. The manufacturer also excludes shipping charges, trip charges, the cost of removal and reinstallation, the cost of measuring, commercial use, and use outside the U.S.',
    warrantySource: 'JC Window Fashions Limited Lifetime Warranty.',
  },
}

export function getPartnerLine(slug: string): PartnerLine | null {
  return PARTNER_LINES[slug] || null
}
