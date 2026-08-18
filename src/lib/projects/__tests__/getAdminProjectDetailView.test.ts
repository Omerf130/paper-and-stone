import { describe, expect, it } from "vitest";
import { mapProjectPricingSettingsView } from "@/lib/pricing/pricing-view-mappers";

describe("admin project detail pricing editability path", () => {
  it.each([
    ["draft", true],
    ["changes_requested", true],
    ["submitted", true],
    ["approved", true],
  ] as const)("maps editable admin pricing for active + %s", (status, expected) => {
    const settings = mapProjectPricingSettingsView({
      onboardingStatus: "active",
      status,
      defaultAdminMarkupBp: 4_000,
      defaultArchitectMarkupBp: 5_000,
    });

    expect(settings.isAdminPricingEditable).toBe(expected);
    expect(settings.usesLayeredPricing).toBe(true);
  });

  it("maps non-editable admin pricing for pending onboarding", () => {
    const settings = mapProjectPricingSettingsView({
      onboardingStatus: "pending_approval",
      status: "draft",
    });

    expect(settings.isAdminPricingEditable).toBe(false);
    expect(settings.adminPricingUnavailableReason).toBe(
      "הפרויקט עדיין ממתין לאישור פתיחה",
    );
  });

  it("maps non-editable admin pricing for rejected onboarding", () => {
    const settings = mapProjectPricingSettingsView({
      onboardingStatus: "rejected",
      status: "draft",
    });

    expect(settings.isAdminPricingEditable).toBe(false);
  });

  it("does not expose layered pricing for legacy projects", () => {
    const settings = mapProjectPricingSettingsView({
      onboardingStatus: null,
      status: "draft",
    });

    expect(settings.usesLayeredPricing).toBe(false);
    expect(settings.isAdminPricingEditable).toBe(false);
  });
});
