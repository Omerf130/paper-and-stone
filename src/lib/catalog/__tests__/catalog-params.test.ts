import { describe, expect, it } from "vitest";
import {
  buildCatalogHref,
  hasCatalogFilters,
  parseCatalogParams,
} from "@/lib/catalog/catalog-params";

describe("parseCatalogParams", () => {
  it("parses q, category, brand, material, sort, and page", () => {
    expect(
      parseCatalogParams({
        q: " milano ",
        category: "sofas",
        brand: "Cassina",
        material: "עץ",
        sort: "name-desc",
        page: "2",
      }),
    ).toEqual({
      query: "milano",
      categorySlug: "sofas",
      brand: "Cassina",
      material: "עץ",
      sort: "name-desc",
      page: 2,
      projectId: null,
      roomId: null,
    });
  });

  it("falls back invalid page to 1", () => {
    expect(parseCatalogParams({ page: "abc" }).page).toBe(1);
    expect(parseCatalogParams({ page: "-2" }).page).toBe(1);
  });

  it("defaults sort to name-asc", () => {
    expect(parseCatalogParams({}).sort).toBe("name-asc");
  });
});

describe("buildCatalogHref", () => {
  it("omits page when page is 1", () => {
    expect(
      buildCatalogHref({ query: "chair", categorySlug: "sofas", page: 1 }),
    ).toBe("/products?q=chair&category=sofas");
  });

  it("includes brand, material, and sort params", () => {
    expect(
      buildCatalogHref({
        brand: "Cassina",
        material: "עץ",
        sort: "name-desc",
      }),
    ).toBe("/products?brand=Cassina&material=%D7%A2%D7%A5&sort=name-desc");
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
      hasCatalogFilters({
        query: "sofa",
        categorySlug: null,
        brand: null,
        material: null,
        sort: "name-asc",
        page: 1,
        projectId: null,
        roomId: null,
      }),
    ).toBe(true);
    expect(
      hasCatalogFilters({
        query: null,
        categorySlug: "sofas",
        brand: null,
        material: null,
        sort: "name-asc",
        page: 1,
        projectId: null,
        roomId: null,
      }),
    ).toBe(true);
    expect(
      hasCatalogFilters({
        query: null,
        categorySlug: null,
        brand: "Cassina",
        material: null,
        sort: "name-asc",
        page: 1,
        projectId: null,
        roomId: null,
      }),
    ).toBe(true);
    expect(
      hasCatalogFilters({
        query: null,
        categorySlug: null,
        brand: null,
        material: null,
        sort: "name-asc",
        page: 1,
        projectId: null,
        roomId: null,
      }),
    ).toBe(false);
  });
});
