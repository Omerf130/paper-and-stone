import { describe, expect, it } from "vitest";
import { mapStoredOptionsToView } from "@/lib/products/material-options/mapProductMaterialOptionsToView";

describe("mapStoredOptionsToView variant resolution", () => {
  it("prefers material variants over legacy Color collection", () => {
    const materialId = "507f1f77bcf86cd799439011";
    const variantId = "507f1f77bcf86cd799439012";

    const result = mapStoredOptionsToView(
      [
        {
          materialId: { toString: () => materialId },
          allowedColorIds: [{ toString: () => variantId }],
        },
      ],
      [
        {
          _id: { toString: () => materialId },
          nameEn: "Velvet",
          type: "FABRIC",
          variants: [
            {
              _id: { toString: () => variantId },
              name: "Mustard",
              hex: "#D4A017",
              isActive: true,
            },
          ],
        },
      ],
      [
        {
          _id: { toString: () => variantId },
          nameHe: "חרדל",
          hex: "#000000",
        },
      ],
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.colors[0]).toEqual({
      id: variantId,
      name: "Mustard",
      hex: "#D4A017",
    });
  });

  it("falls back to legacy Color when variant has no hex", () => {
    const materialId = "507f1f77bcf86cd799439011";
    const variantId = "507f1f77bcf86cd799439012";

    const result = mapStoredOptionsToView(
      [
        {
          materialId: { toString: () => materialId },
          allowedColorIds: [{ toString: () => variantId }],
        },
      ],
      [
        {
          _id: { toString: () => materialId },
          nameEn: "Velvet",
          type: "FABRIC",
          colorIds: [{ toString: () => variantId }],
        },
      ],
      [
        {
          _id: { toString: () => variantId },
          nameHe: "כחול",
          hex: "#0000FF",
        },
      ],
    );

    expect(result[0]?.colors[0]).toEqual({
      id: variantId,
      name: "כחול",
      hex: "#0000FF",
    });
  });
});
