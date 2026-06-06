import { NextResponse } from 'next/server'
import { registerUser, generateToken } from '@/lib/auth'
import { errorResponse } from '@/lib/apiError'

export async function POST(request: Request) {
  try {
    const { email, password, name, phone } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const user = await registerUser(email, password, name, phone)
    const token = generateToken(user)

    const res = NextResponse.json({ success: true, data: { user } })
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })
    return res
  } catch (e: any) {
    if (e?.message?.includes('already registered')) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 })
    }
    return errorResponse('Registration failed. Please try again.', 500, e)
  }
}

export const dynamic = 'force-dynamic'
