/**
 * Which heading styles can hang on which hardware.
 *
 * SHARED FILE — owned by the 3D line (the geometry is what makes a
 * combination real or not); the website only consumes it, so that an
 * unbuildable pair can never be selected in the UI and can never reach a
 * quote. Seeded from the rules Eddie set on 2026-08-11:
 *
 *   wave        → track or H-rail only (the carriers ARE the wave spacing)
 *   grommet     → wood pole only (the grommets ride the pole)
 *   pinch pleat → anything
 *
 * Add a combination here and both the picker and the 3D viewport pick it up.
 */
import type { HardwareType, HeadingStyle, MountType } from './designParams'

export const HEADING_STYLES: ReadonlyArray<{ key: HeadingStyle; label: string; hint: string }> = [
  { key: 'pinch2', label: 'Two-finger pinch pleat', hint: 'Tailored and traditional' },
  { key: 'pinch3', label: 'Three-finger pinch pleat', hint: 'Fuller, more formal' },
  { key: 'wave', label: 'Wave / ripplefold', hint: 'Soft continuous S-curve' },
  { key: 'grommet', label: 'Grommet', hint: 'Casual, rings set into the fabric' },
]

export const HARDWARE_TYPES: ReadonlyArray<{ key: HardwareType; label: string; mounts: MountType[] }> = [
  { key: 'wood_pole', label: 'Wood pole', mounts: ['wall'] },
  { key: 'alu_track', label: 'Aluminium track', mounts: ['wall', 'ceiling'] },
  { key: 'h_rail', label: 'H-rail', mounts: ['wall', 'ceiling'] },
]

export const HEADING_HARDWARE: Readonly<Record<HeadingStyle, ReadonlyArray<HardwareType>>> = {
  pinch2: ['wood_pole', 'alu_track', 'h_rail'],
  pinch3: ['wood_pole', 'alu_track', 'h_rail'],
  wave: ['alu_track', 'h_rail'],
  grommet: ['wood_pole'],
}

export function hardwareFor(heading: HeadingStyle): ReadonlyArray<HardwareType> {
  return HEADING_HARDWARE[heading] || []
}

export function isCombinationLegal(heading: HeadingStyle, hardware: HardwareType): boolean {
  return hardwareFor(heading).includes(hardware)
}

export function mountsFor(hardware: HardwareType): ReadonlyArray<MountType> {
  return HARDWARE_TYPES.find((h) => h.key === hardware)?.mounts || ['wall']
}
