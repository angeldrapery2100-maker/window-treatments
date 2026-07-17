#!/usr/bin/env node
// Build-time generator for the store AI assistant's knowledge base.
//
// Reads apps/web/src/app/api/store/assistant/knowledge/*.md and writes
// apps/web/src/app/api/store/assistant/knowledge.generated.ts exporting:
//   - CORE_KNOWLEDGE: string          (full core-knowledge.md, always in context)
//   - KB_SECTIONS: KbSection[]        (HD / Sundance files split into retrievable
//                                      sections at ##-or-deeper headings)
//
// The generated file is COMMITTED to git (simplest for Vercel — serverless
// functions can't reliably fs.read loose .md files). Regenerate after editing
// any knowledge/*.md file:
//
//   node apps/web/scripts/generate-assistant-knowledge.mjs
//
// Splitting rules:
//   - split at headings of level 2 or deeper (##, ###, …); the heading line is
//     kept at the top of its section text
//   - sections shorter than MIN_SECTION_CHARS are merged into the previous one
//   - sections longer than MAX_SECTION_CHARS are split into parts (at the last
//     newline before the cap when possible)
// Every string is emitted via JSON.stringify — no template-literal escaping bugs.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const KNOWLEDGE_DIR = join(__dirname, '..', 'src', 'app', 'api', 'store', 'assistant', 'knowledge')
const OUT_FILE = join(__dirname, '..', 'src', 'app', 'api', 'store', 'assistant', 'knowledge.generated.ts')

const CORE_FILE = 'core-knowledge.md'
const MIN_SECTION_CHARS = 200
const MAX_SECTION_CHARS = 6000

/** Split one markdown file into { heading, text } sections at ##+ headings. */
function splitIntoSections(source, content) {
  const lines = content.split('\n')
  const rawSections = []
  let heading = source // fallback heading for any preamble before the first ##
  let buf = []
  let sawHeading = false

  const flush = () => {
    const text = buf.join('\n').trim()
    if (text) rawSections.push({ heading, text })
    buf = []
  }

  for (const line of lines) {
    const m = /^(#{2,})\s+(.+)/.exec(line)
    if (m) {
      flush()
      heading = m[2].trim()
      sawHeading = true
      buf.push(line)
    } else {
      // Use the file's first `# ` title as the preamble section's heading.
      if (!sawHeading && rawSections.length === 0) {
        const h1 = /^#\s+(.+)/.exec(line)
        if (h1 && heading === source) heading = h1[1].trim()
      }
      buf.push(line)
    }
  }
  flush()

  // Merge tiny sections into the previous one so retrieval units stay meaningful.
  const merged = []
  for (const s of rawSections) {
    if (s.text.length < MIN_SECTION_CHARS && merged.length > 0) {
      merged[merged.length - 1].text += '\n\n' + s.text
    } else {
      merged.push({ ...s })
    }
  }
  // Leading tiny section with nothing before it: merge forward instead.
  if (merged.length >= 2 && merged[0].text.length < MIN_SECTION_CHARS) {
    merged[1].text = merged[0].text + '\n\n' + merged[1].text
    merged.shift()
  }

  // Hard-cap section size, splitting oversized sections at newline boundaries.
  const capped = []
  for (const s of merged) {
    if (s.text.length <= MAX_SECTION_CHARS) {
      capped.push(s)
      continue
    }
    let rest = s.text
    let part = 1
    while (rest.length > 0) {
      if (rest.length <= MAX_SECTION_CHARS) {
        capped.push({ heading: part > 1 ? `${s.heading} (part ${part})` : s.heading, text: rest })
        break
      }
      let cut = rest.lastIndexOf('\n', MAX_SECTION_CHARS)
      if (cut < MAX_SECTION_CHARS * 0.5) cut = MAX_SECTION_CHARS // no good newline — hard slice
      const chunk = rest.slice(0, cut).trim()
      if (chunk) {
        capped.push({ heading: part > 1 ? `${s.heading} (part ${part})` : s.heading, text: chunk })
      }
      rest = rest.slice(cut).trim()
      part++
    }
  }

  return capped.map((s) => ({ source, heading: s.heading, text: s.text }))
}

// ── Read inputs ─────────────────────────────────────────────────────────────
const files = readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith('.md')).sort()
if (!files.includes(CORE_FILE)) {
  console.error(`ERROR: ${CORE_FILE} not found in ${KNOWLEDGE_DIR}`)
  process.exit(1)
}

const coreBase = readFileSync(join(KNOWLEDGE_DIR, CORE_FILE), 'utf8').trim()
// 业务事实单源(docs/business-facts.md)— 三个 AI 共享的事实层,追加进 CORE
// (始终在上下文中,不走检索)。维护规则见该文件头部。
const FACTS_FILE = join(__dirname, '..', '..', '..', 'docs', 'business-facts.md')
const factsRaw = readFileSync(FACTS_FILE, 'utf8')
const businessFacts = factsRaw.split('\n').filter(l => !l.startsWith('> ')).join('\n').trim()
const coreKnowledge = coreBase + '\n\n' + businessFacts

const sections = []
for (const file of files) {
  if (file === CORE_FILE) continue
  const content = readFileSync(join(KNOWLEDGE_DIR, file), 'utf8')
  const source = basename(file, '.md')
  sections.push(...splitIntoSections(source, content))
}

// ── Emit generated TS ───────────────────────────────────────────────────────
const header = `// AUTO-GENERATED by scripts/generate-assistant-knowledge.mjs — DO NOT EDIT BY HAND.
// Source of truth: src/app/api/store/assistant/knowledge/*.md
// Regenerate after editing any knowledge file:
//   node apps/web/scripts/generate-assistant-knowledge.mjs
// This file is committed so the Vercel serverless bundle carries the knowledge
// base directly (no fs reads of loose .md files at runtime).

/* eslint-disable */

export interface KbSection {
  source: string
  heading: string
  text: string
}
`

const parts = [header]
parts.push(`\nexport const CORE_KNOWLEDGE: string = ${JSON.stringify(coreKnowledge)}\n`)
parts.push('\nexport const KB_SECTIONS: KbSection[] = [\n')
for (const s of sections) {
  parts.push(
    `  { source: ${JSON.stringify(s.source)}, heading: ${JSON.stringify(s.heading)}, text: ${JSON.stringify(s.text)} },\n`
  )
}
parts.push(']\n')

writeFileSync(OUT_FILE, parts.join(''), 'utf8')

// ── Report ──────────────────────────────────────────────────────────────────
let largest = { heading: '', size: 0 }
let total = 0
for (const s of sections) {
  total += s.text.length
  if (s.text.length > largest.size) largest = { heading: `[${s.source}] ${s.heading}`, size: s.text.length }
}
console.log(`Wrote ${OUT_FILE}`)
console.log(`  core knowledge: ${coreKnowledge.length} chars`)
console.log(`  sections: ${sections.length} (total ${total} chars)`)
console.log(`  largest section: ${largest.size} chars — ${largest.heading}`)
