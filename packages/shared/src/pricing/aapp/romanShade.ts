// Handcrafted roman shade pricing (spec §2).
//
// AAPP authority: functions/index.js _priceHandcraftedRoman (:3549-3691);
// client handcraftedRomanCalcPrice app-quotes-roman.js:158, dims :99-155.
//
// Product-only price — no install line exists for roman shades in AAPP
// (visit fee is a quote-level concept and is excluded here).

import type { AappPriceResult, HandcraftedRomanInput } from "./types";
import {
  HANDCRAFTED_ROMAN_DEFAULTS,
  ROMAN_DEFAULT_FABRIC_WIDTH_IN,
  mergeAappConfig,
  priceInt,
  round2,
} from "./constants";

export function priceHandcraftedRoman(input: HandcraftedRomanInput): AappPriceResult {
  const cfg = mergeAappConfig(HANDCRAFTED_ROMAN_DEFAULTS, input.config);

  const rawW = Number(input.widthIn);
  const rawH = Number(input.heightIn);
  if (!Number.isFinite(rawW) || !Number.isFinite(rawH) || rawW <= 0 || rawH <= 0) {
    throw new Error("size_out_of_range: width/height must be positive inches");
  }

  // Mount coverage add (spec §2.1): outer default +5"/+6", inner +0/+0,
  // per-order overridable.
  const mount = input.mount === "outer" ? "outer" : "inner";
  const coverage = cfg.coverage[mount] ?? { widthAddIn: 0, heightAddIn: 0 };
  const widthAdd = input.coverageWidthAddIn ?? coverage.widthAddIn;
  const heightAdd = input.coverageHeightAddIn ?? coverage.heightAddIn;
  const W = rawW + (Number(widthAdd) || 0);
  const H = rawH + (Number(heightAdd) || 0);

  // Style — unknown key falls back to the first style (flat), AAPP parity.
  const style = cfg.styles.find((s) => s.key === input.styleKey) ?? cfg.styles[0];
  if (!style) throw new Error("unknown_style: roman style catalog is empty");
  const laborPerSqFt = Number(style.laborPerSqFt);
  const heightMult = style.heightMult != null ? Number(style.heightMult) : 1;

  // Fabric snapshot.
  const fab = input.fabric ?? {};
  const fabricPerYard =
    fab.manualPriceOverride != null ? Number(fab.manualPriceOverride)
    : fab.pricePerYard != null ? Number(fab.pricePerYard)
    : 0;
  const fabricWidthIn =
    fab.manualWidthOverride != null ? Number(fab.manualWidthOverride)
    : fab.widthNormalizedIn != null ? Number(fab.widthNormalizedIn)
    : ROMAN_DEFAULT_FABRIC_WIDTH_IN;

  // Cut math (spec §2.2).
  const patternRepeatIn = fab.hasPattern && fab.patternRepeatIn != null
    ? Number(fab.patternRepeatIn)
    : 0;
  const N = fabricWidthIn > 0
    ? Math.max(1, Math.ceil((W + cfg.fullnessAddIn) / fabricWidthIn))
    : 0;
  const cutPerPanelIn = H * heightMult + cfg.hemAllowanceIn + patternRepeatIn;
  const fabricYds = N > 0 && cutPerPanelIn > 0 ? (N * cutPerPanelIn) / 36 : 0;

  const lining = input.lining ?? {};
  const liningType = lining.type ?? "NO";
  const liningPerYard = Number(cfg.liningPricePerYard[liningType] ?? 0);
  const liningYds = lining.yardsOverride != null ? Number(lining.yardsOverride) : fabricYds;

  const fabricAmount = round2(fabricYds * fabricPerYard);
  const liningAmount = round2(liningYds * liningPerYard);

  // Labor: finished sqft × net rate × markup (default ×2.0).
  const sqFt = (W / 12) * (H / 12);
  const laborAmount = round2(sqFt * laborPerSqFt * cfg.laborMarkup);

  // Motorization (optional) — all raw netPrice, no markup (Luma model).
  let motorNet = 0;
  let remoteNet = 0;
  let hubNet = 0;
  let accNetTotal = 0;
  const ctrl = input.control ?? {};
  if (ctrl.type === "motorized") {
    const systemKey = ctrl.motorSystemKey ?? "luma";
    const sys = cfg.motorSystems[systemKey];
    if (!sys) throw new Error(`unknown_motor_system: "${systemKey}"`);
    if (ctrl.motorKey) {
      const motor = sys.motors.find((m) => m.key === ctrl.motorKey);
      if (!motor) throw new Error(`unknown_motor: "${ctrl.motorKey}"`);
      motorNet = Number(motor.netPrice) || 0;
    }
    // Remote: charged once on the owner window only.
    if (ctrl.remoteKey && ctrl.remoteOwner !== false) {
      const remote = sys.remotes.find((r) => r.key === ctrl.remoteKey);
      if (!remote) throw new Error(`unknown_remote: "${ctrl.remoteKey}"`);
      remoteNet = Number(remote.netPrice) || 0;
    }
    if (ctrl.hubKey) {
      const hub = sys.hubs.find((h) => h.key === ctrl.hubKey);
      if (!hub) throw new Error(`unknown_hub: "${ctrl.hubKey}"`);
      hubNet = Number(hub.netPrice) || 0;
    }
    for (const key of ctrl.accessoryKeys ?? []) {
      const acc = sys.accessories.find((a) => a.key === key);
      if (!acc) throw new Error(`unknown_accessory: "${key}"`);
      accNetTotal += Number(acc.netPrice) || 0;
    }
  }
  const accessoryAmount = motorNet + remoteNet + hubNet + accNetTotal;

  // Valance: per foot, remainder > 0.1" (epsilon) rounds up to the next foot.
  let valanceAmount = 0;
  let valanceFeet = 0;
  if (input.valance?.enabled) {
    const fullFt = Math.floor(W / 12);
    const leftover = W - fullFt * 12;
    valanceFeet = fullFt + (leftover > 0.1 + 1e-6 ? 1 : 0);
    valanceAmount = round2(valanceFeet * Number(cfg.valance.pricePerFoot || 0));
  }

  // Extra options: netPrice × optionsMarkup (default ×1.5), each round2'd.
  let extraAmount = 0;
  for (const key of input.extraOptionKeys ?? []) {
    const opt = cfg.extraOptions.find((o) => o.key === key);
    if (!opt) throw new Error(`unknown_extra_option: "${key}"`);
    if (Number(opt.netPrice) > 0) {
      extraAmount += round2(Number(opt.netPrice) * cfg.optionsMarkup);
    }
  }

  const subtotal = round2(
    fabricAmount + liningAmount + laborAmount + valanceAmount + extraAmount + accessoryAmount,
  );

  return {
    total: priceInt(subtotal),
    breakdown: {
      mount,
      widthIn: W,
      heightIn: H,
      styleKey: style.key,
      panelCount: N,
      cutPerPanelIn,
      fabricYds: round2(fabricYds),
      fabricPerYard,
      fabricAmount,
      liningType,
      liningYds: round2(liningYds),
      liningAmount,
      sqFt: round2(sqFt),
      laborPerSqFt,
      laborMarkup: cfg.laborMarkup,
      laborAmount,
      motorNet,
      remoteNet,
      hubNet,
      accessoryAmount,
      valanceFeet,
      valanceAmount,
      extraAmount,
      subtotal,
    },
  };
}
