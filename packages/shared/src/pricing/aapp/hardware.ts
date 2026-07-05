// Drapery hardware + SOMFY motorized track pricing (spec §4).
//
// AAPP authority:
//   §4.1 functions/index.js _priceDraperyHardware (:3190-3275),
//        billed feet _dhcBilledFeet (:3184-3188);
//        client draperyHardwareCalcPrice app-quotes-catalog.js:1107.
//   §4.2 functions/index.js _priceSomfyMotorizedTrack (:3006-3061),
//        retail tables :2869-2923, accessory nets :2925-2948;
//        client somfyCalcPrice app-catalog.js:894.

import type {
  AappPriceResult,
  DraperyHardwareInput,
  SomfyTrackInput,
} from "./types";
import {
  DRAPERY_HARDWARE_DEFAULTS,
  HARDWARE_DEFAULT_MIN_BILLABLE_WIDTH_IN,
  SOMFY_TRACK_DEFAULTS,
  mergeAappConfig,
  priceInt,
  round2,
} from "./constants";

/** Billed feet: ceiling with 0.1" float-noise tolerance, minimum 1 ft for any
 *  positive practical length. Mirrors _dhcBilledFeet. */
export function hardwareBilledFeet(lengthIn: number): number {
  const len = Number(lengthIn) || 0;
  if (len <= 0) return 0;
  return Math.ceil(Math.max(len - 0.1, 0) / 12);
}

export function priceDraperyHardware(input: DraperyHardwareInput): AappPriceResult {
  const cfg = mergeAappConfig(DRAPERY_HARDWARE_DEFAULTS, input.config);

  const profile = cfg.profiles[input.profileKey];
  if (!profile) throw new Error(`unknown_profile: "${input.profileKey}"`);

  const lengthIn = Number(input.lengthIn);
  if (!Number.isFinite(lengthIn) || lengthIn <= 0) {
    throw new Error("size_out_of_range: lengthIn must be positive inches");
  }

  const billedFeet = hardwareBilledFeet(lengthIn);

  // Price model selection (spec §4.1): the new base+per-foot model wins when
  // either of its fields is set (> 0); otherwise fall back to legacy $/ft.
  const hasNewModel =
    Number(profile.basePriceAtMinWidth) > 0 || Number(profile.addPricePerFoot) > 0;
  const hasLegacy = Number(profile.pricePerFoot) > 0;
  if (!hasNewModel && !hasLegacy) {
    throw new Error(`unknown_profile: "${input.profileKey}" has no price configured`);
  }

  let baseAmt: number;
  let minFt = 0;
  if (hasNewModel) {
    minFt = profile.minBillableWidthIn
      ? profile.minBillableWidthIn / 12
      : HARDWARE_DEFAULT_MIN_BILLABLE_WIDTH_IN / 12;
    const extraFt = Math.max(0, billedFeet - minFt);
    baseAmt = Number(profile.basePriceAtMinWidth || 0) + extraFt * Number(profile.addPricePerFoot || 0);
  } else {
    baseAmt = billedFeet * Number(profile.pricePerFoot || 0);
  }

  let finialAmt = 0;
  for (const finialKey of [input.leftFinialKey, input.rightFinialKey]) {
    if (!finialKey) continue;
    const finial = cfg.finials[finialKey];
    if (!finial) throw new Error(`unknown_finial: "${finialKey}"`);
    finialAmt += Number(finial.price) || 0;
  }

  let accessoryAmt = 0;
  for (const sel of input.accessorySelections ?? []) {
    if (!sel || !sel.key) continue;
    const acc = cfg.accessories[sel.key];
    if (!acc) throw new Error(`unknown_accessory: "${sel.key}"`);
    accessoryAmt += (Number(acc.price) || 0) * (Number(sel.count) || 0);
  }

  const subtotalRaw = baseAmt + finialAmt + accessoryAmt;
  return {
    total: priceInt(subtotalRaw),
    breakdown: {
      profileKey: input.profileKey,
      lengthIn,
      billedFeet,
      priceModel: hasNewModel ? "base_plus_per_foot" : "legacy_per_foot",
      minBillableFt: minFt,
      baseAmt,
      finialAmt,
      accessoryAmt,
      subtotalRaw,
    },
  };
}

export function priceSomfyTrack(input: SomfyTrackInput): AappPriceResult {
  const cfg = mergeAappConfig(SOMFY_TRACK_DEFAULTS, input.config);

  const widthIn = Number(input.widthIn);
  if (!Number.isFinite(widthIn) || widthIn <= 0) {
    throw new Error("size_out_of_range: widthIn must be positive inches");
  }
  const openType = input.openType ?? "split";
  const fullness = input.fullness ?? "100";

  // Retail lookup: first row with w >= widthIn; beyond the table → last row.
  let trackRetail: number;
  if (input.trackType === "ripplefold") {
    const table = cfg.ripplefoldTable;
    const row = table.find((r) => r.w >= widthIn) ?? table[table.length - 1];
    if (!row) throw new Error("unknown_profile: SOMFY ripplefold table is empty");
    const key = `${openType === "side" ? "o" : "s"}${fullness}` as "s80" | "o80" | "s100" | "o100" | "s120" | "o120";
    trackRetail = row[key] || 0;
  } else {
    const table = cfg.pinchPleatTable;
    const row = table.find((r) => r.w >= widthIn) ?? table[table.length - 1];
    if (!row) throw new Error("unknown_profile: SOMFY pinch pleat table is empty");
    trackRetail = openType === "side" ? row.side : row.split;
  }

  const trackSell = round2(trackRetail * cfg.trackFactor * cfg.trackMarkup);

  let motorSell = 0;
  if (input.motorId) {
    const motor = cfg.motors.find((m) => m.id === input.motorId);
    if (!motor) throw new Error(`unknown_motor: "${input.motorId}"`);
    motorSell = Number(motor.sellPrice) || 0;
  }

  const unitPrice = motorSell + trackSell;
  const trackMotorTotal = input.doubleLayer ? unitPrice * 2 : unitPrice;

  let accTotal = 0;
  for (const acc of input.accessories ?? []) {
    if (!acc || !acc.id) continue;
    const net = cfg.accessoriesNet[acc.id];
    if (net === undefined) throw new Error(`unknown_accessory: "${acc.id}"`);
    const qty = Number(acc.qty) || 1;
    const sellEach = round2(net * cfg.accessoryMarkup);
    accTotal += round2(sellEach * qty);
  }

  // NOTE (spec §4.2): SOMFY keeps 2 decimals — no whole-dollar rounding.
  const total = round2(trackMotorTotal + accTotal);
  return {
    total,
    breakdown: {
      trackType: input.trackType,
      widthIn,
      openType,
      fullness,
      trackRetail,
      trackSell,
      motorSell,
      unitPrice,
      doubleLayer: input.doubleLayer ? 1 : 0,
      trackMotorTotal: round2(trackMotorTotal),
      accTotal: round2(accTotal),
    },
  };
}
