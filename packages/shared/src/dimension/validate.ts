import { NormalizedDimension } from "./types";

function assertRange(
  value: number,
  min: number,
  max: number,
  field: string
) {
  if (value < min || value > max) {
    throw new Error(
      `${field} out of range: ${value} (allowed ${min}–${max})`
    );
  }
}

/**
 * Drapery / Sheer validation
 */
export function validateDraperyDimension(dim: NormalizedDimension) {
  assertRange(dim.width, 12, 360, "width");
  assertRange(dim.height, 20, 360, "height");
}

/**
 * Shade validation
 */
export function validateShadeDimension(dim: NormalizedDimension) {
  assertRange(dim.width, 15, 96, "width");
  assertRange(dim.height, 15, 138, "height");
}
