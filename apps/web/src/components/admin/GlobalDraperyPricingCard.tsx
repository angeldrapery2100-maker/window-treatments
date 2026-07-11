'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AAPP_LINING_LABELS,
  AAPP_LINING_TIERS,
} from '@/app/admin/products/edit/[id]/components/aappPresets'

// ─────────────────────────────────────────────────────────────────────────────
// Global drapery pricing (公用系统) — site-settings group `drapery_pricing`.
// ONE place to edit the lining/labor/banding tier prices shared by ALL
// drapery products. Server merge: engine defaults < these settings < product
// aapp_config (lib/productPricing.withGlobalDraperyConfig, used by BOTH
// pricing entry points).
//
// Extracted from ParamsConfig (store redesign P4) so the product 计算参数 tab
// and the admin Pricing Library page render the SAME implementation — one
// editor, one source of truth.
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

export default function GlobalDraperyPricingCard() {
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
