// Local fixtures for the referral platform (AAPP_REFERRAL_MOCK=1).
//
// P0 (the AAPP Cloud Functions: referralLookup / referralVisit /
// referralPortal / referralPortalPrefs / partnerW9Upload) may not be deployed
// yet. With AAPP_REFERRAL_MOCK=1 the website serves these fixtures instead, so
// /r, /rewards and /partner can be built, styled and black-box tested in the
// sandbox without touching the real backend. NEVER set this in production.

import type { PortalView, ReferralPublic } from '@/lib/referral'

export const MOCK_CUSTOMER_TOKEN = 'mock-customer-0000000000'
export const MOCK_AGENT_TOKEN = 'mock-agent-00000000000'
export const MOCK_CAMPAIGN_TOKEN = 'mock-campaign-000000000'

/** Five-level customer ladder — mirrors AAPP `app-loyalty.js`. */
export const MOCK_TIERS = [
  { key: 'member',   label: 'Member',   labelCn: '会员',   min: 0, discountPct: 3,  color: '#8A94A6' },
  { key: 'silver',   label: 'Silver',   labelCn: '白银',   min: 1, discountPct: 5,  color: '#B9C2CC' },
  { key: 'gold',     label: 'Gold',     labelCn: '黄金',   min: 3, discountPct: 8,  color: '#D4A24C' },
  { key: 'platinum', label: 'Platinum', labelCn: '铂金',   min: 6, discountPct: 10, color: '#6E7A8A' },
  { key: 'diamond',  label: 'Diamond',  labelCn: '钻石',   min: 10, discountPct: 12, color: '#4DB6E8' },
]

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://angel-drapery.com').replace(/\/$/, '')

export const MOCK_LOOKUP: Record<string, ReferralPublic> = {
  [MOCK_CUSTOMER_TOKEN]: {
    referrerType: 'customer',
    displayName: 'Jenny L.',
    discountPct: 5,
    tierLabel: 'Silver',
    tierLabelCn: '白银',
    referralCode: 'AD-JENNY5',
    active: true,
  },
  [MOCK_AGENT_TOKEN]: {
    referrerType: 'agent',
    displayName: 'Maple Realty',
    discountPct: null,
    referralCode: 'AP-MAPLE',
    active: true,
  },
  [MOCK_CAMPAIGN_TOKEN]: {
    referrerType: 'campaign',
    displayName: 'Spring Postcard',
    discountPct: null,
    referralCode: null,
    active: true,
  },
}

export const MOCK_PORTAL: Record<string, PortalView> = {
  [MOCK_CUSTOMER_TOKEN]: {
    token: MOCK_CUSTOMER_TOKEN,
    type: 'customer',
    displayName: 'Jenny L.',
    lang: 'en',
    referralCode: 'AD-JENNY5',
    shareUrl: `${SITE}/r/${MOCK_CUSTOMER_TOKEN}`,
    discountPct: 5,
    freeVisitCredits: 1,
    qualifiedReferrals: 1,
    tierKey: 'silver',
    tierLabel: 'Silver',
    tierLabelCn: '白银',
    nextTier: { key: 'gold', label: 'Gold', labelCn: '黄金', min: 3, discountPct: 8 },
    tiers: MOCK_TIERS,
    smsOptIn: true,
    smsOptedOut: false,
    active: true,
  },
  [MOCK_AGENT_TOKEN]: {
    token: MOCK_AGENT_TOKEN,
    type: 'agent',
    displayName: 'Maple Realty',
    lang: 'en',
    referralCode: 'AP-MAPLE',
    shareUrl: `${SITE}/r/${MOCK_AGENT_TOKEN}`,
    discountPct: null,
    tiers: [],
    stats: { referredLeads: 7, signed: 2 },
    w9: { uploaded: false, verified: false },
    smsOptIn: false,
    smsOptedOut: false,
    active: true,
  },
}
