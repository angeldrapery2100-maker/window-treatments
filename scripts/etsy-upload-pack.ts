/**
 * Etsy 上传包 —— 把 etsy-price-grid 的结果整理成「当前 3 条在售 listing」可直接照抄的表。
 *
 * 变体结构(Etsy 每条 listing 只有 2 个变体维度,上限是两维选项数之和 ≤70):
 *   Spot Linen  : Size(14) × Liner(3) = 17 个选项 → 褶型没位置,统一按【3-Fold Pinch】定价(取两种褶型中较高者)
 *   两条纱帘     : Size(24) × Pleat Style(4) = 28 个选项 → 褶型直接进变体,各用各的价
 *
 * 用法: npx tsx scripts/etsy-upload-pack.ts   输出: etsy-pricing/upload/
 */
import { priceHandcraftedDrapery } from "@window-treatments/shared/pricing/aapp";
import { writeFileSync, mkdirSync } from "node:fs";

const UPLIFT = 1.12;
const PLEATS = [
  { k: "3fold_pinch", l: "3-Fold Pinch" }, { k: "2fold_pinch", l: "2-Fold Pinch" },
  { k: "3fold_tailored", l: "3-Fold Tailored" }, { k: "2fold_tailored", l: "2-Fold Tailored" },
];
const LINERS = [{ k: "NO", l: "No Liner" }, { k: "LF", l: "Light Filtering" }, { k: "BO", l: "100% Blackout" }];

function px(kind: "fabric"|"sheer", w: number, h: number, liner: string, ppy: number, fw: number, st: string) {
  const mk = (op: string) => {
    const base: any = { enabled: true, pricePerYard: ppy, widthNormalizedIn: fw };
    if (kind === "fabric") base.liningType = liner;
    try {
      return priceHandcraftedDrapery({ finishedWidthIn: w, finishedHeightIn: h,
        composition: kind === "fabric" ? "fabric_only" : "sheer_only",
        styleFamily: "pleated", styleKey: st, operation: op,
        layers: kind === "fabric" ? { main: base } : { sheer: base } } as any).total;
    } catch { return null; }
  };
  const s = mk("split");
  if (s !== null) return { price: Math.round(s * UPLIFT), oneWay: false };
  const o = mk("single_left");
  return o === null ? null : { price: Math.round(o * UPLIFT), oneWay: true };
}

mkdirSync("etsy-pricing/upload", { recursive: true });
const widthsF = [48, 72, 96, 120, 144, 168, 196];
const widthsS = [36, 48, 60, 72, 84, 96, 108, 120, 132, 144, 156, 168];
const HEIGHTS = [100, 140];

// ── 1. Spot Linen: Size × Liner,按 3-Fold 定价 ──────────────────────────
{
  const out = ["Size,Liner,Price,Note"];
  let guard = 0;
  for (const h of HEIGHTS) for (const w of widthsF) for (const li of LINERS) {
    const three = px("fabric", w, h, li.k, 40, 110, "3fold_pinch");
    const two   = px("fabric", w, h, li.k, 40, 110, "2fold_pinch");
    if (!three) continue;
    if (two && two.price > three.price) guard++;
    out.push(`"${w}W-${h}H inches","${li.l}",${three.price},${three.oneWay ? "ONE-WAY ONLY" : ""}`);
  }
  writeFileSync("etsy-pricing/upload/825450511_SpotLinen_Size-x-Liner.csv", out.join("\n") + "\n");
  console.log(`825450511 Spot Linen  → ${out.length - 1} 行 (Size×Liner, 3-Fold 定价)`);
  console.log(`   2-Fold 反而更贵的格子: ${guard}  ${guard === 0 ? "✓ 3-Fold 定价始终不亏" : "⚠️ 需人工看"}`);
}

// ── 2/3. 两条纱帘: Size × Pleat Style ───────────────────────────────────
for (const f of [
  { id: "1373594998", name: "Lamar", ppy: 30 },
  { id: "1257735563", name: "PearlWhite", ppy: 26 },
]) {
  const out = ["Size,Pleat Style,Price,Note"];
  for (const h of HEIGHTS) for (const w of widthsS) for (const pl of PLEATS) {
    const r = px("sheer", w, h, "NO", f.ppy, 118, pl.k);
    if (!r) continue;
    out.push(`"${w}W-${h}H inches","${pl.l}",${r.price},${r.oneWay ? "ONE-WAY ONLY" : ""}`);
  }
  writeFileSync(`etsy-pricing/upload/${f.id}_${f.name}_Size-x-Pleat.csv`, out.join("\n") + "\n");
  console.log(`${f.id} ${f.name.padEnd(10)} → ${out.length - 1} 行 (Size×Pleat)`);
}
console.log("\n选项数检查 (Etsy 上限:两维之和 ≤70)");
console.log(`  Spot Linen : ${widthsF.length * HEIGHTS.length} 尺寸 + ${LINERS.length} 里布 = ${widthsF.length * HEIGHTS.length + LINERS.length} ✓`);
console.log(`  纱帘       : ${widthsS.length * HEIGHTS.length} 尺寸 + ${PLEATS.length} 褶型 = ${widthsS.length * HEIGHTS.length + PLEATS.length} ✓`);
