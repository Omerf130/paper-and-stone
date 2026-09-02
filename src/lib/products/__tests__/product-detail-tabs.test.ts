import { describe, expect, it } from "vitest";
import {
  getProductPdpTabLabels,
  resolveProductPdpTabId,
} from "@/lib/products/get-product-detail-tabs";
import type { ProductView } from "@/types/product";

function createProduct(overrides: Partial<ProductView> = {}): ProductView {
  return {
    slug: "test",
    name: "Test",
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

describe("getProductPdpTabLabels", () => {
  it("always includes overview and conditionally adds configure/dimensions", () => {
    expect(getProductPdpTabLabels(createProduct()).map((tab) => tab.id)).toEqual([
      "overview",
    ]);

    expect(
      getProductPdpTabLabels(
        createProduct({
          materialOptions: [
            {
              materialId: "m1",
              materialName: "Velvet",
              materialType: "fabric",
              colors: [],
            },
          ],
        }),
      ).map((tab) => tab.id),
    ).toEqual(["overview", "configure"]);

    expect(
      getProductPdpTabLabels(
        createProduct({ dimensions: { width: 100, height: 80 } }),
      ).map((tab) => tab.id),
    ).toEqual(["overview", "dimensions"]);
  });
});

describe("resolveProductPdpTabId", () => {
  const configurable = createProduct({
    materialOptions: [
      {
        materialId: "m1",
        materialName: "Velvet",
        materialType: "fabric",
        colors: [],
      },
    ],
    dimensions: { width: 100 },
  });

  it("supports new and legacy tab ids", () => {
    expect(resolveProductPdpTabId("overview", configurable)).toBe("overview");
    expect(resolveProductPdpTabId("configure", configurable)).toBe("configure");
    expect(resolveProductPdpTabId("dimensions", configurable)).toBe("dimensions");
    expect(resolveProductPdpTabId("product", configurable)).toBe("overview");
    expect(resolveProductPdpTabId("drawing", configurable)).toBe("dimensions");
  });

  it("falls back to overview", () => {
    expect(resolveProductPdpTabId("unknown", configurable)).toBe("overview");
    expect(resolveProductPdpTabId(null, configurable)).toBe("overview");
    expect(resolveProductPdpTabId("configure", createProduct())).toBe("overview");
  });
});
