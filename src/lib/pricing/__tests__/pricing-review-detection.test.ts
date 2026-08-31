import { describe, expect, it } from "vitest";
import {
  hasCommercialConfigurationChanged,
  shouldMarkItemPricingNeedsReview,
} from "@/lib/pricing/pricing-review-detection";

describe("pricing-review-detection", () => {
  it("marks needs review when commercial configuration changes on priced item", () => {
    expect(
      shouldMarkItemPricingNeedsReview({
        existingItem: {
          selectedMaterialId: "mat-a",
          selectedColorId: "color-a",
          selectedSizeKey: "L",
          pricing: {
            priceVersion: 1,
            internalCostAgorot: 100_000,
            architectPriceAgorot: 150_000,
            architectMarkupBp: 1_200,
            architectProfitAgorot: 18_000,
            clientPriceAgorot: 168_000,
            pricingReviewStatus: "none",
          },
        },
        nextConfiguration: {
          selectedMaterialId: "mat-b",
          selectedColorId: "color-a",
          selectedSizeKey: "L",
        },
      }),
    ).toBe(true);
  });

  it("does not mark needs review for quantity-only changes", () => {
    expect(
      hasCommercialConfigurationChanged(
        {
          selectedMaterialId: "mat-a",
          selectedColorId: "color-a",
          selectedSizeKey: "L",
        },
        {
          selectedMaterialId: "mat-a",
          selectedColorId: "color-a",
          selectedSizeKey: "L",
        },
      ),
    ).toBe(false);
  });

  it("does not mark needs review when item is not fully priced", () => {
    expect(
      shouldMarkItemPricingNeedsReview({
        existingItem: {
          selectedMaterialId: "mat-a",
          selectedColorId: null,
          selectedSizeKey: null,
          pricing: {
            priceVersion: 0,
            internalCostAgorot: 100_000,
          },
        },
        nextConfiguration: {
          selectedMaterialId: "mat-b",
          selectedColorId: null,
          selectedSizeKey: null,
        },
      }),
    ).toBe(false);
  });
});
