// Handcrafted drapery pricing (spec §3).
//
// AAPP authority: functions/index.js _priceHandcraftedDrapery (:4196-4257)
// and sub-functions :3716-4192 (spacing-first solver _dpcSpacingFirst,
// fabric math _dpcCalcFabricMath, sheer math _dpcCalcSheerMath, banding
// _dpcCalcBandingPrice, bundled hardware _dpcCalcBundledHardwarePrice);
// client draperyCalcPrice app-quotes-drapery.js:1046 (+ :630/:711/:821/:888/:950/:993).
//
// total = main layer + sheer layer + bundled hardware + banding, each raw
// float until the final priceInt (spec §3.7). Product-only price — the
// bundled hardware's install fee is excluded by construction (our hardware
// engine never prices install).

import type {
  AappPriceResult,
  DeepPartial,
  DraperyConfig,
  DraperyHeightSurcharge,
  DraperyLargePanelSurcharge,
  DraperyLayerInput,
  HandcraftedDraperyInput,
  LiningType,
  SpacingFoldParams,
} from "./types";
import {
  DRAPERY_BANDING_LENGTH_ADD_IN,
  DRAPERY_DEFAULT_FABRIC_WIDTH_IN,
  DRAPERY_DEFAULTS,
  DRAPERY_FIXED_ALLOWANCE_IN,
  DRAPERY_LABOR_REF_WIDTH_IN,
  DRAPERY_LINING_WIDTH_IN,
  ceilHalfYd,
  ceilToEven,
  mergeAappConfig,
  priceInt,
  round2,
} from "./constants";
import { priceDraperyHardware } from "./hardware";

type Orientation = "railroaded" | "vertical";

function resolveLayerPrice(layer: DraperyLayerInput): number | null {
  if (layer.manualPriceOverride != null) return Number(layer.manualPriceOverride);
  return layer.pricePerYard != null ? Number(layer.pricePerYard) : null;
}

function resolveLayerWidth(layer: DraperyLayerInput): number {
  if (layer.manualWidthOverride != null) return Number(layer.manualWidthOverride);
  return layer.widthNormalizedIn != null
    ? Number(layer.widthNormalizedIn)
    : DRAPERY_DEFAULT_FABRIC_WIDTH_IN;
}

/** Railroaded (横做) vs vertical seaming (竖拼) — spec §3.3 orientation rules. */
function resolveOrientation(fw: number, fH: number, mode: string | undefined): Orientation {
  const canRR = fw >= 110 && fH <= fw - 8;
  const autoRR = fw >= 110 && fH <= fw - 16;
  if (mode === "railroaded") return canRR ? "railroaded" : "vertical";
  if (mode === "vertical") return "vertical";
  return autoRR ? "railroaded" : "vertical";
}

/** Height surcharge multiplier on LABOR — mirrors AAPP
 *  draperyComputeHeightMultiplier (client) / _dpcComputeHeightMultiplier
 *  (server, v782). ≤ start → ×1. */
function heightMultiplier(finishedHeightIn: number, cfg: DraperyHeightSurcharge): number {
  const h = Number(finishedHeightIn || 0);
  if (!h || h <= cfg.startHeightIn) return 1;
  return cfg.baseMultiplier + ((h - cfg.startHeightIn) / 12) * cfg.incrementPerExtra12In;
}

/** Large-panel surcharge multiplier on LABOR — mirrors AAPP
 *  draperyComputeLargePanelMultiplier / _dpcComputeLargePanelMultiplier.
 *  singleSidePanelCount = laborWps / 2 for split, laborWps otherwise. */
function largePanelMultiplier(
  singleSidePanelCount: number,
  cfg: DraperyLargePanelSurcharge,
): number {
  const spc = Number(singleSidePanelCount || 0);
  return spc >= cfg.thresholdSingleSidePanelCount ? cfg.multiplier : 1;
}

function isFold3(styleKey: string): boolean {
  return (
    styleKey === "3fold_pinch" ||
    styleKey === "3fold_tailored" ||
    styleKey === "pinch_3" ||
    styleKey === "tailored_3"
  );
}

interface SpacingSolution {
  np: number;
  wps: number;
  PA: number;
  ps: number;
  spacing: number;
}

/** Spacing-first pleat solver — exact candidate order npBase, −1, +1, −2, +2 … ±5.
 *  Mirrors _dpcSpacingFirst (functions/index.js:3856-3879). */
function spacingFirst(panelW: number, fw: number, params: SpacingFoldParams): SpacingSolution | null {
  const fixed = DRAPERY_FIXED_ALLOWANCE_IN;
  const step = fw >= 110 ? 0.25 : 0.5;
  const npBase = Math.max(1, Math.round(panelW / params.spacingTarget));
  const candidates: number[] = [];
  for (let d = 0; d <= 5; d++) {
    if (npBase - d >= 1) candidates.push(npBase - d);
    if (d > 0) candidates.push(npBase + d);
  }
  for (const np of candidates) {
    const spacing = panelW / (np + 1);
    if (spacing < params.spacingMin || spacing > params.spacingMax) continue;
    const psMin = panelW + np * params.paMin + fixed;
    let wps = Math.ceil(psMin / fw / step) * step;
    if (wps < step) wps = step;
    const ps = wps * fw;
    const PA = (ps - panelW - fixed) / np;
    if (PA < params.paMin || PA > params.paMax) continue;
    return { np, wps, PA, ps, spacing };
  }
  return null;
}

interface CommonCfg {
  styleFamily: string;
  styleKey: string;
  operation: string;
  returnIn: number;
}

interface FabricCalc {
  orient: Orientation;
  np: number;
  wps: number | null;
  perSide: number;
  cutDrop: number;
  sides: number;
  faceYds: number;
  liningYds: number;
  liningWps: number;
  laborWps: number;
  hasLining: boolean;
}

/** Main-layer consumption — mirrors _dpcCalcFabricMath (:3888-3969). */
function calcFabricMath(
  layer: DraperyLayerInput,
  common: CommonCfg,
  fW: number,
  fH: number,
  cfg: DraperyConfig,
): FabricCalc {
  const fw = resolveLayerWidth(layer) || DRAPERY_DEFAULT_FABRIC_WIDTH_IN;
  const liningType: LiningType = layer.liningType ?? "NO";
  const hasLining = liningType !== "NO";
  const sides = common.operation === "split" ? 2 : 1;
  const panelW = common.operation === "split" ? fW / 2 : fW;
  const orient = resolveOrientation(fw, fH, layer.orientationMode);
  const hem = cfg.hemAllowanceIn;
  const cutDrop = fH + hem;

  let np: number;
  let wps: number | null;
  let perSide: number;

  if (common.styleFamily === "pleated") {
    const foldKey = isFold3(common.styleKey) ? "fold3" : "fold2";
    const params = cfg.spacingFirst.fabric[foldKey];
    const solution = spacingFirst(panelW, fw, params);
    if (!solution) throw new Error("no_spacing_solution");
    np = solution.np;
    wps = solution.wps;
    if (orient === "railroaded") {
      const paMid = (params.paMin + params.paMax) / 2;
      perSide = panelW + np * paMid + DRAPERY_FIXED_ALLOWANCE_IN;
    } else {
      perSide = solution.ps;
    }
  } else if (common.styleFamily === "ripple") {
    const rp = cfg.rippleSystems[common.styleKey];
    if (!rp) throw new Error(`unknown_ripple_system: "${common.styleKey}"`);
    const retIn = Number(layer.returnIn ?? common.returnIn) || 0;
    const N = ceilToEven((panelW - rp.c) / rp.pulley);
    const spl = round2(N * rp.button + rp.baseAdd + retIn);
    np = N;
    perSide = spl;
    if (orient === "railroaded") {
      wps = null;
    } else {
      const ripStep = fw >= 110 ? 0.25 : 0.5;
      wps = Math.ceil(spl / fw / ripStep) * ripStep;
    }
  } else {
    throw new Error(`unknown_style_family: "${common.styleFamily}"`);
  }

  // Face fabric yardage — half-yard ceiling (spec §3.3 C).
  const faceYds =
    orient === "railroaded"
      ? ceilHalfYd((perSide / 36) * sides)
      : ceilHalfYd(((wps as number) * cutDrop) / 36 * sides);

  // Lining — always vertical, fixed 55" width, 0.5 step.
  let liningWps = 0;
  let liningYds = 0;
  if (hasLining) {
    liningWps = Math.ceil(perSide / DRAPERY_LINING_WIDTH_IN / 0.5) * 0.5;
    liningYds = ceilHalfYd(((liningWps * cutDrop) / 36) * sides);
  }

  // Labor widths: with lining → lining widths; without → 50"-reference rule.
  const laborWps = hasLining
    ? liningWps * sides
    : Math.ceil(perSide / DRAPERY_LABOR_REF_WIDTH_IN / 0.5) * 0.5 * sides;

  return { orient, np, wps, perSide, cutDrop, sides, faceYds, liningYds, liningWps, laborWps, hasLining };
}

interface SheerCalc {
  orient: Orientation;
  wps: number | null;
  yds: number;
  perSide: number;
  cutDrop: number;
  sides: number;
  laborWps: number;
  np: number;
}

/** Sheer-layer consumption — mirrors _dpcCalcSheerMath (:3972-4027). */
function calcSheerMath(
  layer: DraperyLayerInput,
  common: CommonCfg,
  fW: number,
  fH: number,
  cfg: DraperyConfig,
): SheerCalc {
  const fw = resolveLayerWidth(layer) || DRAPERY_DEFAULT_FABRIC_WIDTH_IN;
  const sides = common.operation === "split" ? 2 : 1;
  const panelW = common.operation === "split" ? fW / 2 : fW;
  const orient = resolveOrientation(fw, fH, layer.orientationMode);
  const cutDrop = fH + cfg.hemAllowanceIn;

  let perSide: number;
  let wps: number | null;
  let yds: number;
  let np: number;

  if (common.styleFamily === "ripple") {
    const rp = cfg.rippleSystems[common.styleKey];
    if (!rp) throw new Error(`unknown_ripple_system: "${common.styleKey}"`);
    const retIn = Number(layer.returnIn ?? common.returnIn) || 0;
    np = ceilToEven((panelW - rp.c) / rp.pulley);
    const spl = round2(np * rp.button + rp.baseAdd + retIn);
    perSide = spl;
    if (orient === "railroaded") {
      wps = null;
      yds = ceilHalfYd((spl / 36) * sides);
    } else {
      const ripStep = fw >= 110 ? 0.25 : 0.5;
      wps = Math.ceil(spl / fw / ripStep) * ripStep;
      yds = ceilHalfYd(((wps * cutDrop) / 36) * sides);
    }
  } else if (common.styleFamily === "pleated") {
    const foldKey = isFold3(common.styleKey) ? "fold3" : "fold2";
    const params = cfg.spacingFirst.sheer[foldKey];
    const solution = spacingFirst(panelW, fw, params);
    if (!solution) throw new Error("no_spacing_solution");
    np = solution.np;
    wps = solution.wps;
    if (orient === "railroaded") {
      const paMid = (params.paMin + params.paMax) / 2;
      perSide = panelW + np * paMid + DRAPERY_FIXED_ALLOWANCE_IN;
      yds = ceilHalfYd((perSide / 36) * sides);
    } else {
      perSide = solution.ps;
      yds = ceilHalfYd(((wps * cutDrop) / 36) * sides);
    }
  } else {
    throw new Error(`unknown_style_family: "${common.styleFamily}"`);
  }

  // Sheer labor always uses the 50"-reference no-lining rule.
  const laborWps = Math.ceil(perSide / DRAPERY_LABOR_REF_WIDTH_IN / 0.5) * 0.5 * sides;

  return { orient, wps, yds, perSide, cutDrop, sides, laborWps, np };
}

export function priceHandcraftedDrapery(input: HandcraftedDraperyInput): AappPriceResult {
  const cfg = mergeAappConfig(DRAPERY_DEFAULTS, input.config);

  const fW = Number(input.finishedWidthIn);
  const fH = Number(input.finishedHeightIn);
  if (!Number.isFinite(fW) || !Number.isFinite(fH) || fW <= 0 || fH <= 0) {
    throw new Error("size_out_of_range: finished width/height must be positive inches");
  }

  const common: CommonCfg = {
    styleFamily: input.styleFamily,
    styleKey: input.styleKey,
    operation: input.operation ?? "split",
    returnIn: Number(input.returnIn) || 0,
  };

  const mainLayer = input.layers?.main;
  const sheerLayer = input.layers?.sheer;
  const mainEnabled = !!mainLayer?.enabled;
  const sheerEnabled = !!sheerLayer?.enabled;
  if (!mainEnabled && !sheerEnabled) throw new Error("no_layer_enabled");

  const breakdown: Record<string, number | string> = {
    finishedWidthIn: fW,
    finishedHeightIn: fH,
    operation: common.operation,
    styleFamily: common.styleFamily,
    styleKey: common.styleKey,
  };

  // ── Main fabric layer (§3.3) ──────────────────────────────────────────────
  let mainTotal = 0;
  if (mainEnabled && mainLayer) {
    const price = resolveLayerPrice(mainLayer);
    if (price == null) throw new Error("main_layer: missing_price");
    const calc = calcFabricMath(mainLayer, common, fW, fH, cfg);
    const liningType: LiningType = mainLayer.liningType ?? "NO";
    const liningCfg = cfg.liningOptions[liningType];
    // Labor multipliers (AAPP v782 quote parity — labor only, never fabric/lining).
    const hMult = heightMultiplier(fH, cfg.heightSurcharge);
    const sspc = calc.sides === 2 ? calc.laborWps / 2 : calc.laborWps;
    const lpMult = largePanelMultiplier(sspc, cfg.largePanelSurcharge);
    const lbMult = hMult * lpMult;
    const fabricAmt = calc.faceYds * price; // raw float (spec §3.3 D)
    const liningAmt = calc.liningYds * liningCfg.liningPricePerYard;
    const laborAmt = calc.laborWps * liningCfg.laborPerPanel * lbMult;
    mainTotal = fabricAmt + liningAmt + laborAmt;

    breakdown.mainHeightMultiplier = hMult;
    breakdown.mainLargePanelMultiplier = lpMult;
    breakdown.mainLaborMultiplier = lbMult;

    breakdown.mainOrientation = calc.orient;
    breakdown.mainNp = calc.np;
    breakdown.mainWps = calc.wps ?? "";
    breakdown.mainPerSide = calc.perSide;
    breakdown.mainCutDrop = calc.cutDrop;
    breakdown.mainFaceYds = calc.faceYds;
    breakdown.mainFabricAmt = fabricAmt;
    breakdown.mainLiningType = liningType;
    breakdown.mainLiningWps = calc.liningWps;
    breakdown.mainLiningYds = calc.liningYds;
    breakdown.mainLiningAmt = liningAmt;
    breakdown.mainLaborWps = calc.laborWps;
    breakdown.mainLaborAmt = laborAmt;
    breakdown.mainTotal = mainTotal;
  }

  // ── Sheer layer (§3.4) ────────────────────────────────────────────────────
  let sheerTotal = 0;
  if (sheerEnabled && sheerLayer) {
    const price = resolveLayerPrice(sheerLayer);
    if (price == null) throw new Error("sheer_layer: missing_price");
    const calc = calcSheerMath(sheerLayer, common, fW, fH, cfg);
    // Same labor multipliers as the main layer (AAPP WO parity: the MAIN
    // catalog's surcharge config applies to the sheer layer too).
    const hMult = heightMultiplier(fH, cfg.heightSurcharge);
    const sspc = calc.sides === 2 ? calc.laborWps / 2 : calc.laborWps;
    const lpMult = largePanelMultiplier(sspc, cfg.largePanelSurcharge);
    const lbMult = hMult * lpMult;
    const fabricAmt = calc.yds * price;
    const laborAmt = calc.laborWps * cfg.sheerLaborPerPanel * lbMult;
    sheerTotal = fabricAmt + laborAmt;

    breakdown.sheerHeightMultiplier = hMult;
    breakdown.sheerLargePanelMultiplier = lpMult;
    breakdown.sheerLaborMultiplier = lbMult;

    breakdown.sheerOrientation = calc.orient;
    breakdown.sheerYds = calc.yds;
    breakdown.sheerPerSide = calc.perSide;
    breakdown.sheerFabricAmt = fabricAmt;
    breakdown.sheerLaborWps = calc.laborWps;
    breakdown.sheerLaborAmt = laborAmt;
    breakdown.sheerTotal = sheerTotal;
  }

  // ── Bundled hardware (§3.6) — lengthIn = finished width ──────────────────
  let hardwareTotal = 0;
  if (input.hardware?.enabled) {
    const hw = priceDraperyHardware({
      profileKey: input.hardware.profileKey,
      lengthIn: fW,
      leftFinialKey: input.hardware.leftFinialKey,
      rightFinialKey: input.hardware.rightFinialKey,
      accessorySelections: input.hardware.accessorySelections,
      config: input.hardwareConfig,
    });
    hardwareTotal = hw.total; // already priceInt'd, matching AAPP hR.subtotal
    breakdown.hardwareSubtotal = hw.total;
    breakdown.hardwareBilledFeet = hw.breakdown.billedFeet;
  }

  // ── Banding (§3.5) ────────────────────────────────────────────────────────
  let bandingTotal = 0;
  if (input.banding?.enabled) {
    const b = input.banding;
    const count = Number(b.countPerPanel);
    if (count !== 1 && count !== 2) throw new Error("banding: missing_count");
    let pricePerYard = 0;
    if (b.styleKey) {
      const style = cfg.banding.styles[b.styleKey];
      if (!style) throw new Error(`banding: unknown_style "${b.styleKey}"`);
      pricePerYard = Number(style.pricePerYard) || 0;
    }
    if (Number.isFinite(Number(b.pricePerYardOverride)) && Number(b.pricePerYardOverride) > 0) {
      pricePerYard = Number(b.pricePerYardOverride);
    }
    if (!(pricePerYard > 0)) throw new Error("banding: missing_price");

    const panelCount = common.operation === "split" ? 2 : 1;
    const totalCount = count * panelCount;
    const lengthPerPiece = fH + DRAPERY_BANDING_LENGTH_ADD_IN;
    const yardage = (lengthPerPiece * totalCount) / 36;
    const fabricAmt = yardage * pricePerYard;
    const laborAmt = (fH / 12) * cfg.banding.laborPerFoot * totalCount;
    bandingTotal = fabricAmt + laborAmt;

    breakdown.bandingTotalCount = totalCount;
    breakdown.bandingLengthPerPieceIn = lengthPerPiece;
    breakdown.bandingYardage = yardage;
    breakdown.bandingFabricAmt = fabricAmt;
    breakdown.bandingLaborAmt = laborAmt;
    breakdown.bandingTotal = bandingTotal;
  }

  const subtotalRaw = mainTotal + sheerTotal + hardwareTotal + bandingTotal;
  breakdown.subtotalRaw = subtotalRaw;

  return { total: priceInt(subtotalRaw), breakdown };
}

// ── Geometry-only (no pricing) ──────────────────────────────────────────────
// Runs the SAME spacing-first fabric math priceHandcraftedDrapery uses, but
// returns only the shop geometry (panel count / widths-per-side / single-panel
// width / orientation) — no fabric price required. Used by the website work
// order to fill 扣/幅/裁 when a product isn't wired to the pricing engine, so the
// factory number matches what the engine would compute WITHOUT touching price.

export interface DraperyMainGeometryInput {
  finishedWidthIn: number;
  finishedHeightIn: number;
  styleFamily: string; // "pleated" | "ripple"
  styleKey: string; // pinch_2 | pinch_3 | tailored_2 | tailored_3 | cn_6cm | cn_7cm | us_60..120
  operation?: string; // "split" | "single_left" | "single_right"
  fabricWidthIn?: number; // fabric bolt width (default 54")
  returnIn?: number;
  liningType?: LiningType;
  config?: DeepPartial<DraperyConfig>;
}

export interface DraperyMainGeometry {
  np: number; // pleats (pleated) or ripple carriers N
  widthsPerSide: number | null; // null when railroaded (横做)
  perSide: number; // inches of fabric per side / single panel length
  orientation: Orientation; // "railroaded" | "vertical"
  cutDrop: number;
  sides: number; // 2 for split, else 1
}

/** Shop geometry for a drapery main layer — spacing-first math, no pricing. */
export function draperyMainGeometry(input: DraperyMainGeometryInput): DraperyMainGeometry {
  const cfg = mergeAappConfig(DRAPERY_DEFAULTS, input.config);
  const fW = Number(input.finishedWidthIn);
  const fH = Number(input.finishedHeightIn);
  if (!Number.isFinite(fW) || !Number.isFinite(fH) || fW <= 0 || fH <= 0) {
    throw new Error("size_out_of_range: finished width/height must be positive inches");
  }
  const common: CommonCfg = {
    styleFamily: input.styleFamily,
    styleKey: input.styleKey,
    operation: input.operation ?? "split",
    returnIn: Number(input.returnIn) || 0,
  };
  const layer: DraperyLayerInput = {
    enabled: true,
    pricePerYard: 1, // geometry only — value irrelevant, never read here
    liningType: input.liningType ?? "NO",
    widthNormalizedIn: input.fabricWidthIn ?? 54,
  };
  const calc = calcFabricMath(layer, common, fW, fH, cfg);
  return {
    np: calc.np,
    widthsPerSide: calc.wps,
    perSide: calc.perSide,
    orientation: calc.orient,
    cutDrop: calc.cutDrop,
    sides: calc.sides,
  };
}
