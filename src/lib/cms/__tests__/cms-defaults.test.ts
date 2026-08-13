import { describe, expect, it } from "vitest";
import {
  DEFAULT_CATALOG_PAGE_CONTENT,
  DEFAULT_HOMEPAGE_CONTENT,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/cms/cms-defaults";
import { homepageContentHasFeaturedProductIds } from "@/lib/cms/cms-validation";

describe("cms-defaults", () => {
  it("mirrors current hero copy", () => {
    expect(DEFAULT_HOMEPAGE_CONTENT.hero.heading).toBe(
      "ריהוט וחומרים שמתחילים ברעיון ונכנסים לפרויקט",
    );
    expect(DEFAULT_HOMEPAGE_CONTENT.hero.primaryCta.href).toBe("/products");
  });

  it("mirrors current catalog hero copy", () => {
    expect(DEFAULT_CATALOG_PAGE_CONTENT.heading).toBe("מוצרים");
    expect(DEFAULT_CATALOG_PAGE_CONTENT.supportingText).toBe(
      "מבחר מוצרים פעילים מ-Paper & Stone.",
    );
  });

  it("mirrors current footer brand copy without required contact fields", () => {
    expect(DEFAULT_SITE_SETTINGS.brandName).toBe("Paper & Stone");
    expect(DEFAULT_SITE_SETTINGS.contactEmail).toBeUndefined();
    expect(DEFAULT_SITE_SETTINGS.contactPhone).toBeUndefined();
    expect(DEFAULT_SITE_SETTINGS.whatsappPhone).toBeUndefined();
  });

  it("does not include featured product IDs", () => {
    expect(homepageContentHasFeaturedProductIds(DEFAULT_HOMEPAGE_CONTENT)).toBe(
      false,
    );
  });

  it("includes all known homepage sections in default order with hero first", () => {
    expect(DEFAULT_HOMEPAGE_CONTENT.sectionOrder[0]).toBe("hero");
    expect(DEFAULT_HOMEPAGE_CONTENT.sectionOrder).toHaveLength(7);
  });
});
