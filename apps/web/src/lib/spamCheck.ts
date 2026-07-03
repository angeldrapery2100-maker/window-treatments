// Lightweight heuristic spam scoring for the consultation form.
//
// This is an AUXILIARY layer behind Turnstile + honeypot — deliberately
// conservative so it does not drop real customers. It only trips when MULTIPLE
// strong signals stack up (score >= THRESHOLD). Every drop is logged by the
// caller so false positives are observable and the rules can be tuned.

export interface SpamInput {
  name: string
  phone: string
  email: string
  message: string
}

export interface SpamVerdict {
  spam: boolean
  score: number
  reasons: string[]
}

const THRESHOLD = 4

function digitCount(s: string): number {
  return (s.match(/\d/g) || []).length
}

// Longest run of consecutive consonants. Machine-generated gibberish tends to
// produce long unpronounceable runs ("wqtplkrz"); real words rarely exceed 3-4.
function maxConsonantRun(s: string): number {
  let max = 0
  let cur = 0
  for (const ch of s.toLowerCase()) {
    if (/[bcdfghjklmnpqrstvwxz]/.test(ch)) {
      cur++
      if (cur > max) max = cur
    } else {
      cur = 0
    }
  }
  return max
}

export function scoreSpam({ name, phone, email, message }: SpamInput): SpamVerdict {
  const reasons: string[] = []
  let score = 0

  // 1. Gmail address with an implausible number of dots in the local part.
  //    Gmail ignores dots, so real users have 0-2; bots insert many to make each
  //    spoofed address unique, e.g. xa.cem.uze.wa.ti.49@gmail.com.
  const gm = email.toLowerCase().match(/^([^@]+)@(gmail\.com|googlemail\.com)$/)
  if (gm) {
    const dots = (gm[1].match(/\./g) || []).length
    if (dots >= 4) {
      score += 3
      reasons.push(`gmail-dots:${dots}`)
    } else if (dots >= 3) {
      score += 2
      reasons.push(`gmail-dots:${dots}`)
    }
  }

  // 2. Phone with too few digits to be a real number (real US numbers have 10).
  const digits = digitCount(phone)
  if (digits < 7) {
    score += 2
    reasons.push(`phone-digits:${digits}`)
  }

  // 3. Name that looks machine-generated: single all-lowercase token, no spaces,
  //    long, with a long consonant run.
  const n = name.trim()
  if (!/\s/.test(n) && /^[a-z]+$/.test(n) && n.length >= 8 && maxConsonantRun(n) >= 4) {
    score += 2
    reasons.push('name-gibberish')
  }

  // 4. Message gibberish: long, no spaces, long consonant run.
  const m = message.trim()
  if (m && !/\s/.test(m) && m.length >= 12 && maxConsonantRun(m) >= 5) {
    score += 2
    reasons.push('message-gibberish')
  }

  return { spam: score >= THRESHOLD, score, reasons }
}
