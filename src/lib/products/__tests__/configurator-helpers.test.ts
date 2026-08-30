import { describe, expect, it } from "vitest";
import {
  getConfiguratorState,
  getMaterialById,
  resolveValidColorId,
} from "@/lib/products/configurator-helpers";
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
  documents: [],
};

describe("configurator helpers", () => {
  it("selects first material and color", () => {
    const product: ProductView = {
      ...baseProduct,
      materialOptions: [
        {
          materialId: "mat-1",
          materialName: "Velvet",
          materialType: "FABRIC",
          colors: [
            { id: "color-1", name: "כחול", hex: "#2B4C7E" },
            { id: "color-2", name: "אפור", hex: "#808080" },
          ],
        },
      ],
    };

    expect(getConfiguratorState(product)).toEqual({
      materialId: "mat-1",
      colorId: "color-1",
      sizeId: null,
      hasMaterials: true,
      hasSizes: false,
      hasConfiguratorOptions: true,
    });
  });

  it("resolves valid color after material change", () => {
    const velvet = {
      materialId: "velvet",
      materialName: "Velvet",
      materialType: "FABRIC" as const,
      colors: [{ id: "blue", name: "כחול", hex: "#2B4C7E" }],
    };
    const linen = {
      materialId: "linen",
      materialName: "Linen",
      materialType: "FABRIC" as const,
      colors: [{ id: "natural", name: "טבעי", hex: "#D4C4A8" }],
    };

    const product: ProductView = {
      ...baseProduct,
      materialOptions: [velvet, linen],
    };

    expect(getMaterialById(product, "linen")).toEqual(linen);
    expect(resolveValidColorId(linen, "blue")).toBe("natural");
    expect(resolveValidColorId(velvet, "blue")).toBe("blue");
  });
});
