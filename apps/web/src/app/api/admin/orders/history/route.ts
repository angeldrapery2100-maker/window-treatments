import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  // Explicit admin guard — defence-in-depth beyond middleware matcher
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const order_id = searchParams.get('order_id')
    if (!order_id) return NextResponse.json({ success: false, error: 'order_id required' }, { status: 400 })

    const history = await query(
      `SELECT * FROM order_history WHERE order_id = $1 ORDER BY created_at ASC`,
      [order_id]
    )
    return NextResponse.json({ success: true, data: history })
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      return NextResponse.json({ success: true, data: [] })
    }
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
