import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CATALOG_PAGE_CONTENT } from "@/lib/cms/cms-defaults";

const getCatalogPageContentMock = vi.fn();

vi.mock("@/lib/cms/get-cms-content", () => ({
  getCatalogPageContent: getCatalogPageContentMock,
}));

describe("get-public-catalog-page-content", () => {
  it("returns defaults when no catalog document exists", async () => {
    getCatalogPageContentMock.mockReset();
    getCatalogPageContentMock.mockResolvedValue(DEFAULT_CATALOG_PAGE_CONTENT);

    const { loadPublicCatalogPageContentUncached } = await import(
      "@/lib/cms/get-public-catalog-page-content"
    );

    const publicView = await loadPublicCatalogPageContentUncached();

    expect(publicView.heading).toBe(DEFAULT_CATALOG_PAGE_CONTENT.heading);
    expect(publicView.supportingText).toBe(
      DEFAULT_CATALOG_PAGE_CONTENT.supportingText,
    );
  });

  it("maps partial stored content merged with defaults", async () => {
    getCatalogPageContentMock.mockReset();
    getCatalogPageContentMock.mockResolvedValue({
      ...DEFAULT_CATALOG_PAGE_CONTENT,
      heading: "קולקציית מוצרים",
    });

    const { loadPublicCatalogPageContentUncached } = await import(
      "@/lib/cms/get-public-catalog-page-content"
    );

    const publicView = await loadPublicCatalogPageContentUncached();

    expect(publicView.heading).toBe("קולקציית מוצרים");
    expect(publicView.eyebrow).toBe(DEFAULT_CATALOG_PAGE_CONTENT.eyebrow);
  });
});
