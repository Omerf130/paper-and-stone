import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/cms-defaults";
import { mergeWithDefaults } from "@/lib/cms/merge-cms-content";

describe("merge-cms-content", () => {
  it("returns defaults when stored content is absent", () => {
    const merged = mergeWithDefaults(DEFAULT_SITE_SETTINGS, undefined);
    expect(merged).toEqual(DEFAULT_SITE_SETTINGS);
  });

  it("preserves saved values while filling missing fields from defaults", () => {
    const merged = mergeWithDefaults(DEFAULT_SITE_SETTINGS, {
      brandName: "Custom Brand",
    });

    expect(merged.brandName).toBe("Custom Brand");
    expect(merged.footerDescription).toBe(DEFAULT_SITE_SETTINGS.footerDescription);
  });

  it("preserves intentionally saved empty arrays", () => {
    const merged = mergeWithDefaults(
      {
        items: ["default"],
      },
      {
        items: [],
      },
    );

    expect(merged.items).toEqual([]);
  });
});
