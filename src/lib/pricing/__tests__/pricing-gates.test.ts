import { describe, expect, it } from "vitest";
import {
  assertLayeredPricingCompleteForSubmit,
  getArchitectSubmitPricingBlockedReason,
  getLayeredPricingCompleteness,
  getPricingUnavailableReason,
  isAdminProjectPricingEditable,
  isArchitectProjectPricingEditable,
} from "@/lib/pricing/pricing-gates";
import { applyAdminCommercialPricingUpdate } from "@/lib/pricing/pricing-item-helpers";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";

const legacyProject = {
  onboardingStatus: null,
  status: "draft" as const,
  items: [{ pricing: undefined }],
};

const layeredIncomplete = {
  onboardingStatus: "active" as const,
  status: "draft" as const,
  items: [
    {
      pricing: {
        priceVersion: 0,
        internalCostAgorot: 80_000,
      },
    },
  ],
};

const layeredComplete = {
  onboardingStatus: "active" as const,
  status: "draft" as const,
  items: [
    {
      pricing: {
        priceVersion: 1,
        internalCostAgorot: 80_000,
        clientPriceAgorot: 128_000,
        architectMarkupBp: 2_000,
        architectProfitAgorot: 9_600,
        pricingReviewStatus: "none",
      },
    },
  ],
};

const activeApprovedProject = {
  onboardingStatus: "active" as const,
  status: "approved" as const,
};

const activeSubmittedProject = {
  onboardingStatus: "active" as const,
  status: "submitted" as const,
};

const pendingOnboardingProject = {
  onboardingStatus: "pending_approval" as const,
  status: "draft" as const,
};

describe("pricing-gates editability", () => {
  it("allows admin pricing for active draft projects", () => {
    expect(
      isAdminProjectPricingEditable({
        onboardingStatus: "active",
        status: "draft",
      }),
    ).toBe(true);
  });

  it("blocks architect pricing in Pricing V2", () => {
    expect(isArchitectProjectPricingEditable(activeApprovedProject)).toBe(false);
    expect(getPricingUnavailableReason(activeApprovedProject, "architect")).toBe(
      PRICING_ERRORS.ARCHITECT_PRICING_READONLY,
    );
  });

  it("blocks admin pricing for pending onboarding projects", () => {
    expect(isAdminProjectPricingEditable(pendingOnboardingProject)).toBe(false);
    expect(getPricingUnavailableReason(pendingOnboardingProject, "admin")).toBe(
      "הפרויקט עדיין ממתין לאישור פתיחה",
    );
  });

  it("allows admin pricing while project is submitted for review", () => {
    expect(isAdminProjectPricingEditable(activeSubmittedProject)).toBe(true);
    expect(getPricingUnavailableReason(activeSubmittedProject, "admin")).toBeUndefined();
  });

  it("clears review status when admin saves commercial pricing", () => {
    const updated = applyAdminCommercialPricingUpdate({
      pricing: {
        priceVersion: 3,
        internalCostAgorot: 100_000,
        clientPriceAgorot: 160_000,
        architectMarkupBp: 2_000,
        architectProfitAgorot: 12_000,
        pricingReviewStatus: "needs_review",
        clientPriceStale: true,
      },
      commercialPricing: {
        internalCostAgorot: 110_000,
        clientPriceAgorot: 170_000,
        architectMarkupBp: 2_000,
      },
    });

    expect(updated.internalCostAgorot).toBe(110_000);
    expect(updated.clientPriceAgorot).toBe(170_000);
    expect(updated.architectMarkupBp).toBe(2_000);
    expect(updated.architectProfitAgorot).toBe(12_000);
    expect(updated.pricingReviewStatus).toBe("none");
    expect(updated.clientPriceStale).toBe(false);
    expect(updated.priceVersion).toBe(4);
  });
});

describe("pricing-gates submit completeness", () => {
  it("skips submit gate for legacy projects", () => {
    expect(() =>
      assertLayeredPricingCompleteForSubmit(legacyProject as never),
    ).not.toThrow();
  });

  it("blocks submit when layered pricing is incomplete", () => {
    expect(() =>
      assertLayeredPricingCompleteForSubmit(layeredIncomplete as never),
    ).toThrow(ProjectMutationError);
  });

  it("blocks submit when pricing needs review", () => {
    expect(() =>
      assertLayeredPricingCompleteForSubmit({
        onboardingStatus: "active",
        status: "draft",
        items: [
          {
            pricing: {
              priceVersion: 2,
              internalCostAgorot: 100_000,
              clientPriceAgorot: 160_000,
              architectMarkupBp: 2_000,
              architectProfitAgorot: 12_000,
              pricingReviewStatus: "needs_review",
            },
          },
        ],
      } as never),
    ).toThrow(
      new ProjectMutationError(PRICING_ERRORS.PRICING_NEEDS_REVIEW),
    );
  });

  it("allows submit when layered pricing is complete", () => {
    expect(() =>
      assertLayeredPricingCompleteForSubmit(layeredComplete as never),
    ).not.toThrow();
  });

  it("counts completeness metadata", () => {
    expect(getLayeredPricingCompleteness(layeredComplete.items as never)).toEqual({
      isComplete: true,
      unpricedItemCount: 0,
      needsReviewItemCount: 0,
    });
  });

  it("blocks architect submit when admin pricing was not delivered", () => {
    expect(
      getArchitectSubmitPricingBlockedReason({
        onboardingStatus: "active",
        adminPricingRevision: 2,
        adminPricingDeliveredRevision: 1,
        items: layeredComplete.items,
      } as never),
    ).toBe(PRICING_ERRORS.ADMIN_PRICING_NOT_DELIVERED);
  });
});

describe("createInitialItemPricing", () => {
  it("returns undefined for new items in Pricing V2", async () => {
    const { createInitialItemPricing } = await import(
      "@/lib/pricing/pricing-item-helpers"
    );

    expect(createInitialItemPricing()).toBeUndefined();
  });
});
