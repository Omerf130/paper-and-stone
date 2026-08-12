import { describe, expect, it, vi } from "vitest";
import { mapProductToView } from "@/lib/products/mapProductToView";
import { LEGACY_FALLBACK_HEX } from "@/lib/products/material-options/material-option-errors";

vi.mock("@/lib/products/material-options/mapProductMaterialOptionsToView", () => ({
  mapProductMaterialOptionsToView: vi.fn(async () => [
    {
      materialId: "507f1f77bcf86cd799439011",
      materialName: "Velvet",
      materialType: "FABRIC",
      colors: [{ id: "507f1f77bcf86cd799439012", name: "כחול", hex: "#2B4C7E" }],
    },
  ]),
}));

describe("mapProductToView", () => {
  it("omits missing dimensions instead of zero-filling", async () => {
    const view = await mapProductToView({
      slug: "simple-product",
      nameHe: "מוצר פשוט",
      sku: "SKU-1",
      categoryId: { nameHe: "ספות" },
      isActive: true,
      isFeatured: false,
      materials: [],
      materialOptions: [],
      fabrics: [],
      sizes: [],
    } as never);

    expect(view.dimensions).toEqual({});
    expect(view.materialOptions).toEqual([]);
    expect(view.sizes).toEqual([]);
    expect(view.primaryImage).toBeNull();
    expect(view.gallery).toEqual([]);
    expect(view.technicalDrawing).toBeNull();
    expect(view.recolor).toBeNull();
  });

  it("prefers materialOptions over legacy fabrics", async () => {
    const view = await mapProductToView({
      slug: "milano-sofa",
      nameHe: "ספת Milano",
      nameEn: "Milano Sofa",
      sku: "PS-MIL-001",
      categoryId: { nameHe: "ספות" },
      width: 260,
      depth: 98,
      height: 78,
      seatHeight: 43,
      materials: ["עץ"],
      materialOptions: [
        {
          materialId: "507f1f77bcf86cd799439011",
          allowedColorIds: ["507f1f77bcf86cd799439012"],
        },
      ],
      fabrics: [
        {
          key: "velvet",
          label: "Legacy Velvet",
          colors: [{ key: "blue", label: "כחול", visualTone: "blue" }],
        },
      ],
      sizes: [{ key: "220", label: "220" }],
    } as never);

    expect(view.dimensions).toEqual({
      width: 260,
      depth: 98,
      height: 78,
      seatHeight: 43,
    });
    expect(view.materialOptions[0]?.materialName).toBe("Velvet");
    expect(view.sizes[0]?.id).toBe("220");
  });

  it("falls back to legacy fabrics when materialOptions is empty", async () => {
    const view = await mapProductToView({
      slug: "legacy-product",
      nameHe: "מוצר ישן",
      sku: "SKU-2",
      categoryId: { nameHe: "ספות" },
      materialOptions: [],
      fabrics: [
        {
          key: "velvet",
          label: "Velvet",
          colors: [{ key: "blue", label: "כחול", visualTone: "blue" }],
        },
      ],
      sizes: [],
    } as never);

    expect(view.materialOptions).toEqual([
      {
        materialId: "velvet",
        materialName: "Velvet",
        materialType: "FABRIC",
        colors: [{ id: "blue", name: "כחול", hex: LEGACY_FALLBACK_HEX }],
      },
    ]);
  });
});
