#!/usr/bin/env node
'use strict';
/**
 * Guards the HD product pages against the "copied a row and forgot to change
 * the number" bug — the one that shipped WET PAVEMENT with WEATHERED WHITE's
 * 932 (fixed in 2eba485).
 *
 *   node scripts/check-color-codes.js
 *
 * Two independent checks:
 *   1. Duplicate numbers inside the same block. Needs nothing but the source
 *      tree, so it always runs. Blocks are delimited by the nearest preceding
 *      `title:` / `name:` line, which keeps legitimately-reused numbers in
 *      different sections (fabric 993 vs the Hardware Color Guide's 993)
 *      from tripping the check.
 *   2. Cross-check every number against Hunter Douglas' own spec dumps, when
 *      that folder is reachable. Skipped with a notice otherwise, so the hook
 *      still works on a machine without the HD archive checked out.
 *
 * Exit 1 on any duplicate or any number that disagrees with the spec dump.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const layoutDir = path.join(repoRoot, 'apps/web/src/app/products/[slug]');
const HD_ROOTS = [
  path.resolve(repoRoot, '../Hunter Douglas/_organized'),
  path.resolve(repoRoot, '../../Hunter Douglas/_organized'),
];

// Colour NAMES repeat across product lines with different numbers ("Nickel" is
// 316 on one line and 2118 on another), so the spec cross-check is only sound
// when it is scoped to the product the page is about. A layout with no entry
// here still gets the duplicate check — it just isn't cross-checked.
// Decorative tapes are numbered in their own namespace — everwood's tape
// "973 Antique White" happily coexists with the fabric "Antique White
// Textured - 993". Cross-checking those against the fabric spec produces pure
// noise, so tape blocks get the duplicate check only. Hardware Color Guide
// blocks DO track the spec's "…Textured" series, so they stay in scope.
const SKIP_CROSSCHECK_BLOCK = /decorative tape|tape color/i;

// Open questions the sources cannot settle. Each entry waives ONE line and
// must say why, so the waiver list stays auditable instead of becoming a
// dumping ground. Clear an entry once the physical colour card is checked.
const KNOWN_UNRESOLVED = {
  // skyline_panels' book says "— 310 Nickel"; designer_screen ("• Nickel 316")
  // and designer_banded ("— Nickel 316") both say 316, and roller-skyline has
  // no book of its own so it borrows this shared Fashion Hardware palette.
  // 2 first-hand sources against 1 — too thin to rewrite the page on.
  // TODO(Eddie): check the physical hardware card, then fix the loser.
  'roller-skyline-layout.ts:344': 'hardware Nickel 316 vs skyline_panels 310 — awaiting physical card',
};

const SPEC_SCOPE = {
  'everwood-parkland-layout.ts': ['everwood', 'parkland_blinds'],
  'modern-precious-metals-layout.ts': ['modern_precious_metals'],
  'heritance-newstyle-layout.ts': ['heritance_shutters', 'newstyle_shutters'],
  'roller-skyline-layout.ts': ['designer_roller', 'skyline_panels'],
  'screen-skyline-layout.ts': ['designer_screen', 'skyline_panels'],
  'palm-beach-layout.ts': ['palm_beach'],
  'us-banded-layout.ts': ['designer_banded'],
  'applause-layout.ts': ['applause'],
  'aria-layout.ts': ['aria'],
  'silhouette-layout.ts': ['silhouette'],
  'sonnette-layout.ts': ['sonnette'],
  'provenance-layout.ts': ['provenance'],
  'nantucket-layout.ts': ['nantucket'],
  'luminette-layout.ts': ['luminette'],
  'duette-layout.ts': ['duette'],
  'pirouette-layout.ts': ['pirouette'],
  'vignette-layout.ts': ['vignette'],
  'vertical-blinds-layout.ts': ['vertical_blinds'],
  'alustra-arch-layout.ts': ['alustra_architectural'],
  'alustra-woven-layout.ts': ['alustra_woven_textures'],
};

const norm = (s) => String(s || '')
  .replace(/’/g, "'")        // HD's dumps use a curly apostrophe
  .replace(/\\'/g, "'")           // the layouts escape a straight one
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

// HD's official names carry texture suffixes the pages drop ("Snowfall
// Streaked" -> "SNOWFALL"), so index both spellings.
const aliases = (key) => {
  const out = new Set([key]);
  const stripped = key.replace(/(streaked|textured)$/, '');
  if (stripped && stripped !== key) out.add(stripped);
  return out;
};

const specRoot = HD_ROOTS.find((p) => fs.existsSync(p));
const specCache = new Map();

// Index one product line's spec dump: colour name -> the numbers HD lists.
function loadSpecFor(dirs) {
  const cacheKey = dirs.join('+');
  if (specCache.has(cacheKey)) return specCache.get(cacheKey);
  const index = new Map();
  let found = 0;
  // HD's books write the same fact four different ways depending on the page:
  //   "Wet Pavement - 993"   fabric tables
  //   "— 048 Black" / "• 689 Ash"   hardware bullet lists (number first)
  //   "— Nickel 316"                hardware bullet lists (name first)
  //   "White Diamond (126)"         luminette's parenthesised style
  // Only the first was recognised until 2026-08-12, which left 103 entries
  // looking unverifiable when their book actually did state them.
  const PATTERNS = [
    /^\s*[-—•\t ]*([A-Za-z][^\n(-]*?)\s*-\s*(\d{3,4})\s*$/gm,
    /^\s*[-—•]\s*(\d{3,4})\s+([A-Za-z][^\n]*?)\s*$/gm,
    /^\s*[-—•]\s*([A-Za-z][^\n]*?)\s+(\d{3,4})\s*$/gm,
    /^\s*([A-Za-z][^\n(]*?)\s*\((\d{3,4})\)\s*$/gm,
  ];
  const NUMBER_FIRST = new Set([1]);
  for (const dir of dirs) {
    const spec = path.join(specRoot, dir, 'ALL_SPEC.txt');
    if (!fs.existsSync(spec)) continue;
    found++;
    const text = fs.readFileSync(spec, 'utf8');
    PATTERNS.forEach((re, pi) => {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        const rawName = NUMBER_FIRST.has(pi) ? m[2] : m[1];
        const code = NUMBER_FIRST.has(pi) ? m[1] : m[2];
        const key0 = norm(rawName);
        if (!key0 || key0.length < 3) continue;
        for (const key of aliases(key0)) {
          if (!index.has(key)) index.set(key, new Set());
          index.get(key).add(code);
        }
      }
    });
  }
  const result = found ? index : null;
  specCache.set(cacheKey, result);
  return result;
}

// Both shapes the layouts use: fabric rows carry colorName + specs[], swatch
// grids carry a single "NNN Name" label.
function extractEntries(text) {
  const lines = text.split('\n');
  const out = [];
  let block = '(top)';
  lines.forEach((line, i) => {
    const heading = line.match(/^\s*(?:title|name):\s*'((?:[^'\\]|\\.)*)'/);
    if (heading) block = heading[1];
    const colorRow = line.match(/colorName:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?specs:\s*\['(\d{3,4})/);
    if (colorRow) { out.push({ line: i + 1, block, name: colorRow[1], code: colorRow[2] }); return; }
    const labelRow = line.match(/label:\s*'(\d{3,4})\s+((?:[^'\\]|\\.)*)'/);
    if (labelRow) out.push({ line: i + 1, block, name: labelRow[2], code: labelRow[1] });
  });
  return out;
}

let dupCount = 0;
let mismatchCount = 0;
let checkedAgainstSpec = 0;
let entryCount = 0;
const files = fs.readdirSync(layoutDir).filter((f) => f.endsWith('-layout.ts')).sort();

let scopedFiles = 0;
for (const file of files) {
  const entries = extractEntries(fs.readFileSync(path.join(layoutDir, file), 'utf8'));
  if (!entries.length) continue;
  entryCount += entries.length;
  const scope = SPEC_SCOPE[file];
  const spec = (specRoot && scope) ? loadSpecFor(scope) : null;
  if (spec) scopedFiles++;

  const seen = new Map();   // block|code -> first entry
  for (const e of entries) {
    const key = e.block + '|' + e.code;
    const prev = seen.get(key);
    if (prev && norm(prev.name) !== norm(e.name)) {
      dupCount++;
      console.error(`[check-color-codes] DUPLICATE ${file}:${e.line} — "${e.name}" reuses ${e.code}, already used by "${prev.name}" (line ${prev.line}) in block "${e.block}"`);
    } else if (!prev) {
      seen.set(key, e);
    }
    if (spec && !SKIP_CROSSCHECK_BLOCK.test(e.block)) {
      const known = spec.get(norm(e.name));
      if (known) {
        checkedAgainstSpec++;
        if (!known.has(e.code)) {
          const waiver = KNOWN_UNRESOLVED[file + ':' + e.line];
          if (waiver) {
            console.log(`[check-color-codes] waived ${file}:${e.line} — ${waiver}`);
            continue;
          }
          mismatchCount++;
          console.error(`[check-color-codes] MISMATCH ${file}:${e.line} — "${e.name}" says ${e.code}, spec sheet says ${[...known].sort().join('/')}`);
        }
      }
    }
  }
}

if (!specRoot) {
  console.log('[check-color-codes] note: Hunter Douglas spec dumps not found next to the repo — duplicate check only');
}
if (dupCount || mismatchCount) {
  console.error(`[check-color-codes] FAILED — ${dupCount} duplicate(s), ${mismatchCount} mismatch(es)`);
  process.exit(1);
}
console.log(`[check-color-codes] OK — ${entryCount} colour entries across ${files.length} layouts; ${checkedAgainstSpec} cross-checked against ${scopedFiles} product spec sheet(s)`);
