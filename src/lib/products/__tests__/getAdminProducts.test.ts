import { describe, expect, it } from "vitest";
import { buildAdminProductsFilter } from "@/lib/products/getAdminProducts";

describe("buildAdminProductsFilter", () => {
  it("builds text search filter", () => {
    expect(
      buildAdminProductsFilter({
        query: "chair",
        categoryId: null,
        supplierId: null,
        visibility: null,
        featured: null,
      }),
    ).toEqual({
      $or: [
        { nameHe: { $regex: "chair", $options: "i" } },
        { nameEn: { $regex: "chair", $options: "i" } },
        { sku: { $regex: "chair", $options: "i" } },
        { slug: { $regex: "chair", $options: "i" } },
        { internalCatalogName: { $regex: "chair", $options: "i" } },
        { catalogCode: { $regex: "chair", $options: "i" } },
      ],
    });
  });

  it("combines category, supplier, visibility, and featured filters", () => {
    const filter = buildAdminProductsFilter({
      query: null,
      categoryId: "507f1f77bcf86cd799439011",
      supplierId: "507f1f77bcf86cd799439012",
      visibility: "hidden",
      featured: "not-featured",
    });

    expect(filter.$and).toHaveLength(4);
    expect(filter.$and?.[0]).toEqual({
      categoryId: expect.anything(),
    });
    expect(filter.$and?.[1]).toEqual({
      supplierId: expect.anything(),
    });
    expect(filter.$and?.[2]).toEqual({ isActive: false });
    expect(filter.$and?.[3]).toEqual({ isFeatured: false });
  });
});
