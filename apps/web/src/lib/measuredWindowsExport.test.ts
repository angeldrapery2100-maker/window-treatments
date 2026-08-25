import { describe, it, expect } from 'vitest'
import { measuredWindowsToEstimate } from './measuredWindowsExport'

/* 这份测试钉的是 measured_windows.dims / config 的形状。
   量窗向导(MeasureWizardClient.tsx)和聊天工具(save_measured_window)是它的
   两个写入方 —— 下面这两条夹具就是照着它们实际写进去的键抄的。
   向导改了键名 → 这里红 → 去改 measuredWindowsExport.ts,一处。 */

/** 向导 MeasureWizardClient.tsx 写进去的形状(2026-08 实测)。 */
const fromWizard = {
  id: '8f1c2d3e-0000-4a00-9000-abcdefabcdef',
  label: 'Living room',
  kind: 'window',
  product: 'shades',
  config: { mount: 'inside_z', depthChoice: 'deep', scene: 'trim' },
  dims: {
    widthIn: 96, heightIn: 84,
    A_leftIn: 6, B_rightIn: 6, C_topIn: 12, D_bottomIn: 30,
    wallHeightIn: 108, outerWidthIn: null, outerHeightIn: null, measured: 'opening',
  },
  result: { type: 'shade_order_size', mode: 'inside', orderWidthIn: 95.5, orderHeightIn: 84 },
}

/** 聊天里 save_measured_window 写进去的形状。 */
const fromChat = {
  id: 'row-2',
  label: 'Bedroom',
  kind: 'window',
  product: 'drapery',
  config: { mount: 'outside', notes: 'wants blackout', savedVia: 'chat' },
  dims: { widthIn: 40, heightIn: 60, A_leftIn: null, B_rightIn: null, measured: 'opening' },
  result: {},
}

describe('measuredWindowsToEstimate', () => {
  it('★ 尺寸取窗洞尺寸,不是向导算出来的订购尺寸', () => {
    const { windows } = measuredWindowsToEstimate([fromWizard])
    expect(windows[0].width_in).toBe(96)
    expect(windows[0].height_in).toBe(84)
    // result.orderWidthIn 是 95.5 —— 用它就会和 quote_luma_estimate 那条路口径不一致
    expect(windows[0].width_in).not.toBe(95.5)
  })

  it('inside_z 归到内装(Z 型内装在定价上就是内装)', () => {
    expect(measuredWindowsToEstimate([fromWizard]).windows[0].mount).toBe('inside')
    expect(measuredWindowsToEstimate([fromChat]).windows[0].mount).toBe('outside')
  })

  it('★ mount 不认识时**不猜** —— 让 AAPP 用它自己的默认', () => {
    const r = measuredWindowsToEstimate([{ ...fromChat, config: { mount: 'weird' } }])
    expect(r.windows[0].mount).toBeUndefined()
    const r2 = measuredWindowsToEstimate([{ ...fromChat, config: {} }])
    expect(r2.windows[0].mount).toBeUndefined()
  })

  it('label / notes 带过去,id 保留(条目要靠它绑窗户)', () => {
    const w = measuredWindowsToEstimate([fromChat]).windows[0]
    expect(w.id).toBe('row-2')
    expect(w.label).toBe('Bedroom')
    expect(w.notes).toBe('wants blackout')
  })

  it('★ 没有宽高的不静默丢 —— 少一扇窗,客户收到的报价就是错的', () => {
    const r = measuredWindowsToEstimate([
      fromChat,
      { id: 'x', label: 'Hallway', dims: { widthIn: 40 } },
      { id: 'y', label: 'Nook', dims: {} },
      { id: 'z', label: '', dims: null },
    ])
    expect(r.windows).toHaveLength(1)
    expect(r.skipped).toEqual([
      { label: 'Hallway', reason: 'no_dims' },
      { label: 'Nook', reason: 'no_dims' },
      { label: '(unnamed)', reason: 'no_dims' },
    ])
  })

  it('★ 大得离谱的数字当没测(厘米当英寸填进来会报出天价)', () => {
    const r = measuredWindowsToEstimate([{ id: 'a', label: 'CM', dims: { widthIn: 244, heightIn: 213 } }])
    expect(r.windows).toHaveLength(1)               // 244" 还在合理范围(20 英尺)
    const r2 = measuredWindowsToEstimate([{ id: 'b', label: 'Way off', dims: { widthIn: 2440, heightIn: 2130 } }])
    expect(r2.windows).toHaveLength(0)
    expect(r2.skipped[0].reason).toBe('no_dims')
  })

  it('负数、0、字符串、null 都当没测', () => {
    for (const bad of [0, -5, 'abc', null, undefined, NaN, {}]) {
      const r = measuredWindowsToEstimate([{ id: 'a', label: 'X', dims: { widthIn: bad, heightIn: 60 } }])
      expect(r.windows).toHaveLength(0)
    }
  })

  it('小数保留两位(向导允许 95.5 这种)', () => {
    const r = measuredWindowsToEstimate([{ id: 'a', label: 'X', dims: { widthIn: 95.567, heightIn: 84 } }])
    expect(r.windows[0].width_in).toBe(95.57)
  })

  it('空/非数组 → 空结果,不抛', () => {
    expect(measuredWindowsToEstimate(null)).toEqual({ windows: [], skipped: [] })
    expect(measuredWindowsToEstimate([])).toEqual({ windows: [], skipped: [] })
    expect(measuredWindowsToEstimate([null as never])).toEqual({ windows: [], skipped: [{ label: '(unnamed)', reason: 'no_dims' }] })
  })

  it('★ 出参里不带 result —— 那里面有 shutter_reference_price 之类的价', () => {
    const r = measuredWindowsToEstimate([{
      ...fromWizard,
      result: { type: 'shutter_reference_price', price: 1234, installFee: 85 },
    }])
    const s = JSON.stringify(r)
    expect(s).not.toContain('1234')
    expect(s).not.toContain('installFee')
    expect(s).not.toContain('price')
  })
})
