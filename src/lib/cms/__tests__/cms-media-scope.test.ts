import { describe, expect, it } from "vitest";
import {
  CMS_MEDIA_SCOPES,
  isKnownCmsMediaScope,
  isWritableCmsMediaScope,
} from "@/lib/cms/cms-media-scope";

describe("cms-media-scope", () => {
  it("allows site.logo in 16B", () => {
    expect(isWritableCmsMediaScope(CMS_MEDIA_SCOPES.siteLogo)).toBe(true);
  });

  it("allows homepage scopes in 16C", () => {
    expect(isWritableCmsMediaScope(CMS_MEDIA_SCOPES.homepageHero)).toBe(true);
    expect(isWritableCmsMediaScope(CMS_MEDIA_SCOPES.homepageCategory)).toBe(true);
    expect(isWritableCmsMediaScope(CMS_MEDIA_SCOPES.homepageInspiration)).toBe(true);
  });

  it("rejects unknown scopes", () => {
    expect(isKnownCmsMediaScope("site.unknown")).toBe(false);
    expect(isWritableCmsMediaScope("site.unknown")).toBe(false);
    expect(isWritableCmsMediaScope(CMS_MEDIA_SCOPES.catalogHero)).toBe(false);
  });
});
