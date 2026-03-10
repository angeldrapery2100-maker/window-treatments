'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface CropperProps {
  imageSrc: string
  aspectRatio: number   // 宽/高，主图 1:1 → 1，Gallery → 1:1 也用1
  onConfirm: (croppedBlob: Blob) => void
  onCancel: () => void
  title?: string
}

export default function ImageCropper({ imageSrc, aspectRatio, onConfirm, onCancel, title }: CropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // 画布上图片的实际渲染区域
  const [imgRect, setImgRect] = useState({ x: 0, y: 0, w: 0, h: 0 })
  // 裁剪框（相对于画布坐标）
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 })
  // 拖拽状态
  const dragState = useRef<null | {
    type: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 'top' | 'bottom' | 'left' | 'right'
    startX: number; startY: number
    origCrop: { x: number; y: number; w: number; h: number }
  }>(null)

  const HANDLE = 10 // 手柄大小

  // 加载图片
  useEffect(() => {
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      imageRef.current = img
      initLayout(img)
    }
  }, [imageSrc])

  const initLayout = (img: HTMLImageElement) => {
    const MAX = 600
    const canvas = canvasRef.current
    if (!canvas) return

    // 计算画布尺寸，保持图片比例，最大 600px
    const scale = Math.min(MAX / img.width, MAX / img.height, 1)
    const cw = Math.round(img.width * scale)
    const ch = Math.round(img.height * scale)
    canvas.width = cw
    canvas.height = ch

    const rect = { x: 0, y: 0, w: cw, h: ch }
    setImgRect(rect)

    // 初始裁剪框：居中，按 aspectRatio 尽量大
    let cropW: number, cropH: number
    if (cw / ch > aspectRatio) {
      cropH = ch * 0.9
      cropW = cropH * aspectRatio
    } else {
      cropW = cw * 0.9
      cropH = cropW / aspectRatio
    }
    const cx = (cw - cropW) / 2
    const cy = (ch - cropH) / 2
    setCrop({ x: cx, y: cy, w: cropW, h: cropH })
    draw(img, rect, { x: cx, y: cy, w: cropW, h: cropH })
  }

  const draw = useCallback((
    img: HTMLImageElement,
    ir: { x: number; y: number; w: number; h: number },
    c: { x: number; y: number; w: number; h: number }
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制图片
    ctx.drawImage(img, ir.x, ir.y, ir.w, ir.h)

    // 暗色遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 裁剪区域透明（显示原图）
    ctx.clearRect(c.x, c.y, c.w, c.h)
    ctx.drawImage(img, 
      (c.x / ir.w) * img.width,
      (c.y / ir.h) * img.height,
      (c.w / ir.w) * img.width,
      (c.h / ir.h) * img.height,
      c.x, c.y, c.w, c.h
    )

    // 边框
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.strokeRect(c.x, c.y, c.w, c.h)

    // 三等分网格线
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 0.8
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(c.x + c.w * i / 3, c.y)
      ctx.lineTo(c.x + c.w * i / 3, c.y + c.h)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(c.x, c.y + c.h * i / 3)
      ctx.lineTo(c.x + c.w, c.y + c.h * i / 3)
      ctx.stroke()
    }

    // 四角手柄
    ctx.fillStyle = '#fff'
    const corners = [
      [c.x, c.y], [c.x + c.w - HANDLE, c.y],
      [c.x, c.y + c.h - HANDLE], [c.x + c.w - HANDLE, c.y + c.h - HANDLE]
    ]
    corners.forEach(([hx, hy]) => ctx.fillRect(hx, hy, HANDLE, HANDLE))
  }, [])

  // 每次 crop 或 imgRect 变化时重绘
  useEffect(() => {
    if (imageRef.current && imgRect.w > 0 && crop.w > 0) {
      draw(imageRef.current, imgRect, crop)
    }
  }, [crop, imgRect, draw])

  // 判断点击位置类型
  const getHitType = (px: number, py: number, c: typeof crop) => {
    const { x, y, w, h } = c
    const inH = HANDLE + 2
    if (px >= x && px <= x + inH && py >= y && py <= y + inH) return 'tl'
    if (px >= x + w - inH && px <= x + w && py >= y && py <= y + inH) return 'tr'
    if (px >= x && px <= x + inH && py >= y + h - inH && py <= y + h) return 'bl'
    if (px >= x + w - inH && px <= x + w && py >= y + h - inH && py <= y + h) return 'br'
    if (px >= x && px <= x + w && py >= y && py <= y + 4) return 'top'
    if (px >= x && px <= x + w && py >= y + h - 4 && py <= y + h) return 'bottom'
    if (px >= x && px <= x + 4 && py >= y && py <= y + h) return 'left'
    if (px >= x + w - 4 && px <= x + w && py >= y && py <= y + h) return 'right'
    if (px >= x && px <= x + w && py >= y && py <= y + h) return 'move'
    return null
  }

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const { x, y } = getCanvasPos(e)
    const type = getHitType(x, y, crop)
    if (!type) return
    dragState.current = { type, startX: x, startY: y, origCrop: { ...crop } }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current) return
    e.preventDefault()
    const { x, y } = getCanvasPos(e)
    const dx = x - dragState.current.startX
    const dy = y - dragState.current.startY
    const o = dragState.current.origCrop
    const ir = imgRect
    const minSize = 30

    let nc = { ...o }
    const type = dragState.current.type

    if (type === 'move') {
      nc.x = Math.max(ir.x, Math.min(ir.x + ir.w - o.w, o.x + dx))
      nc.y = Math.max(ir.y, Math.min(ir.y + ir.h - o.h, o.y + dy))
    } else {
      // 各方向拉伸，保持 aspectRatio
      if (type === 'tl' || type === 'bl' || type === 'left') {
        const newW = Math.max(minSize, o.w - dx)
        const newH = newW / aspectRatio
        nc.w = newW; nc.h = newH
        nc.x = Math.max(ir.x, o.x + o.w - newW)
        if (type !== 'left') nc.y = o.y + o.h - newH
      }
      if (type === 'tr' || type === 'br' || type === 'right') {
        const newW = Math.max(minSize, o.w + dx)
        const newH = newW / aspectRatio
        nc.w = newW; nc.h = newH
        if (type !== 'right') nc.y = o.y + o.h - newH
      }
      if (type === 'top') {
        const newH = Math.max(minSize, o.h - dy)
        const newW = newH * aspectRatio
        nc.h = newH; nc.w = newW
        nc.y = Math.max(ir.y, o.y + o.h - newH)
        nc.x = o.x + (o.w - newW) / 2
      }
      if (type === 'bottom') {
        const newH = Math.max(minSize, o.h + dy)
        const newW = newH * aspectRatio
        nc.h = newH; nc.w = newW
        nc.x = o.x + (o.w - newW) / 2
      }
      // 限制在图片范围内
      nc.x = Math.max(ir.x, nc.x)
      nc.y = Math.max(ir.y, nc.y)
      if (nc.x + nc.w > ir.x + ir.w) nc.w = ir.x + ir.w - nc.x
      if (nc.y + nc.h > ir.y + ir.h) nc.h = ir.y + ir.h - nc.y
    }
    setCrop(nc)
  }

  const onMouseUp = () => { dragState.current = null }

  // 鼠标样式
  const getCursor = useCallback((e: React.MouseEvent) => {
    const { x, y } = getCanvasPos(e)
    const type = getHitType(x, y, crop)
    const cursors: Record<string, string> = {
      move: 'move', tl: 'nw-resize', tr: 'ne-resize',
      bl: 'sw-resize', br: 'se-resize',
      top: 'n-resize', bottom: 's-resize',
      left: 'w-resize', right: 'e-resize'
    }
    if (canvasRef.current) {
      canvasRef.current.style.cursor = type ? cursors[type] : 'crosshair'
    }
  }, [crop])

  // 确认裁剪
  const handleConfirm = () => {
    const img = imageRef.current
    if (!img || !imgRect.w) return
    const ir = imgRect

    // 计算裁剪区域在原图中的坐标
    const srcX = (crop.x / ir.w) * img.naturalWidth
    const srcY = (crop.y / ir.h) * img.naturalHeight
    const srcW = (crop.w / ir.w) * img.naturalWidth
    const srcH = (crop.h / ir.h) * img.naturalHeight

    // 输出尺寸：主图 800x800，Gallery 按比例
    const outW = Math.round(Math.min(srcW, 1200))
    const outH = Math.round(outW / aspectRatio)

    const offscreen = document.createElement('canvas')
    offscreen.width = outW
    offscreen.height = outH
    const ctx = offscreen.getContext('2d')!
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH)
    offscreen.toBlob(blob => { if (blob) onConfirm(blob) }, 'image/jpeg', 0.92)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title || '裁剪图片'}</h3>
            <p className="text-xs text-gray-400 mt-0.5">拖动选框调整裁剪区域，拖动四角缩放</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="p-5" ref={containerRef}>
          <div className="flex justify-center bg-gray-100 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[420px]"
              style={{ display: 'block' }}
              onMouseDown={onMouseDown}
              onMouseMove={(e) => { getCursor(e); onMouseMove(e) }}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-[#3d3d3d] text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            确认裁剪
          </button>
        </div>
      </div>
    </div>
  )
}
