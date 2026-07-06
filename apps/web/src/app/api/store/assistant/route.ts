import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { CORE_KNOWLEDGE, KB_SECTIONS } from './knowledge.generated'

// AI shopping assistant for the store — proxies chat turns to the Anthropic
// Messages API. Stateless: the client sends the whole (capped) history each
// turn and receives one assistant reply back. No conversation is persisted
// server-side. Calls Anthropic via plain fetch — deliberately no SDK dep.
//
// Knowledge injection: core-knowledge.md is ALWAYS in the system prompt;
// the Hunter Douglas / Sundance KB sections (built at generation time by
// scripts/generate-assistant-knowledge.mjs) are retrieved per request with
// naive keyword scoring against the last user turn.

const MAX_MESSAGES = 30
const MAX_CONTENT_CHARS = 2000
const MAX_TOKENS = 800

// Retrieval knobs: at most 4 KB sections per turn, ~9K chars of retrieved
// text, and the assembled system prompt never exceeds ~20K chars.
const RETRIEVAL_MAX_SECTIONS = 4
const RETRIEVAL_BUDGET_CHARS = 9000
const MAX_SYSTEM_CHARS = 20000
const MAX_QUERY_TERMS = 40

type Surface = 'main' | 'store'

// Persona/priorities differ by where the widget is mounted: the main
// marketing site should steer toward understanding the company and finding
// the right product (funneling to a local in-home consultation), while the
// online store should steer toward measuring, configuring, ordering, and
// after-sales. Everything else (measuring formulas, config options, no
// invented prices, knowledge-section usage, style) is shared.
function personaFor(surface: Surface): string {
  if (surface === 'main') {
    return `You are the friendly design assistant on Angel Drapery's MAIN COMPANY WEBSITE (not the online store checkout). Angel Drapery is a family-run custom window-treatment company serving the Los Angeles / San Gabriel Valley area (phone: 626-451-9841), with an in-house workroom and full access to premium brand lines (Hunter Douglas, Sundance, Lutron) through free in-home consultations.

On this page your priorities, in order:
1. Help visitors understand who Angel Drapery is and what makes the company different (family-run, in-house workroom, full local catalog including premium brand lines).
2. Have a conversation about their room and windows to figure out which product fits them — custom drapery, roman shades, roller shades, zebra shades, hardware/motorized tracks, or a premium brand line — and explain the differences in plain terms.
3. Guide interested visitors toward booking a free in-home design consultation (mention 626-451-9841 or the "Request Consultation" option on the page) — that's how the full catalog, including Hunter Douglas / Sundance / Lutron, gets quoted and ordered.
The online store (/store) is a smaller, separate curated catalog for direct purchase — only bring it up if someone specifically asks about buying without a consultation; it is not the focus on this page.`
  }
  return `You are the friendly shopping assistant on Angel Drapery's ONLINE STORE, a family-run custom window-treatment company (phone: 626-451-9841). Customers chat with you while browsing the store's curated catalog: custom drapery, roman shades, roller shades, zebra shades, and drapery hardware/motorized tracks. The store does NOT carry Hunter Douglas / Sundance / Lutron — those require a free in-home consultation; mention that if asked.

On this page your priorities, in order:
1. Help customers measure their windows correctly.
2. Help them choose and configure the right product.
3. Help them place their order (swatches, pricing via the on-page configurator — never invent numbers).
4. Help with after-sales. Orders can be changed or cancelled within 48 hours of purchase (a card-processing fee applies on cancellation). For that, or for any post-delivery issue (wrong size, damage, quality), point them to /store/track, where they can look up their order and submit a request — or invite them to call 626-451-9841.`
}

function sharedRules(surface: Surface): string {
  const escalate =
    surface === 'main'
      ? `6. ESCALATE to a free in-home consultation whenever a visitor is ready to move forward, wants a quote, wants to talk to a person, or asks about premium brand lines (Hunter Douglas / Sundance / Lutron) — point them to 626-451-9841 or the consultation request option. This is the primary next step on this page.`
      : `6. ESCALATE warmly when appropriate. For whole-home/multi-room projects, premium brand-line interest, or wanting to talk to a human, point them to the free design consultation (/store/whole-home, or 626-451-9841). For order changes, cancellations, or any post-delivery issue, point them to /store/track to look up their order and submit a request.`

  return `LANGUAGE: Always reply in the customer's language. If they write in Chinese, reply in 中文; if English, reply in English. Match their language every turn.

YOUR JOBS:

1. Help customers measure windows correctly.
- Inside mount: measure the exact inner frame width and height at 3 points each; use the SMALLEST measurement. Do NOT deduct anything — the workshop makes the deduction.
- Outside mount: add overlap beyond the opening. For drapery, typically 2-3 inches per side wider. For roman or roller shades mounted outside, add about 5 inches to width and 6 inches to height for good light coverage.
- Drapery finished width is usually the window width + 10 inches or more per side of stacking room, scaling up for wider windows. For ceiling-mounted rods/tracks, measure ceiling height at left, center, and right (ceilings are often uneven): finished height = ceiling height − rod/track thickness (motorized ceiling track ≈ 1.25", standard ceiling track ≈ 1") − floor clearance (0.5-1"). If the window-top-to-ceiling gap is over 30", the rod can be mounted at the midpoint instead. For a wall-mounted rod, finished height ≈ ceiling height − 4.5" flat (no extra floor clearance needed).

2. Help customers choose between products.
- Custom drapery: soft, luxurious look; widest fabric selection; great blackout options.
- Roman shades: tailored fabric look, clean folds — fabric warmth without full-length drapery.
- Roller shades: clean, minimal, modern; great for simple light control.
- Zebra shades: alternating sheer/solid bands for adjustable light.
- Hardware / tracks: rods, finials, and motorized tracks (including for existing drapery).

3. Explain configuration options.
- Lining: NO (unlined), LF (light-filtering), BO (blackout).
- Pleat styles: 2-fold pinch pleat, 3-fold pinch pleat, ripplefold.
- Operation: cordless or motorized options on shades; motorized tracks for drapery.

4. Recommend free fabric swatches before buying: swatches are free, up to 10 per order, and the customer only pays shipping — $2.99 USPS standard (5-8 days) or $9.99 expedited (2-3 days). Swatches can be added from product pages.

5. NEVER invent or estimate prices. Pricing depends on exact size and options — tell customers the configurator on each product page shows the exact price for their size instantly. Do not quote numbers, ranges, or "roughly" figures.

${escalate}

7. USE THE KNOWLEDGE SECTIONS. Answer brand-line (Hunter Douglas / Sundance / JC / Lutron) questions ONLY from the KNOWLEDGE sections below; if the knowledge doesn't cover it, say so and offer the free design consultation (/store/whole-home, or 626-451-9841). Never state or estimate any price, wholesale or retail, even if asked repeatedly.

STYLE: Warm, concise, and practical — usually 2-6 sentences. Plain text only: no markdown headers, no bullet lists unless genuinely helpful, no code blocks. Ask one clarifying question when the customer's window or room details are unclear. Never make up product names, promotions, or policies beyond what is described here.`
}

function systemPromptFor(surface: Surface): string {
  return `${personaFor(surface)}\n\n${sharedRules(surface)}`
}

// ── Naive keyword retrieval over the generated KB sections ──────────────────

// Lowercased copies built once per lambda instance so per-request scoring is
// just indexOf scans (no regex work in the hot loop).
const KB_INDEX = KB_SECTIONS.map((s) => ({
  section: s,
  headingLower: s.heading.toLowerCase(),
  textLower: s.text.toLowerCase(),
}))

// Tokenize a query into lowercase terms: ASCII words of length >= 3, plus
// every CJK bigram (consecutive pairs of Chinese characters) — bigrams are
// the standard cheap trick for keyword matching in unsegmented Chinese text.
function extractTerms(query: string): string[] {
  const lower = query.toLowerCase()
  const terms = new Set<string>()
  for (const w of lower.match(/[a-z0-9]{3,}/g) ?? []) terms.add(w)
  for (const run of lower.match(/[㐀-䶿一-鿿]+/g) ?? []) {
    for (let i = 0; i + 1 < run.length; i++) terms.add(run.slice(i, i + 2))
  }
  return [...terms].slice(0, MAX_QUERY_TERMS)
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0
  let i = haystack.indexOf(needle)
  while (i !== -1) {
    count++
    i = haystack.indexOf(needle, i + needle.length)
  }
  return count
}

// Score every KB section by term-frequency overlap (heading hits weighted x3),
// then greedily take top sections under the char budget. Empty when nothing
// matches — general questions shouldn't drag in irrelevant HD spec text.
function retrieveSections(query: string): { source: string; heading: string; text: string }[] {
  const terms = extractTerms(query)
  if (terms.length === 0) return []

  const scored: { section: (typeof KB_SECTIONS)[number]; score: number }[] = []
  for (const entry of KB_INDEX) {
    let score = 0
    for (const term of terms) {
      score += countOccurrences(entry.textLower, term)
      score += 3 * countOccurrences(entry.headingLower, term)
    }
    if (score > 0) scored.push({ section: entry.section, score })
  }
  if (scored.length === 0) return []
  scored.sort((a, b) => b.score - a.score)

  const picked: (typeof KB_SECTIONS)[number][] = []
  let used = 0
  for (const { section } of scored) {
    if (picked.length >= RETRIEVAL_MAX_SECTIONS) break
    if (used + section.text.length > RETRIEVAL_BUDGET_CHARS) continue
    picked.push(section)
    used += section.text.length
  }
  return picked
}

// Assemble the per-request system prompt: persona/rules + always-on core
// knowledge + retrieved KB sections. Sections that would push the prompt past
// MAX_SYSTEM_CHARS are dropped whole (never truncated mid-section).
function buildSystemPrompt(messages: ChatMessage[], surface: Surface): string {
  const lastUser = messages[messages.length - 1]
  const prevAssistant =
    messages.length >= 2 && messages[messages.length - 2].role === 'assistant'
      ? messages[messages.length - 2].content
      : ''
  const query = prevAssistant ? `${lastUser.content}\n${prevAssistant}` : lastUser.content

  let system = systemPromptFor(surface) + '\n\n# KNOWLEDGE\n' + CORE_KNOWLEDGE
  for (const s of retrieveSections(query)) {
    const block = `\n\n## [${s.source}] ${s.heading}\n${s.text}`
    if (system.length + block.length > MAX_SYSTEM_CHARS) break
    system += block
  }
  return system
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

export async function POST(request: Request) {
  try {
    // Graceful degradation: no key configured → the widget hides itself.
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'assistant_unavailable' })
    }

    // Rate limit: 20 requests / 10 minutes per IP (same helper as /api/consultation).
    const ip = getClientIp(request)
    const limit = await rateLimit('assistant', ip, { max: 20, windowSeconds: 600 })
    if (!limit.allowed) {
      return bad('You are sending messages too quickly. Please wait a few minutes and try again.', 429)
    }

    // ── Validate body ────────────────────────────────────────────────────────
    let body: any
    try {
      body = await request.json()
    } catch {
      return bad('Invalid request body.')
    }

    const raw = body?.messages
    if (!Array.isArray(raw) || raw.length === 0) {
      return bad('messages array is required.')
    }
    if (raw.length > MAX_MESSAGES) {
      return bad('Conversation too long. Please start a new chat.')
    }

    const messages: ChatMessage[] = []
    for (const m of raw) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
        return bad('Each message needs a role (user/assistant) and string content.')
      }
      const content = m.content.trim()
      if (!content) return bad('Empty message content.')
      if (content.length > MAX_CONTENT_CHARS) {
        return bad('Message too long (max 2000 characters).')
      }
      messages.push({ role: m.role, content })
    }
    if (messages[messages.length - 1].role !== 'user') {
      return bad('Last message must be from the user.')
    }

    // Client tells us which surface it's mounted on (main site vs. online
    // store) so the persona/priorities can differ; default to 'store' since
    // that was the widget's original universal behavior.
    const surface: Surface = body?.surface === 'main' ? 'main' : 'store'

    // ── Call Anthropic Messages API (plain fetch, non-streaming) ─────────────
    const model = process.env.ASSISTANT_MODEL || 'claude-haiku-4-5'
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(messages, surface),
        messages,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[assistant] Anthropic API error ${res.status}:`, detail.slice(0, 500))
      return bad('The assistant is having trouble right now. Please try again, or call us at 626-451-9841.', 502)
    }

    const data = await res.json()
    const reply = Array.isArray(data?.content)
      ? data.content
          .filter((block: any) => block?.type === 'text' && typeof block.text === 'string')
          .map((block: any) => block.text)
          .join('')
          .trim()
      : ''

    if (!reply) {
      console.error('[assistant] Empty reply from Anthropic:', JSON.stringify(data).slice(0, 500))
      return bad('The assistant is having trouble right now. Please try again, or call us at 626-451-9841.', 502)
    }

    return NextResponse.json({ success: true, data: { reply } })
  } catch (e) {
    console.error('[assistant] Unexpected error:', e)
    return bad('The assistant is having trouble right now. Please try again, or call us at 626-451-9841.', 500)
  }
}

export const dynamic = 'force-dynamic'
