import { describe, expect, it } from "vitest";
import { getPublicProductDownloads } from "@/lib/products/get-public-product-downloads";
import type { ProductView } from "@/types/product";

function createProduct(
  overrides: Partial<ProductView> = {},
): ProductView {
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
    documents: [],
    ...overrides,
  };
}

describe("getPublicProductDownloads", () => {
  it("returns documents only and ignores technicalDrawing", () => {
    const downloads = getPublicProductDownloads(
      createProduct({
        documents: [
          {
            id: "doc-1",
            label: "מפרט טכני",
            url: "https://example.com/spec.pdf",
            fileType: "pdf",
          },
        ],
      }),
    );

    expect(downloads).toEqual([
      {
        id: "doc-1",
        label: "מפרט טכני",
        url: "https://example.com/spec.pdf",
        fileType: "pdf",
      },
    ]);
  });

  it("returns an empty list when no documents exist", () => {
    expect(getPublicProductDownloads(createProduct())).toEqual([]);
  });
});
