/**
 * Etsy 价格网格生成器
 * ------------------------------------------------------------------
 * 用官网/AAPP 同源的定价引擎 (priceHandcraftedDrapery) 一次性生成
 * Etsy listing 的「尺寸 × 里布」价格网格,导出成 CSV。
 *
 * 为什么要有这个脚本:
 *   Etsy 原生不支持批量改 variation 价格,手输网格就是上一轮那两处
 *   $100 错价的来源。价格必须和 AAPP / 官网同源,见 docs/aapp-pricing-spec.md。
 *
 * 用法:  npx tsx scripts/etsy-price-grid.ts
 * 输出:  etsy-pricing/*.csv
 *
 * 改价时你只需要动下面 CONFIG 里的数字,然后重跑。
 */
import { priceHandcraftedDrapery } from "@window-treatments/shared/pricing/aapp";
import { writeFileSync } from "node:fs";

// ══════════════════ CONFIG — 改价只改这里 ══════════════════

/** Etsy 加价系数:覆盖 Etsy 约 10.5% 的抽成。1.12 → 官网价 × 1.12 */
const ETSY_UPLIFT = 1.12;

/** 最终价取整到几美元的倍数。1 = 精确到 $1;5 = 取整到 $5 */
const ROUND_TO = 1;

/**
 * 劳工附加倍数模式 —— 这一项直接决定 140H 和超宽档的价格。
 *  "aapp_default"  引擎出厂默认:H>120" 时劳工 ×(1.5 + 每多12" +0.1)、
 *                  单边≥5幅时 ×1.5。官网当前若未改设置就是这个。
 *  "neutralized"   全部中性化为 ×1,与 AAPP 报价端一致
 *                  (见 memory: aapp-pricing-critical 的 divergence 提醒)。
 */
const MULTIPLIER_MODE: "aapp_default" | "neutralized" = "aapp_default";

/**
 * 面料参数 —— Eddie 2026-08-12 提供的真实值。
 *   pricePerYard      售价 $/码
 *   fabricWidthIn     幅宽(英寸)。幅宽直接决定需要几幅、能不能横做(railroaded),
 *                     引擎默认只有 55",必须显式给真实值,否则价格会算错一大截。
 */
const FABRICS = [
  { key: "spot-linen",  label: "Designer Spot Linen", listing: "825450511",
    kind: "fabric" as const, pricePerYard: 40, fabricWidthIn: 110,
    widths: [48, 72, 96, 120, 144, 168, 196], heights: [100, 140] },
  { key: "lamar",       label: "Lamar (Linen Look Sheer Drapery)", listing: "1373594998",
    kind: "sheer" as const,  pricePerYard: 30, fabricWidthIn: 118,
    widths: [36, 48, 60, 72, 84, 96, 108, 120, 132, 144, 156, 168], heights: [100, 140] },
  { key: "pearl-white", label: "Pearl White Linen Look Sheer",     listing: "1257735563",
    kind: "sheer" as const,  pricePerYard: 26, fabricWidthIn: 118,
    widths: [36, 48, 60, 72, 84, 96, 108, 120, 132, 144, 156, 168], heights: [100, 140] },
];

/** 要出网格的褶型。拆 listing 时每个褶型一条 listing,各用自己那张表。 */
const PLEATS = [
  { key: "3fold_pinch",    label: "3-Fold Pinch" },
  { key: "2fold_pinch",    label: "2-Fold Pinch" },
  { key: "3fold_tailored", label: "3-Fold Tailored" },
  { key: "2fold_tailored", label: "2-Fold Tailored" },
];

/** 布帘的里布档;纱帘不带里布。 */
const LINERS = [
  { key: "NO", label: "No Liner" },
  { key: "LF", label: "Light Filtering" },
  { key: "BO", label: "100% Blackout" },
] as const;

/** 开合方式。split = 中开(两片),single_left/right = 单向(一片)。 */
const OPERATION = "split" as const;

/**
 * 中开无解时的兜底(Eddie 2026-08-12 拍板)。
 * 小尺寸中开在褶距求解器里无解(48W 三褶:唯一合法褶数 5,褶量 9.10" 超上限 9.00" 仅 0.1")。
 * 网站引擎停留在 AAPP v942 之前的旧版、没有 AAPP 的打分兜底轮 —— 见 memory
 * spacing-solver-parity-gap。在把 v942 移植过来之前,这些格子按【单向同尺寸价】出。
 * 注:单向用料通常比中开少 0.25 幅,这些格子会略低于真实成本(约 $40–70/片)。
 */
const SPLIT_FALLBACK_TO_ONE_WAY = true;

// ══════════════════ 以下不用改 ══════════════════

const NEUTRAL_CFG = {
  heightSurcharge: { startHeightIn: 120, baseMultiplier: 1, incrementPerExtra12In: 0 },
  largePanelSurcharge: { thresholdSingleSidePanelCount: 5, multiplier: 1 },
};

type Liner = "NO" | "LF" | "BO";

function priceOnce(
  kind: "fabric" | "sheer", w: number, h: number, liner: Liner,
  ppy: number, styleKey: string, fabricWidthIn: number, operation: string,
): number | null {
  const base = { enabled: true, pricePerYard: ppy, widthNormalizedIn: fabricWidthIn };
  const layers = kind === "fabric"
    ? { main:  { ...base, liningType: liner } }
    : { sheer: { ...base } };
  try {
    return priceHandcraftedDrapery({
      finishedWidthIn: w, finishedHeightIn: h,
      composition: kind === "fabric" ? "fabric_only" : "sheer_only",
      styleFamily: "pleated", styleKey, operation,
      layers,
      ...(MULTIPLIER_MODE === "neutralized" ? { config: NEUTRAL_CFG } : {}),
    } as any).total;
  } catch { return null; }
}

/** 返回 [价格, 是否用了单向兜底]。 */
function sitePrice(
  kind: "fabric" | "sheer", w: number, h: number, liner: Liner,
  ppy: number, styleKey: string, fabricWidthIn: number,
): [number | null, boolean] {
  const split = priceOnce(kind, w, h, liner, ppy, styleKey, fabricWidthIn, OPERATION);
  if (split !== null) return [split, false];
  if (!SPLIT_FALLBACK_TO_ONE_WAY) return [null, false];
  const one = priceOnce(kind, w, h, liner, ppy, styleKey, fabricWidthIn, "single_left");
  return [one, one !== null];
}

const toEtsy = (site: number) =>
  Math.round((site * ETSY_UPLIFT) / ROUND_TO) * ROUND_TO;

const rows: string[] = ["listing_id,fabric,pleat,size_label,liner,site_price,etsy_price,note"];
const failures: string[] = [];
const fallbacks: string[] = [];
let n = 0;

for (const f of FABRICS) {
  for (const pleat of PLEATS) {
    const liners = f.kind === "fabric" ? LINERS : ([{ key: "NO", label: "—" }] as const);
    const lines: string[] = ["Size,Liner,Price"];
    for (const h of f.heights) for (const w of f.widths) {
      const sizeLabel = `${w}W-${h}H inches`;
      for (const l of liners) {
        const [site, viaOneWay] = sitePrice(f.kind, w, h, l.key as Liner, f.pricePerYard, pleat.key, f.fabricWidthIn);
        if (site === null) { failures.push(`${f.label} / ${pleat.label} / ${sizeLabel} / ${l.label}`); continue; }
        if (viaOneWay) fallbacks.push(`${f.label} / ${pleat.label} / ${sizeLabel}`);
        const etsy = toEtsy(site);
        lines.push(`"${sizeLabel}","${l.label}",${etsy}`);
        rows.push(`${f.listing},"${f.label}","${pleat.label}","${sizeLabel}","${l.label}",${site},${etsy},${viaOneWay ? "ONE-WAY ONLY" : ""}`);
        n++;
      }
    }
    writeFileSync(`etsy-pricing/${f.key}__${pleat.key}.csv`, lines.join("\n") + "\n");
  }
}
writeFileSync("etsy-pricing/_ALL.csv", rows.join("\n") + "\n");

console.log(`✅ 生成 ${n} 个价格 · ${FABRICS.length} 面料 × ${PLEATS.length} 褶型`);
console.log(`   模式: ${MULTIPLIER_MODE} · 加价 ×${ETSY_UPLIFT} · 取整 $${ROUND_TO}`);
console.log(`   输出: etsy-pricing/  (每个 listing 一个 CSV + _ALL.csv 总表)`);
if (fallbacks.length) {
  const uniq = [...new Set(fallbacks)];
  console.log(`\n↩️  ${uniq.length} 个尺寸中开无解,已按【单向同尺寸价】出价 —— listing 上要标 one-way only:`);
  for (const x of uniq) console.log("   ", x);
}
if (failures.length) {
  console.log(`\n⚠️  ${failures.length} 个组合引擎解不出来 (spacing solver 无解),这些尺寸不能这样卖:`);
  for (const x of [...new Set(failures)].slice(0, 20)) console.log("   ", x);
}
