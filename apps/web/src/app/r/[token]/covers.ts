// server-only. 千万不能被任何 'use client' 组件间接 import —— 它拉了 pg,
// build 时会把 pg 塞进 client bundle 炸掉(见 apps/web/src/lib/db.ts 的注释)。
// 只有 page.tsx(Server Component)可以 import 这个文件。
import pool from '@/lib/db'
import { CDN_BASE } from '@/lib/cdn'

// 与 apps/web/src/app/products/[slug]/page.tsx 里的 toAbsoluteImage 同一条规则:
// 已经是绝对 URL 的直接用,否则拼上 CDN_BASE。
function toAbs(src?: string | null): string | undefined {
  if (!src) return undefined
  if (/^https?:\/\//.test(src)) return src
  return `${CDN_BASE}${src.startsWith('/') ? '' : '/'}${src}`
}

/** ★ 3 秒超时保护——落地页已经吃过一次「后端慢 → 整页跳主页」的亏
 *  (见 SONNET-报告-整改#31#32推荐链接跳主页.../[[referral-zombie-token]])。
 *  这里的代价小得多(只是卡片封面),但同样的教训:库慢/挂了也必须按时出页,
 *  卡片退回占位色块 + 名字,绝不能拖慢或拖垮整个落地页。 */
const QUERY_TIMEOUT_MS = 3000

interface CoverRow {
  slug: string
  name: string | null
  cover_image: string | null
}

/** 给落地页/合作方卡片墙取 DB 封面。库挂了 / 超时都返回空对象——调用方
 *  (referralCollections.ts 的 ProductCard.image === null 那几张卡)会退回
 *  占位色块 + 卡片自带的兜底名字,页面不会崩、也不会被这一步拖慢。 */
export async function resolveCovers(
  slugs: string[]
): Promise<Record<string, { image: string; name?: string }>> {
  if (!slugs.length) return {}
  try {
    const rows = await Promise.race([
      pool
        .query(`SELECT slug, name, cover_image FROM showcase_products WHERE status='active' AND slug = ANY($1)`, [
          slugs,
        ])
        .then((r: { rows: CoverRow[] }) => r.rows),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('resolveCovers: query timed out')), QUERY_TIMEOUT_MS)
      }),
    ])
    const out: Record<string, { image: string; name?: string }> = {}
    for (const row of rows) {
      const image = toAbs(row.cover_image)
      if (image) out[row.slug] = { image, name: row.name || undefined }
    }
    return out
  } catch {
    return {}
  }
}
