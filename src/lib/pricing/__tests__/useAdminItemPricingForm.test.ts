import { describe, expect, it } from "vitest";
import { applyAdminCommercialPricingUpdate } from "@/lib/pricing/pricing-item-helpers";

describe("admin commercial pricing update", () => {
  it("stores authoritative fields and derived profit snapshots", () => {
    const updated = applyAdminCommercialPricingUpdate({
      pricing: {
        priceVersion: 5,
        internalCostAgorot: 1_000_000,
        clientPriceAgorot: 1_500_000,
        architectMarkupBp: 1_000,
        architectPriceAgorot: 1_400_000,
        pricingReviewStatus: "needs_review",
      },
      commercialPricing: {
        internalCostAgorot: 1_000_000,
        clientPriceAgorot: 1_600_000,
        architectMarkupBp: 2_000,
      },
    });

    expect(updated.internalCostAgorot).toBe(1_000_000);
    expect(updated.clientPriceAgorot).toBe(1_600_000);
    expect(updated.architectMarkupBp).toBe(2_000);
    expect(updated.architectProfitAgorot).toBe(120_000);
    expect(updated.architectPriceAgorot).toBeUndefined();
    expect(updated.pricingReviewStatus).toBe("none");
    expect(updated.priceVersion).toBe(6);
  });
});
