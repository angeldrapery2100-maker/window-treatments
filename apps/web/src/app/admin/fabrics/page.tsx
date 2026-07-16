'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// 面料库(Fabric Library)— Luma 系列所有面料色号的总登记表:
// 面料代码(ME2-002)· 图片 · 名称 · 对应 Hardware(Cassette)颜色。
// 目录(家族/色号)来自 AAPP 的 SWATCH_FABRIC_TABLES;这里补齐 AAPP 缺的
// 名称/图片/hardware 颜色。商品页只显示图片+名称;代码用于下单/工单。
// 这张表是 AAPP library 同步与商品面料绑定的底座。

interface Fabric {
  code: string
  series: string
  family: string
  category: string
  name: string
  hardware_color: string
  image_url: string | null
  price_per_sqm: string | number | null
  is_active: boolean
  discontinued: boolean
}

const SERIES_TABS = [
  { key: 'roller', label: 'Roller' },
  { key: 'zebra', label: 'Zebra' },
  { key: 'sheer', label: 'Sheer' },
  { key: 'roman', label: 'Roman' },
]

const HW_COLORS = ['white', 'grey', 'beige', 'brown', 'black']
const HW_SWATCH: Record<string, string> = {
  white: '#ffffff', grey: '#9ca3af', beige: '#d6c7a1', brown: '#7c5a3a', black: '#1f2937',
}

const CAT_LABELS: Record<string, string> = {
  blackout: 'Blackout',
  light_filtering: 'Light Filter',
  screen: 'Sunscreen',
  special: 'Special',
  standard: 'Standard',
  room_darkening: 'Room Darkening',
  embroidered: 'Embroidered',
  textured: 'Textured',
  blackout_matching: 'Blackout Matching',
}

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState('roller')
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const [onlyIncomplete, setOnlyIncomplete] = useState(false)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [preview, setPreview] = useState<Fabric | null>(null)
  const uploadFor = useRef<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/fabrics')
      const json = await res.json()
      if (json?.success) setFabrics(json.data.fabrics || [])
    } catch { /* shown as empty */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const patch = async (code: string, body: Record<string, unknown>) => {
    setFabrics(prev => prev.map(f => (f.code === code ? { ...f, ...body } as Fabric : f)))
    setPreview(prev => (prev && prev.code === code ? ({ ...prev, ...body } as Fabric) : prev))
    try {
      await fetch('/api/admin/fabrics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...body }),
      })
    } catch { void load() }
  }

  const bulkFamilyColor = async (family: string, hardware_color: string) => {
    setFabrics(prev => prev.map(f => (f.family === family ? { ...f, hardware_color } : f)))
    try {
      await fetch('/api/admin/fabrics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family, hardware_color }),
      })
    } catch { void load() }
  }

  const runAction = async (action: 'sync' | 'import') => {
    setBusy(action)
    setNotice('')
    try {
      const res = await fetch('/api/admin/fabrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (json?.success) {
        const r = json.data.report
        setNotice(action === 'sync'
          ? `目录同步完成:新增 ${r.inserted},标记停用 ${r.discontinued},恢复 ${r.restored},共 ${r.total} 个色号。`
          : `导入完成:匹配到图片 ${r.matchedImages} 张、名称 ${r.matchedNames} 个(扫描 ${r.scannedValues} 个商品面料项)。`)
        await load()
      } else {
        setNotice(json?.error || '操作失败')
      }
    } catch {
      setNotice('操作失败')
    } finally {
      setBusy('')
    }
  }

  // Pull fabric family prices (and the full library snapshot) from AAPP.
  const syncAappPrices = async () => {
    setBusy('aapp')
    setNotice('')
    try {
      const res = await fetch('/api/admin/aapp-library', { method: 'POST' })
      const json = await res.json()
      if (json?.success) {
        const r = json.data.report
        setNotice(
          `AAPP 价格同步完成:${r.fabricFamiliesPriced} 个面料家族 / ${r.colorwaysPriced} 个色号已更新价格。` +
          (r.colorwaysDiscontinued ? ` ${r.colorwaysDiscontinued} 个色号因 AAPP 已下架被标记停产。` : '') +
          (r.colorwaysRestored ? ` ${r.colorwaysRestored} 个色号恢复可用。` : '')
        )
        await load()
      } else {
        setNotice(json?.error || 'AAPP 同步失败')
      }
    } catch {
      setNotice('AAPP 同步失败')
    } finally {
      setBusy('')
    }
  }

  // Bulk swatch import: loop the batched endpoint until every missing image
  // has been pulled from the AAPP app and re-hosted on our bucket.
  const importSwatches = async () => {
    setBusy('swatches')
    setNotice('抓取色卡图中… 0 张')
    let after = ''
    let localFilled = 0
    let uploaded = 0
    const allFailed: string[] = []
    try {
      for (let i = 0; i < 120; i++) {
        const res = await fetch('/api/admin/fabrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import-swatches', after }),
        })
        const json = await res.json()
        if (!json?.success) { setNotice(json?.error || '导入失败'); return }
        const b = json.data.batch
        if (b.localFilled) localFilled = b.localFilled
        uploaded += b.uploaded
        allFailed.push(...(b.failed || []))
        setNotice(`导入中… 本站图已关联 ${localFilled} 张,另抓取 ${uploaded} 张,剩余约 ${b.remaining}`)
        if (!b.nextCursor) break
        after = b.nextCursor
      }
      setNotice(
        `色卡图导入完成:${localFilled} 张直接使用本站现有图片,另从 AAPP 抓取 ${uploaded} 张。` +
        (allFailed.length ? ` 未找到 ${allFailed.length} 个(可手动补传):${allFailed.slice(0, 20).join(', ')}${allFailed.length > 20 ? ' …' : ''}` : '')
      )
      await load()
    } catch {
      setNotice(`导入中断(本站 ${localFilled} / 抓取 ${uploaded})— 再点一次会从断点继续。`)
    } finally {
      setBusy('')
    }
  }

  const pickImage = (code: string) => {
    uploadFor.current = code
    fileRef.current?.click()
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const code = uploadFor.current
    e.target.value = ''
    if (!file || !code) return
    setBusy(`img:${code}`)
    try {
      const fd = new FormData()
      fd.append('file', file)
      // Upload route requires a folder id (R2 key prefix) — fabric images all
      // live under products/fabric-library/.
      fd.append('productId', 'fabric-library')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      const url = json?.data?.url || json?.url
      if (url) await patch(code, { image_url: url })
    } catch { /* leave as-is */ } finally {
      setBusy('')
    }
  }

  const visible = useMemo(() => {
    let rows = fabrics.filter(f => f.series === series)
    if (category) rows = rows.filter(f => f.category === category)
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      rows = rows.filter(f => f.code.toLowerCase().includes(needle) || f.name.toLowerCase().includes(needle))
    }
    if (onlyIncomplete) rows = rows.filter(f => !f.discontinued && (!f.name || !f.hardware_color || !f.image_url))
    return rows
  }, [fabrics, series, category, q, onlyIncomplete])

  // Group by family, preserving order.
  const families = useMemo(() => {
    const out: { family: string; category: string; rows: Fabric[] }[] = []
    for (const f of visible) {
      const g = out.find(x => x.family === f.family)
      if (g) g.rows.push(f)
      else out.push({ family: f.family, category: f.category, rows: [f] })
    }
    return out
  }, [visible])

  const categories = useMemo(
    () => [...new Set(fabrics.filter(f => f.series === series).map(f => f.category))],
    [fabrics, series]
  )

  const seriesRows = fabrics.filter(f => f.series === series && !f.discontinued)
  const doneCount = seriesRows.filter(f => f.name && f.hardware_color && f.image_url).length

  return (
    <div className="p-6 max-w-6xl">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">面料库 Fabric Library</h1>
          <p className="mt-1 text-[13px] text-gray-500">
            代码 · 图片 · 名称 · Hardware 颜色。商品页只显示图片和名称;代码用于下单和工单。
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void importSwatches()}
            disabled={!!busy}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-[13px] text-gray-700 hover:border-gray-500 disabled:opacity-40"
            title="优先直接关联本站 public 里现有的色卡图(roller/sheer/zebra);缺的再从 AAPP 应用抓取"
          >
            {busy === 'swatches' ? '导入中…' : '一键导入色卡图'}
          </button>
          <button
            onClick={() => void runAction('import')}
            disabled={!!busy}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-[13px] text-gray-700 hover:border-gray-500 disabled:opacity-40"
          >
            {busy === 'import' ? '导入中…' : '从现有商品导入图/名'}
          </button>
          <button
            onClick={() => void syncAappPrices()}
            disabled={!!busy}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-[13px] text-gray-700 hover:border-gray-500 disabled:opacity-40"
            title="从 AAPP libraryExport 接口拉取每个面料家族的 $/sqm(需先批准并部署 AAPP 导出函数)"
          >
            {busy === 'aapp' ? '同步中…' : '同步 AAPP 价格'}
          </button>
          <button
            onClick={() => void runAction('sync')}
            disabled={!!busy}
            className="rounded-md bg-[#3d3d3d] px-4 py-2 text-[13px] text-white hover:bg-gray-700 disabled:opacity-40"
          >
            {busy === 'sync' ? '同步中…' : '同步 AAPP 目录'}
          </button>
        </div>
      </div>

      {notice && <p className="mb-4 rounded-md bg-blue-50 px-4 py-2.5 text-[13px] text-blue-800">{notice}</p>}

      {/* Series tabs + filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {SERIES_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setSeries(t.key); setCategory('') }}
            className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
              series === t.key ? 'bg-[#3d3d3d] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[13px] text-gray-700"
        >
          <option value="">全部类别</option>
          {categories.map(c => <option key={c} value={c}>{CAT_LABELS[c] || c}</option>)}
        </select>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="搜代码或名称…"
          className="w-44 rounded-md border border-gray-200 px-3 py-1.5 text-[13px] focus:border-gray-800 focus:outline-none"
        />
        <label className="flex items-center gap-1.5 text-[13px] text-gray-600">
          <input type="checkbox" checked={onlyIncomplete} onChange={e => setOnlyIncomplete(e.target.checked)} />
          只看待补
        </label>
        <span className="ml-auto text-[12px] text-gray-400">
          本系列已补齐 {doneCount} / {seriesRows.length}
        </span>
      </div>

      {loading ? (
        <p className="text-[13px] text-gray-500">加载中…</p>
      ) : families.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-10 text-center text-[13px] text-gray-400">
          没有符合条件的面料。
        </p>
      ) : (
        <div className="space-y-5">
          {families.map(g => (
            <div key={g.family} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                <span className="text-[13px] font-semibold text-gray-800">{g.family}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-500 border border-gray-200">
                  {CAT_LABELS[g.category] || g.category}
                </span>
                <span className="text-[11px] text-gray-400">{g.rows.length} 色</span>
                {Number(g.rows[0]?.price_per_sqm) > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                    ${Number(g.rows[0].price_per_sqm)}/sqm · AAPP
                  </span>
                )}
                <label className="ml-auto flex items-center gap-1.5 text-[11px] text-gray-400">
                  整族 Hardware:
                  <select
                    defaultValue=""
                    onChange={e => { if (e.target.value) { void bulkFamilyColor(g.family, e.target.value); e.target.value = '' } }}
                    className="rounded border border-gray-200 bg-white px-2 py-1 text-[12px] text-gray-700"
                  >
                    <option value="">选择…</option>
                    {HW_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <div className="divide-y divide-gray-50">
                {g.rows.map(f => (
                  <div key={f.code} className={`flex items-center gap-3 px-4 py-2 ${f.discontinued ? 'opacity-45' : ''}`}>
                    <code className="w-24 shrink-0 text-[12px] font-medium text-gray-800">{f.code}</code>
                    <div className="flex shrink-0 flex-col items-center gap-0.5">
                      <button
                        onClick={() => (f.image_url ? setPreview(f) : pickImage(f.code))}
                        disabled={busy === `img:${f.code}`}
                        className="h-11 w-16 overflow-hidden rounded border border-gray-200 bg-gray-50 transition-transform hover:scale-105"
                        title={f.image_url ? '点击放大查看' : '点击上传图片'}
                      >
                        {f.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.image_url} alt={f.code} className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">传图</span>
                        )}
                      </button>
                      <button
                        onClick={() => pickImage(f.code)}
                        disabled={busy === `img:${f.code}`}
                        className="text-[10px] text-gray-400 underline underline-offset-2 hover:text-gray-700"
                      >
                        {busy === `img:${f.code}` ? '上传中…' : '换图'}
                      </button>
                    </div>
                    <input
                      defaultValue={f.name}
                      key={`${f.code}:${f.name}`}
                      placeholder="面料名称(商品页显示)"
                      onBlur={e => { if (e.target.value.trim() !== f.name) void patch(f.code, { name: e.target.value.trim() }) }}
                      className="min-w-0 flex-1 rounded border border-transparent px-2 py-1.5 text-[13px] hover:border-gray-200 focus:border-gray-800 focus:outline-none"
                    />
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span
                        className="h-4 w-4 rounded-full border border-gray-300"
                        style={{ background: HW_SWATCH[f.hardware_color] || 'transparent' }}
                      />
                      <select
                        value={f.hardware_color}
                        onChange={e => void patch(f.code, { hardware_color: e.target.value })}
                        className="rounded border border-gray-200 bg-white px-2 py-1.5 text-[12px] text-gray-700"
                      >
                        <option value="">HW颜色…</option>
                        {HW_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {f.discontinued ? (
                      <span className="w-14 shrink-0 text-right text-[11px] text-red-400">已停产</span>
                    ) : (
                      <button
                        onClick={() => void patch(f.code, { is_active: !f.is_active })}
                        className={`w-14 shrink-0 rounded-full px-2 py-1 text-[11px] ${
                          f.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {f.is_active ? '在售' : '停用'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image lightbox — 看大图,顺手选 hardware 颜色 / 换图 */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold text-gray-900">
                {preview.code}
                {preview.name && <span className="ml-2 font-normal text-gray-500">{preview.name}</span>}
              </p>
              <button
                onClick={() => setPreview(null)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="关闭"
              >✕</button>
            </div>
            {preview.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.image_url}
                alt={preview.code}
                className="mt-3 max-h-[60vh] w-full rounded-lg object-contain bg-gray-50"
              />
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-500">Hardware 颜色:</span>
                {HW_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => void patch(preview.code, { hardware_color: c })}
                    title={c}
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                      preview.hardware_color === c ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                    style={{ background: HW_SWATCH[c] }}
                  />
                ))}
                {preview.hardware_color && (
                  <span className="text-[12px] text-gray-600">{preview.hardware_color}</span>
                )}
              </div>
              <button
                onClick={() => { pickImage(preview.code); setPreview(null) }}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-[12px] text-gray-600 hover:border-gray-500"
              >
                更换图片
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
