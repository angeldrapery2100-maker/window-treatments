'use client'

import { useState, useEffect } from 'react'

interface ParcelRule {
  rule_name: string
  min_width: number
  max_width: number
  min_height: number
  max_height: number
  parcel_length: number
  parcel_width: number
  parcel_height: number
  parcel_weight: number
}

interface Props {
  productId: string
  onChange: (rules: ParcelRule[]) => void
}

const defaultRule = (): ParcelRule => ({
  rule_name: '', min_width: 0, max_width: 999, min_height: 0, max_height: 999,
  parcel_length: 24, parcel_width: 12, parcel_height: 6, parcel_weight: 5,
})

export default function ParcelRulesEditor({ productId, onChange }: Props) {
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
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [productId])

  const update = (idx: number, field: keyof ParcelRule, value: string | number) => {
    const next = [...rules]
    ;(next[idx] as any)[field] = typeof value === 'string' && field !== 'rule_name' ? parseFloat(value) || 0 : value
    setRules(next)
    onChange(next)
  }

  const addRule = () => {
    const next = [...rules, defaultRule()]
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
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
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

                {/* Right: Parcel dimensions */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">包裹尺寸</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">包裹长 (in)</label>
                      <input type="number" value={rule.parcel_length} onChange={e => update(idx, 'parcel_length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">包裹宽 (in)</label>
                      <input type="number" value={rule.parcel_width} onChange={e => update(idx, 'parcel_width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">包裹高 (in)</label>
                      <input type="number" value={rule.parcel_height} onChange={e => update(idx, 'parcel_height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
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
