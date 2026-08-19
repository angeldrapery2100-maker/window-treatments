const WEB_CHAT_LOG_URL =
  process.env.AAPP_WEBCHAT_LOG_URL ||
  'https://us-central1-angel-drapery.cloudfunctions.net/webChatLog'

export interface WebChatLogInput {
  sessionId: string
  messages: Array<{ role: 'user' | 'bot'; text: string; at?: string }>
  page?: string
  lang?: string
  name?: string
  phone?: string
  converted?: boolean
  leadId?: string
  ended?: boolean
}

export async function submitWebChatLog(input: WebChatLogInput): Promise<{ ok: boolean; error?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const secret = process.env.AAPP_WEBINTAKE_SECRET
  if (secret) headers['x-ad-key'] = secret

  try {
    const res = await fetch(WEB_CHAT_LOG_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[aapp-webchat] webChatLog ${res.status}:`, detail.slice(0, 300))
      return { ok: false, error: `http_${res.status}` }
    }
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
    return data.ok === true ? { ok: true } : { ok: false, error: data.error || 'webchat_log_failed' }
  } catch (error: any) {
    console.error('[aapp-webchat] request failed:', error?.message || error)
    return { ok: false, error: 'request_failed' }
  }
}
