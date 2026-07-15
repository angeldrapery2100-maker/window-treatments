'use client'

import { useState, useEffect } from 'react'

// 数字字段允许暂存 ''（正在编辑、被删空的状态）——上报给保存流程前统一
// 转成数字，输入框里就不会出现"删不掉的 0 / 096"问题（2026-07-14 修复）。
type Num = number | ''

interface ParcelRule {
  rule_name: string
  min_width: Num
  max_width: Num
  min_height: Num
  max_height: Num
  parcel_length: Num
  parcel_width: Num
  parcel_height: Num
  parcel_weight: Num
}

interface Props {
  productId: string
  /** Accessory products default to ONE small-box rule (店铺重设计 P1) —
   *  remotes/hubs/tiebacks ship in a small parcel, not the drapery tube. */
  productType?: string
  onChange: (rules: ParcelRule[]) => void
}

const defaultRule = (): ParcelRule => ({
  rule_name: '', min_width: 0, max_width: 999, min_height: 0, max_height: 999,
  parcel_length: 24, parcel_width: 12, parcel_height: 6, parcel_weight: 5,
})

// Small-box default for fixed-price accessories (remote / hub / tieback).
const accessoryDefaultRule = (): ParcelRule => ({
  rule_name: 'Small box (accessory)', min_width: 0, max_width: 999, min_height: 0, max_height: 999,
  parcel_length: 10, parcel_width: 8, parcel_height: 4, parcel_weight: 2,
})

export default function ParcelRulesEditor({ productId, productType, onChange }: Props) {
  const [rules, setRules] = useState<ParcelRule[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/products/${productId}/parcels`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length > 0) {
          setRules(d.data.map((r: any) => ({
            rule_name: r.rule_name || '',
            min_width: Number(r.min_width), max_width: Number(r.max_width),
            min_height: Number(r.min_height), max_height: Number(r.max_height),
            parcel_length: Number(r.parcel_length), parcel_width: Number(r.parcel_width),
            parcel_height: Number(r.parcel_height), parcel_weight: Number(r.parcel_weight),
          })))
        } else if (productType === 'accessory') {
          // No rules yet for an accessory → prefill the small-box default and
          // report it up so the next save persists it.
          const seeded = [accessoryDefaultRule()]
          setRules(seeded)
          onChange(seeded)
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  // 空字符串保留为 ''（编辑中），非法输入忽略；上报的规则统一转数字。
  const sanitize = (list: ParcelRule[]): ParcelRule[] => list.map(r => ({
    ...r,
    min_width: Number(r.min_width) || 0, max_width: Number(r.max_width) || 0,
    min_height: Number(r.min_height) || 0, max_height: Number(r.max_height) || 0,
    parcel_length: Number(r.parcel_length) || 0, parcel_width: Number(r.parcel_width) || 0,
    parcel_height: Number(r.parcel_height) || 0, parcel_weight: Number(r.parcel_weight) || 0,
  }))

  const update = (idx: number, field: keyof ParcelRule, value: string | number) => {
    const next = [...rules]
    if (field === 'rule_name' || typeof value === 'number') {
      ;(next[idx] as any)[field] = value
    } else if (value === '') {
      ;(next[idx] as any)[field] = ''
    } else {
      const n = parseFloat(value)
      if (Number.isFinite(n)) (next[idx] as any)[field] = n
    }
    setRules(next)
    onChange(sanitize(next))
  }

  const addRule = () => {
    const next = [...rules, productType === 'accessory' ? accessoryDefaultRule() : defaultRule()]
    setRules(next)
    onChange(next)
  }

  const removeRule = (idx: number) => {
    const next = rules.filter((_, i) => i !== idx)
    setRules(next)
    onChange(next)
  }

  if (!loaded) return <div className="py-8 text-center text-gray-400">加载中...</div>

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">📦 包裹尺寸规则</h3>
        <p className="text-sm text-gray-500 mb-4">
          根据客户选择的产品尺寸（宽/高），自动匹配对应的包裹尺寸来计算运费。
          规则按从上到下的顺序匹配，命中第一个即停止。
        </p>
      </div>

      {rules.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-4">暂无包裹规则，将使用默认尺寸计算运费</p>
          <button onClick={addRule}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-black">
            + 添加第一个规则
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-5 relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">{idx + 1}</span>
                  <input type="text" value={rule.rule_name}
                    onChange={e => update(idx, 'rule_name', e.target.value)}
                    placeholder="规则名称（如：小尺寸包裹）"
                    className="text-sm font-medium border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 w-64" />
                </div>
                <button onClick={() => removeRule(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left: Product size range */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">产品尺寸范围 (inches)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">最小宽度</label>
                      <input type="number" value={rule.min_width} onChange={e => update(idx, 'min_width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">最大宽度</label>
                      <input type="number" value={rule.max_width} onChange={e => update(idx, 'max_width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">最小高度</label>
                      <input type="number" value={rule.min_height} onChange={e => update(idx, 'min_height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">最大高度</label>
                      <input type="number" value={rule.max_height} onChange={e => update(idx, 'max_height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Right: Parcel dimensions — 长/宽/高 一排三个，重量单独一行 */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">包裹尺寸</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">长 (in)</label>
                      <input type="number" value={rule.parcel_length} onChange={e => update(idx, 'parcel_length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">宽 (in)</label>
                      <input type="number" value={rule.parcel_width} onChange={e => update(idx, 'parcel_width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">高 (in)</label>
                      <input type="number" value={rule.parcel_height} onChange={e => update(idx, 'parcel_height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">重量 (lb)</label>
                      <input type="number" value={rule.parcel_weight} onChange={e => update(idx, 'parcel_weight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={addRule}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            + 添加规则
          </button>
        </div>
      )}
    </div>
  )
}
