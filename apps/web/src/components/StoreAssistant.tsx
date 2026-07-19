'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

// Site-wide floating AI shopping assistant. Talks to /api/store/assistant
// (Anthropic-backed). Conversation lives in sessionStorage so it survives
// navigation within the tab. If the backend reports the assistant is
// unavailable (no API key configured, key rotated, quota exhausted), the
// widget stays visible and shows a human-fallback message (see
// UNAVAILABLE_MSG below) instead of disappearing — it recovers automatically
// on the next send once the server is healthy again.
//
// 2026-07-19 redesign ("气泡改版+快捷选项"):
// - Launcher is a labeled pill ("AI 助手 · Ask AI") with a soft ping ring and
//   a one-time teaser bubble a few seconds after page load (per-session).
// - Panel got a brand gradient header with avatar + online dot; messages area
//   is gray-50 with white bordered assistant bubbles.
// - Assistant text is linkified: product/store paths, full URLs, and the
//   phone number become tappable links.
// - Every assistant turn can carry server-parsed quick replies (see
//   extractQuickReplies in the API route) rendered as tap-to-send chips under
//   the LATEST assistant message only.
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
  // Set on an assistant turn when the backend registered a lead and returned an
  // appointment link — rendered as a "Book now" button under the message.
  bookingLink?: string
  // Tap-to-send quick replies for this assistant turn (server-generated).
  // Only rendered on the latest assistant message.
  suggestions?: string[]
}

const STORAGE_KEY = 'store_assistant_chat'
const TEASER_KEY = 'store_assistant_teaser_done'
const OPENED_KEY = 'store_assistant_opened'
const MAX_MESSAGES = 30
const MAX_CONTENT_CHARS = 2000
const TEASER_DELAY_MS = 4000

// Main marketing site: steer toward understanding the company and finding
// the right product (funnels to a local in-home consultation).
const WELCOME_MAIN: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm the Angel Drapery design assistant — ask me about our company, or tell me about your windows and I'll help you find the right product, in whatever language is easiest for you. 你好！我是安琪窗帘的设计助手，想了解我们公司，或者想知道哪款产品适合你，都可以用中文、英文或其他语言问我。",
}

const QUICK_PROMPTS_MAIN = [
  'Tell me about Angel Drapery',
  'Which product is right for my window?',
  '帮我选适合的窗帘',
  '介绍一下你们公司',
]

// Online store: steer toward measuring, configuring, ordering, and after-sales.
const WELCOME_STORE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm the Angel Drapery design assistant — ask me about measuring your windows, choosing shades and drapery, or your order, in whatever language is easiest for you. 你好！我是安琪窗帘的设计助手，量窗、选帘、订单问题都可以问我，中文、英文或其他语言都可以直接问我。",
}

const QUICK_PROMPTS_STORE = [
  'How do I measure my window?',
  'Which shade is best for a bedroom?',
  '帮我选窗帘',
  'I need to change or cancel my order',
]

const TEASER_MAIN = '窗帘怎么选？随时问我 — Not sure which treatment fits? Ask me!'
const TEASER_STORE = '量窗、选帘、算价格，随时问我 — Measuring or pricing? Ask me!'

// NOTE (fix 2026-07-05): we previously hid the whole widget permanently when
// the server reported 'assistant_unavailable'. That made the bubble vanish
// mid-conversation (e.g. env var not yet live, key rotated, quota exhausted)
// and confused users. Now we keep the widget and show a human-fallback
// message instead — the assistant recovers automatically on the next send.
const UNAVAILABLE_MSG =
  'Our AI assistant is temporarily unavailable. Please call us at 626-451-9841, ' +
  'or request a free design consultation at /store/whole-home — a real person will help you. ' +
  'AI 客服暂时不可用，请拨打 626-451-9841 或提交免费设计咨询，我们的设计师会协助您。'

const PHONE_DISPLAY = '626-451-9841'
const PHONE_HREF = 'tel:+16264519841'

// Turn plain assistant text into text + tappable links. Recognizes, in one
// left-to-right pass: full http(s) URLs, site-relative paths the assistant is
// allowed to send (/products…, /store…, /how-to-measure, /faq), and the shop
// phone number. Everything else passes through untouched (whitespace-pre-wrap
// on the bubble preserves newlines).
const RICH_RE =
  /(https?:\/\/[^\s)）\]】>，。；]+)|(\/(?:products|store|how-to-measure|faq)(?:\/[A-Za-z0-9\-_]+)*\/?)|(626-451-9841)/g

function renderRich(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  RICH_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = RICH_RE.exec(text)) !== null) {
    let tok = m[0]
    // Trailing sentence punctuation is never part of the link.
    const trimmed = tok.replace(/[.,!?;:，。！？；：]+$/, '')
    if (trimmed !== tok) {
      tok = trimmed
      RICH_RE.lastIndex = m.index + tok.length
    }
    if (!tok) continue
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const cls = 'font-medium underline underline-offset-2 decoration-gray-400 hover:decoration-gray-800 break-all'
    if (m[3] !== undefined && tok === PHONE_DISPLAY) {
      nodes.push(
        <a key={key++} href={PHONE_HREF} className={cls}>
          {tok}
        </a>
      )
    } else if (tok.startsWith('http')) {
      nodes.push(
        <a key={key++} href={tok} target="_blank" rel="noopener noreferrer" className={cls}>
          {tok}
        </a>
      )
    } else {
      nodes.push(
        <a key={key++} href={tok} className={cls}>
          {tok}
        </a>
      )
    }
    last = m.index + tok.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function sanitizeSuggestions(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out = [...new Set(v.filter((s): s is string => typeof s === 'string' && !!s.trim()))].slice(0, 4)
  return out.length ? out : undefined
}

function loadStored(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (m): m is ChatMessage =>
          m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
      )
      .map((m) => ({ ...m, suggestions: sanitizeSuggestions((m as ChatMessage).suggestions) }))
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

// Small brand avatar used in the header and next to assistant bubbles.
function AssistantAvatar({ size = 30 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7L12 3z" />
        <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
      </svg>
    </span>
  )
}

export default function StoreAssistant() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [openedOnce, setOpenedOnce] = useState(false)
  const [teaserVisible, setTeaserVisible] = useState(false)
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
    try {
      if (sessionStorage.getItem(OPENED_KEY)) setOpenedOnce(true)
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  // One-time attention teaser: pops a few seconds after load, once per
  // session, and never once the chat has been opened or used.
  useEffect(() => {
    if (!hydrated) return
    let done = false
    try {
      done = !!sessionStorage.getItem(TEASER_KEY)
    } catch {
      /* ignore */
    }
    if (done || openedOnce || messages.length > 0) return
    const t = setTimeout(() => setTeaserVisible(true), TEASER_DELAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  const dismissTeaser = useCallback(() => {
    setTeaserVisible(false)
    try {
      sessionStorage.setItem(TEASER_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  const openChat = useCallback(() => {
    setOpen(true)
    setOpenedOnce(true)
    setTeaserVisible(false)
    try {
      sessionStorage.setItem(OPENED_KEY, '1')
      sessionStorage.setItem(TEASER_KEY, '1')
    } catch {
      /* ignore */
    }
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

  const onStore = pathname?.startsWith('/store')
  const surface: 'main' | 'store' = onStore ? 'store' : 'main'

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
          // Strip client-only fields — the API expects bare {role, content}.
          body: JSON.stringify({ messages: next.map(({ role, content: c }) => ({ role, content: c })), surface }),
        })
        const json = await res.json().catch(() => null)

        if (json?.success && json.data?.reply) {
          const link = typeof json.data.bookingLink === 'string' ? json.data.bookingLink : undefined
          const suggestions = sanitizeSuggestions(json.data.suggestions)
          const withReply = [
            ...next,
            {
              role: 'assistant' as const,
              content: String(json.data.reply),
              ...(link ? { bookingLink: link } : {}),
              ...(suggestions ? { suggestions } : {}),
            },
          ]
          setMessages(withReply)
          saveStored(withReply)
        } else if (json?.error === 'assistant_unavailable') {
          // Backend not configured / key missing — keep the widget, offer the
          // human path. Recovers automatically once the server has its key.
          const withNotice = [...next, { role: 'assistant' as const, content: UNAVAILABLE_MSG }]
          setMessages(withNotice)
          saveStored(withNotice)
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
    [messages, sending, surface]
  )

  const showWelcome = messages.length === 0
  // Checkout has full-width in-flow submit buttons near the bottom on mobile —
  // lift the launcher there so it never sits on top of "Pay & Place Order".
  const onCheckout = pathname?.startsWith('/store/checkout')
  // Product detail pages (/store/<uuid>) render a fixed bottom sticky price
  // bar on mobile (store redesign P2) — lift the launcher the same way so it
  // stacks above the bar instead of covering its Add to Cart button.
  const onProductPage = /^\/store\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(pathname || '')
  // Marketing pages: the ConsultationWidget pill occupies bottom-6 right-6,
  // so both the launcher and the desktop panel stack above it.
  const btnOffset = !onStore
    ? 'bottom-24'
    : (onCheckout || onProductPage)
      ? 'bottom-24 sm:bottom-6'
      : 'bottom-5 sm:bottom-6'
  // Store pages keep the account + cart stack at the bottom-RIGHT corner
  // (ProductLayout floating buttons) — the assistant launcher moves to the
  // bottom-LEFT there so the two stacks never pile up on each other or cover
  // the config column's buttons (2026-07-13 fix). Elsewhere it stays right.
  const btnSide = onStore ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
  const panelSide = onStore ? 'sm:left-6' : 'sm:right-6'
  const panelPos = onStore
    ? 'z-50 sm:bottom-6 sm:max-h-[calc(100vh-3rem)]'
    : 'z-[1000] sm:bottom-24 sm:max-h-[calc(100vh-8rem)]'

  const lastIdx = messages.length - 1

  const chipClass =
    'rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-700 shadow-sm transition-all hover:border-gray-800 hover:bg-gray-900 hover:text-white disabled:opacity-50'

  return (
    <>
      {/* Launcher: teaser bubble + labeled pill button */}
      <div className={`fixed ${btnOffset} ${btnSide} z-50 flex flex-col gap-2 ${onStore ? 'items-start' : 'items-end'}`}>
        {teaserVisible && !open && (
          <div className="relative max-w-[240px] animate-[fadeSlideIn_.35s_ease-out] rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 pr-7 text-[12px] leading-relaxed text-gray-700 shadow-xl">
            <button
              type="button"
              onClick={openChat}
              className="text-left"
              aria-label="Open design assistant chat"
            >
              {onStore ? TEASER_STORE : TEASER_MAIN}
            </button>
            <button
              type="button"
              onClick={dismissTeaser}
              aria-label="Dismiss"
              className="absolute right-1.5 top-1.5 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <button
          onClick={openChat}
          aria-label="Open design assistant chat"
          className={`group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#2f2f2f] to-[#4a4a4a] py-3 pl-4 pr-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:brightness-110 ${
            open ? 'pointer-events-none scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {/* Soft attention ring until the chat has been opened once */}
          {!openedOnce && (
            <span
              className="absolute inset-0 -z-10 rounded-full bg-[#3d3d3d] opacity-25 [animation:ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"
              aria-hidden="true"
            />
          )}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[13px] font-medium tracking-wide">AI 助手</span>
            <span className="mt-0.5 text-[10px] text-gray-300">Ask AI</span>
          </span>
        </button>
      </div>

      {/* Chat panel: mobile = bottom sheet, desktop = card */}
      <div
        className={`fixed inset-x-0 bottom-0 flex h-[72vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl transition-all duration-300 ease-out sm:inset-x-auto ${panelSide} sm:h-[560px] sm:w-[384px] sm:rounded-2xl ${panelPos} ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
        role="dialog"
        aria-label="Design Assistant chat"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-start justify-between bg-gradient-to-r from-[#262626] to-[#454545] px-4 py-3 text-white">
          <div className="flex items-start gap-3">
            <AssistantAvatar />
            <div>
              <p className="text-sm font-medium tracking-wide">Angel Drapery · AI 设计助手</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-300">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {onStore
                  ? 'Online — measuring, ordering & order help · any language'
                  : 'Online — get to know us & find your product · any language'}
              </p>
              <a
                href="/store/whole-home"
                className="mt-1 inline-block text-[11px] text-gray-200 underline underline-offset-2 hover:text-white"
              >
                Talk to a human &rarr;
              </a>
            </div>
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
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
          {showWelcome && hydrated && (
            <>
              <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-800 shadow-sm">
                {(onStore ? WELCOME_STORE : WELCOME_MAIN).content}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(onStore ? QUICK_PROMPTS_STORE : QUICK_PROMPTS_MAIN).map((q) => (
                  <button key={q} onClick={() => send(q)} disabled={sending} className={chipClass}>
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}

          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-to-r from-[#2f2f2f] to-[#454545] px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow-sm">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="max-w-[85%] space-y-2">
                <div className="whitespace-pre-wrap rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-800 shadow-sm">
                  {renderRich(m.content)}
                </div>
                {m.bookingLink && (
                  <a
                    href={m.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#3d3d3d] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-700"
                  >
                    📅 Book your appointment / 点此预约
                  </a>
                )}
                {/* Contextual quick replies — latest assistant turn only */}
                {i === lastIdx && !sending && !!m.suggestions?.length && (
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {m.suggestions.map((s) => (
                      <button key={s} onClick={() => send(s)} disabled={sending} className={chipClass}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {/* Typing indicator */}
          {sending && (
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm" aria-label="Assistant is typing">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
            </div>
          )}

          {/* Error bubble with retry */}
          {errorMsg && !sending && (
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-red-700">
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
          className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_CONTENT_CHARS}
            placeholder="Ask a question… 输入问题…"
            className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] transition-colors focus:border-gray-800 focus:bg-white focus:outline-none"
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

      {/* Teaser entrance animation (scoped, no Tailwind config change needed) */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
