import { describe, expect, it } from "vitest";
import {
  getAdminProjectAttentionLabels,
  getAdminProjectAttentionReasons,
  getPricingAttentionFromAdminItems,
  getProjectPricingAttention,
  hasLayeredPricingAttention,
} from "@/lib/projects/admin-project-attention";

describe("admin-project-attention", () => {
  it("counts one incomplete item when all authoritative pricing fields are missing", () => {
    expect(
      getProjectPricingAttention([
        {
          pricing: {
            internalCostAgorot: undefined,
            clientPriceAgorot: undefined,
            architectMarkupBp: undefined,
          },
        },
      ] as never),
    ).toEqual({
      incompleteItemCount: 1,
      missingInternalCostCount: 1,
      missingClientPriceCount: 1,
      missingArchitectMarkupCount: 1,
      needsReviewItemCount: 0,
    });
  });

  it("counts two incomplete items among three products", () => {
    expect(
      getProjectPricingAttention([
        {
          pricing: {
            internalCostAgorot: 100_000,
            clientPriceAgorot: 160_000,
            architectMarkupBp: 2_000,
            architectProfitAgorot: 12_000,
          },
        },
        { pricing: { internalCostAgorot: 100_000 } },
        { pricing: undefined },
      ] as never),
    ).toEqual({
      incompleteItemCount: 2,
      missingInternalCostCount: 1,
      missingClientPriceCount: 2,
      missingArchitectMarkupCount: 2,
      needsReviewItemCount: 0,
    });
  });

  it("counts needs review separately without double-counting as incomplete", () => {
    expect(
      getProjectPricingAttention([
        {
          pricing: {
            internalCostAgorot: 100_000,
            clientPriceAgorot: 160_000,
            architectMarkupBp: 2_000,
            architectProfitAgorot: 12_000,
            pricingReviewStatus: "needs_review",
          },
        },
      ] as never),
    ).toEqual({
      incompleteItemCount: 0,
      missingInternalCostCount: 0,
      missingClientPriceCount: 0,
      missingArchitectMarkupCount: 0,
      needsReviewItemCount: 1,
    });
  });

  it("maps admin item views to pricing attention", () => {
    expect(
      getPricingAttentionFromAdminItems([
        { adminPricing: { internalCostAgorot: 100_000 } },
        {
          adminPricing: {
            internalCostAgorot: 100_000,
            clientPriceAgorot: 160_000,
            architectMarkupBp: 2_000,
          },
        },
      ]),
    ).toEqual({
      incompleteItemCount: 1,
      missingInternalCostCount: 0,
      missingClientPriceCount: 1,
      missingArchitectMarkupCount: 1,
      needsReviewItemCount: 0,
    });
  });

  it("returns attention reasons for active submitted project with needs review pricing", () => {
    const reasons = getAdminProjectAttentionReasons({
      onboardingStatus: "active",
      status: "submitted",
      items: [
        {
          pricing: {
            internalCostAgorot: 100_000,
            clientPriceAgorot: 160_000,
            architectMarkupBp: 2_000,
            architectProfitAgorot: 12_000,
            pricingReviewStatus: "needs_review",
          },
        },
      ],
    } as never);

    expect(reasons).toEqual([
      "commercial_review",
      "stale_client_prices",
    ]);
    expect(getAdminProjectAttentionLabels({
      onboardingStatus: "active",
      status: "submitted",
      items: [
        {
          pricing: {
            internalCostAgorot: 100_000,
            clientPriceAgorot: 160_000,
            architectMarkupBp: 2_000,
            architectProfitAgorot: 12_000,
            pricingReviewStatus: "needs_review",
          },
        },
      ],
    } as never)).toContain("מחירי לקוח דורשים בדיקה");
  });

  it("does not flag legacy projects for layered pricing attention", () => {
    expect(
      getAdminProjectAttentionReasons({
        onboardingStatus: null,
        status: "draft",
        items: [{ pricing: undefined }],
      } as never),
    ).toEqual([]);
    expect(
      hasLayeredPricingAttention({
        incompleteItemCount: 1,
        missingInternalCostCount: 1,
        missingClientPriceCount: 0,
        missingArchitectMarkupCount: 0,
        needsReviewItemCount: 0,
      }),
    ).toBe(true);
  });
});
