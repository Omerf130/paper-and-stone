import { describe, expect, it } from "vitest";
import { buildAddToProjectConfigurationView } from "@/lib/products/build-add-to-project-configuration-view";
import type { ProductView } from "@/types/product";

const baseProduct: ProductView = {
  slug: "milano",
  name: "Milano Sofa",
  nameHe: "ספת Milano",
  brand: "B&B Italia",
  designer: "",
  sku: "PS-MIL-001",
  category: "ספות",
  shortDescription: "",
  longDescription: "",
  dimensions: {},
  materials: [],
  maintenance: "",
  warranty: "",
  countryOfOrigin: "",
  materialOptions: [
    {
      materialId: "mat-1",
      materialName: "עור",
      materialType: "leather",
      colors: [{ id: "col-1", name: "שחור", hex: "#1a1a1a" }],
    },
  ],
  sizes: [{ id: "size-1", label: "240 ס״מ" }],
  primaryImage: { url: "https://example.com/milano.jpg", alt: "Milano" },
  gallery: [],
  technicalDrawing: null,
  recolor: null,
  documents: [],
};

describe("buildAddToProjectConfigurationView", () => {
  it("builds configuration summary without quantity row or price", () => {
    const view = buildAddToProjectConfigurationView({
      product: baseProduct,
      material: baseProduct.materialOptions[0] ?? null,
      color: baseProduct.materialOptions[0]?.colors[0] ?? null,
      sizeLabel: "240 ס״מ",
      showSize: true,
      quantity: 2,
    });

    expect(view.productName).toBe("ספת Milano");
    expect(view.sku).toBe("PS-MIL-001");
    expect(view.thumbnailUrl).toBe("https://example.com/milano.jpg");
    expect(view.rows).toEqual([
      { label: "חומר", value: "עור" },
      { label: "צבע", value: "שחור" },
      { label: "מידה", value: "240 ס״מ" },
    ]);
  });
});
