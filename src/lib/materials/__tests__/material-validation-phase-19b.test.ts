import { describe, expect, it } from "vitest";
import { parseMaterialFormInput } from "@/lib/materials/material-validation";
import { EMPTY_MATERIAL_FORM } from "@/types/admin-material";

describe("material validation phase 19B", () => {
  it("requires English-only material name", () => {
    const result = parseMaterialFormInput({
      ...EMPTY_MATERIAL_FORM,
      nameEn: "קטיפה",
    });

    expect(result.success).toBe(false);
  });

  it("requires hex or swatch on variants", () => {
    const result = parseMaterialFormInput({
      ...EMPTY_MATERIAL_FORM,
      nameEn: "Velvet",
      variants: [{ name: "Blue", hex: "", isActive: true }],
    });

    expect(result.success).toBe(false);
  });
});
