import { describe, it, expect } from 'vitest'
import { applyCustomerEstimateFactor, AI_ESTIMATE_FACTOR, scaleMoneyText } from './customerEstimateFactor'

const up = (n: number) => Math.round(n * AI_ESTIMATE_FACTOR)

describe('applyCustomerEstimateFactor — per-tool fixtures', () => {
  it('get_hd_estimate: range numbers and the display string move together', () => {
    const r: any = applyCustomerEstimateFactor('get_hd_estimate', {
      series: 'Duette',
      reference_range: '$1,200 – $1,600',
      range_low: 1200,
      range_high: 1600,
      must_say: 'REFERENCE price only, per window.',
    })
    expect(r.range_low).toBe(up(1200))
    expect(r.range_high).toBe(up(1600))
    expect(r.reference_range).toBe('$1,260 – $1,680')
    expect(r.series).toBe('Duette')
    expect(r.must_say).toContain('REFERENCE price')
  })

  it('quote_shutter_estimate: price scales, area/quantity/billed size do not', () => {
    const r: any = applyCustomerEstimateFactor('quote_shutter_estimate', {
      price: 980,
      area_sqft: 18.75,
      billed_size: '36" × 60" (window size + standard frame allowance)',
      upgrades: ['Hidden tilt rod'],
      quantity: 2,
      install_estimate: 40,
    })
    expect(r.price).toBe(up(980))
    expect(r.area_sqft).toBe(18.75)
    expect(r.quantity).toBe(2)
    expect(r.billed_size).toBe('36" × 60" (window size + standard frame allowance)')
    expect(r.upgrades).toEqual(['Hidden tilt rod'])
    // Installation is a real cost, never a padded reference figure.
    expect(r.install_estimate).toBe(40)
  })

  it('quote_luma_estimate: single price + formatted string', () => {
    const r: any = applyCustomerEstimateFactor('quote_luma_estimate', {
      product: 'Luma',
      variant: 'roller',
      reference_price: '$1,623',
      price: 1623,
      fabric_code: 'LM-204',
    })
    expect(r.price).toBe(up(1623))
    expect(r.reference_price).toBe('$1,704')
    expect(r.fabric_code).toBe('LM-204')
  })

  it('quote_drapery_estimate / quote_roman_estimate: ranges and nested config', () => {
    for (const tool of ['quote_drapery_estimate', 'quote_roman_estimate']) {
      const r: any = applyCustomerEstimateFactor(tool, {
        product: 'Custom drapery',
        reference_range: '$2,000 – $2,500',
        range_low: 2000,
        range_high: 2500,
        priced_at: '2026-08-22',
        assumed_config: { lining: 'blackout', fullness: '2.5x' },
      })
      expect(r.range_low).toBe(2100)
      expect(r.range_high).toBe(2625)
      expect(r.reference_range).toBe('$2,100 – $2,625')
      expect(r.assumed_config).toEqual({ lining: 'blackout', fullness: '2.5x' })
    }
  })

  it('quote_hardware_estimate and quote_somfy_track_estimate scale too', () => {
    const hw: any = applyCustomerEstimateFactor('quote_hardware_estimate', {
      product: 'Drapery hardware',
      reference_price: '$390',
      price: 390,
      coverage_note: 'Priced 6 of 8 matching styles',
    })
    expect(hw.price).toBe(up(390))
    expect(hw.reference_price).toBe('$410')
    const somfy: any = applyCustomerEstimateFactor('quote_somfy_track_estimate', {
      range_low: 1400,
      range_high: 2200,
      reference_range: '$1,400 – $2,200',
    })
    expect(somfy.range_low).toBe(1470)
    expect(somfy.range_high).toBe(2310)
  })

  it('get_sundance_jc_estimate scales its reference range', () => {
    const r: any = applyCustomerEstimateFactor('get_sundance_jc_estimate', {
      brand: 'Sundance',
      reference_range: '$700 – $900',
      range_low: 700,
      range_high: 900,
    })
    expect(r.range_low).toBe(735)
    expect(r.range_high).toBe(945)
    expect(r.reference_range).toBe('$735 – $945')
  })

  it('quote_store_product is NEVER scaled — it is the live checkout price', () => {
    const input = {
      unit_price: 412,
      say_it_as: '$412 per window for that size and configuration',
    }
    const r: any = applyCustomerEstimateFactor('quote_store_product', input)
    expect(r).toBe(input)
    expect(r.unit_price).toBe(412)
    expect(r.say_it_as).toContain('$412')
  })

  it('leaves error / ask-shaped results untouched', () => {
    const err = { error: 'could_not_price', note: 'Need material plus width and height.' }
    expect(applyCustomerEstimateFactor('quote_shutter_estimate', err)).toEqual(err)
    const ask = { ask_customer: 'fabric_tier', options: ['standard', 'premium'], question_en: 'Which fabric?' }
    expect(applyCustomerEstimateFactor('quote_drapery_estimate', ask)).toEqual(ask)
  })

  it('walks nested arrays (lines[].price)', () => {
    const r: any = applyCustomerEstimateFactor('quote_shutter_estimate', {
      price: 1000,
      lines: [{ label: 'Divider rail', price: 40 }, { label: 'Knob', price: 20 }],
    })
    expect(r.price).toBe(1050)
    expect(r.lines[0].price).toBe(42)
    expect(r.lines[1].price).toBe(21)
  })

  it('does not mutate the caller’s object', () => {
    const original = { price: 100 }
    applyCustomerEstimateFactor('quote_shutter_estimate', original)
    expect(original.price).toBe(100)
  })

  it('ignores non-object results and unknown tools', () => {
    expect(applyCustomerEstimateFactor('quote_luma_estimate', null)).toBeNull()
    expect(applyCustomerEstimateFactor('list_store_products', { price: 10 })).toEqual({ price: 10 })
  })
})

describe('scaleMoneyText', () => {
  it('rewrites every dollar figure in a string, keeping the rest', () => {
    expect(scaleMoneyText('about $1,000 – $2,000 per window')).toBe('about $1,050 – $2,100 per window')
  })
  it('leaves text without money alone', () => {
    expect(scaleMoneyText('no numbers here')).toBe('no numbers here')
  })
})
