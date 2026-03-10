// apps/web/src/lib/tokenBlocklist.ts
// Stores revoked JWT IDs so force-logout works even before token expiry.

import { query, queryOne } from '@/lib/db'

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS token_blocklist (
      jti        varchar(256) PRIMARY KEY,
      user_id    uuid,
      revoked_at timestamptz DEFAULT now(),
      expires_at timestamptz NOT NULL
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_token_blocklist_expires ON token_blocklist(expires_at)`)
}

let ready = false

export async function revokeToken(jti: string, userId: string, expiresAt: Date): Promise<void> {
  if (!ready) { await ensureTable(); ready = true }
  await query(
    `INSERT INTO token_blocklist (jti, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (jti) DO NOTHING`,
    [jti, userId, expiresAt.toISOString()]
  )
  // Periodic cleanup of expired entries
  if (Math.random() < 0.05) {
    await query(`DELETE FROM token_blocklist WHERE expires_at < now()`)
  }
}

export async function isTokenRevoked(jti: string): Promise<boolean> {
  if (!ready) { await ensureTable(); ready = true }
  const row = await queryOne<{ jti: string }>(
    `SELECT jti FROM token_blocklist WHERE jti = $1 AND expires_at > now()`,
    [jti]
  )
  return !!row
}
