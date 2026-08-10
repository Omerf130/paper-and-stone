import { describe, expect, it } from "vitest";
import { mapProductToView } from "@/lib/products/mapProductToView";

describe("mapProductToView", () => {
  it("omits missing dimensions instead of zero-filling", () => {
    const view = mapProductToView({
      slug: "simple-product",
      nameHe: "מוצר פשוט",
      sku: "SKU-1",
      categoryId: { nameHe: "ספות" },
      isActive: true,
      isFeatured: false,
      materials: [],
      fabrics: [],
      sizes: [],
    } as never);

    expect(view.dimensions).toEqual({});
    expect(view.fabrics).toEqual([]);
    expect(view.sizes).toEqual([]);
  });

  it("maps existing dimensions and configuration", () => {
    const view = mapProductToView({
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
      fabrics: [
        {
          key: "velvet",
          label: "Velvet",
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
    expect(view.fabrics[0]?.id).toBe("velvet");
    expect(view.sizes[0]?.id).toBe("220");
  });
});
