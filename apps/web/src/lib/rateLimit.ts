// Generic Postgres-backed rate limiter, keyed by (bucket, key).
// Reuses the same DB pool as the rest of the app. Suitable for low/medium
// traffic public endpoints (consultation form, OTP verification, etc.).
// For very high throughput, move this to Redis/Upstash.

import { query, queryOne } from '@/lib/db'

let ready = false
async function init() {
  if (ready) return
  await query(`
    CREATE TABLE IF NOT EXISTS rate_limit_events (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket     varchar(64)  NOT NULL,
      key        varchar(256) NOT NULL,
      created_at timestamptz  DEFAULT now()
    )
  `)
  await query(
    `CREATE INDEX IF NOT EXISTS idx_rate_limit_bucket_key
       ON rate_limit_events(bucket, key, created_at DESC)`
  )
  ready = true
}

export interface RateLimitOptions {
  /** Max number of events allowed within the window. */
  max: number
  /** Window length in seconds. */
  windowSeconds: number
}

/**
 * Records an event and reports whether the caller is within the limit.
 * Returns { allowed:false } once the count in the window reaches `max`.
 * Fails OPEN on DB errors (never blocks legitimate traffic on infra failure).
 */
export async function rateLimit(
  bucket: string,
  key: string,
  { max, windowSeconds }: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    await init()
    const cutoff = new Date(Date.now() - windowSeconds * 1000).toISOString()
    const row = await queryOne<{ cnt: string }>(
      `SELECT COUNT(*) AS cnt FROM rate_limit_events
        WHERE bucket = $1 AND key = $2 AND created_at > $3`,
      [bucket, key, cutoff]
    )
    const count = parseInt(row?.cnt ?? '0', 10)
    if (count >= max) return { allowed: false, remaining: 0 }

    await query(
      `INSERT INTO rate_limit_events (bucket, key) VALUES ($1, $2)`,
      [bucket, key]
    )

    // Opportunistic cleanup of old rows.
    if (Math.random() < 0.02) {
      const old = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      await query(`DELETE FROM rate_limit_events WHERE created_at < $1`, [old]).catch(() => {})
    }

    return { allowed: true, remaining: max - count - 1 }
  } catch (err) {
    console.error('[rateLimit] failure (failing open):', err)
    return { allowed: true, remaining: max }
  }
}

/** Best-effort client IP from common proxy headers. */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}
