import {
  DraperyDimensionInput,
  ShadeDimensionInput,
  NormalizedDimension,
} from "./types";

/**
 * Drapery / Sheer → Normalized
 */
export function normalizeDraperyDimension(
  input: DraperyDimensionInput
): NormalizedDimension {
  return {
    width: input.widthInt,
    height: input.heightInt + input.heightFraction,
  };
}

/**
 * Shade → Normalized
 */
export function normalizeShadeDimension(
  input: ShadeDimensionInput
): NormalizedDimension {
  return {
    width: input.widthInt + input.widthFraction,
    height: input.heightInt + input.heightFraction,
  };
}
