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
