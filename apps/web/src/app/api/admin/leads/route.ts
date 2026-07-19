import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { listLeads } from '@/lib/leadScoring'

// Admin leads list (C1): ranks recent visitors by computed engagement score
// (hot/warm/cool) so the salesperson sees who's worth following up.
export async function GET(request: Request) {
  try {
    requireAdmin(request)
    const leads = await listLeads(150)
    return NextResponse.json({ success: true, data: { leads } })
  } catch (e: any) {
    const msg = String(e?.message || '')
    if (msg.includes('Admin') || msg.includes('authenticated')) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 })
    }
    console.error('[admin/leads] error:', e)
    return NextResponse.json({ success: false, error: 'Failed to load leads' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
