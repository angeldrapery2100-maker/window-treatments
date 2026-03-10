// apps/web/src/lib/contentVersions.ts
// Snapshots site_content rows before each update so history can be browsed/restored.

import { query } from '@/lib/db'

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS content_versions (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      content_id   uuid NOT NULL,
      page         varchar(64)  NOT NULL,
      section      varchar(128) NOT NULL,
      field_key    varchar(128) NOT NULL,
      field_type   varchar(32),
      content      text,
      image_url    text,
      metadata     jsonb,
      actor_email  varchar(256),
      snapshot_at  timestamptz DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON content_versions(content_id, snapshot_at DESC)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_content_versions_page ON content_versions(page, section)`)
}

let ready = false

export async function snapshotContent(row: {
  content_id: string
  page: string
  section: string
  field_key: string
  field_type?: string | null
  content?: string | null
  image_url?: string | null
  metadata?: Record<string, unknown> | null
  actor_email?: string | null
}): Promise<void> {
  try {
    if (!ready) { await ensureTable(); ready = true }
    await query(
      `INSERT INTO content_versions
         (content_id, page, section, field_key, field_type, content, image_url, metadata, actor_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        row.content_id,
        row.page,
        row.section,
        row.field_key,
        row.field_type ?? null,
        row.content    ?? null,
        row.image_url  ?? null,
        row.metadata ? JSON.stringify(row.metadata) : null,
        row.actor_email ?? null,
      ]
    )
    // Keep max 20 versions per field
    await query(
      `DELETE FROM content_versions
       WHERE content_id = $1
         AND id NOT IN (
           SELECT id FROM content_versions WHERE content_id = $1
           ORDER BY snapshot_at DESC LIMIT 20
         )`,
      [row.content_id]
    )
  } catch (err) {
    console.error('[contentVersions] write failed:', err)
  }
}
