import { describe, expect, it } from "vitest";
import {
  buildCatalogHref,
  hasCatalogFilters,
  parseCatalogParams,
} from "@/lib/catalog/catalog-params";

describe("parseCatalogParams", () => {
  it("parses q, category, and page", () => {
    expect(
      parseCatalogParams({
        q: " milano ",
        category: "sofas",
        page: "2",
      }),
    ).toEqual({
      query: "milano",
      categorySlug: "sofas",
      page: 2,
      projectId: null,
      roomId: null,
    });
  });

  it("falls back invalid page to 1", () => {
    expect(parseCatalogParams({ page: "abc" }).page).toBe(1);
    expect(parseCatalogParams({ page: "-2" }).page).toBe(1);
  });
});

describe("buildCatalogHref", () => {
  it("omits page when page is 1", () => {
    expect(
      buildCatalogHref({ query: "chair", categorySlug: "sofas", page: 1 }),
    ).toBe("/products?q=chair&category=sofas");
  });

  it("includes page when greater than 1", () => {
    expect(
      buildCatalogHref({ query: "chair", categorySlug: "sofas", page: 3 }),
    ).toBe("/products?q=chair&category=sofas&page=3");
  });
});

describe("hasCatalogFilters", () => {
  it("detects active filters", () => {
    expect(
      hasCatalogFilters({ query: "sofa", categorySlug: null, page: 1, projectId: null, roomId: null }),
    ).toBe(true);
    expect(
      hasCatalogFilters({ query: null, categorySlug: "sofas", page: 1, projectId: null, roomId: null }),
    ).toBe(true);
    expect(
      hasCatalogFilters({ query: null, categorySlug: null, page: 1, projectId: null, roomId: null }),
    ).toBe(false);
  });
});
