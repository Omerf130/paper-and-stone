import { describe, expect, it } from "vitest";
import { mapLegacyFabricsToMaterialOptionsView } from "@/lib/products/material-options/mapLegacyFabricsToMaterialOptionsView";
import { LEGACY_FALLBACK_HEX } from "@/lib/products/material-options/material-option-errors";

describe("mapLegacyFabricsToMaterialOptionsView", () => {
  it("maps legacy fabrics to material options with neutral hex fallback", () => {
    const view = mapLegacyFabricsToMaterialOptionsView([
      {
        key: "velvet",
        label: "Velvet",
        colors: [{ key: "blue", label: "כחול", visualTone: "blue" }],
      },
    ]);

    expect(view).toEqual([
      {
        materialId: "velvet",
        materialName: "Velvet",
        materialType: "FABRIC",
        colors: [{ id: "blue", name: "כחול", hex: LEGACY_FALLBACK_HEX }],
      },
    ]);
  });

  it("returns empty array when no legacy fabrics exist", () => {
    expect(mapLegacyFabricsToMaterialOptionsView([])).toEqual([]);
  });
});
