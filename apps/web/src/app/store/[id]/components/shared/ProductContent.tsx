'use client'

import { useState, useEffect } from 'react'
import { DEFAULT_BLOCKS, ContentBlock } from '@/app/admin/products/edit/[id]/components/ContentEditor'
import ProductReviews from './ProductReviews'

interface ProductContentProps {
  productId: string
  productType: 'drapery' | 'sheer' | 'shade' | 'hardware' | 'accessory'
  extraContent?: React.ReactNode
}

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1.5" />
    if (line.startsWith('## ')) return <p key={i} className="font-semibold text-gray-900 mt-3 mb-1">{line.slice(3)}</p>

    const parts = line.split(/(\*\*[^*]+\*\*)/)
    const rendered = parts.map((part, j) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={j}>{part.slice(2, -2)}</strong>
        : part
    )

    if (line.startsWith('- ') || line.startsWith('• '))
      return <li key={i} className="ml-4 text-gray-600 list-disc">{rendered.map((p, j) => typeof p === 'string' ? p.replace(/^[-•] /, '') : p)}</li>
    if (line.startsWith('✓ '))
      return <p key={i} className="text-gray-700">✓ {rendered.map((p, j) => typeof p === 'string' ? p.replace(/^✓ /, '') : p)}</p>
    if (line.startsWith('⚠️'))
      return <p key={i} className="text-amber-800 font-medium">{rendered}</p>

    return <p key={i} className="text-gray-600 leading-relaxed">{rendered}</p>
  })
}

function AccordionBlock({ block, extraContent, defaultOpen = false }: { block: ContentBlock; extraContent?: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const isAmber = block.id === 'returns'
  const isBlue = block.id === 'measurement_notes'
  const isOrange = block.id === 'shipping'

  return (
    <div className="border-b-2 border-black">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left px-1"
      >
        <span className="text-sm font-medium tracking-wide uppercase text-gray-900">
          {block.title}
        </span>
        <span className="w-4 h-4 flex-shrink-0 relative">
          {/* 横线 */}
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-black" />
          {/* 竖线（展开时隐藏）*/}
          <span className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-black transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
        </span>
      </button>

      {open && (
        <div className="pb-5 px-1 text-sm space-y-1.5">
          {isAmber ? (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r">
              <div className="text-amber-800 space-y-1">{renderMarkdown(block.content)}</div>
            </div>
          ) : isBlue ? (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
              <div className="text-blue-800 space-y-1">{renderMarkdown(block.content)}</div>
            </div>
          ) : isOrange ? (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r">
              <div className="text-orange-800 space-y-1">{renderMarkdown(block.content)}</div>
            </div>
          ) : (
            <div className="space-y-1">{renderMarkdown(block.content)}</div>
          )}
          {block.id === 'measurement_notes' && extraContent}
        </div>
      )}
    </div>
  )
}

export default function ProductContent({ productId, productType, extraContent }: ProductContentProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use public store API — content_blocks included in the product response
    fetch(`/api/store/products/${productId}`)
      .then(r => r.json())
      .then(data => {
        const rawBlocks = data.data?.content_blocks || []
        if (data.success && rawBlocks.length > 0) {
          setBlocks(rawBlocks.filter((b: ContentBlock) => b.enabled))
        } else {
          setBlocks((DEFAULT_BLOCKS[productType] || []).filter(b => b.enabled))
        }
      })
      .catch(() => setBlocks((DEFAULT_BLOCKS[productType] || []).filter(b => b.enabled)))
      .finally(() => setLoading(false))
  }, [productId, productType])

  if (loading) return <div className="text-gray-400 text-sm py-4">Loading...</div>

  return (
    <>
      <div className="border-t-2 border-black">
        {blocks.map((block, i) => (
          <AccordionBlock key={block.id} block={block} extraContent={extraContent} defaultOpen={i === 0} />
        ))}
      </div>
      <ProductReviews productId={productId} />
    </>
  )
}
