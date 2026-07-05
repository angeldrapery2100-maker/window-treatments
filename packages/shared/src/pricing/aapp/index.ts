// AAPP-parity pricing engines — see docs/aapp-pricing-spec.md.
//
// Four product engines ported 1:1 from the internal AAPP quote builder:
//   priceLumaShade          — Luma roller / zebra / sheer / dual / modern roman (§1)
//   priceHandcraftedRoman   — handcrafted roman shade (§2)
//   priceHandcraftedDrapery — handcrafted drapery incl. sheer/banding/hardware (§3)
//   priceDraperyHardware    — rods & tracks (§4.1)
//   priceSomfyTrack         — SOMFY motorized track (§4.2)
//
// All results are PRODUCT-ONLY prices: installation, visit fee, tax,
// discounts and deposits are excluded (spec §0.3 / §6).

export * from "./types";
export * from "./constants";
export * from "./adapter";
export * from "./lumaShade";
export * from "./romanShade";
export * from "./drapery";
export * from "./hardware";
