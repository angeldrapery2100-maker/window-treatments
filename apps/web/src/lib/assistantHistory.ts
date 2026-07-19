// Server-side chat history for LOGGED-IN customers (GPT-porting P1-6).
//
// Guests keep the existing sessionStorage-only behavior. When a customer is
// signed in, the assistant route persists the capped transcript after every
// reply, and the widget loads it on mount — so a conversation continues
// across devices and days, like a ChatGPT thread. Images are never persisted
// (data URLs are heavy); a photo turn is stored with its text (or '[photo]').

import { query, queryOne } from '@/lib/db'

const MAX_MESSAGES = 30

let _ensured = false
async function ensureTable(): Promise<void> {
  if (_ensured) return
  await query(`CREATE TABLE IF NOT EXISTS assistant_chat_history (
    user_id uuid PRIMARY KEY,
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

export async function loadChatHistory(userId: string): Promise<StoredChatMessage[]> {
  await ensureTable()
  const row = await queryOne<{ messages: any }>(`SELECT messages FROM assistant_chat_history WHERE user_id = $1`, [userId])
  return sanitize(row?.messages || [])
}

/** Best-effort save — never throws, never blocks the reply. */
export async function saveChatHistory(userId: string, messages: any[]): Promise<void> {
  try {
    await ensureTable()
    await query(
      `INSERT INTO assistant_chat_history (user_id, messages, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (user_id) DO UPDATE SET messages = $2::jsonb, updated_at = now()`,
      [userId, JSON.stringify(sanitize(messages))]
    )
  } catch {
    /* history is a convenience — never break the chat over it */
  }
}
