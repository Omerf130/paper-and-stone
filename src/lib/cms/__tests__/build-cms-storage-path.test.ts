import { describe, expect, it } from "vitest";
import {
  buildCmsStoragePath,
  isPathnameInCmsScope,
} from "@/lib/cms/build-cms-storage-path";
import { CMS_MEDIA_SCOPES } from "@/lib/cms/cms-media-scope";

describe("build-cms-storage-path", () => {
  it("builds a scoped cms path", () => {
    const path = buildCmsStoragePath(CMS_MEDIA_SCOPES.siteLogo, "Logo Final.png");

    expect(path).toMatch(/^cms\/site\/logo\/[0-9a-f-]+-logo-final\.png$/);
  });

  it("validates pathname namespace", () => {
    const path = buildCmsStoragePath(CMS_MEDIA_SCOPES.siteLogo, "logo.png");

    expect(isPathnameInCmsScope(path, CMS_MEDIA_SCOPES.siteLogo)).toBe(true);
    expect(isPathnameInCmsScope("cms/homepage/hero/x.png", CMS_MEDIA_SCOPES.siteLogo)).toBe(
      false,
    );
    expect(isPathnameInCmsScope("//evil", CMS_MEDIA_SCOPES.siteLogo)).toBe(false);
  });
});
