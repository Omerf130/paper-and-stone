import { describe, expect, it } from "vitest";
import {
  buildAdminProductsHref,
  hasAdminProductsFilters,
  parseAdminProductsParams,
} from "@/lib/products/product-params";

describe("parseAdminProductsParams", () => {
  it("parses combined filter params", () => {
    expect(
      parseAdminProductsParams({
        q: "  chair ",
        category: "507f1f77bcf86cd799439011",
        supplier: "507f1f77bcf86cd799439012",
        visibility: "visible",
        featured: "featured",
      }),
    ).toEqual({
      query: "chair",
      categoryId: "507f1f77bcf86cd799439011",
      supplierId: "507f1f77bcf86cd799439012",
      visibility: "visible",
      featured: "featured",
    });
  });

  it("ignores invalid object ids and filter values", () => {
    expect(
      parseAdminProductsParams({
        category: "invalid",
        supplier: "also-invalid",
        visibility: "maybe",
        featured: "sometimes",
      }),
    ).toEqual({
      query: null,
      categoryId: null,
      supplierId: null,
      visibility: null,
      featured: null,
    });
  });
});

describe("hasAdminProductsFilters", () => {
  it("returns true when any filter is active", () => {
    expect(
      hasAdminProductsFilters({
        query: null,
        categoryId: null,
        supplierId: null,
        visibility: "hidden",
        featured: null,
      }),
    ).toBe(true);
  });
});

describe("buildAdminProductsHref", () => {
  it("builds href with active filters", () => {
    expect(
      buildAdminProductsHref({
        query: "sofa",
        visibility: "visible",
      }),
    ).toBe("/admin/products?q=sofa&visibility=visible");
  });
});
