// Two-factor (TOTP) storage helpers for admin accounts. Opt-in per user.
// A pending secret is stored until the user proves they can generate codes,
// only then is totp_enabled flipped on — so 2FA can never lock someone out
// before they've confirmed their authenticator works.

import { query, queryOne } from '@/lib/db'

let ready = false
async function ensureColumns(): Promise<void> {
  if (ready) return
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret varchar(64) DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_pending varchar(64) DEFAULT NULL`).catch(() => {})
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled boolean DEFAULT false`).catch(() => {})
  ready = true
}

export interface TotpStatus { enabled: boolean; secret: string | null; pending: string | null }

export async function getTotp(userId: string): Promise<TotpStatus> {
  await ensureColumns()
  const row = await queryOne<{ totp_secret: string | null; totp_pending: string | null; totp_enabled: boolean }>(
    'SELECT totp_secret, totp_pending, totp_enabled FROM users WHERE id = $1',
    [userId]
  ).catch(() => null)
  return {
    enabled: !!row?.totp_enabled,
    secret: row?.totp_secret ?? null,
    pending: row?.totp_pending ?? null,
  }
}

/** True if this account requires a 2FA code at login. Looks up by email. */
export async function isTotpEnabledForEmail(email: string): Promise<{ enabled: boolean; secret: string | null }> {
  await ensureColumns()
  const row = await queryOne<{ totp_secret: string | null; totp_enabled: boolean }>(
    'SELECT totp_secret, totp_enabled FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  ).catch(() => null)
  return { enabled: !!row?.totp_enabled, secret: row?.totp_secret ?? null }
}

export async function setPendingSecret(userId: string, secret: string): Promise<void> {
  await ensureColumns()
  await query('UPDATE users SET totp_pending = $1 WHERE id = $2', [secret, userId])
}

/** Promote the pending secret to active (called after the user verifies a code). */
export async function activateTotp(userId: string, secret: string): Promise<void> {
  await ensureColumns()
  await query(
    'UPDATE users SET totp_secret = $1, totp_pending = NULL, totp_enabled = true WHERE id = $2',
    [secret, userId]
  )
}

export async function disableTotp(userId: string): Promise<void> {
  await ensureColumns()
  await query('UPDATE users SET totp_secret = NULL, totp_pending = NULL, totp_enabled = false WHERE id = $1', [userId])
}
