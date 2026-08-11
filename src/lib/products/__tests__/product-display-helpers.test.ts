import { describe, expect, it } from "vitest";
import {
  getDefaultVisualTone,
  hasConfiguratorOptions,
  hasFabrics,
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
  fabrics: [],
  sizes: [],
  primaryImage: null,
  gallery: [],
  technicalDrawing: null,
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
        fabrics: [{ id: "velvet", label: "Velvet", colors: [] }],
      }),
    ).toBe(true);
    expect(
      hasConfiguratorOptions({
        ...baseProduct,
        sizes: [{ id: "220", label: "220" }],
      }),
    ).toBe(true);
  });

  it("returns default visual tone when no colors exist", () => {
    expect(getDefaultVisualTone(baseProduct)).toBe("gray");
    expect(
      getDefaultVisualTone({
        ...baseProduct,
        fabrics: [
          {
            id: "velvet",
            label: "Velvet",
            colors: [{ id: "blue", label: "כחול", tone: "blue" }],
          },
        ],
      }),
    ).toBe("blue");
  });

  it("reports fabrics and sizes availability", () => {
    expect(hasFabrics(baseProduct)).toBe(false);
    expect(hasSizes(baseProduct)).toBe(false);
  });
});
