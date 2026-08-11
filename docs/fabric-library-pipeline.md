# Fabric library — how the data gets on the site

Three moving parts, in this order. All of them are idempotent: re-running is
always safe and always cheaper than the first run.

```
outputs/*/catalog_data.json  ┐
AAPP grouped.json (prices)   ├─► build-fabric-catalog.mjs ─► apps/web/src/data/fabrics.generated.json
outputs/fabric_webp/metrics  ┘                               (committed — this IS the library)

outputs/*/images/*.jpg ─► make-fabric-webp.py ─► outputs/fabric_webp/{thumb,large}/*.webp
                                        └─► metrics.json (swatch colour + texture)

outputs/fabric_webp ─► upload-fabric-images.mjs ─► r2://<bucket>/fabric-swatches/…
```

## 1. Images and swatch metrics

```bash
OUTPUTS_ROOT=/Volumes/SSD2T/Projects/outputs JOBS=8 \
  python3 apps/web/scripts/make-fabric-webp.py
```

Writes two WebP sizes per swatch (400px for the grid, 1600px for the detail
view, never upscaled) and `metrics.json` — the dominant colour, the average
colour, and a texture score for every image. The catalogue build reads that
file to decide colour family and Solid-vs-Texture, so **run this before the
catalogue build** whenever new images land.

Set `TIME_BUDGET=<seconds>` to make it stop early and exit 3; run it again to
continue. Files already newer than their source are skipped. 10,845 images
take a few minutes and produce about 1.9 GB.

## 2. The catalogue

```bash
node apps/web/scripts/build-fabric-catalog.mjs
```

Reads the supplier catalogues and AAPP's `handcrafted_drapery_fabric_catalog.grouped.json`,
matches them on **brand + pattern name + colour, normalised** — the same key
the pricing engine uses — and writes `apps/web/src/data/fabrics.generated.json`.

Every run prints a price-coverage report:

```
A colour-level match, priced   10022   92.4%
B fabric-level match, priced      49    0.5%
C matched, AAPP has no price     336    3.1%
D not in the AAPP library        438    4.0%
quotable now              10071 / 10845  92.9%
```

A and B get a `pricePerYard` and can be quoted instantly. C and D are
`ask_in_store` — they still appear, they can still be favourited, they just
route to a consultant. **Nothing about a run is baked in**: when the AAPP
fabric-library backfill lands a fresh `grouped.json`, re-run this script and
the C/D rows become quotable with no code change.

Inputs can be pointed elsewhere with `FABRIC_OUTPUTS_ROOT` and `AAPP_GROUPED_JSON`.

### Taxonomy

`apps/web/scripts/fabric-taxonomy.rules.json` holds every rule — material
buckets, colour-name tokens, pattern keywords, style keywords, and the CIELCh
cuts the swatch-photo colour classifier uses. Two things worth knowing:

- **The photo outranks the colour name.** Mill names are poetry: "Meadow" is
  sage, "Sky" is sage, "Persimmon" is a grey medallion, "Night" is black.
  Name-first got colour wrong ~17% of the time on a scored 100-swatch sample.
  The name-derived family is kept as a *second* searchable family, so
  "Persimmon" still turns up under Orange.
- **Style is left blank when no rule fires.** About two thirds of the library
  has no style tag, on purpose — a blank filters out cleanly, a guess misleads.

To correct one fabric, add it to `fabric-taxonomy.overrides.json` by id.
Overrides beat every rule and survive rebuilds.

`apps/web/src/data/fabric-featured.json` (the fabrics /design opens with, and
the row previewed on the Handcrafted Drapery page) is seeded once and then
**never overwritten** — edit the ids freely.

## 3. Upload to R2

```bash
set -a && . apps/web/.env.production.local && set +a
node apps/web/scripts/upload-fabric-images.mjs --dry-run
node apps/web/scripts/upload-fabric-images.mjs --only=Kaslen_Linen   # 180-file smoke test
node apps/web/scripts/upload-fabric-images.mjs
```

`.env.production.local` already carries `CLOUDFLARE_ACCOUNT_ID` and
`R2_BUCKET_NAME`; as of 2026-08-11 the two key values in it were **blank**, so
`vercel env pull` (or a fresh Object Read & Write token from the Cloudflare R2
dashboard) is the first step. The script refuses to start without them rather
than failing 21,000 times.

~21,700 objects, ~1.9 GB, uploaded 24 at a time. `--only=<substring>` filters
by object key — worth spending a minute on one supplier and eyeballing a URL
before committing to the full run. Successful keys are recorded
in `outputs/fabric_webp/.uploaded.json`, so an interrupted run resumes and a
later run only sends what's new. `--verify` checks R2 itself instead of the
local manifest; `--force` re-sends everything.

The site builds its URLs as
`$NEXT_PUBLIC_CDN_URL/fabric-swatches/{thumb,large}/<key>.webp`. The prefix is
deliberately *not* `fabrics/` — that would collide with the `/fabrics` route
when the CDN variable is unset locally.

## What the site does with it

| Path | Role |
|---|---|
| `lib/draperyFabricLibrary.ts` | server-only loader, lookups, and the compact index |
| `/api/fabrics` | the whole library, dictionary-encoded, cached a day at the edge |
| `/api/fabrics/[id]`, `/lookup`, `/featured` | detail, shortlist, and the seeded defaults |
| `/fabrics` | the grid: six filters, URL-synced, favourites in `localStorage` |
| `/design` | fabric → size → style → hardware → reference estimate |

`NEXT_PUBLIC_SHOW_FABRIC_PRICES=true` turns on the per-yard figure. It is off
by default, and off only hides that number — estimates work either way, and
the $/$$/$$$ filter always ships.


---

# Drapery hardware — the profile table

`apps/web/src/lib/draperyHardwareCatalog.generated.ts` is the taxonomy /design
picks from: every rod and track, its finishes, and the finials it allows.

```bash
# In the AAPP browser console:
#   copy(JSON.stringify(state.library.draperyHardwareCatalog))
# Paste into a file, then:
node apps/web/scripts/build-hardware-catalog.mjs ../outputs/aapp-exports/draperyHardwareCatalog.json
```

Colour and finial resolution mirror the engine's own order (`_dhcGetColors`,
`_dhcFinialsForProfile`): the product-level palette beats the subtype's, which
beats the profile's named palette; finials come from the family and are then
filtered by the subtype's `allowedFinialKeys`. **No prices cross over** — every
figure still comes from AAPP at request time.

/design sells three of AAPP's ten families (wood pole, aluminium track wall +
ceiling, H-rail), single-layer and non-motorised only. `lib/designHardware.ts`
holds that mapping.

## Why a hardware figure can differ from the sales app

`_priceDraperyHardware` builds its number from `basePriceAtMinWidth +
(billedFeet − minBillableWidthIn/12) × addPricePerFoot`, then adds finials and
accessories, and returns installation as a **separate** line —
`catalog_price_estimate` reports `listPrice` as the subtotal that *excludes*
install. So the website's hardware line is the rod plus its finials, and
nothing else. Installation is always quoted by the consultant.

The rod is billed at the **finished drapery width** (Eddie, 2026-08-11). AAPP's
own client suggests `window outerW + left clearance + right clearance` instead;
the two usually round to the same whole foot, and /design does not collect the
window measurements the other formula needs.


---

# Checking a build without being able to run one

`next build` cannot run in the Cowork sandbox (no SWC binary for linux/arm64),
so the gate is a ladder, not a single command:

```bash
cd apps/web && ../../node_modules/.bin/tsc --noEmit   # types
npx vitest run                                        # behaviour
node scripts/check-bundle.mjs                         # imports + syntax
```

`tsc` resolves `@/` through tsconfig paths, silently de-dupes ambiguous
`export *`, and never opens a JSON import — so a module that type-checks can
still fail to bundle, and that failure only shows up on Vercel.
`check-bundle.mjs` runs esbuild over every entry point with the same aliases
and catches exactly that class of thing.

It does NOT render React, so a component that throws during prerender still
gets through. A Vercel preview is still the last rung.
