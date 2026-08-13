import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/cms/cms-defaults";
import {
  isSerializableCmsView,
  mapHomepageContentToView,
  mapSiteSettingsToView,
} from "@/lib/cms/map-cms-to-view";
import { CMS_SINGLETON_KEYS } from "@/types/cms-content";

describe("map-cms-to-view", () => {
  it("serializes category ObjectIds to strings", () => {
    const categoryId = new Types.ObjectId();
    const view = mapHomepageContentToView({
      key: CMS_SINGLETON_KEYS.homepage,
      schemaVersion: 1,
      sectionOrder: DEFAULT_HOMEPAGE_CONTENT.sectionOrder,
      hero: DEFAULT_HOMEPAGE_CONTENT.hero,
      categories: {
        ...DEFAULT_HOMEPAGE_CONTENT.categories,
        items: [
          {
            id: DEFAULT_HOMEPAGE_CONTENT.categories.items[0]!.id,
            categoryId,
            displayTitle: "ספות",
            layout: "large",
            isVisible: true,
            order: 0,
          },
        ],
      },
      featuredProducts: DEFAULT_HOMEPAGE_CONTENT.featuredProducts,
      about: DEFAULT_HOMEPAGE_CONTENT.about,
      professionals: DEFAULT_HOMEPAGE_CONTENT.professionals,
      inspiration: DEFAULT_HOMEPAGE_CONTENT.inspiration,
      closing: DEFAULT_HOMEPAGE_CONTENT.closing,
    });

    expect(view.categories.items[0]?.categoryId).toBe(categoryId.toString());
  });

  it("does not leak mongoose metadata in serialized views", () => {
    const view = mapSiteSettingsToView({
      key: CMS_SINGLETON_KEYS.site,
      schemaVersion: 1,
      brandName: "Paper & Stone",
      footerDescription: "ריהוט, חומרים ופתרונות לפרויקטים",
    });

    expect(isSerializableCmsView(view)).toBe(true);
    expect(view).not.toHaveProperty("_id");
    expect(view).not.toHaveProperty("__v");
  });
});
