// Luma shade pricing (spec §1).
//
// AAPP authority: functions/index.js _priceLumaShade (:7848-7929);
// client shadeCalcPrice app-quotes-shades.js:638.
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

  // Area math (spec §1.2): sqm = W × (H + 12) / 1550, billed at min 1 sqm.
  const sqm = (widthIn * (heightIn + LUMA_SQM_HEIGHT_ADD_IN)) / LUMA_SQM_DIVISOR;
  const bSqm = sqm <= 0 ? 0 : sqm < 1 ? 1 : sqm;
  const widthMeters = widthIn * INCH_TO_METER;

  // Fabric slot(s) — each slot round2'd, then summed.
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
    const amt = round2(bSqm * pricePerSqm);
    fabricAmount += amt;
    breakdown[`${slot.key}Amount`] = amt;
  }

  // Cassette hardware — per meter of width.
  let cassettePerMeter = 0;
  if (input.cassette) {
    const cassette = variant.cassettes.find((c) => c.key === input.cassette);
    if (!cassette) {
      throw new Error(`unknown_cassette: "${input.cassette}" not found for ${input.variant}`);
    }
    cassettePerMeter = Number(cassette.pricePerMeter) || 0;
  }
  const hardwareAmount = round2(widthMeters * cassettePerMeter);

  // Control: motorized → motor system net prices (no markup, Luma model);
  // otherwise the option surcharge table.
  let controlAmount = 0;
  const option = input.option ?? "";
  if (option === "motorized") {
    const ms = cfg.motorSystem;
    const motor = input.motorKey
      ? ms.motors.find((m) => m.key === input.motorKey)
      : ms.motors[0];
    if (!motor) {
      throw new Error(`unknown_motor: "${input.motorKey ?? "(none configured)"}"`);
    }
    controlAmount += Number(motor.netPrice) || 0;
    breakdown.motorNet = Number(motor.netPrice) || 0;
    // Remote is charged once per owner window (shareable across windows).
    if (input.remoteKey && input.remoteOwner !== false) {
      const remote = ms.remotes.find((r) => r.key === input.remoteKey);
      if (!remote) throw new Error(`unknown_remote: "${input.remoteKey}"`);
      controlAmount += Number(remote.netPrice) || 0;
      breakdown.remoteNet = Number(remote.netPrice) || 0;
    }
    if (input.hubKey) {
      const hub = ms.hubs.find((h) => h.key === input.hubKey);
      if (!hub) throw new Error(`unknown_hub: "${input.hubKey}"`);
      controlAmount += Number(hub.netPrice) || 0;
      breakdown.hubNet = Number(hub.netPrice) || 0;
    }
    for (const key of input.accessoryKeys ?? []) {
      const acc = ms.accessories.find((a) => a.key === key);
      if (!acc) throw new Error(`unknown_accessory: "${key}"`);
      controlAmount += Number(acc.netPrice) || 0;
    }
  } else if (option) {
    // AAPP parity: unknown/absent option key contributes $0 (no throw).
    const surcharge = cfg.options[option];
    controlAmount = Number.isFinite(surcharge) ? surcharge : 0;
  }

  const total = priceInt(fabricAmount + hardwareAmount + controlAmount);
  return {
    total,
    breakdown: {
      variant: input.variant,
      widthIn,
      heightIn,
      sqm: Math.round(sqm * 10000) / 10000,
      billableSqm: Math.round(bSqm * 10000) / 10000,
      widthMeters: Math.round(widthMeters * 10000) / 10000,
      fabricAmount: round2(fabricAmount),
      hardwareAmount,
      controlAmount,
      ...breakdown,
    },
  };
}
