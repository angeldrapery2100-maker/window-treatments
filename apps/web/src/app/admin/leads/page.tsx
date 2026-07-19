'use client'

import { useState, useEffect, useCallback } from 'react'

// 线索热度（C1）：按引擎分（lead_events 近 90 天）给访客排热度,销售一眼看到
// 谁最值得跟。已登录客户带姓名/邮箱/电话;游客只显示热度与行为信号。
// 分数与 AI 销售摘要里给销售看的同一套口径。

interface Lead {
  ownerKey: string
  userId: string | null
  anonId: string | null
  name: string | null
  email: string | null
  phone: string | null
  score: number
  tier: 'hot' | 'warm' | 'cool'
  eventCount: number
  inquiries: number
  lastActivity: string
  topSignals: string[]
}

const TIER = {
  hot: { label: '🔥 热', cls: 'bg-red-50 text-red-700 border-red-200' },
  warm: { label: '🌤 温', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  cool: { label: '❄️ 冷', cls: 'bg-gray-50 text-gray-500 border-gray-200' },
} as const

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime()
  if (!Number.isFinite(d)) return ''
  const mins = Math.floor((Date.now() - d) / 60000)
  if (mins < 60) return `${mins} 分钟前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} 小时前`
  return `${Math.floor(hrs / 24)} 天前`
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'hot' | 'warm'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/leads')
      const json = await res.json().catch(() => null)
      if (json?.success) setLeads(json.data.leads || [])
      else setError(json?.error || '加载失败')
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])

  const shown = leads.filter((l) => (filter === 'all' ? true : filter === 'hot' ? l.tier === 'hot' : l.tier !== 'cool'))
  const counts = {
    hot: leads.filter((l) => l.tier === 'hot').length,
    warm: leads.filter((l) => l.tier === 'warm').length,
    total: leads.length,
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">线索热度 Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            近 90 天的访客,按互动引擎分排序。🔥 {counts.hot} · 🌤 {counts.warm} · 共 {counts.total}
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'hot', 'warm'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === f ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
              }`}
            >
              {f === 'all' ? '全部' : f === 'hot' ? '仅热' : '热+温'}
            </button>
          ))}
          <button onClick={() => void load()} className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:border-gray-500">
            刷新
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">加载中…</p>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
          还没有符合条件的线索。访客在网站上互动(AI 对话、询价、量窗、加购、留资)后会出现在这里。
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">热度</th>
                <th className="px-4 py-3">分</th>
                <th className="px-4 py-3">客户</th>
                <th className="px-4 py-3">主要行为</th>
                <th className="px-4 py-3">留资</th>
                <th className="px-4 py-3">最近活动</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => (
                <tr key={l.ownerKey} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${TIER[l.tier].cls}`}>{TIER[l.tier].label}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{l.score}</td>
                  <td className="px-4 py-3">
                    {l.name || l.email || l.phone ? (
                      <div>
                        {l.name && <div className="font-medium text-gray-900">{l.name}</div>}
                        <div className="text-xs text-gray-500">
                          {l.email && <span>{l.email}</span>}
                          {l.email && l.phone && <span> · </span>}
                          {l.phone && <a href={`tel:${l.phone}`} className="underline">{l.phone}</a>}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">游客(未登录)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {l.topSignals.map((s) => (
                        <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{l.inquiries > 0 ? <span className="font-medium text-emerald-600">✓ {l.inquiries}</span> : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{timeAgo(l.lastActivity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-gray-400">
        评分口径:留资 35 · 加购 20/上限40 · 方案条目 12/上限60 · HD/百叶询价 15/上限30 · 量窗 8/上限24 · AI 对话 2/上限20 · 活动访问 5/上限10 · 看方案 3/上限12。热 ≥70 · 温 ≥35。
      </p>
    </div>
  )
}
