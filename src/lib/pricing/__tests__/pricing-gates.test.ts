import { describe, expect, it } from "vitest";
import {
  assertLayeredPricingCompleteForSubmit,
  getLayeredPricingCompleteness,
  getPricingUnavailableReason,
  isAdminProjectPricingEditable,
  isArchitectProjectPricingEditable,
} from "@/lib/pricing/pricing-gates";
import { applyAdminPricingUpdate } from "@/lib/pricing/pricing-item-helpers";
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
        architectPriceAgorot: 100_000,
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
        architectPriceAgorot: 100_000,
        clientPriceAgorot: 150_000,
        clientPriceStale: false,
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

  it("allows admin pricing for active changes_requested projects", () => {
    expect(
      isAdminProjectPricingEditable({
        onboardingStatus: "active",
        status: "changes_requested",
      }),
    ).toBe(true);
  });

  it("allows admin pricing for previously approved active projects", () => {
    expect(isAdminProjectPricingEditable(activeApprovedProject)).toBe(true);
  });

  it("allows admin pricing while project is submitted for review", () => {
    expect(isAdminProjectPricingEditable(activeSubmittedProject)).toBe(true);
  });

  it("blocks admin pricing for pending onboarding projects", () => {
    expect(isAdminProjectPricingEditable(pendingOnboardingProject)).toBe(false);
    expect(getPricingUnavailableReason(pendingOnboardingProject, "admin")).toBe(
      "הפרויקט עדיין ממתין לאישור פתיחה",
    );
  });

  it("blocks architect pricing while submitted but allows admin pricing", () => {
    expect(isArchitectProjectPricingEditable(activeSubmittedProject)).toBe(false);
    expect(getPricingUnavailableReason(activeSubmittedProject, "architect")).toBe(
      "הפרויקט נשלח לבדיקה — לא ניתן לערוך עד לקבלת תשובה",
    );
    expect(getPricingUnavailableReason(activeSubmittedProject, "admin")).toBeUndefined();
  });

  it("allows architect pricing for approved active projects", () => {
    expect(isArchitectProjectPricingEditable(activeApprovedProject)).toBe(true);
  });

  it("preserves client price and marks stale when admin reprices after approval", () => {
    const updated = applyAdminPricingUpdate({
      pricing: {
        priceVersion: 3,
        internalCostAgorot: 100_000,
        architectPriceAgorot: 140_000,
        clientPriceAgorot: 210_000,
        clientPriceStale: false,
      },
      internalCostAgorot: 110_000,
      adminMarkupBp: 4_000,
      hadClientPrice: true,
    });

    expect(updated.architectPriceAgorot).toBe(154_000);
    expect(updated.clientPriceAgorot).toBe(210_000);
    expect(updated.clientPriceStale).toBe(true);
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

    try {
      assertLayeredPricingCompleteForSubmit(layeredIncomplete as never);
    } catch (error) {
      expect(error).toMatchObject({
        message: PRICING_ERRORS.INCOMPLETE_PRICING,
      });
    }
  });

  it("blocks submit when client prices are stale", () => {
    try {
      assertLayeredPricingCompleteForSubmit({
        onboardingStatus: "active",
        status: "draft",
        items: [
          {
            pricing: {
              priceVersion: 2,
              architectPriceAgorot: 100_000,
              clientPriceAgorot: 150_000,
              clientPriceStale: true,
            },
          },
        ],
      } as never);
      expect.fail("expected stale pricing submit to throw");
    } catch (error) {
      expect(error).toMatchObject({
        message: PRICING_ERRORS.STALE_PRICING_SUBMIT,
      });
    }
  });

  it("allows submit when layered pricing is complete", () => {
    expect(() =>
      assertLayeredPricingCompleteForSubmit(layeredComplete as never),
    ).not.toThrow();
  });

  it("counts completeness metadata", () => {
    expect(getLayeredPricingCompleteness(layeredComplete.items as never)).toEqual({
      isComplete: true,
      unpricedArchitectCount: 0,
      unpricedClientCount: 0,
      staleClientCount: 0,
    });
  });
});

describe("createInitialItemPricing", () => {
  it("snapshots product default cost without backfilling from product on existing items", async () => {
    const { createInitialItemPricing } = await import(
      "@/lib/pricing/pricing-item-helpers"
    );

    const pricing = createInitialItemPricing({
      defaultInternalCostAgorot: 100_000,
      project: {
        defaultAdminMarkupBp: 2_000,
        defaultArchitectMarkupBp: 5_000,
      },
    });

    expect(pricing?.internalCostAgorot).toBe(100_000);
    expect(pricing?.architectPriceAgorot).toBe(120_000);
    expect(pricing?.clientPriceAgorot).toBe(180_000);
    expect(pricing?.adminMarkupBp).toBeUndefined();
  });
});
