import { describe, expect, it, vi } from "vitest";

const revalidateTagMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
  revalidatePath: revalidatePathMock,
}));

describe("revalidate-catalog-paths", () => {
  it("revalidates catalog cache tag and public routes", async () => {
    revalidateTagMock.mockReset();
    revalidatePathMock.mockReset();

    const { revalidateCatalogPaths, CATALOG_CONTENT_CACHE_TAG } = await import(
      "@/lib/cms/revalidate-catalog-paths"
    );

    await revalidateCatalogPaths();

    expect(CATALOG_CONTENT_CACHE_TAG).toBe("catalog-content");
    expect(revalidateTagMock).toHaveBeenCalledWith("catalog-content", {
      expire: 0,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/content/catalog");
    expect(revalidatePathMock).toHaveBeenCalledWith("/products");
  });
});
