import { describe, expect, it } from "vitest";
import {
  buildCategoryCatalogHref,
  getLeafPublicProductCount,
  isCategoryNavigable,
  buildCategoryTreeIndexes,
  type CategoryRecord,
} from "@/lib/categories/category-nav-availability";

function record(
  partial: Pick<CategoryRecord, "id" | "slug" | "nameHe" | "kind"> &
    Partial<CategoryRecord>,
): CategoryRecord {
  return {
    sortOrder: 0,
    ...partial,
  };
}

describe("leaf category availability for department landing", () => {
  const categories: CategoryRecord[] = [
    record({ id: "living", slug: "living", nameHe: "מגורים", kind: "department" }),
    record({
      id: "sofas",
      slug: "sofas",
      nameHe: "ספות",
      kind: "leaf",
      parentId: "seating",
    }),
    record({
      id: "sectionals",
      slug: "sectionals",
      nameHe: "ספות מודולריות",
      kind: "leaf",
      parentId: "seating",
    }),
  ];

  const { byId, childrenByParentId } = buildCategoryTreeIndexes(categories);

  it("uses real public product counts for leaf availability", () => {
    const counts = new Map([
      ["sofas", 1],
      ["sectionals", 0],
    ]);

    expect(getLeafPublicProductCount("sofas", counts)).toBe(1);
    expect(getLeafPublicProductCount("sectionals", counts)).toBe(0);

    expect(isCategoryNavigable(byId.get("sofas")!, counts, childrenByParentId, byId)).toBe(
      true,
    );
    expect(
      isCategoryNavigable(byId.get("sectionals")!, counts, childrenByParentId, byId),
    ).toBe(false);
  });

  it("does not create href for empty leaf categories", () => {
    expect(buildCategoryCatalogHref("sectionals", false)).toBeUndefined();
    expect(buildCategoryCatalogHref("sofas", true)).toBe("/products?category=sofas");
  });
});
