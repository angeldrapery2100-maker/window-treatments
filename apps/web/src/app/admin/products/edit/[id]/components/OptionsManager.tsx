'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AAPP_STYLE_ORDER, AAPP_STYLE_LABELS, AAPP_STYLE_ZH,
  AAPP_LINING_ORDER, AAPP_LINING_LABELS,
  AAPP_OPERATION_ORDER, AAPP_OPERATION_LABELS, AAPP_OPERATION_ZH,
  normalizePleatStyleValue,
} from './aappPresets'

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
  /** Unsaved edit-page draft of default_config.options (shared with
   *  ParamsConfig's auto-sync so the two tabs never fight — the option's
   *  values array is the single source of truth). */
  optionsDraft?: ProductOption[] | null
  /** Unsaved edit-page draft of default_config.params (used to detect
   *  aapp_engine === 'drapery' without a stale re-fetch). */
  paramsDraft?: Record<string, any> | null
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

// AAPP drapery mode: no free-text pleat_style — style/lining/operation are
// engine-managed (auto-synced from the 计算参数 tab).
const AAPP_DRAPERY_DEFAULTS: ProductOption[] = [
  { id: 'style', name: 'style', type: 'select', display_label: 'Style', values: [] },
  { id: 'fabric_color', name: 'fabric_color', type: 'select', display_label: 'Fabric Color', values: [] },
  { id: 'lining', name: 'lining', type: 'select', display_label: 'Lining', values: [] },
  { id: 'operation', name: 'operation', type: 'select', display_label: 'Operation', values: [] },
  { id: 'return', name: 'return', type: 'select', display_label: 'Return', values: [] },
]

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

// AAPP fabric option: advanced-only per-color overrides (0 / empty = use the
// product-level price from 计算参数; the engine ignores non-positive values).
const AAPP_FABRIC_ADV_FIELDS = [
  { key: 'fabric_price_per_yard', label: '单色覆盖：面料单价 ($/yd)' },
  { key: 'fabric_width_in', label: '单色覆盖：幅宽 (inch)' },
]

const isFabricOptionName = (name: string) => name === 'fabric_color' || name === 'fabric'

export default function OptionsManager({ productType, productId, onChange, optionsDraft, paramsDraft }: OptionsManagerProps) {
  const [options, setOptions] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [aapp, setAapp] = useState(false)
  const [editingOption, setEditingOption] = useState<string | null>(null)
  const [newValue, setNewValue] = useState<{ value: string; label: string }>({ value: '', label: '' })
  // Per-option 高级 panel (fabric: per-color price overrides; generic: manual value edit)
  const [advOpen, setAdvOpen] = useState<Record<string, boolean>>({})
  const [advAutoHint, setAdvAutoHint] = useState<Record<string, boolean>>({})
  const [migrationMsg, setMigrationMsg] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { init() }, [productId, productType])

  const init = async () => {
    // 1. AAPP mode detection (drapery only). Mirrors ParamsConfig: undefined /
    //    missing params → engine default ON; '' → explicit legacy opt-out.
    let aappOn = false
    if (productType === 'drapery') {
      try {
        let p: Record<string, any> | null = paramsDraft || null
        if (!p) {
          const res = await fetch(`/api/admin/products/${productId}/params`)
          const data = await res.json()
          p = data.success && data.data.params ? data.data.params : null
        }
        const engine = p ? p.aapp_engine : undefined
        aappOn = engine === 'drapery' || engine === undefined
      } catch {
        aappOn = true
      }
    }
    setAapp(aappOn)

    // 2. Options: prefer the unsaved page draft (kept in sync with
    //    ParamsConfig's auto-managed style/lining/operation), then the server.
    let existing: ProductOption[] | null =
      Array.isArray(optionsDraft) && optionsDraft.length > 0 ? (optionsDraft as ProductOption[]) : null
    if (!existing) {
      try {
        const res = await fetch(`/api/admin/products/${productId}/options`)
        const data = await res.json()
        if (data.success && data.data.options?.length > 0) existing = data.data.options as ProductOption[]
      } catch { existing = null }
    }

    const defaults = productType === 'drapery' && aappOn
      ? AAPP_DRAPERY_DEFAULTS
      : (DEFAULT_OPTIONS[productType] || [])

    let merged: ProductOption[]
    if (existing) {
      // Migrate: rename fabric_code → fabric_color for shade products
      if (productType === 'shade') {
        existing = existing.map(o => o.name === 'fabric_code'
          ? { ...o, id: 'fabric_color', name: 'fabric_color', display_label: 'Fabric Color' }
          : o
        )
      }
      merged = [...existing]
      for (const def of defaults) {
        if (!merged.find(e => e.name === def.name)) merged.push({ ...def, values: [] })
      }
    } else {
      merged = defaults.map(d => ({ ...d, values: [] }))
    }
    setOptions(merged)

    // 3. Existing per-color overrides → auto-open the 高级 panel with a hint
    //    (never silently hide data that affects pricing).
    if (aappOn) {
      const auto: Record<string, boolean> = {}
      for (const o of merged) {
        if (isFabricOptionName(o.name) &&
            (o.values || []).some(v => Number(v?.params?.fabric_price_per_yard) > 0)) {
          auto[o.id] = true
        }
      }
      if (Object.keys(auto).length > 0) {
        setAdvOpen(prev => ({ ...prev, ...auto }))
        setAdvAutoHint(auto)
      }
    }
    setLoading(false)
  }

  const update = useCallback((updated: ProductOption[]) => {
    setOptions(updated)
    onChange(updated)
  }, [onChange])

  const addOptionValue = (optionId: string) => {
    if (!newValue.value.trim() || !newValue.label.trim()) return
    const option = options.find(o => o.id === optionId)
    if (!option) return
    // AAPP mode: leave params empty — 0-valued seeds would read as "has
    // override fields" and clutter the 高级 panel logic.
    const defaultParams: Record<string, any> = {}
    if (!aapp) {
      const paramFields = PARAM_FIELDS[productType]?.[option.name] || []
      paramFields.forEach(f => { defaultParams[f.key] = 0 })
    }
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

  /** Single-input convenience: one text field writes BOTH value and label. */
  const updateValueBoth = (optionId: string, valueId: string, text: string) =>
    update(options.map(o => o.id !== optionId ? o : {
      ...o, values: o.values.map(v => v.id === valueId ? { ...v, value: text, label: text } : v)
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

  // ── AAPP style pick-list: checked = value present, order = engine order ──
  const toggleStyleKey = (optionId: string, key: string) => {
    update(options.map(o => {
      if (o.id !== optionId) return o
      const cur = new Set(o.values.map(v => v.value))
      if (cur.has(key)) cur.delete(key)
      else cur.add(key)
      const values = AAPP_STYLE_ORDER.filter(k => cur.has(k)).map((k, i) => {
        const existing = o.values.find(v => v.value === k)
        return existing
          ? { ...existing, sort_order: i }
          : { id: `style_${k}`, value: k, label: AAPP_STYLE_LABELS[k] || k, params: {}, sort_order: i }
      })
      return { ...o, values }
    }))
  }

  // ── One-click pleat_style → style migration ──
  const migratePleatStyle = (legacyOptionId: string) => {
    const idx = options.findIndex(o => o.id === legacyOptionId)
    if (idx < 0) return
    const legacy = options[idx]
    const dropped: string[] = []
    const recognized = new Set<string>()
    for (const v of legacy.values || []) {
      const k = normalizePleatStyleValue(v.value) || normalizePleatStyleValue(v.label)
      if (k) recognized.add(k)
      else dropped.push(v.label || v.value)
    }

    const styleIdx = options.findIndex(o => o.name === 'style')
    const existingStyle = styleIdx >= 0 ? options[styleIdx] : null
    const existingKeys = new Set((existingStyle?.values || []).map(v => v.value))
    const keys = AAPP_STYLE_ORDER.filter(k => recognized.has(k) || existingKeys.has(k))
    const styleValues = keys.map((k, i) => {
      const prev = existingStyle?.values.find(v => v.value === k)
      return prev
        ? { ...prev, sort_order: i }
        : { id: `style_${k}`, value: k, label: AAPP_STYLE_LABELS[k] || k, params: {}, sort_order: i }
    })

    const next = [...options]
    if (existingStyle && existingStyle.values.length > 0) {
      // Merge into the already-synced style option (keeps its position), drop pleat_style.
      next[styleIdx] = { ...existingStyle, values: styleValues }
      next.splice(idx, 1)
    } else {
      // Rename pleat_style in place (keeps its sort order); remove any empty
      // placeholder style option elsewhere in the list.
      next[idx] = { id: 'style', name: 'style', type: 'select', display_label: 'Style', values: styleValues }
      if (existingStyle) next.splice(next.findIndex(o => o === existingStyle), 1)
    }
    update(next)
    setMigrationMsg(dropped.length > 0
      ? `已迁移为引擎标准 style 选项（已勾选 ${keys.length} 个款式）。以下值无法识别，已丢弃：${dropped.join('、')}`
      : `已迁移为引擎标准 style 选项（已勾选 ${keys.length} 个款式）。记得点右上角保存。`)
    setEditingOption(null)
  }

  if (loading) return <div className="text-center py-8 text-gray-500">加载中...</div>

  return (
    <div className="space-y-6">
      {migrationMsg && (
        <div className="flex items-start justify-between px-4 py-3 rounded-lg border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">
          <span>✅ {migrationMsg}</span>
          <button onClick={() => setMigrationMsg(null)} className="ml-3 text-emerald-400 hover:text-emerald-600">✕</button>
        </div>
      )}

      {options.map(option => {
        const nameLc = (option.name || '').toLowerCase()
        const isAappStyle = aapp && option.name === 'style'
        const isAappLegacyPleat = aapp && nameLc === 'pleat_style'
        const isAappManaged = aapp && (option.name === 'lining' || option.name === 'operation')
        const isAappFabric = aapp && isFabricOptionName(option.name)
        const isAappGeneric = aapp && !isAappStyle && !isAappLegacyPleat && !isAappManaged && !isAappFabric
        const paramFields = PARAM_FIELDS[productType]?.[option.name] || []
        const adv = !!advOpen[option.id]
        const showAddButton = !isAappStyle && !isAappManaged && !isAappLegacyPleat
        const singleInputAdd = isAappFabric || (isAappGeneric && !adv)
        // Non-engine values sitting inside a style option (hand-typed before
        // the pick-list existed) — surfaced, and removed on the next toggle.
        const strayStyleValues = isAappStyle
          ? option.values.filter(v => !(AAPP_STYLE_ORDER as readonly string[]).includes(v.value))
          : []

        return (
          <div key={option.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="font-semibold text-gray-900">{option.display_label}</span>
                <code className="ml-3 text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">{option.name}</code>
                {isAappLegacyPleat && <span className="ml-2 text-xs text-amber-600 font-medium">待迁移</span>}
                {isAappStyle && <span className="ml-2 text-xs text-gray-400">（引擎标准款式，固定选项）</span>}
                {isAappManaged && <span className="ml-2 text-xs text-gray-400">（由计算参数自动管理）</span>}
                {!aapp && paramFields.length > 0 && <span className="ml-2 text-xs text-gray-400">（含价格参数）</span>}
              </div>
              <div className="flex items-center gap-2">
                {(isAappFabric || isAappGeneric) && (
                  <button
                    onClick={() => setAdvOpen(p => ({ ...p, [option.id]: !p[option.id] }))}
                    className={`px-3 py-1.5 text-xs border rounded-lg ${adv ? 'border-gray-800 text-gray-800 bg-gray-100' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {adv ? '▾' : '▸'} {isAappFabric ? '高级：单色价格覆盖' : '高级：手动编辑 Value'}
                  </button>
                )}
                {showAddButton && (
                  <button
                    onClick={() => { setEditingOption(editingOption === option.id ? null : option.id); setNewValue({ value: '', label: '' }) }}
                    className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-black"
                  >
                    + 添加选项值
                  </button>
                )}
              </div>
            </div>

            {/* ── AAPP legacy pleat_style: one-click migration ── */}
            {isAappLegacyPleat && (
              <div className="px-5 py-4 bg-amber-50">
                <p className="text-sm text-amber-800">
                  ⚠️ 检测到手工创建的 <code className="bg-amber-100 px-1 rounded">pleat_style</code>，点击迁移为引擎标准 style 选项。
                  自由文本无法被 AAPP 定价引擎识别，会导致该款式不计价。
                </p>
                {option.values.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {option.values.map(v => {
                      const k = normalizePleatStyleValue(v.value) || normalizePleatStyleValue(v.label)
                      return (
                        <span key={v.id} className={`text-xs px-2 py-0.5 rounded border ${k ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-red-300 bg-red-50 text-red-600'}`}>
                          {v.label || v.value}{k ? ` → ${k}` : '（无法识别，将丢弃）'}
                        </span>
                      )
                    })}
                  </div>
                )}
                <button
                  onClick={() => migratePleatStyle(option.id)}
                  className="mt-3 px-4 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  迁移为 style 选项
                </button>
              </div>
            )}

            {/* ── AAPP style: fixed engine pick-list（与计算参数的款式勾选双向同步）── */}
            {isAappStyle && (
              <div className="px-5 py-4">
                <p className="text-xs text-gray-400 mb-3">
                  勾选 = 前台提供该款式。Value / Label 为引擎内置，不可自由输入；与「计算参数」的款式勾选双向同步。
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AAPP_STYLE_ORDER.map(k => {
                    const on = option.values.some(v => v.value === k)
                    return (
                      <label key={k} className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer select-none text-xs ${on ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>
                        <input type="checkbox" checked={on} onChange={() => toggleStyleKey(option.id, k)} className="h-3.5 w-3.5 accent-gray-800" />
                        <span>
                          <span className="block text-gray-800">{AAPP_STYLE_ZH[k]}</span>
                          <span className="block text-[10px] text-gray-400">{AAPP_STYLE_LABELS[k]}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                {option.values.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">⚠️ 未勾选任何款式 — 前台将无款式可选，引擎会按 2fold_pinch 默认计价。</p>
                )}
                {strayStyleValues.length > 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    ⚠️ 存在引擎无法识别的值（将在下次勾选变动时移除）：{strayStyleValues.map(v => v.label || v.value).join('、')}
                  </p>
                )}
              </div>
            )}

            {/* ── AAPP lining / operation: read-only chips ── */}
            {isAappManaged && (
              <div className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {(option.values.length > 0
                    ? option.values.map(v => ({ k: v.value, l: v.label || v.value }))
                    : option.name === 'lining'
                      ? AAPP_LINING_ORDER.map(k => ({ k: k as string, l: AAPP_LINING_LABELS[k] }))
                      : AAPP_OPERATION_ORDER.map(k => ({ k: k as string, l: `${AAPP_OPERATION_ZH[k]} · ${AAPP_OPERATION_LABELS[k]}` }))
                  ).map(c => (
                    <span key={c.k} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                      <code className="text-[10px] text-gray-400">{c.k}</code> {c.l}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">由计算参数自动管理 — 此处不可编辑，价格为引擎内置。</p>
              </div>
            )}

            {/* ── Add-value form ── */}
            {showAddButton && editingOption === option.id && (
              <div className="px-5 py-4 bg-blue-50 border-b border-blue-200">
                {singleInputAdd ? (
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {isAappFabric ? '颜色名称（value 自动 = 名称）' : '名称（value 自动 = 名称）'}
                      </label>
                      <input
                        value={newValue.label}
                        onChange={e => setNewValue({ value: e.target.value, label: e.target.value })}
                        placeholder={isAappFabric ? '如: Ivory White' : '如: Standard'}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                        onKeyDown={e => e.key === 'Enter' && addOptionValue(option.id)}
                      />
                    </div>
                    <button onClick={() => addOptionValue(option.id)}
                      disabled={!newValue.label.trim()}
                      className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black">
                      添加
                    </button>
                    <button onClick={() => setEditingOption(null)} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">取消</button>
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* ── Value rows ── */}
            {!isAappStyle && !isAappManaged && !isAappLegacyPleat && (
              <>
                {isAappFabric && (
                  <div className="px-5 pt-3">
                    <p className="text-xs text-gray-400">所有颜色默认使用「计算参数」里的商品级面料价。</p>
                    {adv && advAutoHint[option.id] && (
                      <p className="text-xs text-amber-600 mt-1">已检测到单色价格覆盖，高级面板已自动展开（0 或留空 = 用商品级默认价）。</p>
                    )}
                  </div>
                )}
                <div className="divide-y divide-gray-100">
                  {option.values.length === 0 ? (
                    <div className="px-5 py-6 text-center text-sm text-gray-400">暂无选项值，点击「添加选项值」</div>
                  ) : option.values.map(val => (
                    <div key={val.id} className="px-5 py-3 hover:bg-gray-50 flex items-start gap-4">
                      {isAappFabric ? (
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">颜色名称（value = label）</label>
                          <input value={val.label || val.value}
                            onChange={e => updateValueBoth(option.id, val.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                          {adv && (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              {AAPP_FABRIC_ADV_FIELDS.map(f => (
                                <div key={f.key}>
                                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                                  <input type="number" step="0.01" value={val.params?.[f.key] ?? ''}
                                    placeholder="默认"
                                    onChange={e => updateValueParam(option.id, val.id, f.key, e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : isAappGeneric ? (
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">显示名称 Label</label>
                          <input value={val.label}
                            onChange={e => updateOptionValue(option.id, val.id, 'label', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                          {!adv && <p className="text-[11px] text-gray-400 mt-1">value: <code>{val.value}</code></p>}
                          {adv && (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Value（代码）</label>
                                <input value={val.value}
                                  onChange={e => updateOptionValue(option.id, val.id, 'value', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                              </div>
                              {paramFields.map(f => (
                                <div key={f.key}>
                                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                                  <input type="number" step="0.01" value={val.params?.[f.key] ?? 0}
                                    onChange={e => updateValueParam(option.id, val.id, f.key, parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
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
                              <input type="number" step="0.01" value={val.params?.[f.key] ?? 0}
                                onChange={e => updateValueParam(option.id, val.id, f.key, parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded" />
                            </div>
                          ))}
                        </div>
                      )}
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
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
