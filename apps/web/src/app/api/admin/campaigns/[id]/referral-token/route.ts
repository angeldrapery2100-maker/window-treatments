import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getCampaignById, setCampaignReferralToken } from '@/lib/campaigns'
import { ensureCampaignReferralToken } from '@/lib/referral'

// POST /api/admin/campaigns/<id>/referral-token  (P2 §4.2)
//
// 「Generate」按钮的后端。以前 admin 得先去 AAPP 建一条 campaign 推广链接、
// 复制 22 位 token、再回来粘贴 —— 中间任何一步抄错,/c/<slug> 就照常跳转、
// 照常记访问,只是不种 ad_ref,归因静静地丢了,没有任何地方会报错。
//
// slug 用库里那条记录自己的,不认请求体 —— 否则调用方可以拿 A 活动的 id
// 去建 B 活动的链接,把两条渠道的数据搅在一起。
// 手填仍然保留(PATCH /api/admin/campaigns 那条路),这里只是省掉抄写。

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

/** AAPP 那边的错误码 → 给人看的一句话。 */
const HINT: Record<string, string> = {
  not_configured: 'AAPP_WEBINTAKE_SECRET 未配置 —— 无法向 AAPP 建链接，请先手填 token。',
  bad_slug: '这个 campaign 的 slug 不符合规则，AAPP 建不出链接。',
  bad_key: 'AAPP 拒绝了这次请求（x-ad-key 不匹配）。',
  bad_token: 'AAPP 返回的 token 形状不对，没有写入。',
  timeout: 'AAPP 没有及时响应，请稍后再试。',
  request_failed: '连不上 AAPP，请稍后再试。',
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request)
  } catch {
    return bad('Not authorized', 401)
  }
  try {
    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) return bad('id is required.')
    const campaign = await getCampaignById(id)
    if (!campaign) return bad('Campaign not found.', 404)

    const r = await ensureCampaignReferralToken(campaign.slug, campaign.name)
    if (!r.ok || !r.token) {
      const code = String(r.error || 'request_failed')
      return NextResponse.json(
        { success: false, error: HINT[code] || `AAPP: ${code}`, code },
        { status: code === 'not_configured' ? 503 : code === 'bad_slug' ? 400 : 502 }
      )
    }
    await setCampaignReferralToken(id, r.token)
    return NextResponse.json({
      success: true,
      data: { referral_token: r.token, url: r.url || '', reused: !!r.reused },
    })
  } catch (e: any) {
    console.error('[admin/campaigns/referral-token] POST failed:', e)
    return bad('Could not generate a referral token.', 500)
  }
}

export const dynamic = 'force-dynamic'
