import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/apiError'
import { query, queryOne } from '@/lib/db'
import { requireAdmin, hashPassword, ensureUsersTable } from '@/lib/auth'

// GET: list admin users
export async function GET(request: Request) {
  try {
    requireAdmin(request)
    await ensureUsersTable()

    const users = await query(
      `SELECT id, email, name, phone, role, is_active, created_at, updated_at
       FROM users WHERE role = 'admin'
       ORDER BY created_at ASC`
    )
    return NextResponse.json({ success: true, data: users })
  } catch (e: any) {
    const status = e.message?.includes('Not authenticated') ? 401 : e.message?.includes('Admin') ? 403 : 500
    return errorResponse('Could not load accounts.', status, e)
  }
}

// POST: create new admin user
export async function POST(request: Request) {
  try {
    requireAdmin(request)
    await ensureUsersTable()

    const { email, password, name, phone } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email])
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }

    const hash = await hashPassword(password)
    const user = await queryOne(
      `INSERT INTO users (email, password_hash, name, phone, role) 
       VALUES (LOWER($1), $2, $3, $4, 'admin') 
       RETURNING id, email, name, phone, role, is_active, created_at`,
      [email, hash, name, phone || '']
    )

    return NextResponse.json({ success: true, data: user })
  } catch (e: any) {
    const status = e.message?.includes('Not authenticated') ? 401 : e.message?.includes('Admin') ? 403 : 500
    return errorResponse('Could not create the account. Please try again.', status, e)
  }
}

// PATCH: update admin user (edit profile, reset password, toggle active)
export async function PATCH(request: Request) {
  try {
    const currentUser = requireAdmin(request)
    await ensureUsersTable()

    const { id, name, phone, email, password, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    // Verify target is an admin user
    const target = await queryOne('SELECT id, role, email FROM users WHERE id = $1', [id])
    if (!target || target.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 })
    }

    // Prevent disabling yourself
    if (is_active === false && target.id === currentUser.id) {
      return NextResponse.json({ success: false, error: 'Cannot disable your own account' }, { status: 400 })
    }

    const fields: string[] = []
    const values: any[] = []
    let idx = 1

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name) }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone) }
    if (email !== undefined) {
      // Check email not taken by another user
      const dup = await queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2', [email, id])
      if (dup) return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 })
      fields.push(`email = LOWER($${idx++})`); values.push(email)
    }
    if (password !== undefined && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 })
      }
      const hash = await hashPassword(password)
      fields.push(`password_hash = $${idx++}`); values.push(hash)
    }
    if (is_active !== undefined) {
      fields.push(`is_active = $${idx++}`); values.push(is_active)
    }

    if (fields.length === 0) return NextResponse.json({ success: true })

    fields.push(`updated_at = NOW()`)
    values.push(id)

    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`, values)

    const updated = await queryOne(
      'SELECT id, email, name, phone, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (e: any) {
    const status = e.message?.includes('Not authenticated') ? 401 : e.message?.includes('Admin') ? 403 : 500
    return errorResponse('Could not save changes. Please try again.', status, e)
  }
}

// DELETE: remove admin user
export async function DELETE(request: Request) {
  try {
    const currentUser = requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })

    // Cannot delete yourself
    if (id === currentUser.id) {
      return NextResponse.json({ success: false, error: 'Cannot delete your own account' }, { status: 400 })
    }

    const target = await queryOne('SELECT id, role FROM users WHERE id = $1', [id])
    if (!target || target.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 })
    }

    // Don't actually delete — just revoke admin role and disable
    await query('UPDATE users SET role = $1, is_active = false, updated_at = NOW() WHERE id = $2', ['customer', id])

    return NextResponse.json({ success: true })
  } catch (e: any) {
    const status = e.message?.includes('Not authenticated') ? 401 : e.message?.includes('Admin') ? 403 : 500
    return errorResponse('Could not remove the account. Please try again.', status, e)
  }
}

export const dynamic = 'force-dynamic'
