import { describe, expect, it } from "vitest";
import { shouldShowProductDownloadAction } from "@/lib/products/should-show-product-download-action";
import type { ProductView } from "@/types/product";

function createProduct(documents: ProductView["documents"]): ProductView {
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
    technicalDrawing: {
      url: "https://example.com/drawing.jpg",
      alt: "Drawing",
    },
    recolor: null,
    documents,
  };
}

describe("shouldShowProductDownloadAction", () => {
  it("hides download when no public documents exist", () => {
    expect(shouldShowProductDownloadAction(createProduct([]))).toBe(false);
  });

  it("shows download when at least one public document exists", () => {
    expect(
      shouldShowProductDownloadAction(
        createProduct([
          {
            id: "doc-1",
            label: "מפרט",
            url: "https://example.com/spec.pdf",
          },
        ]),
      ),
    ).toBe(true);
  });
});
