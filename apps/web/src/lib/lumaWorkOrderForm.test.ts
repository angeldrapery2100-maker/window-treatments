import { describe, it, expect } from 'vitest'
import { lumaRowFromEntry, buildLumaFormPayload, type LumaFormEntry } from './lumaWorkOrderForm'

describe('lumaRowFromEntry', () => {
  it('maps a chain zebra shade', () => {
    const entry: LumaFormEntry = {
      item: {
        productName: 'Luma Zebra Shade',
        productType: 'shade',
        location: 'Living Room',
        width: 48,
        height: 60,
        options: [
          { name: 'control', displayLabel: 'Control', value: 'chain', valueLabel: 'Polyester chain' },
          { name: 'cassette', displayLabel: 'Cassette', value: 'square', valueLabel: 'Square' },
          { name: 'front_fabric_code', displayLabel: 'Front', value: 'ZB-01', valueLabel: 'Snow' },
          { name: 'control_side', displayLabel: 'Side', value: 'right', valueLabel: 'Right' },
        ],
      },
    }
    const row = lumaRowFromEntry(entry, 'Gordon')
    expect(row.customer).toBe('Gordon')
    expect(row.product).toBe('Zebra shade')
    expect(row.fabric).toBe('Snow')
    expect(row.window).toBe('Living Room')
    expect(row.w_in).toBe('48')
    expect(row.h_in).toBe('60')
    expect(row.w_mm).toBe('')          // form computes mm
    expect(row.operation).toBe('Polyester chain')
    expect(row.dir).toBe('Right')
    expect(row.cassette).toBe('Square')
  })

  it('maps a motorized roller with remote channel', () => {
    const entry: LumaFormEntry = {
      item: {
        productName: 'Roller Shade',
        productType: 'shade',
        width: 36, height: 72,
        options: [
          { name: 'control', displayLabel: 'Control', value: 'motorized', valueLabel: 'Motorized' },
          { name: 'motor', displayLabel: 'Motor', value: 'zigbee25', valueLabel: '25 Zigbee' },
          { name: 'remote', displayLabel: 'Remote', value: 'ch1', valueLabel: 'Remote#1 Channel#1' },
          { name: 'cassette', displayLabel: 'Cassette', value: 'round', valueLabel: 'Round' },
        ],
      },
    }
    const row = lumaRowFromEntry(entry, 'Lee')
    expect(row.product).toBe('Roller shade')
    expect(row.operation).toBe('Motorized')
    expect(row.height).toBe('25 Zigbee')          // motor model in the height column
    expect(row.color).toBe('Remote#1 Channel#1')  // remote channel in the color column
    expect(row.cassette).toBe('Round')
    expect(row.dir).toBe('')
  })

  it('joins front + back fabric for a two-fabric line', () => {
    const entry: LumaFormEntry = {
      item: {
        productName: 'Zebra Shade', productType: 'shade', width: 40, height: 50,
        options: [
          { name: 'front_fabric_code', displayLabel: 'Front', value: 'F1', valueLabel: 'Ivory' },
          { name: 'back_fabric_code', displayLabel: 'Back', value: 'B1', valueLabel: 'Charcoal' },
          { name: 'control', displayLabel: 'Control', value: 'cordless', valueLabel: 'Cordless' },
        ],
      },
    }
    const row = lumaRowFromEntry(entry, 'Kim')
    expect(row.fabric).toBe('Ivory / Charcoal')
    expect(row.operation).toBe('Cordless')
  })
})

describe('buildLumaFormPayload', () => {
  it('sets Angel meta + PO-named title and maps rows', () => {
    const payload = buildLumaFormPayload(
      { order_number: 'AD100999', customer_name: 'Gordon', created_at: '2026-07-20T00:00:00Z' },
      [{ item: { productName: 'Luma Zebra', productType: 'shade', width: 48, height: 60, options: [{ name: 'control', displayLabel: 'Control', value: 'chain', valueLabel: 'Polyester chain' }] } }],
    )
    expect(payload.meta.company).toBe('Angel Drapery, Inc')
    expect(payload.meta.po).toBe('AD100999')
    expect(payload.meta.customer).toBe('Gordon')
    expect(payload.meta.date).toBe('2026-07-20')
    expect(payload.meta.title).toContain('AD100999')
    expect(payload.meta.title).toContain('Luma Work Order')
    expect(payload.rows).toHaveLength(1)
    expect(payload.rows[0].product).toBe('Zebra shade')
  })
})
