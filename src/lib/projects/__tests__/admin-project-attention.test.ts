import { describe, expect, it } from "vitest";
import {
  getAdminProjectAttentionLabels,
  getAdminProjectAttentionReasons,
  getPricingAttentionFromAdminItems,
  getProjectPricingAttention,
  hasLayeredPricingAttention,
} from "@/lib/projects/admin-project-attention";

describe("admin-project-attention", () => {
  it("counts one incomplete item when all three pricing fields are missing", () => {
    expect(
      getProjectPricingAttention([
        {
          pricing: {
            internalCostAgorot: undefined,
            architectPriceAgorot: undefined,
            clientPriceAgorot: undefined,
          },
        },
      ] as never),
    ).toEqual({
      incompleteItemCount: 1,
      missingInternalCostCount: 1,
      missingArchitectPriceCount: 1,
      missingClientPriceCount: 1,
      staleClientPriceCount: 0,
    });
  });

  it("counts two incomplete items among three products", () => {
    expect(
      getProjectPricingAttention([
        {
          pricing: {
            internalCostAgorot: 100_000,
            architectPriceAgorot: 140_000,
            clientPriceAgorot: 210_000,
          },
        },
        { pricing: { internalCostAgorot: 100_000 } },
        { pricing: undefined },
      ] as never),
    ).toEqual({
      incompleteItemCount: 2,
      missingInternalCostCount: 1,
      missingArchitectPriceCount: 2,
      missingClientPriceCount: 2,
      staleClientPriceCount: 0,
    });
  });

  it("counts stale items separately without double-counting as incomplete", () => {
    expect(
      getProjectPricingAttention([
        {
          pricing: {
            internalCostAgorot: 100_000,
            architectPriceAgorot: 140_000,
            clientPriceAgorot: 210_000,
            clientPriceStale: true,
          },
        },
      ] as never),
    ).toEqual({
      incompleteItemCount: 0,
      missingInternalCostCount: 0,
      missingArchitectPriceCount: 0,
      missingClientPriceCount: 0,
      staleClientPriceCount: 1,
    });
  });

  it("counts missing layered pricing dimensions on partially priced items", () => {
    expect(
      getProjectPricingAttention([
        { pricing: { internalCostAgorot: 100_000 } },
        {
          pricing: {
            internalCostAgorot: 100_000,
            architectPriceAgorot: 140_000,
            clientPriceAgorot: 210_000,
            clientPriceStale: true,
          },
        },
      ] as never),
    ).toEqual({
      incompleteItemCount: 1,
      missingInternalCostCount: 0,
      missingArchitectPriceCount: 1,
      missingClientPriceCount: 1,
      staleClientPriceCount: 1,
    });
  });

  it("maps admin item views to pricing attention", () => {
    expect(
      getPricingAttentionFromAdminItems([
        { adminPricing: { internalCostAgorot: 100_000 } },
        {
          adminPricing: {
            internalCostAgorot: 100_000,
            architectPriceAgorot: 140_000,
            clientPriceAgorot: 210_000,
          },
        },
      ]),
    ).toEqual({
      incompleteItemCount: 1,
      missingInternalCostCount: 0,
      missingArchitectPriceCount: 1,
      missingClientPriceCount: 1,
      staleClientPriceCount: 0,
    });
  });

  it("returns attention reasons for active submitted project with stale prices", () => {
    const reasons = getAdminProjectAttentionReasons({
      onboardingStatus: "active",
      status: "submitted",
      items: [
        {
          pricing: {
            internalCostAgorot: 100_000,
            architectPriceAgorot: 140_000,
            clientPriceAgorot: 210_000,
            clientPriceStale: true,
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
            architectPriceAgorot: 140_000,
            clientPriceAgorot: 210_000,
            clientPriceStale: true,
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
        missingArchitectPriceCount: 0,
        missingClientPriceCount: 0,
        staleClientPriceCount: 0,
      }),
    ).toBe(true);
  });

  it("does not include commercial dirty alone in admin attention reasons", () => {
    expect(
      getAdminProjectAttentionReasons({
        onboardingStatus: "active",
        status: "approved",
        commercialDirty: true,
        items: [
          {
            pricing: {
              internalCostAgorot: 100_000,
              architectPriceAgorot: 140_000,
              clientPriceAgorot: 210_000,
            },
          },
        ],
      } as never),
    ).toEqual([]);
  });

  it("flags pending admin pricing rounds in attention reasons", () => {
    expect(
      getAdminProjectAttentionReasons({
        onboardingStatus: "active",
        status: "approved",
        adminPricingRevision: 2,
        adminPricingDeliveredRevision: 1,
        items: [
          {
            pricing: {
              internalCostAgorot: 100_000,
              architectPriceAgorot: 140_000,
              clientPriceAgorot: 210_000,
            },
          },
        ],
      } as never),
    ).toEqual(["pricing_ready_to_deliver"]);
  });

  it("flags incomplete admin layer pricing during pending delivery", () => {
    expect(
      getAdminProjectAttentionReasons({
        onboardingStatus: "active",
        status: "approved",
        adminPricingRevision: 2,
        adminPricingDeliveredRevision: 1,
        items: [{ pricing: { internalCostAgorot: 100_000 } }],
      } as never),
    ).toEqual(["admin_pricing_incomplete"]);
  });
});
