#!/usr/bin/env node
/**
 * Regenerate apps/web/src/lib/draperyHardwareCatalog.generated.ts from a dump
 * of AAPP's `library.draperyHardwareCatalog`.
 *
 *   node apps/web/scripts/build-hardware-catalog.mjs path/to/draperyHardwareCatalog.json
 *
 * To produce the dump: open the AAPP app, open the browser console, run
 *   copy(JSON.stringify(state.library.draperyHardwareCatalog))
 * and paste into a file. (Until this script existed the table was extracted by
 * hand, which is exactly why it went stale.)
 *
 * WHAT COMES ACROSS: the taxonomy — profiles, their family/kind/mount/layer,
 * every colour the customer may choose, and every finial the profile allows.
 *
 * WHAT DOES NOT: prices. Not one number. Every figure still comes from AAPP at
 * request time via `catalog_price_estimate`, so this table cannot drift from a
 * real quote — it exists only because the engine rejects an unknown profile
 * with a bare `missing_profile` and `libraryExport` doesn't ship the catalog.
 *
 * Colour and finial resolution mirror the engine's own order (functions/index.js
 * `_dhcGetColors` / `_dhcFinialsForProfile`): product-level palette wins over
 * subtype-level, which wins over the profile's named palette; finials come from
 * the family and are then filtered by the subtype's allowedFinialKeys.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DEST = path.resolve(HERE, '../src/lib/draperyHardwareCatalog.generated.ts')
const SRC = process.argv[2] || process.env.AAPP_HARDWARE_CATALOG_JSON

if (!SRC) {
  console.error(`Usage: node apps/web/scripts/build-hardware-catalog.mjs <draperyHardwareCatalog.json>

Produce the file by running this in the AAPP browser console:
  copy(JSON.stringify(state.library.draperyHardwareCatalog))`)
  process.exit(1)
}

const cat = JSON.parse(fs.readFileSync(SRC, 'utf8'))
if (!cat || typeof cat !== 'object' || !cat.profiles) {
  console.error(`That file has no "profiles" key, so it is not a draperyHardwareCatalog dump.
Top-level keys found: ${Object.keys(cat || {}).join(', ') || '(none)'}`)
  process.exit(1)
}

const subtype = (k) => (cat.subtypes || {})[k] || null

/** Mirror of _dhcGetColors. */
function colorsFor(profileKey) {
  const sub = subtype(profileKey)
  const prod = sub ? (cat.products || {})[sub.productKey] : null
  const raw =
    (prod && Array.isArray(prod.colorPalette) && prod.colorPalette.length && prod.colorPalette) ||
    (sub && Array.isArray(sub.colorPalette) && sub.colorPalette.length && sub.colorPalette) ||
    (cat.colorPalettes || {})[(cat.profiles[profileKey] || {}).colorPaletteKey] ||
    []
  return (Array.isArray(raw) ? raw : []).map(normalizeChoice).filter(Boolean)
}

/** Mirror of _dhcFinialsForProfile — family finials, filtered by the subtype. */
function finialsFor(profileKey, familyKey) {
  const prod = (cat.products || {})[familyKey]
  let list = (prod && Array.isArray(prod.finials))
    ? prod.finials.filter((f) => f && f.active !== false)
    : Object.values(cat.finials || {}).filter((f) => f && f.active !== false &&
        (!Array.isArray(f.familyScope) || !f.familyScope.length || f.familyScope.includes(familyKey)))
  const sub = subtype(profileKey)
  if (sub && Array.isArray(sub.allowedFinialKeys)) {
    const allowed = new Set(sub.allowedFinialKeys)
    list = list.filter((f) => allowed.has(f.key))
  }
  return list.map(normalizeChoice).filter(Boolean)
}

/** Palette entries are sometimes plain strings, sometimes objects. */
function normalizeChoice(entry) {
  if (typeof entry === 'string') return { key: entry, label: entry }
  if (!entry || typeof entry !== 'object') return null
  const key = entry.key || entry.code || entry.id || entry.name || entry.label
  if (!key) return null
  return { key: String(key), label: String(entry.label || entry.name || entry.displayName || key) }
}

const POLE_FAMILIES = ['metal_rod', 'wood_pole']
const rows = []
for (const [key, prof] of Object.entries(cat.profiles)) {
  if (!prof || prof.active === false) continue
  const family = String(prof.familyKey || prof.family || '')
  const colors = colorsFor(key)
  rows.push({
    key,
    family,
    // isTrackType is FALSE for every H-rail, so it cannot be used to tell a
    // pole from a track. Family is the only reliable signal.
    kind: POLE_FAMILIES.some((f) => family.replace('motorized_', '').startsWith(f)) ? 'pole' : 'track',
    mount: /ceiling/.test(family) || /ceiling/.test(key) ? 'ceiling' : 'wall',
    layer: /double/.test(key) ? 'double' : 'single',
    motorized: !!prof.isMotorized || /motorized/.test(family),
    label: String(prof.label || prof.name || key),
    colors,
    finials: finialsFor(key, family),
  })
}
rows.sort((a, b) => a.family.localeCompare(b.family) || a.key.localeCompare(b.key))

const j = (v) => JSON.stringify(v)
const body = rows.map((r) => `  {
    key: ${j(r.key)}, family: ${j(r.family)}, kind: ${j(r.kind)}, mount: ${j(r.mount)},
    layer: ${j(r.layer)}, motorized: ${r.motorized}, label: ${j(r.label)},
    colors: ${j(r.colors)},
    finials: ${j(r.finials)},
  },`).join('\n')

fs.writeFileSync(DEST, `// GENERATED by apps/web/scripts/build-hardware-catalog.mjs from a dump of
// AAPP library.draperyHardwareCatalog. Do not edit by hand — regenerate.
//
// WHAT IS AND ISN'T HERE
// Taxonomy, every selectable colour, and every finial each profile allows.
// Deliberately NO PRICES: every figure comes from AAPP at request time
// (variant \`drapery_hardware\`), so this table can never drift from a real
// quote. It exists only because AAPP's \`_priceDraperyHardware\` rejects a call
// with a bare \`missing_profile\` — no list of what it would accept — and
// \`libraryExport\` doesn't ship the catalog.
//
// THREE THINGS THE ENGINE MADE US LEARN THE HARD WAY:
//  1. \`colorKey\` is REQUIRED whenever the profile has a palette, but it feeds
//     NO price maths — it is a pure validation gate.
//  2. \`isTrackType\` is FALSE for every H-rail, so classifying "pole vs track"
//     off that flag puts H-rails on the pole side. We classify by FAMILY.
//  3. Some profiles carry no price at all and AAPP answers \`missing_price\`.
//     We do NOT pre-filter those: callers try every matching profile and let
//     the failures drop out, so the day someone fills those prices in,
//     quoting starts working with no code change here.

export interface HardwareChoice {
  key: string
  label: string
}

export interface HardwareProfileRow {
  key: string
  family: string
  /** What a customer would call it. H-rails count as tracks. */
  kind: 'pole' | 'track'
  mount: 'wall' | 'ceiling'
  layer: 'single' | 'double'
  motorized: boolean
  /** Internal label — for logs and designer notes, never read to a customer. */
  label: string
  /** Every colour AAPP will accept for this profile. Price-neutral. */
  colors: HardwareChoice[]
  /** Finials this profile allows. Each one AAPP prices separately. */
  finials: HardwareChoice[]
}

export const HARDWARE_PROFILES: HardwareProfileRow[] = [
${body}
]

/** Poles are never motorised in this catalog — used to skip a pointless
 *  question when the customer has already said "rod". */
export const POLE_FAMILIES = ${j(POLE_FAMILIES)}

/** First colour for a profile — satisfies the engine's gate when the customer
 *  has not picked one. Price-neutral, so this is a default, not an assumption
 *  worth disclosing. */
export function defaultColorKey(profileKey: string): string | null {
  const row = HARDWARE_PROFILES.find((p) => p.key === profileKey)
  return row && row.colors.length ? row.colors[0].key : null
}
`)

const withColors = rows.filter((r) => r.colors.length).length
const withFinials = rows.filter((r) => r.finials.length).length
console.log(`${rows.length} profiles written to ${path.relative(process.cwd(), DEST)}`)
console.log(`  ${withColors} carry a colour palette, ${withFinials} allow finials`)
console.log(`  families: ${[...new Set(rows.map((r) => r.family))].join(', ')}`)
