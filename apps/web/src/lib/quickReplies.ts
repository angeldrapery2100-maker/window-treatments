// Parse the assistant's trailing quick-replies line.
//
// The store assistant's system prompt asks the model to end EVERY reply with
// one extra line in the form:
//   [quick] option one | option two | option three
// This helper pulls that line off the reply text and returns the visible reply
// plus up to 4 short suggestion strings, which the client renders as
// tap-to-send chips. Tolerant of trailing blank lines, fullwidth brackets
// (【quick】), an optional colon, and fullwidth pipes (｜). If the model forgot
// the line, suggestions is simply empty — never an error.

const MAX_SUGGESTIONS = 4
const MAX_SUGGESTION_CHARS = 40

export function extractQuickReplies(text: string): { reply: string; suggestions: string[] } {
  const lines = text.split('\n')
  let suggestions: string[] = []
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (!line) continue // skip trailing blank lines
    const m = line.match(/^[\[【]\s*quick\s*[\]】][:：]?\s*(.+)$/i)
    if (m) {
      suggestions = [
        ...new Set(
          m[1]
            .split(/[|｜]/)
            .map((s) => s.trim())
            .filter(Boolean)
        ),
      ]
        .slice(0, MAX_SUGGESTIONS)
        .map((s) => s.slice(0, MAX_SUGGESTION_CHARS))
      lines.splice(i, 1)
    }
    break // only ever the last non-empty line
  }
  return { reply: lines.join('\n').trim(), suggestions }
}

// The chat widget renders the reply as PLAIN TEXT (no Markdown), and the system
// prompt asks for plain conversational text — but the model (Haiku) still
// sometimes emits **bold**, *italic*, `code`, # headings or > quotes, which then
// show up as literal ** / * / ` symbols to the customer. Strip those emphasis
// markers server-side so the visible reply stays clean regardless. Links and
// ordinary punctuation are left untouched.
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold**
    .replace(/__([^_]+)__/g, '$1') // __bold__
    .replace(/\*([^*\n]+)\*/g, '$1') // *italic* (run after bold so no ** remain)
    .replace(/`([^`\n]+)`/g, '$1') // `code`
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // # heading markers
    .replace(/^\s{0,3}>\s?/gm, '') // > blockquote markers
}
