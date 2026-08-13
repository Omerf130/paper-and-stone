import { describe, expect, it } from "vitest";
import { CMS_MEDIA_SCOPES } from "@/lib/cms/cms-media-scope";
import {
  buildCmsStoragePath,
  isPathnameInCmsScope,
} from "@/lib/cms/build-cms-storage-path";

describe("homepage cms media paths", () => {
  it("builds category item paths with stable item ID", () => {
    const itemId = "a1000001-0001-4001-8001-000000000001";
    const pathname = buildCmsStoragePath(
      CMS_MEDIA_SCOPES.homepageCategory,
      "tile.jpg",
      { itemId },
    );

    expect(pathname.startsWith(`cms/homepage/categories/${itemId}/`)).toBe(true);
    expect(isPathnameInCmsScope(pathname, CMS_MEDIA_SCOPES.homepageCategory, { itemId })).toBe(
      true,
    );
  });

  it("builds inspiration item paths with stable item ID", () => {
    const itemId = "b2000002-0002-4002-8002-000000000001";
    const pathname = buildCmsStoragePath(
      CMS_MEDIA_SCOPES.homepageInspiration,
      "inspiration.webp",
      { itemId },
    );

    expect(pathname.startsWith(`cms/homepage/inspiration/${itemId}/`)).toBe(true);
  });

  it("rejects pathnames outside the scoped item directory", () => {
    const itemId = "a1000001-0001-4001-8001-000000000001";
    expect(
      isPathnameInCmsScope(
        "cms/homepage/categories/other-id/file.jpg",
        CMS_MEDIA_SCOPES.homepageCategory,
        { itemId },
      ),
    ).toBe(false);
  });
});
