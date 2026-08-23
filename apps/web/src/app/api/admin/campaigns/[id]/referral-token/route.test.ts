import { describe, it, expect, vi, beforeEach } from 'vitest'

/* 这条路由自己的逻辑很短,但每一条都是「错了不报错」的那种:
   - 没鉴权就能建归因通道
   - 用请求体里的 slug 而不是库里那条记录的 slug
   - AAPP 失败了却照样把空 token 写进库
   所以三个依赖全 mock 掉,只测路由本身。 */

const auth = vi.hoisted(() => ({ ok: true }))
const calls = vi.hoisted(() => ({ ensure: [] as any[], save: [] as any[] }))
const row = vi.hoisted(() => ({
  value: { id: '11111111-1111-1111-1111-111111111111', slug: 'aug-postcard', name: 'Aug Postcard' } as any,
}))
const ensureResult = vi.hoisted(() => ({
  value: { ok: true, token: 'CAMPtoken0123456789ab', url: 'https://angel-drapery.com/r/CAMPtoken0123456789ab', reused: false } as any,
}))

vi.mock('@/lib/auth', () => ({
  requireAdmin: () => { if (!auth.ok) throw new Error('Admin required') },
}))
vi.mock('@/lib/campaigns', () => ({
  getCampaignById: async (id: string) => (row.value && row.value.id === id ? row.value : null),
  setCampaignReferralToken: async (id: string, token: unknown) => { calls.save.push({ id, token }) },
}))
vi.mock('@/lib/referral', () => ({
  ensureCampaignReferralToken: async (slug: string, name?: string) => {
    calls.ensure.push({ slug, name })
    return ensureResult.value
  },
}))

import { POST } from './route'

const ID = '11111111-1111-1111-1111-111111111111'
const post = (id = ID, body?: any) =>
  POST(
    new Request(`https://angel-drapery.com/api/admin/campaigns/${id}/referral-token`, {
      method: 'POST',
      ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
    }),
    { params: Promise.resolve({ id }) }
  )

beforeEach(() => {
  auth.ok = true
  calls.ensure.length = 0
  calls.save.length = 0
  row.value = { id: ID, slug: 'aug-postcard', name: 'Aug Postcard' }
  ensureResult.value = { ok: true, token: 'CAMPtoken0123456789ab', url: 'https://angel-drapery.com/r/CAMPtoken0123456789ab', reused: false }
})

describe('POST /api/admin/campaigns/[id]/referral-token', () => {
  it('★ 未登录 → 401,而且不去 AAPP 建任何东西', async () => {
    auth.ok = false
    const res = await post()
    expect(res.status).toBe(401)
    expect(calls.ensure).toHaveLength(0)
    expect(calls.save).toHaveLength(0)
  })

  it('id 不是 uuid → 400', async () => {
    const res = await post('not-a-uuid')
    expect(res.status).toBe(400)
    expect(calls.ensure).toHaveLength(0)
  })

  it('活动不存在 → 404', async () => {
    row.value = null
    const res = await post()
    expect(res.status).toBe(404)
    expect(calls.ensure).toHaveLength(0)
  })

  it('成功 → 回填 token 并返回它', async () => {
    const res = await post()
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toMatchObject({ success: true, data: { referral_token: 'CAMPtoken0123456789ab' } })
    expect(calls.save).toEqual([{ id: ID, token: 'CAMPtoken0123456789ab' }])
  })

  it('★ slug 取自库里那条记录,不认请求体', async () => {
    // 否则拿 A 活动的 id 就能建出 B 活动的链接,两条渠道的数据搅在一起。
    await post(ID, { slug: 'someone-elses-campaign', name: 'hijack' })
    expect(calls.ensure).toEqual([{ slug: 'aug-postcard', name: 'Aug Postcard' }])
  })

  it('★ AAPP 失败 → 不写库(宁可让人手填,也不能写个空值进去)', async () => {
    ensureResult.value = { ok: false, error: 'bad key' }
    const res = await post()
    expect(res.status).toBe(502)
    expect(calls.save).toHaveLength(0)
  })

  it('secret 未配置 → 503,并给出能照做的一句话', async () => {
    ensureResult.value = { ok: false, error: 'not_configured' }
    const res = await post()
    const json = await res.json()
    expect(res.status).toBe(503)
    expect(json.error).toContain('AAPP_WEBINTAKE_SECRET')
    expect(calls.save).toHaveLength(0)
  })

  it('slug 不合法 → 400', async () => {
    ensureResult.value = { ok: false, error: 'bad_slug' }
    expect((await post()).status).toBe(400)
  })

  it('ok:true 但没给 token → 当失败处理', async () => {
    ensureResult.value = { ok: true, token: '' }
    const res = await post()
    expect(res.status).toBe(502)
    expect(calls.save).toHaveLength(0)
  })

  it('重复点 → reused 透传,仍然回填(幂等)', async () => {
    ensureResult.value = { ok: true, token: 'CAMPtoken0123456789ab', reused: true }
    const json = await (await post()).json()
    expect(json.data.reused).toBe(true)
    expect(calls.save).toHaveLength(1)
  })
})
