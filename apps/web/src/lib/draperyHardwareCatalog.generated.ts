// GENERATED from AAPP library.draperyHardwareCatalog (exported 2026-08-10).
// Regenerate: in the AAPP app console run
//   copy(JSON.stringify(state.library.draperyHardwareCatalog))
// then re-run the extraction in git history for this file.
//
// WHAT IS AND ISN'T HERE
// Taxonomy + one valid colour per profile. Deliberately NO PRICES: every
// figure comes from AAPP at request time (variant `drapery_hardware`), so this
// table can never drift from a real quote. It exists only because AAPP's
// `_priceDraperyHardware` rejects a call with a bare `missing_profile` — no
// list of what it would accept — and `libraryExport` doesn't ship the catalog.
//
// THREE THINGS THE ENGINE MADE US LEARN THE HARD WAY:
//  1. `colorKey` is REQUIRED whenever the profile has a palette (all of them
//     do, via products[productKey].colorPalette) but it feeds NO price maths —
//     it is a pure validation gate. So we fill it silently; it is price-neutral.
//  2. `isTrackType` is FALSE for every H-rail, so classifying "pole vs track"
//     off that flag puts H-rails on the pole side. We classify by FAMILY.
//  3. Some profiles carry no price at all (the motorised H-rails were all
//     base 0 / perFoot 0 when this was generated) and AAPP answers
//     `missing_price`. We do NOT pre-filter those: callers try every matching
//     profile and let the failures drop out, so the day someone fills those
//     prices in, quoting starts working with no code change here.

export interface HardwareProfileRow {
  key: string
  family: string
  /** What a customer would call it. H-rails count as tracks. */
  kind: 'pole' | 'track'
  mount: 'wall' | 'ceiling'
  layer: 'single' | 'double'
  motorized: boolean
  /** Internal label — for logs and designer notes, never read to a customer. */
  label: string
  /** First colour in the profile's palette. Price-neutral; satisfies the gate. */
  color: string | null
}

export const HARDWARE_PROFILES: HardwareProfileRow[] = [
  { key: "metal_rod_double_1_3_8_1_1_8_wall",     family: "metal_rod",                 kind: "pole",   mount: "wall",     layer: "double",  motorized: false, color: "Matte Black",       label: "metal_rod — Double Metal Rod (1 3/8\" + 1 1/8\")" },
  { key: "metal_rod_double_1_3_8_1_3_8_wall",     family: "metal_rod",                 kind: "pole",   mount: "wall",     layer: "double",  motorized: false, color: "Matte Black",       label: "metal_rod — Double Metal Rod (1 3/8\" + 1 3/8\")" },
  { key: "wood_pole_double_2in_1_3_8_wall",       family: "wood_pole",                 kind: "pole",   mount: "wall",     layer: "double",  motorized: false, color: "Black",             label: "wood_pole — Double Wood Pole (2\" + 1 3/8\")" },
  { key: "metal_rod_single_1_1_8_wall",           family: "metal_rod",                 kind: "pole",   mount: "wall",     layer: "single",  motorized: false, color: "Matte Black",       label: "metal_rod — Single Metal Rod 1 1/8\"" },
  { key: "metal_rod_single_1_3_8_wall",           family: "metal_rod",                 kind: "pole",   mount: "wall",     layer: "single",  motorized: false, color: "Matte Black",       label: "metal_rod — Single Metal Rod 1 3/8\"" },
  { key: "wood_pole_single_1_3_8_wall",           family: "wood_pole",                 kind: "pole",   mount: "wall",     layer: "single",  motorized: false, color: "Black",             label: "wood_pole — Single 1 3/8\" Wood Pole" },
  { key: "wood_pole_single_2in_wall",             family: "wood_pole",                 kind: "pole",   mount: "wall",     layer: "single",  motorized: false, color: "Black",             label: "wood_pole — Single 2\" Wood Pole" },
  { key: "aluminum_ceiling_track_double",         family: "aluminum_ceiling_track",    kind: "track",  mount: "ceiling",  layer: "double",  motorized: false, color: "White",             label: "aluminum_ceiling_track — Double Track" },
  { key: "aluminum_track_double_wall",            family: "aluminum_track",            kind: "track",  mount: "wall",     layer: "double",  motorized: false, color: "White",             label: "aluminum_track — Double Track" },
  { key: "ceiling_h_rail_double",                 family: "ceiling_h_rail",            kind: "track",  mount: "ceiling",  layer: "double",  motorized: false, color: "Matte Black",       label: "ceiling_h_rail — Double H-Rail" },
  { key: "h_rail_double_1_3_8_1_1_8_wall",        family: "h_rail",                    kind: "track",  mount: "wall",     layer: "double",  motorized: false, color: "Matte Black",       label: "h_rail — Double H-Rail (1 3/8\" + 1 1/8\")" },
  { key: "h_rail_double_1_3_8_1_3_8_wall",        family: "h_rail",                    kind: "track",  mount: "wall",     layer: "double",  motorized: false, color: "Matte Black",       label: "h_rail — Double H-Rail (1 3/8\" + 1 3/8\")" },
  { key: "aluminum_ceiling_track_single",         family: "aluminum_ceiling_track",    kind: "track",  mount: "ceiling",  layer: "single",  motorized: false, color: "White",             label: "aluminum_ceiling_track — Single Track" },
  { key: "aluminum_track_single_wall",            family: "aluminum_track",            kind: "track",  mount: "wall",     layer: "single",  motorized: false, color: "White",             label: "aluminum_track — Single Track" },
  { key: "ceiling_h_rail_single",                 family: "ceiling_h_rail",            kind: "track",  mount: "ceiling",  layer: "single",  motorized: false, color: "Matte Black",       label: "ceiling_h_rail — Single H-Rail" },
  { key: "h_rail_single_1_1_8_wall",              family: "h_rail",                    kind: "track",  mount: "wall",     layer: "single",  motorized: false, color: "Matte Black",       label: "h_rail — Single H-Rail 1 1/8\"" },
  { key: "h_rail_single_1_3_8_wall",              family: "h_rail",                    kind: "track",  mount: "wall",     layer: "single",  motorized: false, color: "Matte Black",       label: "h_rail — Single H-Rail 1 3/8\"" },
  { key: "motorized_ceiling_h_rail_double",       family: "motorized_ceiling_h_rail",  kind: "track",  mount: "ceiling",  layer: "double",  motorized: true,  color: "Matte Black",       label: "motorized_ceiling_h_rail — Double Motorized H-Rail" },
  { key: "motorized_ceiling_track_double",        family: "motorized_ceiling_track",   kind: "track",  mount: "ceiling",  layer: "double",  motorized: true,  color: "White",             label: "motorized_ceiling_track — Double Track" },
  { key: "motorized_h_rail_double",               family: "motorized_h_rail",          kind: "track",  mount: "wall",     layer: "double",  motorized: true,  color: "Matte Black",       label: "motorized_h_rail — Double Motorized H-Rail" },
  { key: "motorized_track_double_wall",           family: "motorized_track",           kind: "track",  mount: "wall",     layer: "double",  motorized: true,  color: "White",             label: "motorized_track — Double Track" },
  { key: "motorized_ceiling_h_rail_single",       family: "motorized_ceiling_h_rail",  kind: "track",  mount: "ceiling",  layer: "single",  motorized: true,  color: "Matte Black",       label: "motorized_ceiling_h_rail — Single Motorized H-Rail" },
  { key: "motorized_ceiling_track_single",        family: "motorized_ceiling_track",   kind: "track",  mount: "ceiling",  layer: "single",  motorized: true,  color: "White",             label: "motorized_ceiling_track — Single Track" },
  { key: "motorized_h_rail_single",               family: "motorized_h_rail",          kind: "track",  mount: "wall",     layer: "single",  motorized: true,  color: "Matte Black",       label: "motorized_h_rail — Single Motorized H-Rail" },
  { key: "motorized_track_single_wall",           family: "motorized_track",           kind: "track",  mount: "wall",     layer: "single",  motorized: true,  color: "White",             label: "motorized_track — Single Track" },
]

/** Poles are never motorised in this catalog — used to skip a pointless
 *  question when the customer has already said "rod". */
export const POLE_FAMILIES = ["metal_rod", "wood_pole"]

