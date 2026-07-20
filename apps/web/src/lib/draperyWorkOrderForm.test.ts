import { describe, it, expect } from 'vitest'
import { priceHandcraftedDrapery } from '@window-treatments/shared/pricing/aapp'
import {
  fmtInch,
  calcDraperyReturnIn,
  draperyRowFromEntry,
  buildDraperyFormPayload,
  type DraperyFormEntry,
} from './draperyWorkOrderForm'

describe('fmtInch (AAPP parity)', () => {
  it('renders whole inches', () => expect(fmtInch(42)).toBe('42"'))
  it('renders nearest eighth', () => expect(fmtInch(42.375)).toBe('42 3/8"'))
  it('uses ½ glyph for four-eighths', () => expect(fmtInch(98.5)).toBe('98 ½"'))
  it('rounds 7/8+ up to the next inch', () => expect(fmtInch(41.97)).toBe('42"'))
  it('em-dash for zero', () => expect(fmtInch(0)).toBe('—'))
})

describe('calcDraperyReturnIn (AAPP parity)', () => {
  it('pleated main → hwReturn + 3.5', () => expect(calcDraperyReturnIn(false, 3.5, 'fabric_only', 'pleated')).toBe(7))
  it('ripple main → hwReturn, no offset', () => expect(calcDraperyReturnIn(false, 3.5, 'fabric_only', 'ripple')).toBe(3.5))
  it('sheer in fabric+sheer → 1.5 base', () => expect(calcDraperyReturnIn(true, 3.5, 'fabric_plus_sheer', 'ripple')).toBe(1.5))
  it('sheer in fabric+sheer pleated → 1.5 + 3.5', () => expect(calcDraperyReturnIn(true, 3.5, 'fabric_plus_sheer', 'pleated')).toBe(5))
})

describe('draperyRowFromEntry', () => {
  it('maps a split pleated fabric-only line', () => {
    const entry: DraperyFormEntry = {
      item: {
        productType: 'drapery',
        location: 'Living Room',
        options: [{ name: 'fabric_color', displayLabel: 'Fabric', value: 'BL-01', valueLabel: 'Belgian Linen' }],
      },
      production: {
        finishedWidthIn: 120,
        finishedHeightIn: 96,
        operation: 'split',
        styleFamily: 'pleated',
        styleKey: 'pinch_2',
        mainPerSide: 62,
        mainWps: 2,
        mainCutDrop: 112,
        mainOrientation: 'vertical',
        mainLiningType: 'LF',
      },
      mainFabricWidthIn: 54,
    }
    const row = draperyRowFromEntry(entry, 0)
    expect(row.location).toBe('Living Room')
    expect(row.size).toBe('120" × 96"')
    expect(row.operation).toBe('Split Draw')
    expect(row.operationKey).toBe('split')
    expect(row.style).toBe('2-Fold Pinch')
    expect(row.styleFamily).toBe('pleated')
    expect(row.layers).toHaveLength(1)
    const L = row.layers[0]
    expect(L.name).toBe('Belgian Linen')
    expect(L.color).toBe('BL-01')
    expect(L.width).toBe('54″')
    expect(L.cutW).toBe('60"')      // 120/2 = 60 finished panel width
    expect(L.cutH).toBe('96"')
    expect(L.panels).toBe('2')
    expect(L.botton).toBe('2')      // pleated vertical → widths/side
    expect(L.lining).toBe('LF')
    expect(L.ret).toBe('7"')        // pleated main: 3.5 + 3.5
  })

  it('ripple botton shows N+3', () => {
    const entry: DraperyFormEntry = {
      item: { productType: 'drapery', options: [] },
      production: {
        finishedWidthIn: 84.75, finishedHeightIn: 98.5, operation: 'split',
        styleFamily: 'ripple', styleKey: 'cn_6cm',
        mainPerSide: 42.375, mainNp: 20, mainOrientation: 'vertical', mainWps: '',
      },
    }
    const row = draperyRowFromEntry(entry, 0)
    expect(row.layers[0].botton).toBe('20+3')
    expect(row.style).toBe('Perfect Wave')
  })

  it('fabric+sheer produces two layers with the right returns', () => {
    const entry: DraperyFormEntry = {
      item: {
        productType: 'drapery',
        options: [
          { name: 'fabric_color', displayLabel: 'Fabric', value: 'HL', valueLabel: 'Heavy Linen' },
          { name: 'sheer_fabric', displayLabel: 'Sheer', value: 'SL', valueLabel: 'Sheer Linen' },
        ],
      },
      production: {
        finishedWidthIn: 144, finishedHeightIn: 100, operation: 'split',
        styleFamily: 'pleated', styleKey: 'pinch_3',
        mainPerSide: 74, mainWps: 2, mainOrientation: 'vertical', mainLiningType: 'BO',
        sheerPerSide: 74, sheerOrientation: 'vertical',
      },
    }
    const row = draperyRowFromEntry(entry, 0)
    expect(row.layers).toHaveLength(2)
    expect(row.layers[0].name).toBe('Heavy Linen')
    expect(row.layers[0].lining).toBe('BO')
    expect(row.layers[0].ret).toBe('7"')        // main pleated: 3.5+3.5
    expect(row.layers[1].name).toBe('Sheer Linen')
    expect(row.layers[1].lining).toBe('—')
    expect(row.layers[1].ret).toBe('5"')        // sheer pleated fabric+sheer: 1.5+3.5
  })

  it('falls back to order OPTIONS when there is no engine breakdown', () => {
    // Real shape from a website order: no production snapshot, all real data in options.
    const entry: DraperyFormEntry = {
      item: {
        productType: 'drapery',
        location: 'Bedroom',
        width: 123, height: 56,
        options: [
          { name: 'pleat_style', displayLabel: 'Pleat', value: '2 Fold Pinch', valueLabel: '2 Fold Pinch Pleat' },
          { name: 'fabric_color', displayLabel: 'Fabric', value: 'Natural', valueLabel: 'Natural' },
          { name: 'lining', displayLabel: 'Lining', value: 'NO', valueLabel: 'No Lining' },
          { name: 'operation', displayLabel: 'Operation', value: 'C/O', valueLabel: 'Center Split' },
          { name: 'return', displayLabel: 'Return', value: '3 1/2', valueLabel: '3 1/2 inches' },
        ],
      },
      production: null,
    }
    const row = draperyRowFromEntry(entry, 0)
    expect(row.operation).toBe('Split Draw')   // "Center Split" / C/O → split
    expect(row.operationKey).toBe('split')
    expect(row.style).toBe('2-Fold Pinch')      // from pleat_style option
    expect(row.styleKey).toBe('pinch_2')
    expect(row.styleFamily).toBe('pleated')
    expect(row.layers).toHaveLength(1)
    expect(row.layers[0].name).toBe('Natural')
    expect(row.layers[0].cutW).toBe('61 ½"')    // 123/2
    expect(row.layers[0].lining).toBe('NO')     // from lining option
    expect(row.layers[0].ret).toBe('7"')        // 3.5 return + 3.5 pleated offset
    // no engine snapshot → 扣/幅/裁 recomputed from geometry (same spacing math),
    // so it's now a positive widths-per-side number, not blank.
    expect(row.layers[0].botton).not.toBe('')
    expect(Number(row.layers[0].botton)).toBeGreaterThan(0)
  })

  it('geometry botton matches the pricing engine (no-engine path)', () => {
    // The recomputed widths-per-side must equal what the real engine produces.
    const bd = priceHandcraftedDrapery({
      finishedWidthIn: 123, finishedHeightIn: 56,
      styleFamily: 'pleated', styleKey: 'pinch_2', operation: 'split',
      layers: { main: { enabled: true, pricePerYard: 10, widthNormalizedIn: 54, liningType: 'NO' } },
    }).breakdown
    const entry: DraperyFormEntry = {
      item: {
        productType: 'drapery', width: 123, height: 56,
        options: [
          { name: 'pleat_style', displayLabel: 'Pleat', value: '2 Fold Pinch', valueLabel: '2 Fold Pinch Pleat' },
          { name: 'operation', displayLabel: 'Operation', value: 'C/O', valueLabel: 'Center Split' },
          { name: 'fabric_color', displayLabel: 'Fabric', value: 'Natural', valueLabel: 'Natural' },
        ],
      },
    }
    const row = draperyRowFromEntry(entry, 0)
    // engine breakdown mainWps is the vertical widths/side; form botton shows it.
    expect(row.layers[0].botton).toBe(String(bd.mainWps))
  })

  it('reads One Way Left + 3-fold + blackout from options', () => {
    const entry: DraperyFormEntry = {
      item: {
        productType: 'drapery', width: 60, height: 84,
        options: [
          { name: 'operation', displayLabel: 'Operation', value: 'OWL', valueLabel: 'One Way Left' },
          { name: 'pleat_style', displayLabel: 'Pleat', value: '3 Fold Pinch', valueLabel: '3 Fold Pinch Pleat' },
          { name: 'lining', displayLabel: 'Lining', value: 'BO', valueLabel: 'Blackout Lining' },
          { name: 'fabric_color', displayLabel: 'Fabric', value: 'Slate', valueLabel: 'Slate' },
        ],
      },
    }
    const row = draperyRowFromEntry(entry, 0)
    expect(row.operationKey).toBe('single_left')
    expect(row.style).toBe('3-Fold Pinch')
    expect(row.styleKey).toBe('pinch_3')
    expect(row.layers[0].panels).toBe('1')      // one-way → single panel
    expect(row.layers[0].cutW).toBe('60"')      // not split
    expect(row.layers[0].lining).toBe('BO')
  })

  it('standalone sheer line → single sheer-only row', () => {
    const entry: DraperyFormEntry = {
      item: { productType: 'sheer', location: 'Office', width: 60, height: 90, options: [{ name: 'fabric_color', displayLabel: 'Fabric', value: 'MV', valueLabel: 'Mesh Voile' }] },
      production: null,
    }
    const row = draperyRowFromEntry(entry, 0)
    expect(row.layers).toHaveLength(1)
    expect(row.layers[0].name).toBe('Mesh Voile')
    expect(row.layers[0].lining).toBe('—')
    expect(row.size).toBe('60" × 90"')
  })
})

describe('buildDraperyFormPayload', () => {
  it('sets Angel letterhead + PO/sidemark and maps all rows', () => {
    const payload = buildDraperyFormPayload(
      { order_number: 'AD100234', customer_name: 'Gordon', created_at: '2026-07-20T00:00:00Z' },
      [{ item: { productType: 'drapery', options: [] }, production: { finishedWidthIn: 80, finishedHeightIn: 90, operation: 'single_left', styleFamily: 'pleated', styleKey: 'pinch_2', mainPerSide: 84, mainWps: 2, mainOrientation: 'vertical' } }],
    )
    expect(payload.meta.company).toBe('Angel Drapery, Inc')
    expect(payload.meta.po).toBe('AD100234')
    expect(payload.meta.sidemark).toBe('Gordon')
    expect(payload.meta.date).toBe('2026-07-20')
    expect(payload.meta.ops.map(o => o.k)).toContain('single_left')
    expect(payload.rows).toHaveLength(1)
    expect(payload.rows[0].operation).toBe('One Way Left')
  })
})
