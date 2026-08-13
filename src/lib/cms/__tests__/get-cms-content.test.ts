import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_CATALOG_PAGE_CONTENT,
  DEFAULT_HOMEPAGE_CONTENT,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/cms/cms-defaults";
import {
  getCatalogPageContent,
  getHomepageContent,
  getSiteSettings,
} from "@/lib/cms/get-cms-content";

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

const siteSettingsFindOne = vi.fn();
const homepageContentFindOne = vi.fn();
const catalogPageContentFindOne = vi.fn();

vi.mock("@/models/SiteSettings", () => ({
  default: {
    findOne: (...args: unknown[]) => ({
      lean: () => siteSettingsFindOne(...args),
    }),
  },
}));

vi.mock("@/models/HomepageContent", () => ({
  default: {
    findOne: (...args: unknown[]) => ({
      lean: () => homepageContentFindOne(...args),
    }),
  },
}));

vi.mock("@/models/CatalogPageContent", () => ({
  default: {
    findOne: (...args: unknown[]) => ({
      lean: () => catalogPageContentFindOne(...args),
    }),
  },
}));

describe("get-cms-content", () => {
  beforeEach(() => {
    siteSettingsFindOne.mockReset();
    homepageContentFindOne.mockReset();
    catalogPageContentFindOne.mockReset();
  });

  it("returns site settings defaults when no document exists", async () => {
    siteSettingsFindOne.mockResolvedValue(null);

    await expect(getSiteSettings()).resolves.toEqual(DEFAULT_SITE_SETTINGS);
    expect(siteSettingsFindOne).toHaveBeenCalledWith({ key: "site" });
  });

  it("returns homepage defaults when no document exists", async () => {
    homepageContentFindOne.mockResolvedValue(null);

    await expect(getHomepageContent()).resolves.toEqual(DEFAULT_HOMEPAGE_CONTENT);
    expect(homepageContentFindOne).toHaveBeenCalledWith({ key: "homepage" });
  });

  it("merges partial homepage documents with defaults", async () => {
    homepageContentFindOne.mockResolvedValue({
      key: "homepage",
      schemaVersion: 1,
      sectionOrder: DEFAULT_HOMEPAGE_CONTENT.sectionOrder,
      hero: {
        ...DEFAULT_HOMEPAGE_CONTENT.hero,
        heading: "כותרת מעודכנת",
      },
      categories: DEFAULT_HOMEPAGE_CONTENT.categories,
      featuredProducts: DEFAULT_HOMEPAGE_CONTENT.featuredProducts,
      about: DEFAULT_HOMEPAGE_CONTENT.about,
      professionals: DEFAULT_HOMEPAGE_CONTENT.professionals,
      inspiration: DEFAULT_HOMEPAGE_CONTENT.inspiration,
      closing: DEFAULT_HOMEPAGE_CONTENT.closing,
    });

    const content = await getHomepageContent();
    expect(content.hero.heading).toBe("כותרת מעודכנת");
    expect(content.hero.eyebrow).toBe(DEFAULT_HOMEPAGE_CONTENT.hero.eyebrow);
  });

  it("returns catalog defaults when no document exists", async () => {
    catalogPageContentFindOne.mockResolvedValue(null);

    await expect(getCatalogPageContent()).resolves.toEqual(
      DEFAULT_CATALOG_PAGE_CONTENT,
    );
    expect(catalogPageContentFindOne).toHaveBeenCalledWith({ key: "catalog" });
  });
});
