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
  it("counts one incomplete item when pricing is missing", () => {
    expect(
      getArchitectPricingAttentionFromItems([
        { architectPricing: { pricingStatus: "unpriced" } },
      ]),
    ).toEqual({
      incompleteItemCount: 1,
      needsReviewItemCount: 0,
    });
  });

  it("counts needs review separately from incomplete", () => {
    expect(
      getArchitectPricingAttentionFromItems([
        {
          architectPricing: {
            pricingStatus: "needs_review",
          },
        },
      ]),
    ).toEqual({
      incompleteItemCount: 0,
      needsReviewItemCount: 1,
    });
  });

  it("returns needs review as top action hint", () => {
    expect(
      getArchitectProjectActionHint({
        onboardingStatus: "active",
        status: "approved",
        items: [
          {
            architectPricing: {
              pricingStatus: "needs_review",
            },
          },
        ],
      }),
    ).toBe("תמחור דורש בדיקת מנהל");
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
    expect(
      isArchitectPricingIncomplete({
        pricingStatus: "unpriced",
      }),
    ).toBe(true);
    expect(
      isArchitectPricingIncomplete({
        pricingStatus: "priced",
      }),
    ).toBe(false);
  });
});
