import { NextResponse } from 'next/server'
import { submitWebChatLog, type WebChatLogInput } from '@/lib/aappWebChat'

const SESSION_ID_RE = /^[A-Za-z0-9_-]{8,64}$/

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : ''
  if (!SESSION_ID_RE.test(sessionId)) {
    return NextResponse.json({ ok: false, error: 'invalid_session_id' }, { status: 400 })
  }

  const messages: WebChatLogInput['messages'] = (Array.isArray(body?.messages) ? body.messages : [])
    .slice(0, 200)
    .map((message: any) => ({
      role: message?.role === 'user' ? 'user' as const : 'bot' as const,
      text: String(message?.text || '').slice(0, 600),
      ...(typeof message?.at === 'string' ? { at: message.at.slice(0, 40) } : {}),
    }))
    .filter((message: { text: string }) => message.text)

  const result = await submitWebChatLog({
    sessionId,
    messages,
    page: String(body?.page || '').slice(0, 300),
    lang: String(body?.lang || '').slice(0, 10),
    name: String(body?.name || '').slice(0, 120),
    phone: String(body?.phone || '').slice(0, 40),
    converted: body?.converted === true,
    leadId: String(body?.leadId || '').slice(0, 80),
    ended: body?.ended === true,
  })

  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
