// apps/web/src/lib/settingsHistory.ts
// Records every site_settings change with before/after values and actor email.

import { query } from '@/lib/db'

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS settings_history (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      setting_key  varchar(256) NOT NULL,
      old_value    text,
      new_value    text,
      actor_email  varchar(256),
      changed_at   timestamptz DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_settings_history_key ON settings_history(setting_key, changed_at DESC)`)
}

let ready = false

export async function recordSettingChange(
  key: string,
  oldValue: string | null,
  newValue: string,
  actorEmail?: string | null
): Promise<void> {
  try {
    if (!ready) { await ensureTable(); ready = true }
    await query(
      `INSERT INTO settings_history (setting_key, old_value, new_value, actor_email)
       VALUES ($1, $2, $3, $4)`,
      [key, oldValue ?? null, newValue, actorEmail ?? null]
    )
  } catch (err) {
    console.error('[settingsHistory] write failed:', err)
  }
}
