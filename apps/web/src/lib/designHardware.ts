/**
 * The exact rods and tracks /design offers, and the options AAPP will price
 * on each one.
 *
 * WHY THIS EXISTS
 * The customer picks "wood pole"; AAPP prices a `profileKey`. Between those
 * two sits a real choice — a 2" wood pole is $180 at four feet and a 1 3/8"
 * one is $110 — so the website has to ask which, or quote a range that helps
 * nobody. Everything here is taxonomy read out of AAPP's own catalogue; not
 * one price lives in this repo.
 */
import { HARDWARE_PROFILES, type HardwareChoice, type HardwareProfileRow } from '@/lib/draperyHardwareCatalog.generated'
import type { HardwareType, MountType } from '@window-treatments/shared/design'

/**
 * Eddie's three customer-facing choices, mapped onto AAPP families.
 * Ceiling-mounted aluminium track is a SEPARATE family in AAPP, not a mount
 * flag on the wall one — which is why this is a table and not a filter.
 * Metal rod, motorised anything, and the ceiling H-rail are all real AAPP
 * families that /design deliberately does not sell.
 */
const FAMILY_BY_MOUNT: Record<HardwareType, Partial<Record<MountType, string>>> = {
  wood_pole: { wall: 'wood_pole' },
  alu_track: { wall: 'aluminum_track', ceiling: 'aluminum_ceiling_track' },
  h_rail: { wall: 'h_rail' },
}

/** Single-layer only: /design has no sheer layer, so a double rod would be
 *  quoting hardware for a curtain the customer isn't buying. */
export function designProfiles(hardware: HardwareType, mount: MountType): HardwareProfileRow[] {
  const family = FAMILY_BY_MOUNT[hardware]?.[mount]
  if (!family) return []
  return HARDWARE_PROFILES.filter((p) => p.family === family && p.layer === 'single' && !p.motorized)
}

export function designProfile(hardware: HardwareType, mount: MountType, profileKey?: string | null): HardwareProfileRow | null {
  const list = designProfiles(hardware, mount)
  if (!list.length) return null
  return list.find((p) => p.key === profileKey) || list[0]
}

/** True when the customer has a real decision to make rather than one option. */
export function hasProfileChoice(hardware: HardwareType, mount: MountType): boolean {
  return designProfiles(hardware, mount).length > 1
}

export function colorsFor(profile: HardwareProfileRow | null): HardwareChoice[] {
  return profile ? profile.colors : []
}

export function finialsFor(profile: HardwareProfileRow | null): HardwareChoice[] {
  return profile && profile.canHaveFinial ? profile.finials : []
}

/** Whichever of the customer's picks AAPP will accept, falling back to the
 *  first valid one. Keeps a stale link from producing `missing_color`. */
export function resolveHardwareSelection(
  hardware: HardwareType,
  mount: MountType,
  picks: { profileKey?: string | null; colorKey?: string | null; finialKey?: string | null }
): { profile: HardwareProfileRow; colorKey: string | null; finialKey: string | null } | null {
  const profile = designProfile(hardware, mount, picks.profileKey)
  if (!profile) return null
  const colors = colorsFor(profile)
  const finials = finialsFor(profile)
  return {
    profile,
    // colorKey is a validation gate in AAPP, never a price input — so a
    // fallback here is a default, not an assumption worth disclosing.
    colorKey: colors.find((c) => c.key === picks.colorKey)?.key || colors[0]?.key || null,
    // A finial IS a price input, so there is no silent fallback: no pick
    // means no finial, and the estimate says the ends are quoted separately.
    finialKey: finials.find((f) => f.key === picks.finialKey)?.key || null,
  }
}
