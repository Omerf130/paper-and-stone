import { describe, expect, it } from "vitest";
import {
  hasConfiguratorOptions,
  hasMaterials,
  hasProductDimensions,
  hasSizes,
} from "@/lib/products/product-display-helpers";
import type { ProductView } from "@/types/product";

const baseProduct: ProductView = {
  slug: "demo",
  name: "Demo",
  nameHe: "דמו",
  brand: "",
  designer: "",
  sku: "SKU-1",
  category: "ספות",
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
};

describe("product display helpers", () => {
  it("detects missing dimensions", () => {
    expect(hasProductDimensions({})).toBe(false);
    expect(hasProductDimensions({ width: 200 })).toBe(true);
  });

  it("detects configurator options", () => {
    expect(hasConfiguratorOptions(baseProduct)).toBe(false);
    expect(
      hasConfiguratorOptions({
        ...baseProduct,
        materialOptions: [
          {
            materialId: "velvet",
            materialName: "Velvet",
            materialType: "FABRIC",
            colors: [],
          },
        ],
      }),
    ).toBe(true);
    expect(
      hasConfiguratorOptions({
        ...baseProduct,
        sizes: [{ id: "220", label: "220" }],
      }),
    ).toBe(true);
  });

  it("reports materials and sizes availability", () => {
    expect(hasMaterials(baseProduct)).toBe(false);
    expect(hasSizes(baseProduct)).toBe(false);
  });
});
