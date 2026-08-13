import { describe, expect, it } from "vitest";
import { calculateQuoteAmounts } from "@/lib/quotes/quote-calculations";
import { DEFAULT_VAT_RATE_BASIS_POINTS } from "@/types/project-quote";

describe("calculateQuoteAmounts", () => {
  it("calculates exclusive VAT on subtotal plus negative adjustments", () => {
    const result = calculateQuoteAmounts({
      itemLines: [
        { quantity: 2, unitPriceAgorot: 100000 },
        { quantity: 1, unitPriceAgorot: 50000 },
      ],
      additionalLines: [
        { amountAgorot: 50000 },
        { amountAgorot: -100000 },
      ],
      vatRateBasisPoints: DEFAULT_VAT_RATE_BASIS_POINTS,
    });

    expect(result.subtotalAgorot).toBe(250000);
    expect(result.adjustmentsAgorot).toBe(-50000);
    expect(result.taxableBaseAgorot).toBe(200000);
    expect(result.taxAmountAgorot).toBe(36000);
    expect(result.totalAgorot).toBe(236000);
  });

  it("includes VAT on discounted taxable base", () => {
    const result = calculateQuoteAmounts({
      itemLines: [{ quantity: 1, unitPriceAgorot: 100000 }],
      additionalLines: [{ amountAgorot: -50000 }],
      vatRateBasisPoints: 1800,
    });

    expect(result.taxableBaseAgorot).toBe(50000);
    expect(result.taxAmountAgorot).toBe(9000);
    expect(result.totalAgorot).toBe(59000);
  });

  it("computes line totals with integer math", () => {
    const result = calculateQuoteAmounts({
      itemLines: [{ quantity: 3, unitPriceAgorot: 12345 }],
      additionalLines: [],
    });

    expect(result.lineTotalsAgorot).toEqual([37035]);
    expect(result.subtotalAgorot).toBe(37035);
  });
});
