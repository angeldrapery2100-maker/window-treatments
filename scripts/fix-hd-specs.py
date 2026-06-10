#!/usr/bin/env python3
"""
Re-extract fabric swatch spec codes from Hunter Douglas digital sample book
PDFs, pairing each color with ITS OWN codes by page geometry.

Background: the original extraction assigned every spec code on a page to
every color on that page (682 duplicate groups across 14 products). The JSON
swatch image filenames encode their origin (pageNNN_imgMM_WxH.jpeg), so for
each color we can revisit the exact PDF page, split it into columns by the
swatch image bounding boxes, locate the color name in a column, and take only
that column's spec lines.

Safety rails:
  - never invent codes: every re-extracted spec line must literally appear in
    the page's text (and we report when it wasn't in the OLD page-union data)
  - colors we cannot confidently pair keep specs = [] (frontend hides those)
  - originals are not touched; corrected JSONs go to a sibling output dir

Usage: python3 scripts/fix-hd-specs.py [slug ...]   (default: all)
"""
import json, re, sys, glob, os, unicodedata, collections
import pdfplumber

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_DIR = os.path.join(ROOT, 'Hunter Douglas Pictures PDF')
JSON_DIR = os.path.join(ROOT, 'apps/web/public/hunter-douglas/products')
OUT_DIR = os.path.join(ROOT, 'apps/web/public/hunter-douglas/products-fixed')
os.makedirs(OUT_DIR, exist_ok=True)

IMG_RE = re.compile(r'page(\d+)_img(\d+)_')

def norm(s: str) -> str:
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(ch for ch in s if not unicodedata.combining(ch))
    return re.sub(r'[^a-z0-9]', '', s.lower())

def lines_from_words(words, ytol=3):
    """Group words into lines by 'top'."""
    lines = []
    for w in sorted(words, key=lambda w: (w['top'], w['x0'])):
        if lines and abs(w['top'] - lines[-1][0]) <= ytol:
            lines[-1][1].append(w)
        else:
            lines.append([w['top'], [w]])
    return [(top, sorted(ws, key=lambda w: w['x0'])) for top, ws in lines]

def page_columns(page):
    """Column x-ranges from swatch image bboxes (sorted reading order)."""
    # >200pt on both axes: keeps real swatches, drops small inset/detail images
    # (e.g. silhouette pages have 128pt insets that would corrupt column splits)
    imgs = [i for i in page.images if (i['x1'] - i['x0']) > 200 and (i['bottom'] - i['top']) > 200]
    imgs.sort(key=lambda i: (round(i['top'] / 50), i['x0']))  # rows, then left→right
    return imgs

def extract_page(page):
    """Return list of (img_index_1based, color_name_norm→specs) candidates:
       [{'x0','x1','name_words','spec_lines'}] one per column."""
    imgs = page_columns(page)
    if not imgs:
        return []
    words = page.extract_words()
    # text below the lowest image bottom (caption block)
    img_bottom = max(i['bottom'] for i in imgs)
    caption_words = [w for w in words if w['top'] >= img_bottom - 5]
    if not caption_words:
        return []
    # column boundaries from image x-centers
    cols = []
    xs = sorted(set((i['x0'], i['x1']) for i in imgs), key=lambda t: t[0])
    for idx, (x0, x1) in enumerate(xs):
        left = (xs[idx - 1][1] + x0) / 2 if idx > 0 else -1e9
        right = (x1 + xs[idx + 1][0]) / 2 if idx + 1 < len(xs) else 1e9
        cols.append({'imgno': idx + 1, 'left': left, 'right': right, 'lines': []})
    for top, ws in lines_from_words(caption_words):
        bucket = collections.defaultdict(list)
        for w in ws:
            for c in cols:
                if c['left'] <= w['x0'] < c['right']:
                    bucket[c['imgno']].append(w)
                    break
        for imgno, cws in bucket.items():
            cols[imgno - 1]['lines'].append(' '.join(w['text'] for w in cws))
    return cols

def fix_product(slug):
    jpath = os.path.join(JSON_DIR, f'{slug}.json')
    ppath = os.path.join(PDF_DIR, f'hd-{slug}-digital-sample-book.pdf')
    if not (os.path.exists(jpath) and os.path.exists(ppath)):
        return None
    data = json.load(open(jpath))
    fsw = data.get('fabric_swatches') or {}
    pdf = pdfplumber.open(ppath)
    page_cache = {}
    stats = collections.Counter()
    report = []

    for coll, colors in fsw.items():
        if not isinstance(colors, list):
            continue
        for c in colors:
            stats['colors'] += 1
            m = IMG_RE.match(c.get('image') or '')
            name = (c.get('color_name') or '').strip()
            old_specs = list(c.get('specs') or [])
            if not m or not name:
                stats['skipped_no_anchor'] += 1
                c['specs'] = []
                continue
            # junk pseudo-colors from the old extraction: name is actually a
            # spec code like 'A70-905 (4")' — never pair these, keep specs empty
            if re.match(r'^[A-Z]{1,3}\d{2,}[-/]', name) or re.match(r'^color \d+$', name, re.I) or name.upper() in ('N/A', 'TM'):
                stats['junk_name'] += 1
                c['specs'] = []
                continue
            pageno = int(m.group(1))
            if pageno < 1 or pageno > len(pdf.pages):
                stats['skipped_bad_page'] += 1
                c['specs'] = []
                continue
            if pageno not in page_cache:
                page_cache[pageno] = extract_page(pdf.pages[pageno - 1])
            cols = page_cache[pageno]
            # find the column whose caption starts with this color name
            target = None
            nname = norm(name)
            for col in cols:
                joined = norm(' '.join(col['lines']))
                first_line = norm(col['lines'][0]) if col['lines'] else ''
                if first_line.startswith(nname) or joined.startswith(nname):
                    target = col
                    break
            if target is None:
                # fallback: name appears anywhere in exactly one column
                hits = [col for col in cols if nname and nname in norm(' '.join(col['lines']))]
                if len(hits) == 1:
                    target = hits[0]
            if target is None:
                stats['unmatched_name'] += 1
                report.append(f'  ?? {coll} / {name} (page {pageno}): name not found in any column')
                c['specs'] = []
                continue
            # specs = caption lines minus the leading color-name words
            text = ' \n'.join(target['lines'])
            # remove the name (case-insensitive, at start)
            spec_lines = []
            for li, line in enumerate(target['lines']):
                t = line
                if li == 0:
                    # strip leading name words
                    acc, rest = '', t
                    while rest and not norm(acc).startswith(nname):
                        head, _, rest2 = rest.partition(' ')
                        acc += head
                        rest = rest2
                        if norm(acc) == nname:
                            break
                    t = rest if norm(acc) == nname else t
                t = t.strip()
                if t:
                    spec_lines.append(t)
            # drop page-number artifacts and other non-spec fragments:
            # a real spec line has letters and is longer than a couple chars
            new_specs = [s for s in spec_lines
                         if s and len(s) > 3 and re.search(r'[A-Za-z]', s)
                         and not re.fullmatch(r'[\d\s./-]+', s)]
            c['specs'] = new_specs
            stats['fixed'] += 1
            if new_specs and old_specs and not any(any(ns in os_ or os_ in ns for os_ in old_specs) for ns in new_specs):
                stats['no_overlap_with_old'] += 1
                report.append(f'  !! {coll} / {name} (page {pageno}): new specs share nothing with old page union: {new_specs[:2]}')

    out = os.path.join(OUT_DIR, f'{slug}.json')
    json.dump(data, open(out, 'w'), ensure_ascii=False, indent=1)
    return slug, dict(stats), report

def main():
    slugs = sys.argv[1:] or sorted(
        os.path.basename(f)[:-5] for f in glob.glob(os.path.join(JSON_DIR, '*.json'))
    )
    for slug in slugs:
        r = fix_product(slug)
        if not r:
            print(f'-- {slug}: missing PDF or JSON, skipped')
            continue
        slug, stats, report = r
        print(f'== {slug}: {stats}')
        for line in report[:8]:
            print(line)
        if len(report) > 8:
            print(f'  ... {len(report)-8} more warnings')

if __name__ == '__main__':
    main()
