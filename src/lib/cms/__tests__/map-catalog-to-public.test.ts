import { describe, expect, it } from "vitest";
import { DEFAULT_CATALOG_PAGE_CONTENT } from "@/lib/cms/cms-defaults";
import { mapCatalogToPublic } from "@/lib/cms/map-catalog-to-public";

describe("map-catalog-to-public", () => {
  it("maps catalog content without internal CMS fields", () => {
    const publicView = mapCatalogToPublic(DEFAULT_CATALOG_PAGE_CONTENT);

    expect(publicView).toEqual({
      eyebrow: "Paper & Stone",
      heading: "מוצרים",
      supportingText: "מבחר מוצרים פעילים מ-Paper & Stone.",
    });
    expect(publicView).not.toHaveProperty("key");
    expect(publicView).not.toHaveProperty("schemaVersion");
  });
});
