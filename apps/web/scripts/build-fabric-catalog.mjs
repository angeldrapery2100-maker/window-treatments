#!/usr/bin/env node
/**
 * Build the drapery fabric library the website ships.
 *
 *   node apps/web/scripts/build-fabric-catalog.mjs
 *
 * Inputs (all outside this repo — nothing here is checked in):
 *   $FABRIC_OUTPUTS_ROOT   default ../outputs relative to the repo root
 *     carole_full_catalog_2026-08-01/catalog_data.json
 *     alendel_kaslen_2026-08-01/catalog_data.json
 *     fabric_webp/metrics.json          (optional — swatch colour + texture)
 *   $AAPP_GROUPED_JSON     default ../AAPP/data/handcrafted_drapery_fabric_catalog.grouped.json
 *
 * Output:
 *   apps/web/src/data/fabrics.generated.json
 *
 * IDEMPOTENT AND SNAPSHOT-FREE. Nothing about this run's prices is baked in:
 * the AAPP catalogue is read fresh every time and matched on brand + pattern +
 * colour, exactly the way the pricing engine keys its own library. When the
 * AAPP fabric-library backfill lands a new grouped.json, re-run this script and
 * the `ask_in_store` rows turn into priced ones with no code change.
 *
 * Taxonomy rules live in fabric-taxonomy.rules.json; per-fabric corrections in
 * fabric-taxonomy.overrides.json (overrides always win).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(HERE, '..')
const REPO = path.resolve(WEB, '../..')
const OUTPUTS = process.env.FABRIC_OUTPUTS_ROOT || path.resolve(REPO, '../outputs')
const GROUPED = process.env.AAPP_GROUPED_JSON ||
  path.resolve(REPO, '../AAPP/data/handcrafted_drapery_fabric_catalog.grouped.json')
const DEST = path.join(WEB, 'src/data/fabrics.generated.json')

const rules = readJson(path.join(HERE, 'fabric-taxonomy.rules.json'))
const overrides = readJson(path.join(HERE, 'fabric-taxonomy.overrides.json')).fabrics || {}

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')) }
function readJsonIf(p) { try { return readJson(p) } catch { return null } }

// ── normalisation ───────────────────────────────────────────────────────────
/** Same key shape the AAPP catalogue uses, so the two libraries line up. */
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const words = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const BRAND_KEY = { 'Carole': 'carole', 'Alendel': 'alendel', 'Kaslen Textiles': 'kaslen', 'Kaslen': 'kaslen', 'RSC': 'rsc' }
const BRAND_LABEL = { carole: 'Carole', alendel: 'Alendel', kaslen: 'Kaslen Textiles', rsc: 'RSC' }

const titleCase = (s) => String(s || '').toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())
  .replace(/\b(Ii|Iii|Iv|Vi|Vii|Viii|Ix|Xi|Xii)\b/g, (m) => m.toUpperCase())

/** '13 1/2"' -> 13.5 ; '54 In' -> 54 ; '' -> null */
function inches(raw) {
  const s = String(raw || '').replace(/[”″]/g, '"')
  const m = s.match(/(\d+)\s+(\d+)\s*\/\s*(\d+)/) || s.match(/(\d+)\s*\/\s*(\d+)/) || s.match(/(\d+(?:\.\d+)?)/)
  if (!m) return null
  let v
  if (m.length === 4) v = Number(m[1]) + Number(m[2]) / Number(m[3])
  else if (m.length === 3) v = Number(m[1]) / Number(m[2])
  else v = Number(m[1])
  return Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null
}

/** '27" V, 13 1/2" H HD' -> { v: 27, h: 13.5 } ; '3 1/2" H' -> { v: null, h: 3.5 } */
function parseRepeat(raw) {
  const s = String(raw || '').replace(/[”″]/g, '"')
  if (!s.trim()) return { v: null, h: null }
  const grab = (letter) => {
    const m = s.match(new RegExp('([0-9]+(?:\\s+[0-9]+\\s*/\\s*[0-9]+)?(?:\\.[0-9]+)?)\\s*"?\\s*' + letter + '\\b', 'i'))
    return m ? inches(m[1]) : null
  }
  return { v: grab('V'), h: grab('H') }
}

// ── sources ─────────────────────────────────────────────────────────────────
function loadCatalog() {
  const carole = readJson(path.join(OUTPUTS, 'carole_full_catalog_2026-08-01/catalog_data.json'))
    .filter((r) => r.imageStatus !== '官网无图')
    .map((r) => ({ ...r, supplier: 'Carole', localImageFile: 'images/Carole/' + path.basename(r.localImageFile || '') }))
  const rest = readJson(path.join(OUTPUTS, 'alendel_kaslen_2026-08-01/catalog_data.json'))
  return [...carole, ...rest]
}

/** brand::fabricNorm -> { defaultPrice, defaultWidth, colors: Map(colorNorm -> row) } */
function loadAappIndex() {
  const src = readJson(GROUPED)
  const byFabric = new Map()
  for (const f of src.fabrics || []) {
    const bk = BRAND_KEY[f.brand] || norm(f.brand)
    const key = `${bk}::${norm(f.fabric_name)}`
    const colors = new Map()
    for (const c of f.colors || []) {
      const row = { price: numOrNull(c.price_per_yard), width: numOrNull(c.width_normalized_in), colorId: c.color_id }
      for (const alias of [c.color_name, c.color_code]) {
        const k = norm(alias)
        if (k && !colors.has(k)) colors.set(k, row)
      }
    }
    byFabric.set(key, {
      defaultPrice: numOrNull(f.default_price_per_yard),
      defaultWidth: numOrNull(f.default_width_in),
      fabricId: f.fabric_id,
      colors,
    })
  }
  return { byFabric, generatedAt: src.generated_at, summary: src.overall_summary }
}
const numOrNull = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : null)

// ── taxonomy ────────────────────────────────────────────────────────────────
const hasWord = (haystack, token) =>
  token.includes(' ') ? haystack.includes(token) : new RegExp(`\\b${token}\\b`).test(haystack)

function materialClass(row) {
  const mat = words(row.material)
  const ctx = `${mat} ${words(row.patternName)} ${words(row.book)}`
  for (const rule of rules.materialClasses) {
    if (rule.match) {
      const hay = (rule.from || ['material']).map((f) => words(row[f])).join(' ')
      if (rule.match.some((t) => hasWord(hay, t))) return rule.class
    }
    if (rule.minShare) {
      for (const [fibre, pct] of Object.entries(rule.minShare)) {
        const re = new RegExp(`(\\d+)\\s*%?\\s*${fibre.toLowerCase().replace(/\s+/g, '\\s+')}`)
        const m = mat.match(re)
        if (m && Number(m[1]) >= pct) return rule.class
      }
    }
    void ctx
  }
  return rules.materialFallback
}

/** Longest colour token wins, so "winter white" beats "white". */
const COLOR_TOKENS = Object.entries(rules.colorFamilies)
  .flatMap(([family, tokens]) => tokens.map((t) => ({ family, t })))
  .sort((a, b) => b.t.length - a.t.length)

function colorFromName(colorName) {
  const hay = words(colorName)
  if (!hay) return null
  for (const { family, t } of COLOR_TOKENS) if (hasWord(hay, t)) return family
  return null
}

/**
 * Colour family from a swatch photo — nearest anchor in CIELab.
 *
 * WHY THE PHOTO OUTRANKS THE NAME
 * Mill colour names are poetry, not description: "Meadow" is sage, "Sky" is
 * sage, "Persimmon" is a grey medallion on white, "Night" is black, "Straw" is
 * gold. Scored by eye over a fixed 100-swatch sample, name-first got colour
 * wrong ~17% of the time. So the photo decides the family we SHOW, and the
 * name-derived family — when it differs — is kept as a second searchable
 * family, so "Persimmon" still turns up under Orange.
 *
 * WHY ANCHORS AND NOT HSL BANDS
 * Hand-cut HSL bands kept failing on exactly the colours a drapery book is made
 * of: HSL saturation explodes at high lightness, so ivory came out "Yellow",
 * and every warm neutral needed another threshold. Nearest-anchor in Lab has
 * one knob — add a representative colour to fabric-taxonomy.rules.json when a
 * real swatch lands in the wrong bucket.
 */
function rgbToLab(rgb) {
  const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
  const [r, g, b] = rgb.map(f)
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722)
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const k = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [k(x), k(y), k(z)]
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}
const deltaE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))

/** CIELCh — chroma tells neutral from coloured, hue names the colour. */
function toLch(rgb) {
  const [L, a, b] = rgbToLab(rgb)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) h += 360
  return { L, C: Math.hypot(a, b), h }
}

function familyFromRgb(rgb) {
  if (!rgb || rgb.length < 3) return null
  const { L, C, h } = toLch(rgb)
  const t = rules.colorThresholds

  // 0. Dark enough that the hue is a rumour. A navy at L=11 reads black to
  //    everyone, and calling it Blue put it in the wrong filter.
  if (L <= t.veryDarkMaxL) return 'Black'

  // 1. Dead neutral — no hue worth reading at all.
  if (C < t.greyMaxChroma) return L >= t.whiteMinL ? 'White' : (L >= t.blackMaxL ? 'Grey' : 'Black')

  // (Order matters: the warm test runs BEFORE the tinted-grey test, because a
  //  cream at chroma 4 is a cream, not a grey — and half this library is that.)

  // 2. The warm corridor — cream, beige, taupe and brown are all low-chroma
  //    slices of the same hues as orange and yellow, so they split on
  //    lightness and chroma rather than hue. Half this library lives here:
  //    the median swatch photo has a chroma of about 7.
  // The corridor reaches further round the wheel for near-neutrals than for
  // colours: an ivory can sit at hue 102 and is still an ivory, while anything
  // with real chroma out there is sage.
  const warmHigh = C < t.warmNeutralChromaMax ? t.warmNeutralHueHigh : t.warmHueHigh
  if (h >= t.warmHueLow && h < warmHigh) {
    if (C >= t.warmSaturated) {
      if (L < t.brownMaxL) return 'Brown'
      return h < t.orangeHueHigh ? 'Orange' : 'Yellow'
    }
    // Sage and olive live at the top of the corridor. They need real colour
    // AND real depth — a cream satin whose fold shadow lands at the same hue
    // is not a green fabric.
    if (h >= t.sageHueLow && C >= t.sageMinChroma && L <= t.sageMaxL) return 'Green'
    // White is a much narrower door here than elsewhere: a warm-tinted
    // near-white at chroma 6 is an ivory, and filing it under White hides it
    // from everyone shopping for cream. Only a brighter swatch earns a little
    // more chroma before it stops being white.
    if (L >= t.whiteMinL && C < (L >= t.warmWhiteBrightL ? t.warmWhiteBrightChroma : t.warmWhiteMaxChroma)) return 'White'
    if (L >= t.creamMinL) return C < t.creamMaxChroma ? 'Cream' : 'Beige'
    if (L >= t.midNeutralMinL) return C < t.taupeMaxChroma ? 'Taupe' : 'Beige'
    if (L >= t.brownMaxL) return C < t.taupeMaxChroma ? 'Taupe' : 'Brown'
    return 'Brown'
  }

  // 3. Barely-tinted greys — a hue this weak outside the warm corridor is not
  //    a colour a customer would shop by.
  if (C < t.tintedGreyMaxChroma) return L >= t.whiteMinL ? 'White' : (L >= t.blackMaxL ? 'Grey' : 'Black')

  // 4. Properly coloured. Hue angles are CIELab's, not HSL's: red sits near
  //    40°, yellow near 100°, green near 135°, blue near 270°, magenta near 340°.
  if (h < t.warmHueLow) return L < t.brownMaxL ? 'Brown' : (L >= t.pinkMinL ? 'Pink' : 'Red')
  if (h < t.greenHueLow) return 'Yellow'
  if (h < t.tealHueLow) return 'Green'
  if (h < t.blueHueLow) return 'Teal'
  if (h < t.purpleHueLow) return 'Blue'
  if (h < t.pinkHueLow) return 'Purple'
  return L < t.brownMaxL ? 'Purple' : 'Pink'
}

const CHROMATIC = new Set(['Blue', 'Teal', 'Green', 'Yellow', 'Orange', 'Red', 'Pink', 'Purple'])

/** Primary family first; the rest are alternates the filter also matches on. */
function colorFamiliesFor(row, metric) {
  const fromName = colorFromName(row.color)
  let fromImage = null, fromAverage = null, multi = false
  if (metric) {
    fromImage = familyFromRgb(metric.dom)
    // Second opinion: the average colour of the whole crop. On a print the
    // dominant cluster is the motif and the average is the ground (or the
    // reverse) — keeping both is what makes a cream damask with a sage motif
    // findable under either.
    fromAverage = familyFromRgb(metric.mean)
    const t = rules.multiColor
    const sig = (metric.pal || []).filter((c) => c[3] >= t.minClusterShare)
    // Keep only clusters that are perceptually far apart, so a pale
    // tone-on-tone print cannot quantise into three fake "colours".
    const kept = []
    for (const c of sig) {
      const lab = rgbToLab(c)
      if (kept.every((k) => deltaE(lab, k.lab) >= t.minDeltaE)) kept.push({ lab, family: familyFromRgb(c) })
    }
    const fams = new Set(kept.map((k) => k.family).filter((f) => f && CHROMATIC.has(f)))
    multi = fams.size >= t.minDistinctHues
  }
  const primary = multi ? 'Multi' : (fromImage || fromName)
  const all = []
  for (const f of [primary, fromImage, fromAverage, fromName]) if (f && !all.includes(f)) all.push(f)
  return { primary: primary || null, all, source: multi ? 'multi' : (fromImage ? 'image' : (fromName ? 'name' : 'none')) }
}

function patternType(row, metric) {
  const hay = [words(row.patternName), words(row.book), words(row.additionalNotes)].join(' ')
  for (const rule of rules.patternTypes) if (rule.match.some((t) => hasWord(hay, t))) return rule.type
  const rep = parseRepeat(row.repeat)
  const repMax = Math.max(rep.v || 0, rep.h || 0)
  const t = rules.textureThresholds
  // A repeat under a couple of inches is a weave, not a motif — call it texture
  // unless the photo says otherwise.
  if (repMax >= t.motifRepeatIn) return rules.patternFallback
  if (!metric) return repMax > 0 ? 'Texture' : 'Solid'
  // EDGE, not overall variance. A plain satin photographed with a fold has a
  // huge standard deviation and no detail; a print has detail. Scoring by eye,
  // sd called teal satin "Print" and pale mint "Texture" — edge gets both right.
  if (metric.edge <= t.solidMaxEdge) return 'Solid'
  if (metric.edge <= t.textureMaxEdge) return 'Texture'
  return rules.patternFallback
}

function styleOf(row) {
  // patternName + book only. Reading style off the fibre content ("linen"
  // => Casual, "silk" => Luxury) tagged a third of the library off one word.
  const hay = [words(row.patternName), words(row.book)].join(' ')
  for (const rule of rules.styles) if (rule.match.some((t) => hasWord(hay, t))) return rule.style
  return null
}

function isSheer(row) {
  if (String(row.yarnFabric || '').includes('纱')) return true
  const hay = [words(row.book), words(row.patternName)].join(' ')
  return rules.sheerBooks.some((t) => hasWord(hay, t))
}

const imageKey = (rel) => {
  if (!rel) return null
  const base = path.basename(rel).replace(/\.[^.]+$/, '')
  const sup = rel.startsWith('images/') ? rel.split('/')[1] : 'misc'
  return `${sup}/${base.replace(/[^A-Za-z0-9_.-]+/g, '-')}`
}

// ── build ───────────────────────────────────────────────────────────────────
function main() {
  const catalog = loadCatalog()
  const aapp = loadAappIndex()
  const metrics = readJsonIf(path.join(OUTPUTS, 'fabric_webp/metrics.json')) || {}
  const hasMetrics = Object.keys(metrics).length > 0

  const tally = { A: 0, B: 0, C: 0, D: 0 }
  const colorSource = { image: 0, multi: 0, name: 0, none: 0 }
  const seenIds = new Map()
  const out = []

  for (const row of catalog) {
    const brand = BRAND_KEY[row.supplier] || norm(row.supplier)
    const fabricKey = `${brand}::${norm(row.patternName)}`
    const colorKey = norm(row.color)
    const entry = aapp.byFabric.get(fabricKey)
    const colorRow = entry ? entry.colors.get(colorKey) : null

    let pricePerYard = null, tier, aappColorId = null, aappWidth = null
    if (colorRow && colorRow.price != null) {
      tier = 'A'; pricePerYard = colorRow.price; aappColorId = colorRow.colorId; aappWidth = colorRow.width
    } else if (entry && !colorRow && entry.defaultPrice != null) {
      tier = 'B'; pricePerYard = entry.defaultPrice; aappWidth = entry.defaultWidth
    } else if (entry) {
      tier = 'C'; aappColorId = colorRow ? colorRow.colorId : null
      aappWidth = colorRow ? colorRow.width : entry.defaultWidth
    } else {
      tier = 'D'
    }
    tally[tier]++

    // Base id follows the AAPP color_id rule (brand::fabric::colour) so the two
    // libraries can be reconciled by eye; a numeric suffix only ever appears
    // when one brand really does ship the same pattern+colour twice.
    let id = `${brand}::${slug(row.patternName)}::${slug(row.color)}`
    const dup = seenIds.get(id)
    if (dup) { seenIds.set(id, dup + 1); id = `${id}-${dup + 1}` } else seenIds.set(id, 1)

    const rel = row.localImageFile || ''
    const metric = metrics[rel] || null
    const rep = parseRepeat(row.repeat)
    const ov = overrides[id] || {}

    const colors = colorFamiliesFor(row, metric)
    colorSource[colors.source] = (colorSource[colors.source] || 0) + 1
    const colorFamily = ov.colorFamily || colors.primary
    const colorFamilies = ov.colorFamily ? [ov.colorFamily] : colors.all

    out.push({
      id,
      brand: BRAND_LABEL[brand] || row.supplier,
      sku: String(row.sku || ''),
      name: titleCase(row.patternName),
      color: titleCase(row.color),
      book: titleCase(row.book || row.category || ''),
      origin: row.origin || '',
      material: row.material || '',
      materialClass: ov.materialClass || materialClass(row),
      colorFamily: colorFamily || null,
      colorFamilies,
      patternType: ov.patternType || patternType(row, metric),
      style: ov.style !== undefined ? ov.style : styleOf(row),
      sheer: ov.sheer !== undefined ? ov.sheer : isSheer(row),
      widthIn: aappWidth || inches(row.width),
      repeatVIn: rep.v,
      repeatHIn: rep.h,
      img: metric ? metric.key : imageKey(rel),
      swatchRgb: metric && metric.dom ? rgbHex(metric.dom) : null,
      pricePerYard,
      priceStatus: pricePerYard != null ? 'ready' : 'ask_in_store',
      priceTier: tier,
      aappColorId,
    })
  }

  // Price bands — quartiles over everything that has a price, recomputed each run.
  const priced = out.filter((f) => f.pricePerYard != null).map((f) => f.pricePerYard).sort((a, b) => a - b)
  const q = (p) => priced[Math.min(priced.length - 1, Math.floor(priced.length * p))]
  const cuts = [q(0.25), q(0.5), q(0.75)]
  for (const f of out) {
    if (f.pricePerYard == null) { f.priceBand = null; continue }
    const i = cuts.findIndex((c) => f.pricePerYard <= c)
    f.priceBand = rules.priceBands.labels[i === -1 ? 3 : i]
  }

  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    aappSnapshot: aapp.generatedAt || null,
    priceBandCuts: cuts,
    count: out.length,
    fabrics: out.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name) || a.color.localeCompare(b.color)),
  }
  fs.mkdirSync(path.dirname(DEST), { recursive: true })
  fs.writeFileSync(DEST, JSON.stringify(payload))
  writeFeaturedIfMissing(out)

  // ── report ────────────────────────────────────────────────────────────────
  const readyCount = out.filter((f) => f.priceStatus === 'ready').length
  const pct = (n) => `${((n / out.length) * 100).toFixed(1)}%`
  console.log(`\nfabrics.generated.json — ${out.length} colourways, ${(fs.statSync(DEST).size / 1e6).toFixed(2)} MB`)
  console.log(`AAPP snapshot: ${aapp.generatedAt || 'unknown'}`)
  console.log('\nPRICE COVERAGE')
  console.log(`  A colour-level match, priced   ${tally.A}\t${pct(tally.A)}`)
  console.log(`  B fabric-level match, priced   ${tally.B}\t${pct(tally.B)}`)
  console.log(`  C matched, AAPP has no price   ${tally.C}\t${pct(tally.C)}`)
  console.log(`  D not in the AAPP library      ${tally.D}\t${pct(tally.D)}`)
  console.log(`  ---------------------------------------------`)
  console.log(`  quotable now                   ${readyCount} / ${out.length}\t${pct(readyCount)}`)
  console.log(`  price bands ($ | $$ | $$$ | $$$$) cut at  $${cuts.join(' / $')} per yard`)
  console.log(`\nTAXONOMY`)
  console.log(`  colour: ${colorSource.image} from swatch photo, ${colorSource.multi} multi-colour, ${colorSource.name} from name only, ${colorSource.none} unlabelled`)
  const alt = out.filter((f) => f.colorFamilies.length > 1).length
  console.log(`  ${alt} fabrics carry a second searchable colour family (photo and colour name disagree)`)
  if (!hasMetrics) console.log('  ! fabric_webp/metrics.json not found — colour fallback and Solid/Texture split are degraded')
  for (const dim of ['materialClass', 'patternType', 'style', 'colorFamily']) {
    const c = {}
    for (const f of out) { const k = f[dim] || '(blank)'; c[k] = (c[k] || 0) + 1 }
    const top = Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')
    console.log(`  ${dim}: ${top}`)
  }
  console.log(`  images missing: ${out.filter((f) => !f.img).length}`)
  console.log(`  hand overrides applied: ${Object.keys(overrides).length}\n`)
}

/**
 * The handful of fabrics /design shows to a visitor who has not favourited
 * anything yet. Written ONCE, then left alone — this is a file Eddie edits, so
 * a rebuild must never silently overwrite his picks.
 */
function writeFeaturedIfMissing(all) {
  const dest = path.join(WEB, 'src/data/fabric-featured.json')
  if (fs.existsSync(dest)) {
    const cur = readJsonIf(dest)
    if (cur && Array.isArray(cur.ids) && cur.ids.length) {
      const known = new Set(all.map((f) => f.id))
      const gone = [...cur.ids, ...(cur.sheerIds || [])].filter((id) => !known.has(id))
      if (gone.length) console.log(`  ! fabric-featured.json lists ${gone.length} id(s) that no longer exist: ${gone.join(', ')}`)
      return
    }
  }
  // Pick: quotable, has a photo, has a width, plain enough to read as a
  // starting point, mid-priced, and spread across colour families so the
  // opening row of /design isn't eight beiges.
  const quotable = (f) => f.priceStatus === 'ready' && f.img && f.widthIn &&
    (f.patternType === 'Solid' || f.patternType === 'Texture')
  const pool = all.filter((f) => quotable(f) && !f.sheer && (f.priceBand === '$$' || f.priceBand === '$$$'))
  // Sheers are a much smaller, cheaper population, so they get their own pool
  // rather than being filtered out of the drapery one by accident.
  const sheerPool = all.filter((f) => quotable(f) && f.sheer)
  const want = ['Cream', 'Grey', 'Taupe', 'White', 'Blue', 'Green', 'Beige', 'Black']
  const ids = [], usedPattern = new Set()
  for (const fam of want) {
    // Take from the middle of each family and never repeat a pattern name, so
    // the row reads as eight different fabrics rather than eight colourways of
    // whatever sorts first alphabetically.
    const fam4 = pool.filter((f) => f.colorFamily === fam && !usedPattern.has(f.brand + f.name))
    const pick = fam4[Math.floor(fam4.length / 2)]
    if (pick) { ids.push(pick.id); usedPattern.add(pick.brand + pick.name) }
  }
  for (const f of pool) {
    if (ids.length >= 8) break
    if (!usedPattern.has(f.brand + f.name)) { ids.push(f.id); usedPattern.add(f.brand + f.name) }
  }
  const sheerIds = [], usedSheer = new Set()
  for (const fam of ['White', 'Cream', 'Grey', 'Taupe', 'Beige', 'Blue']) {
    const pick = sheerPool.filter((f) => f.colorFamily === fam && !usedSheer.has(f.brand + f.name))[0]
    if (pick) { sheerIds.push(pick.id); usedSheer.add(pick.brand + pick.name) }
  }
  for (const f of sheerPool) {
    if (sheerIds.length >= 6) break
    if (!usedSheer.has(f.brand + f.name)) { sheerIds.push(f.id); usedSheer.add(f.brand + f.name) }
  }
  fs.writeFileSync(dest, JSON.stringify({
    _doc: 'Fabrics /design offers a visitor who has not favourited anything yet — `ids` are drapery fabrics, `sheerIds` are sheers for the second layer. Seeded once by build-fabric-catalog.mjs and never overwritten: edit freely. Order is the order shown.',
    ids,
    sheerIds,
  }, null, 2) + '\n')
  console.log(`  seeded fabric-featured.json with ${ids.length} default fabrics and ${sheerIds.length} sheers`)
}

const rgbHex = (rgb) => '#' + rgb.map((v) => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join('')

main()
