'use client'

import type { CSSProperties } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 详情版面 renderer (2026-07-14, Eddie's page-builder).
//
// The admin lays out image frames and text blocks on a fixed 960-unit-wide
// canvas (编辑产品 → 详情版面 tab, stored at default_config.detail_canvas).
// This renders the layout scaled proportionally to the page width using
// container-query units (1cqw = 1% of container width), so the composition is
// pixel-identical on every screen — mobile simply scales down (等比缩小).
// When a product has no canvas, the product page falls back to the legacy
// GalleryCards magazine layout.
// ─────────────────────────────────────────────────────────────────────────────

export interface CanvasBlock {
  id: string
  type: 'image' | 'text'
  /** Design units = px on the 960-wide reference canvas. */
  x: number
  y: number
  w: number
  h: number
  url?: string
  text?: string
  /** Text styling (design px; scaled with the canvas). */
  size?: number
  serif?: boolean
  bold?: boolean
  color?: string
  align?: 'left' | 'center' | 'right'
}

export interface DetailCanvasData {
  bg: string
  height: number
  blocks: CanvasBlock[]
}

export const CANVAS_DESIGN_W = 960
const U = CANVAS_DESIGN_W / 100 // design units per cqw

export default function DetailCanvas({ canvas }: { canvas: DetailCanvasData }) {
  if (!canvas || !Array.isArray(canvas.blocks) || canvas.blocks.length === 0) return null
  return (
    <div style={{ containerType: 'inline-size' } as CSSProperties}>
      <div
        className="relative w-full overflow-hidden"
        style={{ height: `${(canvas.height || 1200) / U}cqw`, background: canvas.bg || '#faf9f6' }}
      >
        {canvas.blocks.map(b => {
          const pos: CSSProperties = {
            position: 'absolute',
            left: `${b.x / U}cqw`,
            top: `${b.y / U}cqw`,
            width: `${b.w / U}cqw`,
            height: `${b.h / U}cqw`,
          }
          if (b.type === 'image') {
            if (!b.url) return null
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={b.id} src={b.url} alt="" loading="lazy" style={{ ...pos, objectFit: 'cover' }} />
            )
          }
          return (
            <div
              key={b.id}
              style={{
                ...pos,
                fontSize: `${(b.size || 14) / U}cqw`,
                lineHeight: 1.6,
                color: b.color || '#374151',
                fontFamily: b.serif ? 'Georgia, "Songti SC", "Noto Serif SC", serif' : undefined,
                fontWeight: b.bold ? 600 : 400,
                textAlign: b.align || 'left',
                whiteSpace: 'pre-line',
                overflow: 'hidden',
              }}
            >
              {b.text || ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}
