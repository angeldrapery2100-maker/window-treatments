#!/usr/bin/env python3
"""Fabric image derivative pipeline (idempotent).

For every catalog row that has a local image:
  * thumb/<key>.webp  (max 400px)
  * large/<key>.webp  (max 1600px, never upscaled)
  * dominant colour + two cheap "how patterned is it" metrics -> metrics.json

Re-running skips images whose derivatives are already newer than the source,
so it is safe to run again after new fabrics land.

Usage: OUTPUTS_ROOT=/path/to/outputs python3 make_webp.py
"""
import json, os, re, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageFilter, ImageStat

ROOT = os.environ.get("OUTPUTS_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = f"{ROOT}/fabric_master_catalog_2026-08-01"
OUT = f"{ROOT}/fabric_webp"
THUMB, LARGE = f"{OUT}/thumb", f"{OUT}/large"
os.makedirs(THUMB, exist_ok=True); os.makedirs(LARGE, exist_ok=True)

def rows():
    carole = [r for r in json.load(open(f"{ROOT}/carole_full_catalog_2026-08-01/catalog_data.json"))
              if r.get("imageStatus") != "官网无图"]
    for r in carole:
        r["localImageFile"] = "images/Carole/" + os.path.basename(r["localImageFile"])
    other = json.load(open(f"{ROOT}/alendel_kaslen_2026-08-01/catalog_data.json"))
    return carole + other

def keyfor(rel):
    base = os.path.splitext(os.path.basename(rel))[0]
    sup = rel.split("/")[1] if rel.startswith("images/") else "misc"
    return f"{sup}/{re.sub(r'[^A-Za-z0-9_.-]+', '-', base)}"

def work(item):
    rel, key = item
    src = os.path.join(MASTER, rel)
    tp, lp = f"{THUMB}/{key}.webp", f"{LARGE}/{key}.webp"
    try:
        st = os.stat(src)
    except OSError:
        return (rel, None)
    fresh = all(os.path.exists(p) and os.stat(p).st_mtime >= st.st_mtime for p in (tp, lp))
    os.makedirs(os.path.dirname(tp), exist_ok=True); os.makedirs(os.path.dirname(lp), exist_ok=True)
    try:
        im = Image.open(src).convert("RGB")
    except Exception:
        return (rel, None)
    w, h = im.size
    if not fresh:
        lg = im.copy()
        if max(w, h) > 1600:
            lg.thumbnail((1600, 1600), Image.LANCZOS)
        lg.save(lp, "WEBP", quality=76, method=4)
        th = im.copy(); th.thumbnail((400, 400), Image.LANCZOS)
        th.save(tp, "WEBP", quality=80, method=4)
    sm = im.copy(); sm.thumbnail((96, 96), Image.BILINEAR)
    cw, ch = sm.size
    cc = sm.crop((int(cw*0.12), int(ch*0.12), int(cw*0.88), int(ch*0.88))) if cw > 20 and ch > 20 else sm
    stat = ImageStat.Stat(cc)
    r, g, b = [int(round(v)) for v in stat.mean]
    sd = sum(stat.stddev) / 3.0
    edge = ImageStat.Stat(cc.convert("L").filter(ImageFilter.FIND_EDGES)).mean[0]
    q = cc.quantize(colors=6, method=Image.MEDIANCUT)
    pal = q.getpalette()
    npx = float(cc.size[0] * cc.size[1])
    clusters = []
    for cnt, idx in sorted(q.getcolors(), reverse=True)[:5]:
        clusters.append([pal[idx*3], pal[idx*3+1], pal[idx*3+2], round(cnt / npx, 3)])
    dr, dg, db, share = clusters[0] if clusters else (r, g, b, 0.0)
    return (rel, {"key": key, "w": w, "h": h,
                  "mean": [r, g, b], "dom": [dr, dg, db], "domShare": share, "pal": clusters,
                  "sd": round(sd, 2), "edge": round(edge, 2)})

def main():
    import time
    t0 = time.time()
    budget = float(os.environ.get("TIME_BUDGET", "0")) or None
    mpath = f"{OUT}/metrics.json"
    metrics = {}
    if os.path.exists(mpath):
        try: metrics = json.load(open(mpath))
        except Exception: metrics = {}
    seen, uniq = set(), []
    for r in rows():
        rel = r.get("localImageFile") or ""
        if rel and rel not in seen:
            seen.add(rel); uniq.append((rel, keyfor(rel)))
    total = len(uniq)
    todo = [it for it in uniq if it[0] not in metrics or not _fresh(it)]
    print(f"[webp] {total} source images, {len(todo)} still to do", flush=True)
    done, stopped = 0, False
    BATCH = 240
    with ProcessPoolExecutor(max_workers=int(os.environ.get("JOBS", "6"))) as ex:
        for i in range(0, len(todo), BATCH):
            for rel, m in ex.map(work, todo[i:i+BATCH], chunksize=20):
                done += 1
                if m: metrics[rel] = m
            print(f"[webp] {done}/{len(todo)} this run ({len(metrics)}/{total} overall)", flush=True)
            if budget and time.time() - t0 > budget:
                stopped = True; break
    failed = [rel for rel, _ in uniq if rel not in metrics]
    if failed:
        json.dump(failed, open(f"{OUT}/unreadable.json", "w"), indent=1)
    tmp = mpath + ".tmp"
    json.dump(metrics, open(tmp, "w")); os.replace(tmp, mpath)
    if stopped:
        print(f"[webp] PAUSED {len(metrics)}/{total} — run again to continue", flush=True)
        sys.exit(3)
    print(f"[webp] DONE {len(metrics)}/{total} ({len(failed)} unreadable)", flush=True)


def _fresh(item):
    rel, key = item
    src = os.path.join(MASTER, rel)
    try: st = os.stat(src)
    except OSError: return True
    return all(os.path.exists(p) and os.stat(p).st_mtime >= st.st_mtime
               for p in (f"{THUMB}/{key}.webp", f"{LARGE}/{key}.webp"))


if __name__ == "__main__":
    main()
