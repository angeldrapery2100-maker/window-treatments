'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// Site-wide floating AI shopping assistant. Talks to /api/store/assistant
// (Anthropic-backed). Conversation lives in sessionStorage so it survives
// navigation within the tab, and the whole widget hides itself for the rest
// of the page lifetime if the backend reports the assistant is unavailable
// (no API key configured).
//
// Positioning: on /store pages the bottom-right slot is free (the site-wide
// ConsultationWidget returns null there), so the launcher sits at bottom-5/6
// as before (lifted to bottom-24 on mobile checkout so it never covers the
// in-flow "Pay & Place Order" button). On marketing pages the Consultation
// pill owns bottom-6 right-6 at z-[999], so the launcher stacks ABOVE it
// (bottom-24) and the open chat panel does the same on desktop; the mobile
// bottom sheet instead layers over the pill via z-[1000].

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'store_assistant_chat'
const MAX_MESSAGES = 30
const MAX_CONTENT_CHARS = 2000

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm the Angel Drapery design assistant — ask me about measuring your windows or choosing shades and drapery. 你好！我是安琪窗帘的设计助手，量窗、选帘都可以问我。",
}

const QUICK_PROMPTS = [
  'How do I measure my window?',
  'Which shade is best for a bedroom?',
  '帮我选窗帘',
  'Hunter Douglas 有什么产品?',
]

// Module-level flag: once the server says 'assistant_unavailable', stay hidden
// across route changes / remounts without re-probing the API.
let assistantUnavailable = false

function loadStored(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (m): m is ChatMessage =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    )
  } catch {
    return []
  }
}

function saveStored(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    /* quota / private mode — chat just won't persist */
  }
}

export default function StoreAssistant() {
  const pathname = usePathname()
  const [hidden, setHidden] = useState(assistantUnavailable)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Hydrate persisted conversation once on mount (client only).
  useEffect(() => {
    setMessages(loadStored())
    setHydrated(true)
  }, [])

  // Auto-scroll to bottom whenever the transcript grows or the panel opens.
  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, sending, errorMsg, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = useCallback(
    async (text: string, baseHistory?: ChatMessage[]) => {
      const content = text.trim().slice(0, MAX_CONTENT_CHARS)
      if (!content || sending) return
      setErrorMsg('')

      // Cap history client-side: keep the most recent turns under the server limit.
      const base = baseHistory ?? messages
      const next = [...base, { role: 'user' as const, content }].slice(-(MAX_MESSAGES - 1))
      setMessages(next)
      saveStored(next)
      setInput('')
      setSending(true)

      try {
        const res = await fetch('/api/store/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next }),
        })
        const json = await res.json().catch(() => null)

        if (json?.success && json.data?.reply) {
          const withReply = [...next, { role: 'assistant' as const, content: String(json.data.reply) }]
          setMessages(withReply)
          saveStored(withReply)
        } else if (json?.error === 'assistant_unavailable') {
          // Backend not configured — hide the widget entirely for this page lifetime.
          assistantUnavailable = true
          setHidden(true)
        } else {
          setErrorMsg(
            typeof json?.error === 'string' && json.error
              ? json.error
              : 'Something went wrong. Please try again, or call us at 626-451-9841.'
          )
        }
      } catch {
        setErrorMsg('Connection problem. Please try again, or call us at 626-451-9841.')
      } finally {
        setSending(false)
      }
    },
    [messages, sending]
  )

  if (hidden) return null

  const showWelcome = messages.length === 0
  const onStore = pathname?.startsWith('/store')
  // Checkout has full-width in-flow submit buttons near the bottom on mobile —
  // lift the launcher there so it never sits on top of "Pay & Place Order".
  const onCheckout = pathname?.startsWith('/store/checkout')
  // Marketing pages: the ConsultationWidget pill occupies bottom-6 right-6,
  // so both the launcher and the desktop panel stack above it.
  const btnOffset = !onStore
    ? 'bottom-24'
    : onCheckout
      ? 'bottom-24 sm:bottom-6'
      : 'bottom-5 sm:bottom-6'
  const panelPos = onStore
    ? 'z-50 sm:bottom-6 sm:max-h-[calc(100vh-3rem)]'
    : 'z-[1000] sm:bottom-24 sm:max-h-[calc(100vh-8rem)]'

  return (
    <>
      {/* Launcher button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open design assistant chat"
        className={`fixed ${btnOffset} right-4 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#3d3d3d] text-white shadow-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-xl ${
          open ? 'pointer-events-none scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>

      {/* Chat panel: mobile = bottom sheet, desktop = card */}
      <div
        className={`fixed inset-x-0 bottom-0 flex h-[70vh] w-full flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl transition-all duration-300 ease-out sm:inset-x-auto sm:right-6 sm:h-[560px] sm:w-[380px] sm:rounded-xl ${panelPos} ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
        role="dialog"
        aria-label="Design Assistant chat"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 bg-[#3d3d3d] px-4 py-3 text-white">
          <div>
            <p className="text-sm font-medium tracking-wide">Design Assistant · Angel Drapery</p>
            <p className="mt-0.5 text-[11px] text-gray-300">AI assistant — ask about measuring &amp; products</p>
            <a
              href="/store/whole-home"
              className="mt-1 inline-block text-[11px] text-gray-200 underline underline-offset-2 hover:text-white"
            >
              Talk to a human &rarr;
            </a>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="-mr-1 -mt-1 rounded p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {showWelcome && hydrated && (
            <>
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-800">
                {WELCOME.content}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={sending}
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-[12px] text-gray-700 transition-colors hover:border-gray-800 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}

          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-[#3d3d3d] px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-gray-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-800">
                {m.content}
              </div>
            )
          )}

          {/* Typing indicator */}
          {sending && (
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3" aria-label="Assistant is typing">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
            </div>
          )}

          {/* Error bubble with retry */}
          {errorMsg && !sending && (
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-red-700">
              {errorMsg}
              {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <button
                  onClick={() => {
                    // Retry the last user turn without duplicating it: re-send
                    // against the history with that turn popped off.
                    const last = messages[messages.length - 1]
                    void send(last.content, messages.slice(0, -1))
                  }}
                  className="mt-1.5 block text-[12px] font-medium underline underline-offset-2 hover:text-red-900"
                >
                  Try again / 重试
                </button>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void send(input)
          }}
          className="flex items-center gap-2 border-t border-gray-100 px-3 py-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_CONTENT_CHARS}
            placeholder="Ask a question… 输入问题…"
            className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-[13px] focus:border-gray-800 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3d3d3d] text-white transition-colors hover:bg-gray-700 disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}
