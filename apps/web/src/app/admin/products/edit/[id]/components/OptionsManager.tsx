'use client'

import { useState, useEffect, useCallback } from 'react'

interface OptionValue {
  id: string
  value: string
  label: string
  params: Record<string, any>
  sort_order: number
}

interface ProductOption {
  id: string
  name: string
  type: string
  display_label: string
  values: OptionValue[]
}

interface OptionsManagerProps {
  productType: 'drapery' | 'sheer' | 'shade' | 'hardware'
  productId: string
  onChange: (options: ProductOption[]) => void
}

const DEFAULT_OPTIONS: Record<string, ProductOption[]> = {
  drapery: [
    { id: 'pleat_style', name: 'pleat_style', type: 'select', display_label: 'Pleat Style', values: [] },
    { id: 'fabric_color', name: 'fabric_color', type: 'select', display_label: 'Fabric Color', values: [] },
    { id: 'lining', name: 'lining', type: 'select', display_label: 'Lining', values: [] },
    { id: 'operation', name: 'operation', type: 'select', display_label: 'Operation', values: [] },
    { id: 'return', name: 'return', type: 'select', display_label: 'Return', values: [] },
  ],
  sheer: [
    { id: 'pleat_style', name: 'pleat_style', type: 'select', display_label: 'Pleat Style', values: [] },
    { id: 'fabric_color', name: 'fabric_color', type: 'select', display_label: 'Fabric Color', values: [] },
    { id: 'operation', name: 'operation', type: 'select', display_label: 'Operation', values: [] },
  ],
  shade: [
    { id: 'mounting', name: 'mounting', type: 'select', display_label: 'Mounting', values: [] },
    { id: 'fabric_color', name: 'fabric_color', type: 'select', display_label: 'Fabric Color', values: [] },
    { id: 'operation', name: 'operation', type: 'select', display_label: 'Operation', values: [] },
    { id: 'control_side', name: 'control_side', type: 'select', display_label: 'Control Side', values: [] },
  ],
  hardware: [
    { id: 'rod', name: 'rod', type: 'select', display_label: 'Rod', values: [] },
    { id: 'finial', name: 'finial', type: 'select', display_label: 'Finial', values: [] },
    { id: 'color', name: 'color', type: 'select', display_label: 'Color', values: [] },
  ],
}

const PARAM_FIELDS: Record<string, Record<string, { key: string; label: string }[]>> = {
  drapery: {
    fabric_color: [
      { key: 'fabric_price', label: '面料单价 ($/yard)（旧模型）' },
      // AAPP 引擎的每色覆盖值（未填则用商品参数的 aapp_fabric_price_per_yard / aapp_fabric_width_in）
      { key: 'fabric_price_per_yard', label: 'AAPP 面料单价 ($/yd)' },
      { key: 'fabric_width_in', label: 'AAPP 面料幅宽 (inch)' },
    ],
    lining: [{ key: 'lining_price', label: '里衬单价 ($/yard)' }, { key: 'labor_price', label: '加工价 ($/panel)' }],
    operation: [{ key: 'stack_divisor', label: '堆叠除数' }],
  },
  sheer: {
    fabric_color: [{ key: 'fabric_price', label: '面料单价 ($/yard)' }],
  },
  shade: {
    fabric_color: [{ key: 'fabric_price', label: '面料单价 ($/sq ft)' }],
    operation: [{ key: 'controller_price', label: '控制器价格 ($)' }],
  },
  hardware: {
    rod: [{ key: 'fixed_price', label: '基础价格 ($)' }, { key: 'price_per_foot', label: '长度单价 ($/foot)' }],
    finial: [{ key: 'finial_price', label: '端头价格 ($)' }, { key: 'finial_length', label: '端头长度 (inch)' }],
    // color 不参与计算，无参数
  },
}

export default function OptionsManager({ productType, productId, onChange }: OptionsManagerProps) {
  const [options, setOptions] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [editingOption, setEditingOption] = useState<string | null>(null)
  const [newValue, setNewValue] = useState<{ value: string; label: string }>({ value: '', label: '' })

  useEffect(() => { fetchOptions() }, [productId, productType])

  const fetchOptions = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/options`)
      const data = await res.json()
      if (data.success && data.data.options?.length > 0) {
        // Merge with defaults to ensure new options (like 'return') are included
        let existing = data.data.options as ProductOption[]
        const defaults = DEFAULT_OPTIONS[productType] || []
        // Migrate: rename fabric_code → fabric_color for shade products
        if (productType === 'shade') {
          existing = existing.map(o => o.name === 'fabric_code'
            ? { ...o, id: 'fabric_color', name: 'fabric_color', display_label: 'Fabric Color' }
            : o
          )
        }
        const merged = [...existing]
        for (const def of defaults) {
          if (!existing.find(e => e.name === def.name)) merged.push(def)
        }
        setOptions(merged)
      } else {
        setOptions(DEFAULT_OPTIONS[productType] || [])
      }
    } catch {
      setOptions(DEFAULT_OPTIONS[productType] || [])
    } finally {
      setLoading(false)
    }
  }

  const update = useCallback((updated: ProductOption[]) => {
    setOptions(updated)
    onChange(updated)
  }, [onChange])

  const addOptionValue = (optionId: string) => {
    if (!newValue.value.trim() || !newValue.label.trim()) return
    const option = options.find(o => o.id === optionId)
    if (!option) return
    const paramFields = PARAM_FIELDS[productType]?.[option.name] || []
    const defaultParams: Record<string, any> = {}
    paramFields.forEach(f => { defaultParams[f.key] = 0 })
    const val: OptionValue = {
      id: `value-${Date.now()}`,
      value: newValue.value.trim(),
      label: newValue.label.trim(),
      params: defaultParams,
      sort_order: option.values.length,
    }
    update(options.map(o => o.id === optionId ? { ...o, values: [...o.values, val] } : o))
    setNewValue({ value: '', label: '' })
    setEditingOption(null)
  }

  const updateOptionValue = (optionId: string, valueId: string, field: string, val: any) =>
    update(options.map(o => o.id !== optionId ? o : {
      ...o, values: o.values.map(v => v.id === valueId ? { ...v, [field]: val } : v)
    }))

  const updateValueParam = (optionId: string, valueId: string, key: string, val: any) =>
    update(options.map(o => o.id !== optionId ? o : {
      ...o, values: o.values.map(v => v.id === valueId ? { ...v, params: { ...v.params, [key]: val } } : v)
    }))

  const deleteOptionValue = (optionId: string, valueId: string) => {
    if (!confirm('确定要删除这个选项值吗？')) return
    update(options.map(o => o.id !== optionId ? o : {
      ...o, values: o.values.filter(v => v.id !== valueId).map((v, i) => ({ ...v, sort_order: i }))
    }))
  }

  const moveValue = (optionId: string, valueId: string, dir: 'up' | 'down') =>
    update(options.map(o => {
      if (o.id !== optionId) return o
      const vals = [...o.values]
      const idx = vals.findIndex(v => v.id === valueId)
      const target = dir === 'up' ? idx - 1 : idx + 1
      if (idx === -1 || target < 0 || target >= vals.length) return o
      ;[vals[idx], vals[target]] = [vals[target], vals[idx]]
      return { ...o, values: vals.map((v, i) => ({ ...v, sort_order: i })) }
    }))

  if (loading) return <div className="text-center py-8 text-gray-500">加载中...</div>

  return (
    <div className="space-y-6">
      {options.map(option => {
        const paramFields = PARAM_FIELDS[productType]?.[option.name] || []

        return (
          <div key={option.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="font-semibold text-gray-900">{option.display_label}</span>
                <code className="ml-3 text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">{option.name}</code>
                {paramFields.length > 0 && <span className="ml-2 text-xs text-gray-400">（含价格参数）</span>}
              </div>
              <button
                onClick={() => { setEditingOption(editingOption === option.id ? null : option.id); setNewValue({ value: '', label: '' }) }}
                className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-black"
              >
                + 添加选项值
              </button>
            </div>

            {editingOption === option.id && (
              <div className="px-5 py-4 bg-blue-50 border-b border-blue-200">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Value（代码）</label>
                    <input value={newValue.value} onChange={e => setNewValue(p => ({ ...p, value: e.target.value }))}
                      placeholder="如: 2-fold" className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label（显示名称）</label>
                    <input value={newValue.label} onChange={e => setNewValue(p => ({ ...p, label: e.target.value }))}
                      placeholder="如: 2 Fold Pinch Pleated" className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                      onKeyDown={e => e.key === 'Enter' && addOptionValue(option.id)} />
                  </div>
                  <button onClick={() => addOptionValue(option.id)}
                    disabled={!newValue.value.trim() || !newValue.label.trim()}
                    className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black">
                    添加
                  </button>
                  <button onClick={() => setEditingOption(null)} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">取消</button>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-100">
              {option.values.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-gray-400">暂无选项值，点击「添加选项值」</div>
              ) : option.values.map(val => (
                <div key={val.id} className="px-5 py-3 hover:bg-gray-50 flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Value</label>
                      <input value={val.value} onChange={e => updateOptionValue(option.id, val.id, 'value', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Label</label>
                      <input value={val.label} onChange={e => updateOptionValue(option.id, val.id, 'label', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                    </div>
                    {paramFields.length > 0 && paramFields.map(f => (
                      <div key={f.key}>
                        <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                        <input type="number" step="0.01" value={val.params[f.key] ?? 0}
                          onChange={e => updateValueParam(option.id, val.id, f.key, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1 pt-4">
                    <button onClick={() => moveValue(option.id, val.id, 'up')} disabled={val.sort_order === 0}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30">↑</button>
                    <button onClick={() => moveValue(option.id, val.id, 'down')} disabled={val.sort_order === option.values.length - 1}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30">↓</button>
                    <button onClick={() => deleteOptionValue(option.id, val.id)}
                      className="px-2 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded">删</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
