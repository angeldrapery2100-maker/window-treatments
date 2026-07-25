'use client'

import { useState, useEffect, useCallback } from 'react'

// AI 客服使用与转化（AI 销售系统）。看：多少人打开过对话框、多少人真的聊了、
// 有多少档案是从聊天来的（vs 直接表单），以及可以点开看每段对话全文。

interface Summary {
  opened: number
  chatUsers: number
  chatTurns: number
  chatInquiries: number
  chatProjects: number
  formConsults: number
  openToChatPct: number | null
  chatToLeadPct: number | null
  chatShareOfLeadsPct: number | null
}

interface ConvRow {
  ownerKey: string
  updatedAt: string
  msgCount: number
  preview: string
  kind: 'signed-in' | 'guest'
}

interface Msg {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  bookingLink?: string
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime()
  if (!Number.isFinite(d)) return ''
  const mins = Math.floor((Date.now() - d) / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} 小时前`
  return `${Math.floor(hrs / 24)} 天前`
}

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-gray-900">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-gray-400">{hint}</p>}
    </div>
  )
}

export default function AssistantAnalyticsPage() {
  const [days, setDays] = useState(30)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [conversations, setConversations] = useState<ConvRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [openConv, setOpenConv] = useState<string | null>(null)
  const [convMsgs, setConvMsgs] = useState<Msg[] | null>(null)
  const [convLoading, setConvLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/assistant-analytics?days=${days}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '加载失败')
      setSummary(json.data.summary)
      setConversations(json.data.conversations || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => { void load() }, [load])

  const openTranscript = useCallback(async (ownerKey: string) => {
    setOpenConv(ownerKey)
    setConvMsgs(null)
    setConvLoading(true)
    try {
      const res = await fetch(`/api/admin/assistant-analytics?conversation=${encodeURIComponent(ownerKey)}`)
      const json = await res.json()
      setConvMsgs(json?.data?.conversation?.messages || [])
    } catch {
      setConvMsgs([])
    } finally {
      setConvLoading(false)
    }
  }, [])

  const s = summary

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-gray-900">AI 客服 · 使用与转化</h1>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                days === d ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {d} 天
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        近 {days} 天。"打开对话框"从埋点上线后开始计（更早的会话没有此数据）。
      </p>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {loading && !s && <p className="text-sm text-gray-400">加载中…</p>}

      {s && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <Card label="打开对话框" value={s.opened} hint="独立访客" />
            <Card label="聊天用户" value={s.chatUsers} hint="发过≥1条消息" />
            <Card label="对话轮数" value={s.chatTurns} />
            <Card label="聊天建档" value={s.chatInquiries} hint="via 聊天的预约/线索" />
            <Card label="聊天加项目" value={s.chatProjects} hint="Home Project" />
            <Card label="直接表单咨询" value={s.formConsults} hint="没走 AI" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <Card
              label="打开 → 真的聊"
              value={s.openToChatPct == null ? '—' : `${s.openToChatPct}%`}
              hint="打开后发消息的比例"
            />
            <Card
              label="聊天 → 建档"
              value={s.chatToLeadPct == null ? '—' : `${s.chatToLeadPct}%`}
              hint="聊天用户里留资/预约的比例"
            />
            <Card
              label="建档里来自聊天"
              value={s.chatShareOfLeadsPct == null ? '—' : `${s.chatShareOfLeadsPct}%`}
              hint="聊天 vs 表单 的占比"
            />
          </div>

          <h2 className="text-sm font-semibold text-gray-900 mb-2">最近对话（点开看全文）</h2>
          <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {conversations.length === 0 && (
              <p className="p-4 text-sm text-gray-400">还没有对话记录。</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.ownerKey}
                onClick={() => openTranscript(c.ownerKey)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span
                  className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${
                    c.kind === 'signed-in'
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {c.kind === 'signed-in' ? '登录' : '游客'}
                </span>
                <span className="flex-1 min-w-0 truncate text-sm text-gray-700">
                  {c.preview || '(空)'}
                </span>
                <span className="shrink-0 text-[11px] text-gray-400">{c.msgCount} 条</span>
                <span className="shrink-0 text-[11px] text-gray-400 w-20 text-right">{timeAgo(c.updatedAt)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Transcript drawer */}
      {openConv && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpenConv(null)}>
          <div className="flex-1 bg-black/30" />
          <div
            className="w-full max-w-md bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">对话全文</p>
              <button onClick={() => setOpenConv(null)} className="p-1.5 rounded-full hover:bg-gray-100" aria-label="关闭">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {convLoading && <p className="text-sm text-gray-400">加载中…</p>}
              {!convLoading && convMsgs && convMsgs.length === 0 && (
                <p className="text-sm text-gray-400">没有内容。</p>
              )}
              {!convLoading && convMsgs && convMsgs.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {m.content}
                    {m.bookingLink && (
                      <span className="block mt-1 text-[11px] opacity-70">📅 {m.bookingLink}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
