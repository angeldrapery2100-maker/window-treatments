'use client'

import { useState, useEffect, useCallback } from 'react'

// 推广活动（P3）：为传单 / EDDM 明信片 / 新迁入住户名单等线下投放生成短链
// /c/<slug> 与二维码，并按活动统计漏斗（访问 → AI 对话 → 方案条目 → 加购 → 留资）。
// 漏斗数字来自 lead_events 的 campaign 归因。

interface Campaign {
  id: string
  slug: string
  name: string
  target_url: string
  notes: string | null
  is_active: boolean
  created_at: string
  referral_token: string | null
  visits: number
  unique_visitors: number
  chats: number
  project_items: number
  cart_adds: number
  inquiries: number
  referral_visits: number
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [origin, setOrigin] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const [qrFor, setQrFor] = useState<Campaign | null>(null)
  // P2 §4.2 —— 「Generate」按钮:哪一行正在生成 / 哪一行报了什么错。
  const [genId, setGenId] = useState('')
  const [genError, setGenError] = useState<{ id: string; msg: string } | null>(null)

  // Create form
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [targetUrl, setTargetUrl] = useState('/store')
  const [notes, setNotes] = useState('')
  const [referralToken, setReferralToken] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/campaigns')
      const json = await res.json()
      if (json?.success) setCampaigns(json.data.campaigns || [])
      else setError(json?.error || '加载失败')
    } catch {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || creating) return
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          ...(slug.trim() ? { slug: slug.trim() } : {}),
          target_url: targetUrl.trim() || '/store',
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          ...(referralToken.trim() ? { referral_token: referralToken.trim() } : {}),
        }),
      })
      const json = await res.json()
      if (json?.success) {
        setName(''); setSlug(''); setTargetUrl('/store'); setNotes(''); setReferralToken('')
        await load()
      } else {
        setCreateError(json?.error || '创建失败')
      }
    } catch {
      setCreateError('创建失败')
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (c: Campaign) => {
    setCampaigns(prev => prev.map(x => (x.id === c.id ? { ...x, is_active: !c.is_active } : x)))
    try {
      await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, is_active: !c.is_active }),
      })
    } catch { void load() }
  }

  const remove = async (c: Campaign) => {
    if (!window.confirm(`删除活动「${c.name}」？漏斗事件数据会保留，但短链 /c/${c.slug} 将失效。`)) return
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id }),
      })
      const json = await res.json()
      if (json?.success) setCampaigns(prev => prev.filter(x => x.id !== c.id))
    } catch { /* keep list */ }
  }

  // Referral token is edited in place: paste it in, blur (or press Enter) to
  // save. An empty box clears the token, which stops /c/<slug> from setting
  // the ad_ref cookie.
  const saveToken = async (c: Campaign, value: string) => {
    const next = value.trim()
    if (next === (c.referral_token || '')) return
    setCampaigns(prev => prev.map(x => (x.id === c.id ? { ...x, referral_token: next || null } : x)))
    try {
      await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, referral_token: next }),
      })
    } catch { void load() }
  }

  /* P2 §4.2 —— 一键去 AAPP 建 campaign 推广链接并回填。
     以前得手抄 22 位 token:抄错了 /c/<slug> 照常跳转、照常记访问,
     只是不种 ad_ref —— 归因静静地丢掉,没有任何地方会报错。
     后端用库里那条记录自己的 slug,不认前端传的值。 */
  const generateToken = async (c: Campaign) => {
    if (genId) return
    setGenId(c.id)
    setGenError(null)
    try {
      const res = await fetch(`/api/admin/campaigns/${c.id}/referral-token`, { method: 'POST' })
      const json = await res.json().catch(() => null)
      if (json?.success && json?.data?.referral_token) {
        const t = String(json.data.referral_token)
        setCampaigns(prev => prev.map(x => (x.id === c.id ? { ...x, referral_token: t } : x)))
      } else {
        setGenError({ id: c.id, msg: String(json?.error || '生成失败，请稍后再试或手填 token。') })
      }
    } catch {
      setGenError({ id: c.id, msg: '生成失败：连不上服务器。' })
    } finally {
      setGenId('')
    }
  }

  const shortUrl = (c: Campaign) => `${origin}/c/${c.slug}`

  const copy = async (c: Campaign) => {
    try {
      await navigator.clipboard.writeText(shortUrl(c))
      setCopiedId(c.id)
      setTimeout(() => setCopiedId(''), 1500)
    } catch { /* clipboard blocked */ }
  }

  const qrSrc = (c: Campaign, size = 480) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=2&data=${encodeURIComponent(shortUrl(c))}`

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">推广活动 Campaigns</h1>
        <p className="mt-1 text-[13px] text-gray-500">
          为传单、EDDM 明信片、新迁入名单等线下投放生成专属短链和二维码；客户扫码后 90 天内的
          AI 对话、整屋方案、加购和留资都会归因到该活动。
        </p>
      </div>

      {/* Create */}
      <form onSubmit={create} className="mb-8 rounded-lg border border-gray-200 bg-white p-5">
        <p className="mb-4 text-[13px] font-medium text-gray-700">新建活动</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[12px] text-gray-500">活动名称 *</span>
            <input
              value={name} onChange={e => setName(e.target.value)} maxLength={200}
              placeholder="如：2026 秋季 EDDM · Arcadia"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-[13px] focus:border-gray-800 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[12px] text-gray-500">自定义短链（可留空，自动生成）</span>
            <div className="mt-1 flex items-center">
              <span className="rounded-l border border-r-0 border-gray-300 bg-gray-50 px-2 py-2 text-[13px] text-gray-400">/c/</span>
              <input
                value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} maxLength={64}
                placeholder="fall-eddm-arcadia"
                className="w-full rounded-r border border-gray-300 px-3 py-2 text-[13px] focus:border-gray-800 focus:outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-[12px] text-gray-500">落地页（站内路径）</span>
            <input
              value={targetUrl} onChange={e => setTargetUrl(e.target.value)} maxLength={500}
              placeholder="/store"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-[13px] focus:border-gray-800 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[12px] text-gray-500">Referral token（在 AAPP 建好活动推荐链接后粘贴，可留空）</span>
            <input
              value={referralToken} onChange={e => setReferralToken(e.target.value.trim())} maxLength={32}
              placeholder="16–32 位，字母数字与 - _"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-[13px] focus:border-gray-800 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[12px] text-gray-500">备注</span>
            <input
              value={notes} onChange={e => setNotes(e.target.value)} maxLength={2000}
              placeholder="投放范围 / 数量 / 日期…"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-[13px] focus:border-gray-800 focus:outline-none"
            />
          </label>
        </div>
        {createError && <p className="mt-3 text-[12px] text-red-600">{createError}</p>}
        <button
          type="submit" disabled={creating || !name.trim()}
          className="mt-4 rounded-md bg-[#3d3d3d] px-5 py-2 text-[13px] text-white transition-colors hover:bg-gray-700 disabled:opacity-40"
        >
          {creating ? '创建中…' : '创建活动'}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-[13px] text-gray-500">加载中…</p>
      ) : error ? (
        <p className="text-[13px] text-red-600">{error}</p>
      ) : campaigns.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-10 text-center text-[13px] text-gray-400">
          还没有活动 — 在上方创建第一个短链。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">活动</th>
                <th className="px-4 py-3 font-medium">短链</th>
                <th className="px-3 py-3 text-right font-medium">访问</th>
                <th className="px-3 py-3 text-right font-medium">独立访客</th>
                <th className="px-3 py-3 text-right font-medium">AI 对话</th>
                <th className="px-3 py-3 text-right font-medium">方案条目</th>
                <th className="px-3 py-3 text-right font-medium">加购</th>
                <th className="px-3 py-3 text-right font-medium">留资</th>
                <th className="px-4 py-3 font-medium">Referral token</th>
                <th className="px-3 py-3 text-right font-medium">推荐访问</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-[11px] text-gray-400">→ {c.target_url}{c.notes ? ` · ${c.notes}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <code className="text-[12px] text-gray-700">/c/{c.slug}</code>
                    <div className="mt-1 flex gap-2 text-[11px]">
                      <button onClick={() => void copy(c)} className="text-gray-400 underline underline-offset-2 hover:text-gray-800">
                        {copiedId === c.id ? '已复制 ✓' : '复制链接'}
                      </button>
                      <button onClick={() => setQrFor(c)} className="text-gray-400 underline underline-offset-2 hover:text-gray-800">
                        二维码
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{c.visits}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{c.unique_visitors}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{c.chats}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{c.project_items}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{c.cart_adds}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium">{c.inquiries}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        key={c.referral_token || 'empty'}
                        defaultValue={c.referral_token || ''}
                        onBlur={e => void saveToken(c, e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                        maxLength={32}
                        placeholder="—"
                        aria-label={`Referral token · ${c.name}`}
                        className="w-36 rounded border border-gray-200 px-2 py-1 font-mono text-[11px] focus:border-gray-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void generateToken(c)}
                        disabled={genId === c.id}
                        aria-label={`Generate referral token · ${c.name}`}
                        className="shrink-0 rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-500 hover:border-gray-800 hover:text-gray-900 disabled:opacity-40"
                      >
                        {genId === c.id ? '生成中…' : 'Generate'}
                      </button>
                    </div>
                    {genError?.id === c.id && (
                      <p role="alert" className="mt-1 max-w-[220px] text-[11px] text-red-600">{genError.msg}</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{c.referral_visits}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => void toggleActive(c)}
                      className={`rounded-full px-2.5 py-1 text-[11px] ${c.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {c.is_active ? '启用中' : '已停用'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => void remove(c)} className="text-[11px] text-gray-300 hover:text-red-600">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR modal */}
      {qrFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setQrFor(null)}
        >
          <div className="w-full max-w-xs rounded-xl bg-white p-6 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-[14px] font-medium text-gray-900">{qrFor.name}</p>
            <p className="mt-0.5 text-[12px] text-gray-400">{shortUrl(qrFor)}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc(qrFor)} alt={`QR code for ${shortUrl(qrFor)}`} className="mx-auto mt-4 h-56 w-56" />
            <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
              右键或长按图片即可保存，用于传单 / 明信片印刷。
            </p>
            <button
              onClick={() => setQrFor(null)}
              className="mt-4 rounded-md bg-[#3d3d3d] px-5 py-2 text-[13px] text-white hover:bg-gray-700"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
