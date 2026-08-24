import { describe, it, expect, afterEach } from 'vitest'
import { CUSTOMER_GPT_URL, customerGptUrl } from './customerGpt'

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

  it('带 token 时把 ref 拼上去(GPT 的 REFERRAL 一节靠它认推荐人)', () => {
    expect(customerGptUrl('CUSTtokenCUSTtoken0001'))
      .toBe(`${CUSTOMER_GPT_URL}?ref=CUSTtokenCUSTtoken0001`)
  })

  it('链接本身已经带查询串时用 & 续接', () => {
    process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL = 'https://chatgpt.com/g/g-x?model=gpt-5'
    expect(customerGptUrl('T1')).toBe('https://chatgpt.com/g/g-x?model=gpt-5&ref=T1')
  })

  it('env 覆盖优先(换链接不必改代码)', () => {
    process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL = 'https://chatgpt.com/g/g-other'
    expect(customerGptUrl()).toBe('https://chatgpt.com/g/g-other')
  })

  it('env 设成空串 → 不给链接(按钮回到禁用态,不是拼一个坏 URL)', () => {
    process.env.NEXT_PUBLIC_CUSTOMER_GPT_URL = '   '
    expect(customerGptUrl('T1')).toBe('')
  })

  it('★ 形状不对的 token 一律丢掉,不往 URL 上拼', () => {
    for (const bad of ['', '  ', '@@@', 'a b', 'x'.repeat(65), '../../etc', 'T1&ref=other']) {
      expect(customerGptUrl(bad)).toBe(CUSTOMER_GPT_URL)
    }
  })

  it('★ 链接里不含任何密钥(PUBLIC_GPT_KEY 只在 Firebase secret 与 Builder 里)', () => {
    const u = customerGptUrl('CUSTtokenCUSTtoken0001')
    expect(/key|secret|token=|authorization|bearer/i.test(u)).toBe(false)
    /* ref= 是推荐人 token,不是凭证:它只在 referralPublic 上查得到零 PII 的展示信息 */
    expect(u.split('?')[1]).toBe('ref=CUSTtokenCUSTtoken0001')
  })
})
