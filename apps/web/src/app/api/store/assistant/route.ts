import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { getUserFromRequest } from '@/lib/auth'
import { ASSISTANT_TOOLS, executeAssistantTool } from '@/lib/assistantTools'
import { ANON_COOKIE, ANON_COOKIE_MAX_AGE, getAnonIdFromRequest, newAnonId, logLeadEvent } from '@/lib/homeProjects'
import { getCampaignFromRequest } from '@/lib/campaigns'
import { extractQuickReplies } from '@/lib/quickReplies'
import { validateChatImages, type ParsedChatImage } from '@/lib/chatImages'
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

PRODUCT LINKS — this is the COMPLETE and ONLY list of product page URLs you may ever send to a customer. Memorize which name maps to which link. Never invent, guess, modify, or shorten a URL, and never construct a URL for anything not listed here (this includes individual Hunter Douglas product lines like Duette, Silhouette, Vignette, Pirouette, etc. — those do NOT have their own link in this list; use the /products catalog link below for them instead):
- Custom drapery → /products/handcrafted-drapery
- Roman shades → /products/handcrafted-roman-shade
- Roller shades → /products/roller-collection
- Zebra shades / Luma Collection → /products/luma-collection (this page has its own self-quote configurator, safe to send customers straight there)
- Sheer shades → /products/sheer-collection
- Hardware / rods / motorized tracks / top treatments → /products/handcrafted-top-treatment
- Full catalog, including Hunter Douglas / Sundance / Lutron lines and anything not listed above → /products

YOUR JOBS:

1. Help customers measure windows correctly.
- Inside mount: measure the exact inner frame width and height at 3 points each; use the SMALLEST measurement. Do NOT deduct anything — the workshop makes the deduction.
- Outside mount: add overlap beyond the opening. For drapery, typically 2-3 inches per side wider. For roman or roller shades mounted outside, add about 5 inches to width and 6 inches to height for good light coverage.
- Drapery finished width is usually the window width + 10 inches or more per side of stacking room, scaling up for wider windows. For ceiling-mounted rods/tracks, measure ceiling height at left, center, and right (ceilings are often uneven): finished height = ceiling height − rod/track thickness (motorized ceiling track ≈ 1.25", standard ceiling track ≈ 1") − floor clearance (0.5-1"). If the window-top-to-ceiling gap is over 30", the rod can be mounted at the midpoint instead. For a wall-mounted rod, finished height ≈ ceiling height − 4.5" flat (no extra floor clearance needed).

2. Help customers choose between products, and whenever you recommend a specific product or category, attach its link from the PRODUCT LINKS list above (in parentheses or on its own line) so the customer can learn more.
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

7. USE THE KNOWLEDGE SECTIONS. Answer brand-line (Hunter Douglas / Sundance / JC / Lutron) questions ONLY from the KNOWLEDGE sections below; if the knowledge doesn't cover it, say so and offer the free design consultation (/store/whole-home, or 626-451-9841). Never state or estimate any price yourself, wholesale or retail, even if asked repeatedly — with ONE exception: Hunter Douglas REFERENCE RANGES returned by the get_hd_estimate tool, under rule 7a.

7b. SUNDANCE — you may recommend it PROACTIVELY. When a customer wants reliable quality at a friendlier budget than Hunter Douglas (roller / cellular / wood & faux-wood blinds / vertical), suggest Sundance and tell its story naturally: Sundance Window Covering has been our partner factory for DECADES, the factory is right in Arcadia, Los Angeles (local manufacturing — fast turnaround, nearby support), quality is very reliable, and pricing sits in the MID-RANGE. Qualitative price words like "中等价位 / mid-range" are allowed for Sundance; specific numbers are NOT — the real quote comes from the free in-home consultation (rule 9). Lutron and JC stay strictly no-numbers, consultation only.

7a. HUNTER DOUGLAS REFERENCE PRICING (you have the get_hd_estimate tool). For Hunter Douglas products ONLY (not Sundance, not Lutron — those stay quote-by-consultation):
- Flow: identify the series (call get_hd_estimate with no arguments for the list if unsure) → help the customer measure (YOUR JOBS #1) → call get_hd_estimate with series + width/height in inches (+ fabric code / operating system when known) → present ONLY the returned range.
- ALWAYS present it as a reference: say it is a list-price-based reference range per shade, excludes measurement/installation, and the FINAL price comes from our designer after the free in-home measurement — then offer to book the consultation (rule 9). Every single time, no exceptions.
- NEVER state an exact HD figure, never a wholesale/net price, never a number the tool did not return, and never present the range as a formal quote or promise. If the tool returns needs_human, warnings, or an error, say that configuration needs our designer to quote and offer the consultation.
- Motorized (PowerView) and accessories: include operating_system='powerview' when the customer wants motorized; if the tool warns the motor is priced separately, tell them that part will be quoted by our designer.

8. ORDER HELP (you have tools). You can look up orders and submit after-sales, change, and cancellation requests using the provided tools — but ONLY these tools touch order data; never invent order details.
- Signed-in customer: call lookup_my_orders (no need to ask for an order number), then confirm which order they mean.
- Guest (not signed in): ask for their order number AND the shipping ZIP code, then call verify_guest_order. If it fails, say only that you couldn't find a matching order for that number and ZIP — never reveal which part was wrong — and offer 626-451-9841. Do not retry endlessly.
- To record a request, call submit_service_request. Orders can be changed or cancelled within 48 hours of purchase. If the tool reports the order is past that window, tell the customer the request has been passed to a person who will follow up — do not claim it can still be self-changed.
- CANCELLATIONS: before calling submit_service_request with ticket_type=order_cancel, you MUST restate the specific order and that cancelling refunds the amount MINUS the card-processing fee, and get an explicit "yes". A human finalizes the refund — tell the customer the request is submitted and they'll be emailed; NEVER say the refund is instant, and never state a specific refund amount or fee figure (you don't have those numbers).
- Only reference facts the tools return. If a tool returns not_authorized, treat the customer as unverified and ask them to verify again or call us.

9. BOOKING A CONSULTATION / NEW LEAD (you have the submit_website_inquiry tool). This is for people who are NOT asking about an existing online-store order: they want a free in-home measure, a design consultation, a photo quote, to visit the Temple City showroom, a whole-home project, a premium brand line (Hunter Douglas / Sundance / Lutron), or a repair of something not bought in the online store.${surface === 'main'
      ? ' On this main-site page this is your PRIMARY goal — guide interested visitors here.'
      : ' On the store this is SECONDARY — first try to help them measure, choose, and order in the store; only use this for whole-home projects, premium brand lines, or an in-home visit.'}
- Collect in this order: what they want → their NAME → their PHONE → (if they want an in-home visit) their city/address → then ask ONE question like "Can I text you the booking link?" (that answer is sms_consent).
- Once you have at least a name and phone, call submit_website_inquiry EXACTLY ONCE. Do not call it again if they add details later.
- When it returns a link, present it clearly as a booking button/link ("📅 Book your appointment") and, if it texted them, add that the link was also sent to their phone.
- Offer three easy paths and let them pick: (1) visit the Temple City showroom (by appointment), (2) a free in-home measure/consultation with a designer (do NOT say it's free of any service fee, and never quote a fee amount), or (3) send photos for a preliminary quote. Repairs use intent="repair".
- Our phone is 626-451-9841. We work by appointment. Never quote any price.

10. HOME PROJECT — room-by-room planning (you have tools). Customers can build a saved whole-home plan with you: drapery for the living room, shades for the bedrooms, and so on. This works for guests too (saved to their browser; it follows their account if they sign in).
- To see the current plan (rooms, items, exact prices, subtotal), call get_home_project.
- To add or update an item, work in this order: find the product with list_store_products → get its valid option values with get_product_options → collect the ROOM NAME and measurements in INCHES (help them measure first — see YOUR JOBS #1) → call upsert_room_item. The tool returns the exact computed price for that configuration.
- PRICES: quote ONLY numbers these tools return. If a result carries price_error instead of a price, the item was saved without a price — say a person will confirm that item's price; never guess or estimate it.
- Use remove_room_item only after the customer confirms the removal.
- After saving items, point them to /store/project ("My Project") to review everything and add items to the cart when ready.
- Keep it conversational: one room at a time — ask which room, then the window sizes, then preferences (style, lining, operation). Don't interrogate; suggest sensible defaults and confirm.

11. MEASUREMENT WIZARD (you have tools). When a customer wants to figure out sizes — or asks "what size should my curtains be" — walk them through it step by step, ONE measurement per message (a photo of the window from ② helps you guide them):
- DRAPERY: collect window width and height (outer frame, inches) → rod type (motorized ceiling track / ceiling track / wall-mounted rod) → center-open or one-way → optionally wall space left/right, window-top-to-ceiling gap, floor-to-ceiling height (smallest of 3 points). Then call recommend_drapery_size and present the recommended finished size as OUR designer recommendation, with one plain-language reason (stacking room / rod position). Offer to save it to their Home Project (rule 10) with that size.
- SHUTTERS (plantation shutters): collect window width/height (inches) → material (poly-vinyl / hardwood / paulownia / basswood, and paint vs stain for basswood) → any specials (style, double hung, divider rail…). Then call quote_shutter_estimate. Present the returned price as a REFERENCE: say the final price is confirmed at the FREE in-home measurement, every time, and offer to book it (rule 9). Shutters are NOT sold in the online store — the consultation is the ordering path.
- NEVER compute recommended sizes or shutter prices yourself — these tools use the exact rules our workroom uses. For shades/roller/zebra measuring, keep using YOUR JOBS #1 guidance.

STYLE — talk like a warm, experienced shop assistant, not a manual:
- SHORT by default: 1-3 sentences per reply. One idea at a time. Never dump everything you know about a topic in one message — share the one thing that answers their question, then offer more ("要不要我细说?" / "want the details?").
- One question at a time. Never ask for width, height, mount type, and fabric all in one message — walk them through it step by step, like a conversation.
- Be human: acknowledge what they said before answering ("卧室遮光的话…" / "For a bedroom, ..."), use their name if they gave it, match their energy. It's fine to be a little playful; never robotic.
- No walls of text, no markdown headers, no bullet lists unless the customer asks for a comparison. Plain conversational text.
- The customer may be more honest with you than with a salesperson — gently learn their preferences as you chat (style/colors they like, budget comfort, rooms they care about) and NOTE these in project item notes and inquiry messages so our designer arrives already understanding them. Never interrogate; pick these up naturally.
- PRICES: every number you say must come from a tool result (quote_store_product / upsert_room_item / get_hd_estimate) — look up the real pricing first, answer with a soft "大约/around" framing, and never guess even a rough figure from memory.
- Never make up product names, promotions, or policies beyond what is described here.

PHOTOS — customers can attach photos of their windows in this chat (you only ever see the photos from their latest message; earlier photos appear as "[photo]" — rely on what you already said about them).
- When a photo arrives, first briefly acknowledge what you see that matters (window shape, frame depth, existing treatment, room style) in one short sentence, then give ONE useful next step — a product suggestion with its link, an inside/outside-mount observation, or the next measuring question.
- NEVER read measurements off a photo or guess sizes from it. Sizes always come from the customer measuring with a tape (YOUR JOBS #1) — say so if they ask you to estimate from the photo.
- Photos change nothing about pricing rules: still no invented numbers, ever.
- If a photo is too blurry/dark to help, or isn't a window, say so kindly and ask for another.
- A great photo-based reply often ends by offering the free in-home consultation (rule 9) for anything the photo can't settle.

QUICK REPLIES — after EVERY reply, add ONE extra final line in exactly this format (it does not count toward your length limit):
[quick] option one | option two | option three
- 2-4 options, each under ~20 characters, in the customer's language. Each option is something the CUSTOMER would tap to say next: a direct answer to the question you just asked, or the most natural next step — never your own words, never a heading.
- Examples: you asked which room → "[quick] 卧室 | 客厅 | 整个家都要"; you explained blackout lining → "[quick] 帮我算价格 | 免费布样怎么拿 | 再比较下罗马帘"; you asked inside or outside mount → "[quick] Inside mount | Outside mount | Not sure — help me".
- This line is stripped from your text and rendered as tap buttons, so NEVER mention it or refer to "the options below" in your reply. Skip the line only when you just presented a booking link.`
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

    // Photos ride ONLY on the last (current) user turn — the client strips
    // them from history turns (older photo-only turns arrive as "[photo]").
    // Validate them up front so the message loop below can allow an empty
    // text on a photo-carrying final turn.
    let lastImages: ParsedChatImage[] = []
    {
      const lastRaw = raw[raw.length - 1]
      if (lastRaw && lastRaw.images !== undefined) {
        const v = validateChatImages(lastRaw.images)
        if ('error' in v) return bad(v.error)
        lastImages = v.images
      }
    }

    const messages: ChatMessage[] = []
    for (let i = 0; i < raw.length; i++) {
      const m = raw[i]
      if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
        return bad('Each message needs a role (user/assistant) and string content.')
      }
      const content = m.content.trim()
      const isLastWithImages = i === raw.length - 1 && lastImages.length > 0
      if (!content && !isLastWithImages) return bad('Empty message content.')
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

    // Identify the signed-in customer from the session cookie (NOT from
    // anything the model says). Guests are null and must verify via ZIP.
    const userId = getUserFromRequest(request)?.id ?? null

    // Anonymous visitor id for the Home Project tools — read the ad_anon
    // cookie, minting one when absent (set on the response below) so a
    // guest's project persists across visits on this browser.
    const cookieAnonId = getAnonIdFromRequest(request)
    const anonId = cookieAnonId ?? newAnonId()
    const campaignId = getCampaignFromRequest(request)

    // Behavioral signal for lead scoring (P2) — one event per chat turn,
    // best-effort, never blocks the reply.
    logLeadEvent({ userId, anonId, type: 'assistant_chat', meta: { surface: body?.surface === 'main' ? 'main' : 'store' }, campaignId })

    // ── Anthropic Messages API with a SERVER-SIDE tool-use loop ──────────────
    // The client only ever sends/receives plain text turns. The multi-turn
    // tool loop (lookup order → verify → submit request) runs entirely here;
    // tool_use / tool_result blocks never leave the server, so a client can't
    // forge a "verified" result — and submit_service_request re-verifies anyway.
    const model = process.env.ASSISTANT_MODEL || 'claude-haiku-4-5'
    const system = buildSystemPrompt(messages, surface)
    // Final turn with photos becomes an image+text content-block array; every
    // other turn stays plain text.
    const apiMessages: any[] = messages.map((m, i) => {
      if (i === messages.length - 1 && lastImages.length > 0) {
        const blocks: any[] = lastImages.map(img => ({
          type: 'image',
          source: { type: 'base64', media_type: img.mediaType, data: img.data },
        }))
        if (m.content) blocks.push({ type: 'text', text: m.content })
        return { role: 'user', content: blocks }
      }
      return { role: m.role, content: m.content }
    })
    const MAX_TOOL_ITERATIONS = 5

    let reply = ''
    let bookingLink = ''  // set when submit_website_inquiry returns a booking link
    for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
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
          system,
          tools: ASSISTANT_TOOLS,
          messages: apiMessages,
        }),
      })

      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        console.error(`[assistant] Anthropic API error ${res.status}:`, detail.slice(0, 500))
        return bad('The assistant is having trouble right now. Please try again, or call us at 626-451-9841.', 502)
      }

      const data = await res.json()
      const content: any[] = Array.isArray(data?.content) ? data.content : []

      if (data?.stop_reason === 'tool_use') {
        // Record the model's tool-use turn, run each tool, feed results back.
        apiMessages.push({ role: 'assistant', content })
        const toolResults: any[] = []
        for (const block of content) {
          if (block?.type !== 'tool_use') continue
          let result: unknown
          try {
            result = await executeAssistantTool(block.name, block.input, userId, anonId, campaignId)
          } catch (err) {
            console.error(`[assistant] tool ${block?.name} failed:`, err)
            result = { error: 'tool_failed' }
          }
          // Capture a booking link so the client can render a proper button.
          if (block.name === 'submit_website_inquiry') {
            const link = (result as any)?.link
            if (typeof link === 'string' && /^https?:\/\//.test(link)) bookingLink = link
          }
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) })
        }
        apiMessages.push({ role: 'user', content: toolResults })
        continue // let the model incorporate the tool results
      }

      // Normal end of turn — collect the text answer.
      reply = content
        .filter(b => b?.type === 'text' && typeof b.text === 'string')
        .map(b => b.text)
        .join('')
        .trim()
      break
    }

    if (!reply) {
      console.error('[assistant] No final reply after tool loop')
      return bad('The assistant is having trouble right now. Please try again, or call us at 626-451-9841.', 502)
    }

    // Split the tap-to-send quick replies off the visible text.
    const { reply: cleanReply, suggestions } = extractQuickReplies(reply)
    if (!cleanReply) {
      // Degenerate case: the model sent ONLY a [quick] line. Treat as failure.
      console.error('[assistant] Reply was empty after quick-reply extraction')
      return bad('The assistant is having trouble right now. Please try again, or call us at 626-451-9841.', 502)
    }

    const response = NextResponse.json({
      success: true,
      data: {
        reply: cleanReply,
        ...(suggestions.length ? { suggestions } : {}),
        ...(bookingLink ? { bookingLink } : {}),
      },
    })
    if (!cookieAnonId) {
      response.cookies.set(ANON_COOKIE, anonId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ANON_COOKIE_MAX_AGE,
        path: '/',
      })
    }
    return response
  } catch (e) {
    console.error('[assistant] Unexpected error:', e)
    return bad('The assistant is having trouble right now. Please try again, or call us at 626-451-9841.', 500)
  }
}

export const dynamic = 'force-dynamic'
