import { describe, expect, it } from "vitest";
import {
  getProductPageSections,
  shouldShowSizeSelector,
} from "@/lib/products/get-product-page-sections";
import type { ProductView } from "@/types/product";

function createMinimalProduct(overrides: Partial<ProductView> = {}): ProductView {
  return {
    slug: "test",
    nameHe: "Test",
    name: "Test",
    category: "Cat",
    brand: "",
    designer: "",
    sku: "",
    shortDescription: "",
    longDescription: "",
    materialOptions: [],
    sizes: [],
    materials: [],
    dimensions: {},
    maintenance: "",
    warranty: "",
    countryOfOrigin: "",
    primaryImage: null,
    gallery: [],
    technicalDrawing: null,
    recolor: null,
    documents: [],
    ...overrides,
  };
}

describe("shouldShowSizeSelector", () => {
  it("returns true only when more than one size exists", () => {
    expect(shouldShowSizeSelector(0)).toBe(false);
    expect(shouldShowSizeSelector(1)).toBe(false);
    expect(shouldShowSizeSelector(2)).toBe(true);
  });
});

describe("getProductPageSections", () => {
  it("flags gallery when multiple images exist", () => {
    const product = createMinimalProduct({
      primaryImage: { url: "a.jpg", alt: "A" },
      gallery: [{ url: "b.jpg", alt: "B" }],
    });

    expect(getProductPageSections(product).showGallery).toBe(true);
  });

  it("hides size selector flag for single size", () => {
    const product = createMinimalProduct({
      sizes: [{ id: "s", label: '240 ס"מ' }],
    });

    expect(getProductPageSections(product).showSizeSelector).toBe(false);
  });

  it("shows technical info when dimensions exist", () => {
    const product = createMinimalProduct({
      dimensions: { width: 100 },
    });

    expect(getProductPageSections(product).showTechnicalInfo).toBe(true);
    expect(getProductPageSections(product).showDrawingSwitch).toBe(true);
  });
});
