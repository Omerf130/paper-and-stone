import { describe, expect, it } from "vitest";
import { calculateLayeredPricingVatTotals } from "@/lib/pricing/pricing-vat";
import { DEFAULT_VAT_RATE_BASIS_POINTS } from "@/lib/pricing/vat-config";

describe("pricing-vat", () => {
  it("calculates VAT totals from client subtotal", () => {
    const totals = calculateLayeredPricingVatTotals(100_000);

    expect(totals.vatRateBasisPoints).toBe(DEFAULT_VAT_RATE_BASIS_POINTS);
    expect(totals.clientSubtotalAgorot).toBe(100_000);
    expect(totals.vatAmountAgorot).toBe(18_000);
    expect(totals.clientTotalInclVatAgorot).toBe(118_000);
  });

  it("supports custom VAT rate basis points", () => {
    const totals = calculateLayeredPricingVatTotals(200_000, 1700);

    expect(totals.vatRateBasisPoints).toBe(1700);
    expect(totals.vatAmountAgorot).toBe(34_000);
    expect(totals.clientTotalInclVatAgorot).toBe(234_000);
  });
});
