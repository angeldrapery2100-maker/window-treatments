// Luma shade pricing (spec §1).
//
// AAPP authority: client shadeCalcPrice app-quotes-shades.js:638
// (v808 reprice, 2026-07-16 Eddie 定稿 — see LUMA_* v808 constants).
//
// v810 (2026-07-16 Eddie): factory-price model. When the config carries
// fabricMarkup (synced aapp_config), fabric rows are FACTORY NET $/sqm and
//   fabric = billableSqm(≥1.2) × (net × markup.mult + markup.addPerSqm)
// Without fabricMarkup (engine defaults / stale configs) the legacy v808
// sell-price math applies byte-identically:
//   fabric  = billableSqm(≥1.2) × pricePerSqm × 0.75
//   hardware = max(widthM, 1.2m) × (width > 95.7" ? 1.2 : 1) × cassette $/m
//   floor: fabric + hardware + chain/cordless surcharge ≥ $100
//          (motor prices are added AFTER the floor — AAPP adds motor cost at
//          save time outside shadeCalcPrice's floored subtotal)
//
// Website rule (spec §0.3): product-only price = fabric + hardware + control.
// Install fee is EXCLUDED.

import type {
  AappPriceResult,
  LumaFabricTableKey,
  LumaShadeInput,
  LumaVariantKey,
} from "./types";
import {
  INCH_TO_METER,
  LUMA_FABRIC_MULT,
  LUMA_HW_OVERSIZE_MULT,
  LUMA_HW_OVERSIZE_WIDTH_IN,
  LUMA_MIN_BILLABLE_SQM,
  LUMA_MIN_HW_WIDTH_M,
  LUMA_PRICE_FLOOR,
  LUMA_SHADE_DEFAULTS,
  LUMA_SQM_DIVISOR,
  LUMA_SQM_HEIGHT_ADD_IN,
  mergeAappConfig,
  priceInt,
  round2,
} from "./constants";

type SlotKey = "fabric" | "frontFabric" | "backFabric";

/** Slot → fabric table mapping (AI_LUMA_SLOTS — functions/index.js:7816-7823). */
const LUMA_SLOTS: Record<LumaVariantKey, { key: SlotKey; table: LumaFabricTableKey }[]> = {
  roller_shade: [{ key: "fabric", table: "roller" }],
  zebra_shade: [{ key: "fabric", table: "zebra" }],
  sheer_shade: [{ key: "fabric", table: "sheer" }],
  modern_roman_shade: [{ key: "fabric", table: "roman" }],
  dual_roller_shade: [
    { key: "frontFabric", table: "roller" },
    { key: "backFabric", table: "roller" },
  ],
  dual_sheer_shade: [
    { key: "frontFabric", table: "sheer" },
    { key: "backFabric", table: "roller" },
  ],
};

function slotCode(input: LumaShadeInput, slot: SlotKey): string | undefined {
  if (slot === "fabric") return input.fabricFullCode;
  if (slot === "frontFabric") return input.frontFabricFullCode;
  return input.backFabricFullCode;
}

export function priceLumaShade(input: LumaShadeInput): AappPriceResult {
  const cfg = mergeAappConfig(LUMA_SHADE_DEFAULTS, input.config);
  const slots = LUMA_SLOTS[input.variant];
  if (!slots) throw new Error(`unknown_variant: ${String(input.variant)}`);
  const variant = cfg.variants[input.variant];
  if (!variant) throw new Error(`unknown_variant: ${String(input.variant)} not in catalog`);

  const widthIn = Number(input.widthIn);
  const heightIn = Number(input.heightIn);
  if (!Number.isFinite(widthIn) || !Number.isFinite(heightIn) || widthIn <= 0 || heightIn <= 0) {
    throw new Error("size_out_of_range: width/height must be positive inches");
  }
  if (variant.maxWidth != null && widthIn > variant.maxWidth) {
    throw new Error(`size_out_of_range: width ${widthIn}" exceeds ${variant.maxWidth}"`);
  }
  if (variant.maxHeight != null && heightIn > variant.maxHeight) {
    throw new Error(`size_out_of_range: height ${heightIn}" exceeds ${variant.maxHeight}"`);
  }

  // Area math (spec §1.2, v808): sqm = W × (H + 12) / 1550, billed ≥ 1.2 sqm.
  const sqm = (widthIn * (heightIn + LUMA_SQM_HEIGHT_ADD_IN)) / LUMA_SQM_DIVISOR;
  const bSqm = sqm <= 0 ? 0 : Math.max(sqm, LUMA_MIN_BILLABLE_SQM);
  const widthMeters = widthIn * INCH_TO_METER;
  // v808: hardware bills ≥ 1.2 m of width, ×1.2 past the 95.7" freight boundary.
  const hwBillableMeters =
    Math.max(widthMeters, LUMA_MIN_HW_WIDTH_M) *
    (widthIn > LUMA_HW_OVERSIZE_WIDTH_IN ? LUMA_HW_OVERSIZE_MULT : 1);

  // Fabric slot(s) — each slot round2'd (incl. the ×0.75 v808 mult), then summed.
  const breakdown: Record<string, number | string> = {};
  let fabricAmount = 0;
  for (const slot of slots) {
    const fullCode = slotCode(input, slot.key);
    if (!fullCode) {
      throw new Error(`unknown_fabric_code: missing ${slot.key} code for ${input.variant}`);
    }
    const family = fullCode.split("-")[0] || fullCode;
    const row = cfg.fabrics[slot.table].find((f) => f.code === family);
    const pricePerSqm = row ? Number(row.pricePerSqm) : NaN;
    if (!Number.isFinite(pricePerSqm) || pricePerSqm <= 0) {
      throw new Error(`unknown_fabric_code: "${family}" not found in ${slot.table} table`);
    }
    // v810 gate: markup present → factory-net × mult + add; else legacy ×0.75.
    const mk = cfg.fabricMarkup?.[slot.table];
    const sellPerSqm = mk
      ? pricePerSqm * mk.mult + (mk.addPerSqm ?? 0)
      : pricePerSqm * LUMA_FABRIC_MULT;
    const amt = round2(bSqm * sellPerSqm);
    fabricAmount += amt;
    breakdown[`${slot.key}Amount`] = amt;
  }

  // Cassette hardware — per (billable) meter of width.
  let cassettePerMeter = 0;
  if (input.cassette) {
    const cassette = variant.cassettes.find((c) => c.key === input.cassette);
    if (!cassette) {
      throw new Error(`unknown_cassette: "${input.cassette}" not found for ${input.variant}`);
    }
    cassettePerMeter = Number(cassette.pricePerMeter) || 0;
  }
  const hardwareAmount = round2(hwBillableMeters * cassettePerMeter);

  // Control: motorized → motor system net prices (no markup, Luma model),
  // added AFTER the $100 floor (AAPP adds motor cost at save time, outside
  // shadeCalcPrice's floored subtotal); chain/cordless surcharges are part
  // of the floored base.
  let chainSurcharge = 0;
  let motorAmount = 0;
  const option = input.option ?? "";
  if (option === "motorized") {
    const ms = cfg.motorSystem;
    const motor = input.motorKey
      ? ms.motors.find((m) => m.key === input.motorKey)
      : ms.motors[0];
    if (!motor) {
      throw new Error(`unknown_motor: "${input.motorKey ?? "(none configured)"}"`);
    }
    motorAmount += Number(motor.netPrice) || 0;
    breakdown.motorNet = Number(motor.netPrice) || 0;
    // Remote is charged once per owner window (shareable across windows).
    if (input.remoteKey && input.remoteOwner !== false) {
      const remote = ms.remotes.find((r) => r.key === input.remoteKey);
      if (!remote) throw new Error(`unknown_remote: "${input.remoteKey}"`);
      motorAmount += Number(remote.netPrice) || 0;
      breakdown.remoteNet = Number(remote.netPrice) || 0;
    }
    if (input.hubKey) {
      const hub = ms.hubs.find((h) => h.key === input.hubKey);
      if (!hub) throw new Error(`unknown_hub: "${input.hubKey}"`);
      motorAmount += Number(hub.netPrice) || 0;
      breakdown.hubNet = Number(hub.netPrice) || 0;
    }
    for (const key of input.accessoryKeys ?? []) {
      const acc = ms.accessories.find((a) => a.key === key);
      if (!acc) throw new Error(`unknown_accessory: "${key}"`);
      motorAmount += Number(acc.netPrice) || 0;
    }
  } else if (option) {
    // AAPP parity: unknown/absent option key contributes $0 (no throw).
    const surcharge = cfg.options[option];
    chainSurcharge = Number.isFinite(surcharge) ? surcharge : 0;
  }

  // v808 floor: finished-product minimum $100 (before motor add-ons).
  const flooredBase = Math.max(fabricAmount + hardwareAmount + chainSurcharge, LUMA_PRICE_FLOOR);
  const controlAmount = chainSurcharge + motorAmount;
  const total = priceInt(flooredBase + motorAmount);
  return {
    total,
    breakdown: {
      variant: input.variant,
      widthIn,
      heightIn,
      sqm: Math.round(sqm * 10000) / 10000,
      billableSqm: Math.round(bSqm * 10000) / 10000,
      widthMeters: Math.round(widthMeters * 10000) / 10000,
      hwBillableMeters: Math.round(hwBillableMeters * 10000) / 10000,
      fabricAmount: round2(fabricAmount),
      hardwareAmount,
      controlAmount,
      priceFloorApplied: flooredBase > fabricAmount + hardwareAmount + chainSurcharge ? 1 : 0,
      ...breakdown,
    },
  };
}
