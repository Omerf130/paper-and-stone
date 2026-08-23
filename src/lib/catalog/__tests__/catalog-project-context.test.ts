import { describe, expect, it } from "vitest";
import {
  buildCatalogHref,
  buildProductWithProjectContextHref,
  buildProjectReturnHref,
  hasCatalogProjectContext,
  parseCatalogParams,
} from "@/lib/catalog/catalog-params";

describe("catalog project context params", () => {
  it("parses project and room params", () => {
    expect(
      parseCatalogParams({
        q: "sofa",
        category: "chairs",
        page: "2",
        project: "507f1f77bcf86cd799439011",
        room: "507f1f77bcf86cd799439012",
      }),
    ).toEqual({
      query: "sofa",
      categorySlug: "chairs",
      page: 2,
      projectId: "507f1f77bcf86cd799439011",
      roomId: "507f1f77bcf86cd799439012",
    });
  });

  it("preserves project context in catalog hrefs", () => {
    expect(
      buildCatalogHref({
        query: "milano",
        categorySlug: "sofas",
        page: 2,
        projectId: "507f1f77bcf86cd799439011",
        roomId: "507f1f77bcf86cd799439012",
      }),
    ).toBe(
      "/products?q=milano&category=sofas&page=2&project=507f1f77bcf86cd799439011&room=507f1f77bcf86cd799439012",
    );
  });

  it("preserves project context in product detail hrefs", () => {
    expect(
      buildProductWithProjectContextHref("milano-sofa", {
        projectId: "507f1f77bcf86cd799439011",
        roomId: "507f1f77bcf86cd799439012",
        query: "milano",
      }),
    ).toBe(
      "/products/milano-sofa?project=507f1f77bcf86cd799439011&room=507f1f77bcf86cd799439012&q=milano",
    );
  });

  it("builds project return href with room and added flag", () => {
    expect(
      buildProjectReturnHref("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", {
        added: true,
      }),
    ).toBe(
      "/professional/projects/507f1f77bcf86cd799439011?room=507f1f77bcf86cd799439012&added=1",
    );
  });

  it("detects full project context", () => {
    expect(
      hasCatalogProjectContext({
        query: null,
        categorySlug: null,
        page: 1,
        projectId: "507f1f77bcf86cd799439011",
        roomId: "507f1f77bcf86cd799439012",
      }),
    ).toBe(true);
    expect(
      hasCatalogProjectContext({
        query: null,
        categorySlug: null,
        page: 1,
        projectId: "507f1f77bcf86cd799439011",
        roomId: null,
      }),
    ).toBe(false);
  });
});
