import { calculateSheerPrice } from "./engines/sheer.engine";

const result = calculateSheerPrice({
  dimension: {
    width: 120,
    height: 110.25,
  },
  fabricStandardWidth: 36,
  fullnessMultiplier: 3.5,
  extraHeightAllowance: 30,
  sheerUnitPrice: 18,
  laborPerPanel: 26,
});

console.log(result);
