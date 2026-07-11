'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ContentBlock {
  id: string
  icon: string
  title: string
  content: string  // HTML/Markdown 内容
  enabled: boolean
  sort_order: number
}

const DEFAULT_BLOCKS: Record<string, ContentBlock[]> = {
  drapery: [
    { id: 'how_to_measure', icon: '📏', title: 'How to Measure', enabled: true, sort_order: 0, content: `**Width:**
- Measure the width of your window or the area you want to cover
- For a fuller look, we recommend ordering 2.5–3× the actual width
- Our calculator automatically accounts for fullness

**Height:**
- Measure from the top of the rod to where you want the drapery to end
- Floor length: deduct 1/2" to 1" from floor; sill or apron length also available
- Add extra length if you want pooling at the bottom for a luxurious look` },
    { id: 'fabric_lining', icon: '✨', title: 'Fabric & Lining', enabled: true, sort_order: 1, content: `Our pinch pleat draperies are meticulously handcrafted from premium fabrics. Each pleat is sewn with precision to create elegant, consistent folds.

**Lining Options:**
- **No Lining** – Lighter, casual look with natural light flow
- **Light Filtering** – Reduces light while maintaining some glow
- **Blackout** – Maximum light blocking and privacy, ideal for bedrooms` },
    { id: 'custom_made', icon: '✂️', title: 'Custom Made Product', enabled: true, sort_order: 2, content: `Each drapery panel is custom-made to your exact specifications. Our skilled craftspeople hand-sew every pleat and hem to ensure premium quality and a perfect fit for your windows.` },
    { id: 'care', icon: '🧺', title: 'Care Instructions', enabled: true, sort_order: 3, content: `- **Professional Cleaning Recommended:** Dry clean for best results
- **Home Care:** Gentle machine wash on delicate cycle (remove hooks first)
- **Drying:** Hang to dry or tumble dry on low heat
- **Ironing:** Steam or iron on low heat on reverse side
- **Regular Maintenance:** Vacuum with upholstery attachment to remove dust` },
    { id: 'returns', icon: '🔄', title: 'Return & Exchange Policy', enabled: true, sort_order: 4, content: `⚠️ As these draperies are **custom-made**, we cannot accept returns for "changed my mind" or "wrong fabric choice" if made according to your order.

- ✓ **Manufacturing Defects:** Free replacement within 30 days
- ✓ **Measurement Errors:** We'll remake if our error; customer pays shipping for their mistakes
- ✓ **Quality Guarantee:** We stand behind our craftsmanship` },
    { id: 'questions', icon: '💬', title: 'Questions?', enabled: true, sort_order: 5, content: `Need help choosing the right pleat style, measuring your windows, or selecting a lining? Contact us before ordering to ensure you get exactly what you need.` },
  ],
  sheer: [
    { id: 'how_to_measure', icon: '📏', title: 'How to Measure', enabled: true, sort_order: 0, content: `**Width:**
- Measure the width of your window or the area you want to cover
- For a fuller look, we recommend ordering 2–3× the actual width
- Our calculator automatically accounts for fullness

**Height:**
- Measure from the top of the rod to where you want the curtain to end
- Floor length: deduct 1/2" to 1" from floor
- Add extra length if you want pooling at the bottom` },
    { id: 'fabric_style', icon: '✨', title: 'Fabric & Style', enabled: true, sort_order: 1, content: `Our elegant sheer curtains are made from premium quality fabric that filters natural light beautifully while maintaining your privacy during the day.

- **Pleat Styles:** Pinch pleat and tailored pleat options
- **Fabric Options:** Classic White, warm Ivory, and sophisticated Cream
- **Light Filtering:** Perfect balance of natural light and daytime privacy` },
    { id: 'custom_made', icon: '✂️', title: 'Custom Made Product', enabled: true, sort_order: 2, content: `Each sheer curtain is custom-made to your exact specifications. We carefully handcraft every panel with precise measurements and premium finishing to ensure a perfect fit for your windows.` },
    { id: 'care', icon: '🧺', title: 'Care Instructions', enabled: true, sort_order: 3, content: `- **Machine Washable:** Gentle cycle with cold water
- **Drying:** Tumble dry on low or hang to dry
- **Ironing:** Low heat if needed, iron on reverse side
- **Regular Care:** Vacuum or shake out dust regularly` },
    { id: 'returns', icon: '🔄', title: 'Return & Exchange Policy', enabled: true, sort_order: 4, content: `⚠️ As these curtains are **custom-made**, we cannot accept returns for "changed my mind" or "wrong color choice".

- ✓ **Manufacturing Defects:** Free replacement within 30 days
- ✓ **Measurement Errors:** We'll remake if our error
- ✓ **Quality Guarantee:** We stand behind our craftsmanship` },
    { id: 'questions', icon: '💬', title: 'Questions?', enabled: true, sort_order: 5, content: `Need help choosing the right style or measuring your windows? Contact us before placing your order.` },
  ],
  shade: [
    { id: 'how_to_measure', icon: '📏', title: 'How to Measure', enabled: true, sort_order: 0, content: `**Inside Mount:**
- Measure the exact inside width of the window opening at top, middle, and bottom — use the narrowest measurement
- Measure height from top of opening to sill

**Outside Mount:**
- Measure the width you want the shade to cover (add 2–3" on each side for light control)
- Measure height from where you want the top of the shade to the desired bottom point` },
    { id: 'product_features', icon: '✨', title: 'Product Features', enabled: true, sort_order: 1, content: `Our roller shades combine clean lines with practical light control. Available in a variety of fabric codes to suit every room and décor style.

- **Mounting Options:** Inside or outside mount
- **Operation:** Cordless, chain, or motorized options
- **Light Control:** Choose from light filtering to blackout fabrics` },
    { id: 'custom_made', icon: '✂️', title: 'Custom Made Product', enabled: true, sort_order: 2, content: `Each shade is custom-made to your exact measurements. We cut and assemble every unit in-house to ensure precise fit and smooth operation.` },
    { id: 'care', icon: '🧺', title: 'Care Instructions', enabled: true, sort_order: 3, content: `- **Dusting:** Use a soft cloth or vacuum with brush attachment
- **Spot Cleaning:** Mild soap and warm water; avoid soaking
- **Do Not:** Machine wash or dry clean
- **Roll up fully** to prevent creasing when not in use` },
    { id: 'returns', icon: '🔄', title: 'Return & Exchange Policy', enabled: true, sort_order: 4, content: `⚠️ As these shades are **custom-made**, we cannot accept returns for "changed my mind" or incorrect measurements provided by the customer.

- ✓ **Manufacturing Defects:** Free replacement within 30 days
- ✓ **Measurement Errors:** We'll remake if our error
- ✓ **Quality Guarantee:** We stand behind our craftsmanship` },
    { id: 'questions', icon: '💬', title: 'Questions?', enabled: true, sort_order: 5, content: `Not sure about inside vs outside mount, or which fabric code is right for you? Contact us — we're happy to help!` },
  ],
  hardware: [
    { id: 'measurement_notes', icon: '📏', title: 'Important Measurement Notes', enabled: true, sort_order: 0, content: `⚠️ **Rod Length vs Total Length:**
The width you order is the **rod length only** and does NOT include finial length. If you have limited space, please account for the finial length on both ends when measuring.

**Finial Lengths (per pair):**
- **Flat Endcap:** 1/8" each × 2 = 1/4" total
- **Round Cap:** 1.5" each × 2 = 3" total
- **Ball Finial:** 3" each × 2 = 6" total` },
    { id: 'shipping', icon: '🚚', title: 'Shipping & Packaging', enabled: true, sort_order: 1, content: `**Rod Cutting for Shipping:**
Due to shipping restrictions, any rod longer than **96 inches** will be cut in half for safe transport. The rod can be easily reassembled upon arrival.` },
    { id: 'whats_included', icon: '📦', title: "What's Included", enabled: true, sort_order: 2, content: `- Curtain rod(s) – cut to your specified length
- Matching finials (2 pieces)
- Mounting brackets and hardware
- Installation instructions` },
    { id: 'installation', icon: '🔧', title: 'Installation', enabled: true, sort_order: 3, content: `Our curtain rod sets come with all necessary mounting hardware and are designed for easy installation.

- Mount brackets 2–4 inches outside window frame for proper coverage
- Ensure brackets are level for smooth operation
- Use appropriate wall anchors for your wall type` },
    { id: 'questions', icon: '💬', title: 'Questions?', enabled: true, sort_order: 4, content: `Need help measuring your space or choosing the right rod and finial combination? Contact us before ordering to ensure the perfect fit!` },
  ],
}

interface ContentEditorProps {
  productType: 'drapery' | 'sheer' | 'shade' | 'hardware' | 'accessory'
  productId: string
  onChange: (blocks: ContentBlock[]) => void
}

export default function ContentEditor({ productType, productId, onChange }: ContentEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { fetchContent() }, [productId, productType])

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/content`)
      const data = await res.json()
      if (data.success && data.data.blocks?.length > 0) {
        setBlocks(data.data.blocks)
      } else {
        // 使用该产品类型的默认内容
        setBlocks(DEFAULT_BLOCKS[productType] || [])
      }
    } catch {
      setBlocks(DEFAULT_BLOCKS[productType] || [])
    } finally {
      setLoading(false)
    }
  }

  const update = useCallback((updated: ContentBlock[]) => {
    setBlocks(updated)
    onChange(updated)
  }, [onChange])

  const updateBlock = (id: string, field: keyof ContentBlock, value: any) => {
    update(blocks.map(b => b.id === id ? { ...b, [field]: value } : b))
  }

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    const list = [...blocks]
    const idx = list.findIndex(b => b.id === id)
    const target = dir === 'up' ? idx - 1 : idx + 1
    if (idx === -1 || target < 0 || target >= list.length) return
    ;[list[idx], list[target]] = [list[target], list[idx]]
    update(list.map((b, i) => ({ ...b, sort_order: i })))
  }

  const resetToDefault = () => {
    if (!confirm('确定要重置为默认说明文字吗？当前编辑的内容将丢失。')) return
    const defaults = DEFAULT_BLOCKS[productType] || []
    update(defaults)
  }

  if (loading) return <div className="text-center py-8 text-gray-500">加载中...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          编辑产品页面右侧显示的说明内容。支持 Markdown 格式（**加粗**、- 列表等）。
        </p>
        <button
          onClick={resetToDefault}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          重置为默认内容
        </button>
      </div>

      {blocks.map((block, index) => (
        <div key={block.id} className={`border rounded-lg overflow-hidden ${block.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
          {/* 区块标题栏 */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
            {/* 启用开关 */}
            <button
              onClick={() => updateBlock(block.id, 'enabled', !block.enabled)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${block.enabled ? 'bg-gray-900' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${block.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>

            {/* 图标 + 标题编辑 */}
            <input
              type="text"
              value={block.icon}
              onChange={e => updateBlock(block.id, 'icon', e.target.value)}
              className="w-10 text-center border border-gray-200 rounded px-1 py-0.5 text-sm bg-white"
            />
            <input
              type="text"
              value={block.title}
              onChange={e => updateBlock(block.id, 'title', e.target.value)}
              className="flex-1 border border-gray-200 rounded px-2 py-0.5 text-sm font-medium bg-white"
            />

            {/* 排序 */}
            <div className="flex gap-1">
              <button onClick={() => moveBlock(block.id, 'up')} disabled={index === 0} className="px-1.5 py-0.5 text-xs bg-white border border-gray-200 rounded disabled:opacity-30">↑</button>
              <button onClick={() => moveBlock(block.id, 'down')} disabled={index === blocks.length - 1} className="px-1.5 py-0.5 text-xs bg-white border border-gray-200 rounded disabled:opacity-30">↓</button>
            </div>

            {/* 展开/收起 */}
            <button onClick={() => setExpandedId(expandedId === block.id ? null : block.id)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-0.5">
              {expandedId === block.id ? '收起 ▲' : '编辑 ▼'}
            </button>
          </div>

          {/* 内容编辑区 */}
          {expandedId === block.id && (
            <div className="p-4 bg-white">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-xs text-gray-400">支持 Markdown：**加粗**、- 列表、# 标题</span>
              </div>
              <textarea
                value={block.content}
                onChange={e => updateBlock(block.id, 'content', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="在此输入说明文字，支持 Markdown 格式..."
              />
              {/* 预览 */}
              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs text-gray-400 mb-2">预览效果：</p>
                <div className="text-sm text-gray-700 space-y-1 prose-sm">
                  {block.content.split('\n').map((line, i) => {
                    if (!line.trim()) return <div key={i} className="h-2" />
                    // 简单 Markdown 渲染
                    const html = line
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^- (.+)/, '• $1')
                      .replace(/^⚠️ (.+)/, '<span class="text-amber-700">⚠️ $1</span>')
                      .replace(/^✓ (.+)/, '<span class="text-green-700">✓ $1</span>')
                    return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export { DEFAULT_BLOCKS }
