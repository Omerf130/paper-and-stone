import { describe, expect, it } from "vitest";
import { formatProductSelectionSummary } from "@/lib/products/format-product-selection-summary";

describe("formatProductSelectionSummary", () => {
  it("includes material, color, size, and quantity when provided", () => {
    const rows = formatProductSelectionSummary({
      material: {
        materialId: "m1",
        materialName: "בד",
        materialType: "FABRIC",
        colors: [{ id: "c1", name: "אפור", hex: "#888" }],
      },
      color: { id: "c1", name: "אפור", hex: "#888" },
      sizeLabel: "240 ס\"מ",
      showSize: true,
      quantity: 2,
    });

    expect(rows).toEqual([
      { label: "חומר", value: "בד" },
      { label: "צבע", value: "אפור" },
      { label: "מידה", value: "240 ס\"מ" },
      { label: "כמות", value: "2" },
    ]);
  });

  it("omits size row when selector is hidden", () => {
    const rows = formatProductSelectionSummary({
      material: null,
      color: null,
      sizeLabel: "240 ס\"מ",
      showSize: false,
      quantity: 1,
    });

    expect(rows).toEqual([{ label: "כמות", value: "1" }]);
  });
});
