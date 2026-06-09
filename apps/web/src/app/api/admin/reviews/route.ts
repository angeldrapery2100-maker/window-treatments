// Admin review moderation: list, filter, approve/reject/delete.

import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { recordAudit } from '@/lib/audit'
import { ensureReviewsTable, REVIEW_STATUSES, type ReviewStatus } from '@/lib/reviews'

export async function GET(request: Request) {
  try { requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureReviewsTable()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let sql = `SELECT r.*, p.name AS product_name
               FROM product_reviews r LEFT JOIN products p ON p.id = r.product_id WHERE 1=1`
    const params: any[] = []
    if (status && status !== 'all' && REVIEW_STATUSES.includes(status as ReviewStatus)) {
      params.push(status); sql += ` AND r.status = $${params.length}`
    }
    sql += ` ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, r.created_at DESC LIMIT 300`

    const reviews = await query(sql, params)
    const pending = await queryOne<{ n: string }>(
      `SELECT COUNT(*) AS n FROM product_reviews WHERE status = 'pending'`
    ).catch(() => ({ n: '0' }))
    return NextResponse.json({ success: true, data: { reviews, pendingCount: Number(pending?.n || 0) } })
  } catch (e) {
    return errorResponse('Could not load reviews.', 500, e)
  }
}

export async function PATCH(request: Request) {
  let adminUser
  try { adminUser = requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureReviewsTable()
    const body = await request.json().catch(() => ({})) as any
    const { id, status } = body
    if (!id || !REVIEW_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'id and a valid status are required' }, { status: 400 })
    }
    const review = await queryOne<any>('SELECT status FROM product_reviews WHERE id = $1', [id])
    if (!review) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })

    await query('UPDATE product_reviews SET status = $1, updated_at = NOW() WHERE id = $2', [status, id])
    await recordAudit({
      action: 'review.moderated', actor_id: adminUser.id, actor_email: adminUser.email,
      target_type: 'product_review', target_id: id,
      before: { status: review.status }, after: { status },
    }).catch(() => {})
    return NextResponse.json({ success: true })
  } catch (e) {
    return errorResponse('Could not update the review.', 500, e)
  }
}

export async function DELETE(request: Request) {
  let adminUser
  try { adminUser = requireAdmin(request) } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await ensureReviewsTable()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    await query('DELETE FROM product_reviews WHERE id = $1', [id])
    await recordAudit({
      action: 'review.moderated', actor_id: adminUser.id, actor_email: adminUser.email,
      target_type: 'product_review', target_id: id, after: { status: 'deleted' },
    }).catch(() => {})
    return NextResponse.json({ success: true })
  } catch (e) {
    return errorResponse('Could not delete the review.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
