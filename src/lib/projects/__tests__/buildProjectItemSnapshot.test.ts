import { describe, expect, it } from "vitest";
import { buildProjectItemSnapshot } from "@/lib/projects/buildProjectItemSnapshot";
import type { ProductView } from "@/types/product";

const productView: ProductView = {
  slug: "milano-sofa",
  name: "Milano Sofa",
  nameHe: "ספת Milano",
  brand: "Paper & Stone",
  designer: "Studio",
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
      materialId: "507f1f77bcf86cd799439021",
      materialName: "קטיפה",
      materialType: "FABRIC",
      colors: [
        {
          id: "507f1f77bcf86cd799439022",
          name: "ירוק",
          hex: "#004225",
        },
      ],
    },
  ],
  sizes: [{ id: "260", label: '260 ס"מ' }],
  primaryImage: null,
  gallery: [],
  technicalDrawing: null,
  recolor: null,
};

describe("buildProjectItemSnapshot", () => {
  it("builds minimal snapshot from trusted product data", () => {
    const snapshot = buildProjectItemSnapshot(productView, {
      selectedMaterialId: "507f1f77bcf86cd799439021",
      selectedColorId: "507f1f77bcf86cd799439022",
      selectedSizeKey: "260",
    });

    expect(snapshot).toEqual({
      productName: "ספת Milano",
      productSlug: "milano-sofa",
      sku: "PS-MIL-001",
      materialName: "קטיפה",
      colorName: "ירוק",
      colorHex: "#004225",
      sizeLabel: '260 ס"מ',
    });
  });

  it("does not include image url in snapshot", () => {
    const snapshot = buildProjectItemSnapshot(productView, {
      selectedMaterialId: null,
      selectedColorId: null,
      selectedSizeKey: null,
    });

    expect(snapshot).not.toHaveProperty("primaryImageUrl");
    expect(snapshot).not.toHaveProperty("imageUrl");
  });
});
