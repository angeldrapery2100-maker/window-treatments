// Adapter: generic store product configuration → AAPP engine inputs.
//
// A store product OPTS IN to AAPP-parity pricing by setting
// `default_config.params.aapp_engine` to one of:
//   'luma_shade' | 'roman_shade' | 'drapery' | 'drapery_hardware' | 'somfy_track'
// Products without `aapp_engine` keep the legacy UnifiedPricingEngine path —
// nothing changes for them.
//
// Mapping conventions (admin-facing, see docs/aapp-engine-wiring.md):
//   - Option VALUE strings are AAPP keys. E.g. an option named `style` with a
//     selected value `hobbled` maps to styleKey 'hobbled'; `lining` values are
//     NO / LF / BO; `fabric_code` values are Luma family codes like 'ME8'.
//   - Numeric per-value params on option values flow through `optionParams`
//     (e.g. fabric option values carry fabric_price_per_yard / fabric_width_in).
//   - Product-level constants live in baseParams as `aapp_*` keys.
//   - Catalog overrides (fabric $/sqm tables, motor prices, …) can be embedded
//     at `baseParams.aapp_config` and are passed to the engine's `config`.

import { priceLumaShade } from "./lumaShade";
import { priceHandcraftedRoman } from "./romanShade";
import { priceHandcraftedDrapery } from "./drapery";
import { priceDraperyHardware, priceSomfyTrack } from "./hardware";
import type {
  AappPriceResult,
  DeepPartial,
  DraperyHardwareConfig,
  DraperyOperation,
  DraperyStyleFamily,
  LiningType,
  LumaVariantKey,
  RomanMount,
} from "./types";

export interface AappAdapterArgs {
  /** Configurator dimensions in inches (hardware/track: width = length). */
  width: number;
  height: number;
  /** Product default_config.params — carries the aapp_* keys. */
  baseParams: Record<string, any>;
  /** Selected option value strings keyed by option name. */
  options: Record<string, string>;
  /** Merged numeric params of the SELECTED option values (raw keys, un-mapped). */
  optionParams: Record<string, number>;
}

export function isAappConfigured(baseParams: Record<string, any> | null | undefined): boolean {
  return typeof baseParams?.aapp_engine === "string" && baseParams.aapp_engine.length > 0;
}

const RIPPLE_KEY = /^(cn_|us_)/;

function asLining(v: unknown): LiningType {
  return v === "LF" || v === "BO" ? v : "NO";
}

function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

// ── Rod/track hardware mapping (shared by 'drapery_hardware' and the
//    drapery-bundled add-on) ─────────────────────────────────────────────────
// Profile prices are admin data — supplied inline via option params (with
// baseParams.aapp_hw_* fallbacks) rather than a shared catalog. We build a
// single-profile config keyed 'selected'.

interface HardwareMapping {
  /** True when any hw_* pricing value came from the SELECTED option values
   *  (used by the drapery branch to auto-detect a configured add-on). */
  hasOptionPricing: boolean;
  /** True when any price model exists at all (optionParams or baseParams). */
  hasAnyPricing: boolean;
  leftFinialKey?: "left";
  rightFinialKey?: "right";
  config: DeepPartial<DraperyHardwareConfig>;
}

function mapHardwareSelection(
  optionParams: Record<string, number>,
  baseParams: Record<string, any>,
): HardwareMapping {
  const basePrice = num(optionParams.hw_base_price) ?? num(baseParams.aapp_hw_base_price) ?? 0;
  const addPerFoot = num(optionParams.hw_add_per_foot) ?? num(baseParams.aapp_hw_add_per_foot) ?? 0;
  const perFootLegacy = num(optionParams.hw_price_per_foot) ?? num(baseParams.aapp_hw_price_per_foot) ?? 0;
  const leftFinial = num(optionParams.finial_price_left) ?? num(optionParams.finial_price) ?? 0;
  const rightFinial = num(optionParams.finial_price_right) ?? 0;
  return {
    hasOptionPricing: !!(
      num(optionParams.hw_base_price) ||
      num(optionParams.hw_add_per_foot) ||
      num(optionParams.hw_price_per_foot)
    ),
    hasAnyPricing: !!(basePrice || addPerFoot || perFootLegacy),
    leftFinialKey: leftFinial ? "left" : undefined,
    rightFinialKey: rightFinial ? "right" : undefined,
    config: {
      profiles: {
        selected: {
          basePriceAtMinWidth: basePrice,
          addPricePerFoot: addPerFoot,
          minBillableWidthIn:
            num(optionParams.hw_min_width_in) ?? num(baseParams.aapp_hw_min_width_in) ?? 48,
          pricePerFoot: perFootLegacy,
        },
      },
      finials: {
        ...(leftFinial ? { left: { price: leftFinial } } : {}),
        ...(rightFinial ? { right: { price: rightFinial } } : {}),
      },
    },
  };
}

/** Route a generic store configuration to the matching AAPP engine. Throws on
 *  unknown engine keys or unpriceable configurations (fail-closed). */
export function calculateAapp(args: AappAdapterArgs): AappPriceResult {
  const { width, height, baseParams, options, optionParams } = args;
  const engine = String(baseParams.aapp_engine || "");
  const cfgOverride = baseParams.aapp_config && typeof baseParams.aapp_config === "object"
    ? baseParams.aapp_config
    : undefined;

  switch (engine) {
    case "luma_shade": {
      return priceLumaShade({
        variant: (baseParams.aapp_variant || "roller_shade") as LumaVariantKey,
        widthIn: width,
        heightIn: height,
        fabricFullCode: options.fabric_code || undefined,
        frontFabricFullCode: options.front_fabric_code || undefined,
        backFabricFullCode: options.back_fabric_code || undefined,
        cassette: options.cassette || baseParams.aapp_cassette || undefined,
        option: options.control || "plastic_chain",
        motorKey: options.motor || undefined,
        remoteKey: options.remote || undefined,
        hubKey: options.hub || undefined,
        config: cfgOverride,
      });
    }

    case "roman_shade": {
      const pricePerYard = num(optionParams.fabric_price_per_yard) ?? num(baseParams.aapp_fabric_price_per_yard);
      if (!pricePerYard) throw new Error("aapp roman: missing fabric_price_per_yard");
      return priceHandcraftedRoman({
        mount: (options.mount === "outer" ? "outer" : "inner") as RomanMount,
        widthIn: width,
        heightIn: height,
        styleKey: options.style || "flat",
        fabric: {
          pricePerYard,
          widthNormalizedIn:
            num(optionParams.fabric_width_in) ?? num(baseParams.aapp_fabric_width_in) ?? 54,
        },
        lining: { type: asLining(options.lining) },
        valance: { enabled: options.valance === "yes" },
        control: options.control === "motorized"
          ? { type: "motorized", motorKey: options.motor || undefined, remoteKey: options.remote || undefined, hubKey: options.hub || undefined }
          : { type: "manual" },
        config: cfgOverride,
      });
    }

    case "drapery": {
      const styleKey = options.style || baseParams.aapp_style_key || "2fold_pinch";
      const styleFamily: DraperyStyleFamily = RIPPLE_KEY.test(styleKey) ? "ripple" : "pleated";
      const composition = (options.composition || baseParams.aapp_composition || "fabric_only") as
        | "fabric_only" | "sheer_only" | "fabric_plus_sheer";

      const mainPrice = num(optionParams.fabric_price_per_yard) ?? num(baseParams.aapp_fabric_price_per_yard);
      const sheerPrice = num(optionParams.sheer_price_per_yard) ?? num(baseParams.aapp_sheer_price_per_yard);
      const mainEnabled = composition !== "sheer_only";
      const sheerEnabled = composition !== "fabric_only";
      if (mainEnabled && !mainPrice) throw new Error("aapp drapery: missing fabric_price_per_yard");
      if (sheerEnabled && !sheerPrice) throw new Error("aapp drapery: missing sheer_price_per_yard");

      const bandingStyle = options.banding && options.banding !== "none" ? options.banding : undefined;

      // Bundled rod/track add-on (spec §3.6 — the engine prices it via
      // priceDraperyHardware with lengthIn = finishedWidthIn). Enabled by an
      // explicit `hardware: 'yes'` selection, or implicitly when the selected
      // option values carry hw_* pricing and the customer didn't opt out.
      const hw = mapHardwareSelection(optionParams, baseParams);
      const hardwareEnabled =
        options.hardware === "yes" || (hw.hasOptionPricing && options.hardware !== "none");

      return priceHandcraftedDrapery({
        finishedWidthIn: width,
        finishedHeightIn: height,
        composition,
        styleFamily,
        styleKey,
        operation: (options.operation || "split") as DraperyOperation,
        returnIn: num(baseParams.aapp_return_in) ?? 0,
        layers: {
          main: mainEnabled ? {
            enabled: true,
            pricePerYard: mainPrice,
            widthNormalizedIn:
              num(optionParams.fabric_width_in) ?? num(baseParams.aapp_fabric_width_in) ?? 55,
            liningType: asLining(options.lining),
          } : { enabled: false },
          sheer: sheerEnabled ? {
            enabled: true,
            pricePerYard: sheerPrice,
            widthNormalizedIn:
              num(optionParams.sheer_width_in) ?? num(baseParams.aapp_sheer_width_in) ?? 55,
          } : { enabled: false },
        },
        hardware: hardwareEnabled ? {
          enabled: true,
          profileKey: "selected",
          leftFinialKey: hw.leftFinialKey,
          rightFinialKey: hw.rightFinialKey,
        } : undefined,
        hardwareConfig: hardwareEnabled ? hw.config : undefined,
        banding: bandingStyle ? {
          enabled: true,
          countPerPanel: optionParams.banding_count_per_panel === 2 ? 2 : 1,
          styleKey: bandingStyle,
        } : undefined,
        config: cfgOverride,
      });
    }

    case "drapery_hardware": {
      const hw = mapHardwareSelection(optionParams, baseParams);
      if (!hw.hasAnyPricing) {
        throw new Error("aapp hardware: no price model configured (hw_base_price / hw_price_per_foot)");
      }
      return priceDraperyHardware({
        profileKey: "selected",
        lengthIn: width,
        leftFinialKey: hw.leftFinialKey,
        rightFinialKey: hw.rightFinialKey,
        config: hw.config,
      });
    }

    case "somfy_track": {
      return priceSomfyTrack({
        trackType: (options.track_type || baseParams.aapp_track_type || "pinch_pleat") as
          | "pinch_pleat" | "ripplefold",
        widthIn: width,
        openType: options.open_type === "side" ? "side" : "split",
        fullness: (options.fullness as "80" | "100" | "120") || "100",
        motorId: options.motor || baseParams.aapp_motor || undefined,
        doubleLayer: options.double_layer === "yes",
        config: cfgOverride,
      });
    }

    default:
      throw new Error(`Unknown aapp_engine: ${engine}`);
  }
}
