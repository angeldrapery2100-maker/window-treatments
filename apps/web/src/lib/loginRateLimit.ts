// apps/web/src/lib/loginRateLimit.ts
// Tracks failed login attempts in the DB; blocks after 5 failures in 15 minutes.

import { query, queryOne } from '@/lib/db'

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 15
const LOCKOUT_MINUTES = 30

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      identifier varchar(256) NOT NULL,  -- email or IP
      ip         varchar(64),
      success    boolean DEFAULT false,
      created_at timestamptz DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier, created_at DESC)`)
}

let ready = false

async function init() {
  if (!ready) { await ensureTable(); ready = true }
}

/** Returns true if the identifier is currently rate-limited */
export async function isRateLimited(identifier: string): Promise<boolean> {
  await init()
  const cutoff = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()
  const row = await queryOne<{ cnt: string }>(
    `SELECT COUNT(*) AS cnt FROM login_attempts
     WHERE identifier = $1 AND success = false AND created_at > $2`,
    [identifier, cutoff]
  )
  return parseInt(row?.cnt ?? '0', 10) >= MAX_ATTEMPTS
}

/** Call on every login attempt (success or failure) */
export async function recordAttempt(identifier: string, ip: string | null, success: boolean) {
  await init()
  await query(
    `INSERT INTO login_attempts (identifier, ip, success) VALUES ($1, $2, $3)`,
    [identifier, ip ?? null, success]
  )
  // Clean up old records to keep table small
  if (Math.random() < 0.05) {
    const oldCutoff = new Date(Date.now() - LOCKOUT_MINUTES * 2 * 60 * 1000).toISOString()
    await query(`DELETE FROM login_attempts WHERE created_at < $1`, [oldCutoff])
  }
}

/** How many minutes until the lockout expires (0 if not locked) */
export async function lockoutRemainingMinutes(identifier: string): Promise<number> {
  await init()
  const cutoff = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()
  const row = await queryOne<{ oldest: string; cnt: string }>(
    `SELECT COUNT(*) AS cnt, MIN(created_at) AS oldest
     FROM login_attempts
     WHERE identifier = $1 AND success = false AND created_at > $2`,
    [identifier, cutoff]
  )
  if (!row || parseInt(row.cnt, 10) < MAX_ATTEMPTS) return 0
  const oldestMs = new Date(row.oldest).getTime()
  const expiresMs = oldestMs + WINDOW_MINUTES * 60 * 1000
  const remaining = Math.ceil((expiresMs - Date.now()) / 60000)
  return Math.max(0, remaining)
}
