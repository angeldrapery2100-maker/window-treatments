// AAPP-parity pricing engine tests.
//
// The 10 numbered cases (L1-L3, R1-R2, D1-D3, H1-H2) are the spec §7
// benchmark cases from docs/aapp-pricing-spec.md — expected totals are
// hand-calculated there step by step and verified against the AAPP source
// (functions/index.js _price* functions). Do NOT adjust an expected value
// to make a test pass; fix the implementation instead.

import { describe, it, expect } from "vitest";
import {
  priceLumaShade,
  priceHandcraftedRoman,
  priceHandcraftedDrapery,
  priceDraperyHardware,
  priceSomfyTrack,
  hardwareBilledFeet,
} from "../aapp";
import type {
  DraperyHardwareConfig,
  DeepPartial,
  HandcraftedDraperyInput,
} from "../aapp";

// ────────────────────────────────────────────────────────────────────────────
// §1 Luma shades
// ────────────────────────────────────────────────────────────────────────────

describe("AAPP Luma shade (spec §1)", () => {
  it("L1 — roller 60×72, ME8, round_fabric cassette, plastic chain → $226", () => {
    const r = priceLumaShade({
      variant: "roller_shade",
      widthIn: 60,
      heightIn: 72,
      fabricFullCode: "ME8-005",
      cassette: "round_fabric",
      option: "plastic_chain",
    });
    // sqm = 60×84/1550 = 3.2516129
    expect(r.breakdown.sqm).toBeCloseTo(3.2516, 4);
    expect(r.breakdown.billableSqm).toBeCloseTo(3.2516, 4);
    expect(r.breakdown.fabricAmount).toBe(195.78); // round2(3.2516129 × 60.21)
    expect(r.breakdown.hardwareAmount).toBe(30.48); // round2(60 × 0.0254 × 20)
    expect(r.breakdown.controlAmount).toBe(0);
    expect(r.total).toBe(226);
  });

  it("L2 — roller 24×36, MB2, open roll, stainless chain (min 1 sqm) → $93", () => {
    const r = priceLumaShade({
      variant: "roller_shade",
      widthIn: 24,
      heightIn: 36,
      fabricFullCode: "MB2-103",
      cassette: "open_roll",
      option: "stainless_chain",
    });
    // sqm = 24×48/1550 = 0.7432 < 1 → billed at 1 sqm
    expect(r.breakdown.sqm).toBeCloseTo(0.7432, 4);
    expect(r.breakdown.billableSqm).toBe(1);
    expect(r.breakdown.fabricAmount).toBe(77.76);
    expect(r.breakdown.hardwareAmount).toBe(0);
    expect(r.breakdown.controlAmount).toBe(15);
    expect(r.total).toBe(93);
  });

  it("L3 — zebra 80×90, DB8, square cassette, cordless → $811", () => {
    const r = priceLumaShade({
      variant: "zebra_shade",
      widthIn: 80,
      heightIn: 90,
      fabricFullCode: "DB8-001",
      cassette: "square",
      option: "cordless",
    });
    expect(r.breakdown.fabricAmount).toBe(732.82); // round2(5.2645161 × 139.20)
    expect(r.breakdown.hardwareAmount).toBe(28.45); // round2(2.032 × 14)
    expect(r.breakdown.controlAmount).toBe(50);
    expect(r.total).toBe(811);
  });

  it("edge — billable sqm floors at exactly 1 sqm (25×50 → sqm = 1)", () => {
    // 25 × (50+12) / 1550 = 1550/1550 = 1 exactly
    const exact = priceLumaShade({
      variant: "roller_shade",
      widthIn: 25,
      heightIn: 50,
      fabricFullCode: "ME8-005",
      option: "plastic_chain",
    });
    expect(exact.breakdown.sqm).toBe(1);
    expect(exact.breakdown.billableSqm).toBe(1);
    expect(exact.breakdown.fabricAmount).toBe(60.21);

    // Just below the boundary still bills 1 sqm
    const below = priceLumaShade({
      variant: "roller_shade",
      widthIn: 24.5,
      heightIn: 50,
      fabricFullCode: "ME8-005",
      option: "plastic_chain",
    });
    expect(Number(below.breakdown.sqm)).toBeLessThan(1);
    expect(below.breakdown.billableSqm).toBe(1);
    expect(below.breakdown.fabricAmount).toBe(60.21);

    // Just above the boundary bills the actual area
    const above = priceLumaShade({
      variant: "roller_shade",
      widthIn: 26,
      heightIn: 50,
      fabricFullCode: "ME8-005",
      option: "plastic_chain",
    });
    expect(Number(above.breakdown.billableSqm)).toBeGreaterThan(1);
  });

  it("edge — max width 118 / max height 120 validation throws", () => {
    expect(() =>
      priceLumaShade({
        variant: "roller_shade",
        widthIn: 119,
        heightIn: 60,
        fabricFullCode: "ME8-005",
      }),
    ).toThrow(/size_out_of_range/);
    expect(() =>
      priceLumaShade({
        variant: "roller_shade",
        widthIn: 118,
        heightIn: 121,
        fabricFullCode: "ME8-005",
      }),
    ).toThrow(/size_out_of_range/);
    // exactly at the limit is fine
    expect(() =>
      priceLumaShade({
        variant: "roller_shade",
        widthIn: 118,
        heightIn: 120,
        fabricFullCode: "ME8-005",
      }),
    ).not.toThrow();
  });

  it("edge — unknown fabric family code throws", () => {
    expect(() =>
      priceLumaShade({
        variant: "roller_shade",
        widthIn: 60,
        heightIn: 72,
        fabricFullCode: "ZZ99-001",
      }),
    ).toThrow(/unknown_fabric_code/);
  });

  it("dual variant sums both fabric slots (dual_sheer: front→sheer, back→roller)", () => {
    const r = priceLumaShade({
      variant: "dual_sheer_shade",
      widthIn: 25,
      heightIn: 50, // exactly 1 sqm → amounts are the raw table prices
      frontFabricFullCode: "E8-001", // sheer table $123.03
      backFabricFullCode: "ME8-005", // roller table $60.21
      cassette: "5inch_square",
      option: "plastic_chain",
    });
    expect(r.breakdown.frontFabricAmount).toBe(123.03);
    expect(r.breakdown.backFabricAmount).toBe(60.21);
    expect(r.breakdown.fabricAmount).toBe(183.24);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// §2 Handcrafted roman shade
// ────────────────────────────────────────────────────────────────────────────

describe("AAPP handcrafted roman shade (spec §2)", () => {
  it("R1 — flat, inner 36×48, $40/yd 54\", BO lining → $391", () => {
    const r = priceHandcraftedRoman({
      mount: "inner",
      widthIn: 36,
      heightIn: 48,
      styleKey: "flat",
      fabric: { pricePerYard: 40, widthNormalizedIn: 54 },
      lining: { type: "BO" },
    });
    // inner mount: no coverage add
    expect(r.breakdown.widthIn).toBe(36);
    expect(r.breakdown.heightIn).toBe(48);
    expect(r.breakdown.panelCount).toBe(1); // ceil((36+6)/54)
    expect(r.breakdown.cutPerPanelIn).toBe(68); // 48×1.0 + 20
    expect(r.breakdown.fabricYds).toBeCloseTo(1.89, 2);
    expect(r.breakdown.fabricAmount).toBe(75.56); // round2(1.8889 × 40)
    expect(r.breakdown.liningAmount).toBe(15.11); // round2(1.8889 × 8)
    expect(r.breakdown.sqFt).toBe(12);
    expect(r.breakdown.laborAmount).toBe(300); // round2(12 × 12.5 × 2.0)
    expect(r.total).toBe(391);
  });

  it("R2 — hobbled, outer 44×60 (+5/+6), $55/yd, LF, valance → $1127", () => {
    const r = priceHandcraftedRoman({
      mount: "outer",
      widthIn: 44,
      heightIn: 60,
      styleKey: "hobbled",
      fabric: { pricePerYard: 55, widthNormalizedIn: 54 },
      lining: { type: "LF" },
      valance: { enabled: true },
    });
    expect(r.breakdown.widthIn).toBe(49); // 44 + 5
    expect(r.breakdown.heightIn).toBe(66); // 60 + 6
    expect(r.breakdown.panelCount).toBe(2); // ceil((49+6)/54)
    expect(r.breakdown.cutPerPanelIn).toBe(119); // 66×1.5 + 20
    expect(r.breakdown.fabricAmount).toBe(363.61); // round2(6.6111 × 55)
    expect(r.breakdown.liningAmount).toBe(39.67); // round2(6.6111 × 6)
    expect(r.breakdown.laborAmount).toBe(673.75); // round2(22.4583 × 15 × 2.0)
    expect(r.breakdown.valanceFeet).toBe(5); // floor(49/12)=4, 1" leftover > 0.1
    expect(r.breakdown.valanceAmount).toBe(50);
    expect(r.total).toBe(1127);
  });

  it("edge — outer mount applies default +5\"/+6\" coverage (overridable)", () => {
    const def = priceHandcraftedRoman({
      mount: "outer",
      widthIn: 36,
      heightIn: 48,
      fabric: { pricePerYard: 40 },
    });
    expect(def.breakdown.widthIn).toBe(41);
    expect(def.breakdown.heightIn).toBe(54);

    const overridden = priceHandcraftedRoman({
      mount: "outer",
      widthIn: 36,
      heightIn: 48,
      coverageWidthAddIn: 2,
      coverageHeightAddIn: 3,
      fabric: { pricePerYard: 40 },
    });
    expect(overridden.breakdown.widthIn).toBe(38);
    expect(overridden.breakdown.heightIn).toBe(51);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// §3 Handcrafted drapery
// ────────────────────────────────────────────────────────────────────────────

const D1_INPUT: HandcraftedDraperyInput = {
  finishedWidthIn: 100,
  finishedHeightIn: 96,
  styleFamily: "pleated",
  styleKey: "2fold_pinch",
  operation: "split",
  layers: {
    main: { enabled: true, pricePerYard: 30, widthNormalizedIn: 55, liningType: "NO" },
  },
};

describe("AAPP handcrafted drapery (spec §3)", () => {
  it("D1 — pleated 2fold, split, 100×96, $30/yd 55\", no lining → $660", () => {
    const r = priceHandcraftedDrapery(D1_INPUT);
    // solver: npBase=round(50/4.375)=11 → np=11, spacing 50/12≈4.167
    expect(r.breakdown.mainNp).toBe(11);
    expect(r.breakdown.mainWps).toBe(2.5); // ceil(118/55/0.5)×0.5
    expect(r.breakdown.mainPerSide).toBe(137.5); // 2.5 × 55
    expect(r.breakdown.mainOrientation).toBe("vertical");
    expect(r.breakdown.mainFaceYds).toBe(16); // ceilHalfYd(2.5×112/36×2)
    expect(r.breakdown.mainFabricAmt).toBe(480);
    expect(r.breakdown.mainLaborWps).toBe(6); // ceil(137.5/50/0.5)×0.5×2
    expect(r.breakdown.mainLaborAmt).toBe(180); // 6 × $30 (NO tier)
    expect(r.total).toBe(660);
  });

  it("D2 — ripple cn_6cm, split, 120×100, $45/yd 118\" railroaded, BO lining → $660", () => {
    const r = priceHandcraftedDrapery({
      finishedWidthIn: 120,
      finishedHeightIn: 100,
      styleFamily: "ripple",
      styleKey: "cn_6cm",
      operation: "split",
      returnIn: 0,
      layers: {
        main: { enabled: true, pricePerYard: 45, widthNormalizedIn: 118, liningType: "BO" },
      },
    });
    // auto orientation: 118 ≥ 110 and 100 ≤ 118−16=102 → railroaded
    expect(r.breakdown.mainOrientation).toBe("railroaded");
    expect(r.breakdown.mainNp).toBe(26); // ceilToEven((60−3)/2.3622)
    expect(r.breakdown.mainPerSide).toBe(134.95); // round2(26×4.9213 + 7)
    expect(r.breakdown.mainFaceYds).toBe(7.5); // ceilHalfYd(134.95/36×2)
    expect(r.breakdown.mainFabricAmt).toBe(337.5);
    expect(r.breakdown.mainLiningWps).toBe(2.5); // ceil(134.95/55/0.5)×0.5
    expect(r.breakdown.mainLiningYds).toBe(16.5); // ceilHalfYd(2.5×116/36×2)
    expect(r.breakdown.mainLiningAmt).toBe(132); // 16.5 × $8
    expect(r.breakdown.mainLaborWps).toBe(5); // 2.5 × 2 sides
    expect(r.breakdown.mainLaborAmt).toBe(190); // 5 × $38 (BO tier)
    // 337.5 + 132 + 190 = 659.5 → priceInt → 660
    expect(r.breakdown.subtotalRaw).toBeCloseTo(659.5, 10);
    expect(r.total).toBe(660);
  });

  it("D3 — D1 + banding (1 per panel, banding_std $15/yd) → $905", () => {
    const r = priceHandcraftedDrapery({
      ...D1_INPUT,
      banding: { enabled: true, countPerPanel: 1, styleKey: "banding_std" },
    });
    expect(r.breakdown.bandingTotalCount).toBe(2); // 1 × 2 panels
    expect(r.breakdown.bandingLengthPerPieceIn).toBe(102); // 96 + 6
    expect(r.breakdown.bandingYardage).toBeCloseTo(5.6667, 4);
    expect(r.breakdown.bandingFabricAmt).toBeCloseTo(85, 10); // 5.6667 × 15
    expect(r.breakdown.bandingLaborAmt).toBeCloseTo(160, 10); // (96/12) × 10 × 2
    expect(r.breakdown.bandingTotal).toBeCloseTo(245, 10);
    expect(r.total).toBe(905); // 660 + 245
  });

  it("edge — no_spacing_solution throws (panel too narrow for min spacing)", () => {
    expect(() =>
      priceHandcraftedDrapery({
        ...D1_INPUT,
        finishedWidthIn: 12, // split → panelW 6" → spacing ≤ 3" < 4" min for all np
      }),
    ).toThrow(/no_spacing_solution/);
  });

  it("sheer layer uses the $26/panel default labor rate (spec §3.4)", () => {
    const r = priceHandcraftedDrapery({
      finishedWidthIn: 100,
      finishedHeightIn: 96,
      composition: "sheer_only",
      styleFamily: "pleated",
      styleKey: "2fold_pinch",
      operation: "split",
      layers: {
        sheer: { enabled: true, pricePerYard: 12, widthNormalizedIn: 55 },
      },
    });
    // same solver geometry as D1 → yds 16, laborWps 6
    expect(r.breakdown.sheerYds).toBe(16);
    expect(r.breakdown.sheerLaborWps).toBe(6);
    expect(r.breakdown.sheerLaborAmt).toBe(156); // 6 × $26
    expect(r.breakdown.sheerFabricAmt).toBe(192); // 16 × $12
    expect(r.total).toBe(348);
  });

  it("bundled hardware is added via the hardware engine at lengthIn = finished width", () => {
    const hardwareConfig: DeepPartial<DraperyHardwareConfig> = {
      profiles: {
        metal_rod_single: { basePriceAtMinWidth: 120, addPricePerFoot: 18, minBillableWidthIn: 48 },
      },
    };
    const r = priceHandcraftedDrapery({
      ...D1_INPUT,
      hardware: { enabled: true, profileKey: "metal_rod_single" },
      hardwareConfig,
    });
    // 100" → 9 billed ft → 120 + 5×18 = 210 (H1 math)
    expect(r.breakdown.hardwareBilledFeet).toBe(9);
    expect(r.breakdown.hardwareSubtotal).toBe(210);
    expect(r.total).toBe(870); // 660 + 210
  });
});

// ────────────────────────────────────────────────────────────────────────────
// §4.1 Drapery hardware
// ────────────────────────────────────────────────────────────────────────────

const H1_CONFIG: DeepPartial<DraperyHardwareConfig> = {
  profiles: {
    metal_rod_single_1_3_8_wall: {
      basePriceAtMinWidth: 120,
      addPricePerFoot: 18,
      minBillableWidthIn: 48,
    },
    legacy_rod: { pricePerFoot: 20 },
  },
};

describe("AAPP drapery hardware (spec §4.1)", () => {
  it("H1 — 100\" rod, base $120 @ 4 ft + $18/ft → $210", () => {
    const r = priceDraperyHardware({
      profileKey: "metal_rod_single_1_3_8_wall",
      lengthIn: 100,
      config: H1_CONFIG,
    });
    expect(r.breakdown.billedFeet).toBe(9); // ceil((100−0.1)/12)
    expect(r.breakdown.minBillableFt).toBe(4);
    expect(r.breakdown.baseAmt).toBe(210); // 120 + (9−4)×18
    expect(r.total).toBe(210);
  });

  it("edge — minimum 1 billed foot for short rods", () => {
    expect(hardwareBilledFeet(5)).toBe(1);
    expect(hardwareBilledFeet(12)).toBe(1); // ceil(11.9/12) = 1
    expect(hardwareBilledFeet(12.05)).toBe(1); // 0.1" float tolerance
    expect(hardwareBilledFeet(12.2)).toBe(2);
    const r = priceDraperyHardware({
      profileKey: "legacy_rod",
      lengthIn: 5,
      config: H1_CONFIG,
    });
    expect(r.breakdown.billedFeet).toBe(1);
    expect(r.total).toBe(20); // legacy model: 1 ft × $20
  });

  it("edge — 0.1\" tolerance keeps 144.05\" at 12 ft", () => {
    expect(hardwareBilledFeet(144.05)).toBe(12);
    expect(hardwareBilledFeet(144.2)).toBe(13);
  });

  it("finials and accessories are added at catalog price", () => {
    const r = priceDraperyHardware({
      profileKey: "legacy_rod",
      lengthIn: 100,
      leftFinialKey: "ball",
      rightFinialKey: "ball",
      accessorySelections: [{ key: "bracket", count: 3 }],
      config: {
        profiles: { legacy_rod: { pricePerFoot: 20 } },
        finials: { ball: { price: 12 } },
        accessories: { bracket: { price: 5 } },
      },
    });
    // 9 ft × 20 + 2×12 + 3×5 = 180 + 24 + 15
    expect(r.breakdown.baseAmt).toBe(180);
    expect(r.breakdown.finialAmt).toBe(24);
    expect(r.breakdown.accessoryAmt).toBe(15);
    expect(r.total).toBe(219);
  });

  it("edge — unknown profile key throws", () => {
    expect(() =>
      priceDraperyHardware({ profileKey: "nope", lengthIn: 100, config: H1_CONFIG }),
    ).toThrow(/unknown_profile/);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// §4.2 SOMFY motorized track
// ────────────────────────────────────────────────────────────────────────────

describe("AAPP SOMFY motorized track (spec §4.2)", () => {
  it("H2 — pinch pleat 100\" split + glydea60 + 1× situo1_rts → $2575.65", () => {
    const r = priceSomfyTrack({
      trackType: "pinch_pleat",
      widthIn: 100,
      openType: "split",
      motorId: "glydea60",
      accessories: [{ id: "situo1_rts", qty: 1 }],
    });
    expect(r.breakdown.trackRetail).toBe(896); // first row w ≥ 100 → w=108
    expect(r.breakdown.trackSell).toBe(571.65); // round2(896 × 0.29 × 2.2)
    expect(r.breakdown.motorSell).toBe(1920);
    expect(r.breakdown.unitPrice).toBeCloseTo(2491.65, 10);
    expect(r.breakdown.accTotal).toBe(84); // round2(56 × 1.5) × 1
    expect(r.total).toBe(2575.65); // keeps 2 decimals — NOT integer-rounded
  });

  it("edge — width beyond 432\" uses the last retail row", () => {
    const r = priceSomfyTrack({
      trackType: "pinch_pleat",
      widthIn: 500,
      openType: "split",
    });
    expect(r.breakdown.trackRetail).toBe(2688); // last pinch-pleat row (w=432)
    expect(r.total).toBe(1714.94); // round2(2688 × 0.29 × 2.2), no motor
  });

  it("ripplefold uses (s|o)+fullness column and doubleLayer doubles track+motor", () => {
    const single = priceSomfyTrack({
      trackType: "ripplefold",
      widthIn: 100,
      openType: "side",
      fullness: "120",
      motorId: "glydea35",
    });
    // row w=108, o120 = 1100 → trackSell = round2(1100 × 0.638) = 701.80
    expect(single.breakdown.trackRetail).toBe(1100);
    expect(single.breakdown.trackSell).toBe(701.8);
    expect(single.total).toBe(2341.8); // 1640 + 701.80

    const dbl = priceSomfyTrack({
      trackType: "ripplefold",
      widthIn: 100,
      openType: "side",
      fullness: "120",
      motorId: "glydea35",
      doubleLayer: true,
    });
    expect(dbl.total).toBe(4683.6);
  });

  it("edge — unknown motor id throws", () => {
    expect(() =>
      priceSomfyTrack({ trackType: "pinch_pleat", widthIn: 100, motorId: "nope" }),
    ).toThrow(/unknown_motor/);
  });
});
