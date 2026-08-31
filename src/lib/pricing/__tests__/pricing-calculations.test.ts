import { describe, expect, it } from "vitest";
import {
  calculateArchitectProfitFromMarginShare,
  calculateCommercialMarginAgorot,
  calculatePaperStoneProfitFromMarginShare,
} from "@/lib/pricing/pricing-calculations";

describe("pricing-calculations margin split", () => {
  it("calculates commercial margin from product and client prices", () => {
    expect(calculateCommercialMarginAgorot(1_000_000, 1_600_000)).toBe(600_000);
  });

  it("calculates architect profit from margin share", () => {
    expect(calculateArchitectProfitFromMarginShare(600_000, 2_000)).toBe(120_000);
  });

  it("calculates Paper & Stone profit from remaining margin", () => {
    expect(calculatePaperStoneProfitFromMarginShare(600_000, 120_000)).toBe(
      480_000,
    );
  });

  it("satisfies product + architect profit + P&S profit = client price", () => {
    const product = 1_000_000;
    const client = 1_600_000;
    const margin = calculateCommercialMarginAgorot(product, client);
    const architectProfit = calculateArchitectProfitFromMarginShare(margin, 2_000);
    const paperStoneProfit = calculatePaperStoneProfitFromMarginShare(
      margin,
      architectProfit,
    );

    expect(product + architectProfit + paperStoneProfit).toBe(client);
  });
});
