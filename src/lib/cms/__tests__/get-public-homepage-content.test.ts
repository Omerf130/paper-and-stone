import { describe, expect, it, vi } from "vitest";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/cms/cms-defaults";

const getHomepageContentMock = vi.fn();
const getHomepageCategoryRecordsMock = vi.fn();

vi.mock("@/lib/cms/get-cms-content", () => ({
  getHomepageContent: getHomepageContentMock,
}));

vi.mock("@/lib/cms/get-homepage-category-records", () => ({
  getHomepageCategoryRecords: getHomepageCategoryRecordsMock,
}));

describe("get-public-homepage-content", () => {
  it("maps defaults without querying categories when no category ids exist", async () => {
    getHomepageContentMock.mockReset();
    getHomepageCategoryRecordsMock.mockReset();
    getHomepageContentMock.mockResolvedValue(DEFAULT_HOMEPAGE_CONTENT);
    getHomepageCategoryRecordsMock.mockResolvedValue(new Map());

    const { loadPublicHomepageContentUncached } = await import(
      "@/lib/cms/get-public-homepage-content"
    );

    const publicView = await loadPublicHomepageContentUncached();

    expect(getHomepageCategoryRecordsMock).toHaveBeenCalledWith([]);
    expect(publicView.hero.heading).toBe(DEFAULT_HOMEPAGE_CONTENT.hero.heading);
    expect(publicView.inspiration.showDemoNote).toBe(true);
  });

  it("queries only referenced category ids", async () => {
    getHomepageContentMock.mockReset();
    getHomepageCategoryRecordsMock.mockReset();

    const content = structuredClone(DEFAULT_HOMEPAGE_CONTENT);
    content.categories.items[0] = {
      ...content.categories.items[0]!,
      categoryId: "cat-1",
    };

    getHomepageContentMock.mockResolvedValue(content);
    getHomepageCategoryRecordsMock.mockResolvedValue(
      new Map([
        [
          "cat-1",
          {
            id: "cat-1",
            nameHe: "ספות",
            slug: "sofas",
            isActive: true,
          },
        ],
      ]),
    );

    const { loadPublicHomepageContentUncached } = await import(
      "@/lib/cms/get-public-homepage-content"
    );

    const publicView = await loadPublicHomepageContentUncached();

    expect(getHomepageCategoryRecordsMock).toHaveBeenCalledWith(["cat-1"]);
    expect(publicView.categories.tiles[0]?.href).toBe("/products?category=sofas");
  });
});
