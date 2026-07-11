'use client'

// 建品向导（店铺重设计 P1）— 四步：选类别 → 基础信息 → 应用蓝图创建（草稿）
// → 跳转编辑页「计算参数」完成价格配置后发布。
//
// 旧表单仍可用：/admin/products/create?classic=1 → 原编辑页建品流程。
// 向导的核心价值是"按类别蓝图自动搭好骨架"（engine params + 选项 scaffold +
// 前台模板 + 草稿状态），图片等留到编辑页统一管理。

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CATEGORY_BLUEPRINTS, CATEGORY_ORDER, getBlueprint,
  type CategoryKey,
} from '@/lib/categoryBlueprints'

interface StoreCategory { id: string; name: string; is_active: boolean }

export default function ProductCreateWizard() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  const [step, setStep] = useState<1 | 2>(1)
  const [categoryKey, setCategoryKey] = useState<CategoryKey | null>(null)

  // Step 2 — 基础信息
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [storeCategoryId, setStoreCategoryId] = useState('')
  const [basePrice, setBasePrice] = useState('') // accessory only
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([])

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // Keep the classic form reachable: ?classic=1 → old create flow.
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      if (sp.get('classic') === '1') {
        router.replace('/admin/products/edit/create')
        return
      }
    } catch { /* ignore */ }
    setReady(true)
  }, [router])

  useEffect(() => {
    fetch('/api/admin/store-categories')
      .then(r => r.json())
      .then(d => { if (d.success) setStoreCategories(d.data || []) })
      .catch(() => {})
  }, [])

  const blueprint = getBlueprint(categoryKey)
  const isAccessory = blueprint?.key === 'accessory'
  const basePriceNum = parseFloat(basePrice)
  const canCreate = !!blueprint && name.trim().length > 0 &&
    (!isAccessory || (Number.isFinite(basePriceNum) && basePriceNum > 0))

  const pickCategory = (key: CategoryKey) => {
    setCategoryKey(key)
    setStep(2)
    setError('')
  }

  const handleCreate = async () => {
    if (!blueprint || !canCreate || creating) return
    setCreating(true)
    setError('')
    try {
      // 1. Create the draft product (is_active = false) under the blueprint's
      //    product type, with template_key pinned from the blueprint.
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type: blueprint.productTypeSlug,
          status: 'inactive',            // 草稿 — 发布前不出现在商店
          description: description.trim(),
          sort_order: 0,
          template_key: blueprint.templateKey,
          ...(isAccessory ? { base_price: basePriceNum } : {}),
        }),
      })
      const data = await res.json()
      if (!data.success || !data.data?.product_id) {
        throw new Error(data.error?.message || 'Create failed')
      }
      const productId: string = data.data.product_id

      // 2. Apply the blueprint scaffold: default_config.params + options.
      //    (default_config.description/sort_order were set by the POST.)
      if (Object.keys(blueprint.defaultParams).length > 0) {
        await fetch(`/api/admin/products/${productId}/params`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blueprint.defaultParams),
        })
      }
      if (blueprint.optionScaffold.length > 0) {
        await fetch(`/api/admin/products/${productId}/options`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ options: blueprint.optionScaffold }),
        })
      }

      // 3. Store category assignment (optional).
      if (storeCategoryId) {
        await fetch('/api/admin/store-categories/assign', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId, store_category_id: storeCategoryId }),
        }).catch(() => {})
      }

      // 4. Hand off to the edit page's 计算参数 tab with the success banner.
      router.push(`/admin/products/edit/${productId}?tab=params&created=${blueprint.key}`)
    } catch (e: any) {
      setError(e?.message || '创建失败，请重试')
      setCreating(false)
    }
  }

  if (!ready) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">添加新产品</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 1 ? 'Step 1 / 2 · 选择商品类别' : `Step 2 / 2 · 基础信息 — ${blueprint?.label || ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin/products/create?classic=1"
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
              使用旧版表单
            </a>
            <button
              onClick={() => {
                if (step === 2) { setStep(1); setError('') }
                else router.push('/admin/products')
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← {step === 2 ? '上一步' : '返回'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        {/* ── Step 1: 五张类别卡 ── */}
        {step === 1 && (
          <>
            <p className="text-sm text-gray-500 mb-5">
              选定类别即锁定定价引擎、选项骨架和前台模板 — 创建后按模板补全价格配置即可发布。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORY_ORDER.map(key => {
                const bp = CATEGORY_BLUEPRINTS[key]
                return (
                  <button key={key} onClick={() => pickCategory(key)}
                    className="text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-800 hover:shadow-md transition-all group">
                    <div className="text-3xl mb-3">{bp.icon}</div>
                    <p className="text-base font-semibold text-gray-900 group-hover:text-black">{bp.label}</p>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{bp.tagline}</p>
                    <p className="text-[11px] text-gray-400 mt-2.5 leading-relaxed">示例：{bp.examples}</p>
                    <p className="text-[10px] font-mono text-gray-300 mt-3">
                      engine: {bp.engine ?? 'none (fixed price)'} · template: {bp.templateKey}
                    </p>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* ── Step 2: 基础信息 ── */}
        {step === 2 && blueprint && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6 max-w-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <span className="text-2xl">{blueprint.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{blueprint.label}</p>
                <p className="text-xs text-gray-400">
                  引擎 {blueprint.engine ?? '无（固定价）'} · 前台模板 {blueprint.templateKey} · 创建后为草稿
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                产品名称 <span className="text-red-500">*</span>
              </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="例：Premium Linen Drapery"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  name.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">产品描述</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="简短描述产品特点（前台商品页显示，英文）..." rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">商店分类</label>
              <select value={storeCategoryId} onChange={e => setStoreCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">未分类（可稍后在产品列表指定）</option>
                {storeCategories.filter(c => c.is_active).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {isAccessory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  售价 / Fixed Price ($) <span className="text-red-500">*</span>
                </label>
                <input type="number" min={0} step="0.01" value={basePrice}
                  onChange={e => setBasePrice(e.target.value)}
                  placeholder="如 45"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !(basePriceNum > 0) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`} />
                <p className="text-xs text-gray-500 mt-1">
                  配件为固定价商品（无计算引擎），结算按 售价 × 数量。必须大于 0。
                </p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-800">
              📷 主图 / 图集在创建后的编辑页「图片管理」标签上传 —
              创建时先搭好类别骨架（引擎参数 + 选项 + 模板），发布前编辑页会校验图片与价格齐全。
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="pt-1 flex items-center gap-3">
              <button onClick={handleCreate} disabled={!canCreate || creating}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  creating ? 'bg-blue-400 text-white cursor-not-allowed'
                  : canCreate ? 'bg-gray-900 text-white hover:bg-black shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}>
                {creating ? '创建中…' : '创建草稿并配置价格 →'}
              </button>
              <span className="text-xs text-gray-400">创建后进入「计算参数」完成配置，发布才对客户可见</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
