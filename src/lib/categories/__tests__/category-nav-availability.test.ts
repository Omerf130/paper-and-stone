import { describe, expect, it } from "vitest";
import {
  buildCategoryCatalogHref,
  buildCategoryTreeIndexes,
  collectDescendantLeaves,
  isCategoryNavigable,
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

describe("category-nav-availability", () => {
  const categories: CategoryRecord[] = [
    record({ id: "living", slug: "living", nameHe: "מגורים", kind: "department" }),
    record({
      id: "seating",
      slug: "seating",
      nameHe: "ישיבה",
      kind: "group",
      parentId: "living",
    }),
    record({
      id: "sofas",
      slug: "sofas",
      nameHe: "ספות",
      kind: "leaf",
      parentId: "seating",
    }),
    record({
      id: "tables",
      slug: "tables",
      nameHe: "שולחנות",
      kind: "group",
      parentId: "living",
    }),
    record({
      id: "coffee-tables",
      slug: "coffee-tables",
      nameHe: "שולחנות קפה",
      kind: "leaf",
      parentId: "tables",
    }),
  ];

  const { byId, childrenByParentId } = buildCategoryTreeIndexes(categories);

  it("collects descendant leaves for department and group nodes", () => {
    expect(collectDescendantLeaves("living", childrenByParentId, byId).map((c) => c.slug)).toEqual([
      "sofas",
      "coffee-tables",
    ]);
    expect(collectDescendantLeaves("seating", childrenByParentId, byId).map((c) => c.slug)).toEqual([
      "sofas",
    ]);
  });

  it("marks categories navigable only when public products exist in descendant leaves", () => {
    const counts = new Map([["sofas", 2]]);

    expect(isCategoryNavigable(byId.get("sofas")!, counts, childrenByParentId, byId)).toBe(true);
    expect(isCategoryNavigable(byId.get("seating")!, counts, childrenByParentId, byId)).toBe(true);
    expect(isCategoryNavigable(byId.get("living")!, counts, childrenByParentId, byId)).toBe(true);
    expect(isCategoryNavigable(byId.get("tables")!, counts, childrenByParentId, byId)).toBe(false);
    expect(isCategoryNavigable(byId.get("coffee-tables")!, counts, childrenByParentId, byId)).toBe(
      false,
    );
  });

  it("returns catalog href only for navigable categories", () => {
    expect(buildCategoryCatalogHref("sofas", true)).toBe("/products?category=sofas");
    expect(buildCategoryCatalogHref("tables", false)).toBeUndefined();
  });
});
