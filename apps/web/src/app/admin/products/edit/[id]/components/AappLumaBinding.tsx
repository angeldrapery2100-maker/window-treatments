'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// 绑定 AAPP 产品(Luma 系列)— 商品编辑页「计算参数」页签顶部的绑定卡片。
// 选型号 → 勾面料(来自面料库,价格来自 AAPP 同步)→ 勾 cassette / 操作方式
// → 应用。应用后商品的报价配置和选项全部自动生成;每次 AAPP 价格同步会
// 自动重放绑定,价格与上下架跟随 AAPP。应用会立即保存并刷新页面。

interface Cassette { key: string; label: string; pricePerMeter: number }
interface VariantChoice { key: string; label: string; series: string; cassettes: Cassette[] }
interface ControlChoice { key: string; label: string; surcharge: number }
interface FabricChoice {
  code: string; series: string; family: string; category: string
  name: string; image_url: string | null; price_per_sqm: string | number | null
}

interface Binding {
  variantKey: string
  fabricCodes: string[]
  cassetteKeys: string[]
  controlKeys: string[]
}

export default function AappLumaBinding({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState(false)
  const [binding, setBinding] = useState<Binding | null>(null)
  const [variants, setVariants] = useState<VariantChoice[]>([])
  const [controls, setControls] = useState<ControlChoice[]>([])
  const [fabrics, setFabrics] = useState<FabricChoice[]>([])
  const [open, setOpen] = useState(false)

  // Draft state
  const [variantKey, setVariantKey] = useState('')
  const [fabricSel, setFabricSel] = useState<Set<string>>(new Set())
  const [cassetteSel, setCassetteSel] = useState<Set<string>>(new Set())
  const [controlSel, setControlSel] = useState<Set<string>>(new Set(['plastic_chain']))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/luma-binding`)
      const json = await res.json()
      if (json?.success) {
        setSynced(!!json.data.synced)
        setBinding(json.data.binding)
        setVariants(json.data.variants || [])
        setControls(json.data.controls || [])
        setFabrics(json.data.fabrics || [])
        const b = json.data.binding
        if (b) {
          setVariantKey(b.variantKey || '')
          setFabricSel(new Set(b.fabricCodes || []))
          setCassetteSel(new Set(b.cassetteKeys || []))
          setControlSel(new Set(b.controlKeys?.length ? b.controlKeys : ['plastic_chain']))
          setOpen(true)
        }
      }
    } catch { /* card renders unavailable */ } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { void load() }, [load])

  const variant = variants.find(v => v.key === variantKey)
  const seriesFabrics = useMemo(
    () => (variant ? fabrics.filter(f => f.series === variant.series) : []),
    [fabrics, variant]
  )
  // Group by family for compact rendering.
  const families = useMemo(() => {
    const out: { family: string; price: number; rows: FabricChoice[] }[] = []
    for (const f of seriesFabrics) {
      const g = out.find(x => x.family === f.family)
      if (g) g.rows.push(f)
      else out.push({ family: f.family, price: Number(f.price_per_sqm) || 0, rows: [f] })
    }
    return out
  }, [seriesFabrics])

  const toggle = (set: Set<string>, v: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    setter(next)
  }

  const apply = async () => {
    if (!variantKey || fabricSel.size === 0 || saving) return
    if (!window.confirm('应用绑定会立即保存该商品的报价配置和选项,并刷新页面(其他未保存的更改会丢失)。继续?')) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/products/${productId}/luma-binding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_key: variantKey,
          fabric_codes: [...fabricSel],
          cassette_keys: [...cassetteSel],
          control_keys: [...controlSel],
        }),
      })
      const json = await res.json()
      if (json?.success) {
        const r = json.data.report
        const dropped = (r.droppedFabrics || []).map((d: any) => `${d.code}(${d.reason})`).join(', ')
        window.alert(
          `绑定完成:${r.keptFabrics.length} 款面料已上架。` +
          (dropped ? `\n未纳入:${dropped}` : '') +
          (r.deactivated ? '\n⚠️ 无可售面料,商品已自动下架。' : '')
        )
        window.location.reload()
      } else {
        setError(json?.error || '应用失败')
      }
    } catch {
      setError('应用失败')
    } finally {
      setSaving(false)
    }
  }

  const unbind = async () => {
    if (!window.confirm('解除绑定后商品恢复手动定价(选项中由绑定生成的部分会移除),页面将刷新。继续?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/luma-binding`, { method: 'DELETE' })
      const json = await res.json()
      if (json?.success) window.location.reload()
      else setError(json?.error || '解除失败')
    } catch { setError('解除失败') } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="text-[14px] font-medium text-gray-900">
          绑定 AAPP 产品(Luma)
          {binding && (
            <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-normal text-green-700">
              已绑定 · {variants.find(v => v.key === binding.variantKey)?.label || binding.variantKey} · {binding.fabricCodes?.length || 0} 款面料
            </span>
          )}
          {!binding && <span className="ml-2 text-[11px] font-normal text-gray-400">选型号、勾面料,报价全自动</span>}
        </span>
        <span className="text-gray-400">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4">
          {!synced ? (
            <p className="text-[13px] text-amber-600">
              还没有 AAPP library 快照 — 请先到 后台 → Fabrics 页点「同步 AAPP 价格」,再回来绑定。
            </p>
          ) : (
            <>
              {/* Variant */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-[13px] text-gray-600">产品型号</label>
                <select
                  value={variantKey}
                  onChange={e => { setVariantKey(e.target.value); setFabricSel(new Set()); setCassetteSel(new Set()) }}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px]"
                >
                  <option value="">选择…</option>
                  {variants.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
                </select>
              </div>

              {variant && (
                <>
                  {/* Cassettes */}
                  {variant.cassettes.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[12px] text-gray-500">Cassette(可多选,客户下单时选择)</p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {variant.cassettes.map(c => (
                          <label key={c.key} className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] ${cassetteSel.has(c.key) ? 'border-gray-800 bg-gray-50' : 'border-gray-200 text-gray-500'}`}>
                            <input type="checkbox" className="hidden" checked={cassetteSel.has(c.key)} onChange={() => toggle(cassetteSel, c.key, setCassetteSel)} />
                            {c.label} <span className="text-gray-400">${c.pricePerMeter}/m</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="mt-4">
                    <p className="text-[12px] text-gray-500">操作方式(可多选)</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {controls.map(c => (
                        <label key={c.key} className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] ${controlSel.has(c.key) ? 'border-gray-800 bg-gray-50' : 'border-gray-200 text-gray-500'}`}>
                          <input type="checkbox" className="hidden" checked={controlSel.has(c.key)} onChange={() => toggle(controlSel, c.key, setControlSel)} />
                          {c.label}
                          {c.key !== 'motorized' && c.surcharge > 0 && <span className="text-gray-400">+${c.surcharge}</span>}
                          {c.key === 'motorized' && <span className="text-gray-400">按电机价</span>}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Fabrics */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-gray-500">
                        面料(来自面料库 {variant.series} 系列;价格随 AAPP 同步)— 已选 {fabricSel.size}
                      </p>
                      <button
                        type="button"
                        onClick={() => setFabricSel(new Set())}
                        className="text-[11px] text-gray-400 underline underline-offset-2"
                      >清空</button>
                    </div>
                    {families.length === 0 ? (
                      <p className="mt-2 text-[12px] text-amber-600">该系列在面料库里没有可售面料(先去 Fabrics 页整理)。</p>
                    ) : (
                      <div className="mt-2 max-h-80 space-y-3 overflow-y-auto rounded-md border border-gray-100 p-3">
                        {families.map(g => (
                          <div key={g.family}>
                            <div className="flex items-center gap-2 text-[12px] text-gray-600">
                              <span className="font-medium">{g.family}</span>
                              {g.price > 0
                                ? <span className="text-emerald-600">${g.price}/sqm</span>
                                : <span className="text-amber-600">AAPP 无价格 — 不可选</span>}
                              <button
                                type="button"
                                disabled={g.price <= 0}
                                onClick={() => {
                                  const next = new Set(fabricSel)
                                  const all = g.rows.every(r => next.has(r.code))
                                  g.rows.forEach(r => { if (all) next.delete(r.code); else next.add(r.code) })
                                  setFabricSel(next)
                                }}
                                className="ml-auto text-[11px] text-gray-400 underline underline-offset-2 disabled:opacity-40"
                              >整族全选/取消</button>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {g.rows.map(f => (
                                <label
                                  key={f.code}
                                  title={f.name || f.code}
                                  className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] ${g.price <= 0 ? 'opacity-40 pointer-events-none' : ''} ${fabricSel.has(f.code) ? 'border-gray-800 bg-gray-50' : 'border-gray-200 text-gray-500'}`}
                                >
                                  <input type="checkbox" className="hidden" checked={fabricSel.has(f.code)} onChange={() => toggle(fabricSel, f.code, setFabricSel)} />
                                  {f.image_url
                                    // eslint-disable-next-line @next/next/no-img-element
                                    ? <img src={f.image_url} alt="" className="h-5 w-5 rounded object-cover" />
                                    : <span className="h-5 w-5 rounded bg-gray-100" />}
                                  {f.code}{f.name ? ` ${f.name}` : ''}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && <p className="mt-3 text-[12px] text-red-600">{error}</p>}

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void apply()}
                      disabled={saving || !variantKey || fabricSel.size === 0}
                      className="rounded-md bg-[#3d3d3d] px-5 py-2 text-[13px] text-white hover:bg-gray-700 disabled:opacity-40"
                    >
                      {saving ? '应用中…' : binding ? '更新绑定' : '应用绑定'}
                    </button>
                    {binding && (
                      <button
                        type="button"
                        onClick={() => void unbind()}
                        disabled={saving}
                        className="text-[12px] text-gray-400 underline underline-offset-2 hover:text-red-600"
                      >解除绑定</button>
                    )}
                    <span className="text-[11px] text-gray-400">应用即保存;AAPP 同步时自动更新价格与上下架</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
