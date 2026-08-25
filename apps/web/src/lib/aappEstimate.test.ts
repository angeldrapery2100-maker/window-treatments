import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import {
  loadEstimate, loadEstimateByViewToken, saveEstimate, stripPriceFields,
  ESTIMATE_NO_RE, ACCESS_CODE_RE, VIEW_TOKEN_RE,
} from './aappEstimate'
import { configSummary } from './estimateDisplay'

const NO = 'AE-2608-6AEJ'
const CODE = '481502'
const VIEW = 'abcdefghijkLMNOP012_-x'   // 22 位 base64url

function stub(response: Record<string, unknown> = { ok: true }, opts: { status?: number } = {}) {
  const calls: any[] = []
  vi.stubGlobal('fetch', async (url: string, init: any) => {
    calls.push({ url, headers: init.headers, body: JSON.parse(init.body) })
    return {
      ok: (opts.status || 200) < 400,
      status: opts.status || 200,
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as any
  })
  return calls
}

beforeEach(() => { process.env.AAPP_WEBINTAKE_SECRET = 'test-secret' })
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('形状校验就地拦下,不打网络', () => {
  it('单号格式不对 → not_found,且一次 fetch 都没发', async () => {
    const calls = stub()
    expect(await loadEstimate('AE-2608-0OIL', CODE)).toEqual({ ok: false, error: 'not_found' })
    expect(await loadEstimate('nonsense', CODE)).toEqual({ ok: false, error: 'not_found' })
    expect(await loadEstimate(NO, '12345')).toEqual({ ok: false, error: 'not_found' })
    expect(calls).toHaveLength(0)
  })

  it('★ 「格式不对」和「查不到」回的是同一句话 —— 多说一句就是替攻击者省一轮', async () => {
    stub({ ok: false, error: 'not_found' })
    const backend = await loadEstimate(NO, CODE)
    vi.unstubAllGlobals()
    const calls = stub()
    const local = await loadEstimate('AE-2608-0OI1', '000000')   /* 0/O/I/1 都不在 Crockford 里 */
    expect(calls).toHaveLength(0)               // 这一发根本没出门
    expect(local).toEqual(backend)              // 但客户看到的完全一样
  })

  it('viewToken 长度/字符不对 → not_found', async () => {
    const calls = stub()
    expect(await loadEstimateByViewToken('short')).toEqual({ ok: false, error: 'not_found' })
    expect(await loadEstimateByViewToken('!'.repeat(22))).toEqual({ ok: false, error: 'not_found' })
    expect(calls).toHaveLength(0)
  })

  it('正则本身:Crockford 去掉了 0/O/1/I', () => {
    expect(ESTIMATE_NO_RE.test('AE-2608-2345')).toBe(true)
    for (const c of ['0', 'O', '1', 'I']) expect(ESTIMATE_NO_RE.test(`AE-2608-234${c}`)).toBe(false)
    expect(ACCESS_CODE_RE.test('012345')).toBe(true)
    expect(ACCESS_CODE_RE.test('12345')).toBe(false)
    expect(VIEW_TOKEN_RE.test('a'.repeat(22))).toBe(true)
    expect(VIEW_TOKEN_RE.test('a'.repeat(21))).toBe(false)
  })
})

describe('密钥', () => {
  it('★ 密钥没配 → 直接失败,不发请求(匿名请求必被 401,发过去只是白等一个来回)', async () => {
    delete process.env.AAPP_WEBINTAKE_SECRET
    const calls = stub()
    expect(await loadEstimate(NO, CODE)).toEqual({ ok: false, error: 'not_configured' })
    expect(calls).toHaveLength(0)
  })

  it('★ 密钥走 x-ad-key 头,绝不进 body(body 会被日志、错误上报原样带走)', async () => {
    const calls = stub({ ok: true, estimate: { estimateNo: NO } })
    await loadEstimate(NO, CODE)
    expect(calls[0].headers['x-ad-key']).toBe('test-secret')
    expect(JSON.stringify(calls[0].body)).not.toContain('test-secret')
    expect(calls[0].url).not.toContain('test-secret')
  })
})

describe('saveEstimate', () => {
  it('没有 sessionId → 就地拒', async () => {
    const calls = stub()
    expect(await saveEstimate({ sessionId: '  ' })).toEqual({ ok: false, error: 'need_session' })
    expect(calls).toHaveLength(0)
  })

  it('★ 条目里的价格字段一个都不许出门 —— 价永远由后端自己算', async () => {
    const calls = stub({ ok: true, estimate_no: NO, access_code: CODE })
    await saveEstimate({
      sessionId: 's1',
      items: [{ id: 'i1', family: 'catalog', variant: 'roller_shade', qty: 1,
                price: 999, basePrice: 111, refPrice: 222,
                config: { fabric_full_code: 'MB8-001', listPrice: 333 } }],
    })
    const sent = JSON.stringify(calls[0].body)
    for (const k of ['price', 'basePrice', 'refPrice', 'listPrice', '999', '111', '222', '333']) {
      expect(sent).not.toContain(k)
    }
    expect(calls[0].body.items[0].config.fabric_full_code).toBe('MB8-001')
  })

  it('带单号 + 码 → 走「改」;缺一个就当新建', async () => {
    let calls = stub({ ok: true, estimate_no: NO })
    await saveEstimate({ sessionId: 's1', estimateNo: NO, accessCode: CODE })
    expect(calls[0].body.estimate_no).toBe(NO)
    expect(calls[0].body.access_code).toBe(CODE)

    vi.unstubAllGlobals()
    calls = stub({ ok: true, estimate_no: NO })
    await saveEstimate({ sessionId: 's1', estimateNo: NO })
    expect(calls[0].body.estimate_no).toBeUndefined()
  })

  it('★ 渠道只能是这两个之一 —— 客户 GPT 那个渠道由钥匙决定,网站不许声称', async () => {
    const calls = stub({ ok: true })
    await saveEstimate({ sessionId: 's1', channel: 'customer_gpt' as never })
    expect(calls[0].body.channel).toBe('website_ai')
    vi.unstubAllGlobals()
    const c2 = stub({ ok: true })
    await saveEstimate({ sessionId: 's1', channel: 'referral_page_ai' })
    expect(c2[0].body.channel).toBe('referral_page_ai')
  })

  it('单号小写也认(客户会手打)', async () => {
    const calls = stub({ ok: true })
    await saveEstimate({ sessionId: 's1', estimateNo: NO.toLowerCase(), accessCode: CODE })
    expect(calls[0].body.estimate_no).toBe(NO)
  })
})

describe('后端出错时优雅降级', () => {
  it('HTTP 500 → ok:false,不抛', async () => {
    stub({ error: 'boom' }, { status: 500 })
    expect((await loadEstimateByViewToken(VIEW)).ok).toBe(false)
  })

  it('网络挂掉 → ok:false,不抛', async () => {
    vi.stubGlobal('fetch', async () => { throw new Error('ECONNRESET') })
    expect(await loadEstimateByViewToken(VIEW)).toEqual({ ok: false, error: 'network' })
  })

  it('后端回 ok:false → 原样把 error 带回来给页面挑文案', async () => {
    stub({ ok: false, error: 'expired' })
    expect(await loadEstimateByViewToken(VIEW)).toEqual({ ok: false, error: 'expired' })
  })
})

describe('stripPriceFields', () => {
  it('嵌套的 config 也扫', () => {
    expect(stripPriceFields({ a: 1, price: 2, config: { b: 3, cost: 4 } }))
      .toEqual({ a: 1, config: { b: 3 } })
  })
  it('非对象原样返回', () => {
    expect(stripPriceFields(null)).toBe(null)
    expect(stripPriceFields('x')).toBe('x')
  })
})

describe('configSummary —— 页面上那行配置摘要', () => {
  it('★ 键名带钱味的一律不显示(config 的形状由上游决定,不能照单全收)', () => {
    const out = configSummary({
      fabricFullCode: 'MB8-001', cassette: 'open_roll',
      unitCost: 300, dealerPrice: 900, listPrice: 1234, markupMultiplier: 2.4,
      installFee: 85, wholesale: 1, myRate: 0.3,
    })
    expect(out).toEqual(['MB8-001', 'open roll'])
    expect(out.join(' ')).not.toMatch(/300|900|1234|2\.4|85/)
  })

  it('对象/数组/布尔不显示 —— 只放行字符串和数字', () => {
    expect(configSummary({ a: { b: 1 }, c: [1, 2], d: true, e: 'ok', f: 3 })).toEqual(['ok', '3'])
  })

  it('下划线换成空格,空值跳过,最多四段', () => {
    expect(configSummary({ a: 'plastic_chain', b: '  ', c: 'x', d: 'y', e: 'z', f: 'w' }))
      .toEqual(['plastic chain', 'x', 'y', 'z'])
  })

  it('非对象 → []', () => {
    expect(configSummary(null)).toEqual([])
    expect(configSummary(['a'])).toEqual([])
  })
})

describe('客户端组件与服务端密钥的边界', () => {
  it('★ EstimateView 只能 import type,不许从 aappEstimate 取值', () => {
    const fs = require('node:fs') as typeof import('node:fs')
    const src = fs.readFileSync(
      new URL('../app/estimate/[viewToken]/EstimateView.tsx', import.meta.url), 'utf8')
    /* ★ [^;]* 会跨行 —— 上一行的 `import { configSummary } from '@/lib/estimateDisplay'`
       加下一行的 `from '@/lib/aappEstimate'` 会被当成一条 import 匹上,守卫当场误报。
       限制在同一行内。 */
    const valueImports = [...src.matchAll(/^import\s+(?!type\b)[^;\n]*from '@\/lib\/aappEstimate'/gm)]
    expect(valueImports).toHaveLength(0)
  })

  it('★ 密钥只在函数体里读,不在模块顶层 —— 顶层读就会被打进客户端包', () => {
    const fs = require('node:fs') as typeof import('node:fs')
    const src = fs.readFileSync(new URL('./aappEstimate.ts', import.meta.url), 'utf8')
    const head = src.slice(0, src.indexOf('function assertServerOnly'))
    expect(head).not.toContain('AAPP_WEBINTAKE_SECRET')
  })
})
