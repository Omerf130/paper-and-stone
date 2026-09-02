import { describe, expect, it, vi, beforeEach } from "vitest";

const findOneMock = vi.fn();
const getPublicCategoryNavTreeMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Category", () => ({
  default: {
    findOne: findOneMock,
  },
}));

vi.mock("@/lib/categories/get-public-category-nav-tree", () => ({
  getPublicCategoryNavTree: getPublicCategoryNavTreeMock,
}));

describe("resolveCatalogCategoryView", () => {
  beforeEach(() => {
    findOneMock.mockReset();
    getPublicCategoryNavTreeMock.mockReset();
  });

  it("returns department landing for department slug without product filters", async () => {
    findOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ slug: "living", kind: "department" }),
      }),
    });

    getPublicCategoryNavTreeMock.mockResolvedValue({
      departments: [
        {
          slug: "living",
          nameHe: "מגורים",
          isNavigable: true,
          groups: [
            {
              slug: "seating",
              nameHe: "ישיבה",
              isNavigable: true,
              leaves: [
                {
                  slug: "sofas",
                  nameHe: "ספות",
                  productCount: 1,
                  isNavigable: true,
                  href: "/products?category=sofas",
                },
              ],
            },
          ],
          directLeaves: [],
        },
      ],
    });

    const { resolveCatalogCategoryView } = await import(
      "@/lib/catalog/resolve-catalog-category-view"
    );

    await expect(
      resolveCatalogCategoryView({
        categorySlug: "living",
        query: null,
        brand: null,
        material: null,
      }),
    ).resolves.toEqual({
      mode: "department-landing",
      department: expect.objectContaining({ slug: "living" }),
    });
  });

  it("returns leaf products for leaf slug", async () => {
    findOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ slug: "sofas", kind: "leaf" }),
      }),
    });

    getPublicCategoryNavTreeMock.mockResolvedValue({
      departments: [
        {
          slug: "living",
          nameHe: "מגורים",
          isNavigable: true,
          groups: [
            {
              slug: "seating",
              nameHe: "ישיבה",
              isNavigable: true,
              leaves: [
                {
                  slug: "sofas",
                  nameHe: "ספות",
                  productCount: 1,
                  isNavigable: true,
                },
              ],
            },
          ],
          directLeaves: [],
        },
      ],
    });

    const { resolveCatalogCategoryView } = await import(
      "@/lib/catalog/resolve-catalog-category-view"
    );

    await expect(
      resolveCatalogCategoryView({
        categorySlug: "sofas",
        query: null,
        brand: null,
        material: null,
      }),
    ).resolves.toEqual({
      mode: "leaf-products",
      categorySlug: "sofas",
      departmentContext: {
        department: expect.objectContaining({ slug: "living" }),
      },
    });
  });

  it("falls back to product catalog when search filters are present", async () => {
    const { resolveCatalogCategoryView } = await import(
      "@/lib/catalog/resolve-catalog-category-view"
    );

    await expect(
      resolveCatalogCategoryView({
        categorySlug: "living",
        query: "milano",
        brand: null,
        material: null,
      }),
    ).resolves.toEqual({
      mode: "leaf-products",
      categorySlug: "living",
      departmentContext: null,
    });

    expect(findOneMock).not.toHaveBeenCalled();
  });
});
