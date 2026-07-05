'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SiteFooter from '@/components/SiteFooter'
import { COPYRIGHT } from '@/lib/site'

// ────────────────────────────────────────────────
// Accordion 折叠块
// ────────────────────────────────────────────────
export function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-medium tracking-widest uppercase text-gray-800 group-hover:text-black transition-colors">
          {title}
        </span>
        <span className={`text-xl text-gray-400 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[600px] pb-5' : 'max-h-0'}`}>
        <div className="text-sm text-gray-600 leading-relaxed space-y-2">
          {children}
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────
// 推荐产品卡片
// ────────────────────────────────────────────────
interface RelatedProduct {
  id: string
  name: string
  type: string
  main_image_url?: string
}

function RelatedProductCard({ product }: { product: RelatedProduct }) {
  const typeColors: Record<string, string> = {
    drapery: 'bg-blue-50 text-blue-700',
    sheer: 'bg-purple-50 text-purple-700',
    shade: 'bg-green-50 text-green-700',
    hardware: 'bg-orange-50 text-orange-700',
  }
  return (
    <Link href={`/store/${product.id}`} className="group block">
      <div className="relative aspect-square bg-gray-50 overflow-hidden mb-3 rounded-sm">
        {product.main_image_url ? (
          <Image
            src={product.main_image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl">□</div>
        )}
      </div>
      <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">
        <span className={`inline-block px-2 py-0.5 rounded text-xs ${typeColors[product.type] || 'bg-gray-100 text-gray-600'}`}>
          {product.type}
        </span>
      </p>
      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors leading-snug">
        {product.name}
      </p>
    </Link>
  )
}

// ────────────────────────────────────────────────
// ProductShell — 统一产品页面容器
// ────────────────────────────────────────────────
interface ProductShellProps {
  productId: string
  productName: string
  productType: string
  description?: string
  loading?: boolean
  // 左栏：图片区域
  imageSlot: ReactNode
  // 右栏：选项区域
  optionsSlot: ReactNode
  // 折叠说明（ContentBlock 渲染）
  accordionBlocks: { id: string; icon: string; title: string; content: ReactNode }[]
}

export default function ProductShell({
  productId,
  productName,
  productType,
  description,
  loading = false,
  imageSlot,
  optionsSlot,
  accordionBlocks,
}: ProductShellProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])

  const navigation = [
    { name: 'Home',         href: '/' },
    { name: 'About',        href: '/about' },
    { name: 'Our Projects', href: '/gallery' },
    { name: 'Products',     href: '/products' },
    { name: 'Online Store', href: '/store' },
    { name: 'Contact',      href: '/contact' },
  ]

  useEffect(() => {
    // Use public store API with type filter
    fetch(`/api/store/products?type=${productType}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const others = (data.data.products as any[])
            .filter(p => p.id !== productId)
            .slice(0, 4)
            .map(p => ({
              id: p.id,
              name: p.name,
              type: p.type,
              main_image_url: p.main_image_url,
            }))
          setRelatedProducts(others)
        }
      })
      .catch(() => {})
  }, [productId, productType])

  return (
    <main className="min-h-screen bg-white" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {/* ── Nav ── */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <span className="text-base tracking-[0.2em] font-light text-gray-900 hover:text-gray-500 transition-colors uppercase">
              Angel Drapery, Inc
            </span>
          </Link>
          <nav>
            <ul className="flex gap-1">
              {navigation.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredNav(item.name)}
                    onMouseLeave={() => setHoveredNav(null)}
                    className={`block px-3 py-1.5 rounded-full text-xs tracking-widest uppercase transition-all duration-200 ${
                      hoveredNav === item.name || item.name === 'Online Store'
                        ? 'bg-[#3d3d3d] text-white'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 tracking-widest uppercase">
          <Link href="/store" className="hover:text-gray-700 transition-colors">Store</Link>
          <span>›</span>
          <span className="capitalize">{productType}</span>
          {productName && <><span>›</span><span className="text-gray-600">{productName}</span></>}
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-300 text-sm tracking-widest">Loading…</div>
      ) : (
        <>
          {/* ── Main 2-col ── */}
          <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* LEFT: 图片 */}
              <div className="md:sticky md:top-24">
                {imageSlot}
              </div>

              {/* RIGHT: 名称 + 描述 + 选项 */}
              <div className="space-y-6">
                {/* 产品名 */}
                <div className="border-b border-gray-100 pb-5">
                  <h1 className="text-3xl font-light text-gray-900 leading-tight mb-3" style={{ letterSpacing: '-0.01em' }}>
                    {productName}
                  </h1>
                  {description && (
                    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                  )}
                </div>

                {/* 选项 + 价格 + 按钮 */}
                {optionsSlot}
              </div>
            </div>
          </section>

          {/* ── 折叠说明 ── */}
          {accordionBlocks.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 lg:px-8 py-6 border-t border-gray-100">
              <div className="grid md:grid-cols-2 gap-x-16">
                <div>
                  {accordionBlocks.slice(0, Math.ceil(accordionBlocks.length / 2)).map(block => (
                    <Accordion key={block.id} title={`${block.icon}  ${block.title}`}>
                      {block.content}
                    </Accordion>
                  ))}
                </div>
                <div>
                  {accordionBlocks.slice(Math.ceil(accordionBlocks.length / 2)).map(block => (
                    <Accordion key={block.id} title={`${block.icon}  ${block.title}`}>
                      {block.content}
                    </Accordion>
                  ))}
                  <div className="border-t border-gray-200" />
                </div>
              </div>
            </section>
          )}

          {/* ── 推荐产品 ── */}
          {relatedProducts.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 border-t border-gray-100">
              <h2 className="text-xs tracking-widest uppercase text-gray-400 mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(p => (
                  <RelatedProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Footer ── */}
      <SiteFooter />
    </main>
  )
}
