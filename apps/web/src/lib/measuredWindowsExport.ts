// 量窗记录 → AI 报价单的 windows[](P4-3b)
//
// ★ 为什么单独一个文件、而且是纯函数:
//   measured_windows.dims 是量窗向导和聊天工具**各自**写进去的自由 JSON。
//   在报价单那边照着猜它的字段,就是把向导的内部形状抄了第二份 —— 向导哪天
//   改一个键名,报价单会安安静静地漏掉尺寸,而没有任何东西会红。
//   所以这里是那份形状的**唯一出口**,配一份单测钉住它。向导改了就改这里,
//   一处。
//
// ★ 尺寸取 dims.widthIn / heightIn ——「窗洞尺寸」,不是向导算出来的成品/
//   订购尺寸(result.orderWidthIn 那些)。理由:AAPP 那边的
//   quote_luma_estimate / reference_estimate 收的一直是「Window width in
//   inches」,报价单必须跟同一个口径,不然同一扇窗在两条路上会报出两个价。

export interface MeasuredWindowLike {
  id: string
  label: string
  kind?: string
  product?: string
  config?: unknown
  dims?: unknown
  result?: unknown
}

export interface EstimateWindow {
  id: string
  label: string
  room?: string
  width_in: number
  height_in: number
  mount?: 'inside' | 'outside'
  notes?: string
}

export interface ExportResult {
  windows: EstimateWindow[]
  /** 没能带过去的,连原因一起报出来 —— 静默少一扇窗,客户收到的报价就是错的。 */
  skipped: Array<{ label: string; reason: 'no_dims' }>
}

const obj = (v: unknown): Record<string, unknown> =>
  (v && typeof v === 'object' && !Array.isArray(v)) ? (v as Record<string, unknown>) : {}

const inches = (v: unknown): number | null => {
  const n = Number(v)
  // 上限 400" ≈ 33 英尺。比这大的一定是单位搞错了(厘米当英寸),
  // 与其报一个天价,不如当没测。
  return Number.isFinite(n) && n > 0 && n <= 400 ? Math.round(n * 100) / 100 : null
}

/** 向导有 inside / inside_z / outside 三档,报价单只认内装/外装。
 *  inside_z(Z 型内装)在定价上就是内装。拿不准时**不猜** —— 返回
 *  undefined 让 AAPP 用它自己的默认,别在这边替它决定。 */
function toMount(raw: unknown): 'inside' | 'outside' | undefined {
  const s = String(raw == null ? '' : raw).trim()
  if (s === 'inside' || s === 'inside_z') return 'inside'
  if (s === 'outside') return 'outside'
  return undefined
}

export function measuredWindowsToEstimate(rows: MeasuredWindowLike[] | null | undefined): ExportResult {
  const windows: EstimateWindow[] = []
  const skipped: ExportResult['skipped'] = []
  ;(Array.isArray(rows) ? rows : []).forEach((r) => {
    const row = (r && typeof r === 'object') ? r : ({} as MeasuredWindowLike)
    const label = String(row.label || '').trim().slice(0, 120)
    const d = obj(row.dims)
    const c = obj(row.config)
    const w = inches(d.widthIn)
    const h = inches(d.heightIn)
    if (!w || !h) {
      skipped.push({ label: label || '(unnamed)', reason: 'no_dims' })
      return
    }
    const out: EstimateWindow = {
      id: String(row.id || '').slice(0, 60),
      label: label || 'Window',
      width_in: w,
      height_in: h,
    }
    const mount = toMount(c.mount)
    if (mount) out.mount = mount
    const notes = String(c.notes == null ? '' : c.notes).trim()
    if (notes) out.notes = notes.slice(0, 300)
    windows.push(out)
  })
  return { windows, skipped }
}
