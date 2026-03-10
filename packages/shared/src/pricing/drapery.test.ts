import { DraperyPricingEngine } from "./engines/DraperyPricingEngine";

const engine = new DraperyPricingEngine();

const result = engine.calculate(
  {
    width: 120,
    height: 100,
  },
  {
    baseParams: {
      fabric_standard_width: 55,
      fullness_multiplier: 3,
      extra_height_allowance: 30,
      fabric_unit_price: 20,
    },
    options: {
      lining: "LF",
    },
    optionValues: {
      lining: {
        NO: { lining_price_per_yard: 0, labor_per_panel: 30 },
        LF: { lining_price_per_yard: 6, labor_per_panel: 36 },
        BO: { lining_price_per_yard: 8, labor_per_panel: 38 },
      },
    },
  }
);

console.log(result);
