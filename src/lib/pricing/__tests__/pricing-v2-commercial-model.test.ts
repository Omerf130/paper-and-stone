import { describe, expect, it } from "vitest";
import {
  getEffectivePricingReviewStatus,
  getItemPricingStatus,
  isItemCommercialPricingComplete,
  resolveItemCommercialPricing,
  validateAdminCommercialPricingInput,
} from "@/lib/pricing/pricing-commercial-model";
import {
  calculateArchitectProfitFromMarginShare,
  calculateCommercialMarginAgorot,
  calculatePaperStoneProfitFromMarginShare,
} from "@/lib/pricing/pricing-calculations";

describe("pricing-v2 commercial model (margin split)", () => {
  it("calculates margin split from admin-controlled product, client price, and markup", () => {
    expect(calculateCommercialMarginAgorot(1_000_000, 1_600_000)).toBe(600_000);
    expect(calculateArchitectProfitFromMarginShare(600_000, 2_000)).toBe(120_000);
    expect(calculatePaperStoneProfitFromMarginShare(600_000, 120_000)).toBe(
      480_000,
    );
  });

  it("persists 20% as 2000 basis points through validation", () => {
    const validation = validateAdminCommercialPricingInput({
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_600_000,
      architectMarkupBp: 2_000,
    });

    expect(validation.ok).toBe(true);
    if (validation.ok) {
      expect(validation.resolved.architectMarkupBp).toBe(2_000);
      expect(validation.resolved.commercialMarginAgorot).toBe(600_000);
      expect(validation.resolved.architectProfitAgorot).toBe(120_000);
      expect(validation.resolved.paperStoneProfitAgorot).toBe(480_000);
      expect(validation.resolved.clientPriceAgorot).toBe(1_600_000);
    }
  });

  it("does not derive final client price from markup", () => {
    const resolved = resolveItemCommercialPricing({
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_600_000,
      architectMarkupBp: 2_000,
    });

    expect(resolved?.clientPriceAgorot).toBe(1_600_000);

    const withHigherMarkup = resolveItemCommercialPricing({
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_600_000,
      architectMarkupBp: 5_000,
    });

    expect(withHigherMarkup?.clientPriceAgorot).toBe(1_600_000);
    expect(withHigherMarkup?.architectProfitAgorot).toBe(300_000);
  });

  it("detects complete commercial pricing from authoritative stored fields", () => {
    expect(
      isItemCommercialPricingComplete({
        internalCostAgorot: 1_000_000,
        clientPriceAgorot: 1_600_000,
        architectMarkupBp: 2_000,
      }),
    ).toBe(true);
  });

  it("resolves derived values without requiring stored profit snapshots", () => {
    expect(
      resolveItemCommercialPricing({
        internalCostAgorot: 1_000_000,
        clientPriceAgorot: 1_600_000,
        architectMarkupBp: 2_000,
      }),
    ).toEqual({
      internalCostAgorot: 1_000_000,
      clientPriceAgorot: 1_600_000,
      architectMarkupBp: 2_000,
      commercialMarginAgorot: 600_000,
      architectProfitAgorot: 120_000,
      paperStoneProfitAgorot: 480_000,
    });
  });

  it("maps legacy clientPriceStale to needs_review status", () => {
    expect(
      getEffectivePricingReviewStatus({
        internalCostAgorot: 1_000_000,
        clientPriceAgorot: 1_600_000,
        architectMarkupBp: 2_000,
        clientPriceStale: true,
      }),
    ).toBe("needs_review");
  });

  it("returns priced when authoritative pricing is complete and review is clear", () => {
    expect(
      getItemPricingStatus({
        internalCostAgorot: 1_000_000,
        clientPriceAgorot: 1_600_000,
        architectMarkupBp: 2_000,
        pricingReviewStatus: "none",
      }),
    ).toBe("priced");
  });

  it("rejects client price below product price", () => {
    expect(
      validateAdminCommercialPricingInput({
        internalCostAgorot: 1_600_000,
        clientPriceAgorot: 1_000_000,
        architectMarkupBp: 2_000,
      }).ok,
    ).toBe(false);
  });

  it("rejects architect margin share above 100%", () => {
    expect(
      validateAdminCommercialPricingInput({
        internalCostAgorot: 1_000_000,
        clientPriceAgorot: 1_600_000,
        architectMarkupBp: 10_001,
      }).ok,
    ).toBe(false);
  });
});
