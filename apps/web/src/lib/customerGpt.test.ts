import { describe, it, expect, afterEach } from 'vitest'
import {
  CUSTOMER_GPT_URL, customerGptUrl, referralOpeningLine, isSafeRefToken, estimateOpeningLine } from './customerGpt'

const ENV = process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL
afterEach(() => {
  if (ENV === undefined) delete process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL
  else process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL = ENV
})

describe('customerGptUrl — 客户版 GPT 入口的唯一真源', () => {
  it('默认用仓库里那条公开链接', () => {
    expect(customerGptUrl()).toBe(CUSTOMER_GPT_URL)
    expect(CUSTOMER_GPT_URL.startsWith('https://chatgpt.com/g/')).toBe(true)
  })

  it('env 覆盖优先(换链接不必改代码)', () => {
    process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL = 'https://chatgpt.com/g/g-other'
    expect(customerGptUrl()).toBe('https://chatgpt.com/g/g-other')
  })

  it('env 设成空串 → 不给链接(整块入口不渲染)', () => {
    process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL = '   '
    expect(customerGptUrl()).toBe('')
  })

  it('★ 链接上不许再挂 ref —— 实测它不会注入对话,挂了只会让人以为归因还在', () => {
    expect(customerGptUrl()).not.toContain('ref=')
    expect(customerGptUrl()).not.toContain('?')
  })

  it('★ 链接里不含任何密钥(PUBLIC_GPT_KEY 只在 Firebase secret 与 Builder 里)', () => {
    expect(/key|secret|authorization|bearer/i.test(customerGptUrl())).toBe(false)
  })
})

describe('referralOpeningLine — 归因真正靠的那句话', () => {
  const T = 'CUSTtokenCUSTtoken0001'

  it('★ 形状必须与 Instructions 的 REFERRAL 一节对得上(消息里出现 ref=<token>)', () => {
    const en = referralOpeningLine(T, 'en')
    expect(en.startsWith(`ref=${T}`)).toBe(true)
    expect(en).toContain('referral')
  })

  it('中文版同样带 token', () => {
    const zh = referralOpeningLine(T, 'zh')
    expect(zh.startsWith(`ref=${T}`)).toBe(true)
    expect(zh).toContain('朋友推荐')
  })

  it('★ 形状不对的 token 一律不出口令(宁可没有,不能拼出个假的)', () => {
    for (const bad of ['', '   ', '@@@', 'a b', 'x'.repeat(65), '../../etc']) {
      expect(referralOpeningLine(bad as string, 'en')).toBe('')
      expect(isSafeRefToken(bad as string)).toBe(false)
    }
  })

  it('口令里没有密钥,只有 token', () => {
    expect(/key|secret|bearer/i.test(referralOpeningLine(T, 'en'))).toBe(false)
  })
})

describe('estimateOpeningLine —— 拿报价单去 ChatGPT 接着聊(P4-4)', () => {
  it('★ 口令里绝不含 6 位取件码 —— 查看链接会被转发,改单的权限得留给手里有码的人', () => {
    const line = estimateOpeningLine('AE-2608-6AEJ', 'zh')
    expect(line).toContain('AE-2608-6AEJ')
    expect(line).not.toMatch(/\d{6}/)
  })

  it('单号形状不对就不拼(0/O/1/I 不在 Crockford 里)', () => {
    for (const bad of ['AE-2608-0AEJ', 'AE-2608-OAEJ', 'AE-2608-1AEJ', 'AE-2608-IAEJ',
                       'AE-26-6AEJ', 'nonsense', '']) {
      expect(estimateOpeningLine(bad)).toBe('')
    }
  })

  it('小写也认,双语各有一句', () => {
    expect(estimateOpeningLine('ae-2608-6aej', 'en')).toContain('AE-2608-6AEJ')
    expect(estimateOpeningLine('AE-2608-6AEJ', 'zh')).toContain('报价单')
    expect(estimateOpeningLine('AE-2608-6AEJ', 'en')).toContain('estimate')
  })
})
