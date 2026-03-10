import { calculateShadePrice } from "./engines/shade.engine";

const result = calculateShadePrice({
  dimension: {
    width: 60.5,
    height: 80.25,
  },
  quantity: 2,

  fabricUnitPrice: 45,
  topTreatmentPricePerInch: 20,
  controlPricePerUnit: 150,
});

console.log(result);
