import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { buildProductCatalogFilter } from "@/lib/catalog/build-product-catalog-filter";

const categoryId = new Types.ObjectId("507f1f77bcf86cd799439011");
const secondCategoryId = new Types.ObjectId("507f1f77bcf86cd799439012");

describe("buildProductCatalogFilter", () => {
  it("always filters active products", () => {
    expect(buildProductCatalogFilter({})).toEqual({ isActive: true });
  });

  it("adds categoryId when one category id is provided", () => {
    expect(
      buildProductCatalogFilter({ categoryIds: [categoryId] }),
    ).toEqual({
      isActive: true,
      categoryId,
    });
  });

  it("adds categoryId $in when multiple category ids are provided", () => {
    expect(
      buildProductCatalogFilter({ categoryIds: [categoryId, secondCategoryId] }),
    ).toEqual({
      isActive: true,
      categoryId: { $in: [categoryId, secondCategoryId] },
    });
  });

  it("adds search or-clauses for query", () => {
    const filter = buildProductCatalogFilter({ query: "milano" });

    expect(filter.isActive).toBe(true);
    expect(filter.$or).toHaveLength(5);
    expect(filter.$or?.[0]).toEqual({
      nameHe: expect.objectContaining({ source: "milano", flags: "i" }),
    });
  });

  it("escapes regex characters in query", () => {
    const filter = buildProductCatalogFilter({ query: "a.b" });
    const pattern = filter.$or?.[0]?.nameHe as RegExp;

    expect(pattern.source).toBe("a\\.b");
  });

  it("combines category and search filters", () => {
    const filter = buildProductCatalogFilter({
      query: "chair",
      categoryIds: [categoryId],
    });

    expect(filter.categoryId).toEqual(categoryId);
    expect(filter.$or).toHaveLength(5);
  });

  it("adds brand and material filters when provided", () => {
    expect(
      buildProductCatalogFilter({
        brand: "Cassina",
        material: "עץ",
      }),
    ).toEqual({
      isActive: true,
      brand: "Cassina",
      materials: "עץ",
    });
  });
});
