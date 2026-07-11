'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  AAPP_STYLE_ORDER, AAPP_STYLE_LABELS, AAPP_STYLE_ZH,
  AAPP_LINING_ORDER, AAPP_LINING_LABELS, AAPP_LINING_TIERS,
  AAPP_OPERATION_ORDER, AAPP_OPERATION_LABELS, AAPP_OPERATION_ZH,
  hasCjk,
} from './aappPresets'

interface ProductParams {
  fabric_width?: number
  width_multiplier?: number
  height_allowance?: number
  max_height?: number
  height_trigger?: number
  base_multiplier?: number
  increment_per_12?: number
  sheer_fabric_width?: number
  labor_per_panel?: number
  hardware_unit_price?: number
  base_length?: number
  // AAPP-parity engine (drapery)
  aapp_engine?: string
  aapp_fabric_price_per_yard?: number
  aapp_fabric_width_in?: number
  aapp_composition?: string
  aapp_sheer_price_per_yard?: number
  aapp_sheer_width_in?: number
  aapp_hardware_products?: string[]
  [key: string]: any
}

interface ParamsConfigProps {
  productType: 'drapery' | 'sheer' | 'shade' | 'hardware' | 'accessory'
  productId: string
  onChange: (params: ProductParams) => void
  /** Fired when this tab auto-syncs the product's default_config.options
   *  (AAPP drapery mode manages the style / lining / operation options). */
  onOptionsChange?: (options: any[]) => void
  /** Unsaved edit-page draft of default_config.options (e.g. edits made in the
   *  选项配置 tab that aren't saved yet). When present it replaces the server
   *  fetch so the two tabs stay in two-way sync on the same values array. */
  optionsDraft?: any[] | null
}

// ─────────────────────────────────────────────────────────────────────────────
// AAPP drapery — managed option definitions (option VALUE strings are AAPP keys,
// see docs/aapp-engine-wiring.md §3 and packages/shared/src/pricing/aapp/adapter.ts).
// Key/label constants live in ./aappPresets — shared with OptionsManager's
// fixed pick-list so the two tabs render the same engine presets.
// ─────────────────────────────────────────────────────────────────────────────

/** Upsert one managed option: keep option identity/labels/value params the
 *  admin already set, only enforce the value SET and ordering.
 *  English-only guard: stored default_config labels are customer-facing
 *  (the storefront renders display_label + value labels verbatim), so any
 *  Chinese found in an engine-managed option's labels is self-healed back to
 *  the English preset on the next sync/save. Custom ENGLISH labels are kept. */
function upsertManagedOption(options: any[], name: string, displayLabel: string, keys: string[], defaultLabels: Record<string, string>): any[] {
  const idx = options.findIndex((o: any) => o?.name === name)
  const prev = idx >= 0 ? options[idx] : null
  const prevValues: any[] = Array.isArray(prev?.values) ? prev.values : []
  const values = keys.map((k, i) => {
    const existing = prevValues.find((v: any) => v?.value === k)
    if (!existing) return { id: `${name}_${k}`, value: k, label: defaultLabels[k] || k, params: {}, sort_order: i }
    const label = !existing.label || hasCjk(existing.label) ? (defaultLabels[k] || k) : existing.label
    return { ...existing, label, sort_order: i }
  })
  const next = prev
    ? {
        ...prev,
        display_label: !prev.display_label || hasCjk(prev.display_label) ? displayLabel : prev.display_label,
        values,
      }
    : { id: name, name, type: 'select', display_label: displayLabel, values }
  const out = [...options]
  if (idx >= 0) out[idx] = next
  else out.push(next)
  return out
}

/** Full sync of the three engine-managed options for an AAPP drapery product. */
function syncAappDraperyOptions(options: any[], styleKeys: string[]): any[] {
  let out = upsertManagedOption(options, 'style', 'Pleat Style', styleKeys, AAPP_STYLE_LABELS)
  out = upsertManagedOption(out, 'lining', 'Lining', [...AAPP_LINING_ORDER], AAPP_LINING_LABELS)
  out = upsertManagedOption(out, 'operation', 'Operation', [...AAPP_OPERATION_ORDER], AAPP_OPERATION_LABELS)
  return out
}

/** Style keys currently offered (from the draft options). null → option absent. */
function readStyleKeys(options: any[] | null): string[] | null {
  if (!options) return null
  const opt = options.find((o: any) => o?.name === 'style')
  if (!opt) return null
  const vals: any[] = Array.isArray(opt.values) ? opt.values : []
  return AAPP_STYLE_ORDER.filter(k => vals.some((v: any) => v?.value === k))
}

/** Flatten each option value's numeric params — mirrors useProductData.buildOptionValues. */
function buildOptionValuesFromDraft(options: any[]): Record<string, Record<string, Record<string, number>>> {
  const optionValues: Record<string, Record<string, Record<string, number>>> = {}
  for (const opt of options || []) {
    const valMap: Record<string, Record<string, number>> = {}
    for (const v of opt?.values || []) {
      const nums: Record<string, number> = {}
      if (v?.params && typeof v.params === 'object') {
        Object.entries(v.params).forEach(([k, val]) => {
          if (typeof val === 'number') nums[k] = val
        })
      }
      Object.entries(v || {}).forEach(([k, val]) => {
        if (!['value', 'label', 'id', 'params', 'sort_order'].includes(k) && typeof val === 'number') {
          nums[k] = val as number
        }
      })
      valMap[v.value] = nums
    }
    if (Object.keys(valMap).length > 0) optionValues[opt.name] = valMap
  }
  return optionValues
}

// ─────────────────────────────────────────────────────────────────────────────
// Global drapery pricing (公用系统) — site-settings group `drapery_pricing`.
// ONE place to edit the lining/labor/banding tier prices shared by ALL
// drapery products. Server merge: engine defaults < these settings < product
// aapp_config (lib/productPricing.withGlobalDraperyConfig, used by BOTH
// pricing entry points).
// ─────────────────────────────────────────────────────────────────────────────

const DRAPERY_PRICING_DEFAULTS: Record<string, number> = {
  lining_no_price_per_yard: 0,  lining_no_labor_per_panel: 30,
  lining_lf_price_per_yard: 6,  lining_lf_labor_per_panel: 36,
  lining_bo_price_per_yard: 8,  lining_bo_labor_per_panel: 38,
  sheer_labor_per_panel: 26,
  banding_std_price_per_yard: 15,
  banding_prem_price_per_yard: 25,
  banding_labor_per_foot: 10,
}

function GlobalDraperyPricingCard() {
  const [values, setValues] = useState<Record<string, number>>(DRAPERY_PRICING_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/site-settings')
      const data = await res.json()
      if (data.success && data.data) {
        const next: Record<string, number> = { ...DRAPERY_PRICING_DEFAULTS }
        for (const key of Object.keys(DRAPERY_PRICING_DEFAULTS)) {
          const n = Number(data.data[key])
          if (Number.isFinite(n) && n >= 0) next[key] = n
        }
        setValues(next)
      }
    } catch { /* keep defaults */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = () => {
    const d: Record<string, string> = {}
    for (const [k, v] of Object.entries(values)) d[k] = String(v)
    setDraft(d)
    setEditing(true)
    setMsg('')
  }

  const save = async () => {
    setSaving(true); setMsg('')
    try {
      for (const key of Object.keys(DRAPERY_PRICING_DEFAULTS)) {
        const n = parseFloat(draft[key])
        const v = Number.isFinite(n) && n >= 0 ? n : DRAPERY_PRICING_DEFAULTS[key]
        if (v !== values[key]) {
          const res = await fetch('/api/admin/site-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: v }),
          })
          const data = await res.json()
          if (!data.success) throw new Error(key)
        }
      }
      await load()
      setEditing(false)
      setMsg('✅ 已保存（约 1 分钟内生效于所有报价）')
    } catch {
      setMsg('❌ 保存失败，请重试')
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(''), 5000)
    }
  }

  const numCell = (key: string) => editing ? (
    <input type="number" step="0.01" min="0" value={draft[key] ?? ''}
      onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
      className="w-20 px-1.5 py-0.5 border border-gray-300 rounded text-right font-mono text-xs" />
  ) : (
    <span className="font-mono">${values[key]}</span>
  )

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <h4 className="text-sm font-semibold text-gray-900">衬布 / Lining（全局参数，自动同步 lining 选项）</h4>
        {!editing ? (
          <button onClick={startEdit}
            className="shrink-0 ml-2 px-2.5 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
            编辑全局参数
          </button>
        ) : (
          <span className="shrink-0 ml-2 flex gap-1.5">
            <button onClick={save} disabled={saving}
              className="px-2.5 py-1 text-xs bg-gray-900 text-white rounded hover:bg-black disabled:opacity-50">
              {saving ? '保存中…' : '保存'}
            </button>
            <button onClick={() => { setEditing(false); setMsg('') }} disabled={saving}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded text-gray-500 hover:bg-gray-50">
              取消
            </button>
          </span>
        )}
      </div>
      {loading ? (
        <p className="text-xs text-gray-400 mt-3">加载全局定价…</p>
      ) : (
        <>
          <table className="w-full text-xs mt-3">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left py-1 font-medium">档位</th>
                <th className="text-right py-1 font-medium">衬布 $/yd</th>
                <th className="text-right py-1 font-medium">手工 $/幅</th>
              </tr>
            </thead>
            <tbody>
              {AAPP_LINING_TIERS.map(t => (
                <tr key={t.key} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-700">{t.key} · {t.zh} <span className="text-gray-400">{AAPP_LINING_LABELS[t.key]}</span></td>
                  <td className="py-1.5 text-right">{numCell(`lining_${t.key.toLowerCase()}_price_per_yard`)}</td>
                  <td className="py-1.5 text-right">{numCell(`lining_${t.key.toLowerCase()}_labor_per_panel`)}</td>
                </tr>
              ))}
              <tr className="border-b border-gray-50">
                <td className="py-1.5 text-gray-700">纱层手工 <span className="text-gray-400">Sheer Labor $/幅</span></td>
                <td className="py-1.5" />
                <td className="py-1.5 text-right">{numCell('sheer_labor_per_panel')}</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-1.5 text-gray-700">标准镶边 <span className="text-gray-400">Standard Banding $/yd</span></td>
                <td className="py-1.5 text-right">{numCell('banding_std_price_per_yard')}</td>
                <td className="py-1.5" />
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-1.5 text-gray-700">高级镶边 <span className="text-gray-400">Premium Banding $/yd</span></td>
                <td className="py-1.5 text-right">{numCell('banding_prem_price_per_yard')}</td>
                <td className="py-1.5" />
              </tr>
              <tr>
                <td className="py-1.5 text-gray-700">镶边手工 <span className="text-gray-400">Banding Labor $/ft</span></td>
                <td className="py-1.5" />
                <td className="py-1.5 text-right">{numCell('banding_labor_per_foot')}</td>
              </tr>
            </tbody>
          </table>
          {msg && <p className="text-xs mt-2">{msg}</p>}
          <p className="text-[11px] text-gray-400 mt-2">
            全局生效于所有 drapery 商品；与 AAPP 内部软件对应 library.draperyPricingCatalog — 两边改价需同步。
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            不提供高度加价系数（height multiplier）：AAPP 引擎定价不使用该参数（其目录里的 heightSurcharge 字段未参与计算），网站与内部软件保持一致。
          </p>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function SaveStartingPriceButton({ productId, total }: { productId: string; total: number | null }) {
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const save = async () => {
    if (total == null) return
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/products/${productId}/starting-price`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starting_price: total })
      })
      const data = await res.json()
      setMsg(data.success ? `✅ 已保存 $${total}` : '❌ 失败')
    } catch { setMsg('❌ 失败') }
    finally { setSaving(false); setTimeout(() => setMsg(''), 3000) }
  }

  return (
    <>
      <button onClick={save} disabled={saving || total == null}
        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed">
        {saving ? '保存中…' : '💾 保存为起始价'}
      </button>
      {msg && <span className="text-xs text-green-600 ml-1">{msg}</span>}
    </>
  )
}

function PricingPreview({ productType, params, productId }: {
  productType: string
  params: ProductParams
  productId: string
}) {
  const [width, setWidth] = useState('120')
  const [height, setHeight] = useState('100')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculate = useCallback(async () => {
    const w = parseInt(width)
    const h = parseInt(height)
    if (!w || !h || w < 12 || h < 12) return
    setLoading(true)
    setError('')
    try {
      const optRes = await fetch(`/api/admin/products/${productId}/options`)
      const optData = await optRes.json()
      const options: any[] = optData.data?.options || []
      const selectedOptions: Record<string, string> = {}
      const optionValues: Record<string, Record<string, Record<string, number>>> = {}
      options.forEach((opt: any) => {
        if (opt.values?.length > 0) {
          selectedOptions[opt.name] = opt.values[0].value
          const valMap: Record<string, Record<string, number>> = {}
          opt.values.forEach((v: any) => {
            const nums: Record<string, number> = {}
            if (v.params) Object.entries(v.params).forEach(([k, val]) => {
              if (typeof val === 'number') nums[k] = val
            })
            valMap[v.value] = nums
          })
          optionValues[opt.name] = valMap
        }
      })
      const baseParams: Record<string, any> = { ...params }
      if (productType === 'sheer') {
        const fabricColorOpt = options.find((o: any) => o.name === 'fabric_color')
        const firstVal = fabricColorOpt?.values?.[0]
        baseParams.sheer_unit_price = params.sheer_unit_price ?? (firstVal?.params?.fabric_price ?? 0)
      }
      const res = await fetch('/api/store/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType, input: { width: w, height: h }, baseParams, options: selectedOptions, optionValues })
      })
      const data = await res.json()
      if (data.ok) { setResult(data); setError('') }
      else { setError(data.error || 'Calculation failed'); setResult(null) }
    } catch (e: any) {
      setError(e.message); setResult(null)
    } finally { setLoading(false) }
  }, [width, height, params, productType, productId])

  useEffect(() => {
    const t = setTimeout(calculate, 600)
    return () => clearTimeout(t)
  }, [calculate])

  const isTotalLine = (key: string) => key === 'total'
  const isMoneyLine = (key: string) => ['labor_cost', 'fabric_cost', 'total'].includes(key)

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900">计算过程预览</h4>
        <span className="text-xs text-gray-400">修改参数后自动更新</span>
      </div>
      <div className="flex gap-3 mb-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">宽 (inch)</label>
          <input type="number" value={width} onChange={e => setWidth(e.target.value)}
            className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-center" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">高 (inch)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)}
            className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-center" />
        </div>
        <button onClick={calculate} disabled={loading}
          className="px-3 py-1.5 text-xs bg-[#3d3d3d] text-white rounded hover:bg-gray-700 disabled:opacity-50">
          {loading ? '计算中…' : '计算'}
        </button>
        <SaveStartingPriceButton productId={productId} total={result?.result?.total ?? null} />
      </div>
      {error && <div className="text-xs text-red-500 mb-3 px-3 py-2 bg-red-50 rounded">{error}</div>}
      {result?.explain && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 w-1/2">项目</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">数值</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.explain.map((line: any) => (
                <tr key={line.key} className={isTotalLine(line.key) ? 'bg-[#3d3d3d] text-white' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-2.5 text-xs ${isTotalLine(line.key) ? 'text-gray-200 font-medium' : 'text-gray-600'}`}>
                    <span className="block">{line.zh}</span>
                    <span className="text-[11px] text-gray-400">{line.en}</span>
                  </td>
                  <td className={`px-4 py-2.5 text-right font-mono text-xs font-medium ${isTotalLine(line.key) ? 'text-white text-base' : isMoneyLine(line.key) ? 'text-gray-900' : 'text-gray-700'}`}>
                    {isMoneyLine(line.key) ? `$${line.value}` : line.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function HardwarePricingPreview({ params, productId }: {
  params: ProductParams
  productId: string
}) {
  const [width, setWidth] = useState('96')
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastTotal, setLastTotal] = useState<number | null>(null)

  const calculate = useCallback(async () => {
    const w = parseFloat(width)
    if (!w || w < 20) return
    setLoading(true)
    setError('')
    try {
      const optRes = await fetch(`/api/admin/products/${productId}/options`)
      const optData = await optRes.json()
      const options: any[] = optData.data?.options || []
      const rodOpt = options.find((o: any) => o.name === 'rod')
      const rod = rodOpt?.values?.[0]
      const finialOpt = options.find((o: any) => o.name === 'finial')
      const finial = finialOpt?.values?.[0]
      const fixedPrice = rod?.params?.fixed_price ?? 0
      const pricePerFoot = rod?.params?.price_per_foot ?? 0
      const finialPrice = finial?.params?.finial_price ?? 0
      const baseLength = params.base_length ?? 48
      const extraInches = Math.max(0, w - baseLength)
      const extraFeet = Math.ceil(extraInches / 12)
      const unitPrice = fixedPrice + finialPrice + extraFeet * pricePerFoot
      const total = Math.round(unitPrice)
      setRows([
        { zh: '总宽度', en: 'Total Width', value: w + '"' },
        { zh: 'Rod 选项（示例）', en: 'Rod (first option)', value: rod?.label || '—（未设置）' },
        { zh: 'Finial 选项（示例）', en: 'Finial (first option)', value: finial?.label || '—（未设置）' },
        { zh: 'Rod 基础价格', en: 'Fixed Price', value: '$' + fixedPrice },
        { zh: '免费基础长度', en: 'Base Length', value: baseLength + '"' },
        { zh: '超出长度', en: 'Extra Length', value: extraInches + '"' },
        { zh: '计费尺数（不足一尺按一尺）', en: 'Extra Feet (ceil)', value: extraFeet + ' ft' },
        { zh: '长度单价', en: 'Price / Foot', value: '$' + pricePerFoot },
        { zh: '端头价格', en: 'Finial Price', value: '$' + finialPrice },
        { zh: '单价合计', en: 'Unit Price Total', value: '$' + total, total: true },
      ])
      setLastTotal(total)
    } catch (e: any) {
      setError(e.message); setRows([])
    } finally { setLoading(false) }
  }, [width, params, productId])

  useEffect(() => {
    const t = setTimeout(calculate, 600)
    return () => clearTimeout(t)
  }, [calculate])

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900">计算过程预览</h4>
        <span className="text-xs text-gray-400">使用第一个 Rod / Finial 选项作为示例</span>
      </div>
      <div className="flex gap-3 mb-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">宽度 (inch)</label>
          <input type="number" value={width} onChange={e => setWidth(e.target.value)}
            className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm text-center" />
        </div>
        <button onClick={calculate} disabled={loading}
          className="px-3 py-1.5 text-xs bg-[#3d3d3d] text-white rounded hover:bg-gray-700 disabled:opacity-50">
          {loading ? '计算中…' : '计算'}
        </button>
        <SaveStartingPriceButton productId={productId} total={lastTotal} />
      </div>
      {error && <div className="text-xs text-red-500 mb-3 px-3 py-2 bg-red-50 rounded">{error}</div>}
      {rows.length > 0 && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 w-1/2">项目</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">数值</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row: any) => (
                <tr key={row.en} className={row.total ? 'bg-[#3d3d3d]' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-2.5 text-xs ${row.total ? 'text-gray-200 font-medium' : 'text-gray-600'}`}>
                    <span className="block">{row.zh}</span>
                    <span className="text-[11px] text-gray-400">{row.en}</span>
                  </td>
                  <td className={`px-4 py-2.5 text-right font-mono font-medium ${row.total ? 'text-white text-base' : 'text-xs text-gray-700'}`}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AAPP drapery breakdown → bilingual rows (engine breakdown keys, spec §3)
// ─────────────────────────────────────────────────────────────────────────────

interface AappRow { key: string; zh: string; en: string; value: string; money?: boolean; total?: boolean }

const fmtNum = (v: any, dp = 3): string => {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '—')
  return String(Math.round(n * 10 ** dp) / 10 ** dp)
}
const fmtMoney = (v: any): string => {
  const n = Number(v)
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : '—'
}

function buildAappDraperyRows(bd: Record<string, any>, total: number): AappRow[] {
  const rows: AappRow[] = []
  const push = (key: string, zh: string, en: string, value: string, money = false) => {
    rows.push({ key, zh, en, value, money })
  }
  const has = (k: string) => bd[k] !== undefined && bd[k] !== '' && bd[k] !== null

  if (has('finishedWidthIn')) push('finishedWidthIn', '成品宽', 'Finished Width', `${fmtNum(bd.finishedWidthIn)}"`)
  if (has('finishedHeightIn')) push('finishedHeightIn', '成品高', 'Finished Height', `${fmtNum(bd.finishedHeightIn)}"`)
  if (has('operation')) {
    const op = String(bd.operation)
    push('operation', `开合方式 · ${AAPP_OPERATION_ZH[op] || op}`, 'Operation', AAPP_OPERATION_LABELS[op] || op)
  }
  if (has('styleKey')) {
    const sk = String(bd.styleKey)
    push('styleKey', `款式 · ${AAPP_STYLE_ZH[sk] || sk}`, 'Style', AAPP_STYLE_LABELS[sk] || sk)
  }

  // ── Main fabric layer ──
  if (has('mainOrientation')) push('mainOrientation', '主布做法', 'Face Orientation', bd.mainOrientation === 'railroaded' ? '横做 railroaded' : '竖拼 vertical')
  if (has('mainNp')) push('mainNp', bd.styleFamily === 'ripple' ? '载具数 N' : '褶数 np', bd.styleFamily === 'ripple' ? 'Carrier Count' : 'Pleats per Panel', fmtNum(bd.mainNp))
  // Derived pleat spacing (engine breakdown carries np; spacing = panelW/(np+1))
  if (bd.styleFamily === 'pleated' && has('mainNp') && has('finishedWidthIn')) {
    const panelW = String(bd.operation) === 'split' ? Number(bd.finishedWidthIn) / 2 : Number(bd.finishedWidthIn)
    const spacing = panelW / (Number(bd.mainNp) + 1)
    if (Number.isFinite(spacing)) push('spacing', '褶距 spacing', 'Pleat Spacing', `${fmtNum(spacing)}"`)
  }
  if (has('mainWps')) push('mainWps', '幅数 wps（每片）', 'Widths per Side', fmtNum(bd.mainWps))
  if (has('mainCutDrop')) push('mainCutDrop', '裁剪长 cutDrop', 'Cut Drop', `${fmtNum(bd.mainCutDrop)}"`)
  if (has('mainPerSide')) push('mainPerSide', '每片用布宽', 'Per-Side Fabric Width', `${fmtNum(bd.mainPerSide)}"`)
  if (has('mainFaceYds')) push('mainFaceYds', '面料用料 faceYds', 'Face Fabric Yardage', `${fmtNum(bd.mainFaceYds)} yd`)
  if (has('mainFabricAmt')) push('mainFabricAmt', '面料金额', 'Fabric Cost', fmtMoney(bd.mainFabricAmt), true)
  if (has('mainLiningType') && bd.mainLiningType !== 'NO') {
    push('mainLiningType', '衬布类型', 'Lining Type', String(bd.mainLiningType))
    if (has('mainLiningWps')) push('mainLiningWps', '衬布幅数', 'Lining Widths', fmtNum(bd.mainLiningWps))
    if (has('mainLiningYds')) push('mainLiningYds', '衬布用料 liningYds', 'Lining Yardage', `${fmtNum(bd.mainLiningYds)} yd`)
    if (has('mainLiningAmt')) push('mainLiningAmt', '衬布金额', 'Lining Cost', fmtMoney(bd.mainLiningAmt), true)
  }
  if (has('mainLaborWps')) push('mainLaborWps', '手工计费幅数 laborWps', 'Labor Widths', fmtNum(bd.mainLaborWps))
  if (has('mainLaborAmt')) push('mainLaborAmt', '手工费', 'Labor Cost', fmtMoney(bd.mainLaborAmt), true)
  if (has('mainTotal')) push('mainTotal', '主布层小计', 'Main Layer Subtotal', fmtMoney(bd.mainTotal), true)

  // ── Sheer layer ──
  if (has('sheerOrientation')) push('sheerOrientation', '纱层做法', 'Sheer Orientation', bd.sheerOrientation === 'railroaded' ? '横做 railroaded' : '竖拼 vertical')
  if (has('sheerPerSide')) push('sheerPerSide', '纱每片用布宽', 'Sheer Per-Side Width', `${fmtNum(bd.sheerPerSide)}"`)
  if (has('sheerYds')) push('sheerYds', '纱用料', 'Sheer Yardage', `${fmtNum(bd.sheerYds)} yd`)
  if (has('sheerFabricAmt')) push('sheerFabricAmt', '纱金额', 'Sheer Fabric Cost', fmtMoney(bd.sheerFabricAmt), true)
  if (has('sheerLaborWps')) push('sheerLaborWps', '纱手工幅数', 'Sheer Labor Widths', fmtNum(bd.sheerLaborWps))
  if (has('sheerLaborAmt')) push('sheerLaborAmt', '纱手工费', 'Sheer Labor Cost', fmtMoney(bd.sheerLaborAmt), true)
  if (has('sheerTotal')) push('sheerTotal', '纱层小计', 'Sheer Subtotal', fmtMoney(bd.sheerTotal), true)

  // ── Bundled hardware ──
  if (has('hardwareBilledFeet')) push('hardwareBilledFeet', '五金计费英尺 billedFeet', 'Hardware Billed Feet', `${fmtNum(bd.hardwareBilledFeet)} ft`)
  if (has('hardwareSubtotal')) push('hardwareSubtotal', '五金小计', 'Hardware Subtotal', fmtMoney(bd.hardwareSubtotal), true)

  // ── Banding ──
  if (has('bandingTotalCount')) push('bandingTotalCount', '镶边条数', 'Banding Pieces', fmtNum(bd.bandingTotalCount))
  if (has('bandingYardage')) push('bandingYardage', '镶边用料', 'Banding Yardage', `${fmtNum(bd.bandingYardage)} yd`)
  if (has('bandingFabricAmt')) push('bandingFabricAmt', '镶边面料金额', 'Banding Fabric Cost', fmtMoney(bd.bandingFabricAmt), true)
  if (has('bandingLaborAmt')) push('bandingLaborAmt', '镶边手工费', 'Banding Labor Cost', fmtMoney(bd.bandingLaborAmt), true)
  if (has('bandingTotal')) push('bandingTotal', '镶边小计', 'Banding Subtotal', fmtMoney(bd.bandingTotal), true)

  if (has('subtotalRaw')) push('subtotalRaw', '小计（未取整）', 'Subtotal (raw)', fmtMoney(bd.subtotalRaw), true)
  rows.push({ key: 'total', zh: '单价合计', en: 'Unit Price', value: `$${Math.round(total)}`, money: true, total: true })
  return rows
}

// Friendlier wording for the common engine failures.
function explainAappError(err: string): string {
  if (/no_spacing_solution/.test(err)) return `${err} — 该宽度在当前款式的褶距区间 (4.0"–4.75") 内无解，请换款式或调整宽度`
  if (/missing fabric_price_per_yard/.test(err)) return `${err} — 请填写「面料默认价」或在选项配置里给面料颜色设 fabric_price_per_yard`
  if (/missing sheer_price_per_yard/.test(err)) return `${err} — 请填写「纱层单价」`
  if (/hardware_product/.test(err)) return `${err} — 所选五金商品没有可用的价格模型（rod 基础价/每尺价）`
  return err
}

// ─────────────────────────────────────────────────────────────────────────────
// AAPP drapery preview — debounced auto-recalc against the REAL pricing route
// ─────────────────────────────────────────────────────────────────────────────

interface HwProduct { id: string; name: string; main_image_url: string | null; is_active: boolean }

function AappDraperyPreview({ productId, params, draftOptions, hwList }: {
  productId: string
  params: ProductParams
  draftOptions: any[]
  hwList: HwProduct[]
}) {
  const [width, setWidth] = useState('100')
  const [height, setHeight] = useState('96')
  const [sel, setSel] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ total: number; breakdown: Record<string, any> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const reqSeq = useRef(0)

  const styleKeys = readStyleKeys(draftOptions) ?? []
  const selectedHwIds: string[] = Array.isArray(params.aapp_hardware_products) ? params.aapp_hardware_products : []
  const hwChoices = selectedHwIds
    .map(id => hwList.find(h => h.id === id))
    .filter((h): h is HwProduct => !!h)

  // Fabric option (per-color overrides): any option whose values carry
  // fabric_price_per_yard, falling back to a plain 'fabric_color' option.
  const fabricOpt = useMemo(() => {
    const managed = new Set(['style', 'lining', 'operation'])
    return (draftOptions || []).find((o: any) =>
      !managed.has(o?.name) &&
      Array.isArray(o?.values) && o.values.length > 0 &&
      (o.values.some((v: any) => typeof v?.params?.fabric_price_per_yard === 'number') || o?.name === 'fabric_color')
    ) || null
  }, [draftOptions])

  // Keep selections valid as offerings change.
  useEffect(() => {
    setSel(prev => {
      const next = { ...prev }
      if (!next.style || !styleKeys.includes(next.style)) next.style = styleKeys[0] || ''
      if (!next.lining || !AAPP_LINING_ORDER.includes(next.lining as any)) next.lining = 'NO'
      if (!next.operation || !AAPP_OPERATION_ORDER.includes(next.operation as any)) next.operation = 'split'
      if (next.hardware_product && next.hardware_product !== 'none' && !selectedHwIds.includes(next.hardware_product)) {
        next.hardware_product = 'none'
      }
      if (!next.hardware_product) next.hardware_product = 'none'
      if (fabricOpt) {
        const vals = fabricOpt.values.map((v: any) => v.value)
        if (next.__fabric && !vals.includes(next.__fabric)) delete next.__fabric
      } else if (next.__fabric) {
        delete next.__fabric
      }
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(styleKeys), JSON.stringify(selectedHwIds), fabricOpt])

  const calculate = useCallback(async () => {
    const w = parseFloat(width)
    const h = parseFloat(height)
    if (!w || !h || w < 12 || h < 12) return
    const seq = ++reqSeq.current
    setLoading(true)
    try {
      const options: Record<string, string> = {}
      if (sel.style) options.style = sel.style
      if (sel.lining) options.lining = sel.lining
      if (sel.operation) options.operation = sel.operation
      if (fabricOpt && sel.__fabric) options[fabricOpt.name] = sel.__fabric
      if (sel.hardware_product && sel.hardware_product !== 'none') options.hardware_product = sel.hardware_product

      const res = await fetch('/api/store/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'drapery',
          input: { width: w, height: h },
          baseParams: { ...params },
          options,
          optionValues: buildOptionValuesFromDraft(draftOptions),
        })
      })
      const data = await res.json()
      if (seq !== reqSeq.current) return // stale response
      if (data.ok && data.result) { setResult(data.result); setError('') }
      else { setResult(null); setError(explainAappError(data.error || 'Calculation failed')) }
    } catch (e: any) {
      if (seq !== reqSeq.current) return
      setResult(null); setError(e.message)
    } finally {
      if (seq === reqSeq.current) setLoading(false)
    }
  }, [width, height, sel, params, draftOptions, fabricOpt])

  // Debounced AUTO-recalc on ANY field change (params draft, offerings,
  // preview selections, dimensions) — the "preview doesn't update" fix.
  useEffect(() => {
    const t = setTimeout(calculate, 400)
    return () => clearTimeout(t)
  }, [calculate])

  const rows = result ? buildAappDraperyRows(result.breakdown || {}, result.total) : []
  const selCls = 'w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white'

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900">计算过程预览 <span className="font-normal text-gray-400">/ AAPP Engine Preview</span></h4>
        <span className="text-xs text-gray-400">任何参数修改后 0.4 秒自动重算</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">成品宽 Width (inch)</label>
          <input type="number" value={width} onChange={e => setWidth(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">成品高 Height (inch)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">款式 Style</label>
          <select value={sel.style || ''} onChange={e => setSel(p => ({ ...p, style: e.target.value }))} className={selCls}>
            {styleKeys.length === 0 && <option value="">（未勾选款式）</option>}
            {styleKeys.map(k => <option key={k} value={k}>{AAPP_STYLE_LABELS[k] || k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">衬布 Lining</label>
          <select value={sel.lining || 'NO'} onChange={e => setSel(p => ({ ...p, lining: e.target.value }))} className={selCls}>
            {AAPP_LINING_ORDER.map(k => <option key={k} value={k}>{k} · {AAPP_LINING_LABELS[k]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">开合 Operation</label>
          <select value={sel.operation || 'split'} onChange={e => setSel(p => ({ ...p, operation: e.target.value }))} className={selCls}>
            {AAPP_OPERATION_ORDER.map(k => <option key={k} value={k}>{AAPP_OPERATION_ZH[k]} · {AAPP_OPERATION_LABELS[k]}</option>)}
          </select>
        </div>
        {fabricOpt && (
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">面料 {fabricOpt.display_label || 'Fabric'}</label>
            <select value={sel.__fabric || ''} onChange={e => setSel(p => ({ ...p, __fabric: e.target.value }))} className={selCls}>
              <option value="">默认价 (Default)</option>
              {fabricOpt.values.map((v: any) => <option key={v.value} value={v.value}>{v.label || v.value}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">配套五金 Rod/Track</label>
          <select value={sel.hardware_product || 'none'} onChange={e => setSel(p => ({ ...p, hardware_product: e.target.value }))} className={selCls}>
            <option value="none">不配 (None)</option>
            {hwChoices.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={calculate} disabled={loading}
            className="px-3 py-1.5 text-xs bg-[#3d3d3d] text-white rounded hover:bg-gray-700 disabled:opacity-50">
            {loading ? '计算中…' : '计算'}
          </button>
          <SaveStartingPriceButton productId={productId} total={result?.total ?? null} />
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-600 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded">
          ⚠️ 引擎报错 / Engine error: {error}
        </div>
      )}

      {rows.length > 0 && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 w-1/2">项目</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">数值</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(row => (
                <tr key={row.key} className={row.total ? 'bg-[#3d3d3d] text-white' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-2.5 text-xs ${row.total ? 'text-gray-200 font-medium' : 'text-gray-600'}`}>
                    <span className="block">{row.zh}</span>
                    <span className="text-[11px] text-gray-400">{row.en}</span>
                  </td>
                  <td className={`px-4 py-2.5 text-right font-mono text-xs font-medium ${row.total ? 'text-white text-base' : row.money ? 'text-gray-900' : 'text-gray-700'}`}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ParamsConfig({ productType, productId, onChange, onOptionsChange, optionsDraft }: ParamsConfigProps) {
  const [params, setParams] = useState<ProductParams>({})
  const [loading, setLoading] = useState(true)
  // Drapery AAPP mode: draft copy of default_config.options (style/lining/
  // operation are auto-managed here and reported up via onOptionsChange).
  const [draftOptions, setDraftOptions] = useState<any[] | null>(null)
  const [hwList, setHwList] = useState<HwProduct[] | null>(null)

  useEffect(() => { fetchParams() }, [productId])

  const fetchParams = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/params`)
      const data = await res.json()
      if (data.success && data.data.params) {
        const p: ProductParams = { ...data.data.params }
        // AAPP-parity engine is the DEFAULT for drapery. aapp_engine === ''
        // is the explicit legacy opt-out (isAappConfigured treats '' as off).
        if (productType === 'drapery' && p.aapp_engine === undefined) {
          p.aapp_engine = 'drapery'
        }
        setParams(p)
      } else if (productType === 'drapery') {
        setParams({ aapp_engine: 'drapery' })
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Drapery only: load options draft + hardware product list.
  useEffect(() => {
    if (productType !== 'drapery') return
    // Prefer the page's unsaved draft (edits from the 选项配置 tab) so the
    // 款式勾选 checkboxes and OptionsManager's pick-list never fight.
    if (Array.isArray(optionsDraft) && optionsDraft.length > 0) {
      setDraftOptions(optionsDraft)
    } else {
      fetch(`/api/admin/products/${productId}/options`)
        .then(r => r.json())
        .then(d => setDraftOptions(d.data?.options || []))
        .catch(() => setDraftOptions([]))
    }
    fetch('/api/admin/products?type=hardware&status=all&limit=200')
      .then(r => r.json())
      .then(d => setHwList((d.data?.products || []).map((p: any) => ({
        id: p.id, name: p.name, main_image_url: p.main_image_url || null, is_active: !!p.is_active,
      }))))
      .catch(() => setHwList([]))
  }, [productType, productId])

  const set = useCallback((key: keyof ProductParams, value: any) => {
    setParams(prev => {
      const updated = { ...prev, [key]: value }
      onChange(updated)
      return updated
    })
  }, [onChange])

  const setMany = useCallback((patch: Record<string, any>, removals: string[] = []) => {
    setParams(prev => {
      const updated: ProductParams = { ...prev, ...patch }
      removals.forEach(k => { delete updated[k] })
      onChange(updated)
      return updated
    })
  }, [onChange])

  const aappOn = productType === 'drapery' && params.aapp_engine === 'drapery'

  const applyOptionsSync = useCallback((base: any[], styleKeys: string[]) => {
    const synced = syncAappDraperyOptions(base, styleKeys)
    if (JSON.stringify(synced) !== JSON.stringify(base)) {
      setDraftOptions(synced)
      onOptionsChange?.(synced)
      // Keep params and options consistent in the same save: the synced
      // options only make sense with aapp_engine='drapery', so report the
      // current params draft upward too (it carries the default-ON flag).
      setParams(prev => { onChange(prev); return prev })
    } else {
      setDraftOptions(base)
    }
  }, [onOptionsChange, onChange])

  // Reconcile once options are loaded (creates missing style/lining/operation
  // options, repairs value sets) — marks the page dirty only when it actually
  // changed something.
  useEffect(() => {
    if (!aappOn || !draftOptions) return
    const styles = readStyleKeys(draftOptions) ?? ['2fold_pinch', '3fold_pinch']
    applyOptionsSync(draftOptions, styles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aappOn, draftOptions === null])

  const toggleStyle = (key: string) => {
    if (!draftOptions) return
    const current = new Set(readStyleKeys(draftOptions) ?? [])
    if (current.has(key)) current.delete(key)
    else current.add(key)
    const ordered = AAPP_STYLE_ORDER.filter(k => current.has(k))
    applyOptionsSync(draftOptions, ordered)
  }

  const toggleHardwareProduct = (id: string) => {
    const cur: string[] = Array.isArray(params.aapp_hardware_products) ? params.aapp_hardware_products : []
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]
    set('aapp_hardware_products', next)
  }

  if (loading) return <div className="text-center py-8 text-gray-500">加载中...</div>

  const inputCls = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelCls = "block text-sm font-medium text-gray-700 mb-2"
  const hintCls = "text-xs text-gray-500 mt-1"

  const checkedStyles = new Set(readStyleKeys(draftOptions) ?? [])
  const sheerOn = params.aapp_composition === 'fabric_plus_sheer'
  const selectedHwIds: string[] = Array.isArray(params.aapp_hardware_products) ? params.aapp_hardware_products : []

  return (
    <div className="space-y-6">
      {productType === 'drapery' && (
        <>
          {/* ── AAPP engine switch ── */}
          <div className={`flex items-start justify-between rounded-lg border p-4 ${aappOn ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
            <div>
              <p className="text-sm font-semibold text-gray-900">AAPP 对齐引擎 <span className="font-normal text-gray-500">/ AAPP-Parity Pricing Engine</span></p>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                启用后与内部 AAPP 软件 1:1 同一套打褶求解器定价（spacing-first 褶距算法 + 幅数/衬布/手工规则），
                不再使用旧的「宽度倍率 × 3」模型。关闭则保留旧模型（仅用于历史商品）。
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 ml-4">
              <input
                type="checkbox"
                checked={aappOn}
                onChange={e => {
                  if (e.target.checked) set('aapp_engine', 'drapery')
                  else set('aapp_engine', '')  // '' = explicit legacy opt-out
                }}
                className="h-4 w-4 accent-emerald-600"
              />
              <span className={`text-sm font-medium ${aappOn ? 'text-emerald-700' : 'text-gray-500'}`}>{aappOn ? 'ON' : 'OFF'}</span>
            </label>
          </div>

          {aappOn ? (
            <>
              {/* ── Main fabric defaults ── */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>面料默认价 / Fabric Price ($/yd)</label>
                  <input type="number" step="0.01" value={params.aapp_fabric_price_per_yard ?? ''}
                    onChange={e => set('aapp_fabric_price_per_yard', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    className={inputCls} placeholder="如 30" />
                  <p className={hintCls}>每码单价。各颜色可在「选项配置」的面料选项值上用 fabric_price_per_yard 单独覆盖。</p>
                </div>
                <div>
                  <label className={labelCls}>面料幅宽 / Fabric Width (inch)</label>
                  <input type="number" step="0.1" value={params.aapp_fabric_width_in ?? ''}
                    onChange={e => set('aapp_fabric_width_in', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    className={inputCls} placeholder="默认 55" />
                  <p className={hintCls}>默认 55"。≥110" 自动判横做（railroaded）。各颜色可用 fabric_width_in 覆盖。</p>
                </div>
              </div>

              {/* ── Sheer layer ── */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sheerOn}
                    onChange={e => {
                      if (e.target.checked) set('aapp_composition', 'fabric_plus_sheer')
                      else setMany({}, ['aapp_composition', 'aapp_sheer_price_per_yard', 'aapp_sheer_width_in'])
                    }}
                    className="h-4 w-4 accent-gray-800"
                  />
                  <span className="text-sm font-medium text-gray-800">纱层 / Sheer Layer（主布 + 纱双层）</span>
                </label>
                <p className="text-xs text-gray-400 mt-1 ml-6">启用后此商品所有报价均含纱层（composition = fabric_plus_sheer）。如需让客户自选，请在选项配置中手动添加 composition 选项。</p>
                {sheerOn && (
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className={labelCls}>纱层单价 / Sheer Price ($/yd)</label>
                      <input type="number" step="0.01" value={params.aapp_sheer_price_per_yard ?? ''}
                        onChange={e => set('aapp_sheer_price_per_yard', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        className={inputCls} placeholder="如 18" />
                    </div>
                    <div>
                      <label className={labelCls}>纱层幅宽 / Sheer Width (inch)</label>
                      <input type="number" step="0.1" value={params.aapp_sheer_width_in ?? ''}
                        onChange={e => set('aapp_sheer_width_in', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        className={inputCls} placeholder="默认 55" />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Style offering (auto-syncs the 'style' option) ── */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900">款式提供 / Styles Offered</h4>
                <p className="text-xs text-gray-400 mt-1 mb-3">勾选即自动同步商品的 style 选项（客户前台可选）。已有的自定义 label 会保留。</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AAPP_STYLE_ORDER.map(k => (
                    <label key={k} className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer select-none text-xs ${checkedStyles.has(k) ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>
                      <input type="checkbox" checked={checkedStyles.has(k)} onChange={() => toggleStyle(k)} className="h-3.5 w-3.5 accent-gray-800" />
                      <span>
                        <span className="block text-gray-800">{AAPP_STYLE_ZH[k]}</span>
                        <span className="block text-[10px] text-gray-400">{AAPP_STYLE_LABELS[k]}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {checkedStyles.size === 0 && (
                  <p className="text-xs text-amber-600 mt-2">⚠️ 未勾选任何款式 — 前台将无款式可选，引擎会按 2fold_pinch 默认计价。</p>
                )}
              </div>

              {/* ── Lining / global drapery pricing (site-settings group) ── */}
              <div className="grid grid-cols-2 gap-6">
                <GlobalDraperyPricingCard />

                {/* ── Operation (auto-synced option) ── */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900">对开 / 单开（自动同步 operation 选项）</h4>
                  <ul className="text-xs text-gray-600 mt-3 space-y-1.5">
                    {AAPP_OPERATION_ORDER.map(k => (
                      <li key={k} className="flex items-center gap-2">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${k === 'split' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <span className="font-mono text-[11px] text-gray-400 w-24">{k}</span>
                        <span>{AAPP_OPERATION_ZH[k]} · {AAPP_OPERATION_LABELS[k]}</span>
                        {k === 'split' && <span className="text-[10px] text-emerald-600">默认</span>}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-gray-400 mt-3">对开 = 2 片（每片宽 = 成品宽 ÷ 2），单开 = 1 整片。片数直接进入褶距求解器。</p>
                </div>
              </div>

              {/* ── Matching hardware (real store products) ── */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900">配套五金 / Matching Rod-Track Add-on</h4>
                <p className="text-xs text-gray-400 mt-1 mb-3">
                  从商店的真实五金商品中多选。前台按所选商品显示卡片；价格取自该五金商品自己的配置，
                  杆长自动 = 窗帘成品宽。
                </p>
                {hwList === null ? (
                  <p className="text-xs text-gray-400">加载五金商品…</p>
                ) : hwList.length === 0 ? (
                  <p className="text-xs text-gray-400">商店暂无 Hardware 类商品 — 先到产品管理里创建窗帘杆商品。</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {hwList.map(h => {
                      const on = selectedHwIds.includes(h.id)
                      return (
                        <label key={h.id} className={`flex items-center gap-2.5 border rounded-lg p-2 cursor-pointer select-none ${on ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>
                          <input type="checkbox" checked={on} onChange={() => toggleHardwareProduct(h.id)} className="h-3.5 w-3.5 accent-gray-800 shrink-0" />
                          {h.main_image_url
                            ? <img src={h.main_image_url} alt="" className="w-10 h-10 object-cover rounded shrink-0" />
                            : <div className="w-10 h-10 bg-gray-100 rounded shrink-0 flex items-center justify-center text-gray-300 text-lg">▭</div>}
                          <span className="min-w-0">
                            <span className="block text-xs text-gray-800 truncate">{h.name}</span>
                            <span className={`block text-[10px] ${h.is_active ? 'text-emerald-600' : 'text-red-400'}`}>{h.is_active ? '上架中 Active' : '已下架 Inactive'}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── Live engine preview ── */}
              {draftOptions && (
                <AappDraperyPreview
                  productId={productId}
                  params={params}
                  draftOptions={draftOptions}
                  hwList={hwList || []}
                />
              )}
            </>
          ) : (
            <>
              {/* ── Legacy width-multiplier model (old products only) ── */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>面料幅宽 (Fabric Width)</label>
                  <input type="number" step="0.1" value={params.fabric_width ?? ''} onChange={e => set('fabric_width', parseFloat(e.target.value))} className={inputCls} placeholder="如 55" />
                  <p className={hintCls}>单位：英寸，默认 55</p>
                </div>
                <div>
                  <label className={labelCls}>宽度倍率 (Width Multiplier)</label>
                  <input type="number" step="0.1" value={params.width_multiplier ?? ''} onChange={e => set('width_multiplier', parseFloat(e.target.value))} className={inputCls} placeholder="如 3" />
                  <p className={hintCls}>用于计算 Panel Count，默认 3</p>
                </div>
                <div>
                  <label className={labelCls}>高度余量 (Height Allowance)</label>
                  <input type="number" step="1" value={params.height_allowance ?? ''} onChange={e => set('height_allowance', parseFloat(e.target.value))} className={inputCls} placeholder="如 16" />
                  <p className={hintCls}>单位：英寸，默认 16</p>
                </div>
                <div>
                  <label className={labelCls}>最大高度 (Max Height)</label>
                  <input type="number" step="1" value={params.max_height ?? ''} onChange={e => set('max_height', parseFloat(e.target.value))} className={inputCls} placeholder="如 240" />
                  <p className={hintCls}>单位：英寸，默认 240</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">高度倍率参数</h4>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className={labelCls}>触发高度 (Height Trigger)</label>
                    <input type="number" step="1" value={params.height_trigger ?? ''} onChange={e => set('height_trigger', parseFloat(e.target.value))} className={inputCls} placeholder="如 120" />
                    <p className={hintCls}>高度 ≥ 此值时应用倍率</p>
                  </div>
                  <div>
                    <label className={labelCls}>基础倍率 (Base Multiplier)</label>
                    <input type="number" step="0.1" value={params.base_multiplier ?? ''} onChange={e => set('base_multiplier', parseFloat(e.target.value))} className={inputCls} placeholder="如 1.5" />
                    <p className={hintCls}>默认 1.5</p>
                  </div>
                  <div>
                    <label className={labelCls}>每 12 英寸增量</label>
                    <input type="number" step="0.1" value={params.increment_per_12 ?? ''} onChange={e => set('increment_per_12', parseFloat(e.target.value))} className={inputCls} placeholder="如 0.1" />
                    <p className={hintCls}>超出部分每 12" 增加的倍率</p>
                  </div>
                </div>
              </div>
              <PricingPreview productType={productType} params={params} productId={productId} />
            </>
          )}
        </>
      )}

      {productType === 'sheer' && (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>纱帘幅宽 (Sheer Fabric Width)</label>
              <input type="number" step="0.1" value={params.sheer_fabric_width ?? ''} onChange={e => set('sheer_fabric_width', parseFloat(e.target.value))} className={inputCls} placeholder="如 110 或 55" />
              <p className={hintCls}>单位：英寸。≥110" 为超宽纱，小于110" 为普通纱</p>
            </div>
            <div>
              <label className={labelCls}>Labor 单价 ($/panel)</label>
              <input type="number" step="0.01" value={params.labor_per_panel ?? ''} onChange={e => set('labor_per_panel', parseFloat(e.target.value))} className={inputCls} placeholder="如 30" />
              <p className={hintCls}>每 panel 加工费，高度 ≥120" 时自动加倍</p>
            </div>
            <div>
              <label className={labelCls}>最大完成高度 (Max Finished Height)</label>
              <input type="number" step="1" value={params.max_height ?? ''} onChange={e => set('max_height', parseFloat(e.target.value))} className={inputCls} placeholder="如 240" />
              <p className={hintCls}>单位：英寸。前台超过此高度将无法下单</p>
            </div>
          </div>
          <PricingPreview productType={productType} params={params} productId={productId} />
        </>
      )}

      {productType === 'shade' && (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>高度调整值 (Height Adjustment)</label>
              <input type="number" step="0.1" value={params.height_adjustment ?? ''} onChange={e => set('height_adjustment', parseFloat(e.target.value))} className={inputCls} placeholder="如 12" />
              <p className={hintCls}>添加到用户输入高度的值（英寸）</p>
            </div>
            <div>
              <label className={labelCls}>五金件单价 (Hardware Unit Price)</label>
              <input type="number" step="0.01" value={params.hardware_unit_price ?? ''} onChange={e => set('hardware_unit_price', parseFloat(e.target.value))} className={inputCls} placeholder="如 20" />
              <p className={hintCls}>单位：美元/米</p>
            </div>
          </div>
          <PricingPreview productType={productType} params={params} productId={productId} />
        </>
      )}

      {productType === 'hardware' && (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>免费基础长度 (Base Length)</label>
              <input type="number" step="1" value={params.base_length ?? ''} onChange={e => set('base_length', parseFloat(e.target.value))} className={inputCls} placeholder="如 48" />
              <p className={hintCls}>单位：英寸。在此长度内不收额外长度费，默认 48"</p>
            </div>
          </div>
          <HardwarePricingPreview params={params} productId={productId} />
        </>
      )}

      {productType === 'accessory' && (
        <AccessoryParamsPanel productId={productId} params={params} set={set} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Accessory 配件（店铺重设计 P1）— 固定价 SKU，无计算引擎。
// 售价 = products.base_price（在「基础信息」标签编辑，随页面保存流程写入）；
// 这里只管两个 params：compare_at_price（划线价，前台删除线促销位）和
// related_product_ids（"Works with" 常配商品，前台成套推荐卡片）。
// ─────────────────────────────────────────────────────────────────────────────

interface RelatedPickProduct { id: string; name: string; type: string; main_image_url: string | null; is_active: boolean }

function AccessoryParamsPanel({ productId, params, set }: {
  productId: string
  params: ProductParams
  set: (key: keyof ProductParams, value: any) => void
}) {
  const [allProducts, setAllProducts] = useState<RelatedPickProduct[] | null>(null)

  useEffect(() => {
    fetch('/api/admin/products?status=all&limit=200')
      .then(r => r.json())
      .then(d => setAllProducts((d.data?.products || [])
        .filter((p: any) => p.id !== productId)
        .map((p: any) => ({
          id: p.id, name: p.name, type: p.type,
          main_image_url: p.main_image_url || null, is_active: !!p.is_active,
        }))))
      .catch(() => setAllProducts([]))
  }, [productId])

  const relatedIds: string[] = Array.isArray(params.related_product_ids) ? params.related_product_ids : []
  const toggleRelated = (id: string) => {
    const next = relatedIds.includes(id) ? relatedIds.filter(x => x !== id) : [...relatedIds, id]
    set('related_product_ids', next)
  }

  return (
    <div className="space-y-6">
      {/* No engine — fixed price */}
      <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
        <p className="text-sm font-semibold text-gray-900">固定价商品 <span className="font-normal text-gray-500">/ Fixed-Price Accessory（无计算引擎）</span></p>
        <p className="text-xs text-gray-600 mt-1">
          配件不走任何定价引擎：前台直接显示售价，结算按 售价 × 数量 收费
          （服务端沿用 base_price 最低价保护 + 5× 上限）。
        </p>
        <p className="text-xs text-gray-600 mt-1.5">
          💲 <strong>售价（base_price）与库存（stock_qty）在「基础信息」标签编辑</strong>，与本页改动一起保存。
          售价必须大于 0 才能发布。
        </p>
      </div>

      {/* Compare-at price */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">划线价 / Compare-at Price ($)</label>
          <input type="number" step="0.01" min="0" value={params.compare_at_price ?? ''}
            onChange={e => set('compare_at_price', e.target.value === '' ? undefined : parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="可选，如 59" />
          <p className="text-xs text-gray-500 mt-1">可选促销位：大于售价时前台显示删除线原价 + Sale 标签；留空不显示。</p>
        </div>
      </div>

      {/* Works-with cross-sell */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900">常配商品 / Works With</h4>
        <p className="text-xs text-gray-400 mt-1 mb-3">
          多选商店里的真实商品（如：遥控 → 电动卷帘）。前台在配件页下方渲染 "Works with" 成套推荐卡片；不选则该区块隐藏。
        </p>
        {allProducts === null ? (
          <p className="text-xs text-gray-400">加载商品列表…</p>
        ) : allProducts.length === 0 ? (
          <p className="text-xs text-gray-400">商店暂无其他商品。</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {allProducts.map(p => {
              const on = relatedIds.includes(p.id)
              return (
                <label key={p.id} className={`flex items-center gap-2.5 border rounded-lg p-2 cursor-pointer select-none ${on ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleRelated(p.id)} className="h-3.5 w-3.5 accent-gray-800 shrink-0" />
                  {p.main_image_url
                    ? <img src={p.main_image_url} alt="" className="w-10 h-10 object-cover rounded shrink-0" />
                    : <div className="w-10 h-10 bg-gray-100 rounded shrink-0 flex items-center justify-center text-gray-300 text-lg">▭</div>}
                  <span className="min-w-0">
                    <span className="block text-xs text-gray-800 truncate">{p.name}</span>
                    <span className={`block text-[10px] ${p.is_active ? 'text-emerald-600' : 'text-red-400'}`}>
                      {p.type} · {p.is_active ? '上架中' : '已下架'}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
