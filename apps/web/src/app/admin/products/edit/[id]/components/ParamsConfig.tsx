'use client'

import { useState, useEffect, useCallback } from 'react'

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
  [key: string]: any
}

interface ParamsConfigProps {
  productType: 'drapery' | 'sheer' | 'shade' | 'hardware'
  productId: string
  onChange: (params: ProductParams) => void
}

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

export default function ParamsConfig({ productType, productId, onChange }: ParamsConfigProps) {
  const [params, setParams] = useState<ProductParams>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchParams() }, [productId])

  const fetchParams = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/params`)
      const data = await res.json()
      if (data.success && data.data.params) setParams(data.data.params)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const set = useCallback((key: keyof ProductParams, value: any) => {
    setParams(prev => {
      const updated = { ...prev, [key]: value }
      onChange(updated)
      return updated
    })
  }, [onChange])

  if (loading) return <div className="text-center py-8 text-gray-500">加载中...</div>

  const inputCls = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelCls = "block text-sm font-medium text-gray-700 mb-2"
  const hintCls = "text-xs text-gray-500 mt-1"

  return (
    <div className="space-y-6">
      {productType === 'drapery' && (
        <>
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
    </div>
  )
}
