import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { queryOne, query } from '@/lib/db'
import { errorResponse } from '@/lib/apiError'

export async function GET(request: Request) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const user = await queryOne(
      'SELECT id, email, name, phone, role, is_active, shipping_address, created_at FROM users WHERE id = $1',
      [authUser.id]
    )
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { user } })
  } catch (e) {
    return errorResponse('Could not load profile.', 500, e)
  }
}

// PATCH: update profile
export async function PATCH(request: Request) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, shipping_address } = body

    const fields: string[] = []
    const values: any[] = []
    let idx = 1

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name) }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone) }
    if (shipping_address !== undefined) { fields.push(`shipping_address = $${idx++}`); values.push(JSON.stringify(shipping_address)) }

    if (fields.length === 0) return NextResponse.json({ success: true })

    fields.push(`updated_at = NOW()`)
    values.push(authUser.id)

    await queryOne(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`, values)

    return NextResponse.json({ success: true })
  } catch (e) {
    return errorResponse('Could not update profile.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
