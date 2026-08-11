import { describe, expect, it } from "vitest";
import { mapStoredOptionsToView } from "@/lib/products/material-options/mapProductMaterialOptionsToView";

describe("mapStoredOptionsToView", () => {
  it("maps material and color names with preserved order", () => {
    const materialId = "507f1f77bcf86cd799439011";
    const blueId = "507f1f77bcf86cd799439012";
    const grayId = "507f1f77bcf86cd799439013";

    const view = mapStoredOptionsToView(
      [
        {
          materialId: { toString: () => materialId },
          allowedColorIds: [
            { toString: () => grayId },
            { toString: () => blueId },
          ],
        },
      ],
      [
        {
          _id: { toString: () => materialId },
          nameHe: "Velvet",
          type: "FABRIC",
        },
      ],
      [
        {
          _id: { toString: () => blueId },
          nameHe: "כחול",
          hex: "#2B4C7E",
        },
        {
          _id: { toString: () => grayId },
          nameHe: "אפור",
          hex: "#808080",
        },
      ],
    );

    expect(view).toEqual([
      {
        materialId,
        materialName: "Velvet",
        materialType: "FABRIC",
        colors: [
          { id: grayId, name: "אפור", hex: "#808080" },
          { id: blueId, name: "כחול", hex: "#2B4C7E" },
        ],
      },
    ]);
  });
});
