import { describe, expect, it } from "vitest";
import { applyAdminPricingUpdate } from "@/lib/pricing/pricing-item-helpers";

describe("inline admin pricing semantics", () => {
  it("preserves client price and marks stale when repricing after approval", () => {
    const updated = applyAdminPricingUpdate({
      pricing: {
        priceVersion: 5,
        internalCostAgorot: 100_000,
        architectPriceAgorot: 140_000,
        clientPriceAgorot: 210_000,
        clientPriceStale: false,
      },
      internalCostAgorot: 110_000,
      adminMarkupBp: 4_000,
      hadClientPrice: true,
    });

    expect(updated.clientPriceAgorot).toBe(210_000);
    expect(updated.clientPriceStale).toBe(true);
    expect(updated.architectPriceAgorot).toBe(154_000);
  });

  it("does not mark stale when setting initial pricing without client price", () => {
    const updated = applyAdminPricingUpdate({
      pricing: {
        priceVersion: 0,
        clientPriceStale: false,
      },
      internalCostAgorot: 100_000,
      adminMarkupBp: 4_000,
      hadClientPrice: false,
    });

    expect(updated.clientPriceStale).toBe(false);
  });
});
