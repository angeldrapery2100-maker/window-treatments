// Server-side chat history for the store assistant (GPT-porting P1-6 + A3).
//
// Persisted per owner so a conversation continues across page loads, tab
// closes, and (for signed-in customers) across devices:
//   signed-in customer → owner key 'u:<userId>'  (follows the account, any device)
//   guest              → owner key 'a:<anonId>'   (same browser, survives
//                        sessionStorage loss; not cross-device by nature)
// Images are never persisted (data URLs are heavy); a photo turn is stored as
// its text, or '[photo]' when it was image-only.
//
// Table is keyed by a generic text owner_key (not the old uuid PK) so both
// identities fit one table. Best-effort throughout — history is a convenience
// and must never break the chat.

import { query, queryOne } from '@/lib/db'

const MAX_MESSAGES = 30

let _ensured = false
async function ensureTable(): Promise<void> {
  if (_ensured) return
  await query(`CREATE TABLE IF NOT EXISTS assistant_chat (
    owner_key text PRIMARY KEY,
    messages jsonb NOT NULL DEFAULT '[]',
    updated_at timestamptz DEFAULT now()
  )`)
  _ensured = true
}

export interface StoredChatMessage {
  role: 'user' | 'assistant'
  content: string
  bookingLink?: string
  suggestions?: string[]
}

export interface ChatOwner {
  userId?: string | null
  anonId?: string | null
}

// Signed-in customers key by user (cross-device); guests key by anon cookie.
function ownerKey(owner: ChatOwner): string | null {
  if (owner.userId) return 'u:' + owner.userId
  if (owner.anonId) return 'a:' + owner.anonId
  return null
}

function sanitize(messages: any[]): StoredChatMessage[] {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: String(m.content || '[photo]').slice(0, 4000),
      ...(typeof m.bookingLink === 'string' ? { bookingLink: m.bookingLink } : {}),
      ...(Array.isArray(m.suggestions)
        ? { suggestions: m.suggestions.filter((s: any) => typeof s === 'string').slice(0, 4) }
        : {}),
    }))
}

export async function loadChatHistory(owner: ChatOwner): Promise<StoredChatMessage[]> {
  const key = ownerKey(owner)
  if (!key) return []
  try {
    await ensureTable()
    const row = await queryOne<{ messages: any }>(`SELECT messages FROM assistant_chat WHERE owner_key = $1`, [key])
    return sanitize(row?.messages || [])
  } catch {
    return []
  }
}

/** Best-effort save — never throws, never blocks the reply. */
export async function saveChatHistory(owner: ChatOwner, messages: any[]): Promise<void> {
  const key = ownerKey(owner)
  if (!key) return
  try {
    await ensureTable()
    await query(
      `INSERT INTO assistant_chat (owner_key, messages, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (owner_key) DO UPDATE SET messages = $2::jsonb, updated_at = now()`,
      [key, JSON.stringify(sanitize(messages))]
    )
  } catch {
    /* history is a convenience — never break the chat over it */
  }
}
