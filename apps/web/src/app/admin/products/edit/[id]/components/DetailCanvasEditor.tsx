'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CanvasBlock, DetailCanvasData } from '@/app/store/[id]/components/shared/DetailCanvas'

// ─────────────────────────────────────────────────────────────────────────────
// 详情版面编辑器 (2026-07-14, Eddie's page-builder):
// a fixed 960-unit-wide canvas the admin arranges directly —
//   · click an image frame → select; 换图/上传 via the toolbar (or the frame's
//     own upload button when empty)
//   · drag a block to move it; drag the corner handle to resize
//   · double-click a text block to edit the copy; toolbar adjusts size /
//     serif / bold / color / alignment
//   · canvas background color + height are editable; 重置为杂志模板 restores
//     the preset composition
// Saves to default_config.detail_canvas via its own endpoint (independent of
// the page-level 保存, so it can never clobber pricing params). 清空版面
// removes the canvas → the storefront falls back to the GalleryCards layout.
// ─────────────────────────────────────────────────────────────────────────────

const W = 960

const PRESET: DetailCanvasData = {
  bg: '#faf9f6',
  height: 2360,
  blocks: [
    // ── 顶部通栏大图 ×3（不需要的选中后删除即可）──
    { id: 'hero-1', type: 'image', x: 24, y: 40, w: 912, h: 480 },
    { id: 'hero-2', type: 'image', x: 24, y: 544, w: 912, h: 480 },
    { id: 'hero-3', type: 'image', x: 24, y: 1048, w: 912, h: 480 },
    // ── 图文对半 · 图左文右 ──
    { id: 'img-a', type: 'image', x: 24, y: 1572, w: 444, h: 340 },
    { id: 't-ak', type: 'text', x: 516, y: 1650, w: 396, h: 24, text: 'HANDCRAFTED PLEATS', size: 12, color: '#9ca3af' },
    { id: 't-ah', type: 'text', x: 516, y: 1684, w: 396, h: 76, text: '每一个褶，都是手工缝制', size: 26, serif: true, color: '#111827' },
    { id: 't-ab', type: 'text', x: 516, y: 1780, w: 380, h: 120, text: '资深工匠逐褶定位、手工缝制，褶距精确计算。褶型饱满一致，悬垂利落。', size: 14, color: '#6b7280' },
    // ── 图文对半 · 图右文左 ──
    { id: 'img-b', type: 'image', x: 492, y: 1956, w: 444, h: 340 },
    { id: 't-bk', type: 'text', x: 24, y: 2034, w: 396, h: 24, text: 'MADE TO MEASURE', size: 12, color: '#9ca3af' },
    { id: 't-bh', type: 'text', x: 24, y: 2068, w: 396, h: 76, text: '按窗定制，分毫合身', size: 26, serif: true, color: '#111827' },
    { id: 't-bb', type: 'text', x: 24, y: 2164, w: 380, h: 120, text: '每一幅窗帘按你的窗户尺寸单独裁制，宽高精确到 1/8 英寸。', size: 14, color: '#6b7280' },
  ],
}

const BG_PRESETS = ['#ffffff', '#faf9f6', '#f5f1ea', '#eeeae3', '#111111']

interface DragState {
  id: string
  mode: 'move' | 'resize'
  startX: number
  startY: number
  ox: number
  oy: number
  ow: number
  oh: number
}

export default function DetailCanvasEditor({ productId }: { productId: string }) {
  const [canvas, setCanvas] = useState<DetailCanvasData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [selId, setSelId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [scale, setScale] = useState(0.7)

  const wrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)

  // ── Load ──
  useEffect(() => {
    fetch(`/api/admin/products/${productId}/detail-canvas`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.canvas?.blocks) setCanvas(d.data.canvas) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [productId])

  // ── Fit-to-width scale ──
  useEffect(() => {
    const measure = () => {
      const w = wrapRef.current?.clientWidth || W
      setScale(Math.min(1, w / W))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [loaded, canvas === null])

  const sel = canvas?.blocks.find(b => b.id === selId) || null

  const patchBlock = useCallback((id: string, patch: Partial<CanvasBlock>) => {
    setCanvas(c => c ? { ...c, blocks: c.blocks.map(b => b.id === id ? { ...b, ...patch } : b) } : c)
    setDirty(true)
  }, [])

  const patchCanvas = (patch: Partial<DetailCanvasData>) => {
    setCanvas(c => c ? { ...c, ...patch } : c)
    setDirty(true)
  }

  // ── Drag / resize ──
  const startDrag = (e: React.PointerEvent, b: CanvasBlock, mode: 'move' | 'resize') => {
    e.preventDefault()
    e.stopPropagation()
    setSelId(b.id)
    dragRef.current = { id: b.id, mode, startX: e.clientX, startY: e.clientY, ox: b.x, oy: b.y, ow: b.w, oh: b.h }
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      const dx = (e.clientX - d.startX) / scale
      const dy = (e.clientY - d.startY) / scale
      if (d.mode === 'move') {
        patchBlock(d.id, {
          x: Math.round(Math.min(Math.max(0, d.ox + dx), W - 24)),
          y: Math.round(Math.max(0, d.oy + dy)),
        })
      } else {
        patchBlock(d.id, {
          w: Math.round(Math.min(Math.max(40, d.ow + dx), W)),
          h: Math.round(Math.max(24, d.oh + dy)),
        })
      }
    }
    const up = () => { dragRef.current = null }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  }, [scale, patchBlock])

  // ── Image upload ──
  const uploadImage = async (id: string, file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('productId', productId)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success && data.data?.url) patchBlock(id, { url: data.data.url })
    } catch { /* keep */ }
    finally { setUploading(false) }
  }

  // ── Add / delete ──
  const addBlock = (type: 'image' | 'text') => {
    if (!canvas) return
    const id = `${type}-${Date.now()}`
    const block: CanvasBlock = type === 'image'
      ? { id, type, x: 80, y: 80, w: 400, h: 300 }
      : { id, type, x: 80, y: 80, w: 300, h: 60, text: '双击编辑文字', size: 16, color: '#374151' }
    setCanvas({ ...canvas, blocks: [...canvas.blocks, block] })
    setSelId(id)
    setDirty(true)
  }

  const deleteSel = () => {
    if (!canvas || !selId) return
    setCanvas({ ...canvas, blocks: canvas.blocks.filter(b => b.id !== selId) })
    setSelId(null)
    setDirty(true)
  }

  // ── Save / clear ──
  const save = async (next: DetailCanvasData | null) => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`/api/admin/products/${productId}/detail-canvas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvas: next }),
      })
      const data = await res.json()
      if (data.success) { setDirty(false); setMsg('✅ 已保存，前台立即生效') }
      else setMsg('❌ 保存失败，请重试')
    } catch { setMsg('❌ 保存失败，请重试') }
    finally { setSaving(false); setTimeout(() => setMsg(''), 4000) }
  }

  if (!loaded) return <div className="py-10 text-center text-sm text-gray-400">加载版面…</div>

  // ── Not enabled yet ──
  if (!canvas) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-sm text-gray-600">此商品还没有自由排版的详情版面 — 当前前台显示「图片管理 → Gallery」的图文列表。</p>
        <button
          onClick={() => { setCanvas(JSON.parse(JSON.stringify(PRESET))); setDirty(true) }}
          className="mt-4 rounded-lg bg-gray-900 px-5 py-2.5 text-sm text-white hover:bg-black"
        >
          用杂志模板创建详情版面
        </button>
        <p className="mt-3 text-xs text-gray-400">创建并保存后，商品详情区将改为按这块版面渲染（等比缩放到任何屏幕）。</p>
      </div>
    )
  }

  const btn = 'rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50'
  const btnOn = 'rounded border border-gray-900 bg-gray-900 px-2.5 py-1.5 text-xs text-white'

  return (
    <div className="space-y-3">
      {/* ── Canvas toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5">
        <span className="text-xs text-gray-400">背景</span>
        {BG_PRESETS.map(c => (
          <button key={c} onClick={() => patchCanvas({ bg: c })}
            className={`h-6 w-6 rounded-full border ${canvas.bg === c ? 'ring-2 ring-gray-900 ring-offset-1' : 'border-gray-200'}`}
            style={{ background: c }} title={c} />
        ))}
        <input type="color" value={canvas.bg || '#faf9f6'} onChange={e => patchCanvas({ bg: e.target.value })}
          className="h-6 w-8 cursor-pointer rounded border border-gray-200" title="自定义背景色" />
        <span className="ml-3 text-xs text-gray-400">版面高度</span>
        <input type="number" step="10" value={canvas.height || ''}
          onChange={e => patchCanvas({ height: parseInt(e.target.value) || 0 })}
          onBlur={() => patchCanvas({ height: Math.max(200, canvas.height || 0) })}
          className="w-20 rounded border border-gray-300 px-2 py-1 text-xs" />
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button className={btn} onClick={() => addBlock('image')}>＋ 图片框</button>
        <button className={btn} onClick={() => addBlock('text')}>＋ 文字块</button>
        <button className={btn} onClick={() => { if (confirm('重置为杂志模板？当前版面将被覆盖。')) { setCanvas(JSON.parse(JSON.stringify(PRESET))); setDirty(true) } }}>重置为杂志模板</button>
        <div className="ml-auto flex items-center gap-2">
          {msg && <span className="text-xs">{msg}</span>}
          {dirty && !msg && <span className="text-xs text-amber-600">有未保存改动</span>}
          <button className={btn} onClick={() => { if (confirm('清空版面并恢复 Gallery 图文模式？')) { save(null); setCanvas(null) } }}>清空版面</button>
          <button disabled={saving} onClick={() => save(canvas)}
            className="rounded bg-gray-900 px-4 py-1.5 text-xs text-white hover:bg-black disabled:opacity-50">
            {saving ? '保存中…' : '保存版面'}
          </button>
        </div>
      </div>

      {/* ── Selected-block toolbar ── */}
      {sel && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5">
          <span className="text-xs text-gray-400">{sel.type === 'image' ? '图片框' : '文字块'}</span>
          {sel.type === 'image' && (
            <label className={`${btn} cursor-pointer`}>
              {uploading ? '上传中…' : sel.url ? '换图' : '上传图片'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(sel.id, f); e.target.value = '' }} />
            </label>
          )}
          {sel.type === 'text' && (
            <>
              <span className="text-xs text-gray-400">字号</span>
              <input type="number" min="8" max="120" value={sel.size || ''}
                onChange={e => patchBlock(sel.id, { size: Math.min(120, parseInt(e.target.value) || 0) })}
                onBlur={() => patchBlock(sel.id, { size: Math.min(120, Math.max(8, sel.size || 14)) })}
                className="w-14 rounded border border-gray-300 px-1.5 py-1 text-xs" />
              <button className={sel.serif ? btnOn : btn} onClick={() => patchBlock(sel.id, { serif: !sel.serif })}>宋体</button>
              <button className={sel.bold ? btnOn : btn} onClick={() => patchBlock(sel.id, { bold: !sel.bold })}>加粗</button>
              <input type="color" value={sel.color || '#374151'} onChange={e => patchBlock(sel.id, { color: e.target.value })}
                className="h-6 w-8 cursor-pointer rounded border border-gray-200" title="文字颜色" />
              {(['left', 'center', 'right'] as const).map(a => (
                <button key={a} className={(sel.align || 'left') === a ? btnOn : btn} onClick={() => patchBlock(sel.id, { align: a })}>
                  {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                </button>
              ))}
            </>
          )}
          <span className="text-[11px] text-gray-300">拖动移动 · 拖右下角缩放{sel.type === 'text' ? ' · 双击改文字' : ''}</span>
          <button onClick={deleteSel} className="ml-auto rounded border border-red-200 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50">删除</button>
        </div>
      )}

      {/* ── Canvas ── */}
      <div ref={wrapRef} className="overflow-auto rounded-lg border border-gray-200 bg-gray-100 p-4" style={{ maxHeight: '72vh' }}>
        <div style={{ width: W * scale, height: canvas.height * scale }}>
          <div
            className="relative shadow-sm"
            style={{ width: W, height: canvas.height, background: canvas.bg || '#faf9f6', transform: `scale(${scale})`, transformOrigin: 'top left' }}
            onPointerDown={() => { setSelId(null); setEditingId(null) }}
          >
            {canvas.blocks.map(b => {
              const isSel = selId === b.id
              const base: React.CSSProperties = { position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h }
              return (
                <div
                  key={b.id}
                  style={base}
                  onPointerDown={e => { if (editingId !== b.id) startDrag(e, b, 'move') }}
                  onDoubleClick={e => { if (b.type === 'text') { e.stopPropagation(); setEditingId(b.id) } }}
                  className={`${isSel ? 'z-10' : ''} ${editingId === b.id ? '' : 'cursor-move'} select-none`}
                >
                  {b.type === 'image' ? (
                    b.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.url} alt="" draggable={false} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white/50 text-gray-400">
                        <span className="text-xs">空图片框</span>
                        <label className="cursor-pointer rounded bg-gray-900 px-3 py-1 text-[11px] text-white" onPointerDown={e => e.stopPropagation()}>
                          上传图片
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(b.id, f); e.target.value = '' }} />
                        </label>
                      </div>
                    )
                  ) : editingId === b.id ? (
                    <textarea
                      autoFocus
                      value={b.text || ''}
                      onChange={e => patchBlock(b.id, { text: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onPointerDown={e => e.stopPropagation()}
                      className="h-full w-full resize-none border border-blue-400 bg-white/80 p-1 outline-none"
                      style={{
                        fontSize: b.size || 14, lineHeight: 1.6, color: b.color || '#374151',
                        fontFamily: b.serif ? 'Georgia, "Songti SC", "Noto Serif SC", serif' : undefined,
                        fontWeight: b.bold ? 600 : 400, textAlign: b.align || 'left',
                      }}
                    />
                  ) : (
                    <div
                      className="h-full w-full overflow-hidden"
                      style={{
                        fontSize: b.size || 14, lineHeight: 1.6, color: b.color || '#374151',
                        fontFamily: b.serif ? 'Georgia, "Songti SC", "Noto Serif SC", serif' : undefined,
                        fontWeight: b.bold ? 600 : 400, textAlign: b.align || 'left', whiteSpace: 'pre-line',
                      }}
                    >
                      {b.text || ''}
                    </div>
                  )}
                  {/* selection chrome */}
                  {isSel && (
                    <>
                      <span className={'pointer-events-none absolute inset-0 ring-2 ring-blue-500 ' + (b.type === 'image' ? 'rounded-xl' : '')} />
                      {/* 选中有图的框 → 框上直接给换图按钮（更直观，工具栏里也保留） */}
                      {b.type === 'image' && b.url && (
                        <label
                          onPointerDown={e => e.stopPropagation()}
                          className="absolute bottom-2 right-2 cursor-pointer rounded bg-white/95 px-3 py-1.5 text-xs text-gray-800 shadow-md hover:bg-white"
                        >
                          {uploading ? '上传中…' : '换图'}
                          <input type="file" accept="image/*" className="hidden" disabled={uploading}
                            onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(b.id, f); e.target.value = '' }} />
                        </label>
                      )}
                      <span
                        onPointerDown={e => startDrag(e, b, 'resize')}
                        className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-white bg-blue-500"
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        版面固定 960 设计宽度，前台按屏幕宽度等比缩放渲染。主图册与选项配置不受影响 — 这块版面只替换商品页下方的详情图文区。
      </p>
    </div>
  )
}
