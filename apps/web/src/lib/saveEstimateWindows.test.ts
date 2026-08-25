import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/* save_estimate 的窗户来源(P4-3b)。
   盯两件事:① 服务端存着的量窗记录优先于模型复述的;
            ② 游客的量窗表可能是上一个访客的 —— 这句话必须回给模型。 */

vi.mock('@/lib/db', () => ({ query: vi.fn(async () => []), queryOne: vi.fn(async () => null) }))
vi.mock('@/lib/leadScoring', () => ({
  getLeadScoreForOwner: vi.fn(async () => ({ score: 0, tier: 'cool', eventCount: 0 })),
}))
vi.mock('@/lib/homeProjects', () => ({
  getActiveProject: vi.fn(async () => null),
  getOrCreateActiveProject: vi.fn(async () => null),
  mergeAnonProjectIntoUser: vi.fn(async () => {}),
  listItems: vi.fn(async () => []),
  projectSummary: vi.fn(() => ({ itemCount: 0, rooms: [], pricedSubtotal: 0, unpricedCount: 0 })),
  upsertItem: vi.fn(async () => null),
  removeItem: vi.fn(async () => {}),
  logLeadEvent: vi.fn(() => {}),
}))

const SAVED = [
  { id: 'saved-1', label: 'Living room', kind: 'window', product: 'shades',
    config: { mount: 'inside_z' }, dims: { widthIn: 96, heightIn: 84 }, result: {} },
  { id: 'saved-2', label: 'No dims', kind: 'window', product: 'shades',
    config: {}, dims: {}, result: {} },
]
vi.mock('@/lib/windowMeasurements', () => ({
  listMeasuredWindows: vi.fn(async () => SAVED),
}))

const { executeAssistantTool } = await import('./assistantTools')

let sent: any[] = []
function stubBackend() {
  sent = []
  vi.stubGlobal('fetch', async (_u: string, init: any) => {
    sent.push(JSON.parse(init.body))
    return { ok: true, status: 200, json: async () => ({ ok: true, estimate_no: 'AE-2608-6AEJ', access_code: '481502' }), text: async () => '' } as any
  })
}

beforeEach(() => {
  process.env.AAPP_WEBINTAKE_SECRET = 'test-secret'
  stubBackend()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

const save = (input: Record<string, unknown>, userId: string | null = null) =>
  executeAssistantTool('save_estimate', input, userId, 'anon-1', null, [], null) as Promise<any>

describe('save_estimate 的窗户来源', () => {
  it('不开开关时,只用模型给的(今天的行为不变)', async () => {
    await save({ windows: [{ id: 'w1', label: 'Den', width_in: 40, height_in: 60 }] })
    expect(sent[0].windows).toHaveLength(1)
    expect(sent[0].windows[0].id).toBe('w1')
  })

  it('★ 开了开关 → 服务端的量窗记录直接进单,模型不用复述尺寸', async () => {
    const r = await save({ use_saved_windows: true })
    expect(sent[0].windows).toHaveLength(1)
    expect(sent[0].windows[0]).toMatchObject({ id: 'saved-1', width_in: 96, height_in: 84, mount: 'inside' })
    expect(r.saved_windows).toContain('1 window(s)')
  })

  it('★ id 撞车时以存下来的那份为准 —— 那是真量出来的,复述的不是', async () => {
    await save({
      use_saved_windows: true,
      windows: [
        { id: 'saved-1', label: 'Living room', width_in: 12, height_in: 12 },   // 模型记错了
        { id: 'chat-only', label: 'Porch', width_in: 30, height_in: 40 },       // 聊天里现报的,没存过
      ],
    })
    const byId = Object.fromEntries(sent[0].windows.map((w: any) => [w.id, w]))
    expect(byId['saved-1'].width_in).toBe(96)          // 不是 12
    expect(byId['chat-only'].width_in).toBe(30)        // 模型给的这扇留着
    expect(sent[0].windows).toHaveLength(2)
  })

  it('★ 没存宽高的窗户要报出来 —— 少一扇窗,客户收到的报价就是错的', async () => {
    const r = await save({ use_saved_windows: true })
    expect(r.windows_skipped).toEqual(['No dims (no width/height saved)'])
  })

  it('★★ 游客:量窗表存在这个浏览器上,可能是上一个访客的 —— 必须把话说回去', async () => {
    const r = await save({ use_saved_windows: true }, null)
    expect(r.ownership_caution).toMatch(/THIS BROWSER|previous visitor/)
  })

  it('登录用户没有这句提醒(表就是他自己的)', async () => {
    const r = await save({ use_saved_windows: true }, 'user-9')
    expect(r.ownership_caution).toBeUndefined()
    expect(r.saved_windows).toBeTruthy()
  })

  it('两个号都要念出来这句一直在', async () => {
    const r = await save({ use_saved_windows: true })
    expect(r.must_say).toContain('BOTH')
    expect(r.estimate_no).toBe('AE-2608-6AEJ')
    expect(r.access_code).toBe('481502')
  })
})
