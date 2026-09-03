'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { tr, useUiLanguage } from '@/lib/uiLanguage'
import { safeEstimateViewUrl } from '@/lib/estimateDisplay'

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
  // P6 §1: set when save_estimate returned a view page for this estimate.
  estimateUrl?: string
  estimateNo?: string
  // Tap-to-send quick replies for this assistant turn (server-generated).
  // Only rendered on the latest assistant message.
  suggestions?: string[]
  // Compressed data-URL photos attached to a user turn. Displayed as
  // thumbnails; only ever POSTed for the LATEST turn (history turns send a
  // "[photo]" placeholder instead — see send()).
  images?: string[]
  at?: string
}

// Referral context handed in by a /r/<token> landing page through the
// `ad:open-assistant` event. Purely cosmetic on the client: it personalises
// the opening line. Attribution itself is server-side and cookie-only — the
// token is echoed in the request body for logging, and the API deliberately
// does NOT trust it (see /api/store/assistant).
interface RefContext {
  token: string
  type?: string
  displayName?: string
  discountPct?: number | null
  language?: 'en' | 'zh'
}

const STORAGE_KEY = 'store_assistant_chat'
const TEASER_KEY = 'store_assistant_teaser_done'
const OPENED_KEY = 'store_assistant_opened'
const SESSION_ID_KEY = 'store_assistant_session_id'
const WEB_CHAT_LOG_PATH = '/api/store/web-chat-log'
const WEB_CHAT_LOG_DEBOUNCE_MS = 3000
const MAX_MESSAGES = 30
const MAX_ARCHIVE_MESSAGES = 200
const MAX_CONTENT_CHARS = 2000
const TEASER_DELAY_MS = 4000

// Photo attachments (② 图片上传): compressed in-browser before sending.
const MAX_IMAGES = 3
const IMAGE_MAX_SIDE = 1280
const IMAGE_JPEG_QUALITY = 0.8
// Keep the whole request comfortably under Vercel's ~4.5MB body limit; must
// stay in sync with MAX_TOTAL_IMAGE_B64_CHARS in lib/chatImages.ts.
const MAX_TOTAL_IMAGE_CHARS = 3_000_000
// Placeholder sent for photo-only turns in HISTORY (photos themselves are only
// POSTed for the latest turn; the assistant's prior reply is the context).
const PHOTO_PLACEHOLDER = '[photo]'

// Main marketing site: steer toward understanding the company and finding
// the right product (funnels to a local in-home consultation).
// Widget copy is ENGLISH-ONLY (Eddie 2026-07-19) — the single Chinese line in
// the greeting tells customers we also speak Chinese/other languages; the
// assistant then replies in whatever language the customer uses.
const WELCOME_MAIN: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm the Angel Drapery design assistant — ask me about our company, or tell me about your windows and I'll help you find the right product. 我们也说中文，其他语言也都可以。",
}

const QUICK_PROMPTS_MAIN = [
  'Tell me about Angel Drapery',
  'Which product is right for my window?',
  'What brands do you carry?',
]

// Online store: steer toward measuring, configuring, ordering, and after-sales.
const WELCOME_STORE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm the Angel Drapery design assistant — ask me about measuring your windows, choosing shades and drapery, or your order. 我们也说中文，其他语言也都可以。",
}

const QUICK_PROMPTS_STORE = [
  'How do I measure my window?',
  'Which shade is best for a bedroom?',
  'I need to change or cancel my order',
]

// Direct self-service path on the welcome screen. The measuring wizard walks
// customers through each window with diagrams, saves their sheet, and hands
// the measurements back to this assistant for product and pricing help.
const MEASURE_WIZARD_ACTION = {
  label: 'Measure windows & get a price',
  helper: 'Step-by-step diagrams · saves every window',
  href: '/measure-wizard',
}

// Launcher/teaser chrome is ENGLISH-ONLY (Eddie 2026-07-19) — the conversation
// itself stays multilingual (the assistant replies in the customer's language).
const TEASER_MAIN = 'Not sure which window treatment fits? Ask me anything!'
const TEASER_STORE = 'Measuring, choosing, or pricing? Ask me anything!'

// Always-visible booking entries on the welcome screen (Eddie 2026-07-19):
// the showroom is APPOINTMENT-ONLY, so the widget says so up front and offers
// both booking paths as one-tap actions (each starts the assistant's
// consultation-booking flow, rule 9).
const SHOWROOM_NOTE = 'Our Temple City showroom is by appointment only.'
const BOOKING_ACTIONS: { label: string; prompt: string }[] = [
  {
    label: '📅 Book a free in-home measure',
    prompt: "I'd like to book a free in-home measure / design consultation.",
  },
  {
    label: '🏬 Book a showroom visit',
    prompt: "I'd like to book an appointment to visit your showroom.",
  },
]

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
// phone number. Keep /measure-wizard here so the assistant's proactive
// measuring recommendation is always a real tappable link. Everything else
// passes through untouched (whitespace-pre-wrap on the bubble preserves
// newlines).
const RICH_RE =
  /(https?:\/\/[^\s)）\]】>，。；]+)|(\/(?:products|store|how-to-measure|measure-wizard|faq)(?:\/[A-Za-z0-9\-_]+)*\/?)|(626-451-9841)/g

function renderRich(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const isChinese = /[\u3400-\u9fff]/.test(text)
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
    if (tok === MEASURE_WIZARD_ACTION.href) {
      // A raw path inside a paragraph is too small and ambiguous on phones,
      // especially when Chinese text wraps immediately before it. Render the
      // wizard as its own 44px native link so the whole control is tappable.
      nodes.push(
        <a
          key={key++}
          href={MEASURE_WIZARD_ACTION.href}
          aria-label={isChinese ? '打开测量报价向导' : 'Open measuring and pricing guide'}
          className="my-2 flex min-h-11 w-full touch-manipulation items-center justify-between gap-3 rounded-xl bg-[#19698c] px-4 py-2.5 font-semibold text-white no-underline shadow-sm transition-colors hover:bg-[#155f80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2687a8] focus-visible:ring-offset-2"
        >
          <span>{isChinese ? '📐 打开测量报价向导' : '📐 Open measuring & pricing guide'}</span>
          <span aria-hidden="true">→</span>
        </a>
      )
    } else if (m[3] !== undefined && tok === PHONE_DISPLAY) {
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

// Downscale + re-encode a photo in the browser so uploads stay small (a phone
// photo shrinks from ~4MB to ~200KB). Throws if the browser can't decode the
// file (e.g. HEIC on some platforms) — caller shows a friendly format hint.
async function compressImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('decode_failed'))
      img.src = url
    })
    const w = img.naturalWidth
    const h = img.naturalHeight
    if (!w || !h) throw new Error('decode_failed')
    const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(w, h))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(w * scale))
    canvas.height = Math.max(1, Math.round(h * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no_canvas')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', IMAGE_JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(url)
  }
}

function sanitizeImages(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out = v
    .filter((s): s is string => typeof s === 'string' && s.startsWith('data:image/'))
    .slice(0, MAX_IMAGES)
  return out.length ? out : undefined
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
      .map((m) => ({
        ...m,
        suggestions: sanitizeSuggestions((m as ChatMessage).suggestions),
        images: sanitizeImages((m as ChatMessage).images),
      }))
  } catch {
    return []
  }
}

function saveStored(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // Quota (photos are heavy) or private mode. Retry without the image data
    // so at least the text conversation survives navigation.
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.map(({ images: _images, ...rest }) => rest))
      )
    } catch {
      /* still no luck — chat just won't persist */
    }
  }
}

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_KEY)
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing
    const random = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
    const sessionId = `ws_${random}`
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
    return sessionId
  } catch {
    return `ws_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`
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

// Local opening line for a referred visitor. Rendered client-side only — it
// is NOT sent to the model and never counts as an assistant turn the model
// has to honour; the first real reply still comes from the API.
function referralGreeting(ref: RefContext): string {
  let zh = ref.language === 'zh'
  if (!ref.language) {
    try { zh = navigator.language.toLowerCase().startsWith('zh') } catch { zh = false }
  }
  const who = (ref.displayName || '').trim()
  const pct = typeof ref.discountPct === 'number' && ref.discountPct > 0 ? ref.discountPct : null
  const tail = zh
    ? '跟我说说你的窗户（大概宽高、哪个房间就行），我马上给你一个参考价。'
    : "Tell me about your windows — rough width and height, and which room — and I'll give you a quick estimate."

  if (ref.type === 'customer' && who) {
    const head = zh
      ? (pct ? `你好！${who} 把这个链接发给你——朋友首单可享 ${pct}% 优惠。` : `你好！${who} 把这个链接发给你。`)
      : (pct ? `Hi! ${who} sent you here — friends get ${pct}% off.` : `Hi! ${who} sent you here.`)
    return `${head} ${tail}`
  }
  if (who && (ref.type === 'agent' || ref.type === 'designer' || ref.type === 'contractor')) {
    const head = zh ? `你好！你是 ${who} 推荐过来的。` : `Hi! You were referred by ${who}.`
    return `${head} ${tail}`
  }
  return zh ? `你好！${tail}` : `Hi! ${tail}`
}

export default function StoreAssistant() {
  const pathname = usePathname()
  /* 补修 B4:悬浮球的语言跟落地页共用 ad_lang 这个键。只读不写 —— 切换语言的
     控件在页面上,不在球上。SSR 默认 en,挂载后才读 localStorage(hydration 安全)。 */
  const [uiLang] = useUiLanguage('en')
  const [open, setOpen] = useState(false)
  const [openedOnce, setOpenedOnce] = useState(false)
  const [teaserVisible, setTeaserVisible] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pendingImages, setPendingImages] = useState<string[]>([])
  const [attaching, setAttaching] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [refCtx, setRefCtx] = useState<RefContext | null>(null)
  // Set once a referral greeting has been shown, so the server-history
  // hydration below cannot race in afterwards and overwrite it.
  const greetedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sessionIdRef = useRef('')
  const messagesRef = useRef<ChatMessage[]>([])
  const archiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const endedSentRef = useRef(false)
  const conversionRef = useRef<{ name?: string; phone?: string; leadId?: string } | null>(null)

  // Hydrate persisted conversation once on mount (client only).
  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId()
    setMessages(loadStored())
    try {
      if (sessionStorage.getItem(OPENED_KEY)) setOpenedOnce(true)
    } catch {
      /* ignore */
    }
    setHydrated(true)
    // Signed-in customers also get their server-stored conversation
    // (cross-device / cross-day continuity). Guests get an empty list back
    // and keep the sessionStorage transcript.
    void (async () => {
      try {
        const res = await fetch('/api/store/assistant')
        const json = await res.json().catch(() => null)
        const server = Array.isArray(json?.data?.messages) ? json.data.messages : []
        if (server.length > 0) {
          const cleaned: ChatMessage[] = server
            .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .map((m: any) => ({
              role: m.role,
              content: m.content,
              ...(typeof m.bookingLink === 'string' ? { bookingLink: m.bookingLink } : {}),
              suggestions: sanitizeSuggestions(m.suggestions),
            }))
          if (cleaned.length > 0 && !greetedRef.current) {
            setMessages(cleaned)
            saveStored(cleaned)
          }
        }
      } catch {
        /* offline / guest — local transcript stands */
      }
    })()
  }, [])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const postArchive = useCallback((archiveMessages: ChatMessage[], ended = false) => {
    if (!sessionIdRef.current || archiveMessages.length === 0) return
    const conversion = conversionRef.current
    const payload = {
      sessionId: sessionIdRef.current,
      messages: archiveMessages.map((message) => ({
        role: message.role === 'user' ? 'user' : 'bot',
        text: message.content,
        ...(message.at ? { at: message.at } : {}),
      })),
      page: location.pathname,
      lang: navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en',
      ...(conversion || {}),
      ...(conversion ? { converted: true } : {}),
      ...(ended ? { ended: true } : {}),
    }
    void fetch(WEB_CHAT_LOG_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-ad-webchat': '1' },
      body: JSON.stringify(payload),
      keepalive: ended,
    }).catch(() => {})
  }, [])

  const scheduleArchive = useCallback((archiveMessages: ChatMessage[]) => {
    if (archiveTimerRef.current) clearTimeout(archiveTimerRef.current)
    archiveTimerRef.current = setTimeout(() => postArchive(archiveMessages), WEB_CHAT_LOG_DEBOUNCE_MS)
  }, [postArchive])

  useEffect(() => {
    const sendEnded = () => {
      if (endedSentRef.current) return
      endedSentRef.current = true
      if (archiveTimerRef.current) clearTimeout(archiveTimerRef.current)
      postArchive(messagesRef.current, true)
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') sendEnded()
      else endedSentRef.current = false
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', sendEnded)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', sendEnded)
      if (archiveTimerRef.current) clearTimeout(archiveTimerRef.current)
    }
  }, [postArchive])

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
      // Report a one-per-session "opened" beacon for lead analytics — fires on
      // the FIRST open only (before we set the flag), so we can measure how many
      // visitors open the widget even if they never send a message. Best-effort,
      // no PII (identity is attributed server-side from cookies); keepalive so it
      // survives an immediate navigation.
      const alreadyOpened = sessionStorage.getItem(OPENED_KEY)
      sessionStorage.setItem(OPENED_KEY, '1')
      sessionStorage.setItem(TEASER_KEY, '1')
      if (!alreadyOpened) {
        fetch('/api/store/lead-event', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ type: 'assistant_opened' }),
          keepalive: true,
        }).catch(() => {})
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Other pages (e.g. /measure-wizard's "ask our AI assistant" button, and the
  // /r/<token> referral landing) can pop the chat open by dispatching this
  // window event. `detail.ref` personalises the greeting; `detail.prefill`
  // drops a starter sentence into the input box (the visitor still presses
  // send — we never speak for them).
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { ref?: RefContext; prefill?: string } | undefined
      if (detail?.ref?.token) {
        setRefCtx(detail.ref)
        // A referred visitor lands in an empty chat: greet them by their
        // friend's name LOCALLY (no API call, no tokens burned) so the panel
        // is never an empty box. If they already have a conversation going,
        // leave it alone.
        if (messagesRef.current.length === 0) {
          const greeting = referralGreeting(detail.ref)
          if (greeting) {
            greetedRef.current = true
            const next = [{ role: 'assistant' as const, content: greeting, at: new Date().toISOString() }]
            setMessages(next)
            saveStored(next)
          }
        }
      }
      if (detail?.prefill) setInput(detail.prefill.slice(0, MAX_CONTENT_CHARS))
      openChat()
    }
    window.addEventListener('ad:open-assistant', onOpen)
    return () => window.removeEventListener('ad:open-assistant', onOpen)
  }, [openChat])

  // /r/<token> 落地页一挂载就广播推荐人上下文(不弹窗)。只记下来,让悬浮球
  // 打开时的欢迎屏也带推荐人名字(Eddie 2026-09-03:「悬浮球开场白没说是谁推荐的」)。
  // 不往 messages 里塞东西——欢迎屏的量窗/预约按钮要保留。
  useEffect(() => {
    const onCtx = (e: Event) => {
      const detail = (e as CustomEvent).detail as { ref?: RefContext } | undefined
      if (detail?.ref?.token) setRefCtx(detail.ref)
    }
    window.addEventListener('ad:referral-context', onCtx)
    return () => window.removeEventListener('ad:referral-context', onCtx)
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
    async (text: string, baseHistory?: ChatMessage[], images?: string[]) => {
      const content = text.trim().slice(0, MAX_CONTENT_CHARS)
      const imgs = (images ?? []).slice(0, MAX_IMAGES)
      if ((!content && imgs.length === 0) || sending) return
      setErrorMsg('')

      // Preserve the full archive (up to webChatLog's limit), while only sending
      // the most recent MAX_MESSAGES to the assistant model below.
      const base = baseHistory ?? messages
      const next = [
        ...base,
        { role: 'user' as const, content, at: new Date().toISOString(), ...(imgs.length ? { images: imgs } : {}) },
      ].slice(-(MAX_ARCHIVE_MESSAGES - 1))
      setMessages(next)
      saveStored(next)
      setInput('')
      setPendingImages([])
      setSending(true)

      try {
        const res = await fetch('/api/store/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Photos are only uploaded for the LATEST turn; older photo turns
          // become a "[photo]" placeholder (the assistant's earlier reply
          // about them is the context). Other client-only fields are stripped
          // — the API expects bare {role, content} plus optional last-turn
          // images.
          body: JSON.stringify({
            messages: next.slice(-MAX_MESSAGES).map(({ role, content: c, images: im }, idx, modelMessages) =>
              idx === modelMessages.length - 1 && im?.length
                ? { role, content: c, images: im }
                : { role, content: c || PHOTO_PLACEHOLDER }
            ),
            surface,
            // Echoed for server-side logging only — the API reads attribution
            // from the httpOnly ad_ref cookie and ignores this field.
            ...(refCtx?.token ? { ref: { token: refCtx.token } } : {}),
          }),
        })
        const json = await res.json().catch(() => null)

        if (json?.success && json.data?.reply) {
          const link = typeof json.data.bookingLink === 'string' ? json.data.bookingLink : undefined
          /* ★ 客户端再过一遍白名单。服务端已经筛过,但这一段直接进 href ——
             两头都筛的成本是一个函数调用,漏一次的成本是一个开放跳转。 */
          const estUrl = safeEstimateViewUrl(json.data.estimateUrl)
          const estNo = typeof json.data.estimateNo === 'string' ? json.data.estimateNo : ''
          const suggestions = sanitizeSuggestions(json.data.suggestions)
          const withReply = [
            ...next,
            {
              role: 'assistant' as const,
              content: String(json.data.reply),
              at: new Date().toISOString(),
              ...(link ? { bookingLink: link } : {}),
              ...(estUrl ? { estimateUrl: estUrl, estimateNo: estNo } : {}),
              ...(suggestions ? { suggestions } : {}),
            },
          ]
          setMessages(withReply)
          saveStored(withReply)
          const conversion = json.data.conversion
          if (conversion && typeof conversion === 'object') {
            conversionRef.current = {
              ...(typeof conversion.name === 'string' ? { name: conversion.name } : {}),
              ...(typeof conversion.phone === 'string' ? { phone: conversion.phone } : {}),
              ...(typeof conversion.leadId === 'string' ? { leadId: conversion.leadId } : {}),
            }
            if (archiveTimerRef.current) clearTimeout(archiveTimerRef.current)
            postArchive(withReply)
          } else {
            scheduleArchive(withReply)
          }
        } else if (json?.error === 'assistant_unavailable') {
          // Backend not configured / key missing — keep the widget, offer the
          // human path. Recovers automatically once the server has its key.
          const withNotice = [...next, { role: 'assistant' as const, content: UNAVAILABLE_MSG, at: new Date().toISOString() }]
          setMessages(withNotice)
          saveStored(withNotice)
          scheduleArchive(withNotice)
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
    [messages, postArchive, refCtx, scheduleArchive, sending, surface]
  )

  // Compress and queue photos picked from the file input.
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      setErrorMsg('')
      setAttaching(true)
      try {
        const picked = Array.from(files).slice(0, MAX_IMAGES)
        const added: string[] = []
        let failed = false
        for (const f of picked) {
          if (pendingImages.length + added.length >= MAX_IMAGES) break
          if (!f.type.startsWith('image/')) {
            failed = true
            continue
          }
          try {
            added.push(await compressImage(f))
          } catch {
            failed = true
          }
        }
        const total = [...pendingImages, ...added].reduce((n, s) => n + s.length, 0)
        if (total > MAX_TOTAL_IMAGE_CHARS) {
          setErrorMsg('Photos are too large altogether — please send fewer at once. 照片总体积太大，请分开发送。')
          return
        }
        if (added.length) setPendingImages((prev) => [...prev, ...added].slice(0, MAX_IMAGES))
        if (failed) {
          setErrorMsg('Some photos could not be read — please use JPG or PNG. 有照片无法读取，请使用 JPG 或 PNG 格式。')
        }
      } finally {
        setAttaching(false)
      }
    },
    [pendingImages]
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
            {/* 气泡里那句话本身就是这个按钮的名字。再挂一个内容完全不同的
                aria-label 会把它盖掉(WCAG 2.5.3),语音控制念不出来。 */}
            <button type="button" onClick={openChat} className="text-left">
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
          /* 可访问名必须**包含**可见文字(2.5.3)。以前可见的是 "Ask AI"、
             aria-label 却是 "Open design assistant chat",两者毫无交集。 */
          aria-label={tr(uiLang, 'Ask AI — open design assistant chat', 'AI 助手 — 打开设计助手对话')}
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
          {/* 补修 B4:悬浮球跟着落地页的语言走(同一个 ad_lang 键)。
              整站中文用户看到一颗英文球,像是别人家的控件。 */}
          <span className="text-[13px] font-medium tracking-wide">{tr(uiLang, 'Ask AI', 'AI 助手')}</span>
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
        /* ★ 关着的时候面板还留在 DOM 里做退场动画,里面的输入框和按钮照样能
           Tab 进去 —— aria-hidden=true 的容器里有可聚焦元素,是键盘用户会
           凭空掉进一个看不见的表单,也是 Lighthouse 直接判红的一条。
           inert 把整棵子树移出 tab 顺序和无障碍树,视觉与动画一点不动
           (React 19 原生支持)。 */
        inert={!open}
      >
        {/* Header */}
        <div className="flex items-start justify-between bg-gradient-to-r from-[#262626] to-[#454545] px-4 py-3 text-white">
          <div className="flex items-start gap-3">
            <AssistantAvatar />
            <div>
              <p className="text-sm font-medium tracking-wide">Angel Drapery · AI Design Assistant</p>
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
                {refCtx && !onStore ? referralGreeting(refCtx) : (onStore ? WELCOME_STORE : WELCOME_MAIN).content}
              </div>
              <a
                href={MEASURE_WIZARD_ACTION.href}
                className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-[#19698c] to-[#2687a8] px-4 py-3 text-left text-white shadow-sm transition hover:from-[#155f80] hover:to-[#217b9b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2687a8] focus-visible:ring-offset-2"
              >
                <span className="text-xl" aria-hidden="true">📐</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold">{MEASURE_WIZARD_ACTION.label}</span>
                  <span className="mt-0.5 block text-[11px] text-white/75">{MEASURE_WIZARD_ACTION.helper}</span>
                </span>
                <span className="text-base transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </a>
              <p className="pt-1 text-[11px] text-gray-500">{SHOWROOM_NOTE}</p>
              <div className="flex flex-wrap gap-2">
                {/* Primary actions: both booking paths are one tap from open */}
                {BOOKING_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => send(a.prompt)}
                    disabled={sending}
                    className="rounded-full bg-[#3d3d3d] px-4 py-2 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-gray-700 disabled:opacity-50"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-0.5">
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
              <div key={i} className="flex flex-col items-end gap-1.5">
                {!!m.images?.length && (
                  <div className="flex max-w-[85%] flex-wrap justify-end gap-1.5">
                    {m.images.map((src, j) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={j}
                        src={src}
                        alt="Attached photo"
                        className="max-h-40 max-w-[180px] rounded-xl border border-gray-200 object-cover shadow-sm"
                      />
                    ))}
                  </div>
                )}
                {!!m.content && (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-to-r from-[#2f2f2f] to-[#454545] px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow-sm">
                    {m.content}
                  </div>
                )}
              </div>
            ) : (
              <div key={i} className="max-w-[85%] space-y-2">
                <div className="whitespace-pre-wrap rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-800 shadow-sm">
                  {renderRich(m.content)}
                </div>
                {!!safeEstimateViewUrl(m.estimateUrl) && (
                  <a
                    href={safeEstimateViewUrl(m.estimateUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] text-gray-800 shadow-sm transition-colors hover:border-gray-400"
                  >
                    <span className="text-[16px]">📄</span>
                    <span className="min-w-0">
                      <span className="block font-medium">View your estimate / 查看你的报价单</span>
                      {!!m.estimateNo && (
                        <span className="block font-mono text-[11px] tracking-wide text-gray-500">{m.estimateNo}</span>
                      )}
                    </span>
                  </a>
                )}
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
                    void send(last.content, messages.slice(0, -1), last.images)
                  }}
                  className="mt-1.5 block text-[12px] font-medium underline underline-offset-2 hover:text-red-900"
                >
                  Try again / 重试
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pending photo previews */}
        {pendingImages.length > 0 && (
          <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 pt-2.5">
            {pendingImages.map((src, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Photo ${i + 1} to send`}
                  className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPendingImages((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white shadow hover:bg-black"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <span className="text-[11px] text-gray-400">
              {pendingImages.length}/{MAX_IMAGES}
            </span>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void send(input, undefined, pendingImages)
          }}
          className={`flex items-center gap-2 bg-white px-3 py-3 ${pendingImages.length ? '' : 'border-t border-gray-100'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => {
              void handleFiles(e.target.files)
              e.target.value = '' // allow re-picking the same file
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || attaching || pendingImages.length >= MAX_IMAGES}
            aria-label="Attach a photo of your window / 上传窗户照片"
            title="Attach a photo of your window / 上传窗户照片"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40"
          >
            {attaching ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.2-8.56" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </button>
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
            disabled={sending || attaching || (!input.trim() && pendingImages.length === 0)}
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
