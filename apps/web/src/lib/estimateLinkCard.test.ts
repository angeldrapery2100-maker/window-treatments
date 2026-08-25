import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { safeEstimateViewUrl } from './estimateDisplay'

/* P6 §1:聊天里的报价单链接卡。
   这段字符串最终进 <a href> —— 白名单是它唯一的防线。 */

const GOOD = 'https://angel-drapery.com/estimate/abcdefghijkLMNOP012_-x'

describe('safeEstimateViewUrl', () => {
  it('★ 认自家域名下的 /estimate/<22位>', () => {
    expect(safeEstimateViewUrl(GOOD)).toBe(GOOD)
    expect(safeEstimateViewUrl('  ' + GOOD + '  ')).toBe(GOOD)
  })

  it('★★ 外域、伪装域名、非 https、长度不对、伪协议 —— 一律不认', () => {
    for (const bad of [
      'https://evil.com/estimate/abcdefghijkLMNOP012_-x',
      'https://angel-drapery.com.evil.com/estimate/abcdefghijkLMNOP012_-x',
      'https://evil.com/?x=https://angel-drapery.com/estimate/abcdefghijkLMNOP012_-x',
      'http://angel-drapery.com/estimate/abcdefghijkLMNOP012_-x',
      'https://angel-drapery.com/estimate/short',
      'https://angel-drapery.com/estimate/' + 'a'.repeat(23),
      'https://angel-drapery.com/store/abcdefghijkLMNOP012_-x',
      'javascript:alert(1)',
      '', null, undefined, 42, {},
    ]) {
      expect(safeEstimateViewUrl(bad as never)).toBe('')
    }
  })

  it('★ 和 AAPP 档案页那条判据保持同形(两处都要改的时候别只改一处)', () => {
    // 这里只能断言本仓库这一半;AAPP 那一半由 estimate-quote-tests.js ⑨b 守着。
    expect(safeEstimateViewUrl('https://angel-drapery.com/estimate/' + 'A'.repeat(22))).not.toBe('')
  })
})

describe('接线:route 抓字段、组件渲染卡', () => {
  const root = path.resolve(__dirname, '..')
  const route = fs.readFileSync(path.join(root, 'app/api/store/assistant/route.ts'), 'utf8')
  const comp = fs.readFileSync(path.join(root, 'components/StoreAssistant.tsx'), 'utf8')

  it('★ route 只在 save_estimate 的结果里抓 view_url,而且过白名单', () => {
    expect(route).toMatch(/block\.name === 'save_estimate'/)
    expect(route).toMatch(/safeEstimateViewUrl\(\(result as any\)\?\.view_url\)/)
  })

  it('★★ 客户端再过一遍白名单 —— 这一段直接进 href', () => {
    // 渲染处和收数据处都必须过
    expect(comp).toMatch(/href=\{safeEstimateViewUrl\(m\.estimateUrl\)\}/)
    expect(comp).toMatch(/safeEstimateViewUrl\(json\.data\.estimateUrl\)/)
  })

  it('★ 卡上带 target=_blank + rel=noopener(外开链接的老规矩)', () => {
    const card = comp.slice(comp.indexOf('safeEstimateViewUrl(m.estimateUrl)'), comp.indexOf('{m.bookingLink &&'))
    expect(card).toMatch(/target="_blank"/)
    expect(card).toMatch(/rel="noopener noreferrer"/)
    expect(card).toMatch(/View your estimate \/ 查看你的报价单/)
  })

  it('★★ GPT 那一路的响应形状(没有 view_url)不会渲染出卡', () => {
    // GPT key 的 save_estimate 响应里被剥掉了 view_url —— 前端拿到 undefined
    expect(safeEstimateViewUrl(undefined)).toBe('')
    // 渲染条件是 !!safeEstimateViewUrl(...),空串即不渲染
    expect(comp).toMatch(/\{!!safeEstimateViewUrl\(m\.estimateUrl\) && \(/)
  })
})
