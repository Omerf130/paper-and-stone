import { describe, expect, it } from "vitest";
import { getCatalogResultSummaryLabel } from "@/lib/catalog/get-catalog-result-summary-label";

describe("getCatalogResultSummaryLabel", () => {
  it("returns product count when no filters are applied", () => {
    expect(
      getCatalogResultSummaryLabel({
        total: 12,
        query: null,
        categoryName: null,
        hasFilters: false,
      }),
    ).toBe("12 מוצרים");
  });

  it("includes category and query when both filters are active", () => {
    expect(
      getCatalogResultSummaryLabel({
        total: 3,
        query: "sofa",
        categoryName: "ספות",
        hasFilters: true,
      }),
    ).toBe("3 תוצאות · ספות · «sofa»");
  });

  it("includes only query when search is active", () => {
    expect(
      getCatalogResultSummaryLabel({
        total: 1,
        query: "muuto",
        categoryName: null,
        hasFilters: true,
      }),
    ).toBe("1 תוצאות · «muuto»");
  });
});
