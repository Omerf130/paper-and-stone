import { calculateVatFromTaxableBase, sumAgorot } from "@/lib/money/agorot-math";
import { DEFAULT_VAT_RATE_BASIS_POINTS } from "@/lib/pricing/vat-config";

export type LayeredPricingVatTotals = {
  vatRateBasisPoints: number;
  clientSubtotalAgorot: number;
  vatAmountAgorot: number;
  clientTotalInclVatAgorot: number;
};

export function calculateLayeredPricingVatTotals(
  clientSubtotalAgorot: number,
  vatRateBasisPoints: number = DEFAULT_VAT_RATE_BASIS_POINTS,
): LayeredPricingVatTotals {
  const vatAmountAgorot = calculateVatFromTaxableBase(
    clientSubtotalAgorot,
    vatRateBasisPoints,
  );

  return {
    vatRateBasisPoints,
    clientSubtotalAgorot,
    vatAmountAgorot,
    clientTotalInclVatAgorot: sumAgorot([clientSubtotalAgorot, vatAmountAgorot]),
  };
}
