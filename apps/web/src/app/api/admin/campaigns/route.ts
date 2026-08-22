import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import {
  listCampaignsWithFunnel, createCampaign, setCampaignActive, deleteCampaign,
  normalizeCampaignSlug, setCampaignReferralToken,
} from '@/lib/campaigns'

// Admin campaigns API (P3).
//   GET    → campaigns + attributed funnel counts
//   POST   → create { name, slug?, target_url?, notes?, referral_token? }
//            (slug auto-derived from name)
//   PATCH  → { id, is_active? } enable/disable · { id, referral_token? } set
//            the referral platform token (创建于 AAPP，此处粘贴)
//   DELETE → { id }

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

function autoSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
  const rand = Math.random().toString(36).slice(2, 6)
  return base ? `${base}-${rand}` : `c-${rand}`
}

export async function GET(request: Request) {
  try {
    requireAdmin(request)
    const campaigns = await listCampaignsWithFunnel()
    return NextResponse.json({ success: true, data: { campaigns } })
  } catch (e: any) {
    if (String(e?.message).includes('Admin') || String(e?.message).includes('authenticated')) return bad('Not authorized', 401)
    console.error('[admin/campaigns] GET failed:', e)
    return bad('Could not load campaigns.', 500)
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request)
    let body: any
    try { body = await request.json() } catch { return bad('Invalid request body.') }
    const name = String(body?.name ?? '').trim()
    if (!name) return bad('name is required.')
    const slug = normalizeCampaignSlug(body?.slug) ?? autoSlug(name)
    try {
      const campaign = await createCampaign({
        slug, name,
        targetUrl: body?.target_url,
        notes: body?.notes,
        referralToken: body?.referral_token,
      })
      return NextResponse.json({ success: true, data: { campaign } })
    } catch (e: any) {
      if (String(e?.message).includes('duplicate') || String(e?.code) === '23505') return bad('That short-link slug is already in use.', 409)
      if (String(e?.message) === 'invalid_slug') return bad('Slug may use lowercase letters, digits, - and _ (2-64 chars).')
      throw e
    }
  } catch (e: any) {
    if (String(e?.message).includes('Admin') || String(e?.message).includes('authenticated')) return bad('Not authorized', 401)
    console.error('[admin/campaigns] POST failed:', e)
    return bad('Could not create the campaign.', 500)
  }
}

export async function PATCH(request: Request) {
  try {
    requireAdmin(request)
    let body: any
    try { body = await request.json() } catch { return bad('Invalid request body.') }
    const id = String(body?.id ?? '')
    if (!/^[0-9a-f-]{36}$/i.test(id)) return bad('id is required.')
    // Both fields are optional and independent — a PATCH that only carries a
    // referral token must not silently re-enable a disabled campaign.
    if (Object.prototype.hasOwnProperty.call(body, 'is_active')) {
      await setCampaignActive(id, body.is_active !== false)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'referral_token')) {
      await setCampaignReferralToken(id, body.referral_token)
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (String(e?.message).includes('Admin') || String(e?.message).includes('authenticated')) return bad('Not authorized', 401)
    console.error('[admin/campaigns] PATCH failed:', e)
    return bad('Could not update the campaign.', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    requireAdmin(request)
    let body: any
    try { body = await request.json() } catch { body = null }
    const id = String(body?.id ?? new URL(request.url).searchParams.get('id') ?? '')
    if (!/^[0-9a-f-]{36}$/i.test(id)) return bad('id is required.')
    await deleteCampaign(id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (String(e?.message).includes('Admin') || String(e?.message).includes('authenticated')) return bad('Not authorized', 401)
    console.error('[admin/campaigns] DELETE failed:', e)
    return bad('Could not delete the campaign.', 500)
  }
}

export const dynamic = 'force-dynamic'
