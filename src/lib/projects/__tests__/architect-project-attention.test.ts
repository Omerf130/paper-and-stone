import { describe, expect, it } from "vitest";
import {
  getArchitectProjectActionHint,
  getArchitectProjectAttentionReasons,
} from "@/lib/projects/architect-project-attention";

describe("architect-project-attention", () => {
  it("includes commercial_dirty for approved dirty layered projects", () => {
    expect(
      getArchitectProjectAttentionReasons({
        onboardingStatus: "active",
        status: "approved",
        commercialDirty: true,
        items: [],
      }),
    ).toContain("commercial_dirty");
  });

  it("does not include commercial_dirty for approved clean projects", () => {
    expect(
      getArchitectProjectAttentionReasons({
        onboardingStatus: "active",
        status: "approved",
        commercialDirty: false,
        items: [],
      }),
    ).not.toContain("commercial_dirty");
  });

  it("prioritizes stale pricing over commercial dirty in action hint", () => {
    expect(
      getArchitectProjectActionHint({
        onboardingStatus: "active",
        status: "approved",
        commercialDirty: true,
        items: [
          {
            architectPricing: {
              architectPriceAgorot: 100_000,
              clientPriceAgorot: 150_000,
              clientPriceStale: true,
            },
          },
        ],
      }),
    ).toBe("מחיר לקוח דורש בדיקה");
  });

  it("prioritizes commercial dirty over incomplete pricing", () => {
    expect(
      getArchitectProjectActionHint({
        onboardingStatus: "active",
        status: "approved",
        commercialDirty: true,
        items: [{ architectPricing: { architectPriceAgorot: 100_000 } }],
      }),
    ).toBe("יש שינויים שטרם נשלחו לבדיקה");
  });
});
