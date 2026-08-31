import { describe, expect, it } from "vitest";
import { migrateItemPricingToV2 } from "@/lib/pricing/migrate-pricing-v2";

describe("migrate-pricing-v2", () => {
  it("derives architect markup from margin split when client price and profit exist", () => {
    const { pricing, migrated } = migrateItemPricingToV2({
      priceVersion: 1,
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_600_000,
      architectProfitAgorot: 120_000,
      clientPriceStale: false,
    });

    expect(migrated).toBe(true);
    expect(pricing?.architectMarkupBp).toBe(2_000);
    expect(pricing?.architectProfitAgorot).toBe(120_000);
    expect(pricing?.clientPriceAgorot).toBe(1_600_000);
    expect(pricing?.pricingReviewStatus).toBe("none");
  });

  it("maps intermediate V2 architect base + markup to stored client price when missing", () => {
    const { pricing, migrated } = migrateItemPricingToV2({
      priceVersion: 1,
      internalCostAgorot: 1_000_000,
      architectPriceAgorot: 1_500_000,
      architectMarkupBp: 1_200,
      clientPriceStale: false,
    });

    expect(migrated).toBe(true);
    expect(pricing?.clientPriceAgorot).toBe(1_680_000);
    expect(pricing?.architectProfitAgorot).toBe(81_600);
  });

  it("maps legacy clientPriceStale to needs_review without fabricating markup", () => {
    const { pricing, migrated } = migrateItemPricingToV2({
      priceVersion: 1,
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_600_000,
      architectMarkupBp: 2_000,
      clientPriceStale: true,
    });

    expect(migrated).toBe(true);
    expect(pricing?.pricingReviewStatus).toBe("needs_review");
    expect(pricing?.architectMarkupBp).toBe(2_000);
    expect(pricing?.clientPriceAgorot).toBe(1_600_000);
  });

  it("is idempotent when pricing is already migrated", () => {
    const input = {
      priceVersion: 2,
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_600_000,
      architectMarkupBp: 2_000,
      architectProfitAgorot: 120_000,
      pricingReviewStatus: "none" as const,
    };

    const first = migrateItemPricingToV2(input);
    const second = migrateItemPricingToV2(first.pricing);

    expect(second.migrated).toBe(false);
    expect(second.pricing).toEqual(first.pricing);
  });

  it("does not fabricate markup when client price is missing", () => {
    const { pricing, migrated } = migrateItemPricingToV2({
      priceVersion: 0,
      internalCostAgorot: 1_000_000,
    });

    expect(pricing?.architectMarkupBp).toBeUndefined();
    expect(pricing?.clientPriceAgorot).toBeUndefined();
    expect(migrated).toBe(true);
  });

  it("does not overwrite stored client price during sync", () => {
    const { pricing } = migrateItemPricingToV2({
      priceVersion: 1,
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_650_000,
      architectMarkupBp: 2_000,
      architectProfitAgorot: 130_000,
    });

    expect(pricing?.clientPriceAgorot).toBe(1_650_000);
  });
});
