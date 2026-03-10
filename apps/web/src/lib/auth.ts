// Auth utility - JWT based authentication
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { query, queryOne } from './db'

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable must be set in production')
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_fallback_do_not_use_in_prod'
const TOKEN_EXPIRY = '30d'

export interface AuthUser {
  id: string
  email: string
  name: string
  phone: string
  role: 'admin' | 'customer'
}

// Ensure users table with role column
export async function ensureUsersTable() {
  await query(`CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(256) NOT NULL UNIQUE,
    password_hash varchar(256) NOT NULL,
    name varchar(256) NOT NULL DEFAULT '',
    phone varchar(64) DEFAULT '',
    role varchar(32) NOT NULL DEFAULT 'customer',
    is_active boolean NOT NULL DEFAULT true,
    shipping_address jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`)
  // Add role + is_active columns if table already exists without them
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(32) NOT NULL DEFAULT 'customer'`).catch(() => {})
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true`).catch(() => {})
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate JWT
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

// Verify JWT - returns user payload or null
export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    return { id: payload.id, email: payload.email, name: payload.name, phone: '', role: payload.role || 'customer' }
  } catch {
    return null
  }
}

// Get user from request cookie
export function getUserFromRequest(request: Request): AuthUser | null {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/auth_token=([^;]+)/)
  if (!match) return null
  return verifyToken(match[1])
}

// Check if request is from an admin user
export function requireAdmin(request: Request): AuthUser {
  const user = getUserFromRequest(request)
  if (!user) throw new Error('Not authenticated')
  if (user.role !== 'admin') throw new Error('Admin access required')
  return user
}

// Register new user
export async function registerUser(email: string, password: string, name: string, phone?: string) {
  await ensureUsersTable()
  
  const existing = await queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email])
  if (existing) throw new Error('Email already registered')
  
  const hash = await hashPassword(password)
  const user = await queryOne(
    `INSERT INTO users (email, password_hash, name, phone, role) VALUES (LOWER($1), $2, $3, $4, 'customer') RETURNING id, email, name, phone, role`,
    [email, hash, name, phone || '']
  )
  return user as AuthUser
}

// Login user
export async function loginUser(email: string, password: string) {
  await ensureUsersTable()
  
  const user = await queryOne(
    'SELECT id, email, password_hash, name, phone, role, is_active FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  )
  if (!user) throw new Error('Invalid email or password')
  if (user.is_active === false) throw new Error('Account is disabled')
  
  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) throw new Error('Invalid email or password')
  
  return { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role || 'customer' } as AuthUser
}
