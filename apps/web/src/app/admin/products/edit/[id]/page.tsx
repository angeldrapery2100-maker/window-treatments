'use client'

import { use, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ImageManager from './components/ImageManager'
import ParamsConfig from './components/ParamsConfig'
import OptionsManager from './components/OptionsManager'
import ContentEditor from './components/ContentEditor'
import ParcelRulesEditor from './components/ParcelRulesEditor'

type ProductType = 'drapery' | 'sheer' | 'shade' | 'hardware'

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const isNew = id === 'create'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)        // 有未保存的改动
  const [basicSaved, setBasicSaved] = useState(!isNew)  // 新建时未保存过基础信息
  const [saveError, setSaveError] = useState<string | null>(null)

  // 产品 ID（新建时草稿 ID）
  const [productId, setProductId] = useState<string | null>(isNew ? null : id)
  const initDone = useRef(false)

  // 基础信息
  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState<ProductType>('drapery')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive')
  const [sortOrder, setSortOrder] = useState(0)
  const [stockQty, setStockQty] = useState('')  // '' = untracked / unlimited

  // 子组件数据（由子组件通过 onChange 上报）
  const imagesRef = useRef<any>(null)
  const paramsRef = useRef<any>(null)
  const optionsRef = useRef<any>(null)
  const contentRef = useRef<any>(null)
  const parcelsRef = useRef<any>(null)

  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'params' | 'options' | 'content' | 'parcels'>('basic')

  const isBasicComplete = productName.trim().length > 0

  // 标记有改动
  const markDirty = useCallback(() => setIsDirty(true), [])

  useEffect(() => {
    if (initDone.current) return
    initDone.current = true
    if (isNew) createDraft()
    else fetchProduct(id)
  }, [])

  // 浏览器关闭/刷新提示
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const createDraft = async () => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '__draft__', type: 'drapery', status: 'inactive', sort_order: 0, description: '' })
      })
      const data = await res.json()
      if (data.success) {
        setProductId(data.data.product_id)
        window.history.replaceState(null, '', `/admin/products/edit/${data.data.product_id}`)
      }
    } catch (e) { console.error('Failed to create draft:', e) }
    finally { setLoading(false) }
  }

  const fetchProduct = async (pid: string) => {
    try {
      const res = await fetch(`/api/admin/products/${pid}`)
      const data = await res.json()
      if (data.success) {
        const p = data.data.product
        setProductName(p.name)
        setProductType(p.type)
        setDescription(p.description || '')
        setStatus(p.status)
        setSortOrder(p.sort_order || 0)
        setStockQty(p.stock_qty == null ? '' : String(p.stock_qty))
      }
    } catch (e) { console.error('Failed to fetch product:', e) }
    finally { setLoading(false) }
  }

  // 统一保存：基础信息 + 图片 + 参数 + 选项
  const handleSave = async () => {
    if (!isBasicComplete || !productId) return
    setSaving(true)
    setSaveError(null)
    try {
      // 1. 保存基础信息
      await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName, type: productType, description, status, sort_order: sortOrder,
          stock_qty: stockQty.trim() === '' ? null : parseInt(stockQty, 10),
        })
      })

      // 2. 保存图片（如果有改动）
      if (imagesRef.current) {
        await fetch(`/api/admin/products/${productId}/images`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imagesRef.current)
        })
      }

      // 3. 保存参数（如果有改动）
      if (paramsRef.current) {
        await fetch(`/api/admin/products/${productId}/params`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paramsRef.current)
        })
      }

      // 4. 保存选项（如果有改动）
      if (optionsRef.current) {
        await fetch(`/api/admin/products/${productId}/options`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ options: optionsRef.current })
        })
      }

      // 5. 保存说明内容（如果有改动）
      if (contentRef.current) {
        await fetch(`/api/admin/products/${productId}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocks: contentRef.current })
        })
      }

      // 6. 保存包裹规则（如果有改动）
      if (parcelsRef.current) {
        await fetch(`/api/admin/products/${productId}/parcels`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rules: parcelsRef.current })
        })
      }

      setBasicSaved(true)
      setIsDirty(false)
    } catch (e) {
      setSaveError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // 返回：只有 isDirty 且保存按钮可用时才弹提示框
  const handleBack = async () => {
    if (isDirty && isBasicComplete) {
      const choice = await showUnsavedDialog()
      if (choice === 'save') {
        await handleSave()
        router.push('/admin/products')
      } else if (choice === 'discard') {
        if (isNew && !basicSaved && productId) {
          await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' }).catch(() => {})
        }
        router.push('/admin/products')
      }
      // 'cancel' → 什么都不做
    } else {
      if (isNew && !basicSaved && productId) {
        await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' }).catch(() => {})
      }
      router.push('/admin/products')
    }
  }

  // 简单对话框（用 state 控制）
  const [dialog, setDialog] = useState(false)
  const dialogResolve = useRef<((v: 'save' | 'discard' | 'cancel') => void) | null>(null)

  const showUnsavedDialog = (): Promise<'save' | 'discard' | 'cancel'> => {
    return new Promise(resolve => {
      dialogResolve.current = resolve
      setDialog(true)
    })
  }

  const resolveDialog = (choice: 'save' | 'discard' | 'cancel') => {
    setDialog(false)
    dialogResolve.current?.(choice)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">初始化中...</div>
  }

  const currentId = productId || id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? '添加新产品' : '编辑产品'}
              </h1>
              {currentId && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  ID: #{currentId.slice(0, 8)}
                  {isNew && !basicSaved && <span className="ml-2 text-yellow-500">草稿</span>}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* 返回按钮 */}
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                ← 返回
              </button>

              {/* 预览按钮：保存后才可用 */}
              {basicSaved && currentId && currentId !== 'create' && (
                <button
                  onClick={async () => {
                    if (isDirty && isBasicComplete) await handleSave()
                    window.open(`/store/${currentId}`, '_blank')
                  }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-700 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  ↗ 预览
                </button>
              )}

              {/* 统一保存按钮：有改动且基础信息完整才激活 */}
              <button
                onClick={handleSave}
                disabled={saving || !isDirty || !isBasicComplete}
                title={!isBasicComplete ? '请先填写产品名称' : !isDirty ? '没有未保存的改动' : ''}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  saving
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : isDirty && isBasicComplete
                    ? 'bg-gray-900 text-white hover:bg-black shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? '保存中...' : isDirty ? '● 保存' : '已保存'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Save Error Toast ── */}
      {saveError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <span>{saveError}</span>
            <button onClick={() => setSaveError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {(['basic', 'images', 'params', 'options', 'content', 'parcels'] as const).map(tab => {
                const labels = { basic: '基础信息', images: '图片管理', params: '计算参数', options: '选项配置', content: '产品说明', parcels: '包裹规则' }
                const locked = !basicSaved && tab !== 'basic'
                return (
                  <button key={tab} onClick={() => !locked && setActiveTab(tab)} disabled={locked}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab ? 'border-blue-600 text-blue-600'
                      : locked ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    {labels[tab]}{locked && ' 🔒'}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">

            {/* 基础信息 */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={e => { setProductName(e.target.value); markDirty() }}
                    placeholder="例：Premium Linen Drapery"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      productName.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {productName.trim() === '' && (
                    <p className="text-xs text-red-500 mt-1">必填，填写后才能保存</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品系列 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productType}
                    onChange={e => { setProductType(e.target.value as ProductType); markDirty() }}
                    disabled={!isNew && basicSaved}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="drapery">Drapery（窗帘）</option>
                    <option value="sheer">Sheer（纱帘）</option>
                    <option value="shade">Shade（卷帘）</option>
                    <option value="hardware">Hardware（窗帘杆）</option>
                  </select>
                  {!isNew && basicSaved && <p className="text-xs text-gray-400 mt-1">产品系列保存后不可修改</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">产品描述</label>
                  <textarea
                    value={description}
                    onChange={e => { setDescription(e.target.value); markDirty() }}
                    placeholder="简短描述产品特点..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                    <div className="flex gap-6">
                      {(['active', 'inactive'] as const).map(s => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={status === s} onChange={() => { setStatus(s); markDirty() }} />
                          <span className="text-sm text-gray-700">{s === 'active' ? '上架' : '下架'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">排序权重</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={e => { setSortOrder(parseInt(e.target.value) || 0); markDirty() }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-400 mt-1">数字越小越靠前</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock quantity</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={stockQty}
                    onChange={e => {
                      const v = e.target.value
                      if (v === '' || /^\d+$/.test(v)) { setStockQty(v); markDirty() }
                    }}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty for made-to-order / unlimited items. Set a number to track stock for hardware.</p>
                </div>

                {!basicSaved && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                    💡 填写产品名称后点击右上角「保存」，才能继续配置图片、参数和选项。
                  </div>
                )}
              </div>
            )}

            {/* 图片管理：用 hidden 代替条件渲染，避免切 Tab 时组件被卸载导致数据丢失 */}
            {basicSaved && currentId && (
              <div className={activeTab === 'images' ? '' : 'hidden'}>
                <ImageManager
                  productId={currentId}
                  onChange={images => { imagesRef.current = images; markDirty() }}
                />
              </div>
            )}

            {/* 计算参数 */}
            {activeTab === 'params' && basicSaved && currentId && (
              <ParamsConfig
                productType={productType}
                productId={currentId}
                onChange={p => { paramsRef.current = p; markDirty() }}
              />
            )}

            {/* 选项配置 */}
            {activeTab === 'options' && basicSaved && currentId && (
              <OptionsManager
                productType={productType}
                productId={currentId}
                onChange={opts => { optionsRef.current = opts; markDirty() }}
              />
            )}

            {/* 产品说明 */}
            {activeTab === 'content' && basicSaved && currentId && (
              <ContentEditor
                productType={productType}
                productId={currentId}
                onChange={blocks => { contentRef.current = blocks; markDirty() }}
              />
            )}

            {/* 包裹规则 */}
            {activeTab === 'parcels' && basicSaved && currentId && (
              <ParcelRulesEditor
                productId={currentId}
                onChange={rules => { parcelsRef.current = rules; markDirty() }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── 离开确认对话框 ── */}
      {dialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">有未保存的更改</h3>
            <p className="text-gray-600 text-sm mb-6">是否在退出前保存更改？</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => resolveDialog('save')}
                className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black font-medium"
              >
                保存并退出
              </button>
              <button
                onClick={() => resolveDialog('discard')}
                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                不保存，直接退出
              </button>
              <button
                onClick={() => resolveDialog('cancel')}
                className="w-full px-4 py-2.5 text-gray-500 hover:text-gray-700"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
