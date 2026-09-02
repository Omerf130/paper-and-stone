import { describe, expect, it } from "vitest";
import {
  buildProductOverviewDescription,
  buildProductOverviewSpecRows,
  hasProductOverviewContent,
} from "@/lib/products/build-product-overview-spec-rows";
import type { ProductView } from "@/types/product";

function createProduct(overrides: Partial<ProductView> = {}): ProductView {
  return {
    slug: "test",
    name: "בדיקה",
    nameHe: "בדיקה",
    brand: "",
    designer: "",
    sku: "SKU-1",
    category: "",
    shortDescription: "",
    longDescription: "",
    dimensions: {},
    materials: [],
    maintenance: "",
    warranty: "",
    countryOfOrigin: "",
    materialOptions: [],
    sizes: [],
    primaryImage: null,
    gallery: [],
    technicalDrawing: null,
    recolor: null,
    documents: [],
    ...overrides,
  };
}

describe("build-product-overview-spec-rows", () => {
  it("returns only rows with real data", () => {
    const rows = buildProductOverviewSpecRows(
      createProduct({
        brand: "Paper & Stone",
        designer: "Studio A",
        countryOfOrigin: "Italy",
        materials: ["Oak", "Velvet"],
        warranty: "5 years",
      }),
    );

    expect(rows).toEqual([
      { label: "מותג", value: "Paper & Stone" },
      { label: "מעצב", value: "Studio A" },
      { label: "ארץ ייצור", value: "Italy" },
      { label: "חומרים", value: "Oak, Velvet" },
      { label: "אחריות", value: "5 years" },
    ]);
  });

  it("prefers long description over short description", () => {
    expect(
      buildProductOverviewDescription(
        createProduct({
          shortDescription: "Short",
          longDescription: "Long description",
        }),
      ),
    ).toBe("Long description");
  });

  it("detects when overview has content", () => {
    expect(hasProductOverviewContent(createProduct())).toBe(false);
    expect(
      hasProductOverviewContent(createProduct({ shortDescription: "Hello" })),
    ).toBe(true);
  });
});
