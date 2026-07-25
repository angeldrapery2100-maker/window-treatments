import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

// AI 客服使用与转化分析（admin）。
// 数据来源：
//   lead_events —— assistant_opened(打开,一次/会话)、assistant_chat(每轮)、
//     inquiry_submitted(聊天建档,via=assistant)、project_item_added(聊天加项目)
//   consultation_requests —— 直接表单咨询
//   assistant_chat —— 对话全文(owner_key + messages jsonb)
// GET            → { summary, conversations[] }
// GET ?conversation=<owner_key> → { conversation: { messages[] } }

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export async function GET(request: Request) {
  try {
    requireAdmin(request)
    const url = new URL(request.url)

    // ── Single conversation transcript ──────────────────────────────────────
    const conv = url.searchParams.get('conversation')
    if (conv) {
      const row = await queryOne<{ owner_key: string; messages: unknown; updated_at: string }>(
        `SELECT owner_key, messages, updated_at FROM assistant_chat WHERE owner_key = $1`,
        [conv]
      ).catch(() => null)
      const messages = row && Array.isArray(row.messages) ? row.messages : []
      return NextResponse.json({
        success: true,
        data: {
          conversation: row
            ? { ownerKey: row.owner_key, updatedAt: row.updated_at, messages }
            : null,
        },
      })
    }

    // ── Summary + recent conversations ──────────────────────────────────────
    const days = Math.min(365, Math.max(1, num(url.searchParams.get('days')) || 30))
    const window = `${days} days`

    const summary = await queryOne<Record<string, string>>(
      `SELECT
         COUNT(DISTINCT COALESCE(user_id::text, anon_id)) FILTER (WHERE type = 'assistant_opened')  AS opened,
         COUNT(DISTINCT COALESCE(user_id::text, anon_id)) FILTER (WHERE type = 'assistant_chat')     AS chat_users,
         COUNT(*)                                          FILTER (WHERE type = 'assistant_chat')     AS chat_turns,
         COUNT(*)                                          FILTER (WHERE type = 'inquiry_submitted')  AS chat_inquiries,
         COUNT(DISTINCT COALESCE(user_id::text, anon_id)) FILTER (WHERE type = 'project_item_added') AS chat_projects
       FROM lead_events
       WHERE created_at >= now() - $1::interval`,
      [window]
    ).catch(() => null)

    const forms = await queryOne<{ form_consults: string }>(
      `SELECT COUNT(*) AS form_consults FROM consultation_requests WHERE created_at >= now() - $1::interval`,
      [window]
    ).catch(() => null)

    const conversations = await query<{
      owner_key: string
      updated_at: string
      msg_count: string
      first_msg: string | null
    }>(
      `SELECT owner_key, updated_at,
              jsonb_array_length(messages) AS msg_count,
              (messages -> 0 ->> 'content') AS first_msg
       FROM assistant_chat
       WHERE jsonb_array_length(messages) > 0
       ORDER BY updated_at DESC
       LIMIT 60`
    ).catch(() => [])

    const opened = num(summary?.opened)
    const chatUsers = num(summary?.chat_users)
    const chatInquiries = num(summary?.chat_inquiries)
    const formConsults = num(forms?.form_consults)
    const totalLeads = chatInquiries + formConsults

    return NextResponse.json({
      success: true,
      data: {
        days,
        summary: {
          opened,
          chatUsers,
          chatTurns: num(summary?.chat_turns),
          chatInquiries,
          chatProjects: num(summary?.chat_projects),
          formConsults,
          openToChatPct: opened ? Math.round((chatUsers / opened) * 100) : null,
          chatToLeadPct: chatUsers ? Math.round((chatInquiries / chatUsers) * 100) : null,
          chatShareOfLeadsPct: totalLeads ? Math.round((chatInquiries / totalLeads) * 100) : null,
        },
        conversations: conversations.map((c) => ({
          ownerKey: c.owner_key,
          updatedAt: c.updated_at,
          msgCount: num(c.msg_count),
          preview: (c.first_msg || '').replace(/\s+/g, ' ').slice(0, 90),
          kind: String(c.owner_key || '').startsWith('u:') ? 'signed-in' : 'guest',
        })),
      },
    })
  } catch (e: unknown) {
    const msg = String((e as { message?: string })?.message || '')
    if (msg.includes('Admin') || msg.includes('authenticated')) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 })
    }
    console.error('[admin/assistant-analytics] error:', e)
    return NextResponse.json({ success: false, error: 'Failed to load assistant analytics' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
