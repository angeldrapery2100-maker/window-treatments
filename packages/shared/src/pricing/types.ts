export interface PriceBreakdownItem {
  key: string;
  label: string;
  amount: number;
}

export interface PricingResult {
  subtotal: number;
  breakdown: PriceBreakdownItem[];
}
