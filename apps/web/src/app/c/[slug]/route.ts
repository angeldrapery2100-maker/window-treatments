import { NextResponse } from 'next/server'
import {
  CAMPAIGN_COOKIE, CAMPAIGN_COOKIE_MAX_AGE, getCampaignBySlug,
} from '@/lib/campaigns'
import {
  ANON_COOKIE, ANON_COOKIE_MAX_AGE, getAnonIdFromRequest, newAnonId, logLeadEvent,
} from '@/lib/homeProjects'

// Campaign short link (P3): /c/<slug> — printed on flyers, EDDM postcards and
// QR codes. Sets the attribution cookie (90 days), logs a campaign_visit lead
// event, and redirects to the campaign's target page. Unknown or inactive
// slugs still land somewhere sensible (/store) — a misprinted flyer should
// never show a customer an error page.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const url = new URL(request.url)

  let target = '/store'
  let validSlug: string | null = null
  try {
    const campaign = await getCampaignBySlug(slug)
    if (campaign && campaign.is_active) {
      validSlug = campaign.slug
      // createCampaign only stores same-site relative paths, but re-check here.
      if (campaign.target_url.startsWith('/') && !campaign.target_url.startsWith('//')) {
        target = campaign.target_url
      }
    }
  } catch {
    /* DB hiccup → plain redirect, no tracking */
  }

  const cookieAnonId = getAnonIdFromRequest(request)
  const anonId = cookieAnonId ?? newAnonId()

  if (validSlug) {
    logLeadEvent({ anonId, type: 'campaign_visit', campaignId: validSlug, meta: { ua: (request.headers.get('user-agent') || '').slice(0, 200) } })
  }

  const res = NextResponse.redirect(new URL(target, url.origin), 302)
  if (validSlug) {
    res.cookies.set(CAMPAIGN_COOKIE, validSlug, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: CAMPAIGN_COOKIE_MAX_AGE,
      path: '/',
    })
  }
  if (!cookieAnonId) {
    res.cookies.set(ANON_COOKIE, anonId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ANON_COOKIE_MAX_AGE,
      path: '/',
    })
  }
  return res
}

export const dynamic = 'force-dynamic'
