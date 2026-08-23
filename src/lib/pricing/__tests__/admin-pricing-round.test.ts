import { describe, expect, it } from "vitest";
import {
  appendOpenAdminPricingRoundToUpdate,
  getAdminPricingDeliveredRevision,
  getAdminPricingRevision,
  hasPendingAdminPricingDelivery,
  hasUnseenAdminPricingDelivery,
  isAdminLayerPricingIncomplete,
  isAdminPricingReadyToDeliver,
  isAdminPricingRoundComplete,
  shouldOpenAdminPricingRound,
} from "@/lib/pricing/admin-pricing-round";

const layeredProject = {
  onboardingStatus: "active" as const,
  adminPricingRevision: 2,
  adminPricingDeliveredRevision: 2,
  architectAdminPricingSeenRevision: 1,
  items: [
    {
      pricing: {
        internalCostAgorot: 100_000,
        architectPriceAgorot: 140_000,
        clientPriceAgorot: 210_000,
      },
    },
  ],
};

describe("admin-pricing-round", () => {
  it("detects pending delivery when revision exceeds delivered", () => {
    expect(
      hasPendingAdminPricingDelivery({
        ...layeredProject,
        adminPricingRevision: 3,
        adminPricingDeliveredRevision: 2,
      }),
    ).toBe(true);
  });

  it("does not flag pending delivery for legacy projects", () => {
    expect(
      hasPendingAdminPricingDelivery({
        onboardingStatus: null,
        adminPricingRevision: 3,
        adminPricingDeliveredRevision: 0,
        items: [],
      } as never),
    ).toBe(false);
  });

  it("opens a round only when revision equals delivered", () => {
    expect(
      shouldOpenAdminPricingRound({
        onboardingStatus: "active",
        adminPricingRevision: 2,
        adminPricingDeliveredRevision: 2,
      }),
    ).toBe(true);

    expect(
      shouldOpenAdminPricingRound({
        onboardingStatus: "active",
        adminPricingRevision: 3,
        adminPricingDeliveredRevision: 2,
      }),
    ).toBe(false);
  });

  it("increments revision when opening a round on update", () => {
    const update: Record<string, unknown> = {};
    appendOpenAdminPricingRoundToUpdate(
      {
        onboardingStatus: "active",
        adminPricingRevision: 2,
        adminPricingDeliveredRevision: 2,
      },
      update,
    );

    expect(update.$inc).toEqual({ adminPricingRevision: 1 });
  });

  it("requires internal cost and architect price for admin layer completeness", () => {
    expect(
      isAdminLayerPricingIncomplete({
        internalCostAgorot: 100_000,
        architectPriceAgorot: 140_000,
      }),
    ).toBe(false);

    expect(
      isAdminLayerPricingIncomplete({
        internalCostAgorot: 100_000,
      }),
    ).toBe(true);
  });

  it("marks round ready to deliver when pending and admin layer complete", () => {
    expect(
      isAdminPricingReadyToDeliver({
        onboardingStatus: "active",
        adminPricingRevision: 3,
        adminPricingDeliveredRevision: 2,
        items: layeredProject.items as never,
      }),
    ).toBe(true);
  });

  it("detects unseen admin pricing delivery for architects", () => {
    expect(hasUnseenAdminPricingDelivery(layeredProject)).toBe(true);
    expect(
      hasUnseenAdminPricingDelivery({
        ...layeredProject,
        architectAdminPricingSeenRevision: 2,
      }),
    ).toBe(false);
  });

  it("defaults revision fields to zero", () => {
    expect(
      getAdminPricingRevision({
        onboardingStatus: "active",
      } as never),
    ).toBe(0);
    expect(
      getAdminPricingDeliveredRevision({
        onboardingStatus: "active",
      } as never),
    ).toBe(0);
  });

  it("requires at least one item for round completeness", () => {
    expect(
      isAdminPricingRoundComplete([
        {
          pricing: {
            internalCostAgorot: 100_000,
            architectPriceAgorot: 140_000,
          },
        },
      ] as never),
    ).toBe(true);

    expect(isAdminPricingRoundComplete([])).toBe(false);
  });
});
