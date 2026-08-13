import { describe, expect, it } from "vitest";
import CatalogPageContent from "@/models/CatalogPageContent";
import HomepageContent from "@/models/HomepageContent";
import SiteSettings from "@/models/SiteSettings";
import { CMS_SINGLETON_KEYS } from "@/types/cms-content";

describe("CMS singleton models", () => {
  it("declares unique required key index on SiteSettings", () => {
    const keyPath = SiteSettings.schema.path("key");
    expect(keyPath.options.unique).toBe(true);
    expect(keyPath.options.required).toBe(true);
    expect(keyPath.options.default).toBe(CMS_SINGLETON_KEYS.site);
  });

  it("declares unique required key index on HomepageContent", () => {
    const keyPath = HomepageContent.schema.path("key");
    expect(keyPath.options.unique).toBe(true);
    expect(keyPath.options.required).toBe(true);
    expect(keyPath.options.default).toBe(CMS_SINGLETON_KEYS.homepage);
  });

  it("declares unique required key index on CatalogPageContent", () => {
    const keyPath = CatalogPageContent.schema.path("key");
    expect(keyPath.options.unique).toBe(true);
    expect(keyPath.options.required).toBe(true);
    expect(keyPath.options.default).toBe(CMS_SINGLETON_KEYS.catalog);
  });

  it("defaults schemaVersion to 1", () => {
    expect(SiteSettings.schema.path("schemaVersion").options.default).toBe(1);
    expect(HomepageContent.schema.path("schemaVersion").options.default).toBe(1);
    expect(CatalogPageContent.schema.path("schemaVersion").options.default).toBe(1);
  });
});
