/**
 * What the workroom will actually build: which headings exist, what they can
 * hang on, how they mount, and how wide each combination can go.
 *
 * SHARED FILE — owned by the 3D line (geometry is what makes a combination
 * real); the website only consumes it, so an unbuildable pair can never be
 * selected in the UI and can never reach a quote.
 *
 * Rules from Eddie, 2026-08-11:
 *   ten headings only — four pleated, six ripplefold (labels are AAPP's)
 *   wood pole      → wall mount only · pleated only, never ripplefold
 *                    one-way draw max 96" · centre-open pair max 192"
 *   aluminium track→ the only one that offers a choice of wall or ceiling
 *   H-rail         → wall mount only
 */
import type { HardwareType, HeadingFamily, HeadingStyle, MountType, PleatedHeading, RippleHeading } from './designParams'

export interface HeadingOption {
  key: HeadingStyle
  /** AAPP's own label — the same words the sales team reads off the app. */
  label: string
  family: HeadingFamily
  hint: string
}

export const PLEATED_HEADINGS: ReadonlyArray<HeadingOption> = [
  { key: '2fold_pinch',    label: '2 Fold Pinch Pleat',    family: 'pleated', hint: 'Two folds — the classic' },
  { key: '3fold_pinch',    label: '3 Fold Pinch Pleat',    family: 'pleated', hint: 'Three folds — fuller, more formal' },
  { key: '2fold_tailored', label: '2 Fold Tailored Pleat', family: 'pleated', hint: 'Two folds, flat-topped and crisp' },
  { key: '3fold_tailored', label: '3 Fold Tailored Pleat', family: 'pleated', hint: 'Three folds, flat-topped' },
]

export const RIPPLE_HEADINGS: ReadonlyArray<HeadingOption> = [
  { key: 'cn_6cm', label: 'Perfect Wave', family: 'ripple', hint: 'Even, tightly spaced wave' },
  { key: 'cn_7cm', label: 'Grand Wave',   family: 'ripple', hint: 'Deeper, more generous wave' },
  { key: 'us_60',  label: 'US 60%',       family: 'ripple', hint: 'Shallowest fullness' },
  { key: 'us_80',  label: 'US 80%',       family: 'ripple', hint: '' },
  { key: 'us_100', label: 'US 100%',      family: 'ripple', hint: 'Most common ripplefold' },
  { key: 'us_120', label: 'US 120%',      family: 'ripple', hint: 'Fullest' },
]

export const HEADING_STYLES: ReadonlyArray<HeadingOption> = [...PLEATED_HEADINGS, ...RIPPLE_HEADINGS]

export function headingFamily(heading: HeadingStyle): HeadingFamily {
  return (PLEATED_HEADINGS as ReadonlyArray<HeadingOption>).some((h) => h.key === heading) ? 'pleated' : 'ripple'
}

export function headingLabel(heading: HeadingStyle): string {
  return HEADING_STYLES.find((h) => h.key === heading)?.label || heading
}

export interface HardwareOption {
  key: HardwareType
  label: string
  mounts: ReadonlyArray<MountType>
  /** Heading families this hardware can carry. */
  families: ReadonlyArray<HeadingFamily>
  /** Widest finished width, by how the panels draw. */
  maxWidthIn: { one_way: number; split: number }
}

/** No stated ceiling for the two track systems — the page's own 300" bound applies. */
const NO_LIMIT = 300

export const HARDWARE_TYPES: ReadonlyArray<HardwareOption> = [
  {
    key: 'wood_pole',
    label: 'Wood pole',
    mounts: ['wall'],
    families: ['pleated'],
    // A wood pole comes in fixed lengths and carries the weight on two brackets:
    // one panel drawing across it can only go so far before it sags.
    maxWidthIn: { one_way: 96, split: 192 },
  },
  { key: 'alu_track', label: 'Aluminium track', mounts: ['wall', 'ceiling'], families: ['pleated', 'ripple'], maxWidthIn: { one_way: NO_LIMIT, split: NO_LIMIT } },
  { key: 'h_rail',    label: 'H-rail',          mounts: ['wall'],            families: ['pleated', 'ripple'], maxWidthIn: { one_way: NO_LIMIT, split: NO_LIMIT } },
]

export function hardwareOption(hardware: HardwareType): HardwareOption {
  return HARDWARE_TYPES.find((h) => h.key === hardware) || HARDWARE_TYPES[0]
}

export function mountsFor(hardware: HardwareType): ReadonlyArray<MountType> {
  return hardwareOption(hardware).mounts
}

export function maxWidthFor(hardware: HardwareType, split: boolean): number {
  const m = hardwareOption(hardware).maxWidthIn
  return split ? m.split : m.one_way
}

/**
 * Why a combination is unavailable — in the words the customer should read,
 * or null when it is fine. Width is optional: the picker checks the pairing
 * before a size has been typed.
 */
export function combinationProblem(
  heading: HeadingStyle,
  hardware: HardwareType,
  opts: { split: boolean; finishedWidthIn?: number } = { split: true }
): string | null {
  const hw = hardwareOption(hardware)
  if (!hw.families.includes(headingFamily(heading))) {
    return headingFamily(heading) === 'ripple'
      ? `Ripplefold headings run on a track, not on a ${hw.label.toLowerCase()}.`
      : `A ${headingLabel(heading)} cannot hang on a ${hw.label.toLowerCase()}.`
  }
  const max = maxWidthFor(hardware, opts.split)
  if (opts.finishedWidthIn && opts.finishedWidthIn > max) {
    return `A ${hw.label.toLowerCase()} spans up to ${max}" ${opts.split ? 'as a centre-open pair' : 'on a one-way draw'}.`
  }
  return null
}

export function isCombinationLegal(
  heading: HeadingStyle,
  hardware: HardwareType,
  opts: { split: boolean; finishedWidthIn?: number } = { split: true }
): boolean {
  return combinationProblem(heading, hardware, opts) === null
}

/** Hardware that can carry this heading at this width and draw. */
export function hardwareFor(
  heading: HeadingStyle,
  opts: { split: boolean; finishedWidthIn?: number } = { split: true }
): ReadonlyArray<HardwareType> {
  return HARDWARE_TYPES.filter((h) => isCombinationLegal(heading, h.key, opts)).map((h) => h.key)
}
