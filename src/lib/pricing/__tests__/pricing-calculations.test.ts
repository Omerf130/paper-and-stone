import { describe, expect, it } from "vitest";
import {
  calculateArchitectPriceAgorot,
  calculateClientPriceAgorot,
} from "@/lib/pricing/pricing-calculations";
import {
  applyAdminPricingUpdate,
  applyArchitectPricingUpdate,
} from "@/lib/pricing/pricing-item-helpers";

describe("pricing-calculations", () => {
  it("calculates architect price with 200% admin markup", () => {
    expect(calculateArchitectPriceAgorot(100_000, 20_000)).toBe(300_000);
  });

  it("calculates client price with 133.33% architect markup", () => {
    expect(calculateClientPriceAgorot(100_000, 13_333)).toBe(233_330);
  });
});

describe("admin vs architect stale semantics", () => {
  it("preserves client price and marks stale when admin reprices existing client price", () => {
    const next = applyAdminPricingUpdate({
      pricing: {
        priceVersion: 1,
        internalCostAgorot: 100_000,
        architectPriceAgorot: 140_000,
        clientPriceAgorot: 210_000,
        clientPriceStale: false,
      },
      internalCostAgorot: 110_000,
      adminMarkupBp: 2_000,
      hadClientPrice: true,
    });

    expect(next.architectPriceAgorot).toBe(132_000);
    expect(next.clientPriceAgorot).toBe(210_000);
    expect(next.clientPriceStale).toBe(true);
    expect(next.priceVersion).toBe(2);
  });

  it("recomputes client price and clears stale when architect reprices", () => {
    const next = applyArchitectPricingUpdate({
      pricing: {
        priceVersion: 2,
        architectPriceAgorot: 132_000,
        clientPriceAgorot: 210_000,
        clientPriceStale: true,
      },
      architectPriceAgorot: 132_000,
      architectMarkupBp: 5_000,
    });

    expect(next.clientPriceAgorot).toBe(198_000);
    expect(next.clientPriceStale).toBe(false);
    expect(next.priceVersion).toBe(3);
  });

  it("does not mark stale when admin reprices before client price exists", () => {
    const next = applyAdminPricingUpdate({
      pricing: {
        priceVersion: 0,
        internalCostAgorot: 100_000,
        architectPriceAgorot: 140_000,
      },
      internalCostAgorot: 110_000,
      adminMarkupBp: 2_000,
      hadClientPrice: false,
    });

    expect(next.clientPriceStale).toBe(false);
    expect(next.clientPriceAgorot).toBeUndefined();
  });
});
