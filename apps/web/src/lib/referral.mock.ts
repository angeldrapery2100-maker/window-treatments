// AAPP 线格式 fixture 的本地包装(AAPP_REFERRAL_MOCK=1 时用)。
//
// ★ 这里存的是 **AAPP 真正发出来的 payload**,不是本仓库的 PortalView。
//   来源:AAPP 的 functions/referral-wire-fixtures.json,由那边的
//   scripts/referral-wire-fixtures.js 用 referral-core 的真实代码生成,并接进
//   AAPP 的 npm test —— 那边契约一变,那边先红。
//
//   为什么不再手写内部形状:mock 走内部形状就等于绕开 toPublic / toPortal 两个
//   翻译层,而 2026-08-22 那五处字段名对不上恰恰全在翻译层里 —— mock 测试一条
//   都没发现,页面在线上安静地渲染成空白和 0。现在 mock 喂线格式,每次都过翻译层。
//
//   同步方式见 fixture 里的 _note 字段。NEVER set AAPP_REFERRAL_MOCK in production.

import fixtures from '@/lib/referral-wire-fixtures.json'

export const MOCK_CUSTOMER_TOKEN = fixtures.tokens.customer
export const MOCK_AGENT_TOKEN    = fixtures.tokens.agent
export const MOCK_CAMPAIGN_TOKEN = fixtures.tokens.campaign

/** referralLookup 的原始返回,按 token 索引。 */
export const MOCK_LOOKUP_WIRE: Record<string, unknown> = {
  [MOCK_CUSTOMER_TOKEN]: fixtures.lookup.customer,
  [MOCK_AGENT_TOKEN]:    fixtures.lookup.agent,
  [MOCK_CAMPAIGN_TOKEN]: fixtures.lookup.campaign,
}

/** referralPortal 的原始返回,按 token 索引。campaign 类没有奖励页。 */
export const MOCK_PORTAL_WIRE: Record<string, unknown> = {
  [MOCK_CUSTOMER_TOKEN]: fixtures.portal.customer,
  [MOCK_AGENT_TOKEN]:    fixtures.portal.agent,
  [MOCK_CAMPAIGN_TOKEN]: fixtures.portal.campaign,
}

export { fixtures as MOCK_WIRE_FIXTURES }
