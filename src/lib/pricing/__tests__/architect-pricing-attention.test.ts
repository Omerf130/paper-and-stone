import { describe, expect, it } from "vitest";
import {
  getArchitectPricingAttentionFromItems,
  isArchitectPricingIncomplete,
} from "@/lib/pricing/architect-pricing-attention";
import {
  getArchitectProjectActionHint,
  getArchitectProjectAttentionReasons,
} from "@/lib/projects/architect-project-attention";

describe("architect-pricing-attention", () => {
  it("counts one incomplete item when architect and client prices are missing", () => {
    expect(
      getArchitectPricingAttentionFromItems([
        { architectPricing: {} },
      ]),
    ).toEqual({
      incompleteItemCount: 1,
      staleClientPriceCount: 0,
    });
  });

  it("counts stale separately from incomplete", () => {
    expect(
      getArchitectPricingAttentionFromItems([
        {
          architectPricing: {
            architectPriceAgorot: 150_000,
            clientPriceAgorot: 225_000,
            clientPriceStale: true,
          },
        },
      ]),
    ).toEqual({
      incompleteItemCount: 0,
      staleClientPriceCount: 1,
    });
  });

  it("returns stale client pricing as top action hint", () => {
    expect(
      getArchitectProjectActionHint({
        onboardingStatus: "active",
        status: "approved",
        items: [
          {
            architectPricing: {
              architectPriceAgorot: 150_000,
              clientPriceAgorot: 225_000,
              clientPriceStale: true,
            },
          },
        ],
      }),
    ).toBe("מחיר לקוח דורש בדיקה");
  });

  it("flags changes requested before submitted review", () => {
    expect(
      getArchitectProjectAttentionReasons({
        onboardingStatus: "active",
        status: "changes_requested",
        items: [],
      }),
    ).toContain("changes_requested");
  });

  it("detects architect pricing incomplete helper", () => {
    expect(isArchitectPricingIncomplete({ architectPriceAgorot: 100_000 })).toBe(true);
    expect(
      isArchitectPricingIncomplete({
        architectPriceAgorot: 100_000,
        clientPriceAgorot: 150_000,
      }),
    ).toBe(false);
  });
});
