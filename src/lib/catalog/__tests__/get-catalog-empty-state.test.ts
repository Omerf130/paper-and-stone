import { describe, expect, it } from "vitest";
import { getCatalogEmptyState } from "@/lib/catalog/get-catalog-empty-state";

describe("getCatalogEmptyState", () => {
  it("returns global empty copy when no filters are applied", () => {
    expect(
      getCatalogEmptyState({
        query: null,
        categoryName: null,
        hasFilters: false,
      }),
    ).toEqual({
      variant: "global",
      message: "עדיין לא נוספו מוצרים לקטלוג.",
      resetHref: null,
      resetLabel: null,
    });
  });

  it("returns search-specific empty copy", () => {
    expect(
      getCatalogEmptyState({
        query: "sofa",
        categoryName: null,
        hasFilters: true,
      }),
    ).toEqual({
      variant: "search",
      message: "לא נמצאו מוצרים עבור «sofa».",
      resetHref: "/products",
      resetLabel: "הצג את כל המוצרים",
    });
  });

  it("returns category-specific empty copy", () => {
    expect(
      getCatalogEmptyState({
        query: null,
        categoryName: "ספות",
        hasFilters: true,
      }),
    ).toEqual({
      variant: "category",
      message: "לא נמצאו מוצרים בקטגוריה ספות.",
      resetHref: "/products",
      resetLabel: "הצג את כל המוצרים",
    });
  });
});
